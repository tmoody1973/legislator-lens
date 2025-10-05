# Legislator Lens - UI/UX Wireframes & Design Specifications

## Design System Overview

### Color Palette

```
Primary Colors (Civic Blue)
├── primary-50:  #f0f9ff  (Lightest - backgrounds)
├── primary-100: #e0f2fe  (Light - hover states)
├── primary-500: #0ea5e9  (Main - primary actions)
├── primary-600: #0284c7  (Dark - active states)
└── primary-700: #0369a1  (Darkest - text on light)

Secondary Colors (Democratic Purple)
├── secondary-50:  #faf5ff
├── secondary-100: #f3e8ff
├── secondary-500: #a855f7
├── secondary-600: #9333ea
└── secondary-700: #7e22ce

Neutral Colors
├── gray-50:  #f9fafb  (Backgrounds)
├── gray-100: #f3f4f6  (Borders, dividers)
├── gray-200: #e5e7eb
├── gray-300: #d1d5db
├── gray-500: #6b7280  (Secondary text)
├── gray-700: #374151  (Primary text)
├── gray-800: #1f2937  (Headings)
└── gray-900: #111827  (Darkest text)

Semantic Colors
├── success: #10b981  (Green - bill passed, actions completed)
├── warning: #f59e0b  (Amber - pending, in progress)
├── error:   #ef4444  (Red - failed, alerts)
└── info:    #3b82f6  (Blue - informational)
```

### Typography

```
Font Family: Inter (Google Fonts)
├── Headings: 600-700 weight
├── Body: 400 weight
├── Emphasis: 500 weight
└── Code: 'Fira Code' monospace

Font Scale
├── xs:   12px / 0.75rem  (Labels, captions)
├── sm:   14px / 0.875rem (Small text)
├── base: 16px / 1rem     (Body text)
├── lg:   18px / 1.125rem (Lead text)
├── xl:   20px / 1.25rem  (Section headings)
├── 2xl:  24px / 1.5rem   (Page headings)
├── 3xl:  30px / 1.875rem (Hero headings)
└── 4xl:  36px / 2.25rem  (Display headings)
```

### Spacing System (8px base unit)

```
├── 1: 8px    (Tight spacing)
├── 2: 16px   (Default spacing)
├── 3: 24px   (Medium spacing)
├── 4: 32px   (Large spacing)
├── 6: 48px   (Section spacing)
└── 8: 64px   (Page spacing)
```

### Border Radius

```
├── sm: 4px   (Buttons, inputs)
├── md: 8px   (Cards, containers)
├── lg: 12px  (Large cards)
└── xl: 16px  (Hero sections)
```

---

## Page Wireframes

## 1. Landing Page

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATION BAR                            │
│  [Logo] Legislator Lens           [About][How it Works][Sign In]│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         HERO SECTION                             │
│                                                                  │
│        Make Democracy Accessible with AI                         │
│        Understand legislation, engage with representatives,      │
│        and make your voice heard - all powered by privacy-first  │
│        AI that works right in your browser.                      │
│                                                                  │
│        [Get Started Free] [Watch Demo]                           │
│                                                                  │
│     ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│     │ 12,543     │  │ 8,932      │  │ 1,247      │             │
│     │ Bills      │  │ Citizens   │  │ Letters    │             │
│     │ Analyzed   │  │ Engaged    │  │ Sent       │             │
│     └────────────┘  └────────────┘  └────────────┘             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LIVE DEMO SECTION                             │
│                                                                  │
│   Try it now - No signup required                               │
│                                                                  │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ [Search icon] Search any bill... e.g., "H.R. 1234"    │    │
│   └───────────────────────────────────────────────────────┘    │
│                                                                  │
│   ┌───────────────────────────────────────────────────────┐    │
│   │ H.R. 1234 - Infrastructure Investment Act             │    │
│   │ ─────────────────────────────────────────────────────  │    │
│   │ 🤖 AI Summary (generating...)                          │    │
│   │                                                         │    │
│   │ ✓ Key Points                                           │    │
│   │   • Allocates $1.2T for infrastructure               │    │
│   │   • Focuses on roads, bridges, broadband             │    │
│   │   • Creates estimated 800K jobs                       │    │
│   │                                                         │    │
│   │ 📊 Visual Impact [Show Image]                         │    │
│   │ 🔊 Audio Summary [Play]                               │    │
│   │                                                         │    │
│   │ [Read Full Analysis]                                   │    │
│   └───────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES SECTION                              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🧠 AI-Powered│  │ 🔒 Privacy   │  │ 🎯 Personal │             │
│  │   Analysis   │  │   First      │  │   ized      │             │
│  │              │  │              │  │              │             │
│  │ Understand   │  │ Your data    │  │ Bills that  │             │
│  │ complex      │  │ stays on     │  │ matter to   │             │
│  │ legislation  │  │ your device  │  │ you         │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ 🎨 Multimodal│  │ ✍️ Letter    │  │ 🏆 Gamified │             │
│  │   Interface  │  │   Assistant  │  │   Engage    │             │
│  │              │  │              │  │              │             │
│  │ Text, voice, │  │ AI helps you │  │ Track your  │             │
│  │ & visual     │  │ write to     │  │ civic       │             │
│  │ learning     │  │ reps         │  │ impact      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    HOW IT WORKS SECTION                          │
│                                                                  │
│   1 → 2 → 3 → 4                                                 │
│   ↓   ↓   ↓   ↓                                                 │
│   Discover  Read AI    Ask       Take                           │
│   Bills     Summary   Questions  Action                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FOOTER                                   │
│  About | Privacy | Terms | GitHub | Contact                     │
│  Built with Chrome AI APIs • Open Source                        │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specifications

