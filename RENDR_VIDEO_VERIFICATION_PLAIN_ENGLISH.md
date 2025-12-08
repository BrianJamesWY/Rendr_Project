# RENDR Video Verification System - Complete Workflow
**Plain English Guide for Future Reference**
**Updated:** December 9, 2025

---

## 🎯 **WHAT RENDR DOES**

RENDR is a video verification system that proves:
1. A video is authentic and unaltered
2. When and where it was created
3. Who created it
4. Its complete history of changes

Think of it like a birth certificate, fingerprint, and DNA test all combined for videos.

---

## 📹 **WHEN YOU UPLOAD A VIDEO**

### **Part 1: What You See (Takes 3-5 Seconds)**

**Step 1: You Upload**
- You click "Upload Video" on the website or mobile app
- You select your video file from your device
- The file starts uploading to our servers

**Step 2: We Save It Temporarily**
- Your video arrives at our server
- We save it to a temporary location
- We check if you have space available (based on your subscription tier)
- If you're at your limit, we tell you to delete old videos or upgrade

**Step 3: We Calculate the Original Fingerprint**
- Before we do ANYTHING to your video, we calculate its unique "fingerprint"
- This fingerprint is called a SHA-256 hash
- Think of it like taking a photo of a person's face before they get a tattoo
- This lets us prove later that this is the ORIGINAL, unmodified video
- Example: `98ca9da2168eb918...` (64 characters long)

**Step 4: We Check for Duplicates**
- We compare this fingerprint against EVERY video ever uploaded to RENDR
- If we find an exact match, it means this exact video was already uploaded
- If it's a duplicate, we give you the existing verification code instead of creating a new one
- This prevents people from uploading the same video twice to get multiple codes

**Step 5: We Generate Your Verification Code**
- If the video is new, we create a unique 8-character code
- Format: `RND-XXXXXX` (example: `RND-TN1INQ`)
- This code is permanently linked to your video
- Anyone can use this code to verify the video later

**Step 6: We Take 10 "Key Frame" Snapshots**
- We extract 10 frames (still images) from your video
- These are evenly spaced: at 0%, 11%, 22%, 33%, 44%, 55%, 66%, 77%, 88%, and 100% through the video
- We calculate a fingerprint (hash) for each frame
- This lets us prove the video hasn't been edited frame-by-frame
- If someone cuts out a scene, these frame hashes will be different

**Step 7: We Add a Watermark**
- We use a program called FFmpeg to add visible text to your video
- The watermark includes:
  * Your verification code (RND-TN1INQ)
  * Your username (@BrianJames)
  * The RENDR logo
  * All rotated 90 degrees vertically
  * Positioned on the left edge of the video
- This watermark is permanent and visible to anyone watching
- It proves "this video was verified by RENDR on this date"

**Step 8: We Calculate the Watermarked Fingerprint**
- Now that we've added the watermark, the video file has changed
- We calculate a NEW SHA-256 hash of the watermarked version
- Example: `0c64d3d213eec6d1...`
- This is different from the original hash (because we added the watermark)
- Now we have TWO fingerprints:
  * One for your pristine original
  * One for our watermarked version

**Step 9: We Create a Thumbnail**
- We grab one frame from the middle of your video (50% position)
- We save it as a JPEG image
- This becomes the preview thumbnail you see on the website

**Step 10: WE GIVE YOU YOUR VIDEO BACK**
- **This is where you get control back** (3-5 seconds have passed)
- You receive:
  * A link to download your watermarked video
  * Your verification code (RND-TN1INQ)
  * The two SHA-256 fingerprints (original + watermarked)
  * A "Processing..." status indicator
- You can now:
  * Download the watermarked video
  * Share the verification code
  * Watch the video
  * Post it on social media
  * **You don't have to wait** - the video is ready to use

---

### **Part 2: What Happens in the Background (10-60 Seconds)**

While you're using your video, our servers are doing additional verification work. You don't have to wait for this.

**Step 11: We Start Background Processing**
- We create a background job that will process your video
- You can see the progress if you stay on the page (like a progress bar)
- But you don't have to watch - we'll notify you when it's done

