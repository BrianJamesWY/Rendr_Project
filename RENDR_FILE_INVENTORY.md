# RENDR PLATFORM - COMPLETE FILE INVENTORY

**Generated:** November 27, 2025
**Total Files:** 96+ files

---

## FRONTEND FILES (/app/frontend/src)

### Pages (User-Facing)
```
/app/frontend/src/pages/Admin.js                    - CEO admin panel
/app/frontend/src/pages/Analytics.js                - Analytics dashboard
/app/frontend/src/pages/Bounties.js                 - Browse bounties marketplace (CONNECTED TO API)
/app/frontend/src/pages/ClaimBounty.js              - Submit bounty claim with evidence (CONNECTED TO API)
/app/frontend/src/pages/CreatorLogin.js             - Login/Register page (UPDATED: uses 'token')
/app/frontend/src/pages/Dashboard.js                - Main creator dashboard (NEW DESIGN: YouTube-style)
/app/frontend/src/pages/Earnings.js                 - Stripe Connect earnings (CONNECTED TO API)
/app/frontend/src/pages/Explore.js                  - Discover creators
/app/frontend/src/pages/Home.js                     - Landing page
/app/frontend/src/pages/InvestorAnalytics.js        - Investor dashboard
/app/frontend/src/pages/MySubscriptions.js          - User subscriptions (CONNECTED TO API)
/app/frontend/src/pages/NotificationSettings.js     - Notification preferences
/app/frontend/src/pages/PaymentSuccess.js           - Stripe payment success
/app/frontend/src/pages/PostBounty.js               - Create new bounty (CONNECTED TO API)
/app/frontend/src/pages/Pricing.js                  - Pricing page
/app/frontend/src/pages/ProfileSettings.js          - User settings
/app/frontend/src/pages/Showcase.js                 - Public creator profile (NEW DESIGN: Large profile left)
/app/frontend/src/pages/ShowcaseEditor.js           - Customize showcase (NEW DESIGN: Split panel)
/app/frontend/src/pages/StripeConnect.js            - Stripe onboarding
/app/frontend/src/pages/StripeConnectReturn.js      - Stripe redirect handler
/app/frontend/src/pages/Upload.js                   - Video upload with verification
/app/frontend/src/pages/VerifyVideo.js              - Verify video by code

BACKUP FILES:
/app/frontend/src/pages/Showcase_OLD_BACKUP.js      - Previous showcase design
/app/frontend/src/pages/ShowcaseEditor_OLD_BACKUP.js - Previous editor design
```

### Components (Reusable)
```
/app/frontend/src/components/Logo.js                - RENDR logo (UPDATED: Clickable, goes to dashboard)
/app/frontend/src/components/Navigation.js          - Site navigation with logo
/app/frontend/src/components/QuotaIndicator.js      - Storage quota display
/app/frontend/src/components/ui/                    - Shadcn UI components
```

### Core Files
```
/app/frontend/src/App.js                            - Main React app with routes
/app/frontend/src/index.js                          - React entry point
/app/frontend/package.json                          - NPM dependencies
/app/frontend/.env                                  - Environment variables
```

---

## BACKEND FILES (/app/backend)

### API Routes
```
/app/backend/api/admin.py                           - CEO admin endpoints
/app/backend/api/analytics.py                       - Analytics tracking
/app/backend/api/auth.py                            - Authentication (JWT)
/app/backend/api/bounties.py                        - Bounty system (8 endpoints, FULLY WORKING)
/app/backend/api/explore.py                         - Creator discovery
/app/backend/api/premium_folders.py                 - Premium content CRUD
/app/backend/api/stripe_integration.py              - Stripe Connect + Subscriptions (WORKING)
/app/backend/api/subscriptions.py                   - Subscription management (FIXED)
/app/backend/api/videos.py                          - Video upload & verification
/app/backend/debug_routes.py                        - Diagnostic endpoints
```

### Services (Business Logic)
```
/app/backend/services/stripe_service.py             - Stripe operations (UPDATED: Handles missing capabilities)
```

### Models (Data Structures)
```
/app/backend/models/bounty.py                       - Bounty Pydantic models
/app/backend/models/premium_folder.py               - Premium folder models
```

