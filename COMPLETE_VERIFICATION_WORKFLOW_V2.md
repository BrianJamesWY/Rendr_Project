# RENDR Complete Verification System v2.0
**Updated:** December 9, 2025
**Includes:** Dual SHA-256, C2PA Integration, Provisional Status

---

## 🎯 **CORE PRINCIPLE**

**We verify videos at MULTIPLE layers so verification works regardless of how the video is used:**

1. **Pristine Original Verification** → User has unmodified file
2. **Watermarked Version Verification** → User has our watermarked file
3. **Compressed/Edited Verification** → User has re-encoded version
4. **C2PA Standard Compliance** → Industry-standard provenance

---

## 📋 **COMPLETE HASHING WORKFLOW**

### **Phase 1: Upload & Immediate Processing (0-5 seconds)**

```
1. User uploads video (original.mp4)
   ↓
2. Generate verification code: "ABC12XYZ"
   ↓
3. Calculate SHA-256 of ORIGINAL (pre-watermark):
   original_sha256 = "98ca9da216..."
   ↓
4. Extract 10 key frames from ORIGINAL
   Calculate SHA-256 of each frame:
   key_frame_hashes = ["hash1", "hash2", ..., "hash10"]
   ↓
5. Apply watermark (FFmpeg):
   - Verification code: ABC12XYZ
   - Username: BrianJames
   - RENDR logo
   - QR code (Enterprise tier)
   ↓
6. Calculate SHA-256 of WATERMARKED video:
   watermarked_sha256 = "0c64d3d213..."
   ↓
7. ** RETURN WATERMARKED VIDEO TO USER IMMEDIATELY **
   Response: {
     watermarkedVideoUrl: "https://...",
     code: "ABC12XYZ",
     status: "processing",
     original_sha256: "98ca9da216...",
     watermarked_sha256: "0c64d3d213..."
   }
```

**User Wait Time:** 3-5 seconds
**User Gets:** Watermarked video + verification code + provisional hashes

---

### **Phase 2: Background Processing (5-60 seconds)**

```
Background Job Started
   ↓
8. Extract metadata (ffprobe):
   - Duration, resolution, FPS, codec
   - Device info (EXIF/XMP)
   - GPS, timestamp, camera model
   metadata_hash = SHA-256(metadata)
   ↓
9. Calculate perceptual video hashes:
   For every 30th frame:
     - Extract center 50% of frame
     - Calculate pHash (DCT-based, 16x16)
     - Store: phash_array = ["phash1", "phash2", ...]
   Status: "🔍 pHash 45% (400/900 frames)"
   ↓
10. Calculate perceptual audio hash:
    - Extract audio waveform
    - Sample every 1000th byte
    - Calculate SHA-256 of samples
    audio_hash = "726aa0de17..."
    Status: "🔊 Audio verified"
    ↓
11. Create C2PA manifest:
    - Package all hashes + metadata
    - Sign with RENDR private key
    - Embed in video file (XMP sidecar)
    - Generate hard binding
    Status: "📜 C2PA manifest created"
    ↓
12. Blockchain timestamping:
    - Submit master_hash to Polygon
    - Get transaction hash
    - Store: blockchain_tx = "0x123abc..."
    Status: "⛓️ Blockchain stamping..."
    ↓
13. Create master hash:
    master_hash = SHA-256(
      code + 
      original_sha256 + 
      watermarked_sha256 + 
      metadata_hash + 
      audio_hash + 
      join(key_frame_hashes) + 
      join(phash_array) + 
      timestamp
    )
    ↓
14. Save to database
    ↓
15. Notify user: "🎉 Complete! View proof"
```

**Background Time:** 10-60 seconds
**User Can:** Download video, share code, view provisional hashes

---

## 🔍 **VERIFICATION METHODS**

### **Method 1: Verify by Code (Instant)**

```
User enters: "ABC12XYZ"
   ↓
Query database:
   - Find record with verification_code = "ABC12XYZ"
   - Return all stored data
   ↓
Response: {
  verified: true,
  confidence: "100% (code lookup)",
  original_uploader: "BrianJames",
  uploaded_at: "2025-12-09T14:01:40Z",
  video_metadata: {...},
  blockchain_proof: "0x123abc...",
  c2pa_manifest: {...}
}
```

