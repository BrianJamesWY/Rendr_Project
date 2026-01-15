# 🚀 RENDR MASTER TASK LIST
## Mission: Get RendrTruth.com Live, Beautiful & Functional

**Created:** January 15, 2026  
**Status:** IN PROGRESS 🔄

---

## 🔴 P0 - CRITICAL (Do First)

### 1. Fix Amplify Deployment - NEW Design
- [ ] Push CSS fixes to GitHub (glass-card classes in index.css)
- [ ] Push Logo import fix in LandingPageUI.jsx
- [ ] Trigger Amplify redeploy
- [ ] Verify new glassmorphic design shows on RendrTruth.com
- **ETA:** 30 minutes

### 2. Test Core User Flows
- [ ] Sign up (new user registration)
- [ ] Login (existing user)
- [ ] Dashboard loads with user data
- [ ] Upload video
- [ ] Verify video
- [ ] View public showcase (@username)
- **ETA:** 1 hour

### 3. Stripe Integration
- [ ] Configure Stripe API keys in Railway environment
- [ ] Test checkout flow (Free → Pro upgrade)
- [ ] Verify webhook handling
- [ ] Test subscription management
- **ETA:** 2 hours

---

## 🟠 P1 - HIGH PRIORITY (This Week)

### 4. Blockchain Verification (Polygon)
- [ ] Configure BLOCKCHAIN_PRIVATE_KEY in Railway
- [ ] Configure POLYGON_RPC_URL
- [ ] Fund wallet with MATIC for gas fees
- [ ] Test video → blockchain anchoring
- [ ] Verify transaction on Polygonscan
- **ETA:** 2-3 hours

### 5. C2PA Integration
- [ ] Research C2PA library requirements
- [ ] Implement C2PA metadata embedding
- [ ] Test with sample videos
- [ ] Verify C2PA certificates
- **ETA:** 1-2 days

### 6. New Figma Pages Integration
- [ ] Showcase Editor (from Figma)
- [ ] Edit Video Details (from Figma)
- [ ] Edit Folder Details (from Figma)
- [ ] Test each new page
- **ETA:** Depends on Figma completion

### 7. Security Hardening
- [ ] Remove JWT_SECRET default fallback
- [ ] Move CEO password to environment variable
- [ ] Move CEO_USER_IDS to environment/database
- [ ] Remove password reset token from API response
- [ ] Add rate limiting to auth endpoints
- [ ] Review CORS configuration
- **ETA:** 2-3 hours

---

## 🟡 P2 - MEDIUM PRIORITY (Next 2 Weeks)

### 8. Email Notifications
- [ ] Configure SMTP settings in Railway
- [ ] Test welcome email on registration
- [ ] Test video ready notification
- [ ] Test expiration warning emails
- **ETA:** 1-2 hours

### 9. SMS Notifications (Optional)
- [ ] Configure Twilio credentials in Railway
- [ ] Test SMS verification flow
- **ETA:** 1 hour

### 10. Video Storage Cleanup
- [ ] Set up cron job for cleanup_expired_videos.py
- [ ] Test expiration logic
- [ ] Monitor storage usage
- **ETA:** 1 hour

### 11. Repository Cleanup
- [ ] Remove old/unused files
- [ ] Delete test files
- [ ] Clean up documentation
- [ ] Organize folder structure
- [ ] Remove duplicate code
- **ETA:** 2-3 hours

### 12. Mobile App (Future)
- [ ] Complete React Native app
- [ ] Camera integration
- [ ] Video upload from mobile
- [ ] Push notifications
- **ETA:** 2-4 weeks

---

## 🔵 P3 - FUTURE / BACKLOG

### 13. Bounties/HuntEX System
- [ ] Design bounty API endpoints
- [ ] Implement backend logic
- [ ] Build frontend UI
- [ ] Test bounty claiming flow

### 14. Content Subscriptions
- [ ] Stripe Connect for creator payouts
- [ ] Subscription tier management
- [ ] Revenue split logic

### 15. White Label Options
- [ ] Custom branding per enterprise
- [ ] API access for enterprise tier

### 16. Analytics Enhancements
- [ ] More detailed video analytics
- [ ] Geographic data
- [ ] Engagement metrics

---

## 🏗️ INFRASTRUCTURE STATUS

| Service | Status | URL/Notes |
|---------|--------|-----------|
| **Frontend (Amplify)** | ✅ Live | https://rendrtruth.com |
| **Backend (Railway)** | ✅ Live | https://rendrproject-production.up.railway.app |
| **Database (MongoDB)** | ✅ Connected | MongoDB Atlas |
| **Domain (GoDaddy)** | ✅ Configured | rendrtruth.com |
| **GitHub** | ✅ Connected | BrianJamesWY/Rendr_Project |
| **Stripe** | ⚠️ Needs Config | API keys needed in Railway |
| **Blockchain** | ⚠️ Needs Config | Private key needed in Railway |
| **Email** | ⚠️ Needs Config | SMTP settings needed |
| **SMS** | ⚠️ Optional | Twilio credentials needed |

---

## 🔑 ENVIRONMENT VARIABLES NEEDED

### Railway (Backend)
```env
# Already Set
MONGO_URL=✅
JWT_SECRET=⚠️ (check if hardcoded default removed)

# Needs Adding
STRIPE_API_KEY=sk_live_xxxxx
BLOCKCHAIN_PRIVATE_KEY=0x...
POLYGON_RPC_URL=https://polygon-rpc.com

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=xxx
SMTP_PASSWORD=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx
```

### Amplify (Frontend)
```env
REACT_APP_BACKEND_URL=https://rendrproject-production.up.railway.app ✅
```

---

## 📋 DAILY CHECKLIST

### Today's Focus:
1. ☐ Fix CSS and push to GitHub
2. ☐ Verify new design deploys
3. ☐ Test signup/login flow
4. ☐ Test video upload
5. ☐ Review your Figma designs

---

## 📞 CREDENTIALS

| Account | Username | Password |
|---------|----------|----------|
| Test User | demo | Demo2025! |
| Test User 2 | testuser | TestPass123! |
| CEO Access | (any user) | RendrCEO2025! |

---

*Let's ship this thing! 🚀*
