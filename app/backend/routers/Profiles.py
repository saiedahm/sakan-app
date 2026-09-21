import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Profiles import ProfilesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Profiles", tags=["Profiles"])


# ---------- Pydantic Schemas ----------
class ProfilesData(BaseModel):
    """Entity data schema (for create/update)"""
    username: str = None
    display_name: str
    gender: str
    birth_date: str = None
    country: str = None
    city: str = None
    bio: str = None
    primary_language: str = None
    marital_status: str = None
    avatar_object_key: str = None
    onboarding_completed: bool = None
    is_visible: bool = None
    is_verified: bool = None
    premium_until: str = None


class ProfilesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    username: Optional[str] = None
    display_name: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    primary_language: Optional[str] = None
    marital_status: Optional[str] = None
    avatar_object_key: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    is_visible: Optional[bool] = None
    is_verified: Optional[bool] = None
    premium_until: Optional[str] = None


class ProfilesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    username: Optional[str] = None
    display_name: str
    gender: str
    birth_date: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None
    primary_language: Optional[str] = None
    marital_status: Optional[str] = None
    avatar_object_key: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    is_visible: Optional[bool] = None
    is_verified: Optional[bool] = None
    premium_until: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProfilesListResponse(BaseModel):
    """List response schema"""
    items: List[ProfilesResponse]
    total: int
    skip: int
    limit: int


class ProfilesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[ProfilesData]


class ProfilesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: ProfilesUpdateData


class ProfilesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[ProfilesBatchUpdateItem]


class ProfilesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=ProfilesListResponse)
async def query_Profiless(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Profiless with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = ProfilesService(db)
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
        logger.debug(f"Found {result['total']} Profiless")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Profiles query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=ProfilesListResponse)
async def query_Profiless_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query Profiless with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying Profiless: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = ProfilesService(db)
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
        logger.debug(f"Found {result['total']} Profiless")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Profiles query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Profiless: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=ProfilesResponse)
async def get_Profiles(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Profiles by ID (user can only see their own records)"""
    logger.debug(f"Fetching Profiles with id: {id}, fields={fields}")
    
    service = ProfilesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Profiles with id {id} not found")
            raise HTTPException(status_code=404, detail="Profiles not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=ProfilesResponse, status_code=201)
async def create_Profiles(
    data: ProfilesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Profiles"""
    logger.debug(f"Creating new Profiles with data: {data}")
    
    service = ProfilesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Profiles")
        
        logger.info(f"Profiles created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Profiles: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Profiles: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[ProfilesResponse], status_code=201)
async def create_Profiless_batch(
    request: ProfilesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Profiless in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Profiless")
    
    service = ProfilesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[ProfilesResponse])
async def update_Profiless_batch(
    request: ProfilesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Profiless in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Profiless")
    
    service = ProfilesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Profiless successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=ProfilesResponse)
async def update_Profiles(
    id: int,
    data: ProfilesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Profiles (requires ownership)"""
    logger.debug(f"Updating Profiles {id} with data: {data}")

    service = ProfilesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Profiles with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Profiles not found")
        
        logger.info(f"Profiles {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Profiles {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Profiless_batch(
    request: ProfilesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Profiless by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Profiless")
    
    service = ProfilesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Profiless successfully")
        return {"message": f"Successfully deleted {deleted_count} Profiless", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Profiles(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Profiles by ID (requires ownership)"""
    logger.debug(f"Deleting Profiles with id: {id}")
    
    service = ProfilesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Profiles with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Profiles not found")
        
        logger.info(f"Profiles {id} deleted successfully")
        return {"message": "Profiles deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Profiles {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")