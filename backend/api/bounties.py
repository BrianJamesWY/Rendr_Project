"""
Bounties API
Manage content theft bounties and claims
"""

from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import List, Optional
import os
from uuid import uuid4

from api.auth import get_current_user
from models.bounty import Bounty, BountyCreate, BountyClaim
from database.mongodb import get_db

router = APIRouter()

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'test_database')

@router.post("/", response_model=Bounty)
async def create_bounty(
    bounty_data: BountyCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new bounty for stolen content"""
    try:
        
        user_id = current_user.get('id') or current_user.get('_id')
        username = current_user.get('username')
        
        # Verify the video exists and belongs to the user
        video = await db.videos.find_one({
            "video_id": bounty_data.video_id,
            "username": username
        }, {"_id": 0})
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found or you don't own it")
        
        # Check for existing active bounty on this video
        existing = await db.bounties.find_one({
            "video_id": bounty_data.video_id,
            "status": {"$in": ["active", "claimed"]}
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Active bounty already exists for this video")
        
        # Create bounty
        bounty = Bounty(
            bounty_id=str(uuid4()),
            creator_id=user_id,
            creator_username=username,
            video_id=bounty_data.video_id,
            video_code=video.get('verification_code', ''),
            title=bounty_data.title,
            description=bounty_data.description,
            reward_amount=bounty_data.reward_amount,
            status="active"
        )
        
        await db.bounties.insert_one(bounty.dict())
        await client.close()
        
        return bounty
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Bounty])
async def list_bounties(
    status: Optional[str] = "active",
    skip: int = 0,
    limit: int = 50
):
    """List all bounties (public endpoint)"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        query = {}
        if status:
            query["status"] = status
        
        bounties = await db.bounties.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        await client.close()
        
        return bounties
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my", response_model=List[Bounty])
async def get_my_bounties(current_user: dict = Depends(get_current_user)):
    """Get bounties created by current user"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        bounties = await db.bounties.find(
            {"creator_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        await client.close()
        return bounties
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{bounty_id}", response_model=Bounty)
async def get_bounty(bounty_id: str):
    """Get single bounty details"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        bounty = await db.bounties.find_one({"bounty_id": bounty_id}, {"_id": 0})
        await client.close()
        
        if not bounty:
            raise HTTPException(status_code=404, detail="Bounty not found")
        
        return bounty
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bounty_id}/claim")
async def claim_bounty(
    bounty_id: str,
    claim: BountyClaim,
    current_user: dict = Depends(get_current_user)
):
    """Claim a bounty by providing evidence"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Get bounty
        bounty = await db.bounties.find_one({"bounty_id": bounty_id})
        if not bounty:
            raise HTTPException(status_code=404, detail="Bounty not found")
        
        # Check if bounty is active
        if bounty.get('status') != 'active':
            raise HTTPException(status_code=400, detail="Bounty is not active")
        
        # Can't claim your own bounty
        if bounty.get('creator_id') == user_id:
            raise HTTPException(status_code=400, detail="Cannot claim your own bounty")
        
        # Update bounty
        await db.bounties.update_one(
            {"bounty_id": bounty_id},
            {"$set": {
                "status": "claimed",
                "claimed_by": user_id,
                "claimed_at": datetime.now().isoformat(),
                "claim_evidence": claim.stolen_content_url,
                "claim_details": claim.details
            }}
        )
        
        await client.close()
        
        return {
            "success": True,
            "message": "Claim submitted successfully. Awaiting verification."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bounty_id}/verify")
async def verify_claim(
    bounty_id: str,
    approved: bool,
    notes: str = "",
    current_user: dict = Depends(get_current_user)
):
    """Admin endpoint to verify a claim"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check if user is admin (you can add proper admin check here)
        # For now, only the bounty creator can verify
        bounty = await db.bounties.find_one({"bounty_id": bounty_id})
        if not bounty:
            raise HTTPException(status_code=404, detail="Bounty not found")
        
        if bounty.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Only bounty creator or admin can verify")
        
        if bounty.get('status') != 'claimed':
            raise HTTPException(status_code=400, detail="Bounty is not in claimed status")
        
        # Update bounty
        new_status = "verified" if approved else "active"  # If rejected, back to active
        update_data = {
            "status": new_status,
            "verified_by": user_id if approved else None,
            "verified_at": datetime.now().isoformat() if approved else None,
            "verification_notes": notes
        }
        
        # If rejected, clear claim data
        if not approved:
            update_data.update({
                "claimed_by": None,
                "claimed_at": None,
                "claim_evidence": None,
                "claim_details": None
            })
        
        await db.bounties.update_one(
            {"bounty_id": bounty_id},
            {"$set": update_data}
        )
        
        await client.close()
        
        return {
            "success": True,
            "message": "Claim verified successfully" if approved else "Claim rejected",
            "status": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{bounty_id}/payout")
async def process_payout(
    bounty_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Process payout for verified bounty"""
    try:
        import stripe
        from motor.motor_asyncio import AsyncIOMotorClient
        
        stripe.api_key = os.getenv('STRIPE_API_KEY')
        
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Get bounty
        bounty = await db.bounties.find_one({"bounty_id": bounty_id})
        if not bounty:
            raise HTTPException(status_code=404, detail="Bounty not found")
        
        # Only creator or admin can trigger payout
        if bounty.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Only bounty creator or admin can process payout")
        
        if bounty.get('status') != 'verified':
            raise HTTPException(status_code=400, detail="Bounty must be verified before payout")
        
        # Get hunter's Stripe account
        hunter_id = bounty.get('claimed_by')
        hunter = await db.users.find_one({"id": hunter_id}, {"_id": 0})
        
        if not hunter or not hunter.get('stripe_account_id'):
            raise HTTPException(status_code=400, detail="Hunter must connect Stripe account to receive payout")
        
        # Create payout (transfer to connected account)
        amount_cents = int(bounty.get('reward_amount', 0) * 100)
        
        # TODO: Implement actual Stripe payout
        # For now, just mark as paid
        payout_id = f"po_{uuid4().hex[:24]}"
        
        await db.bounties.update_one(
            {"bounty_id": bounty_id},
            {"$set": {
                "status": "paid",
                "paid_at": datetime.now().isoformat(),
                "stripe_payout_id": payout_id
            }}
        )
        
        await client.close()
        
        return {
            "success": True,
            "message": "Payout processed successfully",
            "payout_id": payout_id,
            "amount": bounty.get('reward_amount')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bounty_id}")
async def cancel_bounty(
    bounty_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Cancel a bounty"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        
        user_id = current_user.get('id') or current_user.get('_id')
        
        bounty = await db.bounties.find_one({"bounty_id": bounty_id})
        if not bounty:
            raise HTTPException(status_code=404, detail="Bounty not found")
        
        if bounty.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Only bounty creator can cancel")
        
        if bounty.get('status') in ['verified', 'paid']:
            raise HTTPException(status_code=400, detail="Cannot cancel verified or paid bounty")
        
        await db.bounties.update_one(
            {"bounty_id": bounty_id},
            {"$set": {"status": "cancelled"}}
        )
        
        await client.close()
        
        return {"success": True, "message": "Bounty cancelled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