**Hero Section**
- Background: Gradient from primary-50 to white
- Title: 4xl font, 700 weight, gray-900
- Subtitle: xl font, 400 weight, gray-600
- CTAs: Primary button (primary-600), Secondary button (outline)
- Live counters: Animated count-up on scroll into view

**Live Demo Card**
- Card: white background, shadow-lg, rounded-xl
- Real-time AI processing indicator
- Streaming text animation for summary generation
- Interactive elements with hover states

---

## 2. Onboarding Flow

### Step 1: Interest Selection

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───○───○───○] Step 1 of 4                          │
│                                                                  │
│  What topics interest you?                                      │
│  Select 3-5 areas you'd like to follow                          │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 🏥 Healthcare│ │ 💼 Economy   │ │ 🌱 Climate   │            │
│  │              │ │              │ │              │            │
│  │ Active       │ │ Not selected │ │ Active       │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 🎓 Education │ │ 🔒 Privacy   │ │ ⚖️ Justice   │            │
│  │              │ │              │ │              │            │
│  │ Active       │ │ Not selected │ │ Not selected │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 🛡️ Defense  │ │ 🏘️ Housing  │ │ 🚀 Technology│            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  💡 AI-generated categories based on current legislation        │
│                                                                  │
│                           [Skip]  [Continue]                     │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Engagement Level

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───○───○] Step 2 of 4                          │
│                                                                  │
│  How do you want to engage?                                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 📚 Stay Informed                                   │         │
│  │ I want to understand what's happening in Congress  │         │
│  │ • Daily bill summaries                             │         │
│  │ • News updates                                     │         │
│  │ • No commitment to action                          │         │
│  │                                      [Select] ○    │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ ✍️ Take Action                                     │         │
│  │ I want to contact my representatives               │         │
│  │ • Everything in Stay Informed                      │         │
│  │ • Letter writing assistance                        │         │
│  │ • Action recommendations                           │         │
│  │                                      [Select] ●    │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 🔍 Deep Dive                                       │         │
│  │ I want comprehensive policy analysis               │         │
│  │ • Everything in Take Action                        │         │
│  │ • Detailed provision analysis                      │         │
│  │ • Impact assessments                               │         │
│  │ • Community discussions                            │         │
│  │                                      [Select] ○    │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│                        [Back]  [Continue]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Preferences

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───●───○] Step 3 of 4                          │
│                                                                  │
│  Communication Preferences                                      │
│                                                                  │
│  Email Notifications                                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │ Daily Digest          [Toggle: ON ]                │         │
│  │ Weekly Summary        [Toggle: ON ]                │         │
│  │ Breaking News         [Toggle: OFF]                │         │
│  │ Action Reminders      [Toggle: ON ]                │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  Bill Preferences                                               │
│  ┌────────────────────────────────────────────────────┐         │
│  │ Show bills from:                                   │         │
│  │ ○ Current Congress only                            │         │
│  │ ● Current and previous Congress                    │         │
│  │ ○ All available                                    │         │
│  │                                                     │         │
│  │ Summary length preference:                         │         │
│  │ ○ Short  ● Medium  ○ Long                         │         │
│  │                                                     │         │
│  │ Display format:                                    │         │
│  │ ● Bento-style cards  ○ List view                  │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│                        [Back]  [Continue]                        │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Find Representatives

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───●───●] Step 4 of 4                          │
│                                                                  │
│  Find Your Representatives                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ [📍] Use my location                               │         │
│  │     (We'll use your zip code to find your reps)    │         │
│  │                                                     │         │
│  │            [Allow Location Access]                 │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  - or -                                                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────┐         │
│  │ Enter ZIP Code: [_____]  [Find Representatives]   │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  Your Representatives (ZIP: 10001)                              │
│  ┌────────────────────────────────────────────────────┐         │
│  │ 🏛️ Senator Chuck Schumer (D-NY)                   │         │
│  │ ✉️ contact@schumer.senate.gov                      │         │
│  ├────────────────────────────────────────────────────┤         │
│  │ 🏛️ Senator Kirsten Gillibrand (D-NY)              │         │
│  │ ✉️ contact@gillibrand.senate.gov                   │         │
│  ├────────────────────────────────────────────────────┤         │
│  │ 🏛️ Rep. Jerry Nadler (D-NY-12)                    │         │
│  │ ✉️ contact@nadler.house.gov                        │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│                        [Back]  [Get Started]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard (Bento-Style Layout)

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                       │
│ [Logo] Dashboard | Bills | Letters | Profile    [Search] [@User]│
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────┬────────────────────────────────────┐
│                             │                                    │
│  HERO BILL CARD             │   CIVIC SCORE WIDGET               │
│  (Large - 2x height)        │                                    │
│                             │   🏆 Your Civic Score              │
│  H.R. 5376                  │   ━━━━━━━━━━━━━━━━ 847 points     │
│  Inflation Reduction Act    │                                    │
│                             │   📊 Progress                      │
│  🔥 Trending in Climate     │   Knowledge: ████░░ 340            │
│                             │   Action:    ███░░░ 287            │
│  🤖 AI Summary              │   Community: ███░░░ 220            │
│  This bill addresses...     │                                    │
│  • Clean energy tax credits │   🔥 7-day streak!                 │
│  • Medicare drug pricing    │   Next: 10-day streak (3 days)    │
│  • Corporate minimum tax    │                                    │
│                             │   Recent Achievements              │
│  📊 Visual Impact [View]    │   🎖️ First Letter Sent             │
│  🔊 Audio Summary [Play]    │   📚 Policy Explorer               │
│  ❓ Ask Questions           │                                    │
│                             │                                    │
│  [Read Full Analysis]       │   [View All Achievements]          │
│  [Write to Rep]             │                                    │
│                             │                                    │
├────────────────────────────┴────────────────────────────────────┤
│                                                                  │
│  TRENDING BILLS                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ H.R. 1234    │ │ S. 5678      │ │ H.R. 9012    │            │
│  │ Infrastructure│ │ Healthcare   │ │ Privacy      │            │
│  │              │ │              │ │              │            │
│  │ 🔥 Hot       │ │ ⚡ Fast-track│ │ 📢 Viral     │            │
│  │ 1.2K views   │ │ 847 views    │ │ 2.3K views   │            │
│  │              │ │              │ │              │            │
│  │ [View]       │ │ [View]       │ │ [View]       │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
├────────────────────────────┬────────────────────────────────────┤
│                             │                                    │
│  FOR YOU (Personalized)     │   RECENT ACTIVITY                  │
│                             │                                    │
│  Based on your interests:   │   Today                            │
│  Healthcare, Climate        │   • Viewed H.R. 1234               │
│                             │   • Asked 3 questions              │
│  ┌──────────────────────┐  │   • +15 points                     │
│  │ S. 4567              │  │                                    │
│  │ Medicare Expansion   │  │   Yesterday                        │
│  │ 🏥 Healthcare        │  │   • Sent letter to Rep. Smith      │
│  │                      │  │   • Read 2 bills                   │
│  │ Introduced 2 days ago│  │   • +42 points                     │
│  │ [Read Summary]       │  │                                    │
│  └──────────────────────┘  │   This Week                        │
│                             │   • 12 bills viewed                │
│  ┌──────────────────────┐  │   • 2 letters sent                 │
│  │ H.R. 7890            │  │   • 147 total points               │
│  │ Clean Energy Act     │  │                                    │
│  │ 🌱 Climate           │  │   [View Full History]              │
│  │                      │  │                                    │
│  │ In committee review  │  │                                    │
│  │ [Read Summary]       │  │                                    │
│  └──────────────────────┘  │                                    │
│                             │                                    │
└─────────────────────────────┴────────────────────────────────────┘
```

### Bento Card Variations

**Hero Card (Large)**
- Size: 2 columns × 2 rows
- Background: White with subtle gradient
- Shadow: shadow-xl with hover lift effect
- Padding: p-6
- Border radius: rounded-xl

**Widget Card (Medium)**
- Size: 1 column × 2 rows
- Background: White
- Shadow: shadow-lg
- Padding: p-4

**Trending Card (Small)**
- Size: 1 column × 1 row
- Background: White with colored accent border
- Shadow: shadow-md
- Padding: p-4

---

## 4. Bill Discovery Page

```
┌─────────────────────────────────────────────────────────────────┐
│ NAVIGATION                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        SEARCH & FILTER                           │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 🔍 Search bills... "healthcare reform"              [X] │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  🤖 AI Suggestions: "Medicare expansion" "Drug pricing"          │
│  "Insurance coverage"                                            │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │Categories│ │  Status   │ │  Chamber │ │   Sort   │          │
│  │    ▼     │ │     ▼     │ │     ▼    │ │     ▼    │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                  │
│  Active Filters: [Healthcare ×] [Introduced ×] [Clear All]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RESULTS (234 bills)                          [Grid] [List]      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ H.R. 1234 - Infrastructure Investment Act              │     │
│  │ Sponsor: Rep. John Smith (D-CA) • Introduced: Jan 15   │     │
│  │                                                         │     │
│  │ 🏷️ Infrastructure • Economy • Jobs                    │     │
│  │                                                         │     │
│  │ 🤖 AI Summary (Key Points):                            │     │
│  │ • Allocates $1.2 trillion for infrastructure           │     │
│  │ • Focuses on roads, bridges, and broadband            │     │
│  │ • Projected to create 800,000 jobs                     │     │
│  │                                                         │     │
│  │ 📊 Status: In Committee Review                         │     │
│  │ 👥 Engagement: 1,234 views • 89 letters sent          │     │
│  │                                                         │     │
│  │ [📖 Read Analysis] [✍️ Write Letter] [🔖 Save]        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ S. 5678 - Medicare Expansion Act                       │     │
│  │ Sponsor: Sen. Jane Doe (D-NY) • Introduced: Feb 3      │     │
│  │                                                         │     │
│  │ 🏷️ Healthcare • Medicare • Seniors                    │     │
│  │                                                         │     │
│  │ 🤖 AI Summary (TL;DR):                                 │     │
│  │ Expands Medicare eligibility to age 60, adds dental   │     │
│  │ and vision coverage, funded by corporate tax increase  │     │
│  │                                                         │     │
│  │ 📊 Status: Floor Vote Scheduled                        │     │
│  │ 👥 Engagement: 2,891 views • 156 letters sent         │     │
│  │                                                         │     │
│  │ [📖 Read Analysis] [✍️ Write Letter] [🔖 Save]        │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  [Load More Bills]                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Search Features
- **Real-time AI suggestions** as user types
- **Semantic search** understanding intent
- **Filter persistence** across sessions
- **Sort options**: Relevance, Date, Popularity, Status

---

## 5. Bill Analysis Page (Detailed)

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Bills                                   [Share] [Save] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        BILL HEADER                               │
│                                                                  │
│  H.R. 1234 - Infrastructure Investment and Jobs Act             │
│  Sponsor: Rep. John Smith (D-CA-12)                             │
│  Introduced: January 15, 2025 • Last Action: March 3, 2025      │
│                                                                  │
│  Status: ⏳ In Committee Review (Transportation & Infrastructure)│
│                                                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ 📊 Timeline │ │ 👥 Sponsors │ │ 📰 News (8) │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  TABBED ANALYSIS INTERFACE                                       │
│  ┌─────┬─────────┬───────────┬────────────┬────────┐            │
│  │ Gist│Provisions│Impact     │Stakeholders│  Q&A   │            │
│  └─────┴─────────┴───────────┴────────────┴────────┘            │
│  ════════════════════════════════════════════════════            │
│                                                                  │
│  THE GIST (AI-Generated Summary)                                 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  🎯 Purpose                                                      │
│  This bill aims to modernize America's infrastructure through   │
│  historic investment in transportation, utilities, and digital   │
│  connectivity. It represents the largest infrastructure package  │
│  in decades.                                                     │
│                                                                  │
│  📋 Key Points                                                   │
│  • Allocates $1.2 trillion over 10 years                        │
│  • Focuses on roads, bridges, public transit, and broadband     │
│  • Creates an estimated 800,000 jobs annually                   │
│  • Funded through public-private partnerships and tax reforms   │
│  • Includes climate resilience provisions                       │
│                                                                  │
│  ⚡ Quick Impact                                                 │
│  If passed, this bill would repair 45,000 bridges, expand       │
│  broadband to 30 million households, and modernize the power    │
│  grid for renewable energy integration.                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📊 Visual Impact Preview                                │    │
│  │                                                          │    │
│  │  [AI-Generated Image showing infrastructure impact]     │    │
│  │                                                          │    │
│  │  Select perspective:                                    │    │
│  │  ○ Economic  ● Social  ○ Environmental                 │    │
│  │                                                          │    │
│  │  [Generate New Visualization]                           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  🔊 Audio Summary                                                │
│  ▶️ [Play 2-minute summary] | 📥 Download MP3                   │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  📑 Full Bill Text                                               │
│  [View Original PDF] [View Plain Text] [Download]               │
│                                                                  │
│  ✍️ Take Action                                                 │
│  [Write to Your Representative] [Share on Social Media]          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Provisions Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  KEY PROVISIONS                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  ▼ Provision 1: Transportation Infrastructure ($550B)           │
│     ┌────────────────────────────────────────────────────┐      │
│     │ What it does:                                      │      │
│     │ Allocates $550 billion for roads, bridges, and     │      │
│     │ public transportation modernization.               │      │
│     │                                                     │      │
│     │ Impact:                                            │      │
│     │ • Repairs 45,000 deteriorating bridges             │      │
│     │ • Improves safety on 20,000 miles of roads        │      │
│     │ • Expands public transit in 100+ cities           │      │
│     │                                                     │      │
│     │ Stakeholders:                                      │      │
│     │ + Commuters and drivers                           │      │
│     │ + Construction workers                            │      │
│     │ + State/local governments                         │      │
│     │ - Some rural areas (less allocation)              │      │
│     │                                                     │      │
│     │ Section: Title I, §101-§145                        │      │
│     └────────────────────────────────────────────────────┘      │
│                                                                  │
│  ▼ Provision 2: Broadband Expansion ($65B)                      │
│     ┌────────────────────────────────────────────────────┐      │
│     │ What it does:                                      │      │
│     │ Expands high-speed internet access to underserved  │      │
│     │ communities, particularly rural areas.             │      │
│     │                                                     │      │
│     │ Impact:                                            │      │
│     │ • Connects 30 million households                   │      │
│     │ • Minimum speed: 100/20 Mbps                       │      │
│     │ • Prioritizes affordability programs               │      │
│     │                                                     │      │
│     │ Stakeholders:                                      │      │
│     │ + Rural communities                               │      │
│     │ + Students and remote workers                     │      │
│     │ + Internet service providers                      │      │
│     │                                                     │      │
│     │ Section: Title II, §201-§225                       │      │
│     └────────────────────────────────────────────────────┘      │
│                                                                  │
│  ▶ Provision 3: Clean Energy Grid ($73B)                        │
│  ▶ Provision 4: Water Infrastructure ($55B)                     │
│  ▶ Provision 5: Electric Vehicle Charging ($7.5B)               │
│                                                                  │
│  [Expand All] [Collapse All]                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Interactive Q&A Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  ASK QUESTIONS ABOUT THIS BILL                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  🤖 AI Assistant ready to answer your questions                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Ask anything... e.g., "How will this affect my state?"   │   │
│  │                                                    [Send] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  💡 Suggested questions:                                         │
│  • How is this bill funded?                                     │
│  • When will this go to a vote?                                 │
│  • What happens to existing infrastructure programs?            │
│  • How does this compare to previous infrastructure bills?      │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Previous Questions                                             │
│                                                                  │
│  👤 You: "How will this affect small businesses?"               │
│  🤖 AI: Small businesses, particularly in construction and      │
│      engineering sectors, are expected to benefit from          │
│      increased contracting opportunities. The bill includes     │
│      provisions requiring 15% of contracts go to small          │
│      businesses and minority-owned enterprises...               │
│      [Read more]                                                │
│                                                                  │
│  👤 You: "What's the timeline for implementation?"              │
│  🤖 AI: The bill proposes a phased rollout over 10 years:       │
│      Year 1-2: Planning and initial projects ($120B)            │
│      Year 3-5: Major infrastructure work ($480B)                │
│      Year 6-10: Completion and maintenance ($600B)...           │
│      [Read more]                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Letter Writing Assistant

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back                Write to Your Representative               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───○───○───○───○] Step 1 of 5                      │
│                                                                  │
│  STEP 1: Choose Your Position                                   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Bill: H.R. 1234 - Infrastructure Investment Act                │
│                                                                  │
│  What's your position on this bill?                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ ✅ I Support This Bill                                 │     │
│  │                                                         │     │
│  │ I believe this legislation will benefit my community   │     │
│  │ and support its passage.                               │     │
│  │                                                         │     │
│  │                                         [Select] ●     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ ❌ I Oppose This Bill                                  │     │
│  │                                                         │     │
│  │ I have concerns about this legislation and urge        │     │
│  │ opposition.                                            │     │
│  │                                                         │     │
│  │                                         [Select] ○     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │ ⚠️ I Have Concerns                                     │     │
│  │                                                         │     │
│  │ I support the intent but have specific concerns that   │     │
│  │ should be addressed.                                   │     │
│  │                                                         │     │
│  │                                         [Select] ○     │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  🤖 AI will explain implications of each position                │
│                                                                  │
│                                            [Next: Personal Story]│
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Personal Story (Multimodal Input)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───○───○───○] Step 2 of 5                      │
│                                                                  │
│  STEP 2: Share Your Story (Optional but Powerful)               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Personal stories make letters more impactful. Share how this   │
│  bill affects you, your family, or your community.              │
│                                                                  │
│  Choose how to share:                                           │
│  ┌────┬────┬────┐                                               │
│  │Text│Voice│Image│                                              │
│  └────┴────┴────┘                                               │
│  [Active: Text Input]                                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Tell your story...                                       │   │
│  │                                                          │   │
│  │ As a small business owner in rural Ohio, reliable       │   │
│  │ broadband is essential for my livelihood. Currently,    │   │
│  │ my internet speeds make it nearly impossible to...      │   │
│  │                                                          │   │
│  │                                                          │   │
│  │                                                          │   │
│  │                                                          │   │
│  │                                          500 chars left  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🎤 Or record a voice message (AI will transcribe)               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [🔴 Start Recording]                       0:00 / 2:00  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  📷 Or upload a photo of the issue                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  [📁 Upload Image] AI will analyze and create talking   │   │
│  │  points from your photo                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Back] [Skip] [Next: Key Points]                               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Key Points

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───●───○───○] Step 3 of 5                      │
│                                                                  │
│  STEP 3: Select Key Points                                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  🤖 AI-Generated talking points based on your position:          │
│                                                                  │
│  Select 3-5 points to include in your letter:                   │
│                                                                  │
│  ☑️ Infrastructure investment creates jobs and economic growth   │
│  ☑️ Broadband expansion is essential for rural communities      │
│  ☑️ Modernized infrastructure improves public safety             │
│  ☐ Climate resilience provisions protect future generations      │
│  ☑️ Public-private partnerships ensure efficient use of funds    │
│  ☐ Overdue maintenance prevents more costly repairs later        │
│                                                                  │
│  ➕ Add your own point:                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Custom point...]                              [Add]     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  💡 Tips for effective points:                                   │
│  • Be specific and fact-based                                   │
│  • Connect to local impact                                      │
│  • Avoid partisan language                                      │
│  • Focus on solutions                                           │
│                                                                  │
│  [Back] [Next: Choose Tone]                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Tone & Generate

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───●───●───○] Step 4 of 5                      │
│                                                                  │
│  STEP 4: Choose Tone & Generate Letter                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Select the tone for your letter:                               │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                  │
│  │  Formal    │ │Professional│ │   Casual   │                  │
│  │            │ │            │ │            │                  │
│  │ Traditional│ │ Balanced   │ │Conversational                │
│  │ respectful │ │ approach   │ │ & personal │                  │
│  │            │ │            │ │            │                  │
│  │  [Select]  │ │ [Select] ● │ │  [Select]  │                  │
│  └────────────┘ └────────────┘ └────────────┘                  │
│                                                                  │
│  Letter length: ○ Short  ● Medium  ○ Long                       │
│                                                                  │
│  [🤖 Generate Letter]                                            │
│                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Generated Letter Preview:                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [✍️ AI is writing your letter...]                       │   │
│  │                                                          │   │
│  │ Dear Representative Nadler,                             │   │
│  │                                                          │   │
│  │ I am writing as your constituent from New York's 12th   │   │
│  │ Congressional District to express my strong support for  │   │
│  │ H.R. 1234, the Infrastructure Investment Act.           │   │
│  │                                                          │   │
│  │ As a small business owner in our community, I have      │   │
│  │ witnessed firsthand the challenges posed by inadequate  │   │
│  │ infrastructure. Reliable broadband internet is not      │   │
│  │ merely a convenience—it is essential for economic       │   │
│  │ participation in the 21st century...                    │   │
│  │                                                          │   │
│  │ [Continue reading...]                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [Edit Letter] [Regenerate] [Next: Review & Send]               │
└─────────────────────────────────────────────────────────────────┘
```

### Step 5: Review & Send

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●───●───●───●───●] Step 5 of 5                      │
│                                                                  │
│  STEP 5: Review & Send                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                                  │
│  Your letter has been proofread and optimized ✓                 │
│                                                                  │
│  Recipient: Rep. Jerry Nadler (D-NY-12)                         │
│  contact@nadler.house.gov                                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ [Full letter text with highlighting]                    │   │
│  │                                                          │   │
│  │ Dear Representative Nadler,                             │   │
│  │                                                          │   │
│  │ I am writing as your constituent from New York's 12th   │   │
│  │ Congressional District to express my strong support...  │   │
│  │                                                          │   │
│  │ [Full letter - 327 words, 2-minute read]                │   │
│  │                                                          │   │
│  │ Sincerely,                                              │   │
│  │ [Your Name]                                             │   │
│  │ [Your Address]                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  🤖 AI Quality Check:                                            │
│  ✓ Grammar and spelling: Excellent                              │
│  ✓ Tone: Professional and respectful                            │
│  ✓ Clarity: Clear and well-structured                           │
│  ✓ Persuasiveness: Strong argument with evidence                │
│                                                                  │
│  Delivery options:                                              │
│  ☑️ Send via Legislator Lens platform                           │
│  ☑️ Copy to clipboard                                           │
│  ☐ Download as PDF                                              │
│  ☐ Share on social media                                        │
│                                                                  │
│  [Back] [Edit] [Send Letter]                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Mobile Responsiveness

### Mobile Dashboard (Vertical Stack)

```
┌──────────────────────┐
│  [≡] Legislator Lens │
│  [@User ▼]           │
└──────────────────────┘

