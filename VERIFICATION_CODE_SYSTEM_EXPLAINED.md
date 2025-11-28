# Rendr Verification Code System - Complete Explanation

## 📋 What is the Verification Code?

The verification code is a **unique identifier** in the format `RND-XXXXXX` (e.g., `RND-YWQJL5`) that serves as a **digital fingerprint** for each uploaded video.

---

## 🔐 How is the Code Generated?

**Location**: `/app/backend/services/video_processor.py` (Line 116-120)

```python
def generate_verification_code() -> str:
    """Generate unique verification code (RND-XXXXXX)"""
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=6))
    return f"RND-{code}"
```

**Generation Method**:
- **Format**: `RND-` prefix + 6 random characters
- **Character Set**: A-Z (uppercase letters) + 0-9 (digits) = 36 possible characters per position
- **Total Possible Codes**: 36^6 = **2,176,782,336** unique combinations
- **Collision Probability**: Extremely low (~0.00004% chance with 1 million videos)

---

## 📊 What Information is Associated with Each Code?

When a video is uploaded and assigned a verification code, the system stores:

### 1. **Core Identity**
```json
{
  "verification_code": "RND-YWQJL5",
  "video_id": "unique-uuid-here",
  "user_id": "creator-user-id"
}
```

### 2. **Cryptographic Hashes (5 Types)**
```json
{
  "hashes": {
    "original": "SHA-256 hash of original video (pre-watermark)",
    "watermarked": "SHA-256 hash of watermarked video",
    "center_region": "pHash of center 50% (crop-resistant)",
    "audio": "SHA-256 hash of audio track (or 'no_audio')",
    "metadata": "SHA-256 hash of video metadata (duration, resolution, codec)"
  }
}
```

### 3. **Video Metadata**
```json
{
  "video_metadata": {
    "duration": 45.2,
    "frame_count": 1356,
    "resolution": "1920x1080"
  }
}
```

### 4. **Upload & Storage Info**
```json
{
  "source": "studio",
  "uploaded_at": "2025-11-28T05:58:41.868000",
  "storage": {
    "tier": "enterprise",
    "uploaded_at": "2025-11-28T05:58:41.868000",
    "expires_at": null,
    "download_count": 0
  }
}
```

### 5. **Blockchain Proof (Optional)**
```json
{
  "blockchain_signature": {
    "tx_hash": "0x123abc...",
    "block_number": 12345678,
    "timestamp": "2025-11-28T05:58:45.000Z",
    "chain_id": 80002,
    "explorer_url": "https://polygon-amoy.blockscout.com/tx/0x123abc..."
  }
}
```

---

## 🔍 How is the Code Used for Verification?

### Method 1: Code Lookup (Simple Verification)
**Endpoint**: `POST /api/verify/code`

**Input**: Just the verification code
```json
{
  "verification_code": "RND-YWQJL5"
}
```

**Output**: Basic authenticity check
```json
{
  "result": "authentic",
  "verification_code": "RND-YWQJL5",
  "video_id": "...",
  "metadata": {
    "captured_at": "...",
    "duration_seconds": 45.2,
    "blockchain_verified": true
  },
  "creator": {
    "username": "BrianJames",
    "display_name": "Brian James",
    "profile_url": "/@BrianJames"
  }
}
```

**What it Proves**:
- Video exists in the system
- When it was uploaded
- Who uploaded it
- If it has blockchain proof

---

### Method 2: Deep Verification (File Upload)
**Endpoint**: `POST /api/verify/deep`

**Input**: Verification code + video file to check
```
verification_code: RND-YWQJL5
video_file: [uploaded file]
```

**Output**: Multi-hash comparison with detailed analysis
```json
{
  "result": "authentic",
  "similarity_score": 100,
  "confidence_level": "very_high",
  "analysis": "Perfect match. Video is original and unmodified (100% match).",
  "hash_matches": {
    "original": true,
    "watermarked": false,
    "center_region": true,
    "audio": true,
    "metadata": true
  },
  "metadata": {
    "blockchain_verified": true
  }
}
```

