"""
Event Emitter Service - RENDR

AWS-ready event-driven architecture for async notifications.
Currently uses local handlers, but designed for easy migration to:
- AWS SNS/SQS
- AWS EventBridge
- Redis Pub/Sub

Events:
- verification_complete: All background processing finished
- upload_started: User initiated upload
- upload_failed: Upload or processing error
"""

import asyncio
from typing import Dict, List, Callable, Any
from datetime import datetime, timezone
import json
import os


class EventEmitter:
    """
    Simple event emitter with AWS-ready design.
    
    Local mode: Direct function calls
    AWS mode: Can be swapped to SNS/SQS publish
    """
    
    def __init__(self):
        self._handlers: Dict[str, List[Callable]] = {}
        self._event_log: List[Dict] = []
        self._max_log_size = 1000
        
        # AWS configuration (for future migration)
        self.aws_mode = os.getenv("USE_AWS_EVENTS", "false").lower() == "true"
        self.sns_topic_arn = os.getenv("AWS_SNS_TOPIC_ARN", "")
        
    def on(self, event_name: str, handler: Callable):
        """Register an event handler"""
        if event_name not in self._handlers:
            self._handlers[event_name] = []
        self._handlers[event_name].append(handler)
        print(f"📡 Event handler registered: {event_name}")
        
    def off(self, event_name: str, handler: Callable = None):
        """Remove event handler(s)"""
        if event_name in self._handlers:
            if handler:
                self._handlers[event_name] = [h for h in self._handlers[event_name] if h != handler]
            else:
                self._handlers[event_name] = []
                
    async def emit(self, event_name: str, data: Dict[str, Any] = None):
        """
        Emit an event to all registered handlers.
        
        In AWS mode, this would publish to SNS/SQS.
        In local mode, directly calls handlers.
        """
        event = {
            "event": event_name,
            "data": data or {},
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "source": "rendr-backend"
        }
        
        # Log the event
        self._log_event(event)
        
        print(f"\n📡 EVENT EMITTED: {event_name}")
        print(f"   Data: {json.dumps(data, default=str)[:100]}...")
        
        if self.aws_mode:
            # Future: Publish to AWS SNS
            await self._publish_to_aws(event)
        else:
            # Local mode: Call handlers directly
            await self._call_local_handlers(event_name, data)
            
    async def _call_local_handlers(self, event_name: str, data: Dict):
        """Execute local handlers for an event"""
        handlers = self._handlers.get(event_name, [])
        
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(data)
                else:
                    handler(data)
            except Exception as e:
                print(f"   ⚠️ Handler error for {event_name}: {e}")
                
    async def _publish_to_aws(self, event: Dict):
        """
        Publish event to AWS SNS (placeholder for migration).
        
        When ready to migrate to AWS:
        1. Set USE_AWS_EVENTS=true
        2. Set AWS_SNS_TOPIC_ARN
        3. Ensure boto3 credentials are configured
        """
        print(f"   🔮 AWS Mode: Would publish to SNS topic {self.sns_topic_arn}")
        # Future implementation:
        # import boto3
        # sns = boto3.client('sns')
        # sns.publish(
        #     TopicArn=self.sns_topic_arn,
        #     Message=json.dumps(event),
        #     MessageAttributes={
        #         'event_type': {'DataType': 'String', 'StringValue': event['event']}
        #     }
        # )
        
    def _log_event(self, event: Dict):
        """Log event for debugging/auditing"""
        self._event_log.append(event)
        if len(self._event_log) > self._max_log_size:
            self._event_log = self._event_log[-self._max_log_size:]
            
    def get_recent_events(self, count: int = 50) -> List[Dict]:
        """Get recent events for debugging"""
        return self._event_log[-count:]


# Global instance
event_emitter = EventEmitter()


# ============================================================
# EVENT DEFINITIONS
# ============================================================

class Events:
    """Event type constants"""
    
    # Upload lifecycle
    UPLOAD_STARTED = "upload_started"
    UPLOAD_COMPLETE = "upload_complete"  # Watermarked video ready
    UPLOAD_FAILED = "upload_failed"
    
    # Verification lifecycle
    VERIFICATION_STARTED = "verification_started"
    VERIFICATION_PROGRESS = "verification_progress"
    VERIFICATION_COMPLETE = "verification_complete"  # All background processing done
    VERIFICATION_FAILED = "verification_failed"
    
    # User notifications
    NOTIFICATION_REQUESTED = "notification_requested"
    NOTIFICATION_SENT = "notification_sent"
    NOTIFICATION_FAILED = "notification_failed"


# ============================================================
# EVENT DATA SCHEMAS
# ============================================================

def create_verification_complete_event(
    video_id: str,
    verification_code: str,
    user_id: str,
    user_email: str,
    video_title: str,
    notification_preferences: Dict = None
) -> Dict:
    """Create a verification_complete event payload"""
    return {
        "video_id": video_id,
        "verification_code": verification_code,
        "user_id": user_id,
        "user_email": user_email,
        "video_title": video_title,
        "notification_preferences": notification_preferences or {"email": True, "sms": False},
        "verification_url": f"https://rendr.com/verify/{verification_code}",
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
