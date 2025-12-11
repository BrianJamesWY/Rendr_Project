# RENDR PLATFORM - COMPLETE MANUAL TESTING CHECKLIST

**Date:** _______________  
**Tester Name:** _______________  
**Browser:** _______________  
**Device:** _______________  

---

## 📋 INSTRUCTIONS

1. Work through each section in order
2. Check the box when test passes: ✅
3. If test fails, write notes in the "Notes" section
4. Record any error messages exactly as they appear
5. Take screenshots of any bugs/issues

---

## 🔐 SECTION 1: AUTHENTICATION

### Test 1.1: User Registration
**URL:** https://verify-video.preview.emergentagent.com/CreatorLogin

- [ ] Click on the registration/signup area
- [ ] Enter test username: `TestUser` + random number (e.g., TestUser123)
- [ ] Enter test email: `test123@example.com`
- [ ] Enter password: `Test123!`
- [ ] Click "Create Account" or "Register" button
- [ ] **EXPECTED:** Redirect to dashboard
- [ ] **EXPECTED:** See welcome message with username

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 1.2: User Login (Existing Account)
**URL:** https://verify-video.preview.emergentagent.com/CreatorLogin

- [ ] Enter username: `BrianJames`
- [ ] Enter password: `Brian123!`
- [ ] Click "Login" button
- [ ] **EXPECTED:** Redirect to dashboard
- [ ] **EXPECTED:** Dashboard shows "Welcome back, Brian James"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 1.3: Invalid Login
**URL:** https://verify-video.preview.emergentagent.com/CreatorLogin

- [ ] Enter username: `WrongUser`
- [ ] Enter password: `WrongPassword`
- [ ] Click "Login" button
- [ ] **EXPECTED:** Error message appears
- [ ] **EXPECTED:** Stay on login page

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🏠 SECTION 2: DASHBOARD

### Test 2.1: Dashboard Layout
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] **EXPECTED:** See RENDR logo in top left (purple gradient star with checkmark)
- [ ] **EXPECTED:** Logo is clickable
- [ ] **EXPECTED:** Navigation tabs visible: Dashboard, Analytics, Videos, Bounties, Monetization, Settings
- [ ] **EXPECTED:** "View Showcase" button visible (top right)
- [ ] **EXPECTED:** "Upload Video" button visible (top right)
- [ ] **EXPECTED:** Welcome message shows correct username

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 2.2: Dashboard Stats
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] **CHECK:** Total Videos shows a number (should be 22 for BrianJames)
- [ ] **CHECK:** Verifications shows a number
- [ ] **CHECK:** Total Views shows a number (should be 255 for BrianJames)
- [ ] **CHECK:** Monthly Earnings shows "$0" or a dollar amount

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 2.3: Bounty CTA Banner
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] **EXPECTED:** Purple gradient banner visible with bounty information
- [ ] **EXPECTED:** Banner shows "892 hunters are ready"
- [ ] **EXPECTED:** "Post Bounty" button visible
- [ ] Click "Post Bounty" button
- [ ] **EXPECTED:** Redirect to /bounties/post page

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 2.4: Connected Platforms
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] **EXPECTED:** See 4 platform cards: YouTube, TikTok, Instagram, Twitter
- [ ] **EXPECTED:** Each shows emoji icon
- [ ] **EXPECTED:** Each shows video count and click count

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 2.5: Quick Stats Sidebar
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] **CHECK:** Premium Subscribers shows "0" or a number
- [ ] **CHECK:** Premium Folders shows "0" or a number
- [ ] **CHECK:** Followers shows "0" or a number
- [ ] **CHECK:** Storage Used shows "22 videos" or correct count

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 2.6: Logo Click (Dashboard)
**URL:** https://verify-video.preview.emergentagent.com/dashboard

- [ ] Click RENDR logo in top left
- [ ] **EXPECTED:** Page reloads or stays on dashboard (already there)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 📹 SECTION 3: VIDEO UPLOAD

### Test 3.1: Access Upload Page
**URL:** https://verify-video.preview.emergentagent.com/upload

