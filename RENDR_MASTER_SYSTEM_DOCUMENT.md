# RENDR STUDIO - MASTER SYSTEM DOCUMENT
## Complete System Architecture, Specifications & Roadmap

**Document Version:** 1.0  
**Created:** December 15, 2025  
**Last Updated:** December 15, 2025  
**Document Owner:** Brian James  
**Classification:** Internal - Development Reference

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Identity](#2-product-vision--identity)
3. [Platform Architecture Overview](#3-platform-architecture-overview)
4. [The Verification System - Core Engine](#4-the-verification-system---core-engine)
5. [Merkle Tree Implementation](#5-merkle-tree-implementation)
6. [C2PA (Content Provenance) Integration](#6-c2pa-content-provenance-integration)
7. [Blockchain Integration](#7-blockchain-integration)
8. [Redis & Background Processing](#8-redis--background-processing)
9. [Bounty Platform Architecture](#9-bounty-platform-architecture)
10. [RendrBodyCam - Mobile Application](#10-rendrbodycam---mobile-application)
11. [Database Schema](#11-database-schema)
12. [API Reference](#12-api-reference)
13. [Frontend Architecture](#13-frontend-architecture)
14. [Coding Conventions & Standards](#14-coding-conventions--standards)
15. [Complete TODO List](#15-complete-todo-list)
16. [Known Issues & Bug Tracker](#16-known-issues--bug-tracker)
17. [Testing Protocol](#17-testing-protocol)
18. [Environment Configuration](#18-environment-configuration)
19. [Deployment Guide](#19-deployment-guide)
20. [Appendices](#20-appendices)

---

# 1. EXECUTIVE SUMMARY

## What is RENDR?

**RENDR** is a comprehensive video verification and content protection platform built for creators, news organizations, legal professionals, and anyone who needs to prove the authenticity and provenance of video content. 

### The Three Pillars

1. **RENDR Studio** - The primary web application for uploading, watermarking, and verifying video content
2. **RENDR Bounty (Bounty.io)** - A marketplace for finding and reporting stolen content
3. **RENDR BodyCam** - A mobile application for authenticated video capture with built-in verification

### Core Value Proposition

> "Prove your video is original, unmodified, and yours."

RENDR provides:
- **Instant verification codes** (RND-XXXXXX) upon upload
- **Multi-layered cryptographic verification** (8 verification layers)
- **Compression-resistant perceptual hashing** for detecting modified copies
- **C2PA standard compliance** for industry-accepted provenance
- **Blockchain timestamping** for immutable proof of creation
- **Content theft detection** through smart duplicate matching

---

# 2. PRODUCT VISION & IDENTITY

## Brand Hierarchy

| Product | Description | Status |
|---------|-------------|--------|
| **RENDR Studio** | Primary web platform for video verification | ✅ ACTIVE |
| **RENDR Bounty / Bounty.io** | Content protection marketplace | 🟡 IN DEVELOPMENT |
| **RENDR BodyCam** | Mobile app for authenticated capture | 📋 PLANNED |

## Target Users

1. **Content Creators** - Protect original work, prove ownership
2. **News Organizations** - Verify source footage authenticity  
3. **Legal Professionals** - Establish evidence chains of custody
4. **Law Enforcement** - Body camera footage verification
5. **Enterprises** - Brand content protection and monitoring

## Revenue Model

| Tier | Storage | Features | Price |
|------|---------|----------|-------|
| Free | 5 videos, 24hr | Basic watermark, verification | $0 |
| Pro | 100 videos, 7 days | Custom watermark position, premium tiers | $X/mo |
| Enterprise | Unlimited | All features, blockchain, API access | $X/mo |

---

# 3. PLATFORM ARCHITECTURE OVERVIEW

## Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React.js | 18.x |
| **Backend** | FastAPI (Python) | Latest |
| **Database** | MongoDB | 7.x |
| **Cache/Queue** | Redis + RQ | 7.0.15 |
| **Video Processing** | FFmpeg | Latest |
| **Blockchain** | Polygon Amoy (Testnet) | - |
| **Provenance** | C2PA (c2pa-python) | 0.27.1 |

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RENDR PLATFORM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   RENDR     │    │   RENDR     │    │   RENDR     │    │   PUBLIC    │  │
│  │   STUDIO    │    │  BODYCAM    │    │   BOUNTY    │    │   VERIFY    │  │
│  │  (Web App)  │    │ (Mobile App)│    │(Marketplace)│    │  (Widget)   │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│         │                  │                  │                  │         │
│         └──────────────────┼──────────────────┼──────────────────┘         │
│                            │                  │                            │
│                            ▼                  ▼                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        API GATEWAY (FastAPI)                        │   │
│  │                         /api/* endpoints                             │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                        │
│         ┌─────────────────────────┼─────────────────────────┐              │
│         │                         │                         │              │
│         ▼                         ▼                         ▼              │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────────────┐   │
│  │ VERIFICATION│         │   VIDEO     │         │    BACKGROUND       │   │
│  │   ENGINE    │         │  PROCESSOR  │         │    WORKERS          │   │
│  │             │         │             │         │                     │   │
│  │ - SHA-256   │         │ - FFmpeg    │         │ - Redis Queue       │   │
│  │ - pHash     │         │ - Watermark │         │ - Async Processing  │   │
│  │ - Merkle    │         │ - Thumbnail │         │ - Priority Queues   │   │
│  │ - Audio     │         │ - C2PA      │         │                     │   │
│  └──────┬──────┘         └──────┬──────┘         └──────────┬──────────┘   │
│         │                       │                           │              │
│         └───────────────────────┼───────────────────────────┘              │
│                                 │                                          │
│                                 ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          DATA LAYER                                  │   │
│  │  ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐   │   │
│  │  │  MongoDB  │    │   Redis   │    │   File    │    │ Blockchain│   │   │
│  │  │ (Primary) │    │  (Cache)  │    │  Storage  │    │ (Polygon) │   │   │
│  │  └───────────┘    └───────────┘    └───────────┘    └───────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
/app/
├── backend/
│   ├── api/                    # All API routes
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── videos.py          # Video upload/management
│   │   ├── verification.py    # Verification endpoints
│   │   ├── users.py           # User profile/showcase
│   │   ├── folders.py         # Folder management
│   │   ├── bounties.py        # Bounty system
│   │   ├── analytics.py       # Analytics tracking
│   │   └── ...
│   ├── services/              # Business logic
│   │   ├── video_processor.py           # Basic video operations
│   │   ├── comprehensive_hash_service.py # All 8 verification layers
│   │   ├── c2pa_service.py              # C2PA manifest creation
│   │   ├── blockchain_service.py         # Polygon integration
│   │   ├── redis_queue_service.py        # Background job queue
│   │   └── ...
│   ├── models/                # Pydantic models
│   ├── utils/                 # Utilities
│   │   ├── security.py       # JWT, password hashing
│   │   └── watermark.py      # Watermark generation
│   ├── database/             # MongoDB connection
│   ├── uploads/              # File storage
│   └── server.py             # FastAPI app entry
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   └── hooks/            # Custom React hooks
│   └── public/
├── mobile-app/               # React Native app (BodyCam)
└── [Documentation Files]
```

---

# 4. THE VERIFICATION SYSTEM - CORE ENGINE

## Overview

RENDR's verification system uses **8 independent verification layers** organized in a Merkle Tree structure. This multi-layered approach ensures:

1. **Exact match detection** (SHA-256)
2. **Compression resistance** (Perceptual hashing)
3. **Audio verification** (Chromaprint fingerprint)
4. **Metadata integrity** (EXIF/XMP hashing)
5. **Tamper evidence** (Merkle Tree)
6. **Provenance tracking** (C2PA manifest)

## The 8 Verification Layers

| Layer | Name | Algorithm | Purpose |
|-------|------|-----------|---------|
| 1 | `verification_code` | RND-XXXXXX | Human-readable identifier |
| 2 | `original_sha256` | SHA-256 | Pristine original hash (pre-watermark) |
| 3 | `watermarked_sha256` | SHA-256 | Watermarked version hash |
| 4 | `key_frames_10` | SHA-256 × 10 | 10 evenly-spaced frame hashes |
| 5 | `perceptual_hashes_5` | pHash (DCT) | 5 center-region perceptual hashes |
| 6 | `audio_hash` | Chromaprint | Audio fingerprint |
| 7 | `metadata_hash` | SHA-256 | Video metadata (duration, codec, etc.) |
| 8 | `timestamp` | ISO 8601 | Upload timestamp hash |

## Verification Code Format

```
RND-XXXXXX

Where:
- RND = RENDR prefix (constant)
- XXXXXX = 6 alphanumeric characters (A-Z, 0-9)

Examples:
- RND-A1B2C3
- RND-TN1INQ
- RND-XYZ789
```

## Video Upload Workflow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         VIDEO UPLOAD WORKFLOW                             │
└──────────────────────────────────────────────────────────────────────────┘

    USER UPLOADS VIDEO
           │
           ▼
    ┌─────────────────────┐
    │ 1. SAVE TEMP FILE   │
    │    (original.mp4)   │
    └──────────┬──────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 2. CALCULATE ORIGINAL SHA-256       │
    │    (Before any modifications)       │
    │    Hash: 7f8c3d2e1a9b5c6f...       │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 3. DUPLICATE DETECTION              │
    │    - Check against ALL platform     │
    │      videos                         │
    │    - Smart matching (hash + pHash)  │
    │    - If duplicate → return existing │
    │      code + owner info              │
    └──────────┬──────────────────────────┘
               │
               ▼ (Not a duplicate)
    ┌─────────────────────────────────────┐
    │ 4. GENERATE VERIFICATION CODE       │
    │    RND-XXXXXX                       │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 5. APPLY WATERMARK                  │
    │    - FFmpeg overlay                 │
    │    - Username + Code + Logo         │
    │    - Position based on tier         │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 6. CALCULATE ALL HASHES             │
    │    - Watermarked SHA-256            │
    │    - 10 Key Frame Hashes            │
    │    - Perceptual Hashes (center 50%) │
    │    - Audio Fingerprint              │
    │    - Metadata Hash                  │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 7. BUILD MERKLE TREE                │
    │    8 leaves → Root hash             │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 8. CREATE C2PA MANIFEST             │
    │    - All assertions                 │
    │    - Hard binding                   │
    │    - Action chain                   │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 9. BLOCKCHAIN TIMESTAMP (Optional)  │
    │    - Write to Polygon               │
    │    - Store TX hash                  │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 10. SAVE TO DATABASE                │
    │     - All hashes                    │
    │     - Merkle tree                   │
    │     - C2PA manifest path            │
    │     - Blockchain proof              │
    │     - Expiration date               │
    └──────────┬──────────────────────────┘
               │
               ▼
    ┌─────────────────────────────────────┐
    │ 11. EXTRACT THUMBNAIL               │
    │     - First frame                   │
    │     - 800px max dimension           │
    └──────────┬──────────────────────────┘
               │
               ▼
         RETURN RESPONSE
         {
           "video_id": "...",
           "verification_code": "RND-XXXXXX",
           "status": "success"
         }
```

## Duplicate Detection Algorithm

```python
def smart_duplicate_detection(new_hashes, existing_videos, tier):
    """
    Multi-stage duplicate detection:
    
    Stage 1: Exact SHA-256 match (100% confidence)
    Stage 2: Perceptual hash match (85%+ similarity)
    Stage 3: Duration + frame count match
    """
    
    for video in existing_videos:
        # Stage 1: Exact match
        if video.original_sha256 == new_hashes.original_sha256:
            return True, video, 1.0  # 100% confidence
        
        # Stage 2: Perceptual similarity
        if tier in ['pro', 'enterprise']:
            similarity = compare_perceptual_hashes(
                video.perceptual_hashes, 
                new_hashes.perceptual_hashes
            )
            if similarity >= 0.85:
                return True, video, similarity
        
        # Stage 3: Metadata matching
        if (abs(video.duration - new_hashes.duration) < 1.0 and
            video.frame_count == new_hashes.frame_count):
            # Additional checks...
            pass
    
    return False, None, 0.0
```

## Perceptual Hash Algorithm Details

```python
class PerceptualHashService:
    """
    DCT-based perceptual hashing for compression resistance
    
    Algorithm:
    1. Extract frames at regular intervals
    2. Convert to grayscale
    3. Resize to 32x32 (or 16x16 for higher precision)
    4. Apply DCT (Discrete Cosine Transform)
    5. Take top-left 8x8 coefficients
    6. Create binary hash based on median
    
    Result: 64-bit hash per frame
    
    Comparison:
    - Hamming distance between hashes
    - Distance < 10 = likely same video
    - Distance < 5 = almost certainly same
    """
    
    def calculate_perceptual_hash(self, frame):
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Resize to 32x32 for DCT
        resized = cv2.resize(gray, (32, 32))
        
        # Convert to float and apply DCT
        dct_result = cv2.dct(np.float32(resized))
        
        # Take top-left 8x8 (low frequency components)
        dct_low = dct_result[:8, :8]
        
        # Create hash based on median
        median = np.median(dct_low)
        hash_bits = (dct_low > median).flatten()
        
        return ''.join(['1' if b else '0' for b in hash_bits])
```

---

# 5. MERKLE TREE IMPLEMENTATION

## Overview

RENDR uses a Merkle Tree to combine all 8 verification layers into a single, tamper-evident root hash. This provides:

1. **Integrity at Scale** - Any change in any layer changes the root
2. **Compact Proofs** - Single root can be anchored on blockchain
3. **Selective Verification** - Can verify individual layers without full data
4. **Industry Standard** - Same structure used by Bitcoin, Ethereum, Git

## Tree Structure

```
                          ┌─────────────────────────┐
                          │      MERKLE ROOT        │
                          │  (Single 64-char hash)  │
                          └───────────┬─────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
            ┌───────┴───────┐                   ┌───────┴───────┐
            │    Node 1     │                   │    Node 2     │
            └───────┬───────┘                   └───────┬───────┘
                    │                                   │
          ┌─────────┴─────────┐               ┌─────────┴─────────┐
          │                   │               │                   │
     ┌────┴────┐        ┌────┴────┐      ┌────┴────┐        ┌────┴────┐
     │ Node A  │        │ Node B  │      │ Node C  │        │ Node D  │
     └────┬────┘        └────┬────┘      └────┬────┘        └────┬────┘
          │                  │                │                  │
    ┌─────┴─────┐      ┌─────┴─────┐    ┌─────┴─────┐      ┌─────┴─────┐
    │           │      │           │    │           │      │           │
 ┌──┴──┐    ┌──┴──┐  ┌──┴──┐   ┌──┴──┐ ┌──┴──┐  ┌──┴──┐  ┌──┴──┐   ┌──┴──┐
 │ L1  │    │ L2  │  │ L3  │   │ L4  │ │ L5  │  │ L6  │  │ L7  │   │ L8  │
 └─────┘    └─────┘  └─────┘   └─────┘ └─────┘  └─────┘  └─────┘   └─────┘
   │          │        │         │       │        │        │         │
   ▼          ▼        ▼         ▼       ▼        ▼        ▼         ▼
verif_    original  water-   key_     percep-   audio   metadata  timestamp
code      sha256    marked   frames   tual      hash    hash
                    sha256            hashes
```

## Leaf Order (Canonical - Version 1.0)

```python
LEAF_ORDER_V1 = [
    "verification_code",    # 0: RND-XXXXXX
    "original_sha256",      # 1: Pre-watermark hash
    "watermarked_sha256",   # 2: Post-watermark hash
    "key_frames",           # 3: Combined hash of 10 frame hashes
    "perceptual_hashes",    # 4: Combined hash of 5 pHashes
    "audio_hash",           # 5: Chromaprint fingerprint
    "metadata_hash",        # 6: Video metadata hash
    "timestamp"             # 7: Upload timestamp hash
]
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Tree Building | ✅ Complete | Binary tree, bottom-up |
| Proof Generation | ✅ Complete | `get_proof(leaf_index)` |
| Proof Verification | ✅ Complete | `verify_proof(leaf, proof, root)` |
| Stable Leaf Ordering | ✅ Complete | Fixed canonical order |
| Odd Leaf Handling | ✅ Complete | Duplicates last leaf |
| Path Uniqueness | ✅ Complete | Each leaf has unique path |
| Migration Strategy | ✅ Complete | Schema version field |
| Hash Algorithm Agility | ✅ Complete | Supports SHA-256/384/512 |

## Why Merkle Trees Work for RENDR

1. **Immutability** - Videos are never modified after upload
2. **Fixed Leaves** - Always exactly 8 leaves per video
3. **Write Once** - Tree built max 2x (initial + background processing)
4. **Tiny Tree** - Only 4 levels deep, ~15 hash operations
5. **Negligible Storage** - ~3.7KB JSON per video

---

# 6. C2PA (CONTENT PROVENANCE) INTEGRATION

## What is C2PA?

The **Coalition for Content Provenance and Authenticity (C2PA)** is an industry standard for embedding provenance information in media files. Major supporters include Adobe, Microsoft, Intel, BBC, and more.

## RENDR's C2PA Implementation

### Manifest Structure

```json
{
  "@context": "https://c2pa.org/specifications/2.2",
  "claim_generator": "RENDR v1.0",
  "claim_generator_info": [{
    "name": "RENDR",
    "version": "1.0",
    "icon": "https://rendr.com/logo.png"
  }],
  
  "title": "Verified Video",
  "format": "video/mp4",
  "instance_id": "xmp.iid:RND-XXXXXX",
  
  "assertions": [
    {
      "label": "c2pa.hash.data",
      "data": {
        "alg": "sha256",
        "hash": "7f8c3d2e...",
        "name": "original_video"
      }
    },
    {
      "label": "c2pa.hash.data",
      "data": {
        "alg": "sha256",
        "hash": "9e2a5b1c...",
        "name": "watermarked_video"
      }
    },
    {
      "label": "stds.schema-org.CreativeWork",
      "data": {
        "@type": "VideoObject",
        "author": {
          "@type": "Person",
          "name": "BrianJames"
        },
        "datePublished": "2025-12-15T10:30:00Z"
      }
    },
    {
      "label": "c2pa.actions",
      "data": {
        "actions": [
          {
            "action": "c2pa.created",
            "softwareAgent": "iPhone 15 Pro",
            "when": "2025-12-15T10:25:00Z"
          },
          {
            "action": "c2pa.edited",
            "softwareAgent": "RENDR Watermark v1.0",
            "when": "2025-12-15T10:30:00Z",
            "changes": [{
              "description": "Added verification watermark"
            }]
          }
        ]
      }
    },
    {
      "label": "rendr.verification",
      "data": {
        "verification_code": "RND-XXXXXX",
        "verification_url": "https://rendr.com/verify/RND-XXXXXX",
        "key_frame_hashes": [...],
        "perceptual_hashes": [...],
        "audio_hash": "...",
        "master_hash": "..."
      }
    }
  ],
  
  "hard_binding": {
    "alg": "sha256",
    "hash": "..."
  }
}
```

### Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Manifest Creation | ✅ Complete | All assertions included |
| Sidecar Storage | ✅ Complete | `.c2pa` JSON files |
| Embedded Manifests | ⚠️ Placeholder | Requires signing certificates |
| Certificate Signing | ❌ Not Started | Need to acquire certificates |
| Manifest Verification | ⚠️ Basic | Reads sidecar files |

### Future: Certificate Signing

To embed C2PA manifests directly into video files, we need:
1. Signing certificate (from trusted CA or self-signed)
2. Use `c2pa-python` Builder to sign and embed
3. Verification using Reader to extract and validate

---

# 7. BLOCKCHAIN INTEGRATION

## Overview

RENDR uses **Polygon (Amoy Testnet)** to anchor video verification proofs on-chain. This provides:

1. **Immutable Timestamping** - Proof that video existed at specific time
2. **Third-Party Verification** - Anyone can verify on public blockchain
3. **Legal Evidence** - Blockchain timestamps are increasingly accepted in court

## Current Configuration

| Setting | Value |
|---------|-------|
| Network | Polygon Amoy (Testnet) |
| Chain ID | 80002 |
| RPC URL | `https://rpc-amoy.polygon.technology` |
| Explorer | `https://amoy.polygonscan.com` |
| Token | POL (Test tokens) |

## Transaction Structure

```python
# Data stored in transaction input field
data_to_store = {
    'v': '1.0',                    # Version
    'vid': video_id[:16],          # Video ID (truncated)
    'h': perceptual_hash[:32],     # Master hash
    't': timestamp_ms,             # Unix timestamp
    'app': 'Rendr'                 # Application identifier
}

# Transaction sent to self with data
transaction = {
    'nonce': nonce,
    'to': wallet_address,          # Self
    'value': 0,                    # No POL transfer
    'data': hex(json.dumps(data_to_store)),
    'gas': estimated_gas,
    'chainId': 80002
}
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Connection | ✅ Working | Web3.py integration |
| Write Signature | ✅ Working | Data in tx input |
| Read Signature | ✅ Working | Decode from tx |
| Balance Check | ✅ Working | POL balance |
| Gas Estimation | ✅ Working | Dynamic calculation |
| Mainnet | ❌ Not Ready | Using testnet only |

## Environment Variables

```bash
# backend/.env
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_PRIVATE_KEY=your_wallet_private_key
POLYGON_CHAIN_ID=80002
```

---

# 8. REDIS & BACKGROUND PROCESSING

## Overview

RENDR uses **Redis** and **RQ (Redis Queue)** for background processing of heavy operations like perceptual hash calculation and audio fingerprinting.

## Configuration

| Component | Details |
|-----------|---------|
| Redis Version | 7.0.15 |
| Port | 6379 |
| Workers | 2 (via Supervisor) |
| Job Timeout | 10 minutes |
| Result TTL | 1 hour |

## Queue Priority Levels

| Queue | Priority | Use Case |
|-------|----------|----------|
| `high` | 1 | Enterprise users |
| `default` | 2 | Pro users |
| `low` | 3 | Free users |

## Background Tasks

```python
# services/background_tasks.py

def process_video_hashes(video_id, video_path, verification_code, user_id):
    """
    Heavy processing moved to background:
    - Perceptual hashes (30+ seconds)
    - Audio fingerprint (10+ seconds)
    """
    # Calculate hashes...
    # Update database...
    # Publish status update via Pub/Sub

def cleanup_expired_videos():
    """
    Periodic task to remove expired videos
    """
    # Run hourly
```

## Status Updates

```python
# Real-time status via Redis Pub/Sub
channel = f"video_status:{video_id}"

# Subscribe to status updates
pubsub = redis.pubsub()
pubsub.subscribe(channel)

for message in pubsub.listen():
    print(f"Progress: {message['progress']}%")
```

## Supervisor Configuration

```ini
# /etc/supervisor/conf.d/redis.conf
[program:redis]
command=redis-server --port 6379
autostart=true
autorestart=true

# /etc/supervisor/conf.d/rq-worker.conf
[program:rq-worker]
command=/app/backend/start_worker.sh
numprocs=2
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
```

---

# 9. BOUNTY PLATFORM ARCHITECTURE

## Overview

**RENDR Bounty (Bounty.io)** is a marketplace where:
- **Creators** post bounties on their content
- **Hunters** find stolen copies and submit claims
- **Verification Engine** validates claims
- **Automated payouts** from escrow

## Two-Track Architecture

### Track 1: Standalone Bounty Platform (bounty.io)
- Independent API-first platform
- Any client app can integrate
- Full creator and hunter flows
- DMCA compliance stack
- Partner-ready design

### Track 2: Bounty Inside RENDR Studio
- First-party client of Bounty.io
- "Verify → Bounty → DMCA" flow
- Uses same APIs as standalone
- Shared data contracts

## Microservices (Planned)

| Service | Responsibility |
|---------|----------------|
| `auth-service` | JWT, OAuth, user sessions, roles |
| `user-service` | Profiles, agencies, agreements |
| `asset-service` | RENDR asset linking, verification |
| `bounty-service` | Bounty CRUD, escrow, budget tracking |
| `claim-service` | Claim submission, evidence upload |
| `verification-service` | Evidence processing, decision engine |
| `dmca-service` | Notice generation, dispatch |
| `payout-service` | Payment execution, tax forms |

## Bounty Flow

```
CREATOR FLOW:
1. Signup → KYC → Creator Agreement
2. Link RENDR Asset (verification code)
3. Create Bounty → Set reward/scope → DMCA Authorization
4. Fund bounty via Stripe (escrow)
5. Dashboard: View claims, DMCA status

HUNTER FLOW:
1. Browse bounties → Filter by platform, reward
2. Signup → Hunter Agreement → KYC
3. Submit Claim → URLs + evidence upload
4. Track status (Pending → Accepted → Paid)
5. Earnings dashboard

VERIFICATION FLOW:
1. Hunter submits claim with evidence
2. System calls RENDR verify API
3. Match score calculated (frame, audio, metadata)
4. If ≥85% match → Auto-accept
5. If borderline → Manual review
6. On accept → Trigger payout
```

## DMCA Workflow

```
1. Creator signs DMCA Agency Authorization (e-signature)
2. Claim accepted → DMCA Worker generates notice
3. Notice includes: Creator signature, RENDR proof
4. Optional: Creator approval (24hr timeout = auto-approve)
5. Dispatch to platforms via APIs
6. Track status: sent → acknowledged → resolved
```

## Database Schema (Bounty)

```sql
-- Core Bounty Tables (PostgreSQL style, will be MongoDB)

CREATE TABLE bounties (
    id UUID PRIMARY KEY,
    asset_id UUID REFERENCES assets,
    creator_id UUID REFERENCES users,
    reward_per_find DECIMAL(10,2),
    total_budget DECIMAL(10,2),
    funded_amount DECIMAL(10,2),
    spent_amount DECIMAL(10,2),
    status ENUM('draft','active','paused','exhausted'),
    platforms JSONB,  -- ['tiktok','instagram','youtube']
    dmca_authorization_signed BOOLEAN,
    creator_signature_data JSONB
);

CREATE TABLE claims (
    id UUID PRIMARY KEY,
    bounty_id UUID REFERENCES bounties,
    hunter_id UUID REFERENCES users,
    urls_json JSONB,
    evidence_file_id TEXT,
    evidence_sha256 TEXT,
    status ENUM('pending_auto','pending_manual','accepted','rejected'),
    match_score DECIMAL(3,2),
    frame_match_ratio DECIMAL(3,2),
    audio_match_score DECIMAL(3,2),
    tampering_flags JSONB,
    c2pa_status TEXT,
    payout_amount DECIMAL(10,2)
);
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Bounty Model | ✅ Created | Basic structure |
| Bounty API | ⚠️ Basic | CRUD endpoints |
| Claim Submission | ❌ Not Started | - |
| Verification Bridge | ❌ Not Started | - |
| Stripe Escrow | ❌ Not Started | - |
| DMCA Generation | ❌ Not Started | - |
| Hunter Payouts | ❌ Not Started | - |

---

# 10. RENDRBODYCAM - MOBILE APPLICATION

## Overview

**RENDR BodyCam** is a mobile application for authenticated video capture with built-in verification.

## Target Platforms

| Platform | Framework | Status |
|----------|-----------|--------|
| iOS | React Native | 📋 Planned |
| Android | React Native | 📋 Planned |

## Core Features

1. **Authenticated Capture**
   - Login required before recording
   - User identity embedded in metadata
   - GPS location tagging

2. **Real-Time Watermarking**
   - Verification code generated at capture start
   - Watermark applied during recording
   - No post-processing manipulation possible

3. **Instant Upload**
   - Automatic upload on recording end
   - Hashes calculated on-device
   - C2PA manifest created locally

4. **Offline Mode**
   - Queue recordings when offline
   - Sync when connection restored
   - Tamper-evident local storage

## Technical Requirements

```javascript
// App.js - Core structure
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { hash } from 'react-native-crypto';

const BodyCamApp = () => {
  const [verificationCode, setVerificationCode] = useState(null);
  
  const startRecording = async () => {
    // 1. Generate verification code
    const code = generateVerificationCode();
    setVerificationCode(code);
    
    // 2. Create watermark overlay
    const watermark = createWatermark(user.username, code);
    
    // 3. Start recording with watermark
    camera.startRecording({
      onRecordingFinished: (video) => {
        // 4. Calculate hashes
        const hashes = calculateHashes(video.path);
        
        // 5. Upload to RENDR
        uploadToRendr(video, code, hashes);
      }
    });
  };
};
```

## Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Project Setup | ⚠️ Basic | React Native scaffold |
| Camera Integration | ❌ Not Started | - |
| Real-Time Watermark | ❌ Not Started | - |
| On-Device Hashing | ❌ Not Started | - |
| API Integration | ❌ Not Started | - |
| Offline Mode | ❌ Not Started | - |

---

# 11. DATABASE SCHEMA

## MongoDB Collections

### `users` Collection

```javascript
{
  "_id": "uuid",
  "email": "user@example.com",
  "username": "CreatorName",
  "display_name": "Creator Display Name",
  "password_hash": "bcrypt_hash",
  "premium_tier": "free|pro|enterprise",
  "account_type": "free|pro|enterprise",
  
  // Profile
  "bio": "Creator bio text",
  "profile_picture": "/uploads/profiles/user.jpg",
  "banner_image": "/uploads/banners/user.jpg",
  "profile_shape": "circle|square|rounded|hexagon|diamond",
  "profile_border": 6,
  "border_color": "#667eea",
  "profile_effect": "shadow-lg|shadow-sm|glow",
  
  // Social Links
  "social_media_links": [
    {
      "platform": "youtube",
      "url": "https://youtube.com/@creator",
      "thumbnail": "/api/uploads/images/thumb.jpg"
    }
  ],
  "dashboard_social_links": [...],
  
  // Premium Content Pricing
  "premium_tiers": [
    {
      "name": "Silver Level",
      "price": "4.99",
      "description": "Basic access"
    },
    {
      "name": "Gold Level",
      "price": "9.99",
      "description": "Premium access"
    }
  ],
  
  // Showcase Settings
  "showcase_settings": {
    "theme": "light|dark",
    "accent_color": "#667eea"
  },
  
  // Notifications
  "notify_on_verification": true,
  "notify_video_length_threshold": 30,
  "sms_opted_in": false,
  "phone": "+1234567890",
  "notification_preference": "email|sms|both",
  
  // Roles & Access
  "roles": ["creator", "ceo", "admin", "investor"],
  
  // Strike System
  "strikes": 0,
  "banned_until": null,
  "duplicate_attempts": [...],
  
  // Timestamps
  "created_at": "2025-12-15T10:00:00Z",
  "updated_at": "2025-12-15T10:00:00Z"
}
```

### `videos` Collection

```javascript
{
  "id": "uuid",  // Primary ID (not _id)
  "user_id": "uuid",
  "verification_code": "RND-XXXXXX",
  
  // Content
  "title": "My Video Title",
  "description": "Video description",
  "thumbnail_path": "/uploads/thumbnails/uuid.jpg",
  
  // Organization
  "folder_id": "uuid",
  "showcase_folder_id": "uuid",
  "tags": ["tag1", "tag2"],
  
  // Visibility
  "on_showcase": true,
  "is_public": false,
  "access_level": "public|Silver Level|Gold Level",
  
  // Social Links (per video)
  "social_media_links": [
    {
      "platform": "youtube",
      "url": "https://youtube.com/watch?v=xxx"
    }
  ],
  
  // Hashes
  "hashes": {
    "original": "sha256_hash",
    "watermarked": "sha256_hash",
    "center_region": "phash",
    "audio": "chromaprint",
    "metadata": "sha256_hash"
  },
  
  // Comprehensive Hashes
  "comprehensive_hashes": {
    "verification_code": "RND-XXXXXX",
    "original_sha256": "...",
    "watermarked_sha256": "...",
    "key_frame_hashes": [...],
    "perceptual_hashes": [...],
    "audio_hash": "...",
    "metadata_hash": "...",
    "master_hash": "...",
    "video_metadata": {...}
  },
  
  // Merkle Tree
  "merkle_tree": {
    "root": "merkle_root_hash",
    "leaves": [...],
    "leaf_count": 8,
    "tree_depth": 4,
    "algorithm": "sha256",
    "schema_version": "1.0"
  },
  
  // C2PA
  "c2pa_manifest": {
    "created": true,
    "manifest_path": "/path/to/video.c2pa",
    "assertions_count": 5
  },
  
  // Blockchain
  "blockchain_signature": {
    "tx_hash": "0x...",
    "block_number": 12345,
    "explorer_url": "https://amoy.polygonscan.com/tx/...",
    "timestamp": "2025-12-15T10:30:00Z",
    "chain_id": 80002,
    "status": "confirmed"
  },
  
  // Video Metadata
  "video_metadata": {
    "duration": 120.5,
    "fps": 30.0,
    "resolution": "1920x1080",
    "bitrate": 5000000,
    "format": "MP4"
  },
  
  // Storage
  "storage": {
    "tier": "pro",
    "expires_at": "2025-12-22T10:30:00Z",
    "download_count": 42
  },
  
  // Source
  "source": "studio|bodycam|api",
  
  // Timestamps
  "uploaded_at": "2025-12-15T10:30:00Z",
  "captured_at": "2025-12-15T10:25:00Z"
}
```

### `folders` Collection

```javascript
{
  "_id": "uuid",
  "folder_name": "My Folder",
  "username": "CreatorName",
  "user_id": "uuid",
  "order": 1,
  "created_at": "2025-12-15T10:00:00Z"
}
```

### `verification_attempts` Collection

```javascript
{
  "_id": "uuid",
  "video_id": "uuid",
  "verification_code": "RND-XXXXXX",
  "verification_type": "code|deep_multihash",
  "result": "authentic|tampered|not_found",
  "similarity_score": 98.5,
  "confidence_level": "high|medium|low",
  "hash_matches": {...},
  "timestamp": "2025-12-15T10:30:00Z"
}
```

### `duplicate_attempts` Collection

```javascript
{
  "_id": "uuid",
  "user_id": "uuid",
  "video_hash": "sha256_hash",
  "original_owner_id": "uuid",
  "original_verification_code": "RND-XXXXXX",
  "attempt_timestamp": "2025-12-15T10:30:00Z",
  "ip_address": "xxx.xxx.xxx.xxx"
}
```

## Important MongoDB Patterns

### ALWAYS Exclude `_id` in Queries

```python
# ✅ CORRECT
videos = await db.videos.find({}, {"_id": 0}).to_list(1000)

# ❌ WRONG - Will cause ObjectId serialization error
videos = await db.videos.find({}).to_list(1000)
```

### Use Custom `id` Field

```python
# When creating documents
video_doc = {
    "id": str(uuid.uuid4()),  # Custom string ID
    # ... other fields
}
await db.videos.insert_one(video_doc)

# When querying
video = await db.videos.find_one({"id": video_id}, {"_id": 0})
```

---

# 12. API REFERENCE

## Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create new account |
| `/api/auth/login` | POST | No | Login, get JWT token |
| `/api/auth/me` | GET | Yes | Get current user info |
| `/api/auth/me/premium-tiers` | GET | Yes | Get user's pricing tiers |
| `/api/auth/me/premium-tiers` | PUT | Yes | Update pricing tiers |

## Videos

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/videos/upload` | POST | Yes | Upload video |
| `/api/videos/user/list` | GET | Yes | List user's videos |
| `/api/videos/{id}` | GET | Yes | Get video details |
| `/api/videos/{id}` | PUT | Yes | Update video metadata |
| `/api/videos/{id}` | DELETE | Yes | Delete video |
| `/api/videos/{id}/status` | GET | Yes | Get processing status |
| `/api/videos/{id}/stream` | GET | Yes | Stream video (authenticated) |
| `/api/videos/watch/{id}` | GET | No* | Stream video (public) |
| `/api/videos/{id}/thumbnail` | GET | No | Get thumbnail image |
| `/api/videos/upload/image` | POST | Yes | Upload general image |

## Verification

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/verification/code` | POST | No | Verify by code |
| `/api/verification/deep` | POST | No | Deep verify by file upload |

## Showcase (Public)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/@/{username}` | GET | No | Get creator profile |
| `/api/@/{username}/videos` | GET | No | Get public videos |
| `/api/@/{username}/premium-videos` | GET | No | Get premium videos |

## Folders

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/folders` | GET | Yes | List user's folders |
| `/api/folders` | POST | Yes | Create folder |
| `/api/folders/{id}` | PUT | Yes | Update folder |
| `/api/folders/{id}` | DELETE | Yes | Delete folder |

## User Profile

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/users/profile` | GET | Yes | Get profile |
| `/api/users/profile` | PUT | Yes | Update profile |
| `/api/users/profile-picture` | POST | Yes | Upload profile picture |
| `/api/users/banner` | POST | Yes | Upload banner |

## Analytics

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/analytics/track/page-view` | POST | No | Track page view |
| `/api/analytics/track/social-click` | POST | No | Track social click |
| `/api/analytics/dashboard` | GET | Yes | Get analytics data |

## Admin

| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/api/admin/users` | GET | Yes | admin |
| `/api/admin/videos` | GET | Yes | admin |
| `/api/admin/investor/stats` | GET | Yes | investor |
| `/api/admin/ceo/stats` | GET | Yes | ceo |

---

# 13. FRONTEND ARCHITECTURE

## Pages

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage.js | Public landing page |
| `/dashboard` | Dashboard.js | User dashboard |
| `/upload` | Upload.js | Video upload page |
| `/my-videos` | MyVideos.js | User's video list |
| `/editor` | UnifiedEditor.js | Full profile/content editor |
| `/verify` | Verify.js | Public verification page |
| `/@{username}` | Showcase.js | Public creator showcase |
| `/bounties` | Bounties.js | Bounty system |
| `/creator-login` | CreatorLogin.js | Login page |
| `/pricing` | Pricing.js | Pricing plans |
| `/explore` | Explore.js | Discover creators |

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| EditVideoModal | `components/EditVideoModal.js` | Edit video details |
| EditFolderModal | `components/EditFolderModal.js` | Edit folder details |
| DirectoryTree | `components/DirectoryTree.js` | Folder/video tree view |
| VideoPlayer | `components/VideoPlayer.js` | Video playback with modal |
| VideoUploader | `components/VideoUploader.js` | Upload UI with progress |
| Navigation | `components/Navigation.js` | Main nav bar |
| Logo | `components/Logo.js` | Brand logo component |
| QuotaIndicator | `components/QuotaIndicator.js` | Video quota display |

## Shadcn UI Components

Located in `/app/frontend/src/components/ui/`:
- Button, Card, Dialog, Input, Label, Select, Tabs, Toast, etc.

## Environment Variables

```bash
# frontend/.env
REACT_APP_BACKEND_URL=https://rendr-studio.preview.emergentagent.com
```

**CRITICAL:** Always use `process.env.REACT_APP_BACKEND_URL` for API calls.

---

# 14. CODING CONVENTIONS & STANDARDS

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Python files | snake_case | `video_processor.py` |
| React components | PascalCase | `EditVideoModal.js` |
| React pages | PascalCase | `Dashboard.js` |
| API routes | snake_case | `auth.py`, `videos.py` |
| CSS files | PascalCase or kebab-case | `Showcase.css` |

## Python Code Style

```python
# Imports order
import stdlib
import third_party
from local import module

# Function naming: snake_case
def calculate_perceptual_hash(frame):
    pass

# Class naming: PascalCase
class VideoProcessor:
    pass

# Constants: UPPER_SNAKE_CASE
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB

# Docstrings
def upload_video(file, user_id):
    """
    Upload and process video.
    
    Args:
        file: UploadFile object
        user_id: UUID of uploader
        
    Returns:
        dict with video_id and verification_code
    """
    pass
```

## JavaScript/React Code Style

```javascript
// Component naming: PascalCase
function EditVideoModal({ video, onSave, onClose }) {
  // State hooks first
  const [title, setTitle] = useState('');
  
  // useEffect next
  useEffect(() => {
    // ...
  }, []);
  
  // Event handlers
  const handleSave = async () => {
    // ...
  };
  
  // Render
  return (
    <div className="modal">
      {/* JSX */}
    </div>
  );
}
```

## API Route Conventions

```python
# All routes must have /api prefix
router = APIRouter()

# Route naming: descriptive verbs
@router.post("/upload")           # Create
@router.get("/{id}")              # Read
@router.put("/{id}")              # Update
@router.delete("/{id}")           # Delete
@router.get("/user/list")         # List for user
@router.get("/{id}/status")       # Get status
```

## Database Conventions

```python
# Always exclude _id from MongoDB responses
video = await db.videos.find_one({"id": video_id}, {"_id": 0})

# Use custom string IDs
video_doc = {
    "id": str(uuid.uuid4()),  # Custom ID
    # NOT _id
}

# DateTime: Always use timezone-aware
from datetime import datetime, timezone
timestamp = datetime.now(timezone.utc)

# Store dates as ISO strings
"created_at": datetime.now(timezone.utc).isoformat()
```

## Common Mistakes to Avoid

```python
# ❌ WRONG: Importing from wrong path
from auth.security import get_current_user

# ✅ CORRECT
from utils.security import get_current_user

# ❌ WRONG: Missing _id exclusion
videos = await db.videos.find({}).to_list(1000)

# ✅ CORRECT
videos = await db.videos.find({}, {"_id": 0}).to_list(1000)

# ❌ WRONG: Hardcoded URL
response = await axios.get('http://localhost:8001/api/videos')

# ✅ CORRECT
response = await axios.get(`${BACKEND_URL}/api/videos`)

# ❌ WRONG: Using npm
npm install package

# ✅ CORRECT
yarn add package
```

---

# 15. COMPLETE TODO LIST

## 🔴 CRITICAL (P0) - Fix Immediately

| Task | Status | Notes |
|------|--------|-------|
| Social media thumbnails not displaying on Showcase | 🔴 IN PROGRESS | Thumbnails save to DB but don't render |
| Dashboard video thumbnails not appearing | 🔴 IN PROGRESS | URL path issue |
| Watermarking on upload must be AUTOMATIC | 🔴 CHECK | User reports watermark sometimes missing |

## 🟠 HIGH PRIORITY (P1) - Current Sprint

| Task | Status | Notes |
|------|--------|-------|
| Complete verification code lookup flow | ⚠️ VERIFY | Test end-to-end |
| Test perceptual hash compression resistance | ⚠️ PENDING | Need to verify >90% after compression |
| Bounty "Sign Up" flow implementation | ❌ NOT STARTED | Build pages and user flow |
| C2PA certificate signing implementation | ❌ NOT STARTED | Need to acquire certificates |

## 🟡 MEDIUM PRIORITY (P2) - Next Sprint

| Task | Status | Notes |
|------|--------|-------|
| Improve perceptual hash algorithm | ❌ NOT STARTED | Research dhash, whash |
| WebSocket real-time status updates | ❌ NOT STARTED | Replace polling |
| Multi-language support | ❌ NOT STARTED | i18n integration |
| Mobile responsiveness testing | ⚠️ PARTIAL | Some pages need work |

## 🟢 LOW PRIORITY (P3) - Backlog

| Task | Status | Notes |
|------|--------|-------|
| Sliding Window QR Code Watermarking | ❌ NOT STARTED | Research invisible watermarking |
| RendrBodyCam mobile app | ❌ NOT STARTED | React Native |
| Bounty.io standalone platform | ❌ NOT STARTED | Full marketplace |
| Social features (Follow, Notify, Message) | ❌ NOT STARTED | Phase 3 |
| NFT integration | ❌ NOT STARTED | Future consideration |

## ✅ COMPLETED

| Task | Completion Date |
|------|-----------------|
| Redis/RQ integration | Dec 9, 2025 |
| Comprehensive hash service | Dec 9, 2025 |
| C2PA manifest creation | Dec 9, 2025 |
| Merkle tree implementation | Dec 9, 2025 |
| Dual SHA-256 (original + watermarked) | Dec 9, 2025 |
| Resubmission prevention (strike system) | Dec 9, 2025 |
| Dynamic premium tiers | Dec 15, 2025 |
| UnifiedEditor Media Links tab | Dec 15, 2025 |
| EditVideoModal dynamic access levels | Dec 15, 2025 |
| Showcase premium video grouping | Dec 15, 2025 |
| API Documentation | Dec 9, 2025 |

---

# 16. KNOWN ISSUES & BUG TRACKER

## Active Issues

| ID | Priority | Description | Status | Last Updated |
|----|----------|-------------|--------|--------------|
| BUG-001 | P0 | Social thumbnails not rendering on Showcase | INVESTIGATING | Dec 15, 2025 |
| BUG-002 | P1 | Dashboard video thumbnails missing | INVESTIGATING | Dec 15, 2025 |
| BUG-003 | P2 | Mobile layout issues on Editor | KNOWN | Dec 10, 2025 |
| BUG-004 | P2 | Video auto-play needs disable option | KNOWN | Dec 9, 2025 |

## Resolved Issues

| ID | Description | Resolution | Date |
|----|-------------|------------|------|
| BUG-000 | Login "Network Error" | Fixed supervisor config | Dec 15, 2025 |

## Recurring Issues (Environment)

| Issue | Cause | Fix |
|-------|-------|-----|
| "Network Error" on login | Wrong REACT_APP_BACKEND_URL in supervisord.conf | Edit `/etc/supervisor/conf.d/supervisord.conf`, fix URL, restart frontend |
| Backend crash on startup | Syntax errors in Python files | Check logs: `tail -n 100 /var/log/supervisor/backend.err.log` |
| Hot reload not working | Supervisor caching | `sudo supervisorctl restart frontend` or `backend` |

---

# 17. TESTING PROTOCOL

## Test Credentials

| Account | Username | Password | Role |
|---------|----------|----------|------|
| Main Test | BrianJames | Brian123! | creator, ceo |

## Backend Testing

```bash
# Get JWT token
TOKEN=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"BrianJames","password":"Brian123!"}' \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")

# Test authenticated endpoint
curl -X GET "$BACKEND_URL/api/videos/user/list" \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Testing

1. Use Playwright via testing subagent
2. Screenshot tool for UI verification
3. Manual testing for complex flows

## Test Files Location

```
/app/backend/tests/
  - backend_test.py
  - comprehensive_backend_test.py
  - video_workflow_test.py
  - stripe_integration_test.py
```

## Testing Checklist

### Before Finishing Any Task

- [ ] Backend API tested with curl
- [ ] Frontend tested with screenshot or Playwright
- [ ] No console errors in browser
- [ ] No Python errors in backend logs
- [ ] Database operations verified
- [ ] User flow tested end-to-end

---

# 18. ENVIRONMENT CONFIGURATION

## Backend Environment (`/app/backend/.env`)

```bash
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=rendr

# JWT
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRE_HOURS=24

# Blockchain (Polygon)
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_PRIVATE_KEY=your_wallet_key
POLYGON_CHAIN_ID=80002

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_URL=redis://localhost:6379

# Email (SES) - BLOCKED BY USER
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
SES_SENDER_EMAIL=
```

## Frontend Environment (`/app/frontend/.env`)

```bash
# Backend URL - NEVER HARDCODE
REACT_APP_BACKEND_URL=https://rendr-studio.preview.emergentagent.com
```

## Supervisor Configuration (`/etc/supervisor/conf.d/supervisord.conf`)

**⚠️ CRITICAL:** This file can override `.env` values. If login fails, check here first.

```ini
[program:frontend]
environment=REACT_APP_BACKEND_URL="https://rendr-studio.preview.emergentagent.com"
```

---

# 19. DEPLOYMENT GUIDE

## Local Development

```bash
# Backend
cd /app/backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend
cd /app/frontend
yarn install
yarn start

# Redis
redis-server --port 6379

# Workers
cd /app/backend
./start_worker.sh
```

## Production (Supervisor)

```bash
# Restart services
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
sudo supervisorctl restart redis
sudo supervisorctl restart rq-worker:*

# Check status
sudo supervisorctl status

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.err.log
```

## Adding Dependencies

```bash
# Python - NEVER edit requirements.txt directly
pip install package_name
pip freeze > /app/backend/requirements.txt

# JavaScript - NEVER use npm
yarn add package_name
```

---

# 20. APPENDICES

## Appendix A: Watermark Specification

### Visual Format
```
┌──────────────────────────────────────────────────┐
│                                                  │
│   ┌──────┐                                       │
│   │ U    │ ← Username (rotated 90° CCW)         │
│   │ S    │                                       │
│   │ E    │                                       │
│   │ R    │                                       │
│   ├──────┤                                       │
│   │ R    │ ← Verification Code (rotated)        │
│   │ N    │                                       │
│   │ D    │                                       │
│   │ -    │                                       │
│   │ X    │                                       │
│   ├──────┤                                       │
│   │ LOGO │ ← RENDR Logo                          │
│   └──────┘                                       │
│                                                  │
│              VIDEO CONTENT                       │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Position by Tier
| Tier | Allowed Positions |
|------|-------------------|
| Free | Left only |
| Pro | Left, Right, Top, Bottom |
| Enterprise | All positions |

## Appendix B: Verification Code QR Format (Future)

```
┌─────────────────────────────────┐
│  ┌─────────────────────────┐    │
│  │  ▄▄▄▄▄     ▄ ▄ ▄▄▄▄▄   │    │
│  │  █   █ ▄▄▄  ▄ █   █   │    │
│  │  █   █ █ ▄ █  █   █   │    │
│  │  ▀▀▀▀▀ █ █ █  ▀▀▀▀▀   │    │
│  │  ▄▄▄█▄▀▄█▀▀▀▄▄▄█▄     │    │
│  │  ▀ █▀█▀ ▄ █▀█▀▀ ▀▄    │    │
│  │  ▄▄▄▄▄ █▀▀▄▀█▀▀▄█     │    │
│  │  █   █ ▄█▀▀  ▄█▄▀     │    │
│  │  █   █ ▀ ▄▀▄█▀▄       │    │
│  │  ▀▀▀▀▀ █▀▀ ▀▄█▄█      │    │
│  └─────────────────────────┘    │
│                                 │
│    rendr.com/v/RND-XXXXXX      │
└─────────────────────────────────┘
```

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| C2PA | Coalition for Content Provenance and Authenticity |
| pHash | Perceptual Hash - compression-resistant image fingerprint |
| DCT | Discrete Cosine Transform - used in perceptual hashing |
| Merkle Tree | Binary hash tree for tamper-evident data structures |
| RQ | Redis Queue - Python background job library |
| Chromaprint | Audio fingerprinting algorithm |
| POL | Polygon blockchain native token |
| Amoy | Polygon testnet network |
| XMP | Extensible Metadata Platform |
| EXIF | Exchangeable Image File Format |

## Appendix D: External Resources

- C2PA Specification: https://c2pa.org/specifications/
- C2PA Python Library: https://opensource.contentauthenticity.org/docs/c2pa-python/
- Polygon Documentation: https://polygon.technology/developers
- Redis Documentation: https://redis.io/docs/
- FFmpeg Documentation: https://ffmpeg.org/documentation.html

---

# DOCUMENT CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 15, 2025 | E1 Agent | Initial creation |

---

**END OF MASTER DOCUMENT**

*This document should be updated whenever significant changes are made to the system. It serves as the single source of truth for all RENDR development.*
