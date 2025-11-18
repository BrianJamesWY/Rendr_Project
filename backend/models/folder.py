from pydantic import BaseModel
from typing import Optional

class FolderCreate(BaseModel):
    folder_name: str

class FolderUpdate(BaseModel):
    folder_name: str

class FolderResponse(BaseModel):
    folder_id: str
    folder_name: str
    username: str
    video_count: int
    created_at: str
    order: int

class MoveVideoToFolder(BaseModel):
    folder_id: Optional[str] = None  # None means move to "Default"