**Step 12: We Extract All Metadata**
- We use a tool called ffprobe to read your video's information:
  * How long is it? (5.54 seconds)
  * What resolution? (1920x1080 HD)
  * Frame rate? (59.94 fps)
  * Video format? (H.264)
  * Audio format? (AAC, 2-channel stereo, 48kHz)
  * What device created it? (iPhone 14 Pro)
  * When was it created? (December 3, 2025 at 4:10pm)
  * Where was it created? (GPS coordinates: Montana)
  * What app created it? (Camera app)
  * File size? (15.6 MB)
- We calculate a fingerprint (hash) of all this metadata
- This proves the video's "story" - when, where, how it was made

**Step 13: We Calculate Perceptual Video Hashes**
- This is the most important part for detecting copies
- We sample every 30th frame from your video (about 30 frames total for a short video)
- For each sampled frame:
  1. We crop it to the CENTER 50% (ignore the edges and borders)
     - Why? Because people often crop videos or add borders
     - The center content is what matters
  2. We convert it to grayscale (black and white)
  3. We shrink it down to 16x16 pixels (very small)
  4. We apply a mathematical formula called DCT (Discrete Cosine Transform)
     - This finds the "essence" of the image
     - It's like describing someone's face instead of taking an exact photo
  5. We create a 64-bit "perceptual hash" (pHash)
     - Example: `a3f4b2c1d5e6f7g8...`
- **Why this matters:** These hashes survive compression
  - If someone re-uploads your video to YouTube (which compresses it), these hashes will still match ~85-95%
  - If someone crops your video, these hashes still match (we only look at the center)
  - If someone adjusts colors slightly, these hashes still match
- We store all 30+ perceptual hashes in the database

