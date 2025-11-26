# 🎯 RENDR MONETIZATION SYSTEM - COMPREHENSIVE HANDOFF DOCUMENT

**Created:** November 23, 2025  
**Purpose:** Complete reference for continuation after fork  
**Status:** Phase 1 Frontend - Partially Complete

---

## 📌 CRITICAL CONTEXT

### What We're Building
**Premium Folders with Creator Subscriptions** - A monetization system allowing creators to charge for premium content folders with monthly subscriptions. Creators keep 80% (Pro) or 85% (Enterprise) of revenue.

### Why It Matters
This transforms Rendr from a storage platform to a revenue-generating platform for creators. It's the key differentiator vs Patreon (no verification), OnlyFans (no proof), YouTube (no control).

---

## ✅ COMPLETED WORK (Phase 1)

### Frontend Pages Created (10 total):
1. **LandingPage.js** - Professional landing page ✅
2. **HelpCenter.js** (`/help`) - Dynamic FAQ system with 4 categories
3. **Contact.js** (`/contact`) - Contact form with 4 contact methods
4. **PrivacyPolicy.js** (`/privacy`) - GDPR/CCPA compliant
5. **RefundPolicy.js** (`/refund-policy`) - 7-day money-back guarantee
6. **CookieConsent.js** (Global component) - GDPR cookie banner
7. **StripeConnect.js** (`/stripe-connect`) - Stripe Connect onboarding
8. **StripeConnectReturn.js** (`/stripe-connect/return`) - OAuth return handler
9. **Earnings.js** (`/earnings`) - Creator earnings dashboard
10. **MySubscriptions.js** (`/my-subscriptions`) - User subscription management

### Routes Registered in App.js:
```javascript
<Route path="/help" element={<HelpCenter />} />
<Route path="/contact" element={<Contact />} />
<Route path="/privacy" element={<PrivacyPolicy />} />
<Route path="/refund-policy" element={<RefundPolicy />} />
<Route path="/stripe-connect" element={<StripeConnect />} />
<Route path="/stripe-connect/return" element={<StripeConnectReturn />} />
<Route path="/earnings" element={<Earnings />} />
<Route path="/my-subscriptions" element={<MySubscriptions />} />
```

### Files Modified:
- `/app/frontend/src/App.js` - Added imports and routes
- `/app/RUNNING_TODO.md` - Updated with monetization priorities

---

## 🚧 REMAINING WORK (Phase 1 Frontend)

### Pages Still to Convert from HTML:

#### 1. **Terms of Service** (HIGH PRIORITY)
**Source:** `terms-of-service.html` (user provided)  
**Destination:** `/app/frontend/src/pages/TermsOfService.js`  
**Route:** `/terms`  
**Why Critical:** Legal requirement before accepting payments. Contains:
- User agreement for platform usage
- Creator authorization for Rendr to act as copyright agent
- Premium folder terms
- Revenue sharing terms
- DMCA policy integration

**Key Sections to Include:**
- Section 5: Creator Content and Premium Folders
- Section 7: Payments and Revenue Sharing
- Section 9: Intellectual Property and DMCA
- Section 12: Dispute Resolution

**Implementation Notes:**
- Similar structure to PrivacyPolicy.js
- Add navigation menu/footer
- Include last updated date
- Add anchor links for sections
- Ensure mobile responsive

---

#### 2. **Subscription Checkout Page** (HIGH PRIORITY)
**Source:** `subscription-checkout.html` (user provided)  
**Destination:** `/app/frontend/src/pages/SubscriptionCheckout.js`  
**Route:** `/subscribe/:folderId`  
**Purpose:** Payment flow for users subscribing to premium folders

**Key Features to Implement:**
```javascript
// Get folder ID from URL params
const { folderId } = useParams();

// Fetch folder details
const folderDetails = {
  creatorName: "BrianJames",
  folderName: "Exclusive Body Cam Footage",
  price: 9.99,
  billingPeriod: "monthly",
  videoCount: 42,
  previewVideoThumbnails: [...],
  benefits: [
    "Access to 42 exclusive videos",
    "New videos added weekly",
    "Cancel anytime",
    "Verified blockchain content"
  ]
}

// Stripe Elements integration
<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>

// Backend endpoint
POST /api/subscriptions/create
Body: {
  folderId: "folder-123",
  paymentMethodId: "pm_xxx"
}
Response: {
  subscriptionId: "sub_xxx",
  clientSecret: "pi_xxx_secret_xxx"
}
```