┌──────────────────────┐
│  HERO BILL CARD      │
│                      │
│  H.R. 5376           │
│  Inflation Reduction │
│                      │
│  🔥 Trending         │
│                      │
│  [Summary ▼]         │
│  [Full Analysis →]   │
└──────────────────────┘

┌──────────────────────┐
│  CIVIC SCORE         │
│  🏆 847 points       │
│  🔥 7-day streak     │
│  [View Details →]    │
└──────────────────────┘

┌──────────────────────┐
│  TRENDING BILLS      │
│                      │
│  ┌────────────────┐  │
│  │ H.R. 1234      │  │
│  │ Infrastructure │  │
│  │ [View]         │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │ S. 5678        │  │
│  │ Healthcare     │  │
│  │ [View]         │  │
│  └────────────────┘  │
│                      │
│  [See All →]         │
└──────────────────────┘

┌──────────────────────┐
│  ⊕ Quick Actions     │
│                      │
│  • Browse Bills      │
│  • Write Letter      │
│  • View History      │
└──────────────────────┘
```

### Mobile Navigation

```
Bottom Tab Bar:
┌──────┬──────┬──────┬──────┬──────┐
│ 🏠   │ 📋   │  ✍️  │ 👤   │ ⚙️   │
│ Home │ Bills│Letter│Profile│ More │
└──────┴──────┴──────┴──────┴──────┘
```

---

## Component Library

### Buttons

```
Primary Button:
┌─────────────────┐
│   Take Action   │  ← bg-primary-600, text-white, hover:bg-primary-700
└─────────────────┘

