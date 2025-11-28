# Rendr Video Verification & Storage Testing Plan

## 🎯 **OBJECTIVE**
Test Rendr's core value proposition: Authentic video verification with watermarking, storage, and tamper detection across all user tiers (Free, Pro, Enterprise).

---

## 📋 **CURRENT SYSTEM CAPABILITIES**

### **Implemented Features:**
✅ **Tier System**: Free, Pro, Enterprise (stored in user.premium_tier)
✅ **Video Upload**: Supports video file upload with hash calculation
✅ **Watermarking**: Applies visible watermarks with verification codes
✅ **Multi-Hash Detection**:
   - **Free Tier**: Original perceptual hash + metadata hash
   - **Pro Tier**: + Center region hash (watermark-resistant)
   - **Enterprise Tier**: + Audio fingerprint hash
✅ **Duplicate Detection**: Checks hashes before accepting uploads
✅ **Verification System**: 
   - Code verification (quick check)
   - Deep verification (upload video for hash comparison)
✅ **Video Storage**: Local storage with expiration management

### **Hash Types:**
1. **Original Hash**: Perceptual hash of video frames
2. **Center Region Hash**: Hash of center 50% of frames (Pro+)
3. **Audio Hash**: Audio waveform fingerprint (Enterprise)
4. **Metadata Hash**: Video properties (resolution, duration, frame count)

---

## 🧪 **COMPREHENSIVE TEST PLAN**

### **PHASE 1: User Tier Setup & Configuration**

#### Test 1.1: Set User to Pro Tier
**Objective**: Upgrade BrianJames to Pro tier for enhanced features

```python
# Set user tier to Pro
UPDATE users SET premium_tier = 'pro' WHERE username = 'BrianJames'
```

**Expected Result**: User has access to center region hash detection

#### Test 1.2: Set User to Enterprise Tier  
**Objective**: Test full suite of verification features

```python
# Set user tier to Enterprise
UPDATE users SET premium_tier = 'enterprise' WHERE username = 'BrianJames'
```

**Expected Result**: User has access to all hash methods including audio fingerprinting

---

### **PHASE 2: Video Upload & Storage Testing**

#### Test 2.1: Upload Original Video (Enterprise Tier)
**Objective**: Upload authentic video and verify all hashes are calculated

**Steps:**
1. Login as BrianJames (Enterprise tier)
2. Navigate to Upload page
3. Upload test video file (10-30 seconds, MP4 format)
4. System should:
   - Calculate original hash
   - Calculate center region hash
   - Calculate audio fingerprint
   - Apply watermark with verification code
   - Calculate watermarked hashes
   - Store video file with expiration

**Expected Results:**
```
✅ Original hash calculated
✅ Center region hash calculated (Pro+)
✅ Audio hash calculated (Enterprise)
✅ Watermark applied successfully
✅ Verification code generated (e.g., RND-ABC123)
✅ Video stored in /app/backend/uploads/videos/
✅ Thumbnail generated
```

**Verify:**
- Video appears in Dashboard
- Verification code is visible
- Thumbnail displays correctly
- Video file exists in uploads directory

#### Test 2.2: Check Database Entry
**Objective**: Confirm all hash data is stored correctly

**Query:**
```python
db.videos.findOne({"verification_code": "RND-ABC123"})
```

**Expected Fields:**
- `verification_code`
- `hashes.original`
- `hashes.watermarked`
- `hashes.center_region` (Pro+)
- `hashes.audio` (Enterprise)
- `hashes.metadata`
- `storage.video_path`
- `storage.expires_at`

---

### **PHASE 3: Watermark Testing**

#### Test 3.1: Visual Watermark Inspection
**Objective**: Verify watermark is visible and readable

**Steps:**
1. Download watermarked video from server
2. Play video and inspect watermark
3. Verify watermark contains:
   - Verification code (RND-ABC123)
   - Positioned correctly (default: left side)
   - Readable throughout video
   - Doesn't obstruct main content

**Expected Result**: Watermark is clearly visible and contains correct verification code

#### Test 3.2: Watermark Position Testing
**Objective**: Test different watermark positions

**Test Cases:**
- Upload with watermark_position = "left"
- Upload with watermark_position = "right"
- Upload with watermark_position = "top"
- Upload with watermark_position = "bottom"

**Expected Result**: Watermark appears in correct position for each upload

---

### **PHASE 4: Verification System Testing**

#### Test 4.1: Code Verification (Quick Check)
**Objective**: Verify video authenticity using just the verification code

**Steps:**
1. Go to /verify page
2. Enter verification code: RND-ABC123
3. Click "Verify by Code"

