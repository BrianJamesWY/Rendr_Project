# RENDR WATERMARK SPECIFICATION
## Checkstar Logo + Username Overlay

---

## 🎨 THE WATERMARK

### What It Looks Like:

```
┌─────────────────────────────────┐
│                                 │
│   [VIDEO CONTENT]               │
│                                 │
│                                 │
│                                 │
│                        ✓★ RENDR │ ← Watermark here
│                        @username│
└─────────────────────────────────┘
```

### Design Elements:

**Watermark Components:**
```
┌──────────────────┐
│  ✓★ RENDR       │ ← Checkstar + Brand name
│  @johnsmith     │ ← Username
│  Jan 15, 10:30  │ ← Timestamp (optional)
└──────────────────┘
```

### Visual Specifications:

**Size:** 
- Width: ~15-20% of video width
- Height: Auto (based on text)
- Example: For 1920x1080, watermark is ~300px wide

**Position Options:**
1. ✅ **Bottom-right** (Recommended) - Standard, doesn't block important content
2. Top-right - Alternative
3. Bottom-left - Alternative
4. Moving/rotating - Anti-crop protection (advanced)

**Opacity:**
- 70-80% opacity
- Semi-transparent so it doesn't completely block content
- Still clearly visible and readable

**Colors:**
```
Background: Black with 50% opacity
Text: White
Checkstar: Gold (#f59e0b) or White
Border: Optional subtle glow/shadow for readability
```

**Font:**
- Bold, sans-serif (Arial, Helvetica)
- Large enough to read but not intrusive
- Checkstar: Larger than text

---

## 🎬 WHEN DOES WATERMARK GET ADDED?

### Option A: Real-Time During Recording ⭐ BEST

**How it works:**
```
Camera starts
    ↓
Watermark overlay added to viewfinder
    ↓
User sees watermark in real-time
    ↓
Video recorded WITH watermark burned in
    ↓
Watermark is permanent part of video file
```

**Pros:**
- ✅ User sees exactly what will be recorded
- ✅ WYSIWYG (What You See Is What You Get)
- ✅ No post-processing needed
- ✅ Watermark survives any edits/crops
- ✅ Immediate, no waiting

**Cons:**
- ⚠️ Can't change watermark after recording
- ⚠️ Slightly more complex implementation

**Technical:**
```javascript
// React Native Camera overlay
<Camera>
  <View style={{position: 'absolute', bottom: 20, right: 20}}>
    <Text style={{color: 'white', fontSize: 24}}>
      ✓★ RENDR
    </Text>
    <Text style={{color: 'white', fontSize: 18}}>
      @{username}
    </Text>
  </View>
</Camera>
```

---

### Option B: Post-Processing After Recording

**How it works:**
```
User stops recording
    ↓
Video saved without watermark
    ↓
Processing: Add watermark to video file
    ↓
Creates new video WITH watermark
    ↓
Deletes original
    ↓
Uploads watermarked version
```

**Pros:**
- ✅ Can customize watermark after recording
- ✅ Could offer multiple watermark styles
- ✅ Could add more info (blockchain TX after upload)

**Cons:**
- ❌ Takes 5-15 seconds to process
- ❌ Uses more battery
- ❌ Requires FFmpeg on mobile
- ❌ User waits longer
- ❌ More complex, more failure points

**Technical:**
```
Requires: FFmpeg for mobile
Process: Video re-encoding with overlay
Time: 5-15 seconds for 30 second video
```

---

### Option C: Server-Side (Backend adds it)

**How it works:**
```
User uploads raw video
    ↓
Backend receives video
    ↓
Server adds watermark
    ↓
Saves watermarked version
    ↓
Returns verification code
```

**Pros:**
- ✅ No processing on phone
- ✅ Saves battery
- ✅ Can add blockchain TX to watermark

**Cons:**
- ❌ Longer backend processing
- ❌ More server costs
- ❌ User uploads raw video (could steal it)
- ❌ Doesn't protect video during upload

---

## 💡 MY RECOMMENDATION: Option A (Real-Time)

**Why:**
1. User sees watermark while recording (confidence)
2. No post-processing delay
3. Watermark is burned in immediately
4. Protects video from the moment it's recorded
5. Simpler implementation
6. Lower battery usage
7. Can screenshot and watermark is already there

**Implementation:**
- React Native Camera with custom overlay
- Watermark rendered on top of camera preview
- Recorded video includes overlay
- No additional processing needed

---

## 🎨 WATERMARK DESIGN VARIATIONS

### Minimal (Recommended for MVP):
```
┌──────────────┐
│  ✓★ RENDR   │
│  @username  │
└──────────────┘
```

