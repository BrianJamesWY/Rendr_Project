# RENDR Platform - Master Reference Document
**Last Updated:** December 9, 2025  
**Purpose:** Comprehensive guide for all future development to prevent confusion, duplicates, and wasted time

---

## 🏗️ CRITICAL ARCHITECTURE OVERVIEW

### Tech Stack
- **Frontend:** React (port 3000) - `/app/frontend/`
- **Backend:** FastAPI (port 8001) - `/app/backend/`
- **Database:** MongoDB (port 27017) - Database name: `rendr`
- **Process Manager:** Supervisor
- **Environment:** Kubernetes container with hot reload

### Environment Variables
**Frontend** (`/app/frontend/.env`):
```
REACT_APP_BACKEND_URL=https://videoproof-1.preview.emergentagent.com
```

**Backend** (`/app/backend/.env`):
```
MONGO_URL=mongodb://localhost:27017
JWT_SECRET=[key]
EMERGENT_UNIVERSAL_KEY=[key]
```

**⚠️ NEVER HARDCODE URLS OR CREDENTIALS - ALWAYS USE ENV VARS**

---

## 📁 COMPLETE FILE STRUCTURE

### Backend Services (`/app/backend/services/`)

| File Name | Purpose | Key Functions | Import Pattern |
|-----------|---------|---------------|----------------|
| `video_processor.py` | Legacy video processing | `generate_verification_code()`, `extract_thumbnail()` | `from services.video_processor import video_processor` |
| `enhanced_video_processor.py` | Duplicate detection | `smart_duplicate_detection()` | `from services.enhanced_video_processor import enhanced_processor` |
| `comprehensive_hash_service.py` | All hashing (SHA-256, pHash, audio, metadata) | `calculate_all_hashes()`, `_calculate_file_sha256()` | `from services.comprehensive_hash_service import comprehensive_hash_service` |
| `c2pa_service.py` | C2PA manifest creation | `create_manifest()`, `save_manifest()`, `verify_manifest()` | `from services.c2pa_service import c2pa_service` |
| `watermark.py` | Video watermarking | `apply_watermark()` | `from services.watermark import watermark_processor` |
| `blockchain_service.py` | Blockchain timestamping | `timestamp_video()` | `from services.blockchain_service import blockchain_service` |
| `notification_service.py` | Email/SMS notifications | `send_video_ready_notification()` | `from services.notification_service import notification_service` |
| `async_video_processor.py` | Background processing (LEGACY - use redis_queue_service instead) | `queue_video_processing()` | `from services.async_video_processor import async_video_processor` |
| `resubmission_prevention.py` | Strike/ban system | `check_user_status()`, `record_duplicate_attempt()` | `from services.resubmission_prevention import resubmission_prevention` |
| `redis_queue_service.py` | Redis Queue management | `enqueue_video_processing()`, `get_job_status()` | `from services.redis_queue_service import redis_queue_service` |
| `background_tasks.py` | Worker tasks (run by RQ workers) | `process_video_hashes()`, `cleanup_expired_videos()` | Direct execution by workers |

### Backend API Routes (`/app/backend/api/`)

| File Name | Router Prefix | Purpose | Auth Required |
|-----------|---------------|---------|---------------|
| `auth.py` | `/api/auth` | Login, signup, user management | Mixed |
| `videos.py` | `/api/videos` | Video upload, list, watch, delete | Yes |
| `verification.py` | `/api/verify` | Code & deep verification | No |
| `folders.py` | `/api/folders` | Folder CRUD | Yes |
| `showcase.py` | `/api/@` or `/api/showcase` | Public creator profiles | No |
| `analytics.py` | `/api/analytics` | User analytics | Yes |
| `admin_analytics.py` | `/api/admin` | Investor/CEO dashboards | Role-based |
| `bounties.py` | `/api/bounties` | Bounty system | Mixed |
| `admin.py` | `/api/admin` | Admin functions | Admin only |
| `diagnostics.py` | `/api/diagnostics` | System health | No |

**⚠️ CRITICAL: All backend routes use `/api` prefix for Kubernetes routing**

### Backend Utilities (`/app/backend/utils/`)

| File Name | Purpose | Import Pattern |
|-----------|---------|----------------|
| `security.py` | JWT auth, get_current_user | `from utils.security import get_current_user` |

**❌ WRONG:** `from auth.security import get_current_user`  
**✅ CORRECT:** `from utils.security import get_current_user`

