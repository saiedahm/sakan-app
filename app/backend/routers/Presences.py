import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Presences import PresencesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Presences", tags=["Presences"])


# ---------- Pydantic Schemas ----------
class PresencesData(BaseModel):
    """Entity data schema (for create/update)"""
    last_seen_at: str


class PresencesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    last_seen_at: Optional[str] = None


class PresencesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    last_seen_at: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PresencesListResponse(BaseModel):
    """List response schema"""
    items: List[PresencesResponse]
    total: int
    skip: int
    limit: int


class PresencesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PresencesData]


class PresencesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PresencesUpdateData


class PresencesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PresencesBatchUpdateItem]


class PresencesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PresencesListResponse)
async def query_Presencess(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Presencess with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Presencess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PresencesService(db)
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
        logger.debug(f"Found {result['total']} Presencess")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Presences query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Presencess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PresencesListResponse)
async def query_Presencess_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query Presencess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying Presencess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PresencesService(db)
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
        logger.debug(f"Found {result['total']} Presencess")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Presences query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Presencess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PresencesResponse)
async def get_Presences(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Presences by ID (user can only see their own records)"""
    logger.debug(f"Fetching Presences with id: {id}, fields={fields}")
    
    service = PresencesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Presences with id {id} not found")
            raise HTTPException(status_code=404, detail="Presences not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Presences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PresencesResponse, status_code=201)
async def create_Presences(
    data: PresencesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Presences"""
    logger.debug(f"Creating new Presences with data: {data}")
    
    service = PresencesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Presences")
        
        logger.info(f"Presences created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Presences: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Presences: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PresencesResponse], status_code=201)
async def create_Presencess_batch(
    request: PresencesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Presencess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Presencess")
    
    service = PresencesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Presencess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PresencesResponse])
async def update_Presencess_batch(
    request: PresencesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Presencess in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Presencess")
    
    service = PresencesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Presencess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PresencesResponse)
async def update_Presences(
    id: int,
    data: PresencesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Presences (requires ownership)"""
    logger.debug(f"Updating Presences {id} with data: {data}")

    service = PresencesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Presences with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Presences not found")
        
        logger.info(f"Presences {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Presences {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Presences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Presencess_batch(
    request: PresencesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Presencess by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Presencess")
    
    service = PresencesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Presencess successfully")
        return {"message": f"Successfully deleted {deleted_count} Presencess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Presences(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Presences by ID (requires ownership)"""
    logger.debug(f"Deleting Presences with id: {id}")
    
    service = PresencesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Presences with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Presences not found")
        
        logger.info(f"Presences {id} deleted successfully")
        return {"message": "Presences deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Presences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")