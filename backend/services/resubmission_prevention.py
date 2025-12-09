"""
Resubmission Prevention Service
Detects and blocks users who repeatedly try to upload:
- Videos they don't own (duplicate detection alerts)
- Flagged/copyrighted content
- Previously rejected content
"""

from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
import hashlib


class ResubmissionPreventionService:
    def __init__(self):
        self.strike_thresholds = {
            "warning": 3,      # 3 attempts = warning
            "temporary_ban": 5,  # 5 attempts = 24hr ban
            "permanent_ban": 10  # 10 attempts = permanent ban
        }
        
        self.ban_durations = {
            "temporary": 24,  # hours
            "extended": 72,   # 3 days
            "week": 168      # 7 days
        }
    
    async def check_user_status(self, user_id: str, db) -> Dict:
        """
        Check if user is banned or has strikes
        Returns: {
            "can_upload": bool,
            "status": "active" | "warned" | "temp_banned" | "perm_banned",
            "strikes": int,
            "ban_expires_at": datetime | None,
            "message": str
        }
        """
        # Get user's resubmission record
        record = await db.resubmission_tracking.find_one({"user_id": user_id})
        
        if not record:
            # Clean slate
            return {
                "can_upload": True,
                "status": "active",
                "strikes": 0,
                "ban_expires_at": None,
                "message": "Account in good standing"
            }
        
        strikes = record.get("total_strikes", 0)
        ban_status = record.get("ban_status", "none")
        ban_expires = record.get("ban_expires_at")
        
        # Check if temp ban has expired
        if ban_status == "temporary" and ban_expires:
            if isinstance(ban_expires, str):
                ban_expires = datetime.fromisoformat(ban_expires.replace('Z', '+00:00'))
            
            if datetime.now(timezone.utc) > ban_expires:
                # Ban expired, clear it
                await db.resubmission_tracking.update_one(
                    {"user_id": user_id},
                    {"$set": {
                        "ban_status": "none",
                        "ban_expires_at": None
                    }}
                )
                ban_status = "none"
                ban_expires = None
        
        # Determine status
        if ban_status == "permanent":
            return {
                "can_upload": False,
                "status": "perm_banned",
                "strikes": strikes,
                "ban_expires_at": None,
                "message": "Account permanently banned for repeated policy violations"
            }
        
        if ban_status == "temporary" and ban_expires:
            return {
                "can_upload": False,
                "status": "temp_banned",
                "strikes": strikes,
                "ban_expires_at": ban_expires,
                "message": f"Account temporarily banned until {ban_expires.strftime('%Y-%m-%d %H:%M UTC')}"
            }
        
        if strikes >= self.strike_thresholds["warning"]:
            return {
                "can_upload": True,
                "status": "warned",
                "strikes": strikes,
                "ban_expires_at": None,
                "message": f"Warning: {strikes} strikes. Further violations may result in ban."
            }
        
        return {
            "can_upload": True,
            "status": "active",
            "strikes": strikes,
            "ban_expires_at": None,
            "message": "Account in good standing"
        }
    
    async def record_duplicate_attempt(
        self,
        user_id: str,
        video_hash: str,
        original_owner_id: str,
        original_verification_code: str,
        db
    ) -> Dict:
        """
        Record when a user tries to upload someone else's video
        Returns strike information
        """
        # Create unique fingerprint for this video
        attempt_fingerprint = hashlib.sha256(
            f"{video_hash}:{original_verification_code}".encode()
        ).hexdigest()
        
        # Check if this is a repeat attempt (same video, same user)
        existing_attempt = await db.duplicate_attempts.find_one({
            "user_id": user_id,
            "attempt_fingerprint": attempt_fingerprint
        })
        
        attempt_doc = {
            "user_id": user_id,
            "video_hash": video_hash,
            "attempt_fingerprint": attempt_fingerprint,
            "original_owner_id": original_owner_id,
            "original_verification_code": original_verification_code,
            "attempted_at": datetime.now(timezone.utc),
            "is_repeat": bool(existing_attempt)
        }
        
        # Insert attempt record
        await db.duplicate_attempts.insert_one(attempt_doc)
        
        # Only add strike if this is NOT a repeat of the same video
        # (uploading same video multiple times = 1 strike, not multiple)
        if not existing_attempt:
            return await self._add_strike(
                user_id=user_id,
                reason="duplicate_upload_attempt",
                details=f"Attempted to upload content owned by {original_verification_code}",
                db=db
            )
        else:
            # Just return current status without adding strike
            return await self.check_user_status(user_id, db)
    
    async def _add_strike(
        self,
        user_id: str,
        reason: str,
        details: str,
        db
    ) -> Dict:
        """Add a strike to user's record"""
        now = datetime.now(timezone.utc)
        
        # Get or create record
        record = await db.resubmission_tracking.find_one({"user_id": user_id})
        
        if not record:
            record = {
                "user_id": user_id,
                "total_strikes": 0,
                "strikes": [],
                "ban_status": "none",
                "ban_expires_at": None,
                "created_at": now
            }
        
        # Add new strike
        new_strike = {
            "reason": reason,
            "details": details,
            "timestamp": now
        }
        
        strikes = record.get("strikes", [])
        strikes.append(new_strike)
        total_strikes = len(strikes)
        
        # Determine if ban is needed
        ban_status = "none"
        ban_expires_at = None
        
        if total_strikes >= self.strike_thresholds["permanent_ban"]:
            ban_status = "permanent"
        elif total_strikes >= self.strike_thresholds["temporary_ban"]:
            ban_status = "temporary"
            ban_expires_at = now + timedelta(hours=self.ban_durations["temporary"])
        
        # Update record
        await db.resubmission_tracking.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "total_strikes": total_strikes,
                    "strikes": strikes,
                    "ban_status": ban_status,
                    "ban_expires_at": ban_expires_at,
                    "updated_at": now
                }
            },
            upsert=True
        )
        
        return {
            "strike_added": True,
            "total_strikes": total_strikes,
            "ban_status": ban_status,
            "ban_expires_at": ban_expires_at,
            "message": self._get_strike_message(total_strikes, ban_status)
        }
    
    def _get_strike_message(self, strikes: int, ban_status: str) -> str:
        """Get user-facing message for strike count"""
        if ban_status == "permanent":
            return "Account permanently banned for repeated policy violations"
        
        if ban_status == "temporary":
            return f"Account temporarily banned. You have {strikes} strikes."
        
        if strikes >= self.strike_thresholds["warning"]:
            remaining = self.strike_thresholds["temporary_ban"] - strikes
            return f"Warning: {strikes} strikes. {remaining} more violations will result in a ban."
        
        return f"Strike recorded. Total: {strikes}"
    
    async def get_user_violation_history(self, user_id: str, db) -> Dict:
        """Get full violation history for a user"""
        record = await db.resubmission_tracking.find_one({"user_id": user_id})
        
        if not record:
            return {
                "user_id": user_id,
                "total_strikes": 0,
                "strikes": [],
                "ban_status": "none"
            }
        
        # Get duplicate attempt count
        attempt_count = await db.duplicate_attempts.count_documents({"user_id": user_id})
        
        return {
            "user_id": user_id,
            "total_strikes": record.get("total_strikes", 0),
            "strikes": record.get("strikes", []),
            "ban_status": record.get("ban_status", "none"),
            "ban_expires_at": record.get("ban_expires_at"),
            "total_duplicate_attempts": attempt_count,
            "created_at": record.get("created_at"),
            "updated_at": record.get("updated_at")
        }


# Global instance
resubmission_prevention = ResubmissionPreventionService()