Secondary Button:
┌─────────────────┐
│   Learn More    │  ← border-gray-300, text-gray-700, hover:bg-gray-50
└─────────────────┘

Danger Button:
┌─────────────────┐
│     Delete      │  ← bg-red-600, text-white, hover:bg-red-700
└─────────────────┘

Icon Button:
┌───┐
│ ✓ │  ← Rounded, minimal, hover state
└───┘
```

### Form Inputs

```
Text Input:
┌─────────────────────────────────┐
│ [Placeholder text...]           │  ← border-gray-300, focus:border-primary-500
└─────────────────────────────────┘

Textarea:
┌─────────────────────────────────┐
│ [Multi-line input...]           │
│                                  │
│                                  │
│                    500 chars left│
└─────────────────────────────────┘

Toggle Switch:
On:  ━━●  Off: ●━━
```

### Cards

```
Base Card:
┌─────────────────────────────────┐
│  [Header]                       │
│  ─────────────────────────────  │
│                                  │
│  [Content]                      │
│                                  │
│  [Footer / Actions]             │
└─────────────────────────────────┘
Shadow: shadow-md, Radius: rounded-lg, Padding: p-6
```

### Badges & Tags

```
Status Badges:
[✓ Passed]     ← bg-green-100, text-green-800
[⏳ Pending]   ← bg-yellow-100, text-yellow-800
[✗ Failed]     ← bg-red-100, text-red-800

