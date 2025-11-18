# RENDR BODYCAM - RECORDING FLOW SPECIFICATION
## What Happens During & After Recording

---

## 🎬 COMPLETE USER FLOW

```
User opens app
    ↓
Home screen
    ↓
Taps "Record Video"
    ↓
Camera screen opens
    ↓
[DURING RECORDING - Section 1]
    ↓
User taps "Stop"
    ↓
[AFTER RECORDING - Section 2]
    ↓
User gets verification code
    ↓
Done!
```

---

## 📹 SECTION 1: DURING RECORDING

### What Happens Simultaneously:

```
┌─────────────────────────────────────────────────────┐
│  CAMERA                                             │
│  • Recording video frames                           │
│  • Encoding to H.264/HEVC                          │
│  • Writing to temp file                            │
│  • Timestamp: Every frame                          │
└─────────────────────────────────────────────────────┘
           ↓ (parallel processes)
┌─────────────────────────────────────────────────────┐
│  GPS SENSOR                                         │
│  • Collecting location every 1 second               │
│  • Lat, Long, Accuracy, Altitude                   │
│  • Storing in array                                │
│  • Example: [{lat: 37.7749, lng: -122.4194, t: 0}] │
└─────────────────────────────────────────────────────┘
           ↓ (parallel processes)
┌─────────────────────────────────────────────────────┐
│  ACCELEROMETER                                      │
│  • Measuring movement/shake                         │
│  • Collecting every 100ms                          │
│  • X, Y, Z axis values                             │
│  • Storing in array                                │
└─────────────────────────────────────────────────────┘
           ↓ (parallel processes)
┌─────────────────────────────────────────────────────┐
│  GYROSCOPE                                          │
│  • Measuring rotation/orientation                   │
│  • Collecting every 100ms                          │
│  • X, Y, Z rotation values                         │
│  • Storing in array                                │
└─────────────────────────────────────────────────────┘
           ↓ (parallel processes)
┌─────────────────────────────────────────────────────┐
│  DEVICE INFO                                        │
│  • Timestamp when recording started                 │
│  • Device model, OS version                        │
│  • App version                                     │
│  • Battery level (optional)                        │
└─────────────────────────────────────────────────────┘
```

### UI During Recording:

```
┌─────────────────────────────────────┐
│  🔴 REC  00:15  [📶 4G] [🔋 85%]   │ ← Status bar
├─────────────────────────────────────┤
│                                     │
│                                     │
│     [LIVE CAMERA VIEWFINDER]        │
│                                     │
│      📍 GPS: Active                 │ ← Sensor status
│      📊 Sensors: Recording          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│         [⬜ STOP]                   │ ← Stop button
└─────────────────────────────────────┘
```

### Technical Details:

**1. Video Recording:**
```javascript
{
  format: "mp4",
  codec: "h264",
  quality: "high", // or "medium", "low"
  fps: 30,
  resolution: "1920x1080" // or "1280x720"
}
```

**2. GPS Collection (every 1 second):**
```javascript
gpsData = [
  {
    timestamp: 0,      // seconds from start
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10.5,    // meters
    altitude: 15.2,    // meters
    speed: 2.5         // m/s (optional)
  },
  {
    timestamp: 1,
    latitude: 37.7750,
    longitude: -122.4195,
    // ...
  }
]
```

**3. Accelerometer Collection (every 100ms = 10x per second):**
```javascript
accelerometerData = [
  {
    timestamp: 0.0,
    x: 0.02,
    y: 9.81,  // gravity
    z: 0.03
  },
  {
    timestamp: 0.1,
    x: 0.05,
    y: 9.80,
    z: 0.04
  }
]
```

**4. Gyroscope Collection (every 100ms):**
```javascript
gyroscopeData = [
  {
    timestamp: 0.0,
    x: 0.01,  // pitch
    y: 0.02,  // roll
    z: 0.03   // yaw
  }
]
```

### Data Size Estimates:

For a **30 second video:**

| Data Type | Size | Notes |
|-----------|------|-------|
| Video file | ~15-50 MB | Depends on quality |
| GPS data | ~1-2 KB | 30 points |
| Accelerometer | ~10-15 KB | 300 points |
| Gyroscope | ~10-15 KB | 300 points |
| Device info | <1 KB | Static |
| **TOTAL** | **~15-50 MB** | 99% is video |

---

## 🛑 SECTION 2: WHEN USER TAPS "STOP"

### Immediate Actions (0-2 seconds):

