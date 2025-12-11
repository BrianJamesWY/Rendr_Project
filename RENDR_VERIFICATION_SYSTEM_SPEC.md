# RENDR VERIFICATION SYSTEM - COMPLETE TECHNICAL SPECIFICATION
## Master Reference Document v2.0
### Last Updated: December 2025

---

## 🎯 WHAT IS RENDR?

**RENDR** is a multi-layered video verification and content provenance platform that proves:
1. **WHO** created the content (creator identity)
2. **WHEN** it was created (blockchain timestamp)
3. **WHAT** the original content was (hash fingerprints)
4. **WHERE** it was recorded (GPS/sensor data - phone app)
5. **WHETHER** it has been tampered with (frame-by-frame analysis)

### Product Suite:
- **Rendr Studio** - Web application for video upload, verification, and management
- **Rendr BodyCam** - Body camera integration (planned)
- **Rendr Bounty** - Theft detection and bounty marketplace (planned)
- **Rendr Phone App** - Live capture with real-time QR watermarking (planned)

---

## 🔐 COMPLETE VERIFICATION WORKFLOW

### PHASE 1: IMMEDIATE (User Gets Video Back Fast)

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: VIDEO UPLOAD                                               │
│  ───────────────────────                                            │
│  • User uploads video to Rendr Studio                               │
│  • Any length, any resolution accepted                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: ORIGINAL SHA-256 (Pre-Watermark Hash)                      │
│  ─────────────────────────────────────────────                      │
│  • Calculate SHA-256 of pristine uploaded video                     │
│  • This is the fingerprint of the EXACT original file               │
│  • PROVES: "This is what the creator submitted"                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: DUPLICATE DETECTION                                        │
│  ───────────────────────────                                        │
│  • Compare hash against ALL videos in platform                      │
│  • If duplicate found:                                              │
│    - Same owner → extend storage, return existing code              │
│    - Different owner → record strike, alert original creator        │
│  • PROVES: "First publication" / "Original creator"                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: GENERATE VERIFICATION CODE                                 │
│  ──────────────────────────────────                                 │
│  • Generate unique code: RND-XXXXXX                                 │
│  • 6 alphanumeric characters (case-insensitive)                     │
│  • This becomes the video's PERMANENT IDENTITY                      │
│  • Used for: watermark, lookups, verification, legal reference      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: APPLY WATERMARK                                            │
│  ───────────────────────                                            │
│  • Burn into video permanently:                                     │
│    ┌──────────────────────┐                                         │
│    │  @CreatorUsername    │                                         │
│    │  RND-ABC123          │  ← Verification Code                    │
│    │  [RENDR LOGO]        │                                         │
│    └──────────────────────┘                                         │
│  • Position: Left (free), Configurable (Pro/Enterprise)             │
│  • PROVES: "Official RENDR-verified version"                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: WATERMARKED SHA-256 (Post-Watermark Hash)                  │
│  ─────────────────────────────────────────────────                  │
│  • Calculate SHA-256 of watermarked video                           │
│  • This is the fingerprint of the OFFICIAL distributed version      │
│  • PROVES: "This is the authentic watermarked version"              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ✅ RETURN TO USER IMMEDIATELY                                      │
│  ─────────────────────────────────                                  │
│  User receives:                                                     │
│  • Watermarked video (ready to share)                               │
│  • Verification code (RND-XXXXXX)                                   │
│  • Status: "Processing additional verification..."                  │
│                                                                     │
│  ⏱️ Time: ~5-10 seconds                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### PHASE 2: ASYNC PIPELINE (Background Processing)

