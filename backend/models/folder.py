from pydantic import BaseModel
from typing import Optional, Dict

class FolderCreate(BaseModel):
    folder_name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    background: Optional[Dict] = None

class FolderUpdate(BaseModel):
    folder_name: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    background: Optional[Dict] = None

class FolderResponse(BaseModel):
    folder_id: str
    folder_name: str
    username: str
    video_count: int
    created_at: str
    order: int
    description: Optional[str] = None
    parent_id: Optional[str] = None
    thumbnail_url: Optional[str] = None
    background: Optional[Dict] = None

class MoveVideoToFolder(BaseModel):
    folder_id: Optional[str] = None