**Expected Result:**
```json
{
  "authentic": true,
  "verification_code": "RND-ABC123",
  "video_id": "...",
  "captured_at": "2024-11-28T...",
  "creator": "BrianJames",
  "message": "Video verified successfully"
}
```

#### Test 4.2: Deep Verification (Hash Comparison)
**Objective**: Verify video authenticity by uploading the video file

**Steps:**
1. Go to /verify page
2. Select "Deep Verification" mode
3. Upload the ORIGINAL watermarked video
4. Click "Deep Verify"

**Expected Result:**
```json
{
  "authentic": true,
  "verification_code": "RND-ABC123",
  "match_type": "exact",
  "hash_matches": {
    "original": true,
    "center_region": true,
    "audio": true,
    "metadata": true
  },
  "confidence": 100,
  "message": "Video is authentic and unmodified"
}
```

---

### **PHASE 5: Tamper Detection Testing**

#### Test 5.1: Minor Edit Detection (Crop 5%)
**Objective**: Detect if video has been cropped slightly

**Steps:**
1. Download watermarked video
2. Use video editor to crop 5% from edges
3. Upload cropped video to /verify for deep verification

**Expected Result (Pro/Enterprise):**
```json
{
  "authentic": false,
  "match_type": "modified",
  "hash_matches": {
    "original": false,
    "center_region": true,  // Should still match!
    "audio": true,
    "metadata": false
  },
  "confidence": 75,
  "message": "Video appears modified but center content intact"
}
```

**Why This Matters**: Pro+ tier should detect modifications while recognizing authentic center content.

#### Test 5.2: Watermark Removal Attempt
**Objective**: Detect if someone tries to remove/crop the watermark

**Steps:**
1. Download watermarked video
2. Use video editor to crop left side (where watermark is)
3. Upload cropped video to /verify

**Expected Result (Pro/Enterprise):**
```json
{
  "authentic": false,
  "match_type": "modified",
  "hash_matches": {
    "original": false,
    "center_region": true,  // Center still matches
    "audio": true,
    "metadata": false
  },
  "confidence": 70,
  "message": "Video modified (possible watermark removal)"
}
```

#### Test 5.3: Re-encoding Detection
**Objective**: Detect if video has been re-encoded/compressed

**Steps:**
1. Download watermarked video
2. Re-encode with lower quality (compress)
3. Upload re-encoded video to /verify

**Expected Result:**
```json
{
  "authentic": false,
  "match_type": "modified",
  "hash_matches": {
    "original": false,
    "center_region": true,  // Perceptual hash should still match
    "audio": false,
    "metadata": false
  },
  "confidence": 60,
  "message": "Video appears re-encoded or compressed"
}
```

#### Test 5.4: Audio Swap Detection (Enterprise)
**Objective**: Detect if audio track has been replaced

**Steps:**
1. Download watermarked video
2. Replace audio track with different audio
3. Upload modified video to /verify

**Expected Result (Enterprise only):**
```json
{
  "authentic": false,
  "match_type": "modified",
  "hash_matches": {
    "original": false,
    "center_region": true,
    "audio": false,  // Audio mismatch detected!
    "metadata": false
  },
  "confidence": 50,
  "message": "Audio track appears modified"
}
```

#### Test 5.5: Frame Insertion/Deletion
**Objective**: Detect if frames have been added or removed

**Steps:**
1. Download watermarked video
2. Remove 10 frames from middle
3. Upload modified video to /verify

**Expected Result:**
```json
{
  "authentic": false,
  "match_type": "modified",
  "hash_matches": {
    "original": false,
    "center_region": false,
    "audio": false,
    "metadata": false
  },
  "confidence": 30,
  "message": "Video significantly modified"
}
```

---

### **PHASE 6: Similar Video Testing**

#### Test 6.1: Upload Similar But Different Video
**Objective**: Test if system can distinguish between similar videos

**Steps:**
1. Record NEW video of same subject/location
2. Upload as authentic video
3. System should accept it (different hashes)

**Expected Result:** New video accepted with new verification code

#### Test 6.2: False Claim Detection
**Objective**: Someone uploads similar video claiming it's authentic

**Steps:**
1. Upload Video A by BrianJames
2. Create new account (Attacker)
3. Try to upload Video A again, claiming it's their authentic video

**Expected Result:**
```json
{
  "error": "Duplicate detected",
  "message": "This video already exists",
  "original_creator": "BrianJames",
  "original_upload_date": "2024-11-28",
  "verification_code": "RND-ABC123"
}
```

#### Test 6.3: Slightly Modified Video Claim
**Objective**: Attacker slightly modifies video and claims it's authentic

