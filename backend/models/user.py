from pydantic import BaseModel, EmailStr
from typing import Optional, Dict
from datetime import datetime

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str
    username: str  # New: for @username URLs

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    display_name: str
    username: str  # New
    account_type: str
    premium_tier: str  # New: "free", "premium", "enterprise"
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

class UpdateProfile(BaseModel):
    """For updating creator profile"""
    display_name: Optional[str] = None
    bio: Optional[str] = None
    showcase_settings: Optional[Dict] = None
