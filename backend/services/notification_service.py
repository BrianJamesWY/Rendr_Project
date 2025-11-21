"""
Unified Notification Service
Handles both Email and SMS notifications based on user preferences
"""
from typing import Dict, Optional
from services.email_service import email_service
from services.sms_service import sms_service

class NotificationService:
    """
    Unified notification handler
    Routes notifications based on user preferences
    """
    
    async def send_video_ready_notification(
        self,
        user: Dict,
        verification_code: str,
        download_url: str,
        video_duration: float
    ) -> Dict[str, bool]:
        """
        Send video ready notification based on user preferences
        
        Returns:
            {"email": bool, "sms": bool} - success status for each channel
        """
        results = {"email": False, "sms": False}
        
        # Check if video meets length threshold
        threshold = user.get("notify_video_length_threshold", 30)
        if video_duration < threshold:
            print(f"ℹ️ Video too short ({video_duration}s < {threshold}s) - skipping notification")
            return results
        
        # Get user preferences
        preference = user.get("notification_preference", "email")
        email = user.get("email")
        phone = user.get("phone")
        username = user.get("username", "Creator")
        tier = user.get("premium_tier", "free")
        sms_opted_in = user.get("sms_opted_in", True)
        
        # Send email if preference includes email
        if preference in ["email", "both"] and email:
            results["email"] = await email_service.send_video_ready_notification(
                to_email=email,
                username=username,
                verification_code=verification_code,
                download_url=download_url,
                tier=tier
            )
        
        # Send SMS if preference includes SMS and user has phone
        if preference in ["sms", "both"] and phone and sms_opted_in:
            results["sms"] = await sms_service.send_video_ready_notification(
                to_number=phone,
                verification_code=verification_code,
                download_url=download_url
            )
        
        return results
    
    async def send_expiration_warning(
        self,
        user: Dict,
        verification_code: str,
        hours_remaining: int,
        download_url: str
    ) -> Dict[str, bool]:
        """Send expiration warning notification"""
        results = {"email": False, "sms": False}
        
        preference = user.get("notification_preference", "email")
        email = user.get("email")
        phone = user.get("phone")
        username = user.get("username", "Creator")
        sms_opted_in = user.get("sms_opted_in", True)
        
        # Always send expiration warnings (critical)
        if email and preference != "none":
            results["email"] = await email_service.send_expiration_warning(
                to_email=email,
                username=username,
                verification_code=verification_code,
                hours_remaining=hours_remaining,
                download_url=download_url
            )
        
        if phone and sms_opted_in and preference in ["sms", "both"]:
            days_remaining = max(1, hours_remaining // 24)
            results["sms"] = await sms_service.send_expiration_warning(
                to_number=phone,
                verification_code=verification_code,
                days_remaining=days_remaining
            )
        
        return results

# Global instance
notification_service = NotificationService()
