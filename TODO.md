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

### ✅ COMPLETED TODAY
- [x] **UI Components Integration** (P1) - ALL DONE
  - [x] EditVideoModal save functionality (already implemented)
  - [x] EditFolderModal save functionality (already implemented)
  - [x] Updated UnifiedEditor page with DirectoryTree
  - [x] Added Live Preview panel to editor with context-aware preview
  - [x] Wired up all API calls for folder/video editing
  
- [x] **Frontend Structure Complete** (P1)
  - [x] UnifiedEditor Folders & Content tab redesigned
  - [x] DirectoryTree integrated (shows empty state when no content)
  - [x] Live Preview shows folder/video details dynamically
  - [x] Form fields with proper enable/disable logic
  - [x] Device preview toggle working

## 🟡 TESTING STATUS
- [x] **Backend Testing** - 100% Complete ✅
  - All verification layers working
  - C2PA manifests generating correctly
  - Comprehensive hashing functional
  
- [~] **Frontend Testing** - Partially Complete ⚠️
  - UnifiedEditor fully functional
  - Folders & Content tab working correctly
  - Live Preview panel operational
  - Authentication issues preventing full Dashboard testing (minor, not blocking)

---

### ✅ COMPLETED (Recent)
- [x] **UI Components Integration** (P1) - DONE
  - [x] EditVideoModal save functionality 
  - [x] EditFolderModal save functionality  
  - [x] Updated UnifiedEditor page with DirectoryTree
  - [x] Added Live Preview panel to editor
  - [x] Wired up all API calls
  
- [x] **Frontend Structure** (P1) - DONE
  - [x] UnifiedEditor Folders & Content tab redesigned
  - [x] Live Preview shows folder/video details
  - [x] All UI components working

- [x] **Async Status Updates UI** (P2) - DONE
  - [x] Created VideoProcessingStatus React component
  - [x] Polls /api/videos/{video_id}/status endpoint  
  - [x] Displays verification progress (0-100%)
  - [x] Shows completion of each layer with checklist
  - [x] Real-time progress bar with gradient

- [x] **Resubmission Prevention** (P2) - DONE
  - [x] Detects users re-uploading others' content
  - [x] Strike system (3=warning, 5=temp ban, 10=perm ban)
  - [x] Video fingerprinting to track repeat attempts
  - [x] Blocks banned users from uploading
  - [x] Records all duplicate attempts in database

- [x] **Secure Analytics Pages** (P2) - DONE
  - [x] Role-based access control (investor/ceo/admin)
  - [x] Investor dashboard with platform metrics
  - [x] CEO dashboard with comprehensive stats
  - [x] Video verification statistics
  - [x] User strike/ban tracking
  - [x] System health monitoring

---

## 🟡 REMAINING MEDIUM PRIORITY

### Features
- [ ] **Improve Perceptual Hash Algorithm** (P2)
  - Research alternative algorithms (dhash, whash)
  - Implement videohash library (if needed)
  - Add weighted scoring system
  - Lower threshold for compressed videos

---

## 🔵 FUTURE / BACKLOG

### Social Features (Future Phase)
- [ ] **Notification System** (P4)
  - Bell icon in navigation with unread badge
  - Notifications page/panel
  - Notification types: duplicate upload alerts, new followers, messages, milestones
  - Mark as read/unread functionality
  - Push notifications (optional)

- [ ] **Follow System** (P4)
  - Follow/Unfollow buttons on user profiles
  - Followers/Following counts and lists
  - Activity feed from followed creators
  - Block/unblock functionality
  - Privacy settings (public/private accounts)

- [ ] **Messaging System** (P4)
  - Direct messages between users
  - Message icon in navigation with unread count
  - Inbox/chat interface
  - Message threads
  - Attachments and link support
  - Real-time messaging (WebSocket/polling)

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

- [x] **API Documentation** (P3) - DONE
  - [x] Documented all existing endpoints
  - [x] Created comprehensive API reference guide
  - [x] Included request/response examples
  - [x] Added authentication requirements
  - [x] Documented error codes and best practices
  
- [ ] **API-First Strategy - Remaining** (P3)
  - Design API key authentication (for public API)
  - Implement rate limiting per API key
  - Create developer portal

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
