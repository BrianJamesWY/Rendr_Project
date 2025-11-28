from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from database.mongodb import get_db
from services.enhanced_video_processor import enhanced_processor
from datetime import datetime
import os
import tempfile
import shutil

router = APIRouter()

@router.post("/code")
async def verify_by_code(
    verification_code: str = Form(...),
    db = Depends(get_db)
):
    """Quick verification using just the verification code"""
    video = await db.videos.find_one({"verification_code": verification_code})
    
    if not video:
        return {
            "authentic": False,
            "message": "Verification code not found",
            "verification_code": verification_code
        }
    
    # Get creator info
    creator = await db.users.find_one({"_id": video.get("user_id")})
    
    return {
        "authentic": True,
        "verification_code": verification_code,
        "video_id": video.get("_id"),
        "captured_at": video.get("uploaded_at"),
        "creator": creator.get("username") if creator else "Unknown",
        "message": "Video verified successfully"
    }

@router.post("/deep")
async def deep_verify(
    video_file: UploadFile = File(...),
    verification_code: str = Form(None),
    db = Depends(get_db)
):
    """Deep verification by analyzing uploaded video file"""
    
    # Save uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, video_file.filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(video_file.file, buffer)
        
        # Calculate hashes of uploaded video
        uploaded_hashes = enhanced_processor.calculate_all_hashes(temp_path, "enterprise")
        
        # Find matching video in database
        query = {}
        if verification_code:
            query["verification_code"] = verification_code
        else:
            # Search by hash similarity
            query = {
                "$or": [
                    {"hashes.original": uploaded_hashes["original_hash"]},
                    {"hashes.watermarked": uploaded_hashes["original_hash"]},
                    {"hashes.center_region": uploaded_hashes.get("center_region_hash")},
                ]
            }
        
        video = await db.videos.find_one(query)
        
        if not video:
            return {
                "authentic": False,
                "match_type": "no_match",
                "message": "No matching video found in database",
                "confidence": 0
            }
        
        # Compare hashes
        stored_hashes = video.get("hashes", {})
        hash_matches = {
            "original": stored_hashes.get("original") == uploaded_hashes["original_hash"],
            "watermarked": stored_hashes.get("watermarked") == uploaded_hashes["original_hash"],
            "center_region": stored_hashes.get("center_region") == uploaded_hashes.get("center_region_hash"),
            "audio": stored_hashes.get("audio") == uploaded_hashes.get("audio_hash"),
            "metadata": stored_hashes.get("metadata") == uploaded_hashes["metadata_hash"]
        }
        
        # Calculate confidence score
        matches = sum([1 for v in hash_matches.values() if v])
        total_checks = len([v for v in hash_matches.values() if v is not None])
        confidence = int((matches / total_checks) * 100) if total_checks > 0 else 0
        
        # Determine authenticity and match type
        if hash_matches["original"]:
            match_type = "exact"
            message = "Video is authentic and unmodified"
            authentic = True
        elif hash_matches["watermarked"]:
            match_type = "watermarked"
            message = "Watermarked version detected"
            authentic = True
        elif hash_matches["center_region"] and confidence >= 70:
            match_type = "modified"
            message = "Video appears modified but center content intact"
            authentic = False
        else:
            match_type = "significant_modification"
            message = "Video significantly modified or fake"
            authentic = False
        
        # Get creator info
        creator = await db.users.find_one({"_id": video.get("user_id")})
        
        return {
            "authentic": authentic,
            "verification_code": video.get("verification_code"),
            "match_type": match_type,
            "hash_matches": hash_matches,
            "confidence": confidence,
            "creator": creator.get("username") if creator else "Unknown",
            "video_id": video.get("_id"),
            "captured_at": video.get("uploaded_at"),
            "message": message
        }
        
    finally:
        # Cleanup
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
