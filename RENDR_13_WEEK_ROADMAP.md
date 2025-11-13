# RENDR - 13 WEEK MVP ROADMAP
## From Concept to Launchable Product

**Project:** Rendr Video Verification Platform  
**Goal:** Blockchain-verified video authentication system  
**Timeline:** 13 weeks (adjustable based on POC results)  
**Commitment:** 10-15 hours/week  
**Tech Stack:** Python, React, React Native (Expo), FastAPI, MongoDB, Polygon Blockchain

---

## 🎯 PHASE OVERVIEW

| Phase | Weeks | Deliverable | Can Demo? |
|-------|-------|-------------|-----------|
| **Phase 0: POC** | Week 1 | Validated core technology | No |
| **Phase 1: Backend** | Week 2-3 | Working API + test tools | Limited |
| **Phase 2: Web Portal** | Week 4-5 | Verification website | ✅ Yes |
| **Phase 3: Mobile App** | Week 6-11 | iPhone recording app | ✅ Yes |
| **Phase 4: Desktop Studio** | Week 12 | Upload + watermark web app | ✅ Yes |
| **Phase 5: Polish** | Week 13 | Beta testing + refinement | ✅ Yes |

---

## 📅 DETAILED WEEKLY BREAKDOWN

### ⚡ WEEK 1: PROOF OF CONCEPT

**Goal:** Validate that perceptual hashing + blockchain works

**Tasks:**
- ✅ Set up development environment (Python, Node.js, Git)
- ✅ Install perceptual hashing libraries (OpenCV, imagehash)
- ✅ Record test video on iPhone
- ✅ Calculate perceptual hash of video
- ✅ Upload video to Instagram, download it back
- ✅ Re-calculate hash, compare similarity
- ✅ Test editing detection (remove frames, check hash changes)
- ✅ Set up MetaMask wallet on Polygon Mumbai testnet
- ✅ Write hash to blockchain (testnet, $0 cost)
- ✅ Read hash back from blockchain

**Deliverables:**
- `test_phash.py` - Working perceptual hash script
- `test_blockchain.py` - Working blockchain read/write script
- Test results document with similarity scores

**Success Criteria:**
- Re-encoded video similarity ≥ 85%
- Edited video similarity < 90% (detects changes)
- Successfully wrote/read from blockchain
- Total cost: $0

**Time:** 10-15 hours

**DECISION POINT:** 
- ✅ If successful → Proceed to Week 2
- ⚠️ If needs adjustment → Week 2 = more POC testing
- ❌ If failed → Reassess approach

---

### 🏗️ WEEK 2-3: BACKEND FOUNDATION

**Goal:** Build API that can sign videos and verify them

**Environment:**
- Use existing `/app` codebase (FastAPI + MongoDB already set up)
- Windows development

**Week 2 Tasks:**
- Set up MongoDB database schema
  - `users` collection (username, email, tier, etc.)
  - `videos` collection (hash, metadata, blockchain TX ID)
  - `verifications` collection (track verification attempts)
- Build authentication endpoints
  - POST `/api/auth/register` (email + password)
  - POST `/api/auth/login` (returns JWT token)
  - POST `/api/auth/verify-email` (email verification)
  - GET `/api/auth/me` (get current user)
