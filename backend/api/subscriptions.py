"""
Subscriptions API
Manage user subscriptions to premium folders
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List, Dict
import os

from auth import get_current_user

router = APIRouter()

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = 'rendr_db'

@router.get("/my")
async def get_my_subscriptions(current_user: dict = Depends(get_current_user)):
    """Get current user's subscriptions"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        # TODO: Query subscriptions collection when it exists
        # For now, return empty state
        subscriptions = []
        
        # Calculate stats
        active_count = len([s for s in subscriptions if s.get('status') == 'active'])
        monthly_total = sum([s.get('amount', 0) / 100 for s in subscriptions if s.get('status') == 'active'])
        videos_accessible = 0  # TODO: Count videos in subscribed folders
        
        await client.close()
        
        return {
            "subscriptions": subscriptions,
            "stats": {
                "active_count": active_count,
                "monthly_total": monthly_total,
                "videos_accessible": videos_accessible
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a subscription"""
    try:
        import stripe
        
        stripe.api_key = os.getenv('STRIPE_API_KEY')
        
        # Cancel the Stripe subscription
        subscription = stripe.Subscription.modify(
            subscription_id,
            cancel_at_period_end=True
        )
        
        # TODO: Update subscription status in database
        
        return {
            "success": True,
            "message": "Subscription will be cancelled at the end of the billing period",
            "cancel_at": subscription.cancel_at
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
