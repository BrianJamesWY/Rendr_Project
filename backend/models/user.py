from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List
from datetime import datetime

class SocialMediaLink(BaseModel):
    platform: str
    url: str
    custom_name: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    username: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    username: str
    account_type: str
    premium_tier: str
    dashboard_social_links: Optional[List[Dict]] = []
    created_at: str

class UserWithToken(UserResponse):
    token: str

class CreatorProfile(BaseModel):
    """Public creator profile data"""
    username: str
    display_name: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    joined_at: str
    total_videos: int
    showcase_settings: Optional[Dict] = None
    social_media_links: Optional[List[SocialMediaLink]] = []
    collection_label: Optional[str] = "Collections"

class UpdateProfile(BaseModel):
    """For updating creator profile"""
    display_name: Optional[str] = None
    bio: Optional[str] = None
    showcase_settings: Optional[Dict] = None
    social_media_links: Optional[List[Dict]] = None
    collection_label: Optional[str] = None
    banner_image: Optional[str] = None