- Set up Polygon mainnet wallet (or continue with testnet)
- Build video signature endpoints
  - POST `/api/videos/sign` (accepts perceptual hash, writes to blockchain)
  - GET `/api/videos/by-code/{code}` (lookup video by verification code)
  - GET `/api/videos/by-user/{username}` (get user's videos)

**Week 3 Tasks:**
- Build verification endpoints
  - POST `/api/videos/verify` (compare uploaded hash to stored hash)
  - GET `/api/videos/metadata/{code}` (get full video metadata)
- Build simple test tool (web page or command-line)
  - Upload video → get verification code
  - Test that signature is stored correctly
- Implement code generation (e.g., `R3ND-4K2P`)
- Test end-to-end: Upload hash → Store in DB → Write to blockchain → Retrieve
- Add error handling, validation, rate limiting

**Deliverables:**
- Working FastAPI backend with all endpoints
- MongoDB with proper schemas
- Blockchain integration (write/read signatures)
- Simple test tool to create signatures
- API documentation

**Success Criteria:**
- Can create user account
- Can sign a video (generate code, store hash, write to blockchain)
- Can retrieve video metadata by code
- Blockchain transaction confirms within 30 seconds
- Cost per signature < $0.02

**Time:** 20-30 hours (2 weeks × 10-15 hours)

---

### 🌐 WEEK 4-5: VERIFICATION PORTAL (Web)

**Goal:** Build public website where anyone can verify videos

**Tech:** React (reuse `/app/frontend` setup), Tailwind CSS

**Week 4 Tasks:**
- Build landing page
  - Explain what Rendr does
  - Show example verification
  - Call-to-action: "Verify a Video"
- Build verification lookup page
  - Input: Verification code (e.g., `R3ND-4K2P`)
  - Output: Video metadata, confidence score
- Build showcase page
  - URL: `rendrtruth.com/@username`
  - Shows all videos from that creator
  - Each video: thumbnail, title, description, code, external link
- Design watermark visual
  - Checkstar logo + username placement
  - Get logo from rendrtruth.com/platform

**Week 5 Tasks:**
- Build "deep verification" feature
  - Drag & drop video file
  - Calculate perceptual hash in browser (or upload to server)
  - Compare to stored hash
  - Show confidence score with explanation
- Build user profile pages
  - Creator can customize their showcase
  - Add title, description to each video
  - Add external link (YouTube, Instagram, etc.)
- Polish UI/UX
  - Make it look professional
  - Mobile-responsive
  - Fast load times
- Add OCR to read watermark from uploaded video (optional, if time)

**Deliverables:**
- Working verification website
- Code lookup functionality
- User showcase pages
- Deep verification (hash comparison)
- Professional UI

**Success Criteria:**
- Can enter code → see video metadata
- Can visit `/@username` → see creator's videos
- Can upload video → get confidence score
- Website looks professional (ready to show people)
- **THIS IS DEMOABLE!** ✅

**Time:** 20-30 hours (2 weeks × 10-15 hours)

**MILESTONE: You can now demo the concept to friends/potential users!**

---

### 📱 WEEK 6-11: MOBILE APP (React Native + Expo)

**Goal:** Build iPhone app to record videos with blockchain signatures

**Tech:** React Native + Expo (works on Windows, tests on iPhone)

**Week 6: Setup & Basic App**
- Install Expo CLI on Windows
- Create new Expo project: `npx create-expo-app rendr-mobile`
- Download "Expo Go" app on iPhone
- Test: Run `npx expo start`, scan QR code, see app on iPhone
- Build basic UI
  - Home screen with "Record" button
  - Settings screen
  - Video library screen (list of recorded videos)
- Set up navigation (React Navigation)

**Week 7: Camera Integration**
- Integrate camera (expo-camera)
- Build recording screen
  - Start/stop recording
  - Show recording timer
  - Switch front/back camera
- Save video to device camera roll
- Show preview after recording

**Week 8: Watermark**
- Add watermark overlay during recording
  - Checkstar logo (top corner)
  - Username (opposite corner)
  - Semi-transparent
- Burn watermark into video (not just overlay)
- Test that watermark survives saving to camera roll

**Week 9: Sensors + Perceptual Hash**
- Capture sensor data during recording:
  - GPS location (expo-location)
  - Accelerometer (expo-sensors)
  - Gyroscope (expo-sensors)
  - Compass heading
  - Device info
- Calculate perceptual hash after recording
  - May need to use native module or server-side processing
  - Or: Upload video to backend, backend calculates hash
- Generate verification code

**Week 10: Blockchain Integration**
- Upload hash + sensor data to backend API
- Backend writes to blockchain
- Display success message to user
- Show verification code
- Add "Copy Code" button
- Add "Share Video" button

**Week 11: Video Library + Polish**
- Build video library screen
  - List all recorded videos
  - Show thumbnail, code, date
  - Tap to see details
- Add user authentication (login/register)
- Connect to backend API
- Polish UI (icons, animations, etc.)
- Test on real iPhone with real scenarios
- Bug fixes

**Deliverables:**
- Working iPhone app (via Expo Go)
- Can record video with watermark
- Captures sensor data
- Generates verification code
- Uploads to backend
- Signs on blockchain
- Video library

**Success Criteria:**
- Can record 30-second video in under 2 minutes (record → process → sign)
- Watermark is visible and correct
- Verification code is generated
- Can see code in app to copy/paste
- Sensor data is captured
- **CORE PRODUCT IS COMPLETE!** ✅

**Time:** 60-90 hours (6 weeks × 10-15 hours)

---

### 🖥️ WEEK 12: DESKTOP STUDIO (Web App)

**Goal:** Let creators upload edited videos and add watermark

**Tech:** React web app (reuse verification portal code)

**Tasks:**
- Build upload interface
  - Drag & drop video file
  - Show file info (size, duration, format)
  - Limit: 500MB (browser processing limit)
- Add watermark in browser
  - Use FFmpeg.wasm (runs in browser, no server upload needed)
  - Add checkstar logo + username
  - Preview watermarked video
- Allow user to:
  - Add title, description
  - Upload thumbnail (or choose frame)
  - Add external link (where they'll post it)
- Process video
  - Calculate perceptual hash in browser (or upload to backend)
  - Generate verification code
  - Upload hash + metadata to backend
  - Backend writes to blockchain
- Download watermarked video
  - User posts to YouTube/Instagram
  - Manually adds code to description
- Show success screen with code

**Deliverables:**
- Working desktop upload + watermark tool
- Client-side video processing (no video storage on server)
- Downloads watermarked video
- Generates code + signs on blockchain

**Success Criteria:**
- Can upload video, add watermark, download result
- Process completes in < 5 minutes for typical video
- Watermarked video plays correctly
- Code is generated and stored
- **FULL MVP COMPLETE!** ✅

**Time:** 10-15 hours

---

### 🧪 WEEK 13: BETA TESTING & POLISH

**Goal:** Test with real users, fix bugs, prepare for launch

**Tasks:**
- Recruit 5-10 beta testers (friends, family)
- Give them test accounts
- Have them:
  - Record videos with mobile app
  - Upload videos with desktop studio
  - Verify videos on website
- Collect feedback
  - What's confusing?
  - What's broken?
  - What do they like?
- Fix critical bugs
- Improve UX based on feedback
- Write user documentation
  - How to record verified video
  - How to verify a video
  - FAQ
- Test different scenarios
  - Record video → post to Instagram → verify
  - Record video → edit elsewhere → post with code → verify (should work)
  - Test with different phone models/OS versions
- Performance optimization
  - Make website load faster
  - Optimize mobile app size
  - Reduce processing time
- Security review
  - Check authentication
  - Check for obvious vulnerabilities
  - Rate limiting working?

**Deliverables:**
- Bug-free (mostly) MVP
- Tested with real users
- Documentation
- Ready for soft launch

**Success Criteria:**
- 5+ people have successfully recorded and verified videos
- No critical bugs remain
- Average user can complete flow without help
- **READY TO LAUNCH!** 🚀

**Time:** 10-15 hours

---

## 🎉 END OF 13 WEEKS: WHAT YOU'LL HAVE

### **Rendr Mobile App (iPhone via Expo)**
- Record video with watermark
- Capture sensor data (GPS, accelerometer, etc.)
- Generate perceptual hash
- Sign on blockchain
- Get verification code
- Video library
- User authentication

### **Rendr Verification Portal (Web)**
- Lookup videos by code
- Creator showcase pages
- Deep verification (upload video, get confidence score)
- Professional UI

### **Rendr Desktop Studio (Web)**
- Upload video
- Add watermark (client-side)
- Download watermarked video
- Generate code + blockchain signature

### **Backend API**
- User authentication
- Video signing
- Blockchain integration
- Verification endpoints
- MongoDB database

### **Proof Points**
- Videos signed on real blockchain (Polygon mainnet)
- Perceptual hashing validated (survives re-encoding)
- End-to-end working product
- Beta tested with real users

---

## 💰 TOTAL COST ESTIMATE (13 Weeks)

**Development Costs:**
- $0 (you're building it yourself with my help)

**Service Costs:**
- Polygon blockchain signatures: $0.01-0.02 per video
  - If 100 test videos: ~$2
- MongoDB: Free tier (MongoDB Atlas) or ~$10/month
- AWS S3 (thumbnails only): ~$1/month
- Domain (rendrtruth.com): Already owned
- **Total: < $50 for entire 13 weeks**

**Optional:**
- Expo EAS Build (when ready to publish): $29/month
  - Not needed until after Week 13

---

## 🚦 KEY DECISION POINTS

### After Week 1 (POC):
**If perceptual hashing doesn't work well:**
- Option A: Try different algorithms (2 more weeks)
- Option B: Adjust expectations (lower confidence scores)
- Option C: Add additional verification layers (audio fingerprint, etc.)

### After Week 5 (Verification Portal):
**Get early feedback:**
- Show website to 5-10 people
- Ask: "Would you use this?"
- If no interest → Reassess product/market fit
- If yes → Full steam ahead on mobile app

### After Week 11 (Mobile App):
**Decide on launch strategy:**
- Soft launch to small group?
- Public launch?
- TestFlight beta first?
- Need to set up Expo EAS for App Store deployment

---

## 🎯 SUCCESS METRICS (By End of Week 13)

**Technical:**
- ✅ Can record video on iPhone
- ✅ Watermark is applied correctly
- ✅ Sensor data is captured
- ✅ Perceptual hash is calculated
- ✅ Signature is written to blockchain
- ✅ Can verify video on website
- ✅ Confidence scores are accurate (>95% for unedited, <90% for edited)

**User Experience:**
- ✅ Complete flow in < 5 minutes (record → sign → verify)
- ✅ No crashes or major bugs
- ✅ UI is intuitive (users don't need extensive instructions)

**Business:**
- ✅ 5-10 beta users have successfully used the product
- ✅ Positive feedback on value proposition
- ✅ Clear next steps for launch/growth

---

## 🛠️ TOOLS & TECHNOLOGIES SUMMARY

| Component | Technology | Why? |
|-----------|-----------|------|
| **Mobile App** | React Native + Expo | Cross-platform, test on iPhone from Windows |
| **Web Apps** | React + Tailwind CSS | Fast development, already set up |
| **Backend** | FastAPI (Python) | Fast, easy to use, already set up |
| **Database** | MongoDB | Flexible schema, already set up |
| **Blockchain** | Polygon | Cheap ($0.01/tx), fast, Ethereum-compatible |
| **Perceptual Hash** | imagehash (Python) | Open source, proven, easy to use |
| **Sensors** | expo-sensors, expo-location | Built into Expo, works on iPhone |
| **Camera** | expo-camera | Built into Expo, easy to use |
| **Video Processing** | OpenCV (Python), FFmpeg.wasm (browser) | Industry standard |
| **Wallet** | MetaMask | Most popular, easy setup |
| **IDE** | VS Code | Free, powerful, great extensions |

---

## 📞 SUPPORT & HELP

**Weekly Check-ins:**
- End of each week, come back to this chat
- Tell me what you completed
- Tell me any blockers
- I'll help troubleshoot
- We'll plan next week together

**When You're Stuck:**
- Share error messages (screenshots help)
- Describe what you tried
- I'll help debug

**Adjusting the Plan:**
- If something takes longer → we adjust
- If something is easier → we move faster
- Timeline is flexible, quality matters most

---

## 🏁 AFTER WEEK 13: WHAT'S NEXT?

### Phase 6: Launch Preparation
- Set up Expo EAS for App Store build
- App Store listing (screenshots, description)
- Create landing page with demo video
- Set up analytics (track usage)
- Set up error monitoring (Sentry)
- Switch from testnet to mainnet (real blockchain)

### Phase 7: Growth
- Launch on Product Hunt
- Share on social media
- Reach out to target users (mystery shoppers, journalists)
- Iterate based on feedback

### Phase 8: Features (Post-MVP)
- Payment integration (Stripe)
- Subscription tiers
- Social media analytics integration
- Geospatial mesh (witness network)
- Advanced showcase customization

### Phase 9: Scale
- Optimize costs
- Improve performance
- Enterprise features
- Platform partnerships

---

## 📝 FINAL NOTES

**This roadmap is realistic because:**
- ✅ You have 10-15 hours/week (adequate)
- ✅ Using existing technologies (not inventing new stuff)
- ✅ Expo solves the Windows/iPhone problem
- ✅ POC validates approach before building
- ✅ Each phase has clear deliverable
- ✅ I'm here to write code and help debug

**This roadmap is ambitious because:**
- ⚠️ You haven't done React Native before (but Expo helps)
- ⚠️ Blockchain integration is new to you (but we tested in POC)
- ⚠️ Solo founder building complex product

**We'll succeed because:**
- ✅ Clear weekly goals
- ✅ Early validation (POC + demo after Week 5)
- ✅ Iterative approach (can adjust as we go)
- ✅ You have the vision and commitment
- ✅ I have the technical guidance

---

## ✅ YOU ARE HERE

**Current Status:** About to start Week 1 POC

**Next Step:** Print the Week 1 POC checklist, go home, set up environment, run tests

**After Week 1:** Come back and report results, we'll plan Week 2-3 together

---

**Let's build the future of video truth verification! 🎬⭐🔐**

---

## 📄 RELATED DOCUMENTS

- `/app/RENDR_COMPLETE_PROJECT_SPEC.md` - Full technical specification
- `/app/WEEK_1_POC_DETAILED_PLAN.md` - Week 1 detailed checklist (PRINT THIS!)
- Additional week-by-week plans will be created as we progress

---

**Last Updated:** Ready to begin Week 1  
**Created for:** Solo founder building on Windows with iPhone  
**Timeline:** 13 weeks to MVP  
**Budget:** < $50  
**Commitment:** 10-15 hours/week  
**Success Rate:** High (with POC validation)  

🚀 **Ready? Let's go!**
