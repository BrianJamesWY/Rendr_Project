# 🎨 FIGMA DESIGN PROMPTS FOR RENDR PLATFORM

## Overview
These are comprehensive Figma prompts to generate professional UI designs for the Rendr video verification platform. Use these prompts with Figma AI or Claude to generate high-quality designs that you can then implement.

---

## 1. ENHANCED VIDEO CARD COMPONENT

**Prompt for Figma:**
```
Design a modern video card component for a creator dashboard with the following specifications:

Layout:
- Card dimensions: 320px width, auto height
- Rounded corners: 12px
- Shadow: subtle drop shadow (0 2px 8px rgba(0,0,0,0.08))

Thumbnail Section (180px height):
- Video thumbnail placeholder or actual thumbnail image
- Overlays positioned on thumbnail:
  * Top-left: Tier badge (Free/Pro/Enterprise) - pill shape with tier-specific colors
    - Free: gray (#6b7280)
    - Pro: green (#10b981)
    - Enterprise: amber (#f59e0b)
  * Top-right: Expiration countdown badge
    - Color: Blue (#3b82f6) for normal, Red (#ef4444) for urgent (<2 hours)
    - Format: "⏰ 2d" or "⚠️ 1h"
  * Bottom-right: Blockchain verification badge (if verified)
    - Yellow pill (#fef3c7) with "⛓️ Verified" text

Content Section:
- Verification code: Large, bold, monospace font in brand purple (#667eea)
- Date: Small gray text
- Source icon: "📱 Bodycam" or "💻 Studio"
- Action buttons (2 rows):
  * Row 1: Download button (green #10b981) + Copy Code button (purple #667eea)
  * Row 2: Move button (gray) + Edit button (gray)
- All buttons: rounded 6px, 0.75rem padding, hover states

Design style: Clean, modern, professional
Color palette: Use Rendr brand colors (purple #667eea primary, clean whites, subtle grays)
Typography: SF Pro or Inter font family
```

---

## 2. QUOTA INDICATOR DASHBOARD WIDGET

**Prompt for Figma:**
```
Design a quota usage indicator widget for a creator dashboard:

Dimensions: 400px width, auto height
Style: White card with rounded corners (12px), subtle shadow

Header Section:
- Left: "Video Storage" label (small gray text) + usage numbers (large bold)
- Right: Tier badge (color-coded pill: gray/green/amber for Free/Pro/Enterprise)

Progress Bar (for non-unlimited tiers):
- Height: 8px
- Background: light gray (#e5e7eb)
- Fill color changes based on usage:
  * <80%: Tier color (green for Pro)
  * 80-99%: Warning amber (#f59e0b)
  * 100%: Danger red (#ef4444)
- Status text below bar showing remaining videos

Upgrade CTA (for Free/Pro users):
- Light blue background (#f0f9ff)
- Border: #bfdbfe
- "💎 Want more storage?" heading
- "Upgrade to [Next Tier]" link in blue (#2563eb)

Bottom info: Storage used in MB/GB (small gray text)

Design should be: Clean, data-focused, easy to scan at a glance
Include: Smooth transitions, hover states, clear visual hierarchy
```

---

## 3. NOTIFICATION SETTINGS PAGE

**Prompt for Figma:**
```
Design a full notification settings page for a video platform:

Page Layout:
- Full-page width with max-width 800px container
- Header: Logo, "Notification Settings" title, description text
- Main content: White card with padding

Notification Method Section:
- Radio button group with 4 options:
  1. Email only
  2. SMS only
  3. Email & SMS (both)
  4. No notifications
- Each option in a bordered card (2px border)
- Selected state: purple border (#667eea) + light purple background (#f0f4ff)
- Each card includes: Radio button + option name + description text

Phone Number Input (conditional, shown for SMS options):
- Label: "📱 Phone Number"
- Input field: Monospace font, placeholder "+1234567890"
- Checkbox below: "I consent to receive SMS" with gray helper text

Video Length Threshold Section:
- Slider control (range 10-300 seconds)
- Display value in a gray pill next to slider
- Helper text below showing what the threshold means

Info Box:
- Light blue background (#f0f9ff)
- Border: #bfdbfe
- "ℹ️ About Notifications" heading
- Bullet points explaining notification behavior
- Warning text in red for mock mode status

Action Buttons:
- Primary: "💾 Save Settings" (purple #667eea, full width)
- Secondary: "← Back to Dashboard" (gray, full width)

Current Plan Info Card (below main form):
- Grid layout showing: Tier, Storage Duration, Notifications
- Upgrade CTA for free tier users

Design Style: Clean, professional, easy to understand
Accessibility: Clear labels, good contrast, large touch targets
Mobile-responsive: Stack elements vertically on small screens
```

