# RENDR BACKEND DEVELOPMENT PLAN
## Weeks 2-3: Complete Backend API + Verify Portal

---

## 📋 TABLE OF CONTENTS

1. [System Architecture Overview](#system-architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints Specification](#api-endpoints-specification)
5. [Backend File Structure](#backend-file-structure)
6. [Core Backend Implementation](#core-backend-implementation)
7. [Frontend (Verify Portal) Structure](#frontend-verify-portal-structure)
8. [Implementation Phases](#implementation-phases)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
├───────────────┬──────────────────┬─────────────────────────┤
│ Rendr Bodycam │  Rendr Studio    │   Rendr Verify         │
│  (Mobile App) │  (Web Upload)    │   (Web Portal)         │
│   React Native│     React        │      React             │
└───────┬───────┴────────┬─────────┴──────────┬──────────────┘
        │                │                     │
        └────────────────┼─────────────────────┘
                         │
                    HTTP/REST API
                         │
        ┌────────────────▼─────────────────────┐
        │      BACKEND API SERVER (FastAPI)     │
        ├───────────────────────────────────────┤
        │  • Authentication & User Management   │
        │  • Video Upload & Processing          │
        │  • Perceptual Hash Generation         │
        │  • Blockchain Signature Creation      │
        │  • Verification Logic                 │
        └────────┬──────────────┬────────────────┘
                 │              │
        ┌────────▼──────┐  ┌────▼──────────┐
        │   MongoDB     │  │ Polygon Amoy  │
        │   Database    │  │  Blockchain   │
        │               │  │  (Testnet)    │
        └───────────────┘  └───────────────┘
```

---

## TECHNOLOGY STACK

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: MongoDB (via Motor - async driver)
- **Video Processing**: OpenCV, ImageHash, Pillow
- **Blockchain**: Web3.py (Polygon Amoy)
- **Authentication**: JWT tokens
- **File Storage**: Local filesystem (POC), AWS S3 (future premium tier)

### Frontend (Verify Portal)
- **Framework**: React 18+
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router

### Infrastructure
- **Environment**: Docker containers (existing setup)
- **Web Server**: Uvicorn (ASGI server)
- **CORS**: Enabled for frontend communication

---

## DATABASE SCHEMA

### Collection: `users`
```javascript
{
  "_id": "uuid-string",
  "email": "user@example.com",
  "password_hash": "bcrypt-hash",
  "display_name": "John Doe",
  "account_type": "free" | "premium",
  "wallet_address": "0x...",  // Optional, for blockchain
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

### Collection: `videos`
```javascript
{
  "_id": "uuid-string",
  "user_id": "uuid-string",  // Reference to users
  "source": "bodycam" | "studio",
  "
_code": "RND-ABC123",  // Unique 10-char verification code
  
  // Video metadata
  "filename": "video_2025_01_15.mp4",
  "duration_seconds": 15.5,
  "fps": 30.0,
  "total_frames": 465,
  "file_size_bytes": 2458000,
  "resolution": "1920x1080",
  
  // Verification data
  "perceptual_hash": {
    "combined_hash": "f7d641c03a2dcc1d...",  // Full hash
    "frame_hashes": ["f7d641c...", "f48443c..."],  // Individual frames
    "num_frames_sampled": 10,
    "algorithm": "phash",
    "hash_size": 8
  },
  
  // Bodycam-specific metadata (optional)
  "sensor_data": {
    "gps_coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "accuracy_meters": 10
    },
    "accelerometer": [...],
    "gyroscope": [...],
    "compass_heading": 270
  },
  
  // Blockchain signature
  "blockchain_signature": {
    "tx_hash": "0xabc123...",
    "block_number": 12345678,
    "chain_id": 80002,  // Polygon Amoy
    "timestamp": "2025-01-15T10:30:00Z",
    "explorer_url": "https://amoy.polygonscan.com/tx/0xabc123...",
    "gas_used": 50000,
    "status": "confirmed" | "pending" | "failed"
  },
  
  // Status
  "verification_status": "verified" | "pending" | "failed",
  "is_public": true,  // For showcase page
  
  // Timestamps
  "captured_at": "2025-01-15T10:25:00Z",  // When video was recorded
  "uploaded_at": "2025-01-15T10:30:00Z",
  "verified_at": "2025-01-15T10:31:00Z",
  
  // Optional: File storage (premium tier)
  "file_url": null  // S3 URL if premium
}
```

### Collection: `verification_attempts`
```javascript
{
  "_id": "uuid-string",
  "video_id": "uuid-string",  // Reference to videos
  "verification_code": "RND-ABC123",  // Code entered by user
  "verification_type": "code" | "deep",  // Code lookup or file upload
  
  // For deep verification
  "uploaded_file_hash": "e3b53c0a6d075ed0...",  // Hash of uploaded file
  "similarity_score": 95.5,  // Percentage match
  "frame_comparison": [
    {"frame": 1, "similarity": 100.0, "distance": 0},
    {"frame": 2, "similarity": 96.0, "distance": 2}
  ],
  
  // Result
  "result": "authentic" | "tampered" | "not_found",
  "confidence_level": "high" | "medium" | "low",
  
  // Metadata
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "timestamp": "2025-01-15T11:00:00Z"
}
```

### Collection: `showcase_videos` (Studio)
```javascript
{
  "_id": "uuid-string",
  "user_id": "uuid-string",
  "video_id": "uuid-string",  // Reference to videos
  
  // Showcase metadata
  "title": "My Latest Project",
  "description": "Behind the scenes footage...",
  "thumbnail_url": "/uploads/thumbnails/abc123.jpg",
  "tags": ["documentary", "behind-the-scenes"],
  
  // Display settings
  "is_featured": false,
  "view_count": 1234,
  "showcase_order": 1,
  
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

## API ENDPOINTS SPECIFICATION

### Base URL
```
Development: http://localhost:8001/api
Production: https://rendrtruth.com/api
```

---

### **AUTHENTICATION ENDPOINTS**

#### `POST /api/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "display_name": "John Doe"
}
```

**Response (201):**
```json
{
  "user_id": "uuid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "token": "jwt-token-here"
}
```

---

#### `POST /api/auth/login`
Authenticate user and get JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user_id": "uuid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "token": "jwt-token-here",
  "account_type": "free"
}
```

---

#### `GET /api/auth/me`
Get current user info (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "user_id": "uuid-123",
  "email": "user@example.com",
  "display_name": "John Doe",
  "account_type": "free",
  "wallet_address": "0x123...",
  "created_at": "2025-01-15T10:30:00Z"
}
```

---

### **VIDEO UPLOAD & VERIFICATION ENDPOINTS**

#### `POST /api/videos/upload`
Upload video for verification (Bodycam or Studio).

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
video_file: [binary video file]
source: "bodycam" | "studio"
sensor_data: [JSON string, optional for bodycam]
```

**Response (202 Accepted):**
```json
{
  "video_id": "uuid-456",
  "verification_code": "RND-ABC123",
  "status": "processing",
  "message": "Video uploaded successfully. Processing..."
}
```

---

#### `GET /api/videos/{video_id}/status`
Check processing status of uploaded video.

**Response (200):**
```json
{
  "video_id": "uuid-456",
  "status": "verified",
  "verification_code": "RND-ABC123",
  "blockchain_tx": "0xabc123...",
  "explorer_url": "https://amoy.polygonscan.com/tx/0xabc123...",
  "verified_at": "2025-01-15T10:31:00Z"
}
```

---

#### `POST /api/verify/code`
Verify video by entering verification code.

**Request:**
```json
{
  "verification_code": "RND-ABC123"
}
```

**Response (200):**
```json
{
  "result": "authentic",
  "video_id": "uuid-456",
  "verification_code": "RND-ABC123",
  "metadata": {
    "captured_at": "2025-01-15T10:25:00Z",
    "verified_at": "2025-01-15T10:31:00Z",
    "duration_seconds": 15.5,
    "source": "bodycam",
    "blockchain_tx": "0xabc123...",
    "gps_coordinates": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }
}
```

---

#### `POST /api/verify/deep`
Deep verification by uploading video file for comparison.

**Request (Form Data):**
```
video_file: [binary video file]
verification_code: "RND-ABC123"
```

**Response (200):**
```json
{
  "result": "authentic",
  "similarity_score": 95.5,
  "confidence_level": "high",
  "frame_comparison": [
    {"frame": 1, "similarity": 100.0, "distance": 0},
    {"frame": 2, "similarity": 96.0, "distance": 2}
  ],
  "analysis": "Video matches original signature. Minor compression artifacts detected.",
  "metadata": {
    "captured_at": "2025-01-15T10:25:00Z",
    "blockchain_tx": "0xabc123..."
  }
}
```

**Response if tampered (200):**
```json
{
  "result": "tampered",
  "similarity_score": 35.0,
  "confidence_level": "high",
  "frame_comparison": [
    {"frame": 1, "similarity": 100.0, "distance": 0},
    {"frame": 5, "similarity": 20.0, "distance": 40},
    {"frame": 6, "similarity": 18.0, "distance": 41}
  ],
  "analysis": "Significant differences detected. Video appears to be edited.",
  "tampered_frames": [5, 6, 7, 8]
}
```

---

#### `GET /api/videos/user/{user_id}`
Get all videos for a user (requires authentication).

**Response (200):**
```json
{
  "videos": [
    {
      "video_id": "uuid-456",
      "verification_code": "RND-ABC123",
      "source": "bodycam",
      "captured_at": "2025-01-15T10:25:00Z",
      "status": "verified",
      "blockchain_tx": "0xabc123..."
    }
  ],
  "total": 1
}
```

---

### **STUDIO / SHOWCASE ENDPOINTS**

#### `POST /api/showcase/add`
Add video to public showcase (Studio users).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request:**
```json
{
  "video_id": "uuid-456",
  "title": "My Documentary",
  "description": "Behind the scenes...",
  "tags": ["documentary", "2025"]
}
```

**Response (201):**
```json
{
  "showcase_id": "uuid-789",
  "public_url": "https://rendrtruth.com/showcase/username/uuid-789"
}
```

---

#### `GET /api/showcase/{username}`
Get public showcase for a creator.

**Response (200):**
```json
{
  "creator": {
    "display_name": "John Doe",
    "bio": "Documentary filmmaker",
    "verified_videos_count": 15
  },
  "videos": [
    {
      "showcase_id": "uuid-789",
      "title": "My Documentary",
      "description": "Behind the scenes...",
      "thumbnail_url": "/uploads/thumbnails/abc123.jpg",
      "verification_code": "RND-ABC123",
      "verified_at": "2025-01-15T10:31:00Z",
      "view_count": 1234
    }
  ]
}
```

---

## BACKEND FILE STRUCTURE

```
/app/backend/
├── server.py                    # Main FastAPI application
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables
│
├── api/                         # API route handlers
│   ├── __init__.py
│   ├── auth.py                  # Authentication routes
│   ├── videos.py                # Video upload/management routes
│   ├── verification.py          # Verification routes
│   └── showcase.py              # Showcase/Studio routes
│
├── services/                    # Business logic
│   ├── __init__.py
│   ├── auth_service.py          # JWT, password hashing
│   ├── video_processor.py       # Video analysis, hash generation
│   ├── blockchain_service.py    # Polygon interaction
│   ├── verification_service.py  # Verification logic
│   └── storage_service.py       # File storage handling
│
├── models/                      # Pydantic models
│   ├── __init__.py
│   ├── user.py                  # User models
│   ├── video.py                 # Video models
│   ├── verification.py          # Verification models
│   └── showcase.py              # Showcase models
│
├── database/                    # Database connection
│   ├── __init__.py
│   └── mongodb.py               # MongoDB client setup
│
├── utils/                       # Utility functions
│   ├── __init__.py
│   ├── security.py              # Password hashing, JWT
│   ├── validators.py            # Input validation
│   └── helpers.py               # General helpers
│
└── uploads/                     # Temporary file storage
    ├── videos/                  # Uploaded videos (temp)
    └── thumbnails/              # Video thumbnails
```

---

## CORE BACKEND IMPLEMENTATION

### 1. `server.py` - Main Application

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api import auth, videos, verification, showcase
from database.mongodb import connect_db, close_db

app = FastAPI(
    title="Rendr API",
    description="Video verification platform API",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database lifecycle
@app.on_event("startup")
async def startup():
    await connect_db()
    print("✅ Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown():
    await close_db()
    print("👋 Closed MongoDB connection")

# Mount static files for thumbnails
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(verification.router, prefix="/api/verify", tags=["Verification"])
app.include_router(showcase.router, prefix="/api/showcase", tags=["Showcase"])

@app.get("/")
async def root():
    return {
        "message": "Rendr API",
        "version": "0.1.0",
        "status": "online"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

---

### 2. `database/mongodb.py` - Database Connection

```python
from motor.motor_asyncio import AsyncIOMotorClient
import os

client = None
db = None

async def connect_db():
    global client, db
    mongodb_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.rendr_db
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.videos.create_index("verification_code", unique=True)
    await db.videos.create_index("user_id")
    
    return db

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
```

---

### 3. `services/video_processor.py` - Video Processing & Hashing

```python
import cv2
import imagehash
from PIL import Image
import uuid
from datetime import datetime
from typing import Dict, List

class VideoProcessor:
    
    @staticmethod
    def extract_frames(video_path: str, num_frames: int = 10) -> List[Image.Image]:
        """Extract evenly spaced frames from video"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps
        
        frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
        frames = []
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)
                frames.append(pil_image)
        
        cap.release()
        
        return frames, {
            "total_frames": total_frames,
            "fps": fps,
            "duration_seconds": duration
        }
    
    @staticmethod
    def calculate_perceptual_hash(frames: List[Image.Image]) -> Dict:
        """Calculate perceptual hash for video"""
        hashes = []
        
        for frame in frames:
            frame_hash = imagehash.phash(frame, hash_size=8)
            hashes.append(str(frame_hash))
        
        combined = ''.join(hashes)
        
        return {
            "combined_hash": combined,
            "frame_hashes": hashes,
            "num_frames": len(hashes),
            "algorithm": "phash",
            "hash_size": 8
        }
    
    @staticmethod
    def compare_hashes(original_hash: Dict, new_hash: Dict) -> Dict:
        """Compare two video hashes"""
        if len(original_hash['frame_hashes']) != len(new_hash['frame_hashes']):
            return {
                "similarity_score": 0.0,
                "confidence_level": "low",
                "result": "tampered"
            }
        
        matches = 0
        total = len(original_hash['frame_hashes'])
        frame_comparison = []
        
        for i, (h1, h2) in enumerate(zip(original_hash['frame_hashes'], new_hash['frame_hashes'])):
            hash1_obj = imagehash.hex_to_hash(h1)
            hash2_obj = imagehash.hex_to_hash(h2)
            distance = hash1_obj - hash2_obj
            
            similarity = max(0, 100 - (distance * 2))
            
            if similarity >= 90:
                matches += 1
            
            frame_comparison.append({
                "frame": i + 1,
                "similarity": similarity,
                "distance": distance
            })
        
        overall_similarity = (matches / total) * 100
        
        # Determine result
        if overall_similarity >= 85:
            result = "authentic"
            confidence = "high"
        elif overall_similarity >= 70:
            result = "authentic"
            confidence = "medium"
        else:
            result = "tampered"
            confidence = "high"
        
        return {
            "similarity_score": overall_similarity,
            "confidence_level": confidence,
            "result": result,
            "frame_comparison": frame_comparison
        }
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate unique verification code (RND-XXXXXX)"""
        import random
        import string
        chars = string.ascii_uppercase + string.digits
        code = ''.join(random.choices(chars, k=6))
        return f"RND-{code}"
```

---

### 4. `services/blockchain_service.py` - Polygon Integration

```python
from web3 import Web3
import json
import os
from datetime import datetime
from typing import Dict, Optional

class BlockchainService:
    
    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology/")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        self.chain_id = 80002  # Polygon Amoy
        
        # For production, use environment variable
        # For POC, this would be set per-user or app-level wallet
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY")
    
    def is_connected(self) -> bool:
        """Check blockchain connection"""
        return self.w3.is_connected()
    
    async def write_signature(self, video_id: str, perceptual_hash: str) -> Optional[Dict]:
        """Write video signature to blockchain"""
        
        if not self.private_key:
            raise ValueError("Blockchain private key not configured")
        
        try:
            # Get account from private key
            account = self.w3.eth.account.from_key(self.private_key)
            address = account.address
            
            # Prepare data to store (truncated hash + metadata)
            data_to_store = json.dumps({
                'videoId': video_id,
                'videoHash': perceptual_hash[:64],  # Truncate for cost
                'timestamp': datetime.now().isoformat(),
                'app': 'Rendr',
                'version': '0.1.0'
            })
            
            # Convert to hex
            data_hex = '0x' + data_to_store.encode('utf-8').hex()
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(address)
            
            transaction = {
                'nonce': nonce,
                'to': address,  # Sending to self
                'value': 0,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'data': data_hex,
                'chainId': self.chain_id
            }
            
            # Estimate gas
            gas_estimate = self.w3.eth.estimate_gas(transaction)
            transaction['gas'] = int(gas_estimate * 1.2)
            
            # Sign and send
            signed_txn = self.w3.eth.account.sign_transaction(transaction, self.private_key)
            tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
            tx_hash_hex = self.w3.to_hex(tx_hash)
            
            # Wait for confirmation (with timeout)
            tx_receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            if tx_receipt['status'] == 1:
                return {
                    'tx_hash': tx_hash_hex,
                    'block_number': tx_receipt['blockNumber'],
                    'gas_used': tx_receipt['gasUsed'],
                    'explorer_url': f"https://amoy.polygonscan.com/tx/{tx_hash_hex}",
                    'timestamp': datetime.now().isoformat(),
                    'status': 'confirmed'
                }
            else:
                return None
                
        except Exception as e:
            print(f"Blockchain error: {e}")
            return None
    
    async def read_signature(self, tx_hash: str) -> Optional[Dict]:
        """Read video signature from blockchain"""
        try:
            tx = self.w3.eth.get_transaction(tx_hash)
            
            data_hex = tx['input']
            if data_hex and data_hex != '0x':
                data_bytes = bytes.fromhex(data_hex[2:])
                data_str = data_bytes.decode('utf-8')
                data_json = json.loads(data_str)
                
                return data_json
            return None
            
        except Exception as e:
            print(f"Error reading blockchain: {e}")
            return None
```

---

### 5. `api/videos.py` - Video Upload Routes

```python
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from typing import Optional
import uuid
import os
import shutil
from datetime import datetime

from services.video_processor import VideoProcessor
from services.blockchain_service import BlockchainService
from database.mongodb import get_db
from utils.security import get_current_user

router = APIRouter()
video_processor = VideoProcessor()
blockchain_service = BlockchainService()

@router.post("/upload")
async def upload_video(
    video_file: UploadFile = File(...),
    source: str = Form(...),  # "bodycam" or "studio"
    sensor_data: Optional[str] = Form(None),  # JSON string
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Upload and process video for verification"""
    
    # Validate source
    if source not in ["bodycam", "studio"]:
        raise HTTPException(400, "Invalid source. Must be 'bodycam' or 'studio'")
    
    # Generate video ID and verification code
    video_id = str(uuid.uuid4())
    verification_code = video_processor.generate_verification_code()
    
    # Save uploaded file temporarily
    upload_dir = "uploads/videos"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{video_id}_{video_file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    try:
        # Extract frames and calculate hash
        frames, video_metadata = video_processor.extract_frames(file_path)
        perceptual_hash = video_processor.calculate_perceptual_hash(frames)
        
        # Write signature to blockchain
        blockchain_result = await blockchain_service.write_signature(
            video_id,
            perceptual_hash['combined_hash']
        )
        
        if not blockchain_result:
            raise HTTPException(500, "Failed to write blockchain signature")
        
        # Parse sensor data if provided
        import json
        sensor_data_parsed = json.loads(sensor_data) if sensor_data else None
        
        # Save to database
        video_doc = {
            "_id": video_id,
            "user_id": current_user["user_id"],
            "source": source,
            "verification_code": verification_code,
            "filename": video_file.filename,
            "duration_seconds": video_metadata['duration_seconds'],
            "fps": video_metadata['fps'],
            "total_frames": video_metadata['total_frames'],
            "file_size_bytes": os.path.getsize(file_path),
            "perceptual_hash": perceptual_hash,
            "sensor_data": sensor_data_parsed,
            "blockchain_signature": blockchain_result,
            "verification_status": "verified",
            "is_public": False,
            "captured_at": datetime.now().isoformat(),
            "uploaded_at": datetime.now().isoformat(),
            "verified_at": datetime.now().isoformat()
        }
        
        await db.videos.insert_one(video_doc)
        
        # Delete temporary file (unless premium tier wants to keep it)
        os.remove(file_path)
        
        return {
            "video_id": video_id,
            "verification_code": verification_code,
            "status": "verified",
            "blockchain_tx": blockchain_result['tx_hash'],
            "explorer_url": blockchain_result['explorer_url']
        }
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Video processing failed: {str(e)}")

@router.get("/{video_id}/status")
async def get_video_status(
    video_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get video processing status"""
    video = await db.videos.find_one({"_id": video_id})
    
    if not video:
        raise HTTPException(404, "Video not found")
    
    # Check ownership
    if video['user_id'] != current_user['user_id']:
        raise HTTPException(403, "Access denied")
    
    return {
        "video_id": video['_id'],
        "status": video['verification_status'],
        "verification_code": video['verification_code'],
        "blockchain_tx": video['blockchain_signature']['tx_hash'],
        "explorer_url": video['blockchain_signature']['explorer_url'],
        "verified_at": video.get('verified_at')
    }
```

---

### 6. `api/verification.py` - Verification Routes

```python
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from pydantic import BaseModel

from services.video_processor import VideoProcessor
from database.mongodb import get_db

router = APIRouter()
video_processor = VideoProcessor()

class CodeVerificationRequest(BaseModel):
    verification_code: str

@router.post("/code")
async def verify_by_code(
    request: CodeVerificationRequest,
    db = Depends(get_db)
):
    """Verify video by entering verification code"""
    
    video = await db.videos.find_one({"verification_code": request.verification_code})
    
    if not video:
        return {
            "result": "not_found",
            "message": "Verification code not found"
        }
    
    # Log verification attempt
    await db.verification_attempts.insert_one({
        "video_id": video['_id'],
        "verification_code": request.verification_code,
        "verification_type": "code",
        "result": "authentic",
        "timestamp": datetime.now().isoformat()
    })
    
    return {
        "result": "authentic",
        "video_id": video['_id'],
        "verification_code": video['verification_code'],
        "metadata": {
            "captured_at": video['captured_at'],
            "verified_at": video['verified_at'],
            "duration_seconds": video['duration_seconds'],
            "source": video['source'],
            "blockchain_tx": video['blockchain_signature']['tx_hash'],
            "explorer_url": video['blockchain_signature']['explorer_url'],
            "gps_coordinates": video.get('sensor_data', {}).get('gps_coordinates') if video.get('sensor_data') else None
        }
    }

@router.post("/deep")
async def deep_verification(
    video_file: UploadFile = File(...),
    verification_code: str = Form(...),
    db = Depends(get_db)
):
    """Deep verification by uploading video file"""
    
    # Find original video
    original_video = await db.videos.find_one({"verification_code": verification_code})
    
    if not original_video:
        raise HTTPException(404, "Verification code not found")
    
    # Save uploaded file temporarily
    import uuid
    import os
    import shutil
    
    temp_id = str(uuid.uuid4())
    upload_dir = "uploads/temp"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{temp_id}_{video_file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video_file.file, buffer)
    
    try:
        # Extract frames and calculate hash
        frames, _ = video_processor.extract_frames(file_path)
        new_hash = video_processor.calculate_perceptual_hash(frames)
        
        # Compare with original
        original_hash = original_video['perceptual_hash']
        comparison = video_processor.compare_hashes(original_hash, new_hash)
        
        # Log verification attempt
        await db.verification_attempts.insert_one({
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
        
        # Generate analysis text
        if comparison['result'] == "authentic":
            analysis = f"Video matches original signature with {comparison['similarity_score']:.1f}% similarity. "
            if comparison['similarity_score'] < 100:
                analysis += "Minor compression artifacts detected, which is normal for re-encoded videos."
            else:
                analysis += "Perfect match."
        else:
            tampered_frames = [f['frame'] for f in comparison['frame_comparison'] if f['similarity'] < 70]
            analysis = f"Significant differences detected in {len(tampered_frames)} frames. Video appears to be edited or tampered with."
        
        return {
            "result": comparison['result'],
            "similarity_score": comparison['similarity_score'],
            "confidence_level": comparison['confidence_level'],
            "frame_comparison": comparison['frame_comparison'],
            "analysis": analysis,
            "metadata": {
                "captured_at": original_video['captured_at'],
                "blockchain_tx": original_video['blockchain_signature']['tx_hash'],
                "explorer_url": original_video['blockchain_signature']['explorer_url']
            }
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(500, f"Verification failed: {str(e)}")
```

---

## FRONTEND (VERIFY PORTAL) STRUCTURE

```
/app/frontend/
├── src/
│   ├── App.js                   # Main app component
│   ├── index.js                 # React entry point
│   │
│   ├── pages/                   # Page components
│   │   ├── HomePage.js          # Landing page
│   │   ├── VerifyPage.js        # Verification portal
│   │   ├── ResultPage.js        # Verification results
│   │   └── ShowcasePage.js      # Creator showcase
│   │
│   ├── components/              # Reusable components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   ├── CodeVerification.js  # Code input form
│   │   ├── DeepVerification.js  # File upload form
│   │   ├── VerificationResult.js
│   │   └── BlockchainBadge.js
│   │
│   ├── services/                # API calls
│   │   └── api.js               # Axios API client
│   │
│   └── styles/                  # TailwindCSS styles
│       └── index.css
│
├── public/
│   ├── index.html
│   └── assets/
│
└── package.json
```

### Example: `src/pages/VerifyPage.js`

```jsx
import React, { useState } from 'react';
import CodeVerification from '../components/CodeVerification';
import DeepVerification from '../components/DeepVerification';
import VerificationResult from '../components/VerificationResult';

function VerifyPage() {
  const [verificationType, setVerificationType] = useState('code'); // 'code' or 'deep'
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerificationComplete = (verificationResult) => {
    setResult(verificationResult);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Verify Video Authenticity
        </h1>

        {/* Verification Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg border border-gray-300 bg-white">
            <button
              onClick={() => setVerificationType('code')}
              className={`px-6 py-3 rounded-l-lg ${
                verificationType === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Quick Verify (Code)
            </button>
            <button
              onClick={() => setVerificationType('deep')}
              className={`px-6 py-3 rounded-r-lg ${
                verificationType === 'deep'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Deep Verify (Upload File)
            </button>
          </div>
        </div>

        {/* Verification Forms */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {verificationType === 'code' ? (
            <CodeVerification onComplete={handleVerificationComplete} />
          ) : (
            <DeepVerification onComplete={handleVerificationComplete} />
          )}
        </div>

        {/* Results */}
        {result && (
          <VerificationResult result={result} type={verificationType} />
        )}
      </div>
    </div>
  );
}

export default VerifyPage;
```

---

## IMPLEMENTATION PHASES

### **Phase 1: Core Backend (Week 2, Days 1-3)**
- [ ] Set up FastAPI project structure
- [ ] Configure MongoDB connection
- [ ] Implement user authentication (register, login, JWT)
- [ ] Create video upload endpoint
- [ ] Implement video processing & perceptual hashing
- [ ] Test with sample videos

### **Phase 2: Blockchain Integration (Week 2, Days 4-5)**
- [ ] Set up Polygon Amoy connection
- [ ] Implement blockchain signature writing
- [ ] Implement blockchain signature reading
- [ ] Test with testnet POL
- [ ] Add error handling for blockchain failures

### **Phase 3: Verification Logic (Week 2, Days 6-7)**
- [ ] Implement code-based verification endpoint
- [ ] Implement deep verification (file upload + comparison)
- [ ] Add verification attempt logging
- [ ] Create similarity scoring algorithm
- [ ] Test various tampering scenarios

### **Phase 4: Frontend Verify Portal (Week 3, Days 1-3)**
- [ ] Create React app structure
- [ ] Build landing page
- [ ] Build verification page (code & deep)
- [ ] Build results page with blockchain badge
- [ ] Implement API integration with Axios

### **Phase 5: Showcase Feature (Week 3, Days 4-5)**
- [ ] Add showcase endpoints to backend
- [ ] Create showcase page in frontend
- [ ] Implement video thumbnails
- [ ] Add public creator profiles

### **Phase 6: Testing & Polish (Week 3, Days 6-7)**
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] UI/UX polish
- [ ] Performance optimization
- [ ] Documentation

---

## SECURITY CONSIDERATIONS

### Authentication
- Use bcrypt for password hashing
- Implement JWT with expiration (24 hours)
- Add refresh token mechanism
- Rate limiting on auth endpoints

### File Upload
- Validate file types (MP4, MOV, AVI only)
- Limit file size (100MB for free tier)
- Scan for malware (future)
- Use temporary storage, delete after processing

### Blockchain
- Never expose private keys in code
- Use environment variables
- For production: implement per-user wallets or app-level signing
- Add transaction retry logic

### API Security
- CORS whitelist for frontend domains
- Input validation on all endpoints
- SQL injection prevention (using Pydantic models)
- Rate limiting (10 requests/minute for verification)

---

## TESTING STRATEGY

### Unit Tests
- Video processing functions
- Hash comparison logic
- Verification code generation
- Blockchain interaction (mocked)

### Integration Tests
- API endpoint testing
- Database operations
- File upload flow
- Authentication flow

### End-to-End Tests
- Complete video upload → verification flow
- Code verification flow
- Deep verification flow
- Showcase creation flow

---

## ENVIRONMENT VARIABLES (.env)

```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology/
BLOCKCHAIN_PRIVATE_KEY=your-private-key-here-testnet-only

# File Upload
MAX_FILE_SIZE_MB=100
UPLOAD_DIR=./uploads
```

---

## DEPENDENCIES (requirements.txt)

```
fastapi==0.104.1
uvicorn==0.24.0
motor==3.3.2
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
opencv-python==4.8.1.78
pillow==10.1.0
imagehash==4.3.1
web3==6.11.3
python-dotenv==1.0.0
```

---

## SUCCESS METRICS

After Weeks 2-3 completion, you should have:

✅ Fully functional backend API with 10+ endpoints  
✅ Video upload & processing working  
✅ Perceptual hash generation & comparison  
✅ Blockchain signature writing & reading  
✅ Code-based verification working  
✅ Deep verification (file upload) working  
✅ Verify Portal web app functional  
✅ User authentication system  
✅ Database with proper schemas  
✅ 95%+ accuracy in tamper detection  

---

## NEXT STEPS AFTER WEEKS 2-3

**Weeks 4-6**: Build Rendr Bodycam (React Native mobile app)  
**Weeks 7-9**: Build Rendr Studio (Web upload platform)  
**Weeks 10-11**: Mobile app testing & refinement  
**Weeks 12-13**: Integration testing, bug fixes, MVP launch prep

---

**END OF BACKEND DEVELOPMENT PLAN**

*Last Updated: November 16, 2025*
*Version: 1.0*
