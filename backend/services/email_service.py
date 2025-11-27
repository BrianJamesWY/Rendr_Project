"""
Email notification service
Uses SMTP or can be extended to use SendGrid/AWS SES
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

class EmailService:
    def __init__(self):
        # Email configuration from environment
        self.smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        self.smtp_user = os.environ.get('SMTP_USER')
        self.smtp_password = os.environ.get('SMTP_PASSWORD')
        self.from_email = os.environ.get('FROM_EMAIL', 'noreply@rendr.com')
        
        self.enabled = bool(self.smtp_user and self.smtp_password)
        
        if not self.enabled:
            print("⚠️ SMTP credentials not configured - Email disabled (will log to console)")
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email"""
        if not self.enabled:
            print(f"📧 Email disabled - would send to {to_email}")
            print(f"   Subject: {subject}")
            print(f"   Content: {text_content or html_content[:100]}...")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(html_content, 'html')
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            print(f"✅ Email sent to {to_email}: {subject}")
            return True
        
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_video_ready_notification(
        self,
        to_email: str,
        username: str,
        verification_code: str,
        download_url: str,
        tier: str
    ) -> bool:
        """Send video processing complete notification"""
        subject = f"🎬 Your Rendr video is ready! - {verification_code}"
        
        # Storage duration by tier
        storage_info = {
            "free": "24 hours",
            "pro": "7 days",
            "enterprise": "unlimited (permanent storage)"
        }
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🎬 Rendr</h1>
                <p style="color: white; margin: 10px 0 0 0;">Your video is ready!</p>
            </div>
            
            <div style="padding: 40px 20px;">
                <p>Hi @{username},</p>
                
                <p>Your video has been successfully processed and is ready for download!</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Verification Code:</strong></p>
                    <p style="font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace; margin: 0;">{verification_code}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{download_url}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Download Video
                    </a>
                </div>
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0;"><strong>⚠️ Storage Duration ({tier} tier):</strong></p>
                    <p style="margin: 5px 0 0 0;">Your video will be available for {storage_info.get(tier, '24 hours')}.</p>
                    {'<p style="margin: 5px 0 0 0;">Download it now to keep a permanent copy.</p>' if tier == 'free' else ''}
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                    Your video has been watermarked with the Rendr verification system. Share it with confidence!
                </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>© 2025 Rendr. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">
                    <a href="https://premium-content-47.preview.emergentagent.com/settings" style="color: #667eea;">Notification Settings</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Rendr - Your video is ready!
        
        Hi @{username},
        
        Your video has been successfully processed!
        
        Verification Code: {verification_code}
        
        Download: {download_url}
        
        Storage Duration ({tier} tier): {storage_info.get(tier, '24 hours')}
        
        © 2025 Rendr
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)
    
    async def send_expiration_warning(
        self,
        to_email: str,
        username: str,
        verification_code: str,
        hours_remaining: int,
        download_url: str
    ) -> bool:
        """Send video expiration warning"""
        subject = f"⚠️ Rendr: Video expiring in {hours_remaining} hours - {verification_code}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f59e0b; padding: 40px 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">⚠️ Video Expiring Soon</h1>
            </div>
            
            <div style="padding: 40px 20px;">
                <p>Hi @{username},</p>
                
                <p><strong>Your video will be automatically deleted in {hours_remaining} hours.</strong></p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>Verification Code:</strong></p>
                    <p style="font-size: 24px; font-weight: bold; color: #f59e0b; font-family: monospace; margin: 0;">{verification_code}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{download_url}" style="background: #f59e0b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                        Download Now
                    </a>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 30px 0;">
                    <p style="margin: 0 0 10px 0;"><strong>💎 Want to keep your videos longer?</strong></p>
                    <p style="margin: 0;">Upgrade to Pro ($9.99/mo) for 7-day storage or Enterprise ($49.99/mo) for unlimited storage.</p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="https://premium-content-47.preview.emergentagent.com/pricing" style="color: #667eea; font-weight: bold;">View Plans</a>
                    </p>
                </div>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>© 2025 Rendr. All rights reserved.</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Rendr - Video Expiring Soon!
        
        Hi @{username},
        
        Your video will be deleted in {hours_remaining} hours.
        
        Code: {verification_code}
        
        Download: {download_url}
        
        Upgrade to keep videos longer:
        - Pro: 7-day storage ($9.99/mo)
        - Enterprise: Unlimited storage ($49.99/mo)
        
        © 2025 Rendr
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)

# Global instance
email_service = EmailService()