---

## 4. DASHBOARD HEADER WITH QUOTA

**Prompt for Figma:**
```
Design an enhanced dashboard header section:

Layout: Full-width, centered content (max-width 1200px)
Background: White with bottom border

Header Content:
- Logo (top, centered or left)
- "Creator Dashboard" title (large, bold)
- Welcome message: "Welcome back, [Username]!"
- Button row:
  * "⚙️ Profile Settings" (purple button)
  * "👁️ View Showcase" (outlined purple button)
  * "🔔 Notification Settings" (NEW - outlined button)

Stats Grid Below Header (3-4 cards):
1. Total Videos count
2. Quota Usage Widget (new, prominent)
3. Blockchain Verified count
4. Recent Activity

Each stat card:
- White background
- Rounded corners (12px)
- Drop shadow
- Icon + label + large number
- Subtle hover effect

Quota Widget (Special):
- Larger card or full-width banner
- Shows usage bar prominently
- Clear visual indication of tier and limits
- Upgrade CTA if near limit

Design: Modern, clean, dashboard-focused
Colors: Rendr brand purple (#667eea), grays, whites
Responsive: Stack cards vertically on mobile
```

---

## 5. EXPIRATION WARNING MODAL

**Prompt for Figma:**
```
Design a modal/alert for videos expiring soon:

Modal Dimensions: 500px width, auto height
Style: Overlay with backdrop blur

Header:
- Warning icon: ⚠️ (large, amber color)
- Title: "Video Expiring Soon"
- Subtitle: Expiration time remaining in large text

Content:
- Verification code display (large, monospace, amber color)
- Expiration details: "Your video will be deleted in X hours"
- File info: Size, upload date

Action Buttons:
- Primary: "⬇️ Download Now" (green #10b981, full width)
- Secondary: "💎 Upgrade Plan" (amber #f59e0b, full width)
- Tertiary: "Remind Me Later" (gray text link)

Visual Style:
- Amber/warning color theme
- Urgent but not alarming
- Clear visual hierarchy
- Animations: Gentle slide-in from top

Include: Close button (X in top-right)
Backdrop: Dark overlay (rgba(0,0,0,0.5))
```

---

## 6. DOWNLOAD PROGRESS INDICATOR

**Prompt for Figma:**
```
Design a download progress indicator component:

State 1 - Ready to Download:
- Button: Green background (#10b981)
- Text: "⬇️ Download"
- Hover: Darker green (#059669)

State 2 - Downloading:
- Button: Gray background (#9ca3af), disabled
- Progress bar inside button (0-100%)
- Text: "45%" (percentage)
- Animated loading indicator

State 3 - Complete:
- Button: Green with checkmark
- Text: "✅ Downloaded"
- Brief success state (2 seconds) then reset

Style:
- Rounded corners: 6px
- Padding: 0.5rem
- Font size: 0.75rem, weight: 600
- Smooth transitions between states
- Micro-interactions: subtle pulse on hover

Alternative: Toast notification on download complete
- Slides in from bottom-right
- Green background
- "Download complete: [filename]"
- Auto-dismiss after 3 seconds
```

---

## 7. TIER COMPARISON TABLE (for Pricing Page)

**Prompt for Figma:**
```
Design a comprehensive tier comparison table:

Layout: 3 columns (Free, Pro, Enterprise)
Style: Cards or table format, modern, clean

Header for Each Tier:
- Tier name
- Price (large, bold)
- "Current Plan" badge if applicable
- Brief description

Feature Rows:
1. Storage Duration: 24hrs / 7 days / Unlimited
2. Video Limit: 5 / 100 / Unlimited
3. Verification Hashing: Basic / Enhanced / Maximum
4. Notifications: Email / Email+SMS / Email+SMS+Priority
5. Blockchain: Optional / Included / Included
6. Support: Community / Email / Priority
7. Watermark Position: Left only / Left+Right / Custom
8. Download History: 7 days / 30 days / Unlimited

Each feature:
- Check marks (✅) or X marks (❌) for yes/no features
- Specific values for numeric features
- Hover tooltips explaining features

CTA Buttons:
- Free: "Current Plan" or "Get Started"
- Pro: "Upgrade to Pro" (green)
- Enterprise: "Upgrade to Enterprise" (amber)

Design:
- Clear visual hierarchy
- Easy comparison across tiers
- Highlight differences
- Mobile-responsive: Stack cards vertically
- Animations: Hover effects on cards
```