### Backend Models (`/app/backend/models/`)

| File Name | Key Models |
|-----------|------------|
| `video.py` | `VideoUploadResponse`, `VerificationResult`, `VerificationCodeRequest` |
| `folder.py` | Folder models |

### Frontend Pages (`/app/frontend/src/pages/`)

| File Name | Route | Purpose |
|-----------|-------|---------|
| `CreatorLogin.js` | `/creator-login` | Login page |
| `Dashboard.js` | `/dashboard` | Main dashboard |
| `Upload.js` | `/upload` | Video upload |
| `Verify.js` | `/verify` | Verification lookup |
| `UnifiedEditor.js` | `/editor` | Profile & content editor |
| `Showcase.js` | `/:username` | Public creator page |

### Frontend Components (`/app/frontend/src/components/`)

| File Name | Purpose | Usage |
|-----------|---------|-------|
| `Navigation.js` | Top nav bar | All pages |
| `EditVideoModal.js` | Video editing modal | Dashboard |
| `EditFolderModal.js` | Folder editing modal | Dashboard |
| `DirectoryTree.js` | Folder/video tree | UnifiedEditor, Modals |
| `VideoProcessingStatus.js` | Real-time upload progress | Upload page |

---

## 🗄️ DATABASE SCHEMA

### MongoDB Collections

**users** - User accounts
```javascript
{
  _id: ObjectId,
  user_id: String (UUID),
  username: String,
  email: String,
  password_hash: String,
  tier: "free" | "pro" | "enterprise",
  roles: ["creator", "investor", "ceo", "admin"],
  created_at: DateTime,
  profile: {
    profilePic: String,
    bio: String,
    social_links: Array
  }
}
```

**videos** - All uploaded videos
```javascript
{
  _id: String (video_id),
  id: String (video_id),
  user_id: String (UUID),
  verification_code: String (RND-XXXXXX),
  uploaded_at: DateTime,
  
  // Comprehensive hashing
  comprehensive_hashes: {
    original_sha256: String,
    watermarked_sha256: String,
    key_frame_hashes: [String],
    perceptual_hashes: [String],
    audio_hash: String,
    metadata_hash: String,
    master_hash: String,
    video_metadata: Object
  },
  
  // C2PA
  c2pa_manifest: {
    manifest_path: String,
    manifest_data: Object,
    created_at: DateTime
  },
  
  // Storage
  storage: {
    tier: String,
    uploaded_at: DateTime,
    expires_at: DateTime | null
  },
  
  // Metadata
  title: String,
  description: String,
  thumbnail_path: String,
  folder_id: String,
  social_media_links: [{platform, icon, url}],
  blockchain_signature: Object,
  verification_status: String,
  is_public: Boolean,
  on_showcase: Boolean
}
```

**folders** - Content organization
```javascript
{
  _id: String (folder_id),
  id: String (folder_id),
  user_id: String (UUID),
  name: String,
  parent_id: String | null,
  thumbnail_url: String,
  background_url: String,
  description: String
}
```

**verification_attempts** - Verification lookup log
```javascript
{
  _id: String (UUID),
  video_id: String,
  verification_code: String,
  verification_type: "code" | "deep",
  result: String,
  timestamp: DateTime
}
```

**resubmission_tracking** - User strikes/bans
```javascript
{
  user_id: String (UUID),
  total_strikes: Number,
  strikes: [{reason, details, timestamp}],
  ban_status: "none" | "temporary" | "permanent",
  ban_expires_at: DateTime | null,
  created_at: DateTime,
  updated_at: DateTime
}
```

**duplicate_attempts** - Resubmission attempts
```javascript
{
  user_id: String (UUID),
  video_hash: String,
  attempt_fingerprint: String,
  original_owner_id: String,
  original_verification_code: String,
  attempted_at: DateTime,
  is_repeat: Boolean
}
```

---

## 🔌 CRITICAL API ENDPOINTS

### Video Upload & Management

**POST `/api/videos/upload`**
- Params: `video_file` (multipart), `folder_id` (optional)
- Auth: Required
- Returns: Video ID, verification code, hashes, C2PA info
- Flow:
  1. Check user ban status
  2. Calculate original SHA-256
  3. Smart duplicate detection
  4. If duplicate: Record attempt, add strike if not owner
  5. If new: Generate code, watermark, calculate all hashes, create C2PA manifest

