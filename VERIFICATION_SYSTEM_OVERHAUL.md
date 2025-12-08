# RENDR Verification System - Complete Overhaul
**Date:** December 9, 2025
**Priority:** CRITICAL
**Status:** Implementation in Progress

---

## 🚨 **PROBLEM IDENTIFIED**

### **What Went Wrong:**
At some point during previous forks, the comprehensive multi-layered verification system was replaced with a **single SHA-256 hash of the unmodified video**. This is completely inadequate because:

1. ❌ SHA-256 doesn't survive **any** compression or re-encoding
2. ❌ No perceptual hashing = can't detect similar/edited videos
3. ❌ No audio verification = audio tracks can be swapped
4. ❌ No frame-level verification = can't prove pristine originals
5. ❌ Single point of failure = easily defeated

**Result:** The core verification feature is broken for 99% of real-world use cases.

---

## ✅ **CORRECT SYSTEM (Original Design)**

### **Multi-Layered Verification Pipeline:**

#### **Layer 1: Key Frame Exact Hashing**
- **Method:** SHA-256 of 10 evenly-spaced frames
- **Purpose:** Detect pristine, unmodified originals
- **Survives:** Nothing (that's the point - proves it's untouched)
- **Use Case:** Proving video is 100% original

#### **Layer 2: Perceptual Video Hashing**
- **Method:** pHash (DCT-based) on center 50% of each frame
- **Purpose:** Detect videos even after compression/cropping
- **Survives:** ~85-95% compression, border cropping, minor color adjustments
- **Use Case:** Detecting re-uploads, compressed copies

#### **Layer 3: Perceptual Audio Hashing**
- **Method:** Chromaprint/AcoustID or waveform sampling
- **Purpose:** Verify audio track hasn't been replaced
- **Survives:** ~90% compression, format changes
- **Use Case:** Detecting audio swaps, dubbed versions

#### **Layer 4: Metadata Hashing**
- **Method:** SHA-256 of EXIF/XMP metadata
- **Purpose:** Track metadata preservation
- **Survives:** If metadata is preserved through processing
- **Use Case:** Device/camera verification, timestamps

#### **Master Hash:**
- **Method:** Combined hash of all layers + verification code + timestamp
- **Purpose:** Ultimate signature of the video
- **Use Case:** Database lookup, API verification

---

## 🔄 **COMPLETE WORKFLOW**

### **Upload Flow:**

```
1. User uploads video
   ↓
2. Generate verification code (8-char alphanumeric)
   ↓
3. Calculate SHA-256 of ORIGINAL video (pre-watermark)
   ↓
4. Apply watermark (code + username + logo)
   ↓
5. ** RETURN WATERMARKED VIDEO IMMEDIATELY **
   ↓
6. Queue for async comprehensive hashing:
   - Layer 1: Key frame hashes (10 frames)
   - Layer 2: Perceptual hashes (center 50%)
   - Layer 3: Audio perceptual hash
   - Layer 4: Metadata hash
   - Master hash creation
   ↓
7. Save to database:
   {
     verification_code: "ABC12XYZ",
     key_frame_hashes: ["hash1", "hash2", ...],
     perceptual_hashes: ["phash1", "phash2", ...],
     audio_hash: "audio_hash",
     metadata_hash: "meta_hash",
     master_hash: "combined_hash",
     video_metadata: {...},
     uploaded_at: "2025-12-09T...",
     user_id: "...",
     tier: "enterprise"
   }
   ↓
8. Notify user: "Video processing complete"
```

### **Verification Flow:**

```
1. User submits video or code
   ↓
2. If code: Look up in database
   ↓
3. If video: Calculate same hashes
   ↓
4. Compare all layers:
   - Key frames: 100% match? → PRISTINE
   - Perceptual: >85% match? → COMPRESSED COPY
   - Audio: Match? → AUDIO INTACT
   - Metadata: Match? → METADATA PRESERVED
   ↓
5. Calculate weighted confidence score:
   - Key frames: 2.0x weight
   - Perceptual: 1.5x weight
   - Audio: 1.0x weight
   - Metadata: 0.5x weight
   ↓
6. Return verification result:
   {
     verified: true/false,
     confidence: 0.92,
     matches: {
       key_frames: {score: 1.0, status: "PRISTINE"},
       perceptual: {score: 0.89, status: "COMPRESSED"},
       audio: {score: 1.0, status: "INTACT"},
       metadata: {score: 0.5, status: "MODIFIED"}
     },
     warnings: ["Video was re-encoded but content matches"],
     original_upload: "2025-12-09T...",
     uploader: "BrianJames"
   }
```

---

## 📊 **VERIFICATION CONFIDENCE SCORING**

### **Confidence Levels:**

- **100%:** All layers match perfectly → PRISTINE ORIGINAL
- **85-99%:** Perceptual matches, key frames differ → COMPRESSED/RE-ENCODED
- **70-84%:** Significant compression, some edits → MODIFIED VERSION
- **50-69%:** Major alterations detected → HEAVILY EDITED
- **<50%:** Different video or corrupted → NOT VERIFIED

### **Tier-Based Verification:**

**Free Tier:**
- Layer 1: Key frame hashes
- Layer 4: Metadata hash
- Basic verification only

**Pro Tier:**
- Layer 1: Key frame hashes
- Layer 2: Perceptual hashes (30 frames)
- Layer 4: Metadata hash
- Compression-resistant verification

**Enterprise Tier:**
- All 4 layers
- Layer 3: Audio perceptual hash
- Maximum protection
- QR code watermarking (premium feature)