**Step 1: Stop All Recording (0.1 seconds)**
```
✓ Stop camera recording
✓ Stop GPS collection
✓ Stop accelerometer
✓ Stop gyroscope
✓ Save video file to temp location
```

**Step 2: Show Processing Screen**
```
┌─────────────────────────────────────┐
│  Processing Video...                │
│                                     │
│      [Processing icon/spinner]      │
│                                     │
│  Preparing your video for           │
│  verification                       │
└─────────────────────────────────────┘
```

### Background Processing (2-10 seconds):

**Step 3: Bundle Data Together**
```javascript
videoPackage = {
  video: {
    uri: "file://temp/video123.mp4",
    duration: 30.5,
    size: 25600000,  // bytes
    resolution: "1920x1080",
    fps: 30
  },
  metadata: {
    recordedAt: "2025-01-15T10:30:00Z",
    device: {
      model: "iPhone 13",
      os: "iOS 17.1",
      appVersion: "1.0.0"
    },
    sensors: {
      gps: [...],          // array of GPS points
      accelerometer: [...], // array of accel data
      gyroscope: [...]     // array of gyro data
    }
  }
}
```

**Step 4: Decide What To Do Next**

---

## 🔀 DECISION POINT: Upload Now or Later?

### Option A: Automatic Upload (Recommended)

**When video stops:**
```
1. Stop recording
2. Show "Processing..." (2 seconds)
3. Automatically start upload
4. Show upload progress
5. When done, show verification code
6. User can leave or share
```

**Pros:**
- ✅ Simple for user
- ✅ Video verified immediately
- ✅ Can't forget to upload
- ✅ Fresh blockchain timestamp

**Cons:**
- ❌ Uses data immediately (on cellular)
- ❌ Can't review video first
- ❌ Forces user to wait

### Option B: Review Then Upload

**When video stops:**
```
1. Stop recording
2. Show preview screen
3. User reviews video
4. User taps "Upload & Verify"
5. Upload happens
6. Show verification code
```

**Pros:**
- ✅ User can review first
- ✅ Can delete bad videos
- ✅ More control

**Cons:**
- ❌ Extra step
- ❌ User might forget to upload
- ❌ Delayed verification

### Option C: Save Locally, Upload Later

**When video stops:**
```
1. Stop recording
2. Save to local storage
3. Show "Saved locally"
4. User uploads when ready (later)
```

**Pros:**
- ✅ No data usage immediately
- ✅ Can batch upload on WiFi
- ✅ Maximum flexibility

**Cons:**
- ❌ Not verified immediately
- ❌ Risk of never uploading
- ❌ Timestamp not from recording time

---

## 💡 MY RECOMMENDATION: Hybrid Approach

### Smart Auto-Upload with Settings:

**Default Behavior:**
```
IF on WiFi:
  → Auto-upload immediately
  
IF on Cellular:
  → Save locally
  → Show "Will upload on WiFi"
  → Upload when WiFi available
  
User can change in Settings:
  → "Always upload immediately"
  → "WiFi only"
  → "Ask me every time"
```

**User Experience:**
```
User stops recording
    ↓
Processing... (2 sec)
    ↓
Check network
    ↓
┌─────WiFi?─────┐
│               │
YES            NO
│               │
Upload now     Save locally
│               │
Show code      Show "Saved"
               Upload later
               on WiFi
```

---

## 📱 AFTER RECORDING STOPS - UI SCREENS

### Screen 1: Processing (2-3 seconds)
```
┌─────────────────────────────────────┐
│                                     │
│      🎬                             │
│                                     │
│   Processing Video...               │
│                                     │
│   [Spinner animation]               │
│                                     │
│   Finalizing recording              │
│   Collecting sensor data            │
│                                     │
└─────────────────────────────────────┘
```

### Screen 2A: Uploading (If auto-upload)
```
┌─────────────────────────────────────┐
│   Uploading & Verifying...          │
│                                     │
│   [Progress bar]                    │
│   ████████████░░░░░░░ 65%          │
│                                     │
│   • Uploading video                 │
│   • Creating hash                   │
│   • Writing to blockchain           │
│                                     │
│   15 MB / 25 MB                     │
│   (~30 seconds remaining)           │
│                                     │
│   [Cancel] ← (saves locally)        │
└─────────────────────────────────────┘
```

