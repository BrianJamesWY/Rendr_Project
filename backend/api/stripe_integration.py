"""
Stripe Connect + Subscriptions API
Endpoints for creator onboarding, subscriptions, and payments
"""
from fastapi import APIRouter, HTTPException, Depends, Request, status
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import uuid4

from database.mongodb import get_db
from utils.security import get_current_user
from services.stripe_service import StripeService

router = APIRouter()


# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class ConnectOnboardingRequest(BaseModel):
    """Request to start Stripe Connect onboarding"""
    return_url: str
    refresh_url: str


class ConnectOnboardingResponse(BaseModel):
    """Response with onboarding URL"""
    onboarding_url: str
    account_id: str


class SubscriptionCheckoutRequest(BaseModel):
    """Request to create subscription checkout"""
    folder_id: str
    success_url: str
    cancel_url: str


class SubscriptionCheckoutResponse(BaseModel):
    """Response with checkout URL"""
    checkout_url: str
    session_id: str


# ============================================================================
# STRIPE CONNECT (Creator Onboarding)
# ============================================================================

@router.post("/stripe/connect/onboard", response_model=ConnectOnboardingResponse)
async def onboard_stripe_connect(
    request: ConnectOnboardingRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Start Stripe Connect onboarding for a creator
    Creator must be Pro or Enterprise tier
    """
    # Get user details
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"_id": 0})
    
    if not user:
        raise HTTPException(404, "User not found")
    
    # Check tier eligibility
    if user.get("premium_tier") not in ["pro", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Stripe Connect requires Pro or Enterprise tier"
        )
    
    # Check if already has Stripe account
    if user.get("stripe_account_id"):
        # Get existing account status
        account_status = await StripeService.get_account_status(user["stripe_account_id"])
        
        # If not fully onboarded, create new onboarding link
        if not account_status["details_submitted"]:
            onboarding_url = await StripeService.create_account_link(
                account_id=user["stripe_account_id"],
                refresh_url=request.refresh_url,
                return_url=request.return_url
            )
            return {
                "onboarding_url": onboarding_url,
                "account_id": user["stripe_account_id"]
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe account already connected"
            )
    
    # Create new Stripe Connect account
    account_data = await StripeService.create_connect_account(
        user_id=current_user["user_id"],
        email=user["email"],
        country="US"  # TODO: Make this configurable
    )
    
    # Save account ID to database
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "stripe_account_id": account_data["account_id"],
            "stripe_connected_at": datetime.utcnow()
        }}
    )
    
    # Create onboarding link
    onboarding_url = await StripeService.create_account_link(
        account_id=account_data["account_id"],
        refresh_url=request.refresh_url,
        return_url=request.return_url
    )
    
    return {
        "onboarding_url": onboarding_url,
        "account_id": account_data["account_id"]
    }


@router.get("/stripe/connect/status")
async def get_connect_status(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get Stripe Connect account status for current user"""
    user = await db.users.find_one({"_id": current_user["user_id"]}, {"_id": 0})
    
    if not user or not user.get("stripe_account_id"):
        return {
            "connected": False,
            "message": "No Stripe account connected"
        }
    
    # Get account status from Stripe
    account_status = await StripeService.get_account_status(user["stripe_account_id"])
    
    return {
        "connected": True,
        "account_id": user["stripe_account_id"],
        "charges_enabled": account_status["charges_enabled"],
        "payouts_enabled": account_status["payouts_enabled"],
        "details_submitted": account_status["details_submitted"]
    }


# ============================================================================
# SUBSCRIPTIONS (User Subscribing to Premium Folders)
# ============================================================================

@router.post("/stripe/subscribe", response_model=SubscriptionCheckoutResponse)
async def create_subscription_checkout(
    request: SubscriptionCheckoutRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Create a Stripe Checkout session for subscribing to a premium folder
    """
    # Get folder details
    folder = await db.premium_folders.find_one(
        {"folder_id": request.folder_id},
        {"_id": 0}
    )
    
    if not folder:
        raise HTTPException(404, "Premium folder not found")
    
    # Check if user is already subscribed
    existing_sub = await db.subscriptions.find_one({
        "subscriber_id": current_user["user_id"],
        "folder_id": request.folder_id,
        "status": "active"
    })
    
    if existing_sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already subscribed to this folder"
        )
    
    # Get creator details
    creator = await db.users.find_one(
        {"_id": folder["creator_id"]},
        {"_id": 0, "stripe_account_id": 1, "premium_tier": 1, "email": 1}
    )
    
    if not creator:
        raise HTTPException(404, "Creator not found")
    
    if not creator.get("stripe_account_id"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Creator has not connected Stripe account"
        )
    
    # Create or get Stripe Price for this folder
    price_id = folder.get("stripe_price_id")
    
    if not price_id:
        # Create price in Stripe
        price_id = await StripeService.create_subscription_price(
            product_name=f"{folder['name']} - Premium Access",
            amount_cents=folder["price_cents"],
            currency=folder["currency"].lower(),
            metadata={
                "folder_id": folder["folder_id"],
                "creator_id": folder["creator_id"]
            }
        )
        
        # Save price_id to folder
        await db.premium_folders.update_one(
            {"folder_id": request.folder_id},
            {"$set": {"stripe_price_id": price_id}}
        )
    
    # Calculate platform fee based on creator tier
    creator_tier = creator.get("premium_tier", "pro")
    platform_fee_percent = StripeService.get_platform_fee_percent(creator_tier)
    
    # Get user email
    subscriber = await db.users.find_one(
        {"_id": current_user["user_id"]},
        {"_id": 0, "email": 1}
    )
    
    # Create checkout session with revenue split
    checkout_data = await StripeService.create_subscription_checkout(
        price_id=price_id,
        success_url=request.success_url,
        cancel_url=request.cancel_url,
        customer_email=subscriber.get("email"),
        metadata={
            "folder_id": folder["folder_id"],
            "creator_id": folder["creator_id"],
            "subscriber_id": current_user["user_id"],
            "platform_fee_percent": str(platform_fee_percent)
        },
        connected_account_id=creator["stripe_account_id"],
        application_fee_percent=platform_fee_percent
    )
    
    # Create pending subscription record
    subscription_id = str(uuid4())
    await db.subscriptions.insert_one({
        "subscription_id": subscription_id,
        "stripe_session_id": checkout_data["session_id"],
        "stripe_subscription_id": None,  # Will be updated by webhook
        "subscriber_id": current_user["user_id"],
        "creator_id": folder["creator_id"],
        "folder_id": folder["folder_id"],
        "status": "pending",
        "price_cents": folder["price_cents"],
        "currency": folder["currency"],
        "platform_fee_percent": platform_fee_percent,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    return {
        "checkout_url": checkout_data["url"],
        "session_id": checkout_data["session_id"]
    }


@router.get("/stripe/checkout/status/{session_id}")
async def get_checkout_status(
    session_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Check the status of a checkout session
    Called by frontend after redirect from Stripe
    """
    # Get session from Stripe
    session_data = await StripeService.get_checkout_session(session_id)
    
    # Find subscription in database
    subscription = await db.subscriptions.find_one(
        {"stripe_session_id": session_id},
        {"_id": 0}
    )
    
    if not subscription:
        raise HTTPException(404, "Subscription not found")
    
    # If payment succeeded and not yet updated, update subscription
    if session_data["payment_status"] == "paid" and subscription["status"] == "pending":
        await db.subscriptions.update_one(
            {"subscription_id": subscription["subscription_id"]},
            {"$set": {
                "stripe_subscription_id": session_data["subscription_id"],
                "stripe_customer_id": session_data["customer_id"],
                "status": "active",
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Update folder subscriber count
        await db.premium_folders.update_one(
            {"folder_id": subscription["folder_id"]},
            {"$inc": {"subscriber_count": 1}}
        )
        
        # Create transaction record
        await db.transactions.insert_one({
            "transaction_id": str(uuid4()),
            "subscription_id": subscription["subscription_id"],
            "creator_id": subscription["creator_id"],
            "subscriber_id": subscription["subscriber_id"],
            "amount_cents": session_data["amount_total"],
            "currency": session_data["currency"],
            "stripe_payment_intent_id": session_data.get("payment_intent"),
            "status": "succeeded",
            "creator_share_cents": int(session_data["amount_total"] * (1 - subscription["platform_fee_percent"])),
            "platform_fee_cents": int(session_data["amount_total"] * subscription["platform_fee_percent"]),
            "payout_status": "pending",
            "created_at": datetime.utcnow()
        })
    
    return {
        "session_id": session_id,
        "payment_status": session_data["payment_status"],
        "status": session_data["status"],
        "subscription_id": subscription["subscription_id"],
        "folder_id": subscription["folder_id"]
    }


@router.post("/stripe/subscription/{subscription_id}/cancel")
async def cancel_subscription(
    subscription_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Cancel a subscription (at period end)"""
    # Find subscription
    subscription = await db.subscriptions.find_one({
        "subscription_id": subscription_id,
        "subscriber_id": current_user["user_id"]
    }, {"_id": 0})
    
    if not subscription:
        raise HTTPException(404, "Subscription not found")
    
    if not subscription.get("stripe_subscription_id"):
        raise HTTPException(400, "Subscription not yet activated")
    
    # Cancel in Stripe
    cancel_result = await StripeService.cancel_subscription(
        subscription["stripe_subscription_id"],
        cancel_at_period_end=True
    )
    
    # Update database
    await db.subscriptions.update_one(
        {"subscription_id": subscription_id},
        {"$set": {
            "cancel_at_period_end": True,
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {
        "message": "Subscription will cancel at period end",
        "current_period_end": cancel_result["current_period_end"]
    }


# ============================================================================
# WEBHOOKS
# ============================================================================

@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db = Depends(get_db)
):
    """
    Handle Stripe webhooks for subscription events
    """
    import os
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    if not webhook_secret:
        # In development, skip signature verification
        import json
        event_data = json.loads(payload)
        event_type = event_data.get("type")
    else:
        try:
            event = StripeService.construct_webhook_event(payload, sig_header, webhook_secret)
            event_type = event.type
            event_data = event.data.object
        except Exception as e:
            raise HTTPException(400, f"Webhook error: {str(e)}")
    
    # Handle different event types
    if event_type == "checkout.session.completed":
        # Payment succeeded
        session_id = event_data.get("id")
        # Update handled by get_checkout_status polling
        pass
    
    elif event_type == "customer.subscription.updated":
        # Subscription updated (e.g., cancelled)
        stripe_sub_id = event_data.get("id")
        cancel_at_period_end = event_data.get("cancel_at_period_end")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"$set": {
                "cancel_at_period_end": cancel_at_period_end,
                "updated_at": datetime.utcnow()
            }}
        )
    
    elif event_type == "customer.subscription.deleted":
        # Subscription ended
        stripe_sub_id = event_data.get("id")
        
        subscription = await db.subscriptions.find_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"_id": 0}
        )
        
        if subscription:
            await db.subscriptions.update_one(
                {"stripe_subscription_id": stripe_sub_id},
                {"$set": {
                    "status": "cancelled",
                    "updated_at": datetime.utcnow()
                }}
            )
            
            # Decrement folder subscriber count
            await db.premium_folders.update_one(
                {"folder_id": subscription["folder_id"]},
                {"$inc": {"subscriber_count": -1}}
            )
    
    elif event_type == "invoice.payment_succeeded":
        # Recurring payment succeeded
        stripe_sub_id = event_data.get("subscription")
        amount_paid = event_data.get("amount_paid")
        
        subscription = await db.subscriptions.find_one(
            {"stripe_subscription_id": stripe_sub_id},
            {"_id": 0}
        )
        
        if subscription:
            # Create transaction record for recurring payment
            await db.transactions.insert_one({
                "transaction_id": str(uuid4()),
                "subscription_id": subscription["subscription_id"],
                "creator_id": subscription["creator_id"],
                "subscriber_id": subscription["subscriber_id"],
                "amount_cents": amount_paid,
                "currency": event_data.get("currency", "usd"),
                "stripe_payment_intent_id": event_data.get("payment_intent"),
                "status": "succeeded",
                "creator_share_cents": int(amount_paid * (1 - subscription["platform_fee_percent"])),
                "platform_fee_cents": int(amount_paid * subscription["platform_fee_percent"]),
                "payout_status": "pending",
                "created_at": datetime.utcnow()
            })
    
    return {"status": "success"}
