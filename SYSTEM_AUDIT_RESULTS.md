# Rendr System Audit Results
**Date**: November 28, 2024
**Auditor**: E1 Agent
**Purpose**: Pre-implementation audit for video verification testing

---

## 🔍 DATABASE SCHEMA PATTERNS

### **Users Collection**
```javascript
{
  "_id": "UUID-string",          // Primary key
  "username": "BrianJames",      // Unique username
  "email": "email@example.com",
  "password_hash": "bcrypt-hash",
  "display_name": "Display Name",
  "premium_tier": "free|pro|enterprise",
  "account_type": "free|premium",
  // ... other fields
}
```
**Key Pattern**: NO `user_id` field - only `_id`

### **Videos Collection**
```javascript
{
  "_id": "UUID-string",          // Primary key
  "id": "UUID-string",           // Duplicate for compatibility
  "user_id": "UUID-string",      // FK to users._id
  "username": "BrianJames",      // Denormalized
  "verification_code": "RND-ABC123",
  "hashes": {
    "original": "hash-value",
    "watermarked": "hash-value",
    "center_region": "hash-value",  // Pro+
    "audio": "hash-value",           // Enterprise
    "metadata": "hash-value"
  },
  "storage": {
    "tier": "free|pro|enterprise",
    "uploaded_at": "ISO-datetime",
    "expires_at": "ISO-datetime|null",
    "video_path": "/uploads/videos/xxx.mp4",
    "thumbnail_path": "/uploads/thumbnails/xxx.jpg"
  }
}
```

### **Folders Collection**
```javascript
{
  "_id": "UUID-string",
  "folder_id": "UUID-string",    // Duplicate ID
  "folder_name": "Folder Name",
  "username": "BrianJames",      // For queries
  "user_id": "UUID-string",      // FK to users._id
  "order": 1,
  "created_at": "ISO-datetime"
}
```

---

## 🔐 AUTHENTICATION PATTERN

### JWT Token Structure
```python
{
  "user_id": "UUID-string",      # users._id
  "email": "email@example.com",
  "username": "BrianJames",
  "exp": timestamp
}
```

### Auth Dependency
```python
current_user = Depends(get_current_user)
# Returns: {"user_id": "...", "email": "...", "username": "..."}
# Access: current_user["user_id"]
```

**CRITICAL PATTERN**: 
- Token has `user_id` field (= users._id)
- Use `current_user["user_id"]` in all DB queries
- For username: `current_user.get("username")`

---

## 📁 FILE STORAGE PATTERNS

### Upload Directory Structure
```
/app/backend/uploads/
├── videos/
│   ├── {video_id}.mp4
│   └── {video_id}_watermarked.mp4
└── thumbnails/
    └── {video_id}.jpg
```

### Storage Durations (Currently Implemented)
- **Free**: 24 hours
- **Pro**: 168 hours (7 days)
- **Enterprise**: Unlimited (null expiration)

---

## ✅ WHAT EXISTS & WORKS

### Backend APIs
✅ `/api/auth/login` - Authentication
✅ `/api/auth/register` - User registration  
✅ `/api/videos/upload` - Video upload with watermarking
✅ `/api/videos/user/list` - List user's videos
✅ `/api/videos/{video_id}` - Update video (PUT)
✅ `/api/folders/` - CRUD operations
✅ `/api/verify/code` - Verify by code
✅ `/api/@/{username}` - Public profile
✅ `/api/@/{username}/videos` - Public videos

### Services
✅ `EnhancedVideoProcessor` - Multi-hash calculation
✅ `WatermarkProcessor` - Watermark application
✅ `VideoProcessor` - Basic processing
✅ `BlockchainService` - Timestamping (optional)

### Hash Types (Tier-based)
✅ **Original Hash** - Perceptual hash (all tiers)
✅ **Metadata Hash** - Video properties (all tiers)
✅ **Center Region Hash** - Center 50% hash (Pro+)
✅ **Audio Hash** - Audio fingerprint (Enterprise)

---

## ❌ WHAT'S MISSING

### Critical Missing Features

1. **Video Streaming Endpoint**
   - **Need**: `/api/videos/{video_id}/stream` or `/api/videos/{video_id}/watch`
   - **Purpose**: Serve video files to authenticated users
   - **Security**: Check ownership or showcase status
   