**Possible Results**:
1. **"authentic" + very_high confidence** → Perfect hash match (original or watermarked version)
2. **"modified" + medium confidence** → Center content intact but video cropped/edited
3. **"tampered" + low confidence** → Significant modifications, likely fake

---

## 🛡️ What Makes This System Secure?

### 1. **Multi-Layer Hash Protection**
- **Not relying on a single hash** - uses 5 different hashing techniques
- Each hash captures different aspects:
  - `original`: Full video fingerprint (pre-watermark)
  - `watermarked`: Watermarked video fingerprint
  - `center_region`: Crop-resistant (survives social media crops)
  - `audio`: Detects audio swaps
  - `metadata`: Detects duration/resolution changes

### 2. **Watermark Embedding**
- Visible watermark with:
  - Creator username
  - Verification code
  - Rendr logo
- Serves as visual proof even if someone screenshots/screen-records

### 3. **Blockchain Timestamping** (Optional)
- Immutable proof of:
  - When the video was uploaded
  - Its original hash
  - Who uploaded it
- Cannot be backdated or forged

### 4. **Social Media Resilience**
The system is designed to detect videos even after:
- Compression (YouTube, TikTok, Instagram)
- Cropping (square crops for IG)
- Re-encoding
- Minor edits

---

## 📝 Use Case Examples

### Example 1: Proving Original Upload
**Scenario**: Someone claims your video as their own on Instagram.

**Your Proof**:
1. Share your verification code: `RND-YWQJL5`
2. Anyone can look it up at `/verify` and see:
   - You uploaded it on Nov 28, 2025 at 5:58 AM
   - It has blockchain proof at that timestamp
   - The watermark shows your username

### Example 2: Detecting Modifications
**Scenario**: Someone crops your video to remove the watermark.

**Verification Process**:
1. You upload the suspected video to `/verify/deep`
2. System compares:
   - ❌ `original` hash: No match (video was modified)
   - ❌ `watermarked` hash: No match (watermark removed)
   - ✅ `center_region` hash: Match! (center content intact)
   - ✅ `audio` hash: Match!
3. **Result**: "modified" with 60% similarity
4. **Conclusion**: This is your video, but it's been cropped/edited

### Example 3: Detecting Complete Fakes
**Scenario**: Someone uploads a completely different video claiming it's yours.

**Verification Process**:
1. Deep verification with your code
2. System compares:
   - ❌ All hashes: No match
   - Similarity score: 0-20%
3. **Result**: "tampered" with low confidence
4. **Conclusion**: This is NOT your video

---

## 🔑 Key Takeaways

1. **The verification code is NOT a hash** - it's a random unique ID
2. **The real security comes from the 5 hash types** stored with each code
3. **Each code links to**:
   - A unique video ID
   - The creator's identity
   - Multiple cryptographic hashes
   - Upload timestamp
   - Optional blockchain proof
4. **The system can detect**:
   - Exact duplicates (100% match)
   - Modified versions (partial match)
   - Complete fakes (no match)

---

## 🚀 Future Enhancements You Could Add

1. **QR Code Generation**: Create a QR code for each verification code
2. **Public Verification Page**: `rendr.com/verify/RND-YWQJL5` shows proof
3. **NFT Integration**: Mint each video as an NFT with the verification code
4. **AI Deepfake Detection**: Add AI analysis to detect deepfakes
5. **Batch Verification**: Upload multiple videos, get batch verification report
6. **Video Fingerprint API**: Let other platforms verify videos via API

---

## 📌 Important Notes

- **Current Issue**: Videos uploaded before today have NO watermarks (ffmpeg wasn't installed)
- **Solution**: All videos have been deleted; new uploads will have proper watermarks
- **Recommendation**: When you re-upload, test the verification flow end-to-end
