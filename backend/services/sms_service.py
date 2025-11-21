"""
SMS notification service using Twilio
"""
import os
from twilio.rest import Client
from typing import Optional

class SMSService:
    def __init__(self):
        # Twilio credentials from environment
        self.account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        self.auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        self.from_number = os.environ.get('TWILIO_PHONE_NUMBER')
        
        # Initialize client if credentials exist
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
            self.enabled = True
        else:
            self.client = None
            self.enabled = False
            print("⚠️ Twilio credentials not configured - SMS disabled")
    
    async def send_sms(self, to_number: str, message: str) -> bool:
        """
        Send SMS message
        
        Args:
            to_number: Phone number in E.164 format (e.g., +14155552671)
            message: Message text (max 1600 chars)
            
        Returns:
            True if sent successfully, False otherwise
        """
        if not self.enabled:
            print(f"📱 SMS disabled - would send to {to_number}: {message[:50]}...")
            return False
        
        try:
            message = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            print(f"✅ SMS sent to {to_number}: {message.sid}")
            return True
        except Exception as e:
            print(f"❌ Failed to send SMS to {to_number}: {str(e)}")
            return False
    
    async def send_video_ready_notification(
        self, 
        to_number: str, 
        verification_code: str,
        download_url: str
    ) -> bool:
        """Send video processing complete notification"""
        message = f"""🎬 Rendr: Your video is ready!

Verification Code: {verification_code}

Download: {download_url}

Video available for limited time based on your tier."""
        
        return await self.send_sms(to_number, message)
    
    async def send_expiration_warning(
        self,
        to_number: str,
        verification_code: str,
        days_remaining: int
    ) -> bool:
        """Send video expiration warning"""
        message = f"""⚠️ Rendr: Video expiring soon!

Code: {verification_code}
Expires in: {days_remaining} day{'s' if days_remaining != 1 else ''}

Download now or upgrade to extend storage."""
        
        return await self.send_sms(to_number, message)

# Global instance
sms_service = SMSService()
