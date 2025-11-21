from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from uuid import uuid4
import os
from database.mongodb import get_db

router = APIRouter()

# In production, you'd email this. For now, we'll return it in response
@router.post("/request-reset")
async def request_password_reset(
    email: str,
    db = Depends(get_db)
):
    """Request password reset token"""
    # Find user by email
    user = await db.users.find_one({"email": email})
    
    if not user:
        # Don't reveal if email exists (security)
        return {"message": "If that email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = str(uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Save reset token
    await db.password_resets.insert_one({
        "user_id": user["_id"],
        "email": email,
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # In production: Send email with reset link
    # For now, return token in response (dev only!)
    reset_link = f"https://rendr-showcase.preview.emergentagent.com/reset-password?token={reset_token}"
    
    return {
        "message": "Reset link generated",
        "reset_link": reset_link,  # Remove this in production
        "dev_note": "In production, this would be emailed to the user"
    }

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db = Depends(get_db)
):
    """Reset password using token"""
    # Find reset request
    reset_request = await db.password_resets.find_one({"token": token, "used": False})
    
    if not reset_request:
        raise HTTPException(400, "Invalid or expired reset token")
    
    # Check if expired
    expires_at = datetime.fromisoformat(reset_request["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(400, "Reset token has expired")
    
    # Update password
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed_password = pwd_context.hash(new_password)
    
    await db.users.update_one(
        {"_id": reset_request["user_id"]},
        {"$set": {"password": hashed_password}}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": token},
        {"$set": {"used": True, "used_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Password reset successfully"}