### Standard:
```
┌──────────────────┐
│  ✓★ RENDR       │
│  @username      │
│  Jan 15, 10:30  │
└──────────────────┘
```

### Detailed:
```
┌────────────────────┐
│  ✓★ RENDR         │
│  @username        │
│  Jan 15, 10:30 AM │
│  37.7749,-122.419 │ ← GPS coordinates
└────────────────────┘
```

### Future (Blockchain Added Later):
```
┌────────────────────┐
│  ✓★ RENDR         │
│  @username        │
│  Jan 15, 10:30 AM │
│  🔗 0xabc123...   │ ← Blockchain TX (added after upload)
└────────────────────┘
```

---

## 📱 MOBILE IMPLEMENTATION

### During Recording Screen:

```
┌─────────────────────────────────┐
│  🔴 REC  00:15                  │
├─────────────────────────────────┤
│                                 │
│   [LIVE CAMERA FEED]            │
│                                 │
│   (User sees watermark          │
│    in bottom-right corner       │
│    of viewfinder)               │
│                        ✓★ RENDR │ ← Visible while recording
│                        @john    │
├─────────────────────────────────┤
│         [⬜ STOP]               │
└─────────────────────────────────┘
```

### Technical Implementation:

```javascript
// Expo Camera with Watermark Overlay
import { Camera } from 'expo-camera';

<Camera ref={cameraRef} style={styles.camera}>
  {/* Recording controls */}
  <View style={styles.controls}>
    {/* ... record button, timer, etc. */}
  </View>
  
  {/* WATERMARK OVERLAY */}
  <View style={styles.watermark}>
    <View style={styles.watermarkContainer}>
      <Text style={styles.checkstar}>✓★ RENDR</Text>
      <Text style={styles.username}>@{currentUser.username}</Text>
      {showTimestamp && (
        <Text style={styles.timestamp}>
          {new Date().toLocaleString()}
        </Text>
      )}
    </View>
  </View>
</Camera>

const styles = StyleSheet.create({
  watermark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  watermarkContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  checkstar: {
    color: '#f59e0b', // Gold
    fontSize: 24,
    fontWeight: 'bold',
  },
  username: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  }
});
```

---

## 🔒 WATERMARK AS SECURITY FEATURE

### Why Watermark Matters:

**1. Ownership Proof:**
- Anyone who sees video sees who recorded it
- Can't easily remove watermark
- Links back to verified account

**2. Anti-Theft:**
- If someone steals and re-uploads video
- Watermark shows original owner
- Duplicate detection will catch them
- Original owner gets notified

**3. Branding:**
- Every video advertises Rendr
- People ask "What's that checkstar?"
- Builds brand awareness

**4. Trust Signal:**
- Watermark = verified on Rendr
- No watermark = not verified
- Easy visual indicator

---

## 👤 USERNAME RESERVATION (From RSVP)

### Connection to RSVP System:

**When user signs up:**
```
1. User reserves username on RSVP page
   Example: "johnsmith"

2. When they create account in app:
   Email matches → Gets reserved username
   Email doesn't match → Choose different username

3. Username appears in watermark:
   @johnsmith
```

**Username Rules:**
```
✓ 3-20 characters
✓ Letters, numbers, underscores only
✓ Must be unique
✓ Cannot change after set (permanent)
✗ No spaces
✗ No special characters
```

**Example Flow:**
```
John reserves @johnsmith on rendrtruth.com/rsvp
    ↓
John downloads Rendr Bodycam app
    ↓
John creates account with same email
    ↓
App: "Welcome! Your username @johnsmith is ready"
    ↓
John records video
    ↓
Watermark shows: @johnsmith
```

---

## 🎨 WATERMARK CUSTOMIZATION

### User Settings (Future):

**Position:**
- [ ] Bottom-right (default)
- [ ] Top-right
- [ ] Bottom-left
- [ ] Top-left

**Content:**
- [x] Show username (always)
- [ ] Show timestamp (optional)
- [ ] Show GPS coordinates (optional)
- [ ] Show "Verified" badge (optional)

**Style:**
- [ ] Minimal (just username)
- [x] Standard (username + time)
- [ ] Detailed (all info)

**Size:**
- [ ] Small
- [x] Medium (default)
- [ ] Large

---

## ⚠️ ANTI-WATERMARK PROTECTION

### What If Someone Tries to Remove It?

**Crop Attack:**
- Problem: User crops video to remove watermark
- Solution: Place watermark away from edges (safe zone)
- Advanced: Moving watermark that changes position

**Blur Attack:**
- Problem: User blurs watermark area
- Solution: Detect blur in verification (future)
- Note: Blurring watermark looks suspicious