**UI Components:**
1. **Left Side (60%):** 
   - Folder preview card
   - Creator info
   - What's included
   - Subscriber count social proof

2. **Right Side (40%):**
   - Price display ($9.99/month)
   - Stripe payment form (card input)
   - Billing address
   - Subscribe button
   - Terms checkbox
   - Secure payment badges

**Error States:**
- Invalid card
- Insufficient funds
- Payment declined
- Already subscribed

**Success Flow:**
- On success → redirect to `/subscription-success?subscription={id}`

---

#### 3. **Subscription Success Page** (MEDIUM PRIORITY)
**Source:** `subscription-success.html` (user provided)  
**Destination:** `/app/frontend/src/pages/SubscriptionSuccess.js`  
**Route:** `/subscription-success`  
**Purpose:** Confirmation page after successful subscription

**Key Features:**
```javascript
// Get subscription details from URL or backend
const subscriptionDetails = {
  creatorName: "BrianJames",
  folderName: "Exclusive Body Cam Footage",
  price: 9.99,
  nextBillingDate: "2025-12-23",
  videosUnlocked: 42,
  receiptUrl: "https://..."
}
```

**UI Sections:**
1. **Success Banner:** Large checkmark, "Subscription Confirmed!"
2. **Subscription Details:** What they subscribed to, price, next billing
3. **What's Next:** CTA to view content, manage subscription
4. **Receipt:** Link to Stripe receipt
5. **Actions:**
   - "View Content" → redirect to `/@{creator}?folder={folderId}`
   - "Manage Subscription" → `/my-subscriptions`
   - "Back to Dashboard" → `/dashboard`

---

### Files User Provided (Not Yet Processed):
- `subscription-checkout.html` ✅ (described above)
- `subscription-success.html` ✅ (described above)
- `UI_CHANGES_REQUIRED.md` ✅ (read and documented below)
- `BACKEND_INTEGRATION_PROMPT.md` 📄 (for Phase 2)
- `PREMIUM_FOLDERS_COMPLETE_PACKAGE.md` 📄 (comprehensive guide)

---

## 🎨 UI CHANGES TO EXISTING PAGES

### Dashboard.js Modifications Required:

#### 1. Add Premium Earnings Card
**Location:** Stats grid section (around line 540)  
**Insert after existing cards:**

```javascript
{/* Premium Earnings Card */}
<div style={{ 
  background: 'white', 
  borderRadius: '0.75rem', 
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
}}>
  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
    Premium Earnings
  </div>
  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.25rem' }}>
    ${premiumEarnings || 0}
  </div>
  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
    This month
  </div>
  <Link 
    to="/earnings" 
    style={{ 
      fontSize: '0.875rem', 
      color: '#667eea', 
      fontWeight: '600', 
      marginTop: '0.5rem', 
      display: 'block' 
    }}
  >
    View Details →
  </Link>
</div>
```

#### 2. Add "View Earnings" Button
**Location:** Header action buttons  
**Next to Upload button:**

```javascript
<Link
  to="/earnings"
  style={{
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    color: 'white',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }}
>
  💰 Earnings
</Link>
```

#### 3. Update User Data Fetch
**Add to existing user data fetch:**

```javascript
// In useEffect that fetches user data
const fetchDashboardData = async () => {
  const response = await axios.get(`${BACKEND_URL}/api/dashboard/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  setUser(response.data.user);
  setVideos(response.data.videos);
  setFolders(response.data.folders);
  setPremiumEarnings(response.data.premiumEarnings || 0); // NEW
  setStripeConnected(response.data.stripeConnected || false); // NEW
};
```

---

### ShowcaseEditor.js Modifications Required:

#### 1. Add Premium Tab
**Location:** Tab navigation (around line 100)**  
**Add after Layout tab:**

```javascript
<button
  onClick={() => setActiveTab('premium')}
  style={{
    padding: '1rem 1.5rem',
    background: activeTab === 'premium' ? '#667eea' : 'transparent',
    color: activeTab === 'premium' ? 'white' : '#6b7280',
    border: 'none',
    borderBottom: activeTab === 'premium' ? '2px solid #667eea' : '2px solid transparent',
    cursor: 'pointer',
    fontWeight: '600'
  }}