**Use Case:** Quick verification without re-uploading video

---

### **Method 2: Verify Original (Pre-Watermark) Video**

```
User submits: original.mp4 (no watermark)
   ↓
1. Calculate SHA-256 of submitted video
   submitted_sha256 = "98ca9da216..."
   ↓
2. Search database:
   WHERE original_sha256 = "98ca9da216..."
   ↓
3. If exact match found:
   Result: {
     verified: true,
     confidence: "100% (PRISTINE ORIGINAL)",
     match_type: "exact_sha256",
     verification_code: "ABC12XYZ",
     status: "This is the unmodified original file"
   }
   ↓
4. If no exact match:
   Calculate key frame hashes
   Compare with database
   If 8+/10 frames match:
     confidence: 80%+
   Else:
     Fall through to perceptual hashing
```

**Use Case:** User has original file, wants to verify it's theirs

---

### **Method 3: Verify Watermarked Video**

```
User submits: watermarked.mp4 (with our watermark)
   ↓
1. Calculate SHA-256 of submitted video
   submitted_sha256 = "0c64d3d213..."
   ↓
2. Search database:
   WHERE watermarked_sha256 = "0c64d3d213..."
   ↓
3. If exact match found:
   Result: {
     verified: true,
     confidence: "100% (WATERMARKED VERSION)",
     match_type: "exact_sha256_watermarked",
     verification_code: "ABC12XYZ",
     status: "This is our watermarked file"
   }
   ↓
4. If no exact match but watermark detected:
   - OCR/detect verification code from watermark
   - Look up by code
   - Calculate perceptual hashes
   - Compare similarity
```

**Use Case:** User has our watermarked file, wants to verify

---

### **Method 4: Verify Compressed/Edited Video**

```
User submits: compressed.mp4 (re-encoded, edited, cropped)
   ↓
1. Calculate SHA-256 (will NOT match - expected)
   ↓
2. Extract C2PA manifest (if present):
   - Read embedded manifest
   - Verify signature
   - Extract original verification code
   - Look up in database
   If valid C2PA:
     confidence: 95%+
     Jump to response
   ↓
3. Calculate perceptual hashes:
   - Sample frames (center 50%)
   - Calculate pHash for each
   phash_array = ["phash1", "phash2", ...]
   ↓
4. Compare with database (all videos):
   For each stored video:
     similarity = compare_phashes(
       submitted_phash_array,
       stored_phash_array
     )
     If similarity > 85%:
       Match found!
   ↓
5. Calculate audio hash similarity
   If audio_similarity > 80%:
     confidence += 10%
   ↓
6. Weighted confidence score:
   final_confidence = (
     perceptual_similarity * 1.5 +
     audio_similarity * 1.0 +
     metadata_similarity * 0.5
   ) / 3.0
   ↓
Response: {
  verified: true/false,
  confidence: "87% (COMPRESSED VERSION)",
  match_type: "perceptual_hash",
  verification_code: "ABC12XYZ",
  matches: {
    perceptual: {score: 0.89, frames_matched: 780/900},
    audio: {score: 0.92},
    metadata: {score: 0.50, note: "Modified during encoding"}
  },
  warnings: ["Video was re-encoded", "Resolution changed"],
  original_uploader: "BrianJames",
  uploaded_at: "2025-12-09T14:01:40Z"
}
```

**Use Case:** User has compressed/edited version, needs verification

---

## 🏆 **C2PA INTEGRATION**

### **What is C2PA?**

**Coalition for Content Provenance and Authenticity** - Industry standard for content authenticity.

**Key Benefits:**
- **Standard Compliance:** Industry-recognized format
- **Cryptographic Proof:** Digitally signed manifests
- **Edit History:** Track full provenance chain
- **Hardware Support:** Snapdragon 8 Gen 3+ devices
- **Platform Recognition:** Adobe, Microsoft, BBC support it

### **How C2PA Works:**

