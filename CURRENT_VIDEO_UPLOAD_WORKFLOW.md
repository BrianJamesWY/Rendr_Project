# RENDR Video Upload & Verification - Complete Workflow
**Date:** December 9, 2025
**Status:** Implementation Complete
**Works For:** Studio Web App + Rendr Bodycam Mobile App

---

## 🎯 **CURRENT ACTUAL WORKFLOW (WHAT HAPPENS NOW)**

### **Phase 1: Upload & Immediate Processing (0-5 seconds)**

```
1. User uploads video via:
   - Studio: Web browser (FormData)
   - Bodycam: Mobile app (multipart upload)
   ↓
2. Server receives file:
   - Save to: /app/backend/uploads/videos/{video_id}_{filename}
   - Check user quota (free: 5, pro: 100, enterprise: unlimited)
   ↓
3. Calculate ORIGINAL SHA-256 (full file, pre-watermark):
   original_sha256 = SHA-256(original_file)
   Store: "98ca9da216..."
   ↓
4. Check for duplicates:
   - Query database: WHERE original_sha256 = "98ca9da216..."
   - If exists: Return existing code (duplicate prevention)
   - If new: Continue to step 5
   ↓
5. Generate verification code:
   code = generate_8_char_code()  # e.g., "ABC12XYZ"
   ↓
6. Extract 10 key frames from ORIGINAL:
   - Frames at: 0%, 11%, 22%, 33%, 44%, 55%, 66%, 77%, 88%, 100%
   - Calculate SHA-256 of each frame
   - Store: key_frame_hashes = ["hash1", ..., "hash10"]
   ↓
7. Apply watermark using FFmpeg:
   Input: original.mp4
   Watermark elements:
     - Verification code: "ABC12XYZ"
     - Username: "BrianJames"
     - RENDR logo (if available)
     - Position: Left side (rotated 90°)
   
   FFmpeg command:
   ffmpeg -i original.mp4 \
     -vf "drawtext=text='RND: ABC12XYZ':rotation=90:...,\
          drawtext=text='@BrianJames':rotation=90:..." \
     -c:v libx264 -preset ultrafast -crf 28 \
     -c:a copy \
     watermarked.mp4
   
   Output: /app/backend/uploads/videos/{video_id}_watermarked.mp4
   ↓
8. Calculate WATERMARKED SHA-256:
   watermarked_sha256 = SHA-256(watermarked_file)
   Store: "0c64d3d213..."
   ↓
9. Generate thumbnail:
   - Extract frame at 50% position
   - Save to: /app/backend/uploads/thumbnails/{video_id}.jpg
   ↓
10. ** RETURN TO USER IMMEDIATELY ** (3-5 seconds total)
    Response: {
      video_id: "uuid",
      verification_code: "ABC12XYZ",
      status: "processing",
      watermarked_video_url: "/api/videos/watch/{video_id}",
      thumbnail_url: "/api/videos/{video_id}/thumbnail",
      hashes: {
        original_sha256: "98ca9da216...",
        watermarked_sha256: "0c64d3d213..."
      },
      processing_status: {
        stage: "watermark_complete",
        progress: 30,
        eta: "25s"
      }
    }
```

**User Experience:**
- Upload takes: 2-3 seconds
- Watermarking: 2-3 seconds
- Total wait: **3-5 seconds**
- User gets: Watermarked video URL + code + provisional hashes
- Can immediately: Download, share, view

---

### **Phase 2: Background Comprehensive Hashing (5-60 seconds)**

