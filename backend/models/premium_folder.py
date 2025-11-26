from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class PremiumFolder(BaseModel):
    """Premium folder that creators can charge for"""
    folder_id: str
    creator_id: str
    name: str
    description: Optional[str] = None
    icon: str = "🔒"
    price_cents: int  # Monthly subscription price in cents
    currency: str = "USD"
    visibility: str = "public"  # public, unlisted, private
    video_count: int = 0
    subscriber_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    # Settings
    allow_downloads: bool = False
    watermark_enabled: bool = True


class CreatePremiumFolder(BaseModel):
    """Create a new premium folder"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = "🔒"
    price_cents: int = Field(..., ge=99, le=999999)  # Min $0.99, max $9,999.99
    visibility: Optional[str] = "public"
    allow_downloads: Optional[bool] = False
    watermark_enabled: Optional[bool] = True


class UpdatePremiumFolder(BaseModel):
    """Update premium folder details"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    icon: Optional[str] = None
    price_cents: Optional[int] = Field(None, ge=99, le=999999)
    visibility: Optional[str] = None
    allow_downloads: Optional[bool] = None
    watermark_enabled: Optional[bool] = None


class PremiumFolderPublic(BaseModel):
    """Public view of premium folder (for non-subscribers)"""
    folder_id: str
    creator_id: str
    creator_username: str
    creator_name: str
    name: str
    description: Optional[str] = None
    icon: str
    price_cents: int
    currency: str
    video_count: int
    subscriber_count: int
    preview_videos: List[dict] = []  # Limited preview of first few videos


class Subscription(BaseModel):
    """User subscription to a premium folder"""
    subscription_id: str
    subscriber_id: str
    creator_id: str
    folder_id: str
    stripe_subscription_id: str
    stripe_customer_id: str
    status: str  # active, cancelled, past_due, unpaid
    current_period_start: datetime
    current_period_end: datetime
    cancel_at_period_end: bool = False
    created_at: datetime
    updated_at: datetime


class CreateSubscription(BaseModel):
    """Create a new subscription"""
    folder_id: str
    payment_method_id: str  # Stripe payment method ID
    email: Optional[str] = None  # For guest checkouts


class SubscriptionResponse(BaseModel):
    """Response after creating subscription"""
    subscription_id: str
    client_secret: Optional[str] = None  # For 3D Secure
    status: str
    folder_id: str
    next_billing_date: datetime


class Transaction(BaseModel):
    """Transaction record for payments"""
    transaction_id: str
    subscription_id: str
    creator_id: str
    subscriber_id: str
    amount_cents: int
    currency: str
    stripe_payment_intent_id: str
    status: str  # succeeded, failed, refunded
    creator_share_cents: int  # Amount creator receives (80% or 85%)
    platform_fee_cents: int  # Amount Rendr keeps (20% or 15%)
    payout_status: str  # pending, paid, failed
    created_at: datetime
    paid_at: Optional[datetime] = None


class Payout(BaseModel):
    """Payout to creator"""
    payout_id: str
    creator_id: str
    stripe_payout_id: str
    amount_cents: int
    currency: str
    status: str  # pending, paid, failed, cancelled
    transaction_ids: List[str] = []  # Transactions included in this payout
    initiated_at: datetime
    completed_at: Optional[datetime] = None
    failure_reason: Optional[str] = None