```
1. Create C2PA Manifest:
   {
     "claim_generator": "RENDR v1.0",
     "title": "12/04/2025 Test 1",
     "format": "video/mp4",
     "instance_id": "xmp.iid:abc123",
     
     "assertions": [
       {
         "label": "c2pa.hash.data",
         "data": {
           "alg": "sha256",
           "hash": "98ca9da216...",
           "name": "original_video"
         }
       },
       {
         "label": "stds.schema-org.CreativeWork",
         "data": {
           "author": {"name": "BrianJames"},
           "datePublished": "2025-12-09T14:01:40Z"
         }
       },
       {
         "label": "c2pa.actions",
         "data": {
           "actions": [
             {
               "action": "c2pa.created",
               "softwareAgent": "iPhone 14 Pro",
               "when": "2025-12-03T16:10:37-07:00"
             },
             {
               "action": "c2pa.edited",
               "softwareAgent": "RENDR Watermark v1.0",
               "when": "2025-12-09T14:01:40Z",
               "changes": [{"description": "Added watermark"}]
             }
           ]
         }
       },
       {
         "label": "rendr.verification",
         "data": {
           "verification_code": "ABC12XYZ",
           "key_frame_hashes": [...],
           "perceptual_hashes": [...],
           "audio_hash": "...",
           "master_hash": "..."
         }
       }
     ],
     
     "signature": {
       "alg": "es256",
       "signature_value": "base64_signature...",
       "certificate_chain": [...]
     }
   }
   ↓
2. Embed manifest in video:
   - XMP sidecar file: video.mp4.c2pa
   - OR embedded in MP4 container (udta box)
   ↓
3. Create hard binding:
   - Hash the video content
   - Include hash in signed manifest
   - Any video modification breaks signature
   ↓
4. User can verify:
   - Extract manifest
   - Verify signature with RENDR public key
   - Check hash binding
   - View full provenance chain
```

### **C2PA Verification:**

```
User submits video with C2PA manifest:
   ↓
1. Extract manifest from video
   ↓
2. Verify digital signature:
   - Check certificate chain
   - Verify RENDR signature
   Result: Valid/Invalid
   ↓
3. Verify hard binding:
   - Calculate video hash
   - Compare with manifest hash
   Result: Bound/Unbound
   ↓
4. Extract RENDR assertions:
   - verification_code
   - key_frame_hashes
   - perceptual_hashes
   - original metadata
   ↓
5. Look up in database by code
   ↓
6. Compare hashes:
   If C2PA signature valid + hashes match:
     confidence = 100%
   ↓
Response: {
  verified: true,
  confidence: "100% (C2PA VERIFIED)",
  c2pa_status: {
    signature_valid: true,
    hard_binding_valid: true,
    manifest_issuer: "RENDR",
    certificate_valid: true
  },
  provenance: {
    created_on: "iPhone 14 Pro",
    created_at: "2025-12-03T16:10:37-07:00",
    edited_by: "RENDR Watermark v1.0",
    edited_at: "2025-12-09T14:01:40Z"
  }
}
```

---

## 🚀 **PROVISIONAL STATUS UI**

### **Real-Time Progress (SSE/WebSocket)**