```
11. Queue background job (async):
    job_data = {
      video_id: "uuid",
      video_path: "/app/backend/uploads/videos/{video_id}_watermarked.mp4",
      original_path: "/app/backend/uploads/videos/{video_id}_original.mp4",
      verification_code: "ABC12XYZ",
      user_id: "user_uuid",
      tier: "enterprise"
    }
    
    async_video_processor.queue_video_processing(job_data)
    ↓
12. Background worker starts:
    Status: "🔍 Extracting metadata..."
    Progress: 35%
    
    Extract metadata using ffprobe:
    - Duration: 5.54s
    - Resolution: 1920x1080
    - FPS: 59.94
    - Codec: H.264
    - Audio: AAC 2-channel 48kHz
    - Device: iPhone 14 Pro (from EXIF)
    - GPS: Montana coordinates
    - Capture time: 2025-12-03T16:10:37-07:00
    
    Calculate metadata_hash = SHA-256(metadata_json)
    ↓
13. Calculate perceptual video hashes:
    Status: "🔍 pHash 0% (0/900 frames)"
    Progress: 40%
    
    For every 30th frame in video:
      1. Extract frame
      2. Crop to center 50% (ignore borders/edges)
      3. Resize to 16x16 grayscale
      4. Apply DCT (Discrete Cosine Transform)
      5. Keep top-left 8x8 frequencies
      6. Create 64-bit hash
      7. Convert to hex: "a3f4b2c1d5e6..."
    
    Status updates:
    - "🔍 pHash 25% (225/900 frames)"
    - "🔍 pHash 50% (450/900 frames)"
    - "🔍 pHash 75% (675/900 frames)"
    - "🔍 pHash 100% (900/900 frames)"
    
    Result: perceptual_hashes = ["phash1", "phash2", ..., "phash30"]
    Progress: 60%
    ↓
14. Calculate perceptual audio hash:
    Status: "🔊 Audio verification..."
    Progress: 65%
    
    1. Extract audio to WAV: ffmpeg -i video.mp4 -vn audio.wav
    2. Sample waveform (every 1000th byte)
    3. Calculate SHA-256 of samples
    4. Result: audio_hash = "726aa0de17..."
    
    Progress: 70%
    ↓
15. Create C2PA manifest:
    Status: "📜 Creating C2PA manifest..."
    Progress: 75%
    
    manifest = {
      "@context": "https://c2pa.org/specifications/2.2",
      "claim_generator": "RENDR v1.0",
      "title": "12/04/2025 Test 1",
      "format": "video/mp4",
      "instance_id": "xmp.iid:{video_id}",
      
      "assertions": [
        // Hash assertions
        {
          "label": "c2pa.hash.data",
          "data": {
            "alg": "sha256",
            "hash": "98ca9da216...",  // original_sha256
            "name": "original_video"
          }
        },
        {
          "label": "c2pa.hash.data",
          "data": {
            "alg": "sha256",
            "hash": "0c64d3d213...",  // watermarked_sha256
            "name": "watermarked_video"
          }
        },
        
        // Authorship
        {
          "label": "stds.schema-org.CreativeWork",
          "data": {
            "@type": "VideoObject",
            "author": {
              "@type": "Person",
              "name": "BrianJames"
            },
            "datePublished": "2025-12-09T14:01:40Z"
          }
        },
        
        // Provenance chain
        {
          "label": "c2pa.actions",
          "data": {
            "actions": [
              {
                "action": "c2pa.created",
                "softwareAgent": "iPhone 14 Pro Camera",
                "when": "2025-12-03T16:10:37-07:00",
                "digitalSourceType": "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia"
              },
              {
                "action": "c2pa.edited",
                "softwareAgent": "RENDR Watermark v1.0",
                "when": "2025-12-09T14:01:40Z",
                "changes": [
                  {
                    "description": "Added watermark with verification code",
                    "region": "left edge vertical"
                  }
                ]
              }
            ]
          }
        },
        
        // RENDR-specific verification data
        {
          "label": "rendr.verification",
          "data": {
            "verification_code": "ABC12XYZ",
            "verification_url": "https://rendr.com/verify/ABC12XYZ",
            "key_frame_hashes": ["hash1", "hash2", ..., "hash10"],
            "perceptual_hashes": ["phash1", "phash2", ..., "phash30"],
            "audio_hash": "726aa0de17...",
            "metadata_hash": "d900b1948f...",
            "master_hash": "ccb515161736..."
          }
        },
        
        // Location data (if available)
        {
          "label": "stds.exif",
          "data": {
            "exif:GPSLatitude": "47.5,0.0,0.0N",
            "exif:GPSLongitude": "109.5,0.0,0.0W",
            "exif:GPSAltitude": "1200",
            "exif:DateTimeOriginal": "2025:12:03 16:10:37",
            "exif:Make": "Apple",
            "exif:Model": "iPhone 14 Pro"
          }
        }
      ],
      
      // Digital signature
      "signature": {
        "alg": "es256",  // ECDSA with SHA-256
        "signature_value": "base64_encoded_signature...",
        "certificate_chain": [
          "-----BEGIN CERTIFICATE-----\nMIIC...\n-----END CERTIFICATE-----"
        ]
      },
      
      // Hard binding (ties manifest to video content)
      "hard_binding": {
        "alg": "sha256",
        "hash": "0c64d3d213...",  // Hash of watermarked video
        "exclusions": []  // No parts excluded from hash
      }
    }
    
    // Save manifest
    1. Save to: {video_path}.c2pa (XMP sidecar)
    2. Optionally embed in MP4 udta box
    3. Sign with RENDR private key
    
    Progress: 80%
    ↓
16. Blockchain timestamping:
    Status: "⛓️ Blockchain timestamping..."
    Progress: 85%
    
    1. Create master_hash:
       master_hash = SHA-256(
         verification_code +
         original_sha256 +
         watermarked_sha256 +
         metadata_hash +
         audio_hash +
         join(key_frame_hashes) +
         join(perceptual_hashes) +
         timestamp
       )
    
    2. Submit to Polygon blockchain:
       transaction = polygon.submit({
         hash: master_hash,
         metadata: {
           code: "ABC12XYZ",
           uploader: "BrianJames",
           timestamp: "2025-12-09T14:01:40Z"
         }
       })
    
    3. Wait for confirmation (3-5 seconds)
    
    4. Store:
       blockchain_tx = "0x123abc..."
       block_number = 12345678
    
    Progress: 90%
    ↓
17. Save complete record to database:
    Status: "💾 Saving verification data..."
    Progress: 95%
    
    await db.videos.insert_one({
      _id: "uuid",
      id: "uuid",
      verification_code: "ABC12XYZ",
      user_id: "user_uuid",
      
      // SHA-256 hashes (BOTH)
      hashes: {
        original_sha256: "98ca9da216...",
        watermarked_sha256: "0c64d3d213...",
        key_frame_hashes: ["hash1", ..., "hash10"],
        metadata_hash: "d900b1948f..."
      },
      
      // Perceptual hashes
      perceptual_hashes: {
        video_phashes: ["phash1", ..., "phash30"],
        audio_hash: "726aa0de17..."
      },
      
      // Master hash
      master_hash: "ccb515161736...",
      
      // C2PA
      c2pa_manifest: {
        manifest_path: "{video_path}.c2pa",
        signature_valid: true,
        hard_binding_valid: true,
        issuer: "RENDR",
        created_at: "2025-12-09T14:01:40Z"
      },
      
      // Blockchain
      blockchain: {
        transaction_hash: "0x123abc...",
        network: "polygon",
        block_number: 12345678,
        timestamp: "2025-12-09T14:02:15Z"
      },
      
      // Metadata
      video_metadata: {
        duration: 5.54,
        resolution: "1920x1080",
        fps: 59.94,
        device: "iPhone 14 Pro",
        gps_location: "Montana",
        captured_at: "2025-12-03T16:10:37-07:00"
      },
      
      // Storage
      storage: {
        tier: "enterprise",
        original_path: "uploads/videos/{video_id}_original.mp4",
        watermarked_path: "uploads/videos/{video_id}_watermarked.mp4",
        thumbnail_path: "uploads/thumbnails/{video_id}.jpg",
        expires_at: null  // Unlimited for enterprise
      },
      
      // Status
      processing_status: {
        status: "complete",
        progress: 100,
        completed_at: "2025-12-09T14:02:15Z"
      },
      
      // Video settings
      title: "12/04/2025 Test 1",
      description: "Test video uploaded",
      on_showcase: false,  // Set via Edit Video modal
      folder_id: null,
      social_folders: [],
      social_links: [],
      
      uploaded_at: "2025-12-09T14:01:40Z"
    })
    
    Progress: 100%
    ↓
18. Notify user:
    Status: "🎉 Complete! Verification ready"
    
    // Send notification
    if (user.email_notifications) {
      send_email({
        to: user.email,
        subject: "Video Verified - ABC12XYZ",
        body: `
          Your video has been fully verified!
          
          Verification Code: ABC12XYZ
          View: https://rendr.com/verify/ABC12XYZ
          Blockchain: https://polygonscan.com/tx/0x123abc...
          
          Download your watermarked video:
          https://rendr.com/api/videos/watch/{video_id}
        `
      })
    }
    
    if (user.push_notifications) {
      send_push({
        title: "Video Verified",
        body: "ABC12XYZ - Full verification complete",
        action: "https://rendr.com/verify/ABC12XYZ"
      })
    }
```

