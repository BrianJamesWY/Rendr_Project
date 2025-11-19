from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class VideoView(BaseModel):
    """Track video views on showcase page"""
    video_id: str
    username: str
    viewed_at: str
    referrer: Optional[str] = None

class SocialLinkClick(BaseModel):
    """Track social media link clicks"""
    username: str
    platform: str
    clicked_at: str
    referrer: Optional[str] = None

class PageView(BaseModel):
    """Track showcase page views"""
    username: str
    viewed_at: str
    referrer: Optional[str] = None

class AnalyticsSummary(BaseModel):
    """Analytics summary for dashboard"""
    total_page_views: int
    total_video_views: int
    total_social_clicks: int
    top_videos: List[dict]
    social_click_breakdown: List[dict]
    recent_activity: List[dict]
