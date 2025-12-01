from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from datetime import datetime
import uuid
import os
import shutil

from services.video_processor import VideoProcessor
from models.video import VerificationCodeRequest, VerificationResult
from database.mongodb import get_db

router = APIRouter()
video_processor = VideoProcessor()

@router.post("/code", response_model=VerificationResult)
async def verify_by_code(
    request: VerificationCodeRequest,
    db = Depends(get_db)
):
    """Verify video by code"""
    video = await db.videos.find_one({"verification_code": request.verification_code})
    
    if not video:
        return VerificationResult(
            result="not_found",
            verification_code=request.verification_code
        )
    
    # Get creator info
    creator_info = None
    user_id = video.get('user_id') or video.get('username')
    if user_id:
        # Try to find by _id first, then by username
        user = await db.users.find_one({"_id": user_id})
        if not user:
            user = await db.users.find_one({"username": user_id})
        
        if user:
            creator_info = {
                "username": user.get('username', 'Unknown'),
                "display_name": user.get('display_name', user.get('username', 'Unknown')),
                "profile_url": f"/@{user.get('username', 'unknown')}"
            }
    
    # Log attempt
    await db.verification_attempts.insert_one({
        "_id": str(uuid.uuid4()),
        "video_id": video.get('id') or video.get('_id') or video.get('video_id'),
        "verification_code": request.verification_code,
        "verification_type": "code",
        "result": "authentic",
        "timestamp": datetime.now().isoformat()
    })
    
    metadata = {
        "captured_at": video.get('captured_at') or video.get('uploaded_at', ''),
        "verified_at": video.get('verified_at') or video.get('uploaded_at', ''),
        "duration_seconds": video.get('duration_seconds') or video.get('video_metadata', {}).get('duration', 0),
        "source": video.get('source', 'studio')
    }
    
    # Add blockchain proof if available
    if video.get('blockchain_signature'):
        metadata['blockchain_tx'] = video['blockchain_signature'].get('tx_hash')
        metadata['blockchain_explorer'] = video['blockchain_signature'].get('explorer_url')
        metadata['blockchain_block'] = video['blockchain_signature'].get('block_number')
        metadata['blockchain_verified'] = True
    else:
        metadata['blockchain_verified'] = False
    
    return VerificationResult(
        result="authentic",
        video_id=video.get('id') or video.get('_id') or video.get('video_id'),
        verification_code=video.get('verification_code', ''),
        metadata=metadata,
        creator=creator_info
    )

@router.post("/deep", response_model=VerificationResult)
async def deep_verification(
    video_file: UploadFile = File(...),
    verification_code: str = Form(...),
    db = Depends(get_db)
):
    """Deep verification by file upload using multi-hash system"""
    from services.enhanced_video_processor import enhanced_processor
    
    original_video = await db.videos.find_one({"verification_code": verification_code})
    
    if not original_video:
        raise HTTPException(404, "Verification code not found")
    
    # Save temp file
    temp_id = str(uuid.uuid4())
    upload_dir = "uploads/temp"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{temp_id}_{video_file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    try:
        # Calculate all hashes for uploaded video
        tier = original_video.get("storage", {}).get("tier", "free")
        uploaded_hashes = enhanced_processor.calculate_all_hashes(file_path, tier)
        
        # Compare with stored hashes
        stored_hashes = original_video.get("hashes", {})
        
        hash_matches = {
            "original": stored_hashes.get("original") == uploaded_hashes["original_hash"],
            "watermarked": stored_hashes.get("watermarked") == uploaded_hashes["original_hash"],
            "center_region": stored_hashes.get("center_region") == uploaded_hashes.get("center_region_hash") if uploaded_hashes.get("center_region_hash") else None,
            "audio": stored_hashes.get("audio") == uploaded_hashes.get("audio_hash") if uploaded_hashes.get("audio_hash") else None,
            "metadata": stored_hashes.get("metadata") == uploaded_hashes["metadata_hash"]
        }
        
        # Remove None values
        hash_matches = {k: v for k, v in hash_matches.items() if v is not None}
        
        # Calculate confidence
        matches = sum([1 for v in hash_matches.values() if v])
        total = len(hash_matches)
        similarity_score = int((matches / total) * 100) if total > 0 else 0
        
        # Determine result
        if hash_matches.get("original"):
            comparison = {"result": "authentic", "confidence_level": "very_high"}
            analysis = f"Perfect match. Video is original and unmodified ({similarity_score}% match)."
        elif hash_matches.get("watermarked"):
            comparison = {"result": "authentic", "confidence_level": "very_high"}
            analysis = f"Watermarked version detected. Video is authentic ({similarity_score}% match)."
        elif hash_matches.get("center_region") and similarity_score >= 70:
            comparison = {"result": "modified", "confidence_level": "medium"}
            analysis = f"Video appears modified (cropped/edited) but center content intact ({similarity_score}% match)."
        else:
            comparison = {"result": "tampered", "confidence_level": "low"}
            analysis = f"Significant modifications detected. Video may be fake ({similarity_score}% match)."
        
        
        # Log attempt with multi-hash results
        await db.verification_attempts.insert_one({
            "_id": str(uuid.uuid4()),
            "video_id": original_video['_id'],
            "verification_code": verification_code,
            "verification_type": "deep_multihash",
            "uploaded_file_hashes": uploaded_hashes,
            "hash_matches": hash_matches,
            "similarity_score": similarity_score,
            "result": comparison['result'],
            "confidence_level": comparison['confidence_level'],
            "timestamp": datetime.now().isoformat()
        })
        
        # Clean up
        os.remove(file_path)
        
        metadata = {
            "captured_at": original_video.get('captured_at') or original_video.get('uploaded_at', ''),
            "verified_at": original_video.get('verified_at') or original_video.get('uploaded_at', '')
        }
        
        # Add blockchain proof if available
        if original_video.get('blockchain_signature'):
            metadata['blockchain_tx'] = original_video['blockchain_signature'].get('tx_hash')
            metadata['blockchain_explorer'] = original_video['blockchain_signature'].get('explorer_url')
            metadata['blockchain_verified'] = True
        else:
            metadata['blockchain_verified'] = False
        
        return VerificationResult(
            result=comparison['result'],
            similarity_score=similarity_score,
            confidence_level=comparison['confidence_level'],
            frame_comparison=[],  # Not using frame-by-frame for multi-hash
            analysis=analysis,
            metadata=metadata,
            hash_matches=hash_matches
        )
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Verification failed: {str(e)}")