**Step 14: We Calculate Audio Fingerprint**
- We extract just the audio track from your video
- We save it temporarily as a WAV file
- We sample the audio waveform (every 1000th byte)
- We calculate a hash of these samples
- **Why this matters:** 
  - If someone swaps the audio (replaces your voice with someone else's), we can detect it
  - If someone dubs over your video, we can catch it
  - Audio survives compression pretty well too (~90% match rate)

**Step 15: We Create a C2PA Manifest**
- C2PA stands for "Coalition for Content Provenance and Authenticity"
- It's an industry standard created by Adobe, Microsoft, BBC, and others
- Think of it as a "nutrition label" for digital media
- We create a detailed document that includes:

  **Basic Information:**
  - Title: "12/04/2025 Test 1"
  - Format: video/mp4
  - Who made it: RENDR v1.0
  - Unique ID: xmp.iid:RND-TN1INQ

  **Hash Proofs:**
  - Original video hash: 98ca9da2168eb918...
  - Watermarked video hash: 0c64d3d213eec6d1...
  - Metadata hash: d900b1948f995ca8...
  - All 10 key frame hashes
  - All 30+ perceptual hashes
  - Audio hash

  **Authorship:**
  - Creator: BrianJames
  - Date published: December 9, 2025 at 2:01pm
  - Description: (your description)

  **Provenance Chain (History):**
  - Action #1: Created by iPhone 14 Pro Camera
    * When: December 3, 2025 at 4:10pm
    * Where: Montana (GPS coordinates)
    * How: Digital capture from camera
  - Action #2: Edited by RENDR Watermark v1.0
    * When: December 9, 2025 at 2:01pm
    * What changed: Added watermark with verification code
    * Where on video: Left edge, vertical orientation

  **EXIF/Camera Data:**
  - GPS Latitude: 47.5°N
  - GPS Longitude: 109.5°W
  - GPS Altitude: 1200 meters
  - Camera Make: Apple
  - Camera Model: iPhone 14 Pro
  - Date/Time Original: December 3, 2025 at 4:10pm

  **RENDR Verification Package:**
  - Verification Code: RND-TN1INQ
  - Verification URL: https://rendr.com/verify/RND-TN1INQ
  - All key frame hashes
  - All perceptual hashes
  - Audio hash
  - Metadata hash
  - Master hash (combination of everything)

  **Digital Signature:**
  - We sign this entire document with RENDR's private key
  - This proves RENDR created this manifest
  - If anyone changes even one character, the signature breaks
  - Like a tamper-evident seal on a medicine bottle

  **Hard Binding:**
  - We calculate a hash of the watermarked video
  - We include this hash in the signed manifest
  - This "binds" the manifest to the specific video file
  - If someone modifies the video, the binding breaks
  - It's like tying a wax seal to a letter with string

- We save this manifest in two places:
  1. As a separate file: video.mp4.c2pa (sidecar file)
  2. Optionally embedded inside the MP4 file itself

**Why C2PA Matters:**
- Industry standard: Adobe Photoshop, Microsoft Office, BBC News all use it
- Hardware support: New Android phones (Snapdragon 8 Gen 3+) create C2PA manifests automatically
- Platform recognition: Facebook, Twitter, YouTube can read C2PA data
- Legal standing: Courts may recognize C2PA as proof of authenticity
- Interoperability: Other verification tools can read our C2PA manifests
- Future-proof: As the standard evolves, we're compliant

**Step 16: We Submit to Blockchain**
- We create one final "master hash" by combining:
  * Verification code
  * Original video hash
  * Watermarked video hash
  * Metadata hash
  * Audio hash
  * All key frame hashes
  * All perceptual hashes
  * Current timestamp
- We calculate SHA-256 of all that combined
- Example master hash: `ccb515161736fb22...`
- We submit this master hash to the Polygon blockchain
  * Polygon is an Ethereum-based blockchain (cheaper and faster than main Ethereum)
  * We pay a small transaction fee (a few cents)
  * The blockchain records: "On December 9, 2025 at 2:02pm, RENDR submitted hash ccb515161736fb22..."
  * We get back a transaction hash: `0x123abc...`
  * We can view this on PolygonScan forever
- **Why blockchain:**
  * Immutable: No one can change or delete this record, ever
  * Timestamped: Proves your video existed at this specific time
  * Decentralized: Even if RENDR goes offline, the blockchain record remains
  * Trustless: Don't have to trust RENDR - the blockchain is public proof

**Step 17: We Save Everything to Database**
- We store a complete record in our MongoDB database:
  * Video ID
  * Verification code (RND-TN1INQ)
  * Your user ID
  * Original video hash
  * Watermarked video hash
  * All 10 key frame hashes
  * All 30+ perceptual hashes
  * Audio hash
  * Metadata hash
  * Master hash
  * C2PA manifest file path
  * Blockchain transaction hash
  * All video metadata (duration, resolution, device, GPS, etc.)
  * File paths (original, watermarked, thumbnail)
  * Storage expiration date (based on your tier)
  * When uploaded
  * When processing completed
  * Video title and description
  * Whether it's on your showcase
  * Social media links
  * Folder organization

**Step 18: We Notify You**
- If you enabled email notifications, we send you an email:
  * Subject: "Video Verified - RND-TN1INQ"
  * Your verification code
  * Link to view full verification proof
  * Link to download watermarked video
  * Blockchain proof link
- If you enabled push notifications on mobile, we send a notification:
  * "Video Verified: RND-TN1INQ - Full verification complete"
  * Tap to view proof
- The status on your dashboard changes from "Processing..." to "✅ Verified"

---

## 🔍 **HOW SOMEONE VERIFIES YOUR VIDEO LATER**

### **Method 1: They Have the Verification Code**

**Fastest Method** (instant):
1. They go to rendr.com/verify
2. They enter: RND-TN1INQ
3. They click "Verify"
4. We look up that code in our database
5. We instantly return:
   * ✅ Verified: This video exists in RENDR's database
   * Confidence: 100% (code lookup)
   * Original uploader: BrianJames
   * Upload date: December 9, 2025 at 2:01pm
   * Video metadata (duration, resolution, device, GPS location)
   * Blockchain proof link
   * C2PA manifest details
   * Option to download verification certificate

**What This Proves:**
- The video was uploaded by BrianJames on that date
- All the metadata and hashes are stored
- The blockchain has a permanent record
- But they DON'T need to re-upload the video

---

### **Method 2: They Have Your Original Video (No Watermark)**

**If they have your pristine original file:**
1. They go to rendr.com/verify
2. They upload the video file
3. We calculate its SHA-256 hash
4. We search our database for: `WHERE original_sha256 = [calculated_hash]`
5. **If exact match found:**
   * ✅ Verified: This is the PRISTINE ORIGINAL file
   * Confidence: 100% (exact match)
   * Verification code: RND-TN1INQ
   * Status: "This is the unmodified original file uploaded to RENDR"
   * All metadata displayed
6. **If no exact match:**
   * We move to Step 7 below (check key frames)

**What This Proves:**
- This is byte-for-byte identical to what was originally uploaded
- Nothing has been added or removed
- Not even one pixel has changed
- The file is pristine and unaltered

---

### **Method 3: They Have Your Watermarked Video**

**If they have the video with RENDR watermark:**
1. They go to rendr.com/verify
2. They upload the video file
3. We calculate its SHA-256 hash
4. We search our database for: `WHERE watermarked_sha256 = [calculated_hash]`
5. **If exact match found:**
   * ✅ Verified: This is RENDR's OFFICIAL WATERMARKED file
   * Confidence: 100% (exact match)
   * Verification code: RND-TN1INQ
   * Status: "This is the watermarked version from RENDR"
   * All metadata displayed
6. **If no exact match but watermark visible:**
   * We use OCR (text recognition) to read the code from the watermark
   * We look up that code in database
   * We also calculate perceptual hashes to confirm it's the same video
7. **Alternative:** They can just read the code from the watermark and use Method 1

**What This Proves:**
- This video was processed by RENDR
- The watermark proves it passed through our system
- The exact file matches what we returned to the uploader
- All verification data is intact

---

### **Method 4: They Have a Compressed or Edited Version**

**If they have a video that's been:**
- Compressed (re-uploaded to YouTube, TikTok, etc.)
- Cropped (borders added or removed)
- Color-adjusted (brightness, contrast changed)
- Format-changed (converted from MP4 to MOV)
- Slightly edited (minor cuts)

**The Process:**
1. They upload the video to rendr.com/verify
2. We calculate its SHA-256 hash
3. **No exact match found** (expected - the file has been modified)
4. We check for C2PA manifest:
   * Extract the .c2pa sidecar file (if present)
   * OR extract embedded C2PA data from MP4
   * Verify the digital signature
   * Check the hard binding
   * If valid C2PA found:
     - ✅ Verified: C2PA manifest valid
     - Confidence: 95-100%
     - Extract verification code from manifest
     - Look up full details in database
     - Show provenance chain
5. **If no C2PA or C2PA invalid:**
   * We calculate perceptual hashes (pHash) for the submitted video
   * We compare these against ALL videos in our database
   * For each video in database:
     - Calculate similarity score (0-100%)
     - Example: 900 out of 1000 frames match = 90% similarity
   * If we find a match >85%:
     - ✅ Verified: Compressed/edited version of original
     - Confidence: 85-95% (depending on similarity)
     - Verification code: RND-TN1INQ
     - Matched frames: 780/900 (87%)
     - Status: "This video has been re-encoded but matches original content"
     - Warnings: ["Video was compressed", "Resolution changed from 1080p to 720p"]
6. We also check audio hash:
   * Calculate audio hash of submitted video
   * Compare with stored audio hash
   * If audio matches: Adds confidence
   * If audio different: Warning "Audio track modified or replaced"

**Confidence Scoring:**
- 95-100%: Perceptual hashes nearly identical
  * "This is almost certainly the same video, just compressed/reformatted"
- 85-94%: Very high similarity
  * "This is very likely the same video with moderate compression"
- 75-84%: High similarity with edits
  * "This appears to be the same video but with some edits"
- 60-74%: Significant alterations
  * "This may be based on the original but has been heavily edited"
- <60%: Too different or not a match
  * "Cannot verify - too many differences or different video"

**What This Proves:**
- Even if the video has been compressed, cropped, or lightly edited
- We can still match it to the original
- We can prove when the original was created
- We can show what's changed
- We can identify the original uploader

---

## 📱 **HOW MOBILE APP (BODYCAM) WORKS**

### **Differences from Web Upload:**

**On the Mobile Device:**
1. Officer opens RENDR Bodycam app
2. Officer taps "Record"
3. App starts recording using phone camera
4. While recording, app captures:
   * Precise GPS coordinates (updated every second)
   * Exact timestamp
   * Device ID (unique to this phone)
   * Officer ID (logged into the app)
   * App version
   * Camera settings (resolution, frame rate)
   * Device orientation (portrait/landscape)
   * Battery level
   * Network status
5. Officer taps "Stop"
6. App saves video locally on device
7. App can optionally calculate a quick hash before uploading
   * This verifies the video didn't corrupt during recording
8. Officer taps "Upload"
9. Video uploads to RENDR server
   * Same endpoint as web: POST /api/videos/upload
   * Server detects source as "bodycam" automatically
   * Includes all the metadata captured during recording

**On the Server:**
- **Same 18-step process as web upload**
- The only difference is more detailed metadata
- C2PA manifest includes:
  * Digital source type: "Digital Capture" (vs "Uploaded File" for web)
  * More precise GPS data
  * Officer ID in the authorship section
  * Device ID for chain of custody
  * Higher trust level in assertions

**Why This Matters:**
- Body camera footage has higher evidentiary value
- The metadata proves it was captured by the app, not uploaded from elsewhere
- GPS and timestamp can't be easily faked (would require hacking the device)
- Chain of custody is clearer: Phone → App → RENDR
- Courts and investigators trust body camera footage more

**After Upload:**
- Officer sees the verification code immediately
- Can share code with dispatch/supervisor
- Can view video on phone or web dashboard
- Gets same watermarked version
- All same verification features

---

## 🎨 **SHOWCASE FEATURE**

### **What "Show on Showcase" Means:**

**When Checkbox is CHECKED:**
- Video appears on your public profile page: rendr.com/@BrianJames
- Anyone can visit your profile and see this video
- They can watch it without knowing the verification code
- They can see basic info (title, description, date)
- They can see the watermark with verification code
- They can click "Verify" to see full proof

**When Checkbox is UNCHECKED:**
- Video does NOT appear on your public profile
- Only accessible if someone has:
  * The verification code (RND-TN1INQ), OR
  * The direct video file to upload for verification
- More private/secure
- Still fully verified, just not publicly displayed

**Use Cases:**
- **Public Showcase (checked):**
  * Portfolio videos for creators
  * Public records (city council meetings, etc.)
  * News/journalism that should be widely available
  * Marketing or promotional content
  
- **Private/Code-Only (unchecked):**
  * Police body camera footage
  * Legal evidence
  * Private events
  * Sensitive content
  * Things you only want specific people to see

---

## 💾 **STORAGE TIERS**

### **How Long We Keep Your Videos:**

**Free Tier:**
- Storage: 24 hours
- Limit: 5 videos maximum
- After 24 hours:
  * Original video file: DELETED (to save server space)
  * Watermarked video file: DELETED
  * Thumbnail: DELETED
  * But ALL verification data KEPT:
    - Verification code still works
    - All hashes remain in database
    - Can still verify submitted videos
    - C2PA manifest metadata kept
    - Blockchain proof remains
  * You just can't download/stream the video anymore
- Use case: Quick verification, don't need long-term storage

**Pro Tier:**
- Storage: 7 days (168 hours)
- Limit: 100 videos maximum
- Same deletion rules after 7 days
- Use case: Professional use, weekly retention

**Enterprise Tier:**
- Storage: UNLIMITED (forever)
- Limit: UNLIMITED videos
- Videos are NEVER deleted
- Use case: Archives, legal evidence, permanent records

### **What "Verification Data Kept" Means:**

Even after the video file is deleted, you can still:
- ✅ Look up the verification code
- ✅ See all metadata (when, where, who, device)
- ✅ Verify someone's submitted video against your hashes
- ✅ Prove the video existed at a certain time
- ✅ View blockchain proof
- ✅ Export verification certificate
- ❌ Can't stream/download the original video
- ❌ Can't see thumbnail preview

**Why This Matters:**
- Proof of existence without perpetual storage costs
- Legal requirements often only need proof, not the file
- You can prove "I had a video of X on this date" without storing it forever

---

## 🔐 **WHAT MAKES VERIFICATION TRUSTWORTHY**

### **Multiple Layers of Proof:**

**Layer 1: Exact File Matching**
- SHA-256 hashes (original + watermarked)
- 10 key frame hashes
- If ANY byte changes, hash is completely different
- Perfect for pristine originals

**Layer 2: Perceptual Matching**
- 30+ pHash values (DCT-based)
- Survives compression, cropping, color adjustments
- ~85-95% reliable after compression
- Perfect for detecting copies

**Layer 3: Audio Matching**
- Audio waveform hash
- ~90% reliable after compression
- Detects audio swaps/dubbing
- Perfect for voice authentication

**Layer 4: Metadata Matching**
- Device info (iPhone 14 Pro)
- GPS location (Montana)
- Timestamp (Dec 3, 2025)
- Hard to fake (would require device hacking)
- Perfect for chain of custody

**Layer 5: C2PA Standard**
- Industry-recognized format
- Cryptographically signed
- Tamper-evident
- Interoperable with other tools
- Perfect for legal/official use

**Layer 6: Blockchain Proof**
- Immutable timestamp
- Public verification
- Decentralized (not controlled by RENDR)
- Permanent record
- Perfect for timestamping

### **Why Multiple Layers Matter:**

If you only had ONE layer:
- ❌ Just SHA-256: Breaks on any compression
- ❌ Just perceptual: Could have false positives
- ❌ Just metadata: Can be faked
- ❌ Just blockchain: Doesn't prove content
- ❌ Just C2PA: Requires specific tools

With ALL layers:
- ✅ Pristine original → SHA-256 match (100%)
- ✅ Compressed copy → pHash match (85-95%)
- ✅ Heavily edited → Multiple signals combine
- ✅ Sophisticated fake → Will fail multiple checks
- ✅ Legal setting → C2PA + blockchain provide standard proof
- ✅ Technical setting → Hashes provide mathematical proof

---

## 📊 **VERIFICATION CONFIDENCE LEVELS**

### **What Different Scores Mean:**

**100% Confidence:**
- Exact SHA-256 match (original OR watermarked)
- OR verification code lookup
- OR 10/10 key frames match exactly
- **Interpretation:** This is definitely the exact same file
- **Use case:** Legal evidence, official records

**95-99% Confidence:**
- C2PA manifest valid with correct signature
- OR 9/10 key frames match
- OR perceptual hashes >95% similar
- **Interpretation:** Almost certainly the same video, possibly lightly compressed
- **Use case:** News verification, fact-checking

**85-94% Confidence:**
- Perceptual hashes 85-94% similar
- Audio hash matches
- Metadata partially matches
- **Interpretation:** Very likely the same video, compressed or re-encoded
- **Use case:** Social media verification, content moderation

**75-84% Confidence:**
- Perceptual hashes 75-84% similar
- Some frames match but some don't
- Audio may be modified
- **Interpretation:** Appears to be the same video but with some edits
- **Use case:** Detecting derivatives, edited versions

**60-74% Confidence:**
- Perceptual hashes 60-74% similar
- Significant portions match but major changes detected
- **Interpretation:** May be based on original but heavily edited
- **Use case:** Detecting remixes, mashups

**Below 60%:**
- Not enough similarity to verify
- **Interpretation:** Different video or too heavily modified
- **Result:** Cannot verify

---

## 🎬 **SUMMARY: THE ENTIRE JOURNEY**

**Your Perspective (User):**
1. Upload video (2 seconds)
2. Wait 3 seconds
3. Get watermarked video + code
4. Done! Use your video immediately
5. Optionally watch progress bar for 30 seconds
6. Get notification when fully processed

**What Really Happens:**
1. Video arrives → Saved temporarily
2. Original fingerprint → Stored
3. Duplicate check → None found
4. Code generated → RND-TN1INQ
5. Key frames extracted → 10 hashes
6. Watermark applied → FFmpeg
7. Watermarked fingerprint → Stored
8. Thumbnail created → Saved
9. **YOU GET VIDEO BACK** ← 3-5 seconds
10. Background: Metadata extracted
11. Background: 30+ perceptual hashes calculated
12. Background: Audio hash calculated
13. Background: C2PA manifest created
14. Background: Blockchain timestamp
15. Background: Everything saved to database
16. Background: You're notified
17. **FULLY VERIFIED** ← 10-60 seconds total

**The Result:**
- Original video preserved
- Watermarked video ready to share
- Verification code anyone can use
- Multiple layers of cryptographic proof
- Industry-standard C2PA compliance
- Blockchain timestamp
- Verifiable even after compression
- Works for web AND mobile uploads
- Different tiers for different needs

**Your video is now protected by:**
- Mathematics (SHA-256, pHash)
- Technology (FFmpeg, C2PA)
- Standards (Industry-recognized formats)
- Blockchain (Immutable timestamp)
- Metadata (Device, GPS, time proof)

---

## 🚀 **WHY THIS MATTERS**

**For Content Creators:**
- Prove you created content first
- Protect against theft
- Verify authenticity for platforms

**For Journalists:**
- Prove footage is authentic
- Document chain of custody
- Maintain source credibility

**For Law Enforcement:**
- Tamper-evident body camera footage
- Chain of custody documentation
- Court-admissible evidence

**For Legal Professionals:**
- Timestamped evidence
- Provenance tracking
- Industry-standard format

**For Regular People:**
- Prove important moments happened
- Protect precious memories
- Verify what you see online

**The Goal:**
In a world where videos can be easily faked with AI, RENDR provides mathematical and cryptographic proof that a video is real, authentic, and unaltered.