### Database
```
/app/backend/database/mongodb.py                    - MongoDB connection & setup
```

### Core Files
```
/app/backend/server.py                              - Main FastAPI application
/app/backend/requirements.txt                       - Python dependencies
/app/backend/.env                                   - Environment variables
```

---

## DOCUMENTATION FILES (/app)

### System Documentation
```
/app/RENDR_SYSTEM_ARCHITECTURE.md                   - COMPLETE system architecture (THIS SESSION)
/app/RENDR_FILE_INVENTORY.md                        - Complete file list (THIS SESSION)
/app/FORK_HANDOFF_SUMMARY.md                        - Previous session handoff
/app/ROADMAP_AND_TODO.md                            - Project roadmap
/app/DIAGNOSTIC_TOOLS_README.md                     - Diagnostic tools usage
/app/CEO_ADMIN_CREDENTIALS.md                       - CEO admin access info
/app/test_result.md                                 - Testing history and results
```

### Diagnostic Tools
```
/app/diagnostic_tool.py                             - System health checker
/app/quick_check.sh                                 - Fast health check
/app/test_user_flow.sh                              - E2E flow tester
/app/monitor_errors.sh                              - Real-time error monitor
```

### Temporary/Downloaded Files
```
/app/logo.html                                      - User-provided logo HTML
/app/dashboard-clean.html                           - User-provided dashboard design
/app/showcase.html                                  - User-provided showcase design
/app/showcase-editor.html                           - User-provided editor design
```

---

## KEY FILES BY FEATURE

### Authentication System
- **Frontend:** `CreatorLogin.js` (uses 'token')
- **Backend:** `auth.py` (JWT generation)
- **Middleware:** Token validation in `get_current_user()`
- **Storage:** localStorage with key `'token'`

### Video Verification (5 Methods)
- **Frontend:** `Upload.js` (file upload UI)
- **Backend:** `videos.py` (hash calculation, verification code generation)
- **Database:** `videos` collection with `hashes` object

### Premium Folders & Monetization
- **Frontend:** `Earnings.js`, `MySubscriptions.js`, `Showcase.js`
- **Backend:** `premium_folders.py`, `stripe_integration.py`, `subscriptions.py`
- **Service:** `stripe_service.py` (revenue split logic)
- **Database:** `premium_folders`, `subscriptions` collections

### Bounty Hunter System
- **Frontend:** `Bounties.js`, `PostBounty.js`, `ClaimBounty.js`
- **Backend:** `bounties.py` (8 endpoints)
- **Model:** `bounty.py` (Pydantic schemas)
- **Database:** `bounties` collection

### UI Redesign (This Session)
- **Dashboard:** `Dashboard.js` (NEW: YouTube-style)
- **Showcase:** `Showcase.js` (NEW: Large profile left)
- **Editor:** `ShowcaseEditor.js` (NEW: Split panel with live preview)
- **Logo:** `Logo.js` (UPDATED: Clickable)

---

## FILES MODIFIED IN THIS SESSION

### Created (New):
1. `/app/RENDR_SYSTEM_ARCHITECTURE.md` - Complete system documentation
2. `/app/RENDR_FILE_INVENTORY.md` - This file
3. `/app/frontend/src/pages/Showcase_NEW.js` → `/app/frontend/src/pages/Showcase.js`
4. Backups: `Showcase_OLD_BACKUP.js`, `ShowcaseEditor_OLD_BACKUP.js`

### Updated (Modified):
1. `/app/frontend/src/components/Logo.js` - Made clickable, added navigation
2. `/app/frontend/src/pages/Dashboard.js` - Complete redesign (YouTube-style)
3. `/app/frontend/src/pages/Showcase.js` - Complete redesign (large profile)
4. `/app/frontend/src/pages/ShowcaseEditor.js` - Complete redesign (split panel)
5. `/app/frontend/src/pages/CreatorLogin.js` - Fixed token key ('rendr_token' → 'token')
6. `/app/backend/api/subscriptions.py` - Fixed AsyncIOMotorClient error
7. `/app/backend/services/stripe_service.py` - Added capability check for transfers
8. `/app/backend/api/bounties.py` - Fixed database connection (uses shared connection)
9. Multiple files: Changed 'rendr_token' → 'token' across 9 files

---