- [ ] From dashboard, click "Upload Video" button OR
- [ ] Navigate directly to /upload
- [ ] **EXPECTED:** Upload page loads
- [ ] **EXPECTED:** See file upload area
- [ ] **EXPECTED:** See title input field
- [ ] **EXPECTED:** See description textarea
- [ ] **EXPECTED:** See folder selector

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 3.2: Upload Video File
**URL:** https://verify-video.preview.emergentagent.com/upload

- [ ] Click file upload area or "Choose File"
- [ ] Select a small video file (MP4 recommended, <50MB for testing)
- [ ] **EXPECTED:** File name appears
- [ ] **EXPECTED:** Thumbnail preview generates (may take a few seconds)
- [ ] Enter title: "Test Video Upload"
- [ ] Enter description: "This is a test video"
- [ ] Select a folder (or leave as "No folder")
- [ ] Click "Upload" button
- [ ] **EXPECTED:** Progress indicator appears
- [ ] **EXPECTED:** Upload completes successfully
- [ ] **EXPECTED:** Verification code displays (format: RND-XXXXX)
- [ ] **EXPECTED:** All 5 hashes display (if Enterprise tier)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
Verification Code: _____________________________________________
```

---

### Test 3.3: Duplicate Detection
**URL:** https://verify-video.preview.emergentagent.com/upload

- [ ] Upload the SAME video file again
- [ ] **EXPECTED:** System detects duplicate
- [ ] **EXPECTED:** Shows existing verification code
- [ ] **EXPECTED:** Message: "This video was already uploaded" or similar

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 👤 SECTION 4: SHOWCASE (PUBLIC PROFILE)

### Test 4.1: Access Your Showcase
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

- [ ] From dashboard, click "View Showcase" button OR
- [ ] Navigate to /@BrianJames directly
- [ ] **EXPECTED:** Showcase page loads
- [ ] **EXPECTED:** Large profile picture visible on LEFT (240px, perfectly round)
- [ ] **EXPECTED:** Display name centered: "Brian James"
- [ ] **EXPECTED:** Username centered: "@BrianJames"
- [ ] **EXPECTED:** Bio text visible (if set)
- [ ] **EXPECTED:** Purple gradient header background

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 4.2: Showcase Navigation
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

- [ ] **CHECK:** RENDR logo visible in top left
- [ ] Click RENDR logo
- [ ] **EXPECTED:** Redirect to dashboard (if logged in)
- [ ] **CHECK:** "Back to Dashboard" button visible (if logged in)
- [ ] Click "Back to Dashboard" button
- [ ] **EXPECTED:** Return to dashboard

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 4.3: Showcase Tabs
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

**Videos Tab:**
- [ ] Click "Videos" tab
- [ ] **EXPECTED:** Videos grid displays
- [ ] **EXPECTED:** Thumbnails are 100px (very compact)
- [ ] **EXPECTED:** Verification codes visible on videos
- [ ] **EXPECTED:** Sorting dropdown works (Most Recent, Most Views, Oldest)
- [ ] **EXPECTED:** Platform filter works (All Platforms, YouTube, TikTok, etc.)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Premium Videos Tab:**
- [ ] Click "Premium Videos" tab
- [ ] **EXPECTED:** Premium folders display (if any exist)
- [ ] **EXPECTED:** Each folder shows purple gradient background
- [ ] **EXPECTED:** Price displays correctly ($X.XX/month)
- [ ] **EXPECTED:** "Subscribe Now" button visible
- [ ] **EXPECTED:** If no folders: "No premium content available yet"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Schedule Tab:**
- [ ] Click "Schedule" tab
- [ ] **EXPECTED:** Shows "No scheduled events yet" or calendar view

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Community Tab:**
- [ ] Click "Community" tab
- [ ] **EXPECTED:** Shows "Community features coming soon!" or community feed

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Store Tab:**
- [ ] Click "Store" tab
- [ ] **EXPECTED:** Shows "Store coming soon!" or product catalog

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**About Tab:**
- [ ] Click "About" tab
- [ ] **EXPECTED:** Shows creator bio and verified badge

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**Contact Tab:**
- [ ] Click "Contact" tab
- [ ] **EXPECTED:** Contact form displays
- [ ] **EXPECTED:** Fields: Your Name, Your Email, Message
- [ ] **EXPECTED:** "Send Message" button visible

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 4.4: Social Links
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

- [ ] **CHECK:** Social links visible as large circles (66px)
- [ ] **CHECK:** Icons visible (📷, 🎵, ▶️, etc.)
- [ ] Click a social link
- [ ] **EXPECTED:** Opens in new tab
- [ ] **EXPECTED:** Goes to correct platform

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 4.5: Stats Display
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

- [ ] **CHECK:** Videos count displays
- [ ] **CHECK:** Folders count displays
- [ ] **CHECK:** Views count displays
- [ ] **EXPECTED:** Numbers match dashboard counts

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 4.6: Video Click
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

- [ ] Go to Videos tab
- [ ] Click on any video thumbnail
- [ ] **EXPECTED:** Redirect to verification page with code

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## ✏️ SECTION 5: SHOWCASE EDITOR

### Test 5.1: Access Showcase Editor
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] From dashboard, click "Showcase Editor" card OR
- [ ] Navigate to /showcase-editor directly
- [ ] **EXPECTED:** Editor page loads
- [ ] **EXPECTED:** Split-panel layout: Editor (left) + Preview (right)
- [ ] **EXPECTED:** RENDR logo in top left
- [ ] **EXPECTED:** "Back to Dashboard" button visible
- [ ] **EXPECTED:** "Save Changes" button visible

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 5.2: Profile Information Section
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] Click "Profile Information" section to expand
- [ ] **CHECK:** Display Name field shows current name
- [ ] **CHECK:** Username field shows current username (disabled/grayed)
- [ ] **CHECK:** Bio textarea shows current bio
- [ ] **CHECK:** "Show Creator Badge" toggle visible
- [ ] Change Display Name to "Test Name Change"
- [ ] **EXPECTED:** Display changes (no save yet)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 5.3: Header Design Section
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] Click "Header Design" section to expand
- [ ] **CHECK:** Banner Background dropdown visible
- [ ] **CHECK:** Start Color picker visible
- [ ] **CHECK:** End Color picker visible
- [ ] Change gradient colors
- [ ] **EXPECTED:** Preview updates in real-time (right panel)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 5.4: Social Links Section
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] Click "Social Links" section to expand
- [ ] **CHECK:** Existing social links display
- [ ] **CHECK:** Each link has URL input field
- [ ] **CHECK:** "Add Social Link" button visible
- [ ] Click "Add Social Link"
- [ ] **EXPECTED:** New link input appears
- [ ] Enter URL in social link field
- [ ] Click remove button (✕) on a link
- [ ] **EXPECTED:** Link is removed

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 5.5: Save Changes
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] Make any change (e.g., edit display name)
- [ ] **EXPECTED:** "Save Changes*" button shows asterisk (unsaved indicator)
- [ ] Click "Save Changes" button
- [ ] **EXPECTED:** Success message appears
- [ ] **EXPECTED:** Asterisk disappears
- [ ] Navigate to your showcase
- [ ] **EXPECTED:** Changes are visible

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 5.6: Preview Panel
**URL:** https://verify-video.preview.emergentagent.com/showcase-editor

- [ ] **CHECK:** Preview panel shows live iframe of showcase
- [ ] **CHECK:** Device selector visible: Desktop, Tablet, Mobile
- [ ] Click "Tablet" button
- [ ] **EXPECTED:** Preview resizes to tablet width
- [ ] Click "Mobile" button
- [ ] **EXPECTED:** Preview resizes to mobile width
- [ ] Click "Desktop" button
- [ ] **EXPECTED:** Preview returns to desktop width

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🎯 SECTION 6: BOUNTY SYSTEM

### Test 6.1: Browse Bounties
**URL:** https://verify-video.preview.emergentagent.com/bounties

- [ ] Navigate to /bounties OR click "Bounties" from dashboard nav
- [ ] **EXPECTED:** Bounties marketplace page loads
- [ ] **EXPECTED:** See list of active bounties (or "No active bounties")
- [ ] **CHECK:** Each bounty shows: reward amount, description, creator, date
- [ ] **CHECK:** Status filter visible (All, Active, Claimed, Verified, Paid)
- [ ] **CHECK:** "Post New Bounty" button visible

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 6.2: Post a Bounty
**URL:** https://verify-video.preview.emergentagent.com/bounties/post

- [ ] From bounties page, click "Post New Bounty" OR
- [ ] Navigate to /bounties/post directly
- [ ] **EXPECTED:** Bounty creation form loads
- [ ] Enter Video URL: `https://youtube.com/watch/test123`
- [ ] Enter Reward Amount: `50`
- [ ] Enter Description: "Find this stolen video"
- [ ] Click "Post Bounty" button
- [ ] **EXPECTED:** Bounty created successfully
- [ ] **EXPECTED:** Redirect to bounties list
- [ ] **EXPECTED:** New bounty appears in list

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
Bounty ID: _____________________________________________________
```

---

### Test 6.3: View Bounty Details
**URL:** https://verify-video.preview.emergentagent.com/bounties

- [ ] Click on any bounty from the list
- [ ] **EXPECTED:** Bounty details page loads OR details modal opens
- [ ] **CHECK:** Shows reward amount
- [ ] **CHECK:** Shows video URL
- [ ] **CHECK:** Shows description
- [ ] **CHECK:** Shows creator name
- [ ] **CHECK:** Shows status
- [ ] **CHECK:** "Claim This Bounty" button visible (if active)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 6.4: Claim a Bounty
**URL:** https://verify-video.preview.emergentagent.com/bounties/:id/claim

**NOTE:** This test requires a DIFFERENT user account (hunter). You can:
- Option A: Create a new test account
- Option B: Skip this test and note it

- [ ] As a different user, navigate to an active bounty
- [ ] Click "Claim This Bounty" button
- [ ] **EXPECTED:** Claim form loads
- [ ] Enter Evidence URL: `https://example.com/stolen-video`
- [ ] Enter Notes: "Found the video here"
- [ ] Click "Submit Claim" button
- [ ] **EXPECTED:** Claim submitted successfully
- [ ] **EXPECTED:** Bounty status changes to "Claimed"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 6.5: Verify Claim (Creator)
**URL:** https://verify-video.preview.emergentagent.com/bounties (My Bounties)