Category Tags:
[Healthcare]   ← bg-blue-100, text-blue-700, rounded-full
[Climate]      ← bg-green-100, text-green-700, rounded-full
```

### Loading States

```
Skeleton Loading:
┌─────────────────────────────────┐
│ ████████░░░░░░░░░░░░░░░░░░░░░░ │  ← Animated shimmer effect
│ ██████░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ████████████████░░░░░░░░░░░░░░ │
└─────────────────────────────────┘

Spinner:
   ⟳    ← Rotating animation, primary-600 color

Progress Bar:
━━━━━━━━━━░░░░░░░░░░ 60%
```

---

## Accessibility Features

### WCAG 2.1 AA Compliance

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states on all interactive elements
- **Keyboard Navigation**: Full keyboard support with logical tab order
- **Screen Reader Support**: ARIA labels on all interactive components
- **Alt Text**: Descriptive alt text for all images
- **Form Labels**: Clear labels associated with form inputs
- **Error States**: Clear error messages with icons and color + text

### Keyboard Shortcuts

```
Global:
/ : Focus search
? : Show keyboard shortcuts
Esc : Close modal/drawer

Navigation:
g h : Go to home/dashboard
g b : Go to bills
g l : Go to letters
g p : Go to profile

Bill View:
j/k : Next/previous bill
s : Save bill
w : Write letter
```

---

## Animation & Transitions

```
Page Transitions: fade-in 200ms ease-out
Card Hover: lift effect with shadow increase
Button Hover: subtle scale (1.02) + color darken
Modal Open: slide-up 300ms ease-out
Toast Notifications: slide-in-right 250ms
Loading States: shimmer animation 1.5s infinite
```

---

## Design Tokens (Tailwind Config)

```javascript
// tailwind.config.ts
theme: {
  extend: {
    animation: {
      'fade-in': 'fadeIn 0.3s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'shimmer': 'shimmer 1.5s infinite',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(10px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-1000px 0' },
        '100%': { backgroundPosition: '1000px 0' },
      },
    },
  },
}
```

This wireframe document provides comprehensive UI/UX specifications for all major pages and components in Legislator Lens, ready for implementation! 🎨
