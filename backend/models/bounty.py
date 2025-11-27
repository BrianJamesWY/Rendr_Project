"""
Bounty Model
Data model for content theft bounties
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Bounty(BaseModel):
    bounty_id: str = Field(..., description="Unique bounty identifier")
    creator_id: str = Field(..., description="Creator who posted the bounty")
    creator_username: str = Field(..., description="Creator username")
    video_id: str = Field(..., description="Original video ID being stolen")
    video_code: str = Field(..., description="RENDR code of original video")
    title: str = Field(..., description="Bounty title")
    description: str = Field(..., description="Details about the theft")
    reward_amount: float = Field(..., description="Reward amount in USD")
    status: str = Field(default="active", description="active, claimed, verified, paid, cancelled")
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    
    # Optional claim info
    claimed_by: Optional[str] = None
    claimed_at: Optional[str] = None
    claim_evidence: Optional[str] = None  # URL to stolen content
    claim_details: Optional[str] = None
    
    # Verification info
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    verification_notes: Optional[str] = None
    
    # Payout info
    paid_at: Optional[str] = None
    stripe_payout_id: Optional[str] = None

class BountyCreate(BaseModel):
    video_id: str
    title: str
    description: str
    reward_amount: float = Field(..., gt=0, description="Must be greater than 0")

class BountyClaim(BaseModel):
    stolen_content_url: str
    details: str