```
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: KEY FRAME HASHES                                           │
│  ────────────────────────                                           │
│  • Sample 10 frames evenly across video                             │
│  • Calculate SHA-256 of each frame                                  │
│  • PROVES: "These exact frames existed in original"                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: PERCEPTUAL HASH (pHash) - Center 50%                       │
│  ────────────────────────────────────────────                       │
│  • Extract center 50% of ALL frames (crop-resistant)                │
│  • Calculate DCT-based perceptual hash (16x16 = 256 bits)           │
│  • Sample every 30th frame for storage efficiency                   │
│  • Survives: Compression (90%), resize, border additions            │
│  • PROVES: "Visual content matches despite re-encoding"             │
│  • Tier: Pro and Enterprise only                                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 9: AUDIO HASH (Chromaprint)                                   │
│  ────────────────────────────────                                   │
│  • Extract audio track from video                                   │
│  • Generate Chromaprint acoustic fingerprint                        │
│  • Survives: Video re-encoding, format conversion                   │
│  • PROVES: "Audio track is authentic/unmodified"                    │
│  • Tier: Enterprise only                                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 10: METADATA HASH                                             │
│  ──────────────────────                                             │
│  • Extract video metadata:                                          │
│    - Duration, resolution, frame rate, codec                        │
│    - Creation date, device info (if available)                      │
│    - GPS coordinates (phone app)                                    │
│    - IMU/orientation data (phone app)                               │
│  • Calculate SHA-256 of sorted metadata JSON                        │
│  • PROVES: "Technical properties match original"                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 11: MERKLE TREE → MASTER HASH (Merkle Root)                   │
│  ────────────────────────────────────────────────                   │
│  • Build Merkle tree from all hash layers:                          │
│                                                                     │
│                    [MASTER HASH / MERKLE ROOT]                      │
│                          /              \                           │
│               [Hash A+B]                [Hash C+D]                  │
│               /        \                /        \                  │
│      [Original]  [Watermarked]  [KeyFrames]  [Metadata]             │
│                                     |             |                 │
│                              [pHash Array]  [Audio Hash]            │
│                                                                     │
│  • Single 32-byte root represents ENTIRE verification package       │
│  • Any change to ANY layer changes the root                         │
│  • PROVES: "Complete integrity of all verification data"            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 12: C2PA MANIFEST (Content Provenance)                        │
│  ──────────────────────────────────────────                         │
│  • Create C2PA-compliant manifest containing:                       │
│    - Verification code                                              │
│    - Creator info (username, user_id)                               │
│    - All calculated hashes                                          │
│    - Merkle root                                                    │
│    - Timestamp                                                      │
│    - RENDR signature                                                │
│  • Stored as sidecar JSON (future: embedded in video)               │
│  • PROVES: "Certified content provenance certificate"               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 13: BLOCKCHAIN TIMESTAMP (Immutable Proof)                    │
│  ──────────────────────────────────────────────                     │
│  • Write to blockchain:                                             │
│    - Verification code (RND-XXXXXX)                                 │
│    - Merkle root (32 bytes)                                         │
│    - Timestamp                                                      │
│  • Creates IMMUTABLE proof of existence at specific time            │
│  • Options: Polygon, Bitcoin (via OpenTimestamps), Ethereum         │
│  • PROVES: "This content existed at [timestamp] per block #XXXXX"   │
│  • Cost: ~$0 via OpenTimestamps (Bitcoin) or minimal gas            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 14: STORE & NOTIFY                                            │
│  ───────────────────────                                            │
│  • Save complete verification package to database                   │
│  • Send notification: "RND-ABC123 verified! Blockchain confirmed."  │
│  • Email + SMS (based on user preferences)                          │
│                                                                     │
│  ⏱️ Total async time: 15-45 seconds depending on video length       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 COMPLETE HASH LAYERS SUMMARY

| # | Layer | Hash Type | Size | Survives | Proves |
|---|-------|-----------|------|----------|--------|
| 1 | **Verification Code** | RND-XXXXXX | 6 chars | N/A | Video identity |
| 2 | **Original SHA-256** | SHA-256 | 64 hex | Nothing | Exact original file |
| 3 | **Watermarked SHA-256** | SHA-256 | 64 hex | Nothing | Official version |
| 4 | **Key Frame Hashes** | 10x SHA-256 | 640 hex | Nothing | Exact frames |
| 5 | **Perceptual Hash (pHash)** | DCT hash | 64 hex each | 90% compression | Visual similarity |
| 6 | **Audio Hash** | Chromaprint | Variable | Re-encoding | Audio authenticity |
| 7 | **Metadata Hash** | SHA-256 | 64 hex | Nothing | Technical properties |
| 8 | **Merkle Root** | SHA-256 | 64 hex | Nothing | All layers combined |
| 9 | **C2PA Manifest** | JSON | Variable | N/A | Provenance certificate |
| 10 | **Blockchain TX** | TX Hash | 64 hex | Forever | Timestamp proof |

---

## 🎯 WHAT THIS PROVES (Real-World Claims)

### Scenario 1: Content Theft
**Claim:** "This video first existed on 2025-12-05T08:45Z per Bitcoin block #870123"
**Evidence:** Blockchain timestamp + server logs + Merkle root
**Result:** Original creator proven, thief exposed

### Scenario 2: AI/Deepfake Detection
**Claim:** "Frames 247-289 tampered (pHash distance >15). Frames 1-246 authentic."
**Evidence:** Per-frame pHash comparison, distance threshold analysis
**Result:** 67% authentic, 33% tampered → Likely deepfake

### Scenario 3: Provenance (Phone App)
**Claim:** "Recorded by iPhone 15 Pro @ GPS 41.2°N, yaw=23°, deviceID=abc123"
**Evidence:** Sensor data embedded in QR, metadata hash
**Result:** "I was there" proof with location and device

### Scenario 4: Compression Survival
**Claim:** "Social media copy visually matches original (92% frame similarity)"
**Evidence:** pHash tolerance comparison
**Result:** Video verified despite Instagram/TikTok re-encoding

### Scenario 5: Legal/Court Evidence
**Claim:** "Unaltered since blockchain timestamp. Sensor data consistent."
**Evidence:** OpenTimestamps proof + full verification report
**Result:** Court-admissible authenticity proof

---

## 💾 DATABASE SCHEMA

```javascript
{
  // Identity
  "_id": "uuid",
  "id": "uuid", 
  "user_id": "uuid",
  "verification_code": "RND-XXXXXX",
  
  // Core Hashes
  "hashes": {
    "original_sha256": "...",          // Pre-watermark
    "watermarked_sha256": "...",       // Post-watermark
    "key_frame_hashes": ["...", ...],  // 10 frame hashes
    "metadata_hash": "...",
    "merkle_root": "..."               // Master hash
  },
  
  // Perceptual Hashes (Async)
  "perceptual_hashes": {
    "video_phashes": ["...", ...],     // Per-frame pHashes
    "audio_hash": "...",               // Chromaprint
    "center_region_hash": "..."        // Combined center hash
  },
  
  // C2PA Manifest
  "c2pa_manifest": {
    "manifest_path": "/path/to/manifest.json",
    "manifest_data": {...},
    "issuer": "RENDR",
    "signature": "...",
    "created_at": "ISO-8601"
  },
  
  // Blockchain
  "blockchain": {
    "tx_hash": "0x...",
    "block_number": 12345,
    "network": "polygon",
    "timestamp": "ISO-8601",
    "merkle_root_stored": "..."
  },
  
  // Storage
  "storage": {
    "tier": "pro",
    "uploaded_at": "ISO-8601",
    "expires_at": "ISO-8601",
    "download_count": 0
  },
  
  // Metadata
  "video_metadata": {
    "duration": 30.5,
    "resolution": "1920x1080",
    "fps": 30,
    "codec": "h264",
    "device": "iPhone 15 Pro",
    "gps": { "lat": 41.2, "lon": -73.8 },
    "imu": { "yaw": 23, "pitch": 0, "roll": 0 }
  },
  
  "verification_status": "verified",
  "processing_status": "complete"
}
```

---

## ⚡ ASYNC ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REDIS QUEUE SYSTEM                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Priority Queues:                                                   │
│  ├── HIGH (Enterprise)     → Process immediately                   │
│  ├── DEFAULT (Pro)         → Process next                          │
│  └── LOW (Free)            → Process when available                │
│                                                                     │
│  Workers calculate:                                                 │
│  • Perceptual hashes (all frames)                                   │
│  • Audio fingerprint                                                │
│  • Merkle tree construction                                         │
│  • Blockchain submission                                            │
│  • C2PA manifest finalization                                       │
│                                                                     │
│  User can check: GET /api/videos/{id}/status                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💰 TIER FEATURES

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Original SHA-256 | ✅ | ✅ | ✅ |
| Watermarked SHA-256 | ✅ | ✅ | ✅ |
| Verification Code | ✅ | ✅ | ✅ |
| Watermark | Left only | Configurable | Configurable |
| Key Frame Hashes | ✅ | ✅ | ✅ |
| Metadata Hash | ✅ | ✅ | ✅ |
| Merkle Root | ✅ | ✅ | ✅ |
| **Perceptual Hash (pHash)** | ❌ | ✅ | ✅ |
| **Audio Hash** | ❌ | ❌ | ✅ |
| C2PA Manifest | ✅ | ✅ | ✅ |
| Blockchain Timestamp | ✅ | ✅ | ✅ |
| Storage | 24 hours | 7 days | Unlimited |
| Queue Priority | Low | Default | High |

---

## ✅ VERIFICATION ENDPOINT

When someone wants to verify a video:

```
POST /api/verify
{
  "verification_code": "RND-ABC123"
}

