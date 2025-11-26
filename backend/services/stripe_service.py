"""
Stripe Connect + Subscriptions Service
Handles creator onboarding, subscriptions, and revenue sharing
"""
import stripe
import os
from datetime import datetime
from typing import Dict, Optional

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY", "sk_test_emergent")


class StripeService:
    """Service for handling all Stripe operations"""
    
    # Revenue share percentages
    REVENUE_SHARE = {
        "pro": 0.80,        # Pro creators get 80%
        "enterprise": 0.85  # Enterprise creators get 85%
    }
    
    @classmethod
    def get_platform_fee_percent(cls, tier: str) -> float:
        """Get platform fee percentage based on creator tier"""
        creator_share = cls.REVENUE_SHARE.get(tier, 0.80)
        return 1.0 - creator_share  # Platform keeps 15-20%
    
    @classmethod
    async def create_connect_account(cls, user_id: str, email: str, country: str = "US") -> Dict:
        """
        Create a Stripe Connect Express account for a creator
        
        Args:
            user_id: Internal user ID
            email: Creator's email
            country: Creator's country code (default: US)
        
        Returns:
            Dict with account_id and other details
        """
        try:
            account = stripe.Account.create(
                type="express",
                country=country,
                email=email,
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True}
                },
                business_type="individual",
                metadata={
                    "user_id": user_id
                }
            )
            
            return {
                "account_id": account.id,
                "email": email,
                "country": country,
                "created": datetime.utcnow().isoformat()
            }
        except Exception as e:
            raise Exception(f"Stripe Connect account creation failed: {str(e)}")
    
    @classmethod
    async def create_account_link(cls, account_id: str, refresh_url: str, return_url: str) -> str:
        """
        Create an account link for creator onboarding
        
        Args:
            account_id: Stripe Connect account ID
            refresh_url: URL to redirect if link expires
            return_url: URL to redirect after onboarding completes
        
        Returns:
            URL for creator to complete onboarding
        """
        try:
            account_link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type="account_onboarding"
            )
            return account_link.url
        except Exception as e:
            raise Exception(f"Account link creation failed: {str(e)}")
    
    @classmethod
    async def get_account_status(cls, account_id: str) -> Dict:
        """
        Get Stripe Connect account status
        
        Returns:
            Dict with charges_enabled, payouts_enabled, details_submitted
        """
        try:
            account = stripe.Account.retrieve(account_id)
            return {
                "account_id": account.id,
                "charges_enabled": account.charges_enabled,
                "payouts_enabled": account.payouts_enabled,
                "details_submitted": account.details_submitted,
                "email": account.email
            }
        except Exception as e:
            raise Exception(f"Failed to retrieve account: {str(e)}")
    
    @classmethod
    async def create_subscription_price(
        cls,
        product_name: str,
        amount_cents: int,
        currency: str = "usd",
        metadata: Optional[Dict] = None
    ) -> str:
        """
        Create a Stripe Price for subscription
        
        Args:
            product_name: Name of the product/folder
            amount_cents: Price in cents (e.g., 999 = $9.99)
            currency: Currency code
            metadata: Additional metadata
        
        Returns:
            price_id: Stripe Price ID
        """
        try:
            # Create product
            product = stripe.Product.create(
                name=product_name,
                metadata=metadata or {}
            )
            
            # Create recurring price
            price = stripe.Price.create(
                product=product.id,
                unit_amount=amount_cents,
                currency=currency,
                recurring={
                    "interval": "month",
                    "interval_count": 1
                },
                metadata=metadata or {}
            )
            
            return price.id
        except Exception as e:
            raise Exception(f"Price creation failed: {str(e)}")
    
    @classmethod
    async def create_subscription_checkout(
        cls,
        price_id: str,
        success_url: str,
        cancel_url: str,
        customer_email: Optional[str] = None,
        metadata: Optional[Dict] = None,
        connected_account_id: Optional[str] = None,
        application_fee_percent: Optional[float] = None
    ) -> Dict:
        """
        Create a Stripe Checkout Session for subscription
        
        Args:
            price_id: Stripe Price ID
            success_url: URL to redirect on success
            cancel_url: URL to redirect on cancel
            customer_email: Pre-fill customer email
            metadata: Session metadata
            connected_account_id: Creator's Stripe Connect account ID
            application_fee_percent: Platform fee percentage (0.15 = 15%)
        
        Returns:
            Dict with session_id and url
        """
        try:
            session_params = {
                "payment_method_types": ["card"],
                "line_items": [{
                    "price": price_id,
                    "quantity": 1
                }],
                "mode": "subscription",
                "success_url": success_url,
                "cancel_url": cancel_url,
                "metadata": metadata or {}
            }
            
            # Add customer email if provided
            if customer_email:
                session_params["customer_email"] = customer_email
            
            # If connected account specified, set up revenue split
            if connected_account_id and application_fee_percent:
                session_params["subscription_data"] = {
                    "application_fee_percent": application_fee_percent * 100,  # Stripe wants percentage as 15, not 0.15
                    "transfer_data": {
                        "destination": connected_account_id
                    }
                }
            
            session = stripe.checkout.Session.create(**session_params)
            
            return {
                "session_id": session.id,
                "url": session.url
            }
        except Exception as e:
            raise Exception(f"Checkout session creation failed: {str(e)}")
    
    @classmethod
    async def get_checkout_session(cls, session_id: str) -> Dict:
        """Get checkout session details"""
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            return {
                "session_id": session.id,
                "payment_status": session.payment_status,
                "status": session.status,
                "customer_id": session.customer,
                "subscription_id": session.subscription,
                "amount_total": session.amount_total,
                "currency": session.currency,
                "metadata": session.metadata
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve session: {str(e)}")
    
    @classmethod
    async def cancel_subscription(cls, subscription_id: str, cancel_at_period_end: bool = True) -> Dict:
        """
        Cancel a subscription
        
        Args:
            subscription_id: Stripe Subscription ID
            cancel_at_period_end: If True, cancel at end of period. If False, cancel immediately.
        
        Returns:
            Dict with subscription details
        """
        try:
            if cancel_at_period_end:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            else:
                subscription = stripe.Subscription.cancel(subscription_id)
            
            return {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "current_period_end": subscription.current_period_end
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Subscription cancellation failed: {str(e)}")
    
    @classmethod
    async def get_subscription(cls, subscription_id: str) -> Dict:
        """Get subscription details"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "current_period_start": subscription.current_period_start,
                "current_period_end": subscription.current_period_end,
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "customer_id": subscription.customer
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to retrieve subscription: {str(e)}")
    
    @classmethod
    def construct_webhook_event(cls, payload: bytes, sig_header: str, webhook_secret: str):
        """
        Construct and verify webhook event
        
        Args:
            payload: Raw request body
            sig_header: Stripe-Signature header
            webhook_secret: Webhook signing secret
        
        Returns:
            Stripe Event object
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except ValueError:
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise Exception("Invalid signature")
