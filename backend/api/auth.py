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
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)
    
    user_doc = {
        "_id": user_id,
        "email": user.email,
        "password_hash": hashed_pw,
        "display_name": user.display_name,
        "account_type": "free",
        "wallet_address": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_access_token({"user_id": user_id, "email": user.email})
    
    return {
        "user_id": user_id,
        "email": user.email,
        "display_name": user.display_name,
        "account_type": "free",
        "created_at": user_doc["created_at"],
        "token": token
    }

@router.post("/login", response_model=UserWithToken)
async def login(credentials: UserLogin, db=Depends(get_db)):
    """Login user"""
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")
    
    # Create token
    token = create_access_token({"user_id": user["_id"], "email": user["email"]})
    
    return {
        "user_id": user["_id"],
        "email": user["email"],
        "display_name": user["display_name"],
        "account_type": user["account_type"],
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
        "account_type": user["account_type"],
        "created_at": user["created_at"]
    }
