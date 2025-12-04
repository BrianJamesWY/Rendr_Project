"""
Comprehensive Diagnostic System for RENDR
Provides health checks, system status, and troubleshooting endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from database.mongodb import get_db
from utils.security import get_current_user
import os
import psutil
import sys

router = APIRouter()

@router.get("/health/quick")
async def quick_health():
    """Quick health check - no auth required"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "rendr-api",
        "version": "0.1.0"
    }

@router.get("/health/full")
async def full_health(current_user: dict = Depends(get_current_user)):
    """
    Comprehensive health check - requires authentication
    Returns detailed system information
    """
    db = await get_db()
    
    # Check database
    try:
        await db.command("ping")
        db_status = "connected"
        
        # Get counts
        user_count = await db.users.count_documents({})
        video_count = await db.videos.count_documents({})
        folder_count = await db.folders.count_documents({})
        
    except Exception as e:
        db_status = f"error: {str(e)}"
        user_count = 0
        video_count = 0
        folder_count = 0
    
    # Check storage directories
    storage_checks = {
        "videos": os.path.exists("uploads/videos") and os.access("uploads/videos", os.W_OK),
        "thumbnails": os.path.exists("uploads/thumbnails") and os.access("uploads/thumbnails", os.W_OK),
        "temp": os.path.exists("uploads/temp") and os.access("uploads/temp", os.W_OK),
    }
    
    storage_status = "available" if all(storage_checks.values()) else "partial"
    
    # System resources
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "storage": storage_status,
            "auth": "working"
        },
        "storage_details": storage_checks,
        "stats": {
            "total_users": user_count,
            "total_videos": video_count,
            "total_folders": folder_count
        },
        "system": {
            "memory_used_percent": memory.percent,
            "disk_used_percent": disk.percent,
            "python_version": sys.version.split()[0]
        }
    }

@router.get("/diagnostics/videos/{username}")
async def diagnose_user_videos(username: str, current_user: dict = Depends(get_current_user)):
    """
    Diagnose video issues for a specific user
    Returns detailed video information and potential problems
    """
    db = await get_db()
    
    # Get user
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all videos
    videos = await db.videos.find({"user_id": user["user_id"]}, {"_id": 0}).to_list(1000)
    
    # Analyze videos
    issues = []
    video_analysis = []
    
    for video in videos:
        video_issues = []
        
        # Check for missing fields
        if not video.get("verification_code"):
            video_issues.append("Missing verification code")
        if not video.get("storage"):
            video_issues.append("Missing storage path")
        if not video.get("thumbnail_url"):
            video_issues.append("Missing thumbnail")
        if not video.get("title"):
            video_issues.append("No title set")
        
        # Check file existence
        if video.get("storage"):
            storage_path = video["storage"]
            if not os.path.exists(storage_path):
                video_issues.append(f"Video file not found at {storage_path}")
        
        video_analysis.append({
            "video_id": video.get("video_id"),
            "verification_code": video.get("verification_code"),
            "title": video.get("title", "Untitled"),
            "on_showcase": video.get("on_showcase", False),
            "issues": video_issues if video_issues else ["No issues detected"]
        })
        
        if video_issues:
            issues.extend(video_issues)
    
    return {
        "username": username,
        "user_id": user["user_id"],
        "premium_tier": user.get("premium_tier", "free"),
        "total_videos": len(videos),
        "videos_on_showcase": len([v for v in videos if v.get("on_showcase")]),
        "videos_with_issues": len([v for v in video_analysis if v["issues"] != ["No issues detected"]]),
        "video_analysis": video_analysis,
        "all_issues": list(set(issues)) if issues else ["No issues found"]
    }

@router.get("/diagnostics/api-endpoints")
async def list_api_endpoints():
    """
    List all available API endpoints
    Useful for debugging and documentation
    """
    return {
        "authentication": [
            "POST /api/auth/register",
            "POST /api/auth/login",
            "GET /api/auth/me",
            "POST /api/auth/logout"
        ],
        "videos": [
            "POST /api/videos/upload",
            "GET /api/videos/user/list",
            "GET /api/videos/{video_id}",
            "PUT /api/videos/{video_id}",
            "DELETE /api/videos/{video_id}",
            "GET /api/videos/watch/{video_id}"
        ],
        "users": [
            "GET /api/@/{username}",
            "GET /api/@/{username}/videos",
            "PUT /api/users/profile",
            "GET /api/users/quota"
        ],
        "folders": [
            "POST /api/folders/",
            "GET /api/folders/",
            "DELETE /api/folders/{folder_id}"
        ],
        "verification": [
            "GET /api/verify/{code}",
            "POST /api/verify/upload"
        ],
        "diagnostics": [
            "GET /api/health/quick",
            "GET /api/health/full",
            "GET /api/diagnostics/videos/{username}",
            "GET /api/diagnostics/api-endpoints"
        ]
    }

@router.post("/diagnostics/test-video-flow")
async def test_video_flow(current_user: dict = Depends(get_current_user)):
    """
    Test the complete video workflow
    Returns step-by-step status
    """
    db = await get_db()
    results = {}
    
    # Test 1: Can query user's videos
    try:
        videos = await db.videos.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(10)
        results["video_query"] = {
            "status": "pass",
            "count": len(videos)
        }
    except Exception as e:
        results["video_query"] = {
            "status": "fail",
            "error": str(e)
        }
    
    # Test 2: Can query folders
    try:
        folders = await db.folders.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(10)
        results["folder_query"] = {
            "status": "pass",
            "count": len(folders)
        }
    except Exception as e:
        results["folder_query"] = {
            "status": "fail",
            "error": str(e)
        }
    
    # Test 3: Storage directories accessible
    storage_test = {
        "videos": os.access("uploads/videos", os.W_OK),
        "thumbnails": os.access("uploads/thumbnails", os.W_OK),
        "temp": os.access("uploads/temp", os.W_OK)
    }
    results["storage_access"] = {
        "status": "pass" if all(storage_test.values()) else "fail",
        "details": storage_test
    }
    
    # Test 4: User data complete
    required_fields = ["user_id", "username", "email"]
    missing_fields = [f for f in required_fields if f not in current_user]
    results["user_data"] = {
        "status": "pass" if not missing_fields else "fail",
        "missing_fields": missing_fields if missing_fields else "none"
    }
    
    overall_status = "pass" if all(
        r.get("status") == "pass" for r in results.values()
    ) else "fail"
    
    return {
        "overall_status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "test_results": results
    }