**Steps:**
1. Original video uploaded by BrianJames
2. Attacker crops/edits video slightly
3. Attacker tries to upload as authentic

**Expected Result:**
- **Free Tier**: Might accept (hash different enough)
- **Pro Tier**: Should detect (center region hash matches)
- **Enterprise Tier**: Should definitely detect (multiple hash matches)

---

### **PHASE 7: Video Playback Testing**

#### Test 7.1: Public Showcase Video Playback
**Objective**: Test if visitors can watch videos

**Steps:**
1. Mark video as "on_showcase"
2. Go to creator's showcase: /@/BrianJames
3. Click video thumbnail
4. Video should play in modal/player

**Expected Result:**
- Video plays smoothly
- Watermark is visible
- Verification code visible
- "Verify This Video" link appears

#### Test 7.2: Video Streaming Performance
**Objective**: Test if video streams properly

**Test Cases:**
- Small video (5 MB)
- Medium video (50 MB)
- Large video (200 MB)

**Expected Result:** All videos stream without buffering issues

#### Test 7.3: Expired Video Handling
**Objective**: Test storage expiration system

**Steps:**
1. Set video expiration to past date
2. Try to access video

**Expected Result:** System prompts to extend storage or shows expired message

---

### **PHASE 8: Cross-Tier Comparison**

#### Test 8.1: Same Video, Different Tiers
**Objective**: Compare detection capabilities across tiers

**Setup:**
- User A (Free tier) uploads Video X
- User B (Pro tier) uploads Video X
- User C (Enterprise tier) uploads Video X

**Test: Upload slightly cropped version**

**Expected Results:**
- **Free**: May not detect (original hash changed)
- **Pro**: Detects (center hash matches)
- **Enterprise**: Definitely detects (center + audio match)

---

## 📊 **SUCCESS CRITERIA**

### **Critical (Must Pass):**
✅ Videos upload successfully with all tier-appropriate hashes
✅ Watermarks are visible and contain correct codes
✅ Code verification works for all uploaded videos
✅ Duplicate detection prevents same video from being uploaded twice
✅ Deep verification with original video returns 100% match
✅ Modified videos are detected as inauthentic

### **Important (Should Pass):**
✅ Pro tier detects cropped videos via center hash
✅ Enterprise tier detects audio swaps
✅ Re-encoded videos are flagged as modified
✅ Videos play correctly on showcase

### **Nice to Have:**
✅ Performance: Upload completes in <30 seconds
✅ Watermark doesn't significantly degrade video quality
✅ Storage expiration system works correctly

---

## 🛠️ **IMPLEMENTATION CHECKLIST**

Before testing, ensure these are implemented:

### **Backend:**
- [ ] User tier update functionality
- [ ] Video streaming endpoint
- [ ] Deep verification API endpoint
- [ ] Hash comparison logic for all hash types
- [ ] Confidence scoring system
- [ ] Proper error messages for each failure type

### **Frontend:**
- [ ] Video player component
- [ ] Deep verification UI
- [ ] Visual feedback for verification results
- [ ] Upload progress indicator
- [ ] Tier-appropriate features display

### **Testing Tools Needed:**
- [ ] Video editing software (for creating test cases)
- [ ] Multiple test videos (different subjects, lengths)
- [ ] API testing tools (Postman/curl)
- [ ] Performance monitoring

---

## 📝 **TEST EXECUTION NOTES**

**Order of Testing:**
1. Setup → Tiers → Upload → Storage → Verification
2. Do NOT skip tamper detection tests
3. Test each tier separately
4. Document all hash values for comparison
5. Save all test videos for future regression testing

**Documentation:**
- Screenshot each verification result
- Log all hash values
- Note any performance issues
- Record false positives/negatives

---

## 🚨 **KNOWN ISSUES TO WATCH FOR**

1. **Hash Collision**: Two different videos producing same hash (extremely rare)
2. **Perceptual Hash Sensitivity**: Minor edits causing large hash changes
3. **Storage Limits**: Large videos filling up disk space
4. **Processing Time**: Long videos taking too long to process
5. **Watermark Placement**: Watermark covering important content

---

## ✅ **NEXT STEPS AFTER TESTING**

1. Fix any bugs discovered
2. Optimize slow operations
3. Improve user feedback messages
4. Add more hash methods if needed
5. Implement ML-based tampering detection (future enhancement)
6. Add blockchain anchoring for enterprise tier (future enhancement)

---

**This plan ensures comprehensive testing of Rendr's core value proposition: Protecting content creators through cryptographic video verification.**