## CONFIGURATION FILES

### Frontend Environment
**File:** `/app/frontend/.env`
```
REACT_APP_BACKEND_URL=https://rendr-video-trust.preview.emergentagent.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend Environment
**File:** `/app/backend/.env`
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=rendr_db
STRIPE_API_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_BDwKRn8AqY5bpVI1sLmxJCrXNNPm1N1m
JWT_SECRET=your_secret_key
```

### Package Management
- **Frontend:** `/app/frontend/package.json` (managed by yarn)
- **Backend:** `/app/backend/requirements.txt` (managed by pip)

---

## FILE STATISTICS

### By Type:
- **JavaScript files (.js):** ~30 files (React components & pages)
- **Python files (.py):** ~15 files (API routes, services, models)
- **Markdown files (.md):** ~10 files (documentation)
- **Configuration (.json, .env):** ~5 files
- **Shell scripts (.sh):** ~4 files

### By Status:
- **Production Ready:** ~85 files
- **Placeholder/Mock:** ~5 files
- **Backup Files:** ~2 files
- **Temporary:** ~4 files

---

## CRITICAL FILES (DO NOT DELETE)

### Must Preserve:
1. `/app/frontend/.env` - Frontend configuration
2. `/app/backend/.env` - Backend configuration (contains secrets)
3. `/app/backend/database/mongodb.py` - Database connection
4. `/app/backend/server.py` - Main application entry
5. `/app/frontend/src/App.js` - React router configuration
6. `/app/frontend/package.json` - Dependencies
7. `/app/backend/requirements.txt` - Python dependencies

### Can Safely Delete:
1. `/app/*_OLD_BACKUP.js` - Backup files (if no longer needed)
2. `/app/*.html` - Temporary downloaded files
3. `/app/diagnostic_tool.py` - Can recreate if needed
4. Old documentation if superseded

---

## WHERE TO FIND THINGS

### "Where is the authentication logic?"
- **Frontend:** `/app/frontend/src/pages/CreatorLogin.js`
- **Backend:** `/app/backend/api/auth.py`
- **Token Storage:** localStorage with key `'token'`

### "Where is video verification implemented?"
- **Upload UI:** `/app/frontend/src/pages/Upload.js`
- **Verification Logic:** `/app/backend/api/videos.py`
- **Hash Calculation:** In `videos.py` during upload

### "Where is the Stripe integration?"
- **Frontend:** `Earnings.js`, `MySubscriptions.js`, `Showcase.js`
- **Backend:** `/app/backend/api/stripe_integration.py`
- **Service:** `/app/backend/services/stripe_service.py`
- **Webhook:** POST `/api/stripe/webhook`

### "Where is the bounty system?"
- **Frontend:** `Bounties.js`, `PostBounty.js`, `ClaimBounty.js`
- **Backend:** `/app/backend/api/bounties.py`
- **Model:** `/app/backend/models/bounty.py`

### "Where is the new dashboard design?"
- **File:** `/app/frontend/src/pages/Dashboard.js`
- **Backup:** `/app/frontend/src/pages/Dashboard_OLD_BACKUP.js` (if exists)

### "Where is the new showcase design?"
- **File:** `/app/frontend/src/pages/Showcase.js`
- **Backup:** `/app/frontend/src/pages/Showcase_OLD_BACKUP.js`

### "Where is the database schema?"
- **Architecture Doc:** `/app/RENDR_SYSTEM_ARCHITECTURE.md` (section: DATABASE SCHEMA)
- **Connection:** `/app/backend/database/mongodb.py`
- **Collections:** users, videos, folders, premium_folders, bounties, subscriptions, analytics

---

## QUICK REFERENCE

### Run the application:
```bash
# Frontend (auto-managed by supervisor)
sudo supervisorctl status frontend

# Backend (auto-managed by supervisor)
sudo supervisorctl status backend

# Restart if needed
sudo supervisorctl restart frontend backend
```

### Check logs:
```bash
# Frontend
tail -f /var/log/supervisor/frontend.out.log
tail -f /var/log/supervisor/frontend.err.log

# Backend
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log
```

### Run diagnostics:
```bash
python3 /app/diagnostic_tool.py
/app/quick_check.sh
```

---

**END OF FILE INVENTORY**