```javascript
// Frontend React Component
function VideoStatus({ code }) {
  const [status, setStatus] = useState({
    stage: 'uploading',
    progress: 0,
    eta: null
  });
  
  useEffect(() => {
    // Connect to SSE stream
    const eventSource = new EventSource(
      `/api/videos/${code}/stream`
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data);
    };
    
    // Fallback polling if SSE fails
    const pollInterval = setInterval(async () => {
      if (eventSource.readyState !== EventSource.OPEN) {
        const res = await fetch(`/api/videos/${code}/status`);
        const data = await res.json();
        setStatus(data);
      }
    }, 2000);
    
    return () => {
      eventSource.close();
      clearInterval(pollInterval);
    };
  }, [code]);
  
  const stages = {
    'watermark': '✅ Watermarked',
    'phash': `🔍 pHash ${status.progress}%`,
    'audio': '🔊 Audio hash',
    'c2pa': '📜 C2PA manifest',
    'timestamp': '⛓️ Blockchain',
    'complete': '🎉 Verified!'
  };
  
  return (
    <div className="status-card">
      <h3>Video {code}</h3>
      
      {/* Progress Bar */}
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{width: `${status.progress}%`}}
        />
      </div>
      
      {/* Status Text */}
      <p className="status-text">
        {stages[status.stage] || '⏳ Processing...'}
      </p>
      
      {/* ETA */}
      {status.eta && (
        <p className="eta">{status.eta} remaining</p>
      )}
      
      {/* Provisional Hashes */}
      {status.provisional && status.stage !== 'complete' && (
        <button onClick={() => viewProvisional(code)}>
          View provisional hashes
        </button>
      )}
      
      {/* Full Verification */}
      {status.stage === 'complete' && (
        <a href={`/verify/${code}`} className="btn-primary">
          Full verification ready
        </a>
      )}
    </div>
  );
}
```

### **Backend Status Endpoint**

```javascript
// Express.js Backend
app.get('/api/videos/:code/status', async (req, res) => {
  const { code } = req.params;
  const status = await redis.get(`status:${code}`);
  res.json(JSON.parse(status));
});

app.get('/api/videos/:code/stream', (req, res) => {
  const { code } = req.params;
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Subscribe to Redis pub/sub for this video
  const subscriber = redis.duplicate();
  subscriber.subscribe(`progress:${code}`);
  
  subscriber.on('message', (channel, message) => {
    res.write(`data: ${message}\n\n`);
  });
  
  req.on('close', () => {
    subscriber.unsubscribe();
    subscriber.quit();
  });
});

// Background Job Progress Updates
job.on('progress', (progress) => {
  const status = {
    stage: job.data.stage,
    progress: progress,
    eta: calculateETA(progress)
  };
  
  // Broadcast to all connected clients
  redis.publish(
    `progress:${job.data.code}`,
    JSON.stringify(status)
  );
});
```

---

## 💾 **DATABASE SCHEMA (Complete)**

```javascript
{
  _id: "uuid",
  id: "uuid",
  verification_code: "ABC12XYZ",
  user_id: "user_uuid",
  
  // SHA-256 Hashes (BOTH versions)
  hashes: {
    original_sha256: "98ca9da216...",      // Pre-watermark
    watermarked_sha256: "0c64d3d213...",   // Post-watermark
    key_frame_hashes: ["hash1", ..., "hash10"],
    metadata_hash: "d900b1948f..."
  },
  
  // Perceptual Hashes (Compression-resistant)
  perceptual_hashes: {
    video_phashes: ["phash1", "phash2", ...],  // 30-300 hashes
    audio_hash: "726aa0de17...",
    center_region_hash: "4a224954..."
  },
  
  // Master Hash (All combined)
  master_hash: "ccb515161736...",
  
  // C2PA Manifest
  c2pa_manifest: {
    manifest_url: "https://.../video.mp4.c2pa",
    signature_valid: true,
    hard_binding_valid: true,
    issuer: "RENDR",
    created_at: "2025-12-09T14:01:40Z"
  },
  
  // Blockchain
  blockchain: {
    transaction_hash: "0x123abc...",
    network: "polygon",
    timestamp: "2025-12-09T14:02:15Z",
    block_number: 12345678
  },
  
  // Video Metadata
  video_metadata: {
    duration: 5.54,
    resolution: "1920x1080",
    fps: 59.94,
    codec: "H.264",
    audio_codec: "AAC",
    device: "iPhone 14 Pro",
    gps_location: "Montana",
    captured_at: "2025-12-03T16:10:37-07:00",
    file_size: 15590000
  },
  
  // Processing Status
  processing_status: {
    status: "complete",  // uploading | watermarking | processing | complete | error
    progress: 100,
    current_stage: "complete",
    started_at: "2025-12-09T14:01:40Z",
    completed_at: "2025-12-09T14:02:15Z",
    eta: null
  },
  
  // Storage
  storage: {
    tier: "enterprise",
    original_path: "uploads/originals/uuid.mp4",
    watermarked_path: "uploads/videos/uuid.mp4",
    thumbnail_path: "uploads/thumbnails/uuid.jpg",
    expires_at: null
  },
  
  // Verification Stats
  verification_stats: {
    total_verifications: 3,
    last_verified_at: "2025-12-09T15:30:00Z",
    verification_methods: ["code_lookup", "perceptual_hash"]
  },
  
  uploaded_at: "2025-12-09T14:01:40Z",
  updated_at: "2025-12-09T14:02:15Z"
}
```

