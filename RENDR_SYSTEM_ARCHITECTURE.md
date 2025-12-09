# RENDR PLATFORM - COMPLETE SYSTEM ARCHITECTURE

**Last Updated:** November 27, 2025
**Platform Status:** Production-Ready MVP
**Tech Stack:** React 18 + FastAPI + MongoDB + Stripe

---

## 🏗️ SYSTEM OVERVIEW

RENDR is a revolutionary content verification and monetization platform where:
- **Creators** upload videos that are verified as authentic using 5 verification methods
- **Videos** are protected with blockchain-style verification codes
- **Content theft** is combated through a bounty hunter marketplace
- **Monetization** happens through premium folders with Stripe Connect
- **Truth** is the core value - only verified, original, authentic videos are allowed

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  Port: 3000 (internal) / External URL via K8s Ingress          │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                          │
│  • Dashboard.js          - Creator control panel                 │
│  • Showcase.js           - Public creator profile                │
│  • ShowcaseEditor.js     - Customize showcase                    │
│  • Upload.js             - Video upload with verification        │
│  • Bounties.js           - Browse bounties marketplace           │
│  • PostBounty.js         - Create content theft bounty           │
│  • ClaimBounty.js        - Submit evidence of theft              │
│  • Earnings.js           - Stripe Connect dashboard              │
│  • MySubscriptions.js    - User's premium subscriptions          │
│  • CreatorLogin.js       - Authentication                        │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (FastAPI)                         │
│  Port: 8001 (internal) / Routes: /api/* via K8s Ingress        │
├─────────────────────────────────────────────────────────────────┤
│  API Modules:                                                    │
│  • auth.py              - JWT authentication                     │
│  • videos.py            - Video upload & verification            │
│  • bounties.py          - Bounty marketplace (8 endpoints)       │
│  • premium_folders.py   - Premium content management             │
│  • stripe_integration.py - Payments & Connect (6 endpoints)      │
│  • subscriptions.py     - Subscription management                │
│  • analytics.py         - Usage tracking                         │
│  • explore.py           - Creator discovery                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Motor (AsyncIO)
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
│  Database: rendr_db                                              │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  • users              - User accounts & profiles                 │
│  • videos             - Video metadata & verification data       │
│  • folders            - Regular video folders                    │
│  • showcase_folders   - Public showcase folders                  │
│  • premium_folders    - Paid subscription folders                │
│  • bounties           - Content theft bounties                   │
│  • subscriptions      - Premium folder subscriptions             │
│  • analytics          - Page views & social clicks               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                          │
├─────────────────────────────────────────────────────────────────┤
│  • Stripe Connect     - Creator payments (revenue split)         │
│  • Stripe Subscriptions - Premium folder billing                 │
│  • Stripe Webhooks    - Event processing                         │
│  • Stripe Payouts     - Bounty hunter payments (MOCKED)          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 AUTHENTICATION SYSTEM

**Implementation:** JWT-based authentication
**Token Storage:** `localStorage` with key `'token'`
**Token Format:** Bearer token in Authorization header

### Authentication Flow:
1. User submits credentials to `/api/auth/login`
2. Backend validates against MongoDB users collection
3. Backend generates JWT token with user_id, email, username
4. Token stored in localStorage as `'token'`
5. All protected endpoints require `Authorization: Bearer {token}` header

### User Tiers:
- **Free:** 10 videos max, basic features
- **Pro:** 100 videos, premium folders, Stripe Connect
- **Enterprise:** Unlimited videos, all features, 85% revenue share

**Critical:** All pages now use `'token'` (NOT `'rendr_token'`)

---

## 🎬 VIDEO VERIFICATION SYSTEM (5 METHODS)

### VERIFICATION CODE FORMAT: `RND-XXXXX`

### The 5 Verification Methods:

#### 1. **ORIGINAL HASH (Pre-Watermark)**
- SHA-256 hash calculated BEFORE any watermarking
- Stored as `hashes.original`
- Used to detect if anyone re-uploads the original file

#### 2. **WATERMARKED HASH (Post-Watermark)**
- SHA-256 hash calculated AFTER RENDR watermark applied
- Stored as `hashes.watermarked`
- The "official" RENDR version hash

#### 3. **CENTER REGION HASH (Visual Fingerprint)**
- SHA-256 hash of center 50% of video frames
- Stored as `hashes.center_region`
- Detects videos that are cropped or have borders added
- Enterprise tier only

#### 4. **AUDIO HASH (Audio Fingerprint)**
- SHA-256 hash of audio track
- Stored as `hashes.audio`
- Detects videos with visual modifications but same audio
- Enterprise tier only

#### 5. **METADATA HASH (Blockchain-style)**
- SHA-256 hash of: verification_code + upload timestamp + user_id + filename
- Stored as `hashes.metadata`
- Creates immutable record of upload event
- Links video to specific creator and time

### Upload Workflow:

```
1. User uploads video file
   ↓
2. Calculate original hash (pre-watermark)
   ↓
3. Check for duplicates in database
   ↓
4. Apply RENDR watermark overlay
   ↓
5. Calculate watermarked hash
   ↓
6. Calculate center region hash (Enterprise)
   ↓
7. Calculate audio hash (Enterprise)
   ↓
8. Calculate metadata hash
   ↓
9. Generate verification code (RND-XXXXX)
   ↓
10. Save all hashes + video to database
   ↓
11. Return verification code to user
```

### Duplicate Detection:
- When upload happens, system checks if `hashes.original` exists in DB
- If match found: Returns existing verification code with `duplicate=true`
- If no match: Proceeds with new verification
- Confidence score: 1.0 for exact matches

### Storage & Expiration:
- **Free tier:** 30 days, then deleted
- **Pro tier:** 1 year, then deleted  
- **Enterprise tier:** Unlimited storage (never expires)
- Field: `storage.expires_at` (null = never expires)

### Video Record Structure:
```json
{
  "video_id": "uuid",
  "user_id": "uuid",
  "verification_code": "RND-XXXXX",
  "hashes": {
    "original": "sha256...",
    "watermarked": "sha256...",
    "center_region": "sha256...",
    "audio": "sha256...",
    "metadata": "sha256..."
  },
  "storage": {
    "tier": "enterprise",
    "expires_at": null,
    "uploaded_at": "2025-11-27T..."
  },
  "captured_at": "2025-11-27T...",
  "thumbnail_url": "/uploads/..."
}
```

---

## 💰 MONETIZATION SYSTEM

### Stripe Connect Integration

**Status:** FULLY WORKING
**Account Type:** Express
**Revenue Split:**
- Pro creators: 80% (Platform: 20%)
- Enterprise creators: 85% (Platform: 15%)

#### Connect Flow:
1. Creator clicks "Connect Now" on Earnings page
2. POST `/api/stripe/connect/onboard` creates Express account
3. User redirected to Stripe onboarding
4. Stripe redirects back to return_url
5. Account ID stored in `users.stripe_account_id`
6. Creator can now create premium folders

#### Capabilities Requested:
- `card_payments`: Accept card payments
- `transfers`: Receive platform revenue (IN TEST MODE: May not be active)

### Premium Folders

**Status:** FULLY WORKING

#### Folder Creation:
- Requires: Pro/Enterprise tier + Stripe Connect
- Fields: name, description, price_cents, currency
- API: POST `/api/premium-folders`
- Stripe Price object created automatically

#### Subscription Flow:
1. User browses premium folders on creator's Showcase
2. Clicks "Subscribe Now" button
3. POST `/api/stripe/subscribe` creates Checkout Session
4. Redirects to Stripe Checkout
5. User completes payment
6. Stripe webhook fires `checkout.session.completed`
7. Backend creates subscription record
8. User granted access to premium videos

#### Subscription Management:
- View all: GET `/api/subscriptions/my`
- Cancel: POST `/api/subscriptions/{id}/cancel`
- Cancellation: Ends at period end (no refunds mid-cycle)

### Webhook Events:
- `checkout.session.completed`: Create subscription
- `customer.subscription.created`: Activate subscription
- `customer.subscription.deleted`: Cancel subscription
- `invoice.payment_failed`: Handle failed payments

**Webhook URL:** `https://rendr-verify-1.preview.emergentagent.com/api/stripe/webhook`
**Webhook Secret:** `whsec_BDwKRn8AqY5bpVI1sLmxJCrXNNPm1N1m`

---

## 🎯 BOUNTY HUNTER SYSTEM

**Status:** FULLY WORKING (MVP with manual verification)
**Purpose:** Crowdsource finding stolen content

### System Flow:

```
1. Creator discovers their video stolen
   ↓
2. Creator posts bounty with reward ($25+)
   POST /api/bounties
   ↓
3. Bounty appears in marketplace
   GET /api/bounties?status=active
   ↓
4. Hunter finds stolen video
   ↓
5. Hunter submits claim with evidence URL
   POST /api/bounties/{id}/claim
   ↓
6. Creator reviews evidence
   POST /api/bounties/{id}/verify (approved=true/false)
   ↓
7. If approved: Payout processed
   POST /api/bounties/{id}/payout
   ↓
8. Hunter receives reward via Stripe
```

### Bounty States:
- `active`: Open for claims
- `claimed`: Evidence submitted, awaiting verification
- `verified`: Creator approved claim
- `paid`: Payout completed
- `rejected`: Creator rejected claim
- `cancelled`: Creator cancelled bounty

### API Endpoints (8 total):
1. `GET /api/bounties` - List all bounties
2. `GET /api/bounties/my` - Creator's bounties
3. `POST /api/bounties` - Create bounty
4. `GET /api/bounties/{id}` - View details
5. `POST /api/bounties/{id}/claim` - Submit claim
6. `POST /api/bounties/{id}/verify` - Verify claim (creator)
7. `POST /api/bounties/{id}/payout` - Process payout
8. `DELETE /api/bounties/{id}` - Cancel bounty

### Payout Integration:
**Current Status:** MOCKED (placeholder)
**Needs:** Real Stripe Payouts API integration
**Process:** Transfer reward amount to hunter's Stripe account

### Future Phases:
- **Phase 2:** Semi-automated verification using hash matching
- **Phase 3:** Fully automated using AI video fingerprinting

---

## 🎨 USER INTERFACE PAGES

### Dashboard (YouTube-style)
**File:** `/app/frontend/src/pages/Dashboard.js`
**Design:** Compact, professional, purple gradient
**Sections:**
- Header with logo + navigation tabs
- Stats row: Total Videos, Verifications, Total Views, Monthly Earnings
- Bounty CTA banner (purple gradient)
- Connected Platforms (YouTube, TikTok, Instagram, Twitter)
- Performance chart
- Top Videos
- Quick Stats sidebar

### Showcase (Large Profile Left)
**File:** `/app/frontend/src/pages/Showcase.js`
**Design:** Large 240px profile pic on left, centered info
**Sections:**
- Purple gradient header
- Profile (left): 240px round image
- Info (center): Display name, username, bio, stats
- Social links: 66px circles with icons
- Tabs: Videos, Premium Videos, Schedule, Community, Store, About, Contact
- Video grid: Extremely compact (100px thumbnails)
- Premium folders with gradient cards

### Showcase Editor (Split Panel)
**File:** `/app/frontend/src/pages/ShowcaseEditor.js`
**Design:** Editor (left 420px) + Live Preview (right)
**Sections:**
- Top nav: Logo, back, preview, save
- Collapsible sections: Profile, Header Design, Social Links
- Color pickers for gradient customization
- Real-time preview with device selector
- Unsaved changes tracking

### Upload Page
**File:** `/app/frontend/src/pages/Upload.js`
**Features:**
- Video file upload
- Thumbnail preview
- Title/description input
- Folder selection
- Progress indicator
- Verification code display
- All 5 hashes displayed after upload

### Bounty Pages
**Files:**
- `/app/frontend/src/pages/Bounties.js` - Marketplace
- `/app/frontend/src/pages/PostBounty.js` - Create
- `/app/frontend/src/pages/ClaimBounty.js` - Submit evidence

**Features:**
- Browse active bounties
- Filter by status
- View bounty details
- Submit claims with evidence URL
- Track claim status

### Monetization Pages
**Files:**
- `/app/frontend/src/pages/Earnings.js` - Stripe Connect dashboard
- `/app/frontend/src/pages/MySubscriptions.js` - User subscriptions

**Features:**
- View Stripe Connect status
- Onboard to Stripe
- View subscription list
- Cancel subscriptions

---

## 🗄️ DATABASE SCHEMA

### Database: `rendr_db`

#### Collection: `users`
```javascript
{
  _id: ObjectId,
  id: "uuid",  // Custom ID field
  username: "BrianJames",
  email: "brian@rendrtruth.com",
  display_name: "Brian James",
  password_hash: "bcrypt...",
  premium_tier: "enterprise",  // free, pro, enterprise
  account_type: "CEO",  // standard, CEO
  stripe_account_id: "acct_...",  // Stripe Connect
  profile_picture: "url",
  bio: "text",
  social_media_links: [
    {platform: "youtube", url: "https://..."}
  ],
  created_at: ISODate,
  total_videos: 22
}
```

#### Collection: `videos`
```javascript
{
  _id: ObjectId,
  video_id: "uuid",
  user_id: "uuid",
  username: "BrianJames",
  verification_code: "RND-XXXXX",
  hashes: {
    original: "sha256...",
    watermarked: "sha256...",
    center_region: "sha256...",
    audio: "sha256...",
    metadata: "sha256..."
  },
  storage: {
    tier: "enterprise",
    expires_at: null,
    uploaded_at: ISODate
  },
  title: "Video Title",
  captured_at: ISODate,
  thumbnail_url: "/uploads/...",
  view_count: 0,
  folder_id: "uuid"  // optional
}
```

#### Collection: `premium_folders`
```javascript
{
  _id: ObjectId,
  folder_id: "uuid",
  creator_id: "uuid",
  creator_username: "BrianJames",
  name: "Premium Content",
  description: "Exclusive videos",
  price_cents: 999,  // $9.99
  currency: "USD",
  stripe_price_id: "price_...",
  video_count: 5,
  subscriber_count: 10,
  created_at: ISODate
}
```

#### Collection: `bounties`
```javascript
{
  _id: ObjectId,
  bounty_id: "uuid",
  creator_id: "uuid",
  creator_username: "BrianJames",
  video_url: "https://youtube.com/...",
  reward_amount: 50.00,
  description: "Find my stolen video",
  status: "active",  // active, claimed, verified, paid, rejected, cancelled
  claimed_by: "uuid",  // hunter user_id
  claimed_at: ISODate,
  evidence_url: "https://...",
  evidence_notes: "Found here...",
  verified_at: ISODate,
  paid_at: ISODate,
  created_at: ISODate
}
```

#### Collection: `subscriptions`
```javascript
{
  _id: ObjectId,
  subscription_id: "uuid",
  stripe_subscription_id: "sub_...",
  subscriber_id: "uuid",
  creator_id: "uuid",
  folder_id: "uuid",
  status: "active",  // active, cancelled, past_due
  price_cents: 999,
  currency: "USD",
  platform_fee_percent: 0.15,
  created_at: ISODate,
  cancelled_at: ISODate
}
```

---

## 🔄 DATA FLOW EXAMPLES

### Video Upload Flow:
```
User (Browser)
  ↓ POST multipart/form-data
Upload.js
  ↓ POST /api/videos/upload (with file)
videos.py
  ↓ Calculate 5 hashes
  ↓ Check duplicates
  ↓ Generate RND-XXXXX code
  ↓ Insert into MongoDB
MongoDB (videos collection)
  ↓ Return verification code
Upload.js
  ↓ Display success + code
User
```

### Subscription Purchase Flow:
```
User clicks "Subscribe" on Showcase
  ↓
Showcase.js calls handleSubscribeToFolder()
  ↓ POST /api/stripe/subscribe
stripe_integration.py
  ↓ Get folder price
  ↓ Get creator Stripe account
  ↓ Create Stripe Checkout Session
  ↓ Return checkout_url
Showcase.js redirects to Stripe
  ↓
User completes payment on Stripe
  ↓
Stripe fires webhook: checkout.session.completed
  ↓ POST /api/stripe/webhook
stripe_integration.py
  ↓ Verify webhook signature
  ↓ Create subscription in MongoDB
  ↓ Return 200 OK
Stripe marks payment complete
  ↓
User redirected to success_url
```

### Bounty Claim Flow:
```
Hunter finds stolen video
  ↓
Bounties.js displays active bounties
  ↓ User clicks "Claim"
ClaimBounty.js
  ↓ POST /api/bounties/{id}/claim
bounties.py
  ↓ Update bounty status to "claimed"
  ↓ Store evidence URL
  ↓ Store hunter user_id
MongoDB
  ↓ Return success
Creator sees pending claim
  ↓ Reviews evidence
  ↓ POST /api/bounties/{id}/verify (approved=true)
bounties.py
  ↓ Update status to "verified"
  ↓ POST /api/bounties/{id}/payout
  ↓ Call Stripe Payouts API (MOCKED)
  ↓ Update status to "paid"
MongoDB
  ↓ Hunter notified
```

---

## 🌐 ROUTING & URLS

### Frontend Routes:
```javascript
/                          → Home page
/CreatorLogin              → Login/Register
/dashboard                 → Creator dashboard
/upload                    → Video upload
/@:username                → Public showcase
/:username                 → Fallback showcase route
/showcase-editor           → Customize showcase
/bounties                  → Browse bounties
/bounties/post             → Create bounty
/bounties/:id/claim        → Claim bounty
/earnings                  → Stripe Connect earnings
/my-subscriptions          → User subscriptions
/analytics                 → Analytics dashboard
/settings                  → Account settings
/explore                   → Discover creators
/verify                    → Verify video by code
```

### Backend API Routes:
```
Authentication:
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

Videos:
POST   /api/videos/upload
GET    /api/videos/user/list
GET    /api/@/:username
GET    /api/@/:username/videos

Bounties:
GET    /api/bounties
GET    /api/bounties/my
POST   /api/bounties
GET    /api/bounties/:id
POST   /api/bounties/:id/claim
POST   /api/bounties/:id/verify
POST   /api/bounties/:id/payout
DELETE /api/bounties/:id

Stripe:
POST   /api/stripe/connect/onboard
GET    /api/stripe/connect/status
POST   /api/stripe/subscribe
GET    /api/stripe/checkout/status/:session_id
POST   /api/stripe/webhook

Premium Folders:
GET    /api/premium-folders
POST   /api/premium-folders
GET    /api/premium-folders/:id
PUT    /api/premium-folders/:id
DELETE /api/premium-folders/:id

Subscriptions:
GET    /api/subscriptions/my
POST   /api/subscriptions/:id/cancel

Analytics:
GET    /api/analytics/dashboard
POST   /api/analytics/track/page-view
POST   /api/analytics/track/social-click

Explore:
GET    /api/explore/creators
```

---

## 🔒 SECURITY CONSIDERATIONS

### Authentication:
- JWT tokens with 30-day expiration
- Passwords hashed with bcrypt
- Bearer token required for protected endpoints

### Authorization:
- User can only modify their own content
- Bounty payouts require creator verification
- Premium folders require Pro/Enterprise tier
- Admin endpoints check user account_type

### Stripe:
- Webhook signature verification (HMAC-SHA256)
- Webhook secret stored in environment variable
- Revenue split enforced at checkout creation
- Connect account capabilities verified

### Data Validation:
- Pydantic models for request/response validation
- File size limits on uploads
- Rate limiting (recommended for production)

---

## 🚀 DEPLOYMENT CONFIGURATION

### Environment:
- **Platform:** Kubernetes cluster
- **Frontend:** Port 3000 (internal)
- **Backend:** Port 8001 (internal)
- **External URL:** https://rendr-verify-1.preview.emergentagent.com

### Kubernetes Ingress Rules:
- Routes with `/api` prefix → Backend (port 8001)
- Routes without `/api` → Frontend (port 3000)

### Environment Variables:

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=rendr_db
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=your_secret_key
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://rendr-verify-1.preview.emergentagent.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Process Management:
- **Supervisor** manages frontend & backend processes
- Hot reload enabled for code changes
- Restart required only for:
  - .env file changes
  - Dependency installations
  - Supervisor config changes

### Restart Commands:
```bash
sudo supervisorctl restart frontend
sudo supervisorctl restart backend
sudo supervisorctl status
```

---

## 📈 CURRENT SYSTEM STATUS

### ✅ FULLY WORKING:
- Authentication & Authorization
- Video Upload with 5-method verification
- Duplicate detection
- Premium Folders (CRUD)
- Stripe Connect onboarding
- Subscription checkout
- Webhook processing
- Subscription management
- Bounty system (8 endpoints)
- All frontend pages connected to APIs
- Dashboard (new design)
- Showcase (new design)
- Showcase Editor (new design)
- Navigation & logo clickability

### ⚠️ MOCKED/PLACEHOLDER:
- Stripe Payouts for bounty hunters (needs real API)
- Community tab (placeholder UI)
- Schedule tab (placeholder UI)
- Store tab (placeholder UI)

### 🔮 NOT IMPLEMENTED:
- Follower system
- Bounty verification Phase 2 (semi-automated)
- Bounty verification Phase 3 (fully automated)
- Performance chart (UI exists, needs data)
- Multi-channel support

---

## 🧪 TEST CREDENTIALS

**Creator Account:**
- Username: `BrianJames`
- Password: `Brian123!`
- Email: brian@rendrtruth.com
- Tier: Enterprise
- Videos: 22
- Stripe Connect: Connected

**CEO Admin Access:**
- URL: `/ceo-access-b7k9m2x`
- Login: Use BrianJames credentials
- Authorized: Yes (in CEO list)

---

## 📝 CRITICAL NOTES FOR FUTURE AGENTS

1. **Token Key:** Always use `'token'` in localStorage (NOT `'rendr_token'`)
2. **Database:** Always use `rendr_db` (NOT `rendr`)
3. **MongoDB:** Always exclude `_id` field: `{"_id": 0}`
4. **API Prefix:** All backend routes MUST start with `/api`
5. **Showcase Routes:** Both `/@:username` AND `/:username` routes needed
6. **Hot Reload:** Code changes apply automatically (no restart needed)
7. **Environment:** NEVER hardcode URLs, ports, or credentials
8. **Stripe Test Mode:** Transfers capability may not be active in test accounts
9. **Colors:** Brand gradient is `#667eea` → `#764ba2` (NO GREEN)
10. **Logo:** RENDR star with checkmark, clickable, goes to dashboard

---

**END OF SYSTEM ARCHITECTURE DOCUMENT**