**GET `/api/videos/{video_id}/status`**
- Auth: Required (owner only)
- Returns: Processing stage, progress %, verification layers

**GET `/api/videos/user/list`**
- Auth: Required
- Returns: All user's videos

### Verification

**POST `/api/verify/code`**
- Body: `{verification_code: String}`
- Auth: Not required
- Returns: Video info, creator info, social media links

**File:** `/app/backend/api/verification.py` (NOT verify.py!)

### Analytics

**GET `/api/admin/investor/dashboard?days=30`**
- Auth: investor, ceo, or admin role
- Returns: Platform metrics, growth stats

**GET `/api/admin/ceo/dashboard`**
- Auth: CEO role only
- Returns: All investor data + moderation stats + system health

---

## 🎨 FRONTEND CONVENTIONS

### Import Patterns
```javascript
// Backend URL - ALWAYS use env variable
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// NOT this:
const BACKEND_URL = 'https://videoproof-1.preview.emergentagent.com';
```

### Component Props

**DirectoryTree**
```javascript
<DirectoryTree
  username={username}
  selectedItemId={id}
  onItemSelect={(item) => {...}}
  onTreeUpdate={() => {...}}
  containerHeight="300px"
  showLayoutToggle={false}
/>
```

**VideoProcessingStatus**
```javascript
<VideoProcessingStatus
  videoId={videoId}
  onComplete={(status) => {...}}
/>
```

---

## ⚙️ SUPERVISOR & SERVICES

### Service Management
```bash
# Check status
sudo supervisorctl status

# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/backend.out.log
```

### When to Restart
- ✅ After `.env` file changes
- ✅ After installing new dependencies
- ❌ NOT after regular code changes (hot reload handles it)

---

## 🚨 COMMON MISTAKES & HOW TO AVOID

### 1. Wrong Import Paths
**❌ WRONG:**
```python
from auth.security import get_current_user  # NO auth/ directory!
from api.verify import router  # File is verification.py not verify.py!
```

**✅ CORRECT:**
```python
from utils.security import get_current_user
from api.verification import router
```

### 2. File Names
- Verification routes: `verification.py` (NOT verify.py)
- Security utils: `utils/security.py` (NOT auth/security.py)

### 3. MongoDB Field Access
**Always exclude `_id` when querying:**
```python
# CORRECT
video = await db.videos.find_one({"id": video_id}, {"_id": 0})
user = await db.users.find_one({"user_id": user_id}, {"_id": 0})

# WRONG - causes ObjectId serialization errors
video = await db.videos.find_one({"id": video_id})
```

### 4. Environment Variables
**Never hardcode:**
```python
# WRONG
BACKEND_URL = "https://videoproof-1.preview.emergentagent.com"

# CORRECT
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
```

### 5. Route Prefixes
All backend routes MUST have `/api` prefix for Kubernetes routing:
```python
app.include_router(videos.router, prefix="/api/videos")  # ✅
app.include_router(videos.router, prefix="/videos")      # ❌
```

---

## 🔍 VERIFICATION SYSTEM ARCHITECTURE

### Multi-Layered Verification (Current Implementation)

**Layer 1: Original SHA-256** (Pre-watermark)
- Purpose: Detect exact duplicate uploads
- Function: `comprehensive_hash_service._calculate_file_sha256()`

**Layer 2: Watermark Application**
- Service: `watermark_processor.apply_watermark()`
- Adds username, verification code, tier badge

**Layer 3: Watermarked SHA-256** (Post-watermark)
- Purpose: Track final distributed version
- Same function as Layer 1, different file

**Layer 4: Key Frame Hashes** (10 frames)
- Purpose: Detect pristine original content
- Evenly spaced SHA-256 of individual frames

**Layer 5: Perceptual Hashes** (Pro/Enterprise)
- Purpose: Survive compression, detect similar content
- Uses DCT-based pHash (16x16)
- **87-92% similarity after compression**

**Layer 6: Audio Hash** (Enterprise only)
- Purpose: Audio fingerprinting
- Uses Chromaprint or similar

**Layer 7: Metadata Hash**
- Purpose: Detect metadata tampering
- SHA-256 of ffprobe output

**Layer 8: C2PA Manifest**
- Purpose: Industry-standard provenance
- Creates JSON manifest with all assertions
- Stored as sidecar `.c2pa` file

**Master Hash**
- Combined SHA-256 of all verification layers

---

