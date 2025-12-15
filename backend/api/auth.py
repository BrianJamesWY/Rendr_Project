from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
import uuid

from models.user import UserRegister, UserLogin, UserWithToken, UserResponse
from utils.security import hash_password, verify_password, create_access_token, get_current_user
from database.mongodb import get_db

router = APIRouter()

@router.post("/register", response_model=UserWithToken)
async def register(user: UserRegister, db=Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(400, "Email already registered")
    
    # Check if username is taken
    existing_username = await db.users.find_one({"username": user.username})
    if existing_username:
        raise HTTPException(400, "Username already taken")
    
    # Validate username format (no spaces, not empty)
    if not user.username or user.username.strip() != user.username or ' ' in user.username:
        raise HTTPException(400, "Username cannot contain spaces or be empty")
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)
    
    user_doc = {
        "_id": user_id,
        "email": user.email,
        "password_hash": hashed_pw,
        "display_name": user.display_name,
        "username": user.username,
        "premium_tier": "free",
        "account_type": "free",
        "bio": None,
        "profile_picture": None,
        "showcase_settings": {},
        "wallet_address": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create default "Default" folder for this user
    default_folder_id = str(uuid.uuid4())
    default_folder = {
        "_id": default_folder_id,
        "folder_name": "Default",
        "username": user.username,
        "user_id": user_id,
        "order": 1,
        "created_at": datetime.now().isoformat()
    }
    await db.folders.insert_one(default_folder)
    
    # Create token
    token = create_access_token({"user_id": user_id, "email": user.email, "username": user.username})
    
    return {
        "user_id": user_id,
        "email": user.email,
        "display_name": user.display_name,
        "username": user.username,
        "account_type": "free",
        "premium_tier": "free",
        "created_at": user_doc["created_at"],
        "token": token
    }

@router.post("/login", response_model=UserWithToken)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Login user"""
    user = await db.users.find_one({"username": credentials.username})
    
    if not user:
        raise HTTPException(401, "Invalid username or password")
    
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(401, "Invalid username or password")
    
    # Create token
    token = create_access_token({
        "user_id": user["_id"], 
        "email": user["email"],
        "username": user.get("username", user.get("display_name"))
    })
    
    return {
        "user_id": user["_id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "username": user.get("username", user.get("display_name")),
        "account_type": user.get("account_type", "free"),
        "premium_tier": user.get("premium_tier", "free"),
        "created_at": user["created_at"],
        "token": token
    }

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get current user info"""
    user = await db.users.find_one({"_id": current_user["user_id"]})
    
    if not user:
        raise HTTPException(404, "User not found")
    
    return {
        "user_id": user["_id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "username": user.get("username", user.get("display_name")),
        "account_type": user.get("account_type", "free"),
        "premium_tier": user.get("premium_tier", "free"),
        "premium_tiers": user.get("premium_tiers", []),  # Custom pricing tiers from Premium Content Pricing
        "dashboard_social_links": user.get("dashboard_social_links", []),
        "created_at": user["created_at"],
        "phone": user.get("phone"),
        "notification_preference": user.get("notification_preference", "email"),
        "notify_video_length_threshold": user.get("notify_video_length_threshold", 30),
        "sms_opted_in": user.get("sms_opted_in", True),
        "notify_on_verification": user.get("notify_on_verification", True)
    }


@router.patch("/me/notifications")
async def update_notification_preferences(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
    notify_email: bool = True,
    notify_sms: bool = False,
    notify_on_verification: bool = True,
    notify_video_length_threshold: int = 30
):
    """Update user notification preferences"""
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {
            "$set": {
                "notify_email": notify_email,
                "notify_sms": notify_sms,
                "notify_on_verification": notify_on_verification,
                "notify_video_length_threshold": notify_video_length_threshold
            }
        }
    )
    
    return {
        "message": "Notification preferences updated",
        "notify_email": notify_email,
        "notify_sms": notify_sms,
        "notify_on_verification": notify_on_verification
    }


from pydantic import BaseModel
from typing import List, Optional

class PremiumTier(BaseModel):
    name: str
    price: str
    description: Optional[str] = ""

class PremiumTiersUpdate(BaseModel):
    tiers: List[PremiumTier]

@router.put("/me/premium-tiers")
async def update_premium_tiers(
    tiers_data: PremiumTiersUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update user's premium content pricing tiers"""
    # Convert tiers to dict format for storage
    tiers_list = [{"name": t.name, "price": t.price, "description": t.description} for t in tiers_data.tiers]
    
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {"premium_tiers": tiers_list}}
    )
    
    return {
        "message": "Premium tiers updated successfully",
        "tiers": tiers_list
    }


@router.get("/me/premium-tiers")
async def get_premium_tiers(
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Get user's premium content pricing tiers"""
    user = await db.users.find_one({"_id": current_user["user_id"]})
    
    if not user:
        raise HTTPException(404, "User not found")
    
    return {
        "tiers": user.get("premium_tiers", [])
    }
