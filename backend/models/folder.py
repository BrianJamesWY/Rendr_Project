from pydantic import BaseModel
from typing import Optional

class FolderCreate(BaseModel):
    folder_name: str
    description: Optional[str] = None

class FolderUpdate(BaseModel):
    folder_name: Optional[str] = None
    description: Optional[str] = None

class FolderResponse(BaseModel):
    folder_id: str
    folder_name: str
    username: str
    video_count: int
    created_at: str
    order: int
    description: Optional[str] = None

class MoveVideoToFolder(BaseModel):
    folder_id: Optional[str] = None