## 🔐 SECURITY & MODERATION

### Strike System (Resubmission Prevention)
- 3 strikes = Warning
- 5 strikes = 24-hour temporary ban
- 10 strikes = Permanent ban

### Strike Triggers
1. Uploading someone else's verified video (non-owner duplicate)
2. Repeat attempts of same video = 1 strike (not multiple)

### Ban Enforcement
- Checked at upload time (before any processing)
- Blocks with HTTP 403 + detailed error
- Temporary bans auto-expire

---

## 🎯 TESTING CHECKLIST

### Before Calling Testing Agent
1. ✅ Check backend logs for errors: `tail -f /var/log/supervisor/backend.err.log`
2. ✅ Test auth endpoint: `curl http://localhost:8001/api/auth/login`
3. ✅ Verify supervisor status: `sudo supervisorctl status`
4. ✅ Check for import errors in new files
5. ✅ Validate MongoDB connection

### When to Use Testing Agent
- After completing a phase or major feature
- When user reports broken functionality
- Before finishing a task
- When fixing recurring bugs
- For integration testing

### Testing Agent Commands
```python
# Backend testing
deep_testing_backend_v2("Test video upload with all verification layers...")

# Frontend testing  
auto_frontend_testing_agent("Test dashboard video display and editing modals...")

# Troubleshooting
troubleshoot_agent("Backend failing to start, import errors in new module...")
```

---

## 📝 DEVELOPMENT WORKFLOW

### Starting Point
1. Read handoff summary thoroughly
2. Check this MASTER_REFERENCE.md
3. Review `/app/test_result.md` for latest test status
4. Check TODO.md for priorities

### Making Changes
1. View files before editing (verify exact structure)
2. Use correct import paths (check this doc!)
3. Test incrementally (don't wait until end)
4. Update TODO.md as you complete tasks

### Before Finishing
1. Test with testing agent
2. Check for console errors
3. Verify all flows work end-to-end
4. Update TODO.md
5. Create clear handoff summary

---

## 🆘 QUICK FIXES

### Backend Won't Start
```bash
# Check error logs
tail -n 50 /var/log/supervisor/backend.err.log

# Common causes:
# 1. Import error - check module names
# 2. Syntax error - check recent edits
# 3. Missing dependency - check requirements.txt

# Fix and restart
sudo supervisorctl restart backend
```

### Login Not Working
```bash
# Test backend directly
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"BrianJames","password":"Brian123!"}'

# If backend works but frontend doesn't:
# 1. Check REACT_APP_BACKEND_URL in .env
# 2. Check supervisor config (/etc/supervisor/conf.d/supervisord.conf)
# 3. Restart frontend: sudo supervisorctl restart frontend
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
sudo supervisorctl status mongodb

# Test connection
mongosh --eval "db.adminCommand('ping')"

# Check MONGO_URL in backend/.env
```

---

## 📚 RESOURCES

### External Libraries
- **C2PA:** `c2pa-python` (v0.27.1) - https://opensource.contentauthenticity.org/docs/c2pa-python/
- **FFmpeg:** For video processing (already installed)
- **Perceptual Hashing:** `imagehash` library with DCT

### Key Documentation Files
- `/app/TODO.md` - Task tracking
- `/app/test_result.md` - Testing history
- `/app/MASTER_REFERENCE.md` - This document

---

## 🔄 UPDATING THIS DOCUMENT

**When to update:**
- New services created
- New API endpoints added
- Database schema changes
- New frontend components
- Architecture changes
- Common mistakes discovered

**How to update:**
- Add to appropriate section
- Update "Last Updated" date
- Keep formatting consistent
- Be specific and detailed

---

## 💡 TIPS FOR NEXT AGENT

1. **Always check file names before importing** - verification.py NOT verify.py
2. **Use utils.security NOT auth.security** - No auth/ directory exists
3. **Exclude _id from MongoDB queries** - {"_id": 0} prevents serialization errors
4. **Never hardcode URLs** - Always use environment variables
5. **Test early and often** - Don't wait until end to test
6. **Read error logs carefully** - They usually tell you exactly what's wrong
7. **Check this document first** - Before searching for files or patterns
8. **Update TODO.md** - Keep track of progress
9. **Use troubleshoot_agent** - After 3 failed attempts at anything
10. **Ask user for clarification** - Better than making wrong assumptions

---

**END OF MASTER REFERENCE - Keep this updated!**