### Screen 2B: Saved Locally (If no upload)
```
┌─────────────────────────────────────┐
│   ✓ Video Saved                     │
│                                     │
│   Your video has been saved         │
│   locally and will upload when      │
│   you connect to WiFi               │
│                                     │
│   Duration: 30 seconds              │
│   Size: 25 MB                       │
│                                     │
│   📶 Upload Now Anyway              │
│   (uses cellular data)              │
│                                     │
│   [View Saved Videos]  [Record New] │
└─────────────────────────────────────┘
```

### Screen 3: Success!
```
┌─────────────────────────────────────┐
│   ✓ Video Verified!                 │
│                                     │
│   Your verification code:           │
│                                     │
│   ┌─────────────────────────────┐   │
│   │     RND-ABC123              │   │
│   │     [Copy]                  │   │
│   └─────────────────────────────┘   │
│                                     │
│   ⛓️ Blockchain Verified            │
│   TX: 0xabc123...def456            │
│   [View on Polygonscan]            │
│                                     │
│   Anyone can verify this video      │
│   using this code.                  │
│                                     │
│   [Share Code]  [Record Another]    │
│   [View Video]                      │
└─────────────────────────────────────┘
```

### Screen 4: Error Handling
```
┌─────────────────────────────────────┐
│   ⚠️ Upload Failed                  │
│                                     │
│   We couldn't upload your video.    │
│                                     │
│   Reason: Poor connection           │
│                                     │
│   Your video is saved locally       │
│   and will retry automatically.     │
│                                     │
│   [Retry Now]    [View Saved]       │
└─────────────────────────────────────┘
```

---

## 🔄 UPLOAD PROCESS DETAIL

### What Happens During Upload:

**Phase 1: Prepare (1-2 seconds)**
```
1. Compress video (if needed)
2. Bundle sensor data into JSON
3. Get auth token from storage
4. Prepare multipart form data
```

**Phase 2: Upload Video (10-60 seconds depending on size/speed)**
```
POST /api/videos/upload
Headers: {
  Authorization: "Bearer token"
}
Body: {
  video_file: [binary data],
  source: "bodycam",
  sensor_data: JSON.stringify({...})
}

Progress updates every 500ms:
  15% uploaded...
  30% uploaded...
  65% uploaded...
  100% uploaded!
```

**Phase 3: Backend Processing (2-5 seconds)**
```
Backend:
  1. Receives video
  2. Extracts frames
  3. Calculates perceptual hash
  4. Checks for duplicates
  5. Writes to blockchain
  6. Saves to database
  7. Returns verification code
```

**Phase 4: Show Result**
```
Display:
  - Verification code
  - Blockchain TX hash
  - Success message
```

---

## 📊 DATA HANDLING

### What Gets Stored Locally (Before Upload):

```
Local Storage:
├── Videos/
│   ├── video_123.mp4 (the actual video)
│   └── video_456.mp4
├── Metadata/
│   ├── video_123_meta.json (sensor data)
│   └── video_456_meta.json
└── Upload Queue/
    └── pending_uploads.json
```

**pending_uploads.json:**
```javascript
{
  "queue": [
    {
      "id": "123",
      "videoPath": "Videos/video_123.mp4",
      "metadataPath": "Metadata/video_123_meta.json",
      "recordedAt": "2025-01-15T10:30:00Z",
      "size": 25600000,
      "uploaded": false,
      "uploadAttempts": 0
    }
  ]
}
```

### What Gets Deleted After Upload:

**Option A: Delete Immediately (Save Space)**
```
After successful upload:
  ✓ Delete video file
  ✓ Delete metadata file
  ✓ Remove from queue
  ✓ Keep only verification code
```

**Option B: Keep for X Days**
```
After successful upload:
  ✓ Mark as uploaded
  ✓ Keep for 7 days
  ✓ Auto-delete after 7 days
  ✓ User can delete manually anytime
```

**Recommendation:** Option B (keep for 7 days)
- User can review later
- Can re-upload if needed
- Safety net for issues

---

## 🔋 BATTERY & PERFORMANCE

### Battery Drain During Recording:

| Activity | Battery Drain Rate |
|----------|-------------------|
| Camera only | ~15%/hour |
| Camera + GPS | ~25%/hour |
| Camera + GPS + Sensors | ~30%/hour |

**30 second video ≈ 0.25% battery**

### Optimization Strategies:

**1. Reduce Sensor Sampling:**
```
Instead of: 10 samples/second (100ms)
Use: 5 samples/second (200ms)
Saves: ~5% battery
Impact: Minimal loss of data quality
```

**2. Smart GPS:**
```
If not moving (accel = 0):
  Reduce GPS to 1 sample/5 seconds
If moving:
  Full GPS 1 sample/second
```