---

## 🎯 **ASYNC PROCESSING BENEFITS**

### **Why Async?**

1. **Fast User Experience:** Return watermarked video in <5 seconds
2. **No Waiting:** Comprehensive hashing happens in background (can take 30-60s for large videos)
3. **Provisional Status:** User sees "Processing..." with progress bar
4. **Notification:** Email/SMS when complete
5. **Scalability:** Can process thousands of videos simultaneously

### **Status Display:**

```javascript
{
  status: "processing",
  progress: 65,
  current_step: "Calculating perceptual hashes",
  estimated_completion: "30 seconds",
  provisional_code: "ABC12XYZ"
}
```

User can:
- Download watermarked video immediately
- Share verification code immediately
- See processing progress
- Get notified when complete

---

## 🔐 **PREMIUM FEATURES (Enterprise)**

### **QR Code Watermarking:**

#### **Concept:**
Embed QR code in video frames using advanced steganography

#### **Methods to Explore:**

1. **LSB (Least Significant Bit):**
   - Pro: Nearly invisible
   - Con: Doesn't survive compression well
   - Solution: Combine with Reed-Solomon error correction

2. **ISB (Intermediate Significant Bit):**
   - Pro: More robust than LSB
   - Con: Slightly more visible
   - Sweet spot for compression resistance

3. **DCT Domain (Spread Spectrum):**
   - Pro: Very compression-resistant
   - Con: Complex implementation
   - Best for copyright proof

4. **DWT Domain (Wavelet Transform):**
   - Pro: Excellent for video
   - Con: Higher computational cost
   - Alternative to DCT

5. **Semi-Transparent Overlay:**
   - Pro: Simple, visible deterrent
   - Con: Aesthetic concerns
   - User choice: visible vs hidden

#### **QR Code Contents:**
```json
{
  "code": "ABC12XYZ",
  "verify_url": "rendr.com/v/ABC12XYZ",
  "upload_date": "2025-12-09",
  "master_hash": "first_32_chars..."
}
```

#### **Reed-Solomon Integration:**
- Add error correction to QR code
- Allows recovery even if 30% of QR is damaged
- Survives heavy compression

---

## 🚀 **IMPLEMENTATION STATUS**

### **✅ Completed:**
1. Created `comprehensive_hash_service.py` - All 4 layers implemented
2. Created `async_video_processor.py` - Background processing system
3. FFmpeg installed and verified
4. Watermarking infrastructure ready

### **⏳ In Progress:**
1. Update video upload API to use new system
2. Return watermarked video immediately
3. Queue async hashing
4. Add processing status endpoint
5. Frontend progress indicator

### **📋 TODO:**
1. Test complete upload → watermark → hash pipeline
2. Test verification with compressed videos
3. Implement QR code watermarking (Enterprise)
4. Add progress notifications
5. Create status polling endpoint
6. Update frontend to show processing status

---

## 🧪 **TESTING PLAN**

### **Test Cases:**

1. **Upload pristine video:**
   - Expected: 100% confidence, all layers match
   
2. **Upload compressed copy:**
   - Expected: 85-95% confidence, perceptual matches

3. **Upload with audio swap:**
   - Expected: <70% confidence, audio mismatch detected

4. **Upload cropped version:**
   - Expected: 80-90% confidence (pHash on center survives)

5. **Upload heavily edited:**
   - Expected: <50% confidence, not verified

6. **Re-submit same video:**
   - Expected: Duplicate detected, return original code

---

## 📝 **DATABASE SCHEMA**

### **Video Document (Updated):**

```javascript
{
  _id: "uuid",
  id: "uuid",
  verification_code: "ABC12XYZ",
  user_id: "user_uuid",
  
  // Original (for duplicate detection)
  original_hash: "sha256_of_unmodified",
  
  // Comprehensive hashes (calculated async)
  comprehensive_hashes: {
    verification_code: "ABC12XYZ",
    tier: "enterprise",
    timestamp: "2025-12-09T...",
    
    key_frame_hashes: ["hash1", "hash2", ...],  // 10 hashes
    perceptual_hashes: ["phash1", ...],         // Variable count
    audio_hash: "audio_perceptual_hash",
    metadata_hash: "metadata_sha256",
    master_hash: "combined_signature",
    
    video_metadata: {
      duration: 5.54,
      resolution: "1920x1080",
      fps: 59.94,
      codec: "H.264",
      // ... more metadata
    }
  },
  
  // Processing status
  processing_status: {
    status: "complete",  // "processing" | "complete" | "error"
    progress: 100,
    started_at: "...",
    completed_at: "...",
    current_step: "..."
  },
  
  // Storage
  storage: {
    tier: "enterprise",
    expires_at: null,
    watermarked_path: "uploads/videos/uuid.mp4",
    original_size: 15590000,
    watermarked_size: 15612000
  },
  
  // Legacy fields
  uploaded_at: "...",
  thumbnail_path: "...",
  // ...
}
```

---

## 🎬 **NEXT STEPS**

1. Update `/app/backend/api/videos.py` upload endpoint
2. Integrate `comprehensive_hash_service` 
3. Integrate `async_video_processor`
4. Add status endpoint `/api/videos/{id}/processing-status`
5. Test with real iPhone video
6. Verify watermarks appear correctly
7. Test compression resistance
8. Document API changes

---

**Bottom Line:** The original design was brilliant and comprehensive. We're restoring it now with async processing for the best user experience.
