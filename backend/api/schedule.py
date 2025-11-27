from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import uuid4
import os
from database.mongodb import get_db

router = APIRouter(prefix="/schedule", tags=["schedule"])

# Pydantic Models
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start_time: str  # ISO format datetime
    end_time: str    # ISO format datetime
    event_type: str = "general"  # general, live_stream, premiere, meetup
    location: Optional[str] = None
    url: Optional[str] = None
    recurring: bool = False
    recurrence_rule: Optional[str] = None  # e.g., "weekly", "monthly"

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    url: Optional[str] = None
    recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None

# Dependency for auth
from api.auth import get_current_user

# ==================== EVENTS ====================

@router.post("/events")
async def create_event(
    event: EventCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a scheduled event"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        username = current_user.get('username')
        
        event_data = {
            "event_id": str(uuid4()),
            "creator_id": user_id,
            "creator_username": username,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time,
            "end_time": event.end_time,
            "event_type": event.event_type,
            "location": event.location,
            "url": event.url,
            "recurring": event.recurring,
            "recurrence_rule": event.recurrence_rule,
            "attendee_count": 0,
            "status": "scheduled",  # scheduled, live, completed, cancelled
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.events.insert_one(event_data)
        
        return {
            "success": True,
            "event_id": event_data["event_id"],
            "message": "Event created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events")
async def get_events(
    creator_username: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    event_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db = Depends(get_db)
):
    """Get scheduled events"""
    try:
        query = {}
        
        if creator_username:
            query["creator_username"] = creator_username
        
        if event_type:
            query["event_type"] = event_type
        
        if start_date:
            query["start_time"] = {"$gte": start_date}
        
        if end_date:
            if "start_time" in query:
                query["start_time"]["$lte"] = end_date
            else:
                query["start_time"] = {"$lte": end_date}
        
        events = await db.events.find(
            query,
            {"_id": 0}
        ).sort("start_time", 1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/my")
async def get_my_events(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get current user's events"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        events = await db.events.find(
            {"creator_id": user_id},
            {"_id": 0}
        ).sort("start_time", 1).to_list(100)
        
        return {
            "events": events,
            "count": len(events)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}")
async def get_event(
    event_id: str,
    db = Depends(get_db)
):
    """Get a specific event"""
    try:
        event = await db.events.find_one({"event_id": event_id}, {"_id": 0})
        
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return event
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/events/{event_id}")
async def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update an event"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        event = await db.events.find_one({"event_id": event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if event.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this event")
        
        # Build update dict
        update_data = {"updated_at": datetime.now().isoformat()}
        
        for field, value in event_update.dict(exclude_unset=True).items():
            if value is not None:
                update_data[field] = value
        
        await db.events.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Event updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete an event"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        event = await db.events.find_one({"event_id": event_id})
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        
        if event.get('creator_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
        await db.events.delete_one({"event_id": event_id})
        
        # Delete all RSVPs for this event
        await db.rsvps.delete_many({"event_id": event_id})
        
        return {"success": True, "message": "Event deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== RSVPs ====================

@router.post("/events/{event_id}/rsvp")
async def rsvp_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """RSVP to an event"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check if already RSVP'd
        existing_rsvp = await db.rsvps.find_one({
            "event_id": event_id,
            "user_id": user_id
        })
        
        if existing_rsvp:
            return {"success": True, "message": "Already RSVP'd to this event"}
        
        # Create RSVP
        rsvp_data = {
            "rsvp_id": str(uuid4()),
            "event_id": event_id,
            "user_id": user_id,
            "username": current_user.get('username'),
            "created_at": datetime.now().isoformat()
        }
        
        await db.rsvps.insert_one(rsvp_data)
        
        # Increment attendee count
        await db.events.update_one(
            {"event_id": event_id},
            {"$inc": {"attendee_count": 1}}
        )
        
        return {"success": True, "message": "RSVP successful"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}/rsvp")
async def cancel_rsvp(
    event_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Cancel RSVP to an event"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        result = await db.rsvps.delete_one({
            "event_id": event_id,
            "user_id": user_id
        })
        
        if result.deleted_count > 0:
            # Decrement attendee count
            await db.events.update_one(
                {"event_id": event_id},
                {"$inc": {"attendee_count": -1}}
            )
            return {"success": True, "message": "RSVP cancelled"}
        else:
            return {"success": True, "message": "RSVP not found"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}/attendees")
async def get_attendees(
    event_id: str,
    skip: int = 0,
    limit: int = 100,
    db = Depends(get_db)
):
    """Get list of attendees for an event"""
    try:
        rsvps = await db.rsvps.find(
            {"event_id": event_id},
            {"_id": 0}
        ).skip(skip).limit(limit).to_list(limit)
        
        return {
            "attendees": rsvps,
            "count": len(rsvps)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