**3. Background Upload:**
```
Don't block UI during upload
Allow user to continue using app
Upload in background
```

---

## 📱 STORAGE MANAGEMENT

### Storage Usage Estimates:

| Duration | Video Size | Metadata | Total |
|----------|-----------|----------|-------|
| 30 sec | 20-30 MB | 25 KB | ~30 MB |
| 1 min | 40-60 MB | 50 KB | ~60 MB |
| 5 min | 200-300 MB | 250 KB | ~300 MB |

### Storage Warnings:

**Low Storage Detection:**
```
Before recording starts:
  Check available storage
  
  If < 500 MB:
    Show warning: "Low storage. 
    Recording may fail. Free up space?"
  
  If < 100 MB:
    Block recording: "Not enough storage.
    Please free up at least 500 MB."
```

**Auto-Cleanup:**
```
Settings option:
  "Auto-delete uploaded videos after 7 days"
  (Recommended: ON)
```

---

## 🎯 EDGE CASES TO HANDLE

### 1. Recording Interrupted:

**Scenarios:**
- Phone call comes in
- App crashes
- Battery dies
- User force-closes app

**Solution:**
```
Save partial video immediately
Mark as "incomplete"
On next app open:
  Show: "You have an incomplete recording. 
        Upload anyway or delete?"
```

### 2. Upload Fails:

**Scenarios:**
- Network drops during upload
- Backend server down
- File too large
- Token expired

**Solution:**
```
Save to upload queue
Auto-retry:
  - After 1 minute
  - After 5 minutes
  - After 1 hour
  - Then manual

Show in app:
  "3 videos pending upload"
  [Retry All]
```

### 3. GPS Not Available:

**Scenarios:**
- Indoor recording
- GPS disabled
- Poor signal

**Solution:**
```
Show warning before recording:
  "⚠️ GPS signal weak. 
  Video will record but location 
  data may be incomplete."

Allow recording anyway
Mark video as "GPS: Partial" or "GPS: None"
```

### 4. Permissions Denied:

**Scenarios:**
- Camera permission denied
- Location permission denied
- Microphone permission denied

**Solution:**
```
On app first open:
  Request all permissions with clear explanation
  
If denied:
  Show educational screen:
  "Rendr needs these permissions because..."
  [Open Settings]
  
Critical: Camera permission
Can work without: GPS (with warning)
```

---

## 🎨 ANIMATIONS & FEEDBACK

### Recording Start:
```
1. Red pulse on record button (0.5s)
2. Timer starts counting
3. Status indicators turn green
4. Haptic feedback (vibration)
```

### Recording Stop:
```
1. Button press animation
2. Camera freezes (1 frame)
3. Fade to processing screen
4. Haptic feedback
```

### Upload Progress:
```
1. Progress bar fills smoothly
2. Percentage updates
3. Time estimate updates
4. Completion: Success animation
```

### Success:
```
1. Checkmark animation
2. Code appears with slide-in effect
3. Confetti animation (optional)
4. Haptic success feedback
```

---

## ✅ FINAL RECOMMENDATION

### The Ideal Flow:

**During Recording:**
- Clean UI showing timer and sensor status
- Minimal distractions
- Easy-to-find stop button
- Visual feedback that recording is active

**After Stop:**
- Immediate processing (2-3 sec)
- Smart upload decision (WiFi = auto, Cellular = save)
- Clear progress indication
- Can cancel and save locally
- Graceful error handling

**After Upload:**
- Big, clear verification code
- Copy button
- Share button
- Blockchain proof visible
- Option to record another immediately

**Settings Allow:**
- Upload behavior (auto, WiFi-only, ask)
- Video quality
- Keep videos after upload (7 days default)
- Sensor sampling rate (advanced)

---

## 🎯 IMPLEMENTATION PRIORITY

### Must Have (MVP):
1. ✅ Record video
2. ✅ Collect GPS data
3. ✅ Upload to backend
4. ✅ Get verification code
5. ✅ Show success screen

### Should Have (Phase 2):
6. ⏭️ Smart WiFi/cellular detection
7. ⏭️ Upload queue for offline
8. ⏭️ Progress indicators
9. ⏭️ Error handling

### Nice to Have (Phase 3):
10. ⏭️ Video preview before upload
11. ⏭️ Local storage management
12. ⏭️ Advanced sensor settings
13. ⏭️ Analytics/stats

---

**Ready to build this flow?** Once you have UI designs from Figma/Claude, I'll implement this entire recording flow with all the logic and data handling! 🎬

