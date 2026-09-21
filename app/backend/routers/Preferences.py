import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.Preferences import PreferencesService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/Preferences", tags=["Preferences"])


# ---------- Pydantic Schemas ----------
class PreferencesData(BaseModel):
    """Entity data schema (for create/update)"""
    preferred_gender: str = None
    min_age: int = None
    max_age: int = None
    preferred_country: str = None


class PreferencesUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    preferred_gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    preferred_country: Optional[str] = None


class PreferencesResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    preferred_gender: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    preferred_country: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PreferencesListResponse(BaseModel):
    """List response schema"""
    items: List[PreferencesResponse]
    total: int
    skip: int
    limit: int


class PreferencesBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PreferencesData]


class PreferencesBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PreferencesUpdateData


class PreferencesBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PreferencesBatchUpdateItem]


class PreferencesBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PreferencesListResponse)
async def query_Preferencess(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query Preferencess with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying Preferencess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PreferencesService(db)
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
        logger.debug(f"Found {result['total']} Preferencess")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Preferences query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Preferencess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PreferencesListResponse)
async def query_Preferencess_all(
    query: str = Query(None, description='Query conditions as JSON, e.g. {"id":2} or {"id":{"$gte":2}}'),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query Preferencess with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying Preferencess: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PreferencesService(db)
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
        logger.debug(f"Found {result['total']} Preferencess")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Invalid Preferences query: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error querying Preferencess: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PreferencesResponse)
async def get_Preferences(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single Preferences by ID (user can only see their own records)"""
    logger.debug(f"Fetching Preferences with id: {id}, fields={fields}")
    
    service = PreferencesService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Preferences with id {id} not found")
            raise HTTPException(status_code=404, detail="Preferences not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching Preferences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PreferencesResponse, status_code=201)
async def create_Preferences(
    data: PreferencesData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new Preferences"""
    logger.debug(f"Creating new Preferences with data: {data}")
    
    service = PreferencesService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create Preferences")
        
        logger.info(f"Preferences created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating Preferences: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating Preferences: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PreferencesResponse], status_code=201)
async def create_Preferencess_batch(
    request: PreferencesBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple Preferencess in a single request"""
    logger.debug(f"Batch creating {len(request.items)} Preferencess")
    
    service = PreferencesService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} Preferencess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PreferencesResponse])
async def update_Preferencess_batch(
    request: PreferencesBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple Preferencess in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} Preferencess")
    
    service = PreferencesService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} Preferencess successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PreferencesResponse)
async def update_Preferences(
    id: int,
    data: PreferencesUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing Preferences (requires ownership)"""
    logger.debug(f"Updating Preferences {id} with data: {data}")

    service = PreferencesService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Preferences with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Preferences not found")
        
        logger.info(f"Preferences {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating Preferences {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating Preferences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_Preferencess_batch(
    request: PreferencesBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple Preferencess by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} Preferencess")
    
    service = PreferencesService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} Preferencess successfully")
        return {"message": f"Successfully deleted {deleted_count} Preferencess", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_Preferences(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single Preferences by ID (requires ownership)"""
    logger.debug(f"Deleting Preferences with id: {id}")
    
    service = PreferencesService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Preferences with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Preferences not found")
        
        logger.info(f"Preferences {id} deleted successfully")
        return {"message": "Preferences deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting Preferences {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")