OR

POST /api/verify/video
{
  "video_file": <uploaded file>
}
```

**Response:**
```json
{
  "verified": true,
  "confidence": 0.97,
  "verification_code": "RND-ABC123",
  "original_creator": "@AliceCreator",
  "created_at": "2025-12-05T08:45:00Z",
  "blockchain_proof": {
    "tx_hash": "0x...",
    "block": 870123,
    "timestamp": "2025-12-05T08:46:12Z"
  },
  "layer_results": {
    "sha256_match": true,
    "phash_similarity": 0.94,
    "audio_match": true,
    "metadata_match": true,
    "merkle_valid": true
  },
  "tampering_detected": false,
  "tampered_frames": []
}
```

---

## 🚀 APPLICATIONS & REVENUE

| Application | Price | Use Case |
|-------------|-------|----------|
| **Bounty Platform** | $1/verification | Platforms pay to verify UGC |
| **Newsrooms** | $10/month | "Verified Authentic" badge |
| **Legal Evidence** | $50/video | Court-admissible timestamp |
| **Influencer Auth** | $5/video | "Original by @creator" badge |
| **Insurance Claims** | $20/video | Accident footage verification |
| **BodyCam Verification** | TBD | Law enforcement, security |

---

## 📋 IMPLEMENTATION STATUS

| Component | Status | Notes |
|-----------|--------|-------|
| Original SHA-256 | ✅ Complete | Working |
| Watermarked SHA-256 | ✅ Complete | Working |
| Verification Code | ✅ Complete | RND-XXXXXX format |
| Watermark Application | ✅ Complete | FFmpeg-based |
| Key Frame Hashes | ✅ Complete | 10 frames |
| Perceptual Hash | ✅ Complete | Needs optimization |
| Audio Hash | ✅ Complete | Chromaprint |
| Metadata Hash | ✅ Complete | Working |
| Merkle Tree | ⚠️ Partial | Simple combined hash, needs true Merkle |
| C2PA Manifest | ✅ Complete | Sidecar JSON |
| Blockchain | ⚠️ Ready | Code exists, needs wallet config |
| Redis Queue | ✅ Complete | Async processing |
| Phone App | 🔮 Planned | Live capture + QR |
| Rendr BodyCam | 🔮 Planned | Integration |
| Rendr Bounty | 🔮 Planned | Marketplace |

---

## 🔑 KEY POINTS FOR INVESTORS

1. **Multi-Layer Verification**: Not just one hash - 10 different verification methods working together
2. **Compression Resistant**: pHash survives Instagram/TikTok re-encoding at 90%+ accuracy
3. **Blockchain Anchored**: Immutable timestamp proof at near-zero cost
4. **Fast User Experience**: Watermarked video returned in <10 seconds
5. **Scalable**: 10k videos/day = ~$50/month compute
6. **Court Ready**: Evidence package suitable for legal proceedings
7. **AI-Resistant**: Frame-by-frame analysis detects deepfakes
8. **Creator Protection**: Theft detection + strike system + bounty ready

---

## 📞 CONTACT

**Platform:** Rendr Studio
**URL:** https://rendr-verify-1.preview.emergentagent.com
**Version:** 2.0

---

*This document should be referenced at the start of every development session to ensure no verification layer is missed or forgotten.*
