# RENDR API Documentation
**Version:** 1.0  
**Base URL:** `https://rendr-verify-1.preview.emergentagent.com/api`  
**Last Updated:** December 9, 2025

---

## 📖 Table of Contents

1. [Authentication](#authentication)
2. [Videos](#videos)
3. [Verification](#verification)
4. [Folders](#folders)
5. [Showcase](#showcase)
6. [Analytics](#analytics)
7. [Admin](#admin)
8. [Error Codes](#error-codes)

---

## 🔐 Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

### POST `/auth/login`
Login and receive JWT token.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "BrianJames",
  "password": "Brian123!"
}
```

**Response (200):**
```json
{
  "user_id": "bd763e13-1f30-4c3a-9c06-8ff93fd09485",
  "email": "brian@test.com",
  "username": "BrianJames",
  "display_name": "Brian James",
  "tier": "enterprise",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "created_at": "2025-11-27T18:31:08.558001"
}
```

**Example (curl):**
```bash
curl -X POST https://rendr-verify-1.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"BrianJames","password":"Brian123!"}'
```

**Example (JavaScript):**
```javascript
const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
  username: 'BrianJames',
  password: 'Brian123!'
});
const token = response.data.token;
localStorage.setItem('token', token);
```

---

### POST `/auth/signup`
Create new user account.

**Authentication:** Not required

**Request Body:**
```json
{
  "username": "newcreator",
  "email": "creator@example.com",
  "password": "SecurePass123!",
  "display_name": "New Creator"
}
```

**Response (200):**
```json
{
  "user_id": "uuid-here",
  "username": "newcreator",
  "email": "creator@example.com",
  "token": "jwt-token-here",
  "message": "Account created successfully"
}
```

**Error (400):**
```json
{
  "detail": "Username already exists"
}
```

---

### GET `/auth/me`
Get current user information.

**Authentication:** Required

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user_id": "bd763e13-1f30-4c3a-9c06-8ff93fd09485",
  "username": "BrianJames",
  "email": "brian@test.com",
  "tier": "enterprise",
  "roles": ["creator", "ceo"],
  "created_at": "2025-11-27T18:31:08.558001"
}
```

---

## 🎥 Videos

### POST `/videos/upload`
Upload and verify a video.

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `video_file` (File, required): Video file (MP4 recommended)
- `folder_id` (String, optional): Folder ID to organize video

**Response (200) - New Video:**
```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_code": "RND-A1B2C3",
  "status": "success",
  "message": "Video uploaded and verified successfully with C2PA manifest",
  "watermarked_video_url": "/api/videos/watch/550e8400-e29b-41d4-a716-446655440000",
  "thumbnail_url": "/api/videos/550e8400-e29b-41d4-a716-446655440000/thumbnail",
  "hashes": {
    "original_sha256": "7f8c3d...",
    "watermarked_sha256": "9e2a5b...",
    "key_frame_count": 10,
    "perceptual_hash_count": 30,
    "master_hash": "3a9f2e..."
  },
  "c2pa": {
    "manifest_created": true,
    "manifest_path": "/path/to/manifest.c2pa"
  },
  "processing_status": {
    "stage": "complete",
    "progress": 100,
    "message": "All verification layers complete",
    "verification_layers": [
      "Original SHA-256",
      "Watermarked SHA-256",
      "Key Frame Hashes",
      "Perceptual Hashes",
      "Audio Hash",
      "Metadata Hash",
      "C2PA Manifest"
    ]
  },
  "expires_at": "2025-12-16T10:30:00Z",
  "storage_duration": "168 hours",
  "tier": "enterprise"
}
```

**Response (200) - Duplicate Detected:**
```json
{
  "video_id": "existing-video-id",
  "verification_code": "RND-XYZ123",
  "status": "duplicate",
  "message": "This video was already uploaded. Returning existing verification code.",
  "duplicate_detected": true,
  "confidence_score": 0.98,
  "original_upload_date": "2025-11-28T03:25:47.333000",
  "is_owner": false,
  "original_owner": "BrianJames",
  "creator_showcase_url": "/BrianJames",
  "creator_profile_pic": "/uploads/profiles/brian.jpg",
  "social_media_links": [
    {
      "platform": "YouTube",
      "icon": "🎥",
      "url": "https://youtube.com/watch?v=..."
    }
  ],
  "video_title": "My Original Video",
  "video_description": "Description here",
  "security_alert": "Uploading someone else's verified content may violate copyright and platform terms of service."
}
```

**Response (403) - User Banned:**
```json
{
  "error": "upload_blocked",
  "message": "Account temporarily banned until 2025-12-10 15:30 UTC",
  "status": "temp_banned",
  "strikes": 5,
  "ban_expires_at": "2025-12-10T15:30:00Z"
}
```

**Example (curl):**
```bash
TOKEN="your-jwt-token"

curl -X POST https://rendr-verify-1.preview.emergentagent.com/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video_file=@/path/to/video.mp4" \
  -F "folder_id=folder-uuid-optional"
```

**Example (JavaScript):**
```javascript
const formData = new FormData();
formData.append('video_file', videoFile);
formData.append('folder_id', folderId); // optional

const response = await axios.post(`${BACKEND_URL}/api/videos/upload`, formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

---

### GET `/videos/{video_id}/status`
Get real-time processing status for a video.

**Authentication:** Required (owner only)

**Path Parameters:**
- `video_id` (String, required): Video UUID

**Response (200) - Processing:**
```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "processing",
  "progress": 65,
  "message": "Calculating perceptual hashes...",
  "verification_layers": [
    "Original SHA-256",
    "Watermarked SHA-256",
    "Key Frame Hashes (10/10)",
    "Perceptual Hashes (20/30)"
  ],
  "eta": "15 seconds"
}
```

**Response (200) - Complete:**
```json
{
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "stage": "complete",
  "progress": 100,
  "message": "All verification layers complete",
  "verification_layers": [
    "Original SHA-256",
    "Watermarked SHA-256",
    "Key Frame Hashes (10/10)",
    "Perceptual Hashes (30)",
    "Audio Hash",
    "Metadata Hash",
    "C2PA Manifest"
  ],
  "eta": null
}
```

**Use Case:**
Poll this endpoint every 2 seconds to show real-time progress to users during upload.

---

### GET `/videos/user/list`
Get all videos for current user.

**Authentication:** Required

**Response (200):**
```json
{
  "videos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "verification_code": "RND-A1B2C3",
      "title": "My Video Title",
      "description": "Video description",
      "thumbnail_path": "/uploads/thumbnails/...",
      "uploaded_at": "2025-12-09T10:30:00Z",
      "folder_id": "folder-uuid",
      "verification_status": "verified",
      "is_public": true,
      "storage": {
        "tier": "enterprise",
        "expires_at": null
      }
    }
  ],
  "total_count": 17
}
```

---

### GET `/videos/watch/{video_id}`
Stream a video (with range support for seeking).

**Authentication:** Required (owner only)

**Headers (optional):**
```
Range: bytes=0-1023
```

**Response (200 or 206):**
- Returns video stream
- Supports partial content (HTTP 206)
- Content-Type: video/mp4

**Example:**
```html
<video controls>
  <source src="https://rendr-verify-1.preview.emergentagent.com/api/videos/watch/video-id" type="video/mp4">
</video>
```

---

### GET `/videos/{video_id}/thumbnail`
Get video thumbnail.

**Authentication:** Not required (if video is public)

**Response (200):**
- Returns image file (JPEG)
- Content-Type: image/jpeg

---

### PUT `/videos/{video_id}`
Update video metadata.

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "folder_id": "new-folder-id",
  "social_media_links": [
    {
      "platform": "YouTube",
      "icon": "🎥",
      "url": "https://youtube.com/watch?v=xyz"
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Video updated successfully",
  "video_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### DELETE `/videos/{video_id}`
Delete a video.

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "message": "Video deleted successfully",
  "video_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## ✅ Verification

### POST `/verify/code`
Verify a video by its verification code.

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "verification_code": "RND-A1B2C3"
}
```

**Response (200) - Authentic:**
```json
{
  "result": "authentic",
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_code": "RND-A1B2C3",
  "metadata": {
    "uploaded_at": "2025-12-09T10:30:00Z",
    "duration": 120.5,
    "resolution": "1920x1080",
    "fps": 30
  },
  "creator": {
    "username": "BrianJames",
    "display_name": "Brian James",
    "profile_url": "/BrianJames",
    "profile_pic": "/uploads/profiles/brian.jpg"
  },
  "social_media_links": [
    {
      "platform": "YouTube",
      "icon": "🎥",
      "url": "https://youtube.com/watch?v=xyz"
    }
  ],
  "video_title": "My Original Video",
  "video_description": "Description here"
}
```

**Response (404) - Not Found:**
```json
{
  "result": "not_found",
  "verification_code": "RND-INVALID",
  "message": "No video found with this verification code"
}
```

**Example (curl):**
```bash
curl -X POST https://rendr-verify-1.preview.emergentagent.com/api/verify/code \
  -H "Content-Type: application/json" \
  -d '{"verification_code":"RND-A1B2C3"}'
```

---

### POST `/verify/deep`
Deep verification using video file upload.

**Authentication:** Not required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `video_file` (File, required): Video to verify

**Response (200):**
```json
{
  "result": "authentic",
  "video_id": "550e8400-e29b-41d4-a716-446655440000",
  "verification_code": "RND-A1B2C3",
  "similarity_score": 0.98,
  "confidence_level": "high",
  "frame_comparison": [
    {"frame": 1, "similarity": 0.99},
    {"frame": 2, "similarity": 0.97}
  ],
  "analysis": "Video matches verified content with 98% similarity",
  "creator": {
    "username": "BrianJames",
    "display_name": "Brian James",
    "profile_url": "/BrianJames"
  }
}
```

---

## 📁 Folders

### POST `/folders`
Create a new folder.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Projects",
  "parent_id": null,
  "description": "All my project videos",
  "thumbnail_url": "/uploads/folder-thumb.jpg",
  "background_url": "/uploads/folder-bg.jpg"
}
```

**Response (200):**
```json
{
  "folder_id": "folder-uuid",
  "name": "My Projects",
  "message": "Folder created successfully"
}
```

---

### GET `/folders`
Get all folders for current user.

**Authentication:** Required

**Response (200):**
```json
{
  "folders": [
    {
      "id": "folder-uuid",
      "name": "My Projects",
      "parent_id": null,
      "description": "All my project videos",
      "thumbnail_url": "/uploads/folder-thumb.jpg",
      "created_at": "2025-12-09T10:30:00Z",
      "video_count": 5
    }
  ]
}
```

---

### PUT `/folders/{folder_id}`
Update folder metadata.

**Authentication:** Required (owner only)

**Request Body:**
```json
{
  "name": "Updated Folder Name",
  "description": "New description",
  "thumbnail_url": "/new-thumb.jpg"
}
```

**Response (200):**
```json
{
  "message": "Folder updated successfully",
  "folder_id": "folder-uuid"
}
```

---

### DELETE `/folders/{folder_id}`
Delete a folder (moves videos to root).

**Authentication:** Required (owner only)

**Response (200):**
```json
{
  "message": "Folder deleted successfully",
  "videos_moved": 5
}
```

---

## 👤 Showcase

### GET `/showcase/{username}`
Get public profile and videos for a creator.

**Authentication:** Not required (public endpoint)

**Path Parameters:**
- `username` (String, required): Creator's username

**Response (200):**
```json
{
  "username": "BrianJames",
  "display_name": "Brian James",
  "bio": "Content creator and filmmaker",
  "profile_pic": "/uploads/profiles/brian.jpg",
  "background_image": "/uploads/backgrounds/brian-bg.jpg",
  "social_links": [
    {
      "platform": "YouTube",
      "icon": "🎥",
      "url": "https://youtube.com/c/brianjames"
    }
  ],
  "videos": [
    {
      "id": "video-uuid",
      "verification_code": "RND-ABC123",
      "title": "My Video",
      "thumbnail_path": "/uploads/thumbnails/...",
      "uploaded_at": "2025-12-09T10:30:00Z"
    }
  ],
  "folders": [
    {
      "id": "folder-uuid",
      "name": "Projects",
      "thumbnail_url": "/uploads/folder-thumb.jpg",
      "video_count": 3
    }
  ],
  "total_videos": 17
}
```

**Response (404):**
```json
{
  "detail": "Creator not found"
}
```

**Example:**
```
https://rendr-verify-1.preview.emergentagent.com/api/showcase/BrianJames
```

---

## 📊 Analytics

### GET `/analytics/user`
Get analytics for current user's videos.

**Authentication:** Required

**Response (200):**
```json
{
  "total_videos": 17,
  "total_views": 1234,
  "total_verifications": 567,
  "recent_uploads": 3,
  "storage_used": "1.2 GB",
  "tier": "enterprise",
  "daily_stats": [
    {
      "date": "2025-12-09",
      "views": 45,
      "verifications": 12
    }
  ]
}
```

---

## 🔧 Admin

### GET `/admin/investor/dashboard?days=30`
Get platform metrics for investors.

**Authentication:** Required (investor, ceo, or admin role)

**Query Parameters:**
- `days` (Number, optional, default: 30): Number of days to analyze

**Response (200):**
```json
{
  "period_days": 30,
  "users": {
    "total": 1250,
    "new": 45,
    "growth_rate": 3.6
  },
  "videos": {
    "total": 5670,
    "new": 234,
    "growth_rate": 4.1
  },
  "verifications": {
    "total": 12345,
    "recent": 567
  },
  "tier_distribution": {
    "free": 980,
    "pro": 200,
    "enterprise": 70
  },
  "daily_upload_trend": [
    {
      "date": "2025-12-09",
      "uploads": 15
    }
  ],
  "security": {
    "duplicate_attempts": 89,
    "blocked_attempts_percentage": 1.57
  }
}
```

**Error (403):**
```json
{
  "detail": "Access denied: Investor access required"
}
```

---

### GET `/admin/ceo/dashboard`
Get comprehensive platform statistics (CEO only).

**Authentication:** Required (CEO role only)

**Response (200):**
```json
{
  ...all investor metrics...,
  "ceo_metrics": {
    "moderation": {
      "users_with_strikes": 23,
      "temp_banned": 3,
      "perm_banned": 1
    },
    "system_health": {
      "expired_videos": 45,
      "c2pa_adoption": {
        "total": 4500,
        "percentage": 79.4
      },
      "blockchain_adoption": {
        "total": 2300,
        "percentage": 40.6
      }
    },
    "top_creators": [
      {
        "username": "BrianJames",
        "tier": "enterprise",
        "video_count": 127
      }
    ]
  }
}
```

---

### GET `/admin/user-strikes/{user_id}`
Get detailed strike information for a user.

**Authentication:** Required (CEO or admin role)

**Path Parameters:**
- `user_id` (String, required): User UUID

**Response (200):**
```json
{
  "user_id": "bd763e13-1f30-4c3a-9c06-8ff93fd09485",
  "total_strikes": 3,
  "strikes": [
    {
      "reason": "duplicate_upload_attempt",
      "details": "Attempted to upload content owned by RND-XYZ123",
      "timestamp": "2025-12-09T10:30:00Z"
    }
  ],
  "ban_status": "none",
  "ban_expires_at": null,
  "total_duplicate_attempts": 5,
  "created_at": "2025-12-01T10:30:00Z",
  "updated_at": "2025-12-09T10:30:00Z"
}
```

---

## ⚠️ Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 206 | Partial Content | Range request successful (video streaming) |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | User doesn't have permission (banned, wrong role, not owner) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (username already exists) |
| 413 | Payload Too Large | File size exceeds limit |
| 422 | Unprocessable Entity | Invalid file format or corrupted file |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Response Format

```json
{
  "detail": "Error message here"
}
```

### Extended Error Response (Bans)

```json
{
  "error": "upload_blocked",
  "message": "Account temporarily banned until 2025-12-10 15:30 UTC",
  "status": "temp_banned",
  "strikes": 5,
  "ban_expires_at": "2025-12-10T15:30:00Z"
}
```

---

## 🔒 Authentication & Security

### JWT Token Format
Tokens expire after 24 hours. Include in all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Rate Limiting
- Video uploads: 10 per hour (free tier), unlimited (enterprise)
- API requests: 1000 per hour
- Verification lookups: Unlimited

### File Size Limits
- Free tier: 100 MB per video
- Pro tier: 500 MB per video
- Enterprise tier: 2 GB per video

---

## 📝 Best Practices

### Error Handling
```javascript
try {
  const response = await axios.post(`${BACKEND_URL}/api/videos/upload`, formData, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.data.duplicate_detected) {
    // Handle duplicate
    showDuplicateWarning(response.data);
  } else {
    // Handle success
    showSuccess(response.data);
  }
} catch (error) {
  if (error.response?.status === 403) {
    // User is banned
    showBanMessage(error.response.data);
  } else if (error.response?.status === 413) {
    // File too large
    showFileSizeError();
  } else {
    // Generic error
    showError(error.response?.data?.detail || 'Upload failed');
  }
}
```

### Polling for Status
```javascript
const pollStatus = async (videoId) => {
  const interval = setInterval(async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/videos/${videoId}/status`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    updateProgress(response.data.progress);
    
    if (response.data.stage === 'complete' || response.data.stage === 'error') {
      clearInterval(interval);
      handleComplete(response.data);
    }
  }, 2000); // Poll every 2 seconds
};
```

---

## 🚀 Quick Start

### 1. Login
```bash
TOKEN=$(curl -s -X POST https://rendr-verify-1.preview.emergentagent.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"BrianJames","password":"Brian123!"}' | jq -r '.token')
```

### 2. Upload Video
```bash
curl -X POST https://rendr-verify-1.preview.emergentagent.com/api/videos/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "video_file=@video.mp4"
```

### 3. Verify by Code
```bash
curl -X POST https://rendr-verify-1.preview.emergentagent.com/api/verify/code \
  -H "Content-Type: application/json" \
  -d '{"verification_code":"RND-ABC123"}'
```

---

**For questions or issues, see `/app/MASTER_REFERENCE.md` for technical details.**
