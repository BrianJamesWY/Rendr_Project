from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class AnalyticsEvent(BaseModel):
    """Analytics event model for tracking user interactions"""
    event_type: str  # 'showcase_view', 'video_view', 'social_click', 'video_download'
    user_id: Optional[str] = None  # User who performed action (if logged in)
    target_user_id: Optional[str] = None  # Creator whose content was viewed
    target_username: Optional[str] = None  # Creator username
    video_id: Optional[str] = None  # Video ID if applicable
    metadata: Optional[Dict[str, Any]] = None  # Additional context (platform, referrer, etc.)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class EventCreate(BaseModel):
    """Model for creating analytics events"""
    event_type: str
    target_user_id: Optional[str] = None
    target_username: Optional[str] = None
    video_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class AnalyticsStats(BaseModel):
    """Analytics statistics response"""
    total_showcase_views: int = 0
    total_video_views: int = 0
    total_social_clicks: int = 0
    total_downloads: int = 0
    unique_visitors: int = 0
    top_videos: list = []
    platform_breakdown: Dict[str, int] = {}
