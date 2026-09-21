import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.ProfilePhotos import ProfilephotosService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/ProfilePhotos", tags=["ProfilePhotos"])


# ---------- Pydantic Schemas ----------
class ProfilephotosData(BaseModel):
    """Entity data schema (for create/update)"""
    object_key: str
    is_primary: bool = None
    status: str = None


class ProfilephotosUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    object_key: Optional[str] = None
    is_primary: Optional[bool] = None
    status: Optional[str] = None


class ProfilephotosResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    object_key: str
    is_primary: Optional[bool] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProfilephotosListResponse(BaseModel):
    """List response schema"""
    items: List[ProfilephotosResponse]
    total: int
    skip: int
    limit: int


class ProfilephotosBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[ProfilephotosData]


class ProfilephotosBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: ProfilephotosUpdateData


class ProfilephotosBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[ProfilephotosBatchUpdateItem]


class ProfilephotosBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=ProfilephotosListResponse)
async def query_ProfilePhotoss(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query ProfilePhotoss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying ProfilePhotoss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = ProfilephotosService(db)
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
        logger.debug(f"Found {result['total']} ProfilePhotoss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid ProfilePhotos query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying ProfilePhotoss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=ProfilephotosListResponse)
async def query_ProfilePhotoss_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query ProfilePhotoss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying ProfilePhotoss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = ProfilephotosService(db)
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
        logger.debug(f"Found {result['total']} ProfilePhotoss")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid ProfilePhotos query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying ProfilePhotoss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=ProfilephotosResponse)
async def get_ProfilePhotos(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single ProfilePhotos by ID (user can only see their own records)"""
    logger.debug(f"Fetching ProfilePhotos with id: {id}, fields={fields}")
    
    service = ProfilephotosService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Profilephotos with id {id} not found")
            raise HTTPException(status_code=404, detail="Profilephotos not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ProfilePhotos {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=ProfilephotosResponse, status_code=201)
async def create_ProfilePhotos(
    data: ProfilephotosData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new ProfilePhotos"""
    logger.debug(f"Creating new ProfilePhotos with data: {data}")
    
    service = ProfilephotosService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create ProfilePhotos")
        
        logger.info(f"Profilephotos created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating ProfilePhotos: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating ProfilePhotos: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[ProfilephotosResponse], status_code=201)
async def create_ProfilePhotoss_batch(
    request: ProfilephotosBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple ProfilePhotoss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} ProfilePhotoss")
    
    service = ProfilephotosService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} ProfilePhotoss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[ProfilephotosResponse])
async def update_ProfilePhotoss_batch(
    request: ProfilephotosBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple ProfilePhotoss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} ProfilePhotoss")
    
    service = ProfilephotosService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} ProfilePhotoss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=ProfilephotosResponse)
async def update_ProfilePhotos(
    id: int,
    data: ProfilephotosUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing ProfilePhotos (requires ownership)"""
    logger.debug(f"Updating ProfilePhotos {id} with data: {data}")

    service = ProfilephotosService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Profilephotos with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Profilephotos not found")
        
        logger.info(f"Profilephotos {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating ProfilePhotos {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating ProfilePhotos {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_ProfilePhotoss_batch(
    request: ProfilephotosBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple ProfilePhotoss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} ProfilePhotoss")
    
    service = ProfilephotosService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} ProfilePhotoss successfully")
        return {"message": f"Successfully deleted {deleted_count} ProfilePhotoss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_ProfilePhotos(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single ProfilePhotos by ID (requires ownership)"""
    logger.debug(f"Deleting ProfilePhotos with id: {id}")
    
    service = ProfilephotosService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Profilephotos with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Profilephotos not found")
        
        logger.info(f"Profilephotos {id} deleted successfully")
        return {"message": "Profilephotos deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting ProfilePhotos {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")