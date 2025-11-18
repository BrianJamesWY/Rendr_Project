"""
Notification Service for Rendr
Handles email and in-app notifications
"""

import os
from datetime import datetime
from typing import Optional, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class NotificationService:
    """
    Manages notifications for security events and user alerts
    """
    
    def __init__(self):
        # Email configuration (would use SendGrid, AWS SES, etc. in production)
        self.email_enabled = bool(os.getenv("SMTP_HOST"))
        self.smtp_host = os.getenv("SMTP_HOST", "")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_pass = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@rendrtruth.com")
        
        print(f"📧 Notification service initialized")
        print(f"   Email enabled: {self.email_enabled}")
    
    async def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """Send email notification"""
        if not self.email_enabled:
            print(f"📧 Email disabled - Would send to {to_email}: {subject}")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Email failed: {e}")
            return False
    
    async def notify_duplicate_upload_attempt(
        self, 
        db,
        original_owner_email: str,
        original_owner_name: str,
        duplicate_uploader_email: str,
        duplicate_uploader_name: str,
        video_code: str,
        video_filename: str
    ):
        """
        Notify original owner that someone tried to upload their video
        """
        
        # Create in-app notification
        notification = {
            "_id": str(__import__('uuid').uuid4()),
            "user_email": original_owner_email,
            "type": "security_alert",
            "title": "🚨 Someone Tried to Upload Your Video",
            "message": f"{duplicate_uploader_name} ({duplicate_uploader_email}) attempted to upload a video that matches your verified video (Code: {video_code})",
            "severity": "high",
            "read": False,
            "created_at": datetime.now().isoformat(),
            "metadata": {
                "original_code": video_code,
                "duplicate_uploader": duplicate_uploader_email,
                "filename": video_filename
            }
        }
        
        await db.notifications.insert_one(notification)
        print(f"📬 In-app notification created for {original_owner_email}")
        
        # Send email notification
        subject = "🚨 Security Alert: Someone Tried to Verify Your Video"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h1 style="color: #92400e; margin: 0;">🚨 Security Alert</h1>
            </div>
            
            <p>Hi {original_owner_name},</p>
            
            <p>We wanted to let you know that someone attempted to upload a video that matches your verified content.</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Attempted by:</strong> {duplicate_uploader_name}</p>
                <p style="margin: 5px 0 0 0;"><strong>Email:</strong> {duplicate_uploader_email}</p>
                <p style="margin: 5px 0 0 0;"><strong>Your verification code:</strong> {video_code}</p>
                <p style="margin: 5px 0 0 0;"><strong>Filename:</strong> {video_filename}</p>
            </div>
            
            <p><strong>What happened:</strong></p>
            <ul>
                <li>Someone tried to upload the same video you already verified</li>
                <li>We detected the duplicate and blocked it</li>
                <li>Your original verification remains secure</li>
                <li>No action is needed from you</li>
            </ul>
            
            <p><strong>What this means:</strong></p>
            <p>This could be:</p>
            <ul>
                <li>A legitimate co-creator trying to verify shared content</li>
                <li>Someone who found your video online and is trying to claim it</li>
                <li>An accidental duplicate upload</li>
            </ul>
            
            <p>If you believe this is unauthorized use of your content, you can report it through your Rendr dashboard.</p>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>💡 Stay Protected:</strong></p>
                <p style="margin: 5px 0 0 0; color: #1e3a8a;">Your verification was created first, which gives you provable ownership. The blockchain timestamp cannot be altered.</p>
            </div>
            
            <p>Best regards,<br>The Rendr Team</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
                This is an automated security notification from Rendr.<br>
                If you have questions, contact support@rendrtruth.com
            </p>
        </body>
        </html>
        """
        
        await self.send_email(original_owner_email, subject, html_body)
    
    async def log_security_event(
        self,
        db,
        event_type: str,
        user_id: str,
        description: str,
        metadata: Dict = None
    ):
        """
        Log security events for audit trail
        """
        event = {
            "_id": str(__import__('uuid').uuid4()),
            "event_type": event_type,
            "user_id": user_id,
            "description": description,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat(),
            "ip_address": None  # Would capture from request
        }
        
        await db.security_logs.insert_one(event)
        print(f"🔒 Security event logged: {event_type}")

# Global instance
notification_service = NotificationService()
