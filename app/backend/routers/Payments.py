import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Payments import PaymentsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Payments", tags=["Payments"])


# ---------- Pydantic Schemas ----------
class PaymentsData(BaseModel):
    """Entity data schema (for create/update)"""
    plan_code: str
    amount_cents: int
    currency: str
    status: str
    stripe_session_id: str = None
    premium_until: str = None


class PaymentsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    plan_code: Optional[str] = None
    amount_cents: Optional[int] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    stripe_session_id: Optional[str] = None
    premium_until: Optional[str] = None


class PaymentsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    plan_code: str
    amount_cents: int
    currency: str
    status: str
    stripe_session_id: Optional[str] = None
    premium_until: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PaymentsListResponse(BaseModel):
    """List response schema"""
    items: List[PaymentsResponse]
    total: int
    skip: int
    limit: int


class PaymentsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PaymentsData]


class PaymentsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PaymentsUpdateData


class PaymentsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PaymentsBatchUpdateItem]


class PaymentsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PaymentsListResponse)
async def query_Paymentss(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Paymentss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Paymentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PaymentsService(db)
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
        logger.debug(f"Found {result['total']} Paymentss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Payments query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Paymentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PaymentsListResponse)
async def query_Paymentss_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query Paymentss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying Paymentss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PaymentsService(db)
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
        logger.debug(f"Found {result['total']} Paymentss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Payments query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Paymentss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PaymentsResponse)
async def get_Payments(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Payments by ID (user can only see their own records)"""
    logger.debug(f"Fetching Payments with id: {id}, fields={fields}")
    
    service = PaymentsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Payments with id {id} not found")
            raise HTTPException(status_code=404, detail="Payments not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Payments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PaymentsResponse, status_code=201)
async def create_Payments(
    data: PaymentsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Payments"""
    logger.debug(f"Creating new Payments with data: {data}")
    
    service = PaymentsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Payments")
        
        logger.info(f"Payments created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Payments: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Payments: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PaymentsResponse], status_code=201)
async def create_Paymentss_batch(
    request: PaymentsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Paymentss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Paymentss")
    
    service = PaymentsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Paymentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PaymentsResponse])
async def update_Paymentss_batch(
    request: PaymentsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Paymentss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Paymentss")
    
    service = PaymentsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Paymentss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PaymentsResponse)
async def update_Payments(
    id: int,
    data: PaymentsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Payments (requires ownership)"""
    logger.debug(f"Updating Payments {id} with data: {data}")

    service = PaymentsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Payments with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Payments not found")
        
        logger.info(f"Payments {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Payments {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Payments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Paymentss_batch(
    request: PaymentsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Paymentss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Paymentss")
    
    service = PaymentsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Paymentss successfully")
        return {"message": f"Successfully deleted {deleted_count} Paymentss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Payments(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Payments by ID (requires ownership)"""
    logger.debug(f"Deleting Payments with id: {id}")
    
    service = PaymentsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Payments with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Payments not found")
        
        logger.info(f"Payments {id} deleted successfully")
        return {"message": "Payments deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Payments {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")