---

## 8. VIDEO GRID WITH EXPIRATION BADGES

**Prompt for Figma:**
```
Design a grid layout for video cards in dashboard:

Grid Properties:
- Responsive grid: Auto-fill columns (min 280px, max 1fr)
- Gap: 24px (1.5rem)
- Container: Max-width 1200px, centered

Video Cards (repeating element):
- Use Enhanced Video Card design from Prompt #1
- Show mix of:
  * Videos with expiration badges (various times remaining)
  * Unlimited enterprise videos (with ♾️ badge)
  * Videos expiring soon (red warning badges)
  * Regular videos with normal blue badges

States to Show:
1. Normal state: Standard card
2. Hover state: Lifted with larger shadow
3. Expiring soon: Red pulsing border
4. Expired: Grayed out with "Expired" overlay

Empty State:
- Large icon (🎬)
- "No videos yet" message
- "Upload your first video" CTA button

Loading State:
- Skeleton cards (3-4 cards)
- Pulsing gray placeholders
- Shimmer animation

Design: Pinterest/Unsplash style masonry optional
Filtering: Show filters at top (All / Expiring / Unlimited / By Folder)
```

---

## GENERAL DESIGN GUIDELINES

### Color Palette
```
Primary: #667eea (Rendr Purple)
Secondary: #764ba2 (Deep Purple)

Success: #10b981 (Green)
Warning: #f59e0b (Amber)
Danger: #ef4444 (Red)
Info: #3b82f6 (Blue)

Neutrals:
- Gray 50: #f9fafb
- Gray 100: #f3f4f6
- Gray 200: #e5e7eb
- Gray 300: #d1d5db
- Gray 400: #9ca3af
- Gray 500: #6b7280
- Gray 600: #4b5563
- Gray 700: #374151
- Gray 800: #1f2937
- Gray 900: #111827
```

### Typography
```
Font Family: Inter, SF Pro, or system fonts
Headings: Bold (700), Large sizes
Body: Regular (400), 0.875rem - 1rem
Small text: 0.75rem
Monospace (for codes): 'Fira Code', 'Monaco', monospace
```

### Spacing
```
Use 8px grid system:
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 0.75rem (12px)
- lg: 1rem (16px)
- xl: 1.5rem (24px)
- 2xl: 2rem (32px)
- 3xl: 3rem (48px)
```

### Shadows
```
Small: 0 1px 3px rgba(0, 0, 0, 0.1)
Medium: 0 2px 8px rgba(0, 0, 0, 0.08)
Large: 0 8px 16px rgba(0, 0, 0, 0.15)
XL: 0 12px 24px rgba(0, 0, 0, 0.2)
```

### Border Radius
```
Small: 6px
Medium: 8px
Large: 12px
Full: 9999px (pills/badges)
```

---

## HOW TO USE THESE PROMPTS

1. **In Figma with AI Plugin**:
   - Copy the entire prompt for a component
   - Paste into Figma AI generation tool
   - Refine and iterate based on output

2. **With Claude/ChatGPT**:
   - Share these prompts to get detailed component specifications
   - Request variations or refinements
   - Generate CSS/Tailwind code from designs

3. **Manual Design**:
   - Use prompts as detailed specifications
   - Follow the measurements, colors, and layouts exactly
   - Maintain consistency across all components

4. **Export Process**:
   - Export assets as SVG or PNG (2x resolution)
   - Extract color values and measurements
   - Document spacing, typography, and states
   - Create a design system/style guide

---

## NEXT STEPS AFTER DESIGN

1. Review designs with team/stakeholders
2. Export assets and measurements
3. Implement designs in React components
4. Test responsiveness across devices
5. Iterate based on user feedback

---

**Remember**: These designs should match the Rendr brand identity from rendrtruth.com, using the checkstar logo and maintaining the "Bringing Truth Back to Content" ethos.