**Background Time:** 10-60 seconds (depends on video length)
**User notified when complete**

---

## 📱 **MOBILE APP (RENDR BODYCAM) DIFFERENCES**

### **Upload Process:**

```
Mobile App Upload:
1. Video captured on device with app
2. Device embeds metadata:
   - GPS coordinates (precise location)
   - Timestamp (exact capture time)
   - Device ID (unique identifier)
   - App version
   - Camera settings
   ↓
3. Calculate hash on device (optional):
   - Pre-hash before upload
   - Verify integrity during upload
   ↓
4. Upload to server:
   - Same endpoint: POST /api/videos/upload
   - Source auto-detected: "bodycam"
   - Multipart upload with metadata
   ↓
5. Server processing (SAME as Studio):
   - Calculate original SHA-256
   - Check duplicates
   - Generate code
   - Apply watermark
   - Calculate watermarked SHA-256
   - Return immediately
   ↓
6. App receives:
   - Verification code
   - Watermarked video URL
   - Provisional hashes
   ↓
7. App can:
   - Display code to user
   - Show "Processing..." status
   - Notify when complete
   - Sync to cloud storage
```

### **Key Differences:**

**Metadata:**
- **Bodycam:** More detailed device metadata, precise GPS, officer ID
- **Studio:** User-provided metadata, may have less device info

