import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Adslots import AdslotsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Adslots", tags=["Adslots"])


# ---------- Pydantic Schemas ----------
class AdslotsData(BaseModel):
    """Entity data schema (for create/update)"""
    title: str
    subtitle: str = None
    image_object_key: str = None
    link_url: str = None
    position: int = None
    is_active: bool


class AdslotsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_object_key: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[int] = None
    is_active: Optional[bool] = None


class AdslotsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    title: str
    subtitle: Optional[str] = None
    image_object_key: Optional[str] = None
    link_url: Optional[str] = None
    position: Optional[int] = None
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdslotsListResponse(BaseModel):
    """List response schema"""
    items: List[AdslotsResponse]
    total: int
    skip: int
    limit: int


class AdslotsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[AdslotsData]


class AdslotsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: AdslotsUpdateData


class AdslotsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[AdslotsBatchUpdateItem]


class AdslotsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=AdslotsListResponse)
async def query_Adslotss(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Adslotss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Adslotss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = AdslotsService(db)
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
        logger.debug(f"Found {result['total']} Adslotss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Adslots query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Adslotss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=AdslotsListResponse)
async def query_Adslotss_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Query all Adslotss with filtering, sorting, and pagination (authenticated; owner-scoped)
    logger.debug(f"Querying Adslotss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = AdslotsService(db)
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
        logger.debug(f"Found {result['total']} Adslotss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Adslots query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Adslotss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=AdslotsResponse)
async def get_Adslots(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Adslots by ID (user can only see their own records)"""
    logger.debug(f"Fetching Adslots with id: {id}, fields={fields}")
    
    service = AdslotsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Adslots with id {id} not found")
            raise HTTPException(status_code=404, detail="Adslots not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Adslots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=AdslotsResponse, status_code=201)
async def create_Adslots(
    data: AdslotsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Adslots"""
    logger.debug(f"Creating new Adslots with data: {data}")
    
    service = AdslotsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Adslots")
        
        logger.info(f"Adslots created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Adslots: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Adslots: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[AdslotsResponse], status_code=201)
async def create_Adslotss_batch(
    request: AdslotsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Adslotss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Adslotss")
    
    service = AdslotsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Adslotss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[AdslotsResponse])
async def update_Adslotss_batch(
    request: AdslotsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Adslotss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Adslotss")
    
    service = AdslotsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Adslotss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=AdslotsResponse)
async def update_Adslots(
    id: int,
    data: AdslotsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Adslots (requires ownership)"""
    logger.debug(f"Updating Adslots {id} with data: {data}")

    service = AdslotsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Adslots with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Adslots not found")
        
        logger.info(f"Adslots {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Adslots {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Adslots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Adslotss_batch(
    request: AdslotsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Adslotss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Adslotss")
    
    service = AdslotsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Adslotss successfully")
        return {"message": f"Successfully deleted {deleted_count} Adslotss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Adslots(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Adslots by ID (requires ownership)"""
    logger.debug(f"Deleting Adslots with id: {id}")
    
    service = AdslotsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Adslots with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Adslots not found")
        
        logger.info(f"Adslots {id} deleted successfully")
        return {"message": "Adslots deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Adslots {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")