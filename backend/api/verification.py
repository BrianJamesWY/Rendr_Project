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
    
    # Log attempt
    await db.verification_attempts.insert_one({
        "_id": str(uuid.uuid4()),
        "video_id": video['_id'],
        "verification_code": request.verification_code,
        "verification_type": "code",
        "result": "authentic",
        "timestamp": datetime.now().isoformat()
    })
    
    metadata = {
        "captured_at": video['captured_at'],
        "verified_at": video['verified_at'],
        "duration_seconds": video['duration_seconds'],
        "source": video['source']
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
        video_id=video['_id'],
        verification_code=video['verification_code'],
        metadata=metadata
    )

@router.post("/deep", response_model=VerificationResult)
async def deep_verification(
    video_file: UploadFile = File(...),
    verification_code: str = Form(...),
    db = Depends(get_db)
):
    """Deep verification by file upload"""
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
        # Process uploaded video
        frames, _ = video_processor.extract_frames(file_path)
        new_hash = video_processor.calculate_perceptual_hash(frames)
        
        # Compare with original
        original_hash = original_video['perceptual_hash']
        comparison = video_processor.compare_hashes(original_hash, new_hash)
        
        # Generate analysis
        if comparison['result'] == "authentic":
            if comparison['similarity_score'] >= 95:
                analysis = f"Perfect match. Video matches original with {comparison['similarity_score']:.1f}% similarity."
            else:
                analysis = f"Video matches original with {comparison['similarity_score']:.1f}% similarity. Minor compression artifacts detected."
        else:
            tampered_frames = [f['frame'] for f in comparison['frame_comparison'] if f['similarity'] < 70]
            analysis = f"Significant differences in {len(tampered_frames)} frames. Video appears edited."
        
        # Log attempt
        await db.verification_attempts.insert_one({
            "_id": str(uuid.uuid4()),
            "video_id": original_video['_id'],
            "verification_code": verification_code,
            "verification_type": "deep",
            "uploaded_file_hash": new_hash['combined_hash'],
            "similarity_score": comparison['similarity_score'],
            "frame_comparison": comparison['frame_comparison'],
            "result": comparison['result'],
            "confidence_level": comparison['confidence_level'],
            "timestamp": datetime.now().isoformat()
        })
        
        # Clean up
        os.remove(file_path)
        
        return VerificationResult(
            result=comparison['result'],
            similarity_score=comparison['similarity_score'],
            confidence_level=comparison['confidence_level'],
            frame_comparison=comparison['frame_comparison'],
            analysis=analysis,
            metadata={
                "captured_at": original_video['captured_at'],
                "verified_at": original_video['verified_at']
            }
        )
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Verification failed: {str(e)}")
