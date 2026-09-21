import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Promotions import PromotionsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Promotions", tags=["Promotions"])


# ---------- Pydantic Schemas ----------
class PromotionsData(BaseModel):
    """Entity data schema (for create/update)"""
    kind: str
    plan_code: str = None
    amount_cents: int = None
    currency: str = None
    status: str
    expires_at: str = None


class PromotionsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    kind: Optional[str] = None
    plan_code: Optional[str] = None
    amount_cents: Optional[int] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    expires_at: Optional[str] = None


class PromotionsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    kind: str
    plan_code: Optional[str] = None
    amount_cents: Optional[int] = None
    currency: Optional[str] = None
    status: str
    expires_at: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromotionsListResponse(BaseModel):
    """List response schema"""
    items: List[PromotionsResponse]
    total: int
    skip: int
    limit: int


class PromotionsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PromotionsData]


class PromotionsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PromotionsUpdateData


class PromotionsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PromotionsBatchUpdateItem]


class PromotionsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PromotionsListResponse)
async def query_Promotionss(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Promotionss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Promotionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PromotionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} Promotionss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Promotions query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Promotionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PromotionsListResponse)
async def query_Promotionss_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query Promotionss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying Promotionss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PromotionsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} Promotionss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Promotions query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Promotionss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PromotionsResponse)
async def get_Promotions(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Promotions by ID (user can only see their own records)"""
    logger.debug(f"Fetching Promotions with id: {id}, fields={fields}")
    
    service = PromotionsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Promotions with id {id} not found")
            raise HTTPException(status_code=404, detail="Promotions not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Promotions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PromotionsResponse, status_code=201)
async def create_Promotions(
    data: PromotionsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Promotions"""
    logger.debug(f"Creating new Promotions with data: {data}")
    
    service = PromotionsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Promotions")
        
        logger.info(f"Promotions created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Promotions: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Promotions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PromotionsResponse], status_code=201)
async def create_Promotionss_batch(
    request: PromotionsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Promotionss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Promotionss")
    
    service = PromotionsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Promotionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PromotionsResponse])
async def update_Promotionss_batch(
    request: PromotionsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Promotionss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Promotionss")
    
    service = PromotionsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Promotionss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PromotionsResponse)
async def update_Promotions(
    id: int,
    data: PromotionsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Promotions (requires ownership)"""
    logger.debug(f"Updating Promotions {id} with data: {data}")

    service = PromotionsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Promotions with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Promotions not found")
        
        logger.info(f"Promotions {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Promotions {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Promotions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Promotionss_batch(
    request: PromotionsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Promotionss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Promotionss")
    
    service = PromotionsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Promotionss successfully")
        return {"message": f"Successfully deleted {deleted_count} Promotionss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Promotions(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Promotions by ID (requires ownership)"""
    logger.debug(f"Deleting Promotions with id: {id}")
    
    service = PromotionsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Promotions with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Promotions not found")
        
        logger.info(f"Promotions {id} deleted successfully")
        return {"message": "Promotions deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Promotions {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")