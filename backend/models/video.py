from pydantic import BaseModel
from typing import Optional, List, Dict

class VideoUploadResponse(BaseModel):
    video_id: str
    verification_code: str
    status: str
    message: Optional[str] = None
    thumbnail_url: Optional[str] = None
    # Enhanced upload fields
    expires_at: Optional[str] = None
    storage_duration: Optional[str] = None
    tier: Optional[str] = None
    # Duplicate detection fields
    duplicate_detected: Optional[bool] = None
    confidence_score: Optional[float] = None
    original_upload_date: Optional[str] = None

class VideoStatusResponse(BaseModel):
    video_id: str
    status: str
    verification_code: str
    verified_at: Optional[str] = None
    thumbnail_url: Optional[str] = None

class VerificationCodeRequest(BaseModel):
    verification_code: str

class VerificationResult(BaseModel):
    result: str
    video_id: Optional[str] = None
    verification_code: Optional[str] = None
    metadata: Optional[Dict] = None
    similarity_score: Optional[float] = None
    confidence_level: Optional[str] = None
    frame_comparison: Optional[List[Dict]] = None
    analysis: Optional[str] = None
    creator: Optional[Dict] = None

class VideoInfo(BaseModel):
    """Video info for showcase display"""
    video_id: str
    verification_code: str
    thumbnail_url: str
    captured_at: str
    folder_name: Optional[str] = None
    folder_id: Optional[str] = None
    showcase_folder_id: Optional[str] = None
    description: Optional[str] = None
    external_link: Optional[str] = None
    platform: Optional[str] = None
    tags: Optional[List[str]] = []

class VideoUpdate(BaseModel):
    """For updating video metadata"""
    description: Optional[str] = None
    external_link: Optional[str] = None
    platform: Optional[str] = None
    tags: Optional[List[str]] = None
    showcase_folder_id: Optional[str] = None