2. **Deep Verification API**
   - **Current**: `/api/verify/code` (code-only)
   - **Need**: `/api/verify/deep` (upload video file for hash comparison)
   - **Purpose**: Tamper detection
   
3. **Video Player Component**
   - **Need**: Frontend video player on Showcase
   - **Purpose**: Watch videos in browser
   
4. **Tier Management**
   - **Current**: Premium tier stored but not manageable
   - **Need**: API to upgrade/downgrade tiers (for testing)

5. **Hash Comparison Logic**
   - **Need**: Detailed comparison with confidence scoring
   - **Purpose**: Detect different types of tampering

6. **Storage Extension API**
   - **Need**: `/api/videos/{video_id}/extend-storage`
   - **Purpose**: Extend expiration for Free/Pro tiers

---

## 🚨 INCONSISTENCIES FOUND

### 1. Video ID Fields
**Issue**: Videos have both `_id` and `id` fields with same value
```python
video_doc = {
    "_id": video_id,
    "id": video_id,  # Redundant
}
```
**Pattern**: Keep both for backward compatibility

### 2. Folder ID Fields  
**Issue**: Folders have both `_id` and `folder_id`
**Current**: Frontend uses `folder_id`, backend queries use `_id`
**Pattern**: Keep both for compatibility

### 3. User Reference Fields
**Issue**: Some collections use `user_id`, some use `username`, some use both
**Pattern**: 
- Store `user_id` (FK to users._id) for queries
- Store `username` for display/denormalization
- Use BOTH when needed for different query patterns

---

## 📊 API NAMING PATTERNS

### Established Patterns
```
/api/auth/*              # Authentication
/api/videos/*            # Video operations
/api/folders/*           # Folder operations
/api/@/{username}/*      # Public showcase
/api/verify/*            # Verification
```

### HTTP Methods
- `POST` - Create new resource
- `GET` - Retrieve resource(s)
- `PUT` - Update entire resource
- `PATCH` - Update partial resource
- `DELETE` - Remove resource

### Response Patterns
```python
# Success
{"message": "Success message", ...data}

# Error  
{"detail": "Error message"}

# List
[{item1}, {item2}, ...]
```

---

## 🎯 TESTING STATUS

### Currently Testable
✅ User authentication (BrianJames / Brian123!)
✅ Video upload with watermarking
✅ Folder creation and management
✅ Code-based verification
✅ Duplicate detection

### Needs Implementation Before Testing
❌ Video playback
❌ Deep verification (tamper detection)
❌ Tier upgrades
❌ Storage expiration handling
❌ Video streaming

---

## 🔧 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1: Core Video Features (Priority)
1. Video streaming endpoint
2. Video player component  
3. Tier management API

### Phase 2: Verification System
4. Deep verification API
5. Hash comparison logic with confidence scoring
6. Verification result display improvements

### Phase 3: Storage Management
7. Storage extension API
8. Expiration warnings
9. Cleanup expired videos

---

## 💾 CURRENT DATA STATE

### BrianJames Account
- User ID: `85da75de-0905-4ab6-b3c2-fd37e593b51e`
- Premium Tier: `enterprise`
- Videos: 3 uploaded
- Folders: 2 ("Default", "does this work?")

### Video Storage
- Location: `/app/backend/uploads/videos/`
- Thumbnails: `/app/backend/uploads/thumbnails/`
- All videos have watermarks applied

---

## 📝 IMPLEMENTATION GUIDELINES

### Follow These Patterns:

1. **User Reference**: Always use `current_user["user_id"]`
2. **Video Queries**: Filter by `user_id` = user's `_id`
3. **Folder Queries**: Filter by `username` (established pattern)
4. **IDs**: Create both `_id` and `{resource}_id` fields
5. **Timestamps**: Use ISO format via `datetime.now().isoformat()`
6. **Trailing Slashes**: Always use `/api/resource/` for consistency
7. **Authentication**: Always use `Depends(get_current_user)`

### DON'T:
- ❌ Create `user_id` field in users collection
- ❌ Use different naming conventions
- ❌ Skip authentication on private endpoints
- ❌ Hardcode paths or URLs
- ❌ Change existing working patterns

---

## ✅ AUDIT COMPLETE

**Next Steps**: Implement missing features following exact patterns documented above.

**Confidence Level**: HIGH - Patterns are consistent and well-established.