>
  💰 Premium
</button>
```

#### 2. Add Premium Tab Content
**In tab content section:**

```javascript
{activeTab === 'premium' && (
  <div style={{ padding: '2rem' }}>
    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
      💰 Premium Folders
    </h2>
    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
      Create premium folders that require a subscription. Earn 80-85% of subscription revenue.
    </p>

    {/* Stripe Connection Status */}
    {!stripeConnected ? (
      <div style={{ 
        background: '#fffbeb', 
        border: '2px solid #fbbf24', 
        borderRadius: '0.75rem', 
        padding: '1.5rem', 
        marginBottom: '2rem' 
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
          ⚠️ Payment Account Required
        </h3>
        <p style={{ color: '#92400e', marginBottom: '1rem' }}>
          To create premium folders and receive payments, you need to connect your Stripe account.
        </p>
        <Link
          to="/stripe-connect"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#f59e0b',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          🔗 Connect Stripe Account
        </Link>
      </div>
    ) : (
      <div>
        {/* Stripe Connected - Show Premium Folders List */}
        <div style={{ 
          background: '#d1fae5', 
          border: '2px solid #10b981', 
          borderRadius: '0.75rem', 
          padding: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#065f46', marginBottom: '0.5rem' }}>
            ✅ Payment Account Connected
          </h3>
          <p style={{ color: '#065f46' }}>
            Your Stripe account is connected. You can create premium folders and earn money.{' '}
            <Link to="/earnings" style={{ color: '#667eea', fontWeight: '600' }}>
              View Earnings →
            </Link>
          </p>
        </div>

        {/* Premium Folders List */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem' 
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Your Premium Folders</h3>
          <button
            onClick={handleCreatePremiumFolder}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ➕ Create Premium Folder
          </button>
        </div>

        {/* Premium Folders Grid */}
        {premiumFolders.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {premiumFolders.map(folder => (
              <PremiumFolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            background: '#f9fafb', 
            borderRadius: '0.75rem' 
          }}>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              No premium folders yet. Create one to start earning!
            </p>
          </div>
        )}
      </div>
    )}

    {/* Tier Limitation Info */}
    <div style={{ 
      background: '#dbeafe', 
      border: '2px solid #3b82f6', 
      borderRadius: '0.75rem', 
      padding: '1.5rem', 
      marginTop: '2rem' 
    }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '0.5rem' }}>
        ℹ️ Premium Folder Limits
      </h3>
      <p style={{ color: '#1e40af' }}>
        {userTier === 'pro' && 'Pro: Up to 3 premium folders, 80% revenue share'}
        {userTier === 'enterprise' && 'Enterprise: Unlimited premium folders, 85% revenue share'}
        {userTier === 'free' && 'Upgrade to Pro or Enterprise to create premium folders'}
      </p>
    </div>
  </div>
)}
```

---

### Showcase.js Modifications Required:

#### 1. Add Premium Folder Display Logic
**In folder rendering section:**

```javascript
{folders.map(folder => (
  folder.isPremium ? (
    // Premium Folder - Check if user has access
    <div key={folder.id} style={{ 
      background: 'white', 
      borderRadius: '0.75rem', 
      padding: '2rem',
      border: folder.hasAccess ? '2px solid #10b981' : '2px solid #f59e0b',
      marginBottom: '2rem'
    }}>
      {/* Folder Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {folder.isPremium && !folder.hasAccess && '🔒 '}
            {folder.isPremium && folder.hasAccess && '✅ '}
            {folder.name}
          </h2>
          <p style={{ color: '#6b7280' }}>{folder.description}</p>
        </div>
        <div>
          {folder.hasAccess ? (
            <span style={{ 
              background: '#10b981', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem', 
              fontWeight: '600' 
            }}>
              SUBSCRIBED ✓
            </span>
          ) : (
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              color: 'white', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem', 
              fontWeight: '600' 
            }}>
              ${folder.price}/month
            </span>
          )}
        </div>
      </div>

      {!folder.hasAccess ? (
        // Locked State - Show Preview & Subscribe CTA
        <div>
          <div style={{ 
            background: 'linear-gradient(to bottom, rgba(245, 158, 11, 0.1), transparent)', 
            border: '2px dashed #f59e0b', 
            borderRadius: '0.75rem', 
            padding: '2rem', 
            textAlign: 'center', 
            marginBottom: '2rem' 
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Premium Content
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Subscribe to access {folder.videoCount} exclusive verified videos
            </p>
            
            {/* Benefits */}
            <div style={{ 
              display: 'grid', 
              gap: '0.75rem', 
              margin: '1.5rem auto', 
              maxWidth: '400px', 
              textAlign: 'left' 
            }}>
              <div>✅ Exclusive unfiltered content</div>
              <div>✅ New videos added weekly</div>
              <div>✅ Blockchain verified</div>
              <div>✅ Cancel anytime</div>
            </div>

            <button
              onClick={() => navigate(`/subscribe/${folder.id}`)}
              style={{
                padding: '0.875rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🔓 Subscribe for ${folder.price}/month
            </button>
          </div>

          {/* Preview Videos (3 max) */}
          {folder.previewVideos && folder.previewVideos.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Preview Videos:</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem' 
              }}>
                {folder.previewVideos.map(video => (
                  <div key={video.id} style={{ opacity: 0.8 }}>
                    <VideoCard video={video} isPreview={true} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Unlocked State - Show All Videos
        <div>
          <div style={{ 
            marginBottom: '1rem', 
            color: '#6b7280', 
            fontSize: '0.875rem' 
          }}>
            Next billing: {new Date(folder.nextBillingDate).toLocaleDateString()} •{' '}
            <Link to="/my-subscriptions" style={{ color: '#667eea', fontWeight: '600' }}>
              Manage Subscription
            </Link>
          </div>
          
          {/* All Videos Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {folder.videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    // Regular Public Folder
    <RegularFolderDisplay folder={folder} />
  )
))}
```

---

## 🔌 BACKEND INTEGRATION POINTS

### New API Endpoints Needed (Phase 2):

#### 1. Stripe Connect Endpoints:
```javascript
// Create Stripe Connect OAuth link
POST /api/stripe/connect/create
Headers: { Authorization: Bearer {token} }
Response: {
  url: "https://connect.stripe.com/oauth/authorize?..."
}

// Complete Stripe Connect OAuth
POST /api/stripe/connect/complete
Body: { code: "ac_xxx", state: "xxx" }
Response: {
  success: true,
  stripeAccountId: "acct_xxx"
}

// Get Stripe connection status
GET /api/user/stripe-status
Response: {
  stripeConnected: true,
  accountId: "acct_xxx",
  detailsSubmitted: true,
  chargesEnabled: true
}
```

#### 2. Premium Folder Endpoints:
```javascript
// Create premium folder
POST /api/premium-folders/create
Body: {
  name: "Exclusive Body Cam",
  description: "...",
  icon: "🔒",
  priceCents: 999,
  billingPeriod: "monthly",
  previewVideoIds: ["video1", "video2", "video3"]
}
Response: {
  folderId: "folder_xxx",
  stripePriceId: "price_xxx",
  stripeProductId: "prod_xxx"
}

// List creator's premium folders
GET /api/premium-folders/my-folders
Response: {
  folders: [{
    id: "folder_xxx",
    name: "...",
    price: 999,
    subscriberCount: 42,
    monthlyRevenue: 418.58, // after platform fee
    videos: [...]
  }]
}

// Update premium folder
PUT /api/premium-folders/{folderId}
Body: { name: "...", description: "...", ... }

// Delete premium folder
DELETE /api/premium-folders/{folderId}
// Returns: { success: true }

// Get public folder info (for subscribers/potential subscribers)
GET /api/premium-folders/{folderId}/public
Response: {
  id: "folder_xxx",
  name: "...",
  description: "...",
  price: 999,
  videoCount: 42,
  subscriberCount: 147,
  creatorName: "BrianJames",
  creatorUsername: "brianjames",
  previewVideos: [...]
}
```

#### 3. Subscription Endpoints:
```javascript
// Create subscription (initiate checkout)
POST /api/subscriptions/create
Body: {
  folderId: "folder_xxx",
  paymentMethodId: "pm_xxx" // from Stripe.js
}
Response: {
  subscriptionId: "sub_xxx",
  clientSecret: "pi_xxx_secret_xxx", // for confirming payment
  status: "incomplete" // or "active"
}

// Confirm subscription after payment
POST /api/subscriptions/confirm
Body: {
  subscriptionId: "sub_xxx",
  paymentIntentId: "pi_xxx"
}
Response: {
  success: true,
  subscription: {
    id: "sub_xxx",
    status: "active",
    currentPeriodEnd: "2025-12-23"
  }
}

// Get user's subscriptions
GET /api/subscriptions/my-subscriptions
Response: {
  subscriptions: [{
    id: "sub_xxx",
    folderId: "folder_xxx",
    folderName: "...",
    creatorName: "...",
    creatorUsername: "...",
    price: 999,
    status: "active",
    currentPeriodStart: "2025-11-23",
    currentPeriodEnd: "2025-12-23",
    cancelAtPeriodEnd: false,
    videoCount: 42
  }],
  stats: {
    active_count: 3,
    monthly_total: 2497, // cents
    videos_accessible: 126
  }
}

// Get single subscription status
GET /api/subscriptions/folder/{folderId}/status
Response: {
  isSubscribed: true,
  subscriptionId: "sub_xxx",
  currentPeriodEnd: "2025-12-23"
}

// Cancel subscription
POST /api/subscriptions/{subscriptionId}/cancel
Response: {
  success: true,
  cancelAtPeriodEnd: true,
  accessUntil: "2025-12-23"
}
```

#### 4. Earnings Endpoints:
```javascript
// Get earnings overview
GET /api/earnings/overview
Response: {
  monthlyRevenue: 99900, // cents (total before platform fee)
  creatorShare: 79920, // cents (80% of revenue for Pro)
  activeSubscribers: 100,
  lifetimeEarnings: 399600, // cents
  premiumFolders: [{
    id: "folder_xxx",
    name: "...",
    subscriberCount: 50,
    monthlyRevenue: 49950,
    creatorShare: 39960
  }],
  nextPayoutAmount: 79920,
  nextPayoutDate: "2025-12-01",
  recentPayouts: [{
    id: "po_xxx",
    amount: 79920,
    date: "2025-11-01",
    status: "paid"
  }]
}

// Get payout history
GET /api/earnings/payouts?page=1&limit=20
Response: {
  payouts: [...],
  total: 42,
  page: 1,
  pages: 3
}
```

#### 5. Dashboard Updates:
```javascript
// Update existing dashboard overview endpoint
GET /api/dashboard/overview
Response: {
  user: {...},
  videos: [...],
  folders: [...],
  analytics: {...},
  // NEW FIELDS:
  premiumEarnings: 79920, // cents this month
  stripeConnected: true,
  premiumFolderCount: 3,
  totalSubscribers: 100
}
```

#### 6. Showcase Updates:
```javascript
// Update showcase endpoint to include premium folder info
GET /api/showcase/{username}
Response: {
  user: {...},
  videos: [...],
  folders: [
    // Regular folder
    {
      id: "folder_1",
      name: "YouTube Videos",
      isPremium: false,
      videos: [...]
    },
    // Premium folder (if viewer has access)
    {
      id: "folder_2",
      name: "Exclusive Body Cam",
      isPremium: true,
      price: 999,
      hasAccess: true, // based on auth token
      subscriberCount: 147,
      nextBillingDate: "2025-12-23",
      videos: [...] // only if hasAccess = true
    },
    // Premium folder (if viewer does NOT have access)
    {
      id: "folder_3",
      name: "Behind the Scenes",
      isPremium: true,
      price: 499,
      hasAccess: false,
      subscriberCount: 89,
      previewVideos: [...], // 3 preview videos
      videos: null // hidden
    }
  ]
}
```

---

## 💾 DATABASE SCHEMA ADDITIONS

### New Collections/Tables:

#### 1. premium_folders
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  creator_id: String,
  name: String,
  description: String,
  icon: String (emoji),
  price_cents: Number,
  billing_period: String ("monthly" | "yearly"),
  stripe_product_id: String,
  stripe_price_id: String,
  preview_video_ids: [String],
  video_count: Number,
  subscriber_count: Number,
  is_active: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### 2. subscriptions
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  user_id: String,
  creator_id: String,
  folder_id: String,
  stripe_subscription_id: String,
  stripe_customer_id: String,
  status: String ("active" | "canceled" | "past_due" | "incomplete"),
  current_period_start: DateTime,
  current_period_end: DateTime,
  cancel_at_period_end: Boolean,
  canceled_at: DateTime | null,
  created_at: DateTime,
  updated_at: DateTime
}
```

#### 3. payouts
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  creator_id: String,
  stripe_payout_id: String,
  amount_cents: Number,
  currency: String,
  status: String ("pending" | "paid" | "failed"),
  arrival_date: DateTime,
  created_at: DateTime
}
```

#### 4. revenue_records
```javascript
{
  _id: ObjectId,
  id: String (UUID),
  subscription_id: String,
  creator_id: String,
  folder_id: String,
  amount_cents: Number,
  platform_fee_cents: Number,
  creator_share_cents: Number,
  period_start: DateTime,
  period_end: DateTime,
  stripe_invoice_id: String,
  created_at: DateTime
}
```

### Updates to Existing Collections:

#### users collection - Add fields:
```javascript
{
  // ... existing fields
  stripe_account_id: String | null,
  stripe_account_status: String ("not_connected" | "pending" | "connected"),
  stripe_charges_enabled: Boolean,
  stripe_details_submitted: Boolean,
  payout_schedule: String ("weekly" | "monthly"),
  total_earnings_cents: Number,
  subscriber_count: Number
}
```

#### videos collection - Add field:
```javascript
{
  // ... existing fields
  premium_folder_id: String | null // if assigned to premium folder
}
```

#### folders collection - Add field:
```javascript
{
  // ... existing fields
  premium_folder_id: String | null // link to premium_folders if this is premium
}
```

---

## 🔔 STRIPE WEBHOOKS TO HANDLE

### Critical Webhooks (Must Implement):

```javascript
// 1. Customer subscription created
customer.subscription.created
→ Create subscription record in DB
→ Send welcome email to subscriber
→ Increment folder subscriber_count

// 2. Customer subscription updated
customer.subscription.updated
→ Update subscription status in DB
→ Handle plan changes

// 3. Customer subscription deleted
customer.subscription.deleted
→ Mark subscription as canceled
→ Revoke access to premium content
→ Send cancellation confirmation email
→ Decrement folder subscriber_count

// 4. Invoice payment succeeded
invoice.payment_succeeded
→ Create revenue_record
→ Update creator earnings
→ Send payment confirmation to subscriber
→ Send earnings notification to creator

// 5. Invoice payment failed
invoice.payment_failed
→ Notify subscriber about failed payment
→ Mark subscription as past_due
→ Attempt to recover payment

// 6. Payout paid
payout.paid
→ Create payout record
→ Send payout confirmation to creator

// 7. Payout failed
payout.failed
→ Update payout status
→ Notify creator about failure
```

### Webhook Handler Structure:
```javascript
POST /api/webhooks/stripe
Headers: { stripe-signature: "..." }
Body: { type: "customer.subscription.created", data: {...} }

// Verify webhook signature
// Route to appropriate handler based on event type
// Update database
// Send notifications
// Return 200 OK
```

---

## 🧪 TESTING CHECKLIST

### Phase 1 Frontend Testing:
- [ ] All 10 new pages render without errors
- [ ] All routes work correctly
- [ ] Navigation between pages works
- [ ] Forms have proper validation
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] Mobile responsive on all pages
- [ ] Cookie consent banner appears and persists choice

### Phase 2 Backend Integration Testing:
- [ ] Stripe Connect OAuth flow completes successfully
- [ ] Premium folder creation works
- [ ] Subscription checkout flow works
- [ ] Payment processing succeeds
- [ ] Access control works (locked vs unlocked folders)
- [ ] Earnings calculations are correct
- [ ] Payouts process correctly
- [ ] Webhook handlers work for all events
- [ ] Cancellation flow works
- [ ] Refund flow works

### Phase 3 End-to-End Testing:
- [ ] Creator can connect Stripe
- [ ] Creator can create premium folder with price
- [ ] Creator can assign videos to premium folder
- [ ] Viewer can see locked premium folder
- [ ] Viewer can see preview videos
- [ ] Viewer can subscribe successfully
- [ ] Viewer gains immediate access after subscription
- [ ] Viewer can view all premium videos
- [ ] Viewer can cancel subscription
- [ ] Creator receives correct payout
- [ ] Revenue split is accurate (80% or 85%)

---

## ⚠️ CRITICAL REMINDERS

### Before You Continue:
1. **Rewrite "What is Rendr"** in HelpCenter.js (line 53-58) - User doesn't like current text
2. **Review monetization pages** - Make sure UI matches brand
3. **Decide revenue split** - Confirm 80% Pro, 85% Enterprise
4. **Terms of Service** - Must be live before accepting payments (legal requirement)

### Environment Variables Needed (Phase 2):
```bash
# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_CONNECT_CLIENT_ID=ca_xxx

# Application
PLATFORM_FEE_PERCENTAGE_PRO=20  # Creator keeps 80%
PLATFORM_FEE_PERCENTAGE_ENTERPRISE=15  # Creator keeps 85%
```

### Stripe Setup Steps (Phase 2):
1. Create Stripe account (if not exists)
2. Enable Stripe Connect (Express or Standard)
3. Set up webhook endpoint
4. Configure Connect OAuth
5. Create test products and prices
6. Test in Stripe test mode thoroughly
7. Switch to live mode only after complete testing

---

## 📈 SUCCESS METRICS

### How to Know It's Working:

**Week 1-2 (After Launch):**
- [ ] 10+ creators connect Stripe
- [ ] 5+ premium folders created
- [ ] 3+ subscriptions processed
- [ ] 0 payment failures (or <5%)
- [ ] All payouts arrive correctly

**Month 1:**
- [ ] 50+ creators with Stripe connected
- [ ] 25+ premium folders active
- [ ] 100+ active subscriptions
- [ ] $500+ in monthly recurring revenue
- [ ] <2% refund rate

**Month 3:**
- [ ] 200+ creators earning money
- [ ] 100+ premium folders
- [ ] 500+ active subscriptions
- [ ] $5,000+ MRR
- [ ] Positive cash flow

---

## 🚀 GO-LIVE CHECKLIST

### Before Public Launch:
- [ ] All frontend pages tested
- [ ] All backend endpoints tested
- [ ] Stripe test mode working 100%
- [ ] Webhooks handling all events correctly
- [ ] Terms of Service live
- [ ] Privacy Policy updated with payment terms
- [ ] Support email (support@rendr.com) set up
- [ ] Beta test with 5-10 creators completed
- [ ] All bugs fixed
- [ ] Stripe switched to live mode
- [ ] Monitoring and alerting set up
- [ ] Backup plan for rollback ready

### Launch Day:
- [ ] Announce via email to existing users
- [ ] Social media posts
- [ ] Blog post explaining new features
- [ ] Monitor closely for first 24 hours
- [ ] Respond to support requests within 1 hour
- [ ] Fix critical bugs immediately

### Week 1 Post-Launch:
- [ ] Gather feedback from early adopters
- [ ] Monitor key metrics daily
- [ ] Fix any reported bugs
- [ ] Improve documentation based on questions
- [ ] Plan iteration based on feedback

---

## 📞 SUPPORT & RESOURCES

### User Documentation to Create:
1. **Creator Guide:** "How to Create Premium Folders and Earn Money"
2. **Subscriber Guide:** "How to Subscribe to Premium Content"
3. **Stripe Setup Guide:** "Connecting Your Stripe Account"
4. **FAQ:** Common questions about payments, refunds, cancellations
5. **Troubleshooting:** Common issues and solutions

### Internal Documentation:
1. Webhook event handling guide
2. Revenue calculation formulas
3. Payout schedule and process
4. Refund policy enforcement
5. Content moderation for premium folders

---

## 💡 FUTURE ENHANCEMENTS (After V1)

### Phase 6 (Months 2-3):
- [ ] Annual subscription option (discount for yearly)
- [ ] Multiple pricing tiers per folder
- [ ] Bundle pricing (subscribe to multiple folders)
- [ ] Gift subscriptions
- [ ] Free trials (7 or 30 days)

### Phase 7 (Months 4-6):
- [ ] Subscriber analytics for creators
- [ ] Email marketing for creators (announce new content)
- [ ] Content calendar for scheduled releases
- [ ] Subscriber-only comments
- [ ] Direct messaging between creators and subscribers

### Phase 8 (Months 6-12):
- [ ] Affiliate program (creators earn from referrals)
- [ ] Creator tipping/donations
- [ ] Pay-per-view individual videos
- [ ] Live streaming for premium subscribers
- [ ] Mobile app for subscribers

---

## 🎓 KEY LEARNINGS & BEST PRACTICES

### What Works:
- Clear value proposition for creators (earn money)
- Simple pricing (one monthly price per folder)
- Instant access after payment
- Cancel anytime (builds trust)
- Preview videos (converts browsers to buyers)
- Transparent revenue split

### What to Avoid:
- Complex pricing tiers (keep it simple)
- Long signup flows (use Stripe Connect Express)
- Hidden fees (be transparent)
- Difficult cancellation (lose trust)
- Delayed access (frustrates subscribers)
- Poor error messages (causes support requests)

### Pro Tips:
- Test payment flows extensively before launch
- Have clear refund policy and enforce it
- Respond to payment issues within hours
- Monitor webhook failures closely
- Keep Stripe dashboard open first few days
- Document every edge case you encounter
- Build in generous error logging
- Have a rollback plan ready

---

## 📋 QUICK REFERENCE

### File Locations:
```
Frontend Pages:
/app/frontend/src/pages/StripeConnect.js
/app/frontend/src/pages/StripeConnectReturn.js
/app/frontend/src/pages/Earnings.js
/app/frontend/src/pages/MySubscriptions.js
/app/frontend/src/pages/HelpCenter.js
/app/frontend/src/pages/Contact.js
/app/frontend/src/pages/PrivacyPolicy.js
/app/frontend/src/pages/RefundPolicy.js
/app/frontend/src/components/CookieConsent.js

TODO:
/app/frontend/src/pages/TermsOfService.js (need to create)
/app/frontend/src/pages/SubscriptionCheckout.js (need to create)
/app/frontend/src/pages/SubscriptionSuccess.js (need to create)

Backend (Phase 2):
/app/backend/api/stripe_connect.py (need to create)
/app/backend/api/premium_folders.py (need to create)
/app/backend/api/subscriptions.py (need to create)
/app/backend/api/earnings.py (need to create)
/app/backend/api/webhooks.py (need to create)
```

### Backend Integration Guide:
User provided: `BACKEND_INTEGRATION_PROMPT.md`  
Location: User artifacts  
Use this as your primary guide for Phase 2 backend implementation.

### UI Changes Guide:
User provided: `UI_CHANGES_REQUIRED.md`  
Location: User artifacts (read and documented in this file above)

---

## 🎯 CONTINUATION INSTRUCTIONS FOR NEXT AGENT

### Start Here:
1. Read this document completely
2. Read fork summary for high-level context
3. Review `/app/RUNNING_TODO.md` for priorities
4. Check `/app/frontend/src/pages/` for completed pages
5. Review user artifacts for backend guidance

### Immediate Next Steps:
1. Convert `terms-of-service.html` to React component
2. Convert `subscription-checkout.html` to React component  
3. Convert `subscription-success.html` to React component
4. Test all new pages
5. Begin Phase 2 backend integration using `BACKEND_INTEGRATION_PROMPT.md`

### Remember:
- User is excited about this direction
- Monetization is top priority
- Content theft detection comes AFTER monetization is live
- Test everything in Stripe test mode first
- Be conservative with changes (don't break existing functionality)

---

**END OF HANDOFF DOCUMENT**

_This document contains everything needed to continue monetization implementation after fork. Share this back to the next agent along with the automatic fork summary._

**Document Version:** 1.0  
**Created:** November 23, 2025  
**Status:** Phase 1 Frontend ~75% Complete