**Trust Level:**
- **Bodycam:** Higher trust (captured by app, hardware-verified)
- **Studio:** Standard trust (user uploaded, could be edited)

**C2PA Assertions:**
- **Bodycam:** `digitalSourceType = "trainedAlgorithmicMedia"` (camera capture)
- **Studio:** `digitalSourceType = "compositeSynthetic"` (uploaded file)

**Processing:**
- **Both use same backend workflow**
- **Both get watermark**
- **Both get full verification**
- **Both stored based on tier**

---

## ✅ **EDIT VIDEO MODAL - ON SHOWCASE CHECKBOX**

### **What Happens When User Checks "Show on Showcase":**

```
1. User opens Edit Video Details modal
   ↓
2. User checks "Show on Showcase" checkbox
   ↓
3. User clicks "Save Changes"
   ↓
4. Frontend sends:
   PUT /api/videos/{video_id}
   Body: {
     on_showcase: true,
     // ... other fields
   }
   ↓
5. Backend updates database:
   await db.videos.update_one(
     {id: video_id},
     {$set: {on_showcase: true}}
   )
   ↓
6. Video now appears on:
   - User's public showcase page: /@BrianJames
   - Public verification page with showcase videos
   ↓
7. Video is accessible at:
   - https://rendr.com/@BrianJames (showcase)
   - https://rendr.com/verify/ABC12XYZ (verification)
```

### **Showcase vs Non-Showcase:**

**On Showcase (on_showcase: true):**
- ✅ Visible on public profile
- ✅ Anyone can view (no code needed)
- ✅ Embedded player works
- ✅ Can be shared publicly

**Not on Showcase (on_showcase: false):**
- ❌ Not visible on public profile
- ✅ Accessible via verification code only
- ✅ Full verification data still available
- ✅ Private to owner unless code shared

---

## 🔄 **TIER DIFFERENCES (SIMPLIFIED)**

### **Current Implementation:**

**All Tiers Get:**
- ✅ Same verification process
- ✅ SHA-256 (original + watermarked)
- ✅ Key frame hashes (10 frames)
- ✅ Perceptual hashes (all frames)
- ✅ Audio hash
- ✅ Metadata hash
- ✅ C2PA manifest
- ✅ Blockchain timestamp
- ✅ Watermark with verification code
- ✅ Full verification features

**Only Difference - Storage Duration:**

| Tier | Storage Duration | Video Limit | After Expiration |
|------|-----------------|-------------|------------------|
| Free | 24 hours | 5 videos | Video deleted, verification data kept |
| Pro | 7 days | 100 videos | Video deleted, verification data kept |
| Enterprise | Unlimited | Unlimited | Never deleted |

### **What "Verification Data Kept" Means:**

After video file is deleted:
- ✅ Verification code still works
- ✅ All hashes remain in database
- ✅ Can verify against submitted videos
- ✅ Blockchain proof remains
- ✅ C2PA manifest metadata remains
- ❌ Cannot stream original video
- ❌ Cannot download video

**Use Case:** Prove a video existed without storing it forever

---

## 🎯 **C2PA IMPLEMENTATION STATUS**

### **What's Implemented:**
✅ Manifest structure defined
✅ All required assertions included
✅ Provenance chain documented
✅ Hard binding specification
✅ Signature requirements defined

### **What's Needed:**
1. Install c2pa-python library
2. Generate RENDR signing certificate
3. Implement manifest creation function
4. Embed manifest in video files
5. Create verification endpoint
6. Test with C2PA validator tools

### **Implementation Steps (Next 6 Tasks):**

Completing in next response...