**Cover Attack:**
- Problem: User adds something over watermark
- Solution: Original video has hash without cover
- Deep verification will detect tampering

**Re-record Attack:**
- Problem: User plays video and re-records screen
- Solution: Quality loss + no sensor data
- Verification will show as "re-recorded"

---

## 📊 WATERMARK DATA IN VERIFICATION

### When Video Is Verified:

**Backend knows:**
- Username from watermark (visual)
- Username from account (who uploaded)
- Blockchain timestamp
- Sensor data

**Verification result shows:**
```
✓ Video Verified
  Original owner: @johnsmith
  Recorded: Jan 15, 2025 10:30 AM
  Uploaded by: @johnsmith ← Match = authentic
  Blockchain proof: 0xabc123...
```

**If watermark doesn't match uploader:**
```
⚠️ Warning
  Watermark shows: @johnsmith
  Uploaded by: @janedoe ← Mismatch!
  
  This could indicate:
  - Re-uploaded stolen content
  - Shared video
  - Collaboration
```

---

## 🎨 CHECKSTAR LOGO DESIGN

### The ✓★ Symbol:

**Meaning:**
- ✓ = Verified
- ★ = Star/quality/premium
- Together = "Verified star content"

**Visual Styling:**
```
Option 1: Two separate characters
  ✓★

Option 2: Combined glyph (custom)
  [custom checkstar icon]

Option 3: With background
  ┌────┐
  │ ✓★ │
  └────┘
```

**Colors:**
- Gold (#f59e0b) - Premium, stands out
- White (#ffffff) - Clean, readable
- Gradient (gold → yellow) - Eye-catching

---

## 💻 TECHNICAL IMPLEMENTATION STEPS

### Phase 1: Basic Watermark (MVP)
```
1. Create watermark component in React Native
2. Overlay on camera view
3. Show username + "RENDR"
4. Position: bottom-right
5. Style: white text, dark background
6. Test on iPhone
```

### Phase 2: Styling
```
1. Add checkstar symbol (✓★)
2. Style with gold color
3. Add timestamp
4. Add semi-transparent background
5. Test readability on various backgrounds
```

### Phase 3: User Settings
```
1. Add settings screen
2. Allow position selection
3. Allow show/hide timestamp
4. Save preferences
```

### Phase 4: Advanced
```
1. Add GPS coordinates (optional)
2. Add blockchain TX after upload
3. Moving watermark (anti-crop)
4. Custom watermark styles
```

---

## 🎯 FOR MVP: SIMPLE & EFFECTIVE

### What We Build First:

**Watermark Contains:**
```
✓★ RENDR
@username
```

**Style:**
- Bottom-right corner
- White text on dark semi-transparent background
- Checkstar in gold
- Medium size (~20% of width)
- Always visible during recording

**Implementation:**
- React Native overlay
- Burned into video in real-time
- No post-processing
- Works immediately

---

## 📋 WATERMARK CHECKLIST

For mobile app development:

**Must Have:**
- [ ] Watermark visible during recording
- [ ] Shows username (@username)
- [ ] Shows Rendr brand (✓★ RENDR)
- [ ] Burned into video permanently
- [ ] Bottom-right position
- [ ] Readable on any background

**Should Have:**
- [ ] Timestamp display
- [ ] Semi-transparent background
- [ ] Gold checkstar color
- [ ] Clean, professional font

**Nice to Have:**
- [ ] Position customization
- [ ] Size options
- [ ] Show/hide elements
- [ ] Moving watermark

---

## 🎬 UPDATED RECORDING FLOW (WITH WATERMARK)

```
User taps "Record"
    ↓
Camera opens with watermark overlay visible
    ↓
User sees: ✓★ RENDR
          @username
    ↓
User presses record button
    ↓
Video records with watermark burned in
    ↓
Sensors collect data
    ↓
User presses stop
    ↓
Video saved WITH watermark
    ↓
Upload happens
    ↓
Backend verifies
    ↓
Success!
```

**Key point:** Watermark is there from frame 1, forever.

---

## ✅ SUMMARY

**Watermark = Critical Security Feature**

**Contains:**
- ✓★ RENDR (brand + checkstar)
- @username (ownership)
- Optional: timestamp, GPS

**When Added:**
- Real-time during recording (recommended)
- Visible in camera viewfinder
- Burned into video file
- No removal possible

**Purpose:**
- Prove ownership
- Brand visibility
- Anti-theft protection
- Trust signal

**Implementation:**
- React Native camera overlay
- ~10 lines of code
- No post-processing
- Works immediately

---

**Next:** When you create UI in Figma/Claude, include the watermark design. I'll implement it exactly as you design it! 🎨

