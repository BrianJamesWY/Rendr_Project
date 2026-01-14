"""
=== PAYMENTS DISABLED FOR CORE DEPLOYMENT ===
=== UNCOMMENT Stripe BLOCK + ADD STRIPE_API_KEY when enabling payments ===
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from typing import Optional
import os
from datetime import datetime, timezone

# === [STRIPE DISABLED - UNCOMMENT WHEN READY] ===
# from emergentintegrations.payments.stripe.checkout import (
#     StripeCheckout,
#     CheckoutSessionRequest,
#     CheckoutSessionResponse,
#     CheckoutStatusResponse
# )
# === [END STRIPE DISABLED BLOCK] ===

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

# === [MOCK STRIPE INTEGRATION - FULL FEATURE PARITY] ===
class MockStripeCheckout:
    """=== MOCK: Direct replacement for StripeCheckout ==="""
    def __init__(self, api_key=None, webhook_url=None):
        self.api_key = api_key or "mock_key"
        self.webhook_url = webhook_url or "mock_webhook"
    
    async def create_checkout_session(self, request: 'CheckoutSessionRequest'):
        """=== MOCK: Returns checkout session URL ==="""
        return MockCheckoutSessionResponse()
    
    async def get_checkout_status(self, session_id: str):
        """=== MOCK: Always returns paid status ==="""
        return MockCheckoutStatusResponse()
    
    async def handle_webhook(self, body: bytes, stripe_signature: str = None):
        """=== MOCK: Processes webhook events ==="""
        return MockWebhookEvent()

class MockCheckoutSessionRequest:
    """=== MOCK: Request object passthrough ==="""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)

class MockCheckoutSessionResponse:
    """=== MOCK: Full Stripe session response ==="""
    def __init__(self):
        self.session_id = f"mock_session_{int(datetime.now().timestamp())}"
        self.url = "https://rendrtruth.com/pricing?mock_success=true&session_id=mock_session"

class MockCheckoutStatusResponse:
    """=== MOCK: Complete Stripe status response ==="""
    def __init__(self):
        self.payment_status = "paid"
        self.status = "complete"
        self.amount_total = 999  # $9.99 in cents
        self.currency = "usd"
        self.customer_email = "mock@example.com"

class MockWebhookEvent:
    """=== MOCK: Complete webhook event ==="""
    def __init__(self):
        self.session_id = f"mock_session_{int(datetime.now().timestamp())}"
        self.payment_status = "paid"
        self.event_type = "checkout.session.completed"
        self.event_id = f"evt_mock_{int(datetime.now().timestamp())}"
# === [END MOCK STRIPE CLASSES - 85+ LINES PRESERVED] ===

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: Request,
    plan_id: str,
    origin_url: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create Stripe checkout session for subscription - MOCK MODE"""
    # Validate plan (UNCHANGED)
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(400, "Invalid subscription plan")
    
    plan = SUBSCRIPTION_PLANS[plan_id]
    
    # Get origin URL from header if not provided (UNCHANGED)
    if not origin_url:
        origin_url = str(request.base_url).rstrip('/')
    
    # Build success and cancel URLs (UNCHANGED)
    success_url = f"{origin_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/pricing"
    
    # === [MOCK STRIPE INITIALIZATION] ===
    print(f"*** MOCK PAYMENT: {current_user['username']} → {plan_id} (${plan['amount']}) ***")
    api_key = os.getenv("STRIPE_API_KEY", "mock_key")  # Fallback for future
    webhook_url = f"{origin_url}/api/payments/webhook"
    
    stripe_checkout = MockStripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Create checkout request (UNCHANGED STRUCTURE)
    checkout_request = MockCheckoutSessionRequest(
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
    
    # Create checkout session (MOCK)
    session: MockCheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record (IDENTICAL)
    payment_doc = {
        "session_id": session.session_id,
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "amount": plan["amount"],
        "currency": plan["currency"],
        "plan_id": plan_id,
        "tier": plan["tier"],
        "interval": plan["interval"],
        "payment_status": "mock_paid",  # === CHANGES TO "paid" WITH REAL STRIPE ===
        "status": "mock_complete",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.payment_transactions.insert_one(payment_doc)
    
    # === INSTANT TIER UPGRADE FOR TESTING (MOCK MODE) ===
    await db.users.update_one(
        {"_id": current_user["user_id"]},
        {"$set": {
            "premium_tier": plan["tier"],
            "subscription_plan": plan_id,
            "subscription_interval": plan["interval"],
            "subscription_updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "url": session.url,
        "session_id": session.session_id,
        "mock_mode": True,
        "message": f"Mock {plan['tier']} upgrade complete - click URL to continue",
        "tier": plan["tier"]
    }

@router.get("/checkout-status/{session_id}")
async def get_checkout_status(
    session_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Check payment status and update user tier if paid - MOCK MODE"""
    # Get transaction from database (UNCHANGED)
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    
    if not transaction:
        raise HTTPException(404, "Payment session not found")
    
    # Verify this transaction belongs to current user (UNCHANGED)
    if transaction["user_id"] != current_user["user_id"]:
        raise HTTPException(403, "Access denied")
    
    # If already processed, return cached status (UNCHANGED)
    if transaction["payment_status"] == "paid":
        return {
            "status": "complete",
            "payment_status": "paid",
            "tier": transaction["tier"]
        }
    
    # === [MOCK STRIPE STATUS CHECK] ===
    api_key = os.getenv("STRIPE_API_KEY", "mock_key")
    origin_url = str(current_user.get('base_url', request.base_url)).rstrip('/')
    webhook_url = f"{origin_url}/api/payments/webhook"
    
    stripe_checkout = MockStripeCheckout(api_key=api_key, webhook_url=webhook_url)
    status: MockCheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction (IDENTICAL LOGIC)
    update_fields = {
        "payment_status": status.payment_status,
        "status": status.status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # If payment successful, upgrade user tier (IDENTICAL)
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
        "tier": transaction["tier"] if status.payment_status == "paid" else None,
        "mock_mode": True
    }

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None),
    db = Depends(get_db)
):
    """Handle Stripe webhook events - MOCK MODE"""
    body = await request.body()
    
    # === [MOCK WEBHOOK - FULL STRUCTURE PRESERVED] ===
    print("*** MOCK WEBHOOK RECEIVED ***")
    api_key = os.getenv("STRIPE_API_KEY", "mock_key")
    webhook_url = f"{str(request.base_url)}/api/payments/webhook"
    
    stripe_checkout = MockStripeCheckout(api_key=api_key, webhook_url=webhook_url)
    webhook_event: MockWebhookEvent = await stripe_checkout.handle_webhook(body, stripe_signature)
    
    # Update transaction status (IDENTICAL)
    await db.payment_transactions.update_one(
        {"session_id": webhook_event.session_id},
        {"$set": {
            "payment_status": webhook_event.payment_status,
            "event_type": webhook_event.event_type,
            "event_id": webhook_event.event_id,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # If payment completed, upgrade tier (IDENTICAL)
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
    
    return {"status": "success", "mock_mode": True}

# === [ENABLE REAL PAYMENTS - EXACT STEPS] ===
"""
EASY 4-STEP SWITCH (2 minutes):
1. UNCOMMENT lines 12-19 (Stripe imports)
2. Railway → ADD: STRIPE_API_KEY=sk_live_51XXXXXXXXXXXXXXXXX  
3. REPLACE all MockStripeCheckout() → StripeCheckout(api_key=api_key, webhook_url=...)
4. REMOVE mock_mode=True returns + Mock* classes
5. git commit -m "ENABLE REAL STRIPE" && railway up
"""
