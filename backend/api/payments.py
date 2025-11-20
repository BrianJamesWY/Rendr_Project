from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import Optional
import os
from datetime import datetime, timezone

from emergentintegrations.payments.stripe.checkout import (
    StripeCheckout,
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse
)
from utils.security import get_current_user
from database.mongodb import get_db

router = APIRouter()

# Subscription Plans (Server-side only - security!)
SUBSCRIPTION_PLANS = {
    "pro_monthly": {"amount": 9.99, "currency": "usd", "interval": "month", "tier": "pro"},
    "pro_yearly": {"amount": 99.99, "currency": "usd", "interval": "year", "tier": "pro"},
    "enterprise_monthly": {"amount": 49.99, "currency": "usd", "interval": "month", "tier": "enterprise"},
    "enterprise_yearly": {"amount": 499.99, "currency": "usd", "interval": "year", "tier": "enterprise"}
}

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    plan_id: str,
    origin_url: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create Stripe checkout session for subscription"""
    # Validate plan
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(400, "Invalid subscription plan")
    
    plan = SUBSCRIPTION_PLANS[plan_id]
    
    # Get origin URL from header if not provided
    if not origin_url:
        origin_url = str(request.base_url).rstrip('/')
    
    # Build success and cancel URLs
    success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/pricing"
    
    # Initialize Stripe
    api_key = os.getenv("STRIPE_API_KEY")
    webhook_url = f"{origin_url}/api/payments/webhook"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=plan["amount"],
        currency=plan["currency"],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": current_user["user_id"],
            "username": current_user["username"],
            "plan_id": plan_id,
            "tier": plan["tier"],
            "interval": plan["interval"]
        }
    )
    
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    payment_doc = {
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "amount": plan["amount"],
        "currency": plan["currency"],
        "plan_id": plan_id,
        "tier": plan["tier"],
        "interval": plan["interval"],
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(payment_doc)
    
    return {
        "url": session.url,
        "session_id": session.session_id
    }

@router.get("/checkout-status/{session_id}")
async def get_checkout_status(
    session_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Check payment status and update user tier if paid"""
    # Get transaction from database
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    
    if not transaction:
        raise HTTPException(404, "Payment session not found")
    
    # Verify this transaction belongs to current user
    if transaction["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # If already processed, return cached status
    if transaction["payment_status"] == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "tier": transaction["tier"]
        }
    
    # Check with Stripe
    api_key = os.getenv("STRIPE_API_KEY")
    webhook_url = f"{str(current_user.get('base_url', ''))}/api/payments/webhook"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    update_fields = {
        "payment_status": status.payment_status,
        "status": status.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # If payment successful, upgrade user tier
    if status.payment_status == "paid" and transaction["payment_status"] != "paid":
        new_tier = transaction["tier"]
        await db.users.update_one(
            {"_id": current_user["user_id"]},
            {"$set": {
                "premium_tier": new_tier,
                "subscription_plan": transaction["plan_id"],
                "subscription_interval": transaction["interval"],
                "subscription_updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        update_fields["tier_upgraded"] = True
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_fields}
    )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount": status.amount_total / 100,  # Convert from cents
        "currency": status.currency,
        "tier": transaction["tier"] if status.payment_status == "paid" else None
    }

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Handle Stripe webhook events"""
    body = await request.body()
    
    api_key = os.getenv("STRIPE_API_KEY")
    webhook_url = f"{str(request.base_url)}/api/payments/webhook"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    try:
        webhook_event = await stripe_checkout.handle_webhook(body, stripe_signature)
        
        # Update transaction status
        await db.payment_transactions.update_one(
            {"session_id": webhook_event.session_id},
            {"$set": {
                "payment_status": webhook_event.payment_status,
                "event_type": webhook_event.event_type,
                "event_id": webhook_event.event_id,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # If payment completed, upgrade tier
        if webhook_event.payment_status == "paid":
            transaction = await db.payment_transactions.find_one({"session_id": webhook_event.session_id})
            if transaction and not transaction.get("tier_upgraded"):
                await db.users.update_one(
                    {"_id": transaction["user_id"]},
                    {"$set": {
                        "premium_tier": transaction["tier"],
                        "subscription_plan": transaction["plan_id"],
                        "subscription_interval": transaction["interval"],
                        "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                await db.payment_transactions.update_one(
                    {"session_id": webhook_event.session_id},
                    {"$set": {"tier_upgraded": True}}
                )
        
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(400, f"Webhook error: {str(e)}")