- [ ] As the bounty creator (BrianJames), go to "My Bounties"
- [ ] **EXPECTED:** See bounties you created
- [ ] **EXPECTED:** See "Pending Verification" for claimed bounties
- [ ] Click to view claimed bounty
- [ ] **CHECK:** See evidence URL
- [ ] **CHECK:** See hunter notes
- [ ] **CHECK:** "Approve" and "Reject" buttons visible
- [ ] Click "Approve" button
- [ ] **EXPECTED:** Bounty status changes to "Verified"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 6.6: Process Payout
**URL:** https://verify-video.preview.emergentagent.com/bounties (My Bounties)

- [ ] For a verified bounty, look for "Process Payout" button
- [ ] Click "Process Payout" button
- [ ] **EXPECTED:** Confirmation dialog appears
- [ ] Confirm payout
- [ ] **EXPECTED:** Payout processes (may take a few seconds)
- [ ] **EXPECTED:** Bounty status changes to "Paid"
- [ ] **EXPECTED:** Success message displays

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 💰 SECTION 7: MONETIZATION (STRIPE CONNECT)

### Test 7.1: Access Earnings Page
**URL:** https://verify-video.preview.emergentagent.com/earnings

- [ ] From dashboard, click "Monetization" tab OR
- [ ] Navigate to /earnings directly
- [ ] **EXPECTED:** Earnings page loads
- [ ] **CHECK:** Shows Stripe Connect status
- [ ] **CHECK:** Shows earnings summary (or $0.00)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 7.2: Stripe Connect Onboarding (if not connected)
**URL:** https://verify-video.preview.emergentagent.com/earnings

