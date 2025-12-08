# RENDR - Project TODO List
*Last Updated: December 9, 2025*

## 🔴 HIGH PRIORITY (Current Sprint)

### ✅ COMPLETED
- [x] **Backend Crash Fix** - Fixed syntax error in comprehensive_hash_service.py
- [x] **C2PA Library Integration** - Installed c2pa-python library (v0.27.1)
- [x] **Comprehensive Hash Service** - Integrated into video upload workflow
- [x] **Dual SHA-256 Implementation** - Original + Watermarked hashes
- [x] **C2PA Manifest Creation** - Generating manifests with all assertions
- [x] **Video Upload API Update** - Full integration of new verification system

### 🟡 IN PROGRESS
- [ ] **Test Perceptual Hash Compression Resistance**
  - Current status: Algorithm implemented but not tested
  - Need to verify >90% similarity after compression
  - Use different hash sizes (16x16 vs 8x8)
  - Test with various compression levels

- [ ] **Test Complete Upload Flow**
  - Upload a test video
  - Verify all hashes are calculated
  - Check C2PA manifest creation
  - Verify database storage
  - Confirm watermark applied

### 🟠 UPCOMING (Next Steps)
- [ ] **UI Components Integration** (P1)
  - Complete EditVideoModal save functionality
  - Complete EditFolderModal save functionality  
  - Update UnifiedEditor page with DirectoryTree
  - Add Live Preview panel to editor
  - Wire up all API calls
  
- [ ] **Frontend Testing** (P1)
  - Test video upload flow
  - Test folder/video editing
  - Test DirectoryTree drag-and-drop
  - Test thumbnail uploads
  - Verify C2PA manifest display

---

## 🟢 MEDIUM PRIORITY

### Features
- [ ] **Async Status Updates UI** (P2)
  - Create React component for real-time progress
  - Poll /api/videos/status/{video_id} endpoint
  - Display verification progress (0-100%)
  - Show completion of each layer

- [ ] **Improve Perceptual Hash Algorithm** (P2)
  - Research alternative algorithms (dhash, whash)
  - Implement videohash library
  - Add weighted scoring system
  - Lower threshold for compressed videos

- [ ] **Resubmission Prevention** (P2)
  - Detect when users try to re-upload flagged videos
  - Implement video fingerprinting
  - Create blocklist system

### Analytics & Admin
- [ ] **Secure Analytics Pages** (P2)
  - Implement role-based access control
  - Create "Investor" dashboard
  - Create "Super Secret CEO" analytics
  - Add video verification statistics

---

## 🔵 FUTURE / BACKLOG

### Phase 3 Features
- [ ] **Sliding Window QR Code Watermarking** (P3)
  - Research invisible watermarking (LSB steganography)
  - Research semi-transparent QR codes
  - Implement frame-by-frame QR generation
  - Test compression resistance
  - Add to premium tier features

- [ ] **Blockchain Integration Enhancement** (P3)
  - Complete blockchain service implementation
  - Implement hash storage on-chain
  - Add blockchain verification endpoint
  - Document blockchain proof format

- [ ] **API-First Strategy** (P3)
  - Document all existing endpoints
  - Create API reference guide
  - Prepare for public-facing API
  - Design API key authentication
  - Plan rate limiting

### Infrastructure
- [ ] **Redis Integration** (P3)
  - Install and configure Redis
  - Implement message queue
  - Add real-time status updates
  - Enable background job processing

- [ ] **C2PA Signing with Certificates** (P3)
  - Generate or acquire signing certificates
  - Implement proper C2PA signing
  - Embed manifests in video files
  - Add signature verification

---

## 📊 TESTING CHECKLIST

### Backend Testing
- [ ] Video upload with all hashes
- [ ] Duplicate detection
- [ ] C2PA manifest creation
- [ ] Perceptual hash compression test
- [ ] Blockchain timestamping
- [ ] Video expiration system

### Frontend Testing
- [ ] Login/signup flow
- [ ] Video upload UI
- [ ] Dashboard video display
- [ ] EditVideoModal functionality
- [ ] EditFolderModal functionality
- [ ] DirectoryTree drag-and-drop
- [ ] Showcase page display

### Integration Testing
- [ ] End-to-end upload flow
- [ ] Verification code lookup
- [ ] Video streaming
- [ ] Thumbnail generation
- [ ] Folder organization
- [ ] User quota enforcement

---

## 🐛 KNOWN ISSUES

### Critical
- None currently

### Minor
- [ ] Mobile responsiveness needs testing
- [ ] Editor page not updated with new components
- [ ] Video auto-play needs disable option

---

## 📝 NOTES

### Recent Changes
- Moved Sliding Window QR watermarking to Phase 3 (per user request)
- Completed comprehensive hashing integration
- Added C2PA manifest creation to upload flow
- Fixed backend syntax error that was blocking startup

### User Preferences
- Focus on core verification system first
- Testing required before finishing tasks
- C2PA is important for future 3rd party integration
- Compression resistance is critical for verification

### Technical Decisions
- Using c2pa-python library for standard compliance
- Perceptual hashing with 16x16 DCT for compression resistance
- Dual SHA-256 approach (original + watermarked)
- C2PA manifests stored as sidecar files (.c2pa)

---

**Priority Legend:**
- P0 = Blocker (must fix immediately)
- P1 = High (complete this sprint)
- P2 = Medium (next sprint)
- P3 = Low (backlog)