---

## 🎯 **VERIFICATION CONFIDENCE MATRIX**

| Verification Type | Confidence | Use Case |
|------------------|-----------|----------|
| Code Lookup | 100% | User has code, wants info |
| Original SHA-256 Match | 100% | User has pristine original |
| Watermarked SHA-256 Match | 100% | User has our exact watermarked file |
| Key Frame 10/10 Match | 100% | Pristine video, all frames identical |
| C2PA Signature Valid | 95-100% | Industry standard verification |
| Key Frame 8-9/10 Match | 80-90% | Minor alterations detected |
| Perceptual >90% | 85-95% | Compressed but recognizable |
| Perceptual 80-90% | 70-85% | Significantly compressed/edited |
| Perceptual 70-80% | 60-75% | Heavily edited but similar |
| Perceptual <70% | <60% | Different video or corrupted |

---

## ✅ **ADVANTAGES OF DUAL SHA-256**

### **Why Two SHA-256 Hashes?**

1. **Pristine Original Verification:**
   - `original_sha256` proves user has unmodified file
   - Useful for legal/forensic purposes
   - "This is exactly what was uploaded"

2. **Watermarked File Verification:**
   - `watermarked_sha256` proves user has our official file
   - Faster than perceptual hashing
   - "This is our verified, watermarked version"

3. **Duplicate Detection:**
   - Check `original_sha256` first before processing
   - Prevent re-uploading same video
   - Return existing verification code

4. **Chain of Custody:**
   - Track: Original → Watermarked → Distributed
   - Prove watermark was added by us
   - Verify watermark hasn't been removed

### **Verification Decision Tree:**

```
Video submitted
    ↓
Calculate SHA-256
    ↓
┌───────────────────────────────────────┐
│ Match original_sha256?                │
└───────────────────────────────────────┘
    YES ↓                     NO ↓
    100% Pristine         Check watermarked_sha256
    Return code               ↓
                      ┌───────────────────────────┐
                      │ Match watermarked_sha256? │
                      └───────────────────────────┘
                          YES ↓          NO ↓
                          100% Our File  Extract C2PA
                          Return code        ↓
                                      ┌──────────────┐
                                      │ C2PA Valid?  │
                                      └──────────────┘
                                      YES ↓      NO ↓
                                      95%+       Calculate
                                      Return     Perceptual
                                                    ↓
                                              85-95% match?
                                                    ↓
                                              YES: Verified
                                              NO: Not verified
```

---

## 🚀 **IMPLEMENTATION PRIORITIES**

### **Phase 1: Core Dual-Hash System** (This Week)
1. Update upload to calculate BOTH SHA-256 hashes
2. Store both in database
3. Update verification to check both
4. Test with your iPhone video

### **Phase 2: C2PA Integration** (Next Week)
1. Install c2pa-python library
2. Create manifest generator
3. Embed manifests in videos
4. Build C2PA verification endpoint
5. Test with C2PA verification tools

### **Phase 3: Provisional Status** (Following Week)
1. Set up Redis for pub/sub
2. Create SSE streaming endpoints
3. Build React status component
4. Add Web Push notifications
5. Test real-time updates

### **Phase 4: Production Hardening**
1. Load testing
2. Error handling
3. Monitoring & alerts
4. Documentation
5. API versioning

---

**Bottom Line:** With dual SHA-256, perceptual hashing, C2PA compliance, and provisional status, RENDR provides the most comprehensive video verification system possible. Users can verify videos whether they have the pristine original, our watermarked version, or a compressed/edited copy.