**NOTE:** Skip if already connected

- [ ] **CHECK:** "Connect Now" button visible
- [ ] Click "Connect Now" button
- [ ] **EXPECTED:** Redirect to Stripe onboarding
- [ ] **EXPECTED:** Stripe form loads (may open in new window)
- [ ] Complete Stripe form with test data
- [ ] **EXPECTED:** Redirect back to earnings page
- [ ] **EXPECTED:** Status shows "Connected" or "Pending"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 7.3: Create Premium Folder
**URL:** https://verify-video.preview.emergentagent.com/earnings

**NOTE:** Requires Stripe Connect to be set up

- [ ] Look for "Create Premium Folder" button or section
- [ ] Click button
- [ ] **EXPECTED:** Create folder form appears
- [ ] Enter Name: "Test Premium Content"
- [ ] Enter Description: "Exclusive test videos"
- [ ] Enter Price: `9.99`
- [ ] Select Currency: USD
- [ ] Click "Create Folder" button
- [ ] **EXPECTED:** Folder created successfully
- [ ] **EXPECTED:** Folder appears in list

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
Folder ID: _____________________________________________________
```

---

### Test 7.4: Subscribe to Premium Folder
**URL:** https://verify-video.preview.emergentagent.com/@BrianJames

**NOTE:** This test requires a DIFFERENT user account OR use test Stripe cards

- [ ] As a different user, go to BrianJames showcase
- [ ] Click "Premium Videos" tab
- [ ] **EXPECTED:** See premium folders
- [ ] Click "Subscribe Now" on a folder
- [ ] **EXPECTED:** Redirect to Stripe Checkout
- [ ] **EXPECTED:** Checkout shows correct price
- [ ] Enter test card: 4242 4242 4242 4242
- [ ] Enter expiry: any future date
- [ ] Enter CVC: 123
- [ ] Click "Subscribe" or "Pay"
- [ ] **EXPECTED:** Payment processes
- [ ] **EXPECTED:** Redirect back to success page
- [ ] **EXPECTED:** Access granted to premium content

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 7.5: View My Subscriptions
**URL:** https://verify-video.preview.emergentagent.com/my-subscriptions

- [ ] Navigate to /my-subscriptions
- [ ] **EXPECTED:** Subscriptions page loads
- [ ] **EXPECTED:** Shows list of active subscriptions (or "No subscriptions")
- [ ] **CHECK:** Each subscription shows: creator name, folder name, price
- [ ] **CHECK:** "Cancel" button visible for active subscriptions

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 7.6: Cancel Subscription
**URL:** https://verify-video.preview.emergentagent.com/my-subscriptions

**NOTE:** Only test if you have an active subscription

- [ ] Click "Cancel" button on a subscription
- [ ] **EXPECTED:** Confirmation dialog appears
- [ ] Confirm cancellation
- [ ] **EXPECTED:** Cancellation processes
- [ ] **EXPECTED:** Status changes to "Cancelled" or "Active until [date]"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🔍 SECTION 8: VIDEO VERIFICATION

### Test 8.1: Verify by Code
**URL:** https://verify-video.preview.emergentagent.com/verify

- [ ] Navigate to /verify
- [ ] **EXPECTED:** Verification page loads
- [ ] **EXPECTED:** Input field for verification code visible
- [ ] Enter a verification code (e.g., from Test 3.2): `RND-_____`
- [ ] Click "Verify" button
- [ ] **EXPECTED:** Video details display
- [ ] **CHECK:** Shows creator name
- [ ] **CHECK:** Shows upload date
- [ ] **CHECK:** Shows verification status: "AUTHENTIC" or similar
- [ ] **CHECK:** Shows all hash values

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 8.2: Verify Invalid Code
**URL:** https://verify-video.preview.emergentagent.com/verify

- [ ] Enter invalid code: `RND-99999`
- [ ] Click "Verify" button
- [ ] **EXPECTED:** Error message: "Video not found" or similar

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🔧 SECTION 9: CEO ADMIN (Advanced)

### Test 9.1: Access CEO Admin
**URL:** https://verify-video.preview.emergentagent.com/ceo-access-b7k9m2x

**NOTE:** Requires BrianJames account

- [ ] Navigate to /ceo-access-b7k9m2x
- [ ] Enter username: `BrianJames`
- [ ] Enter password: `Brian123!`
- [ ] Click login
- [ ] **EXPECTED:** Redirect to admin dashboard
- [ ] **EXPECTED:** Admin stats visible
- [ ] **CHECK:** Total users count
- [ ] **CHECK:** Total videos count
- [ ] **CHECK:** Total bounties count

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 📊 SECTION 10: ANALYTICS

### Test 10.1: View Analytics Dashboard
**URL:** https://verify-video.preview.emergentagent.com/analytics

- [ ] From dashboard nav, click "Analytics"
- [ ] **EXPECTED:** Analytics page loads
- [ ] **CHECK:** Date range selector visible
- [ ] **CHECK:** Charts/graphs visible (may be placeholder)
- [ ] **CHECK:** Key metrics displayed

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🌐 SECTION 11: EXPLORE (CREATOR DISCOVERY)

### Test 11.1: Browse Creators
**URL:** https://verify-video.preview.emergentagent.com/explore

- [ ] Navigate to /explore
- [ ] **EXPECTED:** Explore page loads
- [ ] **EXPECTED:** List of creators displays
- [ ] **CHECK:** Each creator shows profile picture, name, bio
- [ ] **CHECK:** "View Profile" button on each creator
- [ ] Click "View Profile" on any creator
- [ ] **EXPECTED:** Navigate to that creator's showcase

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## ⚙️ SECTION 12: SETTINGS

### Test 12.1: Access Settings
**URL:** https://verify-video.preview.emergentagent.com/settings

- [ ] From dashboard nav, click "Settings"
- [ ] **EXPECTED:** Settings page loads
- [ ] **CHECK:** Profile settings section visible
- [ ] **CHECK:** Account settings section visible
- [ ] **CHECK:** Notification settings section visible (if exists)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Test 12.2: Update Profile
**URL:** https://verify-video.preview.emergentagent.com/settings

- [ ] Change display name
- [ ] Update bio
- [ ] Update profile picture (if option exists)
- [ ] Click "Save" button
- [ ] **EXPECTED:** Changes saved successfully
- [ ] Navigate to your showcase
- [ ] **EXPECTED:** Changes are visible

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🚪 SECTION 13: LOGOUT

### Test 13.1: Logout
**URL:** Any page while logged in

- [ ] Look for logout button (usually in settings or profile menu)
- [ ] Click "Logout" button
- [ ] **EXPECTED:** Confirmation dialog may appear
- [ ] Confirm logout
- [ ] **EXPECTED:** Redirect to login page OR home page
- [ ] Try to access /dashboard directly
- [ ] **EXPECTED:** Redirect to login page (protected route)

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 📱 SECTION 14: MOBILE RESPONSIVE (Optional)

### Test 14.1: Mobile Layout
**Using mobile device or browser dev tools (F12 → Device Toolbar)**

- [ ] Set viewport to iPhone or Android size
- [ ] Navigate to dashboard
- [ ] **CHECK:** Layout adjusts for mobile
- [ ] **CHECK:** Navigation is accessible
- [ ] **CHECK:** Buttons are tap-friendly (44px minimum)
- [ ] Navigate to showcase
- [ ] **CHECK:** Profile layout works on mobile
- [ ] **CHECK:** Tabs are horizontal scrollable or stacked
- [ ] Test video upload on mobile
- [ ] **CHECK:** File picker works

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🐛 SECTION 15: ERROR HANDLING

### Test 15.1: Network Error Simulation
**Using browser dev tools**

- [ ] Open dev tools (F12)
- [ ] Go to Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to load dashboard
- [ ] **EXPECTED:** Error message displays
- [ ] **EXPECTED:** Message is user-friendly (not raw error)
- [ ] Set throttling back to "No throttling"

**Notes:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## ✅ FINAL CHECKLIST

### Overall Application Health

- [ ] All critical features work end-to-end
- [ ] No console errors on any page
- [ ] All links and buttons work
- [ ] Forms validate properly
- [ ] Error messages are clear and helpful
- [ ] Loading states show appropriately
- [ ] Success messages confirm actions
- [ ] Navigation is intuitive
- [ ] Design is consistent across pages
- [ ] No broken images or missing assets

---

## 📝 SUMMARY NOTES

**Total Tests Completed:** _____ / 100+  
**Tests Passed:** _____  
**Tests Failed:** _____  
**Critical Issues Found:** _____  

**Top 3 Issues:**
1. _________________________________________________________________
2. _________________________________________________________________
3. _________________________________________________________________

**Overall Assessment:**
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

**END OF TESTING CHECKLIST**

**Next Steps After Testing:**
1. Document all failed tests with screenshots
2. Prioritize issues by severity (Critical, High, Medium, Low)
3. Share results with development team
4. Schedule fixes for critical issues

---

**Thank you for thoroughly testing RENDR!**
