<div align="center">

# 🏛️ Legislator Lens

### AI-Powered Civic Engagement Platform

[![Google Chrome AI Challenge 2025](https://img.shields.io/badge/Google%20Chrome-AI%20Challenge%202025-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white)](https://developer.chrome.com/blog/ai-challenge-2025)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)

**Transform civic engagement through AI-powered legislative analysis, multimodal interaction, and personalized democratic participation tools.**

[Live Demo](#) · [Documentation](./docs/README.md) · [Report Bug](https://github.com/tmoody1973/legislator-lens/issues) · [Request Feature](https://github.com/tmoody1973/legislator-lens/issues)

</div>

---

## 🌟 Overview

Legislator Lens makes democracy accessible by leveraging Chrome's built-in AI APIs to analyze complex legislation, enabling citizens to understand bills, contact representatives, and participate meaningfully in civic processes—all while maintaining privacy through local AI processing.

### 🎯 Target Categories

- 🏆 **Most Helpful Web Application** ($14,000)
- 🎨 **Best Multimodal AI Application** ($9,000)
- 🔄 **Best Hybrid AI Application** ($9,000)

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 AI-Powered Analysis
- **Intelligent Bill Summaries** using Chrome Summarizer API
- **Key Provision Extraction** with Prompt API
- **Impact Analysis** across economic, social, and environmental dimensions
- **Interactive Q&A** for bill exploration

</td>
<td width="50%">

### 🎭 Multimodal Engagement
- **Text, Voice & Visual** interactions
- **AI-Generated Imagery** for impact visualization
- **Audio Summaries** for accessibility
- **Voice Input** for letter writing

</td>
</tr>
<tr>
<td width="50%">

### 🔒 Privacy-First
- **Local AI Processing** - sensitive data stays on device
- **Offline Capabilities** with service workers
- **Zero Cloud Processing** for political preferences
- **Privacy-Preserving** community features

</td>
<td width="50%">

### ✍️ Civic Action Tools
- **AI Letter Writing Assistant** with Writer API
- **Representative Matching** via geolocation
- **Multiple Delivery Options** (email, PDF, social)
- **Quality Assurance** with Proofreader API

</td>
</tr>
<tr>
<td width="50%">

### 🎮 Gamification
- **Civic Score System** tracking participation
- **Achievement Badges** for milestones
- **Streak Tracking** for engagement
- **Personalized Feed** with ML recommendations

</td>
<td width="50%">

### 📰 Contextual News
- **Bill-Related Coverage** from NewsAPI & Guardian API
- **AI Summarization** of articles
- **Timeline Visualization** of bill progress
- **Relevance Scoring** for news matching

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<tr>
<td>

**Frontend**
- Next.js 14 (App Router)
- React 19
- TypeScript 5.9
- Tailwind CSS v4

</td>
<td>

**Backend & Database**
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions

</td>
<td>

**Authentication**
- Clerk Auth
- Social Login (Google, GitHub)
- Webhook Integration
- Session Management

</td>
</tr>
<tr>
<td>

**Chrome AI APIs**
- Summarizer API
- Prompt API (Multimodal)
- Writer API
- Rewriter API
- Proofreader API
- Translator API

</td>
<td>

**External APIs**
- Congress.gov API
- NewsAPI
- Guardian API
- Geolocation Services

</td>
<td>

**Development**
- ESLint
- Prettier
- Vitest
- Playwright
- Axe Core (A11y)

</td>
</tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Chrome Canary** ([Download](https://www.google.com/chrome/canary/))
- **Supabase Account** ([Sign Up](https://supabase.com/))
- **Clerk Account** ([Sign Up](https://clerk.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/tmoody1973/legislator-lens.git
cd legislator-lens

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
# See docs/GETTING_STARTED.md for detailed setup
```

### Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# External APIs
CONGRESS_API_KEY=your_congress_api_key
NEWS_API_KEY=your_news_api_key
GUARDIAN_API_KEY=your_guardian_api_key
```

### Database Setup

```bash
# Run the Supabase schema
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase/schema.sql
# 3. Run the SQL to create all tables
```

See [Supabase Setup Guide](./supabase/README.md) for detailed instructions.

### Enable Chrome AI APIs

1. Download **Chrome Canary** ([link](https://www.google.com/chrome/canary/))
2. Join the **Early Preview Program** ([link](https://goo.gle/chrome-ai-dev-preview-join))
3. Navigate to `chrome://flags` and enable:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano`
   - `#summarization-api-for-gemini-nano`
   - `#writer-api-for-gemini-nano`
4. **Restart browser**

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome Canary

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/GETTING_STARTED.md) | Complete setup guide |
| [Architecture](./docs/ARCHITECTURE.md) | System architecture and design |
| [Chrome AI Integration](./docs/CHROME_AI_INTEGRATION_GUIDE.md) | AI API implementation details |
| [API Integration](./docs/API_INTEGRATION_GUIDE.md) | External API usage |
| [UI/UX Wireframes](./docs/UI_UX_WIREFRAMES.md) | Design specifications |
| [Component Specs](./docs/COMPONENT_SPECIFICATIONS.md) | Component library |
| [Testing Strategy](./docs/TESTING_STRATEGY.md) | Testing approach |
| [Clerk Webhook Setup](./docs/CLERK_WEBHOOK_SETUP.md) | Webhook configuration |

---

## 🏗️ Project Structure

```
legislator-lens/
├── app/                        # Next.js App Router
│   ├── api/webhooks/          # Webhook handlers
│   ├── dashboard/             # Protected dashboard
│   ├── sign-in/               # Authentication pages
│   └── sign-up/
├── components/                 # React components
│   ├── ui/                    # UI primitives
│   ├── bills/                 # Bill-related components
│   ├── letters/               # Letter writing components
│   └── dashboard/             # Dashboard components
├── lib/                       # Utility libraries
│   ├── auth/                  # Clerk + Supabase integration
│   ├── ai/                    # Chrome AI integrations
│   ├── api/                   # External API clients
│   └── db/                    # Database utilities & queries
├── types/                     # TypeScript definitions
│   ├── database.ts            # Supabase types
│   └── chrome-ai.d.ts         # Chrome AI types
├── hooks/                     # Custom React hooks
├── supabase/                  # Database schema & migrations
├── docs/                      # Documentation
└── public/                    # Static assets
```

---

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Unit tests (coming soon)
npm run test

# Integration tests (coming soon)
npm run test:integration

# Accessibility tests (coming soon)
npm run test:a11y
```

---

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tmoody1973/legislator-lens)

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables Setup

Make sure to add all environment variables from `.env.example` to your Vercel project settings.

---

## 🤝 Contributing

Contributions are welcome! This is a hackathon project for the **Google Chrome AI Challenge 2025**.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **ISC License**.

---

## 🏆 Acknowledgments

- **Google Chrome AI Challenge 2025** for the opportunity
- **Chrome Built-in AI Team** for the powerful APIs
- **Supabase** for the amazing backend platform
- **Clerk** for seamless authentication
- **Next.js Team** for the incredible framework

---

## 👥 Team

**Tarik Moody** - Creator & Developer

- GitHub: [@tmoody1973](https://github.com/tmoody1973)
- Project: [Legislator Lens](https://github.com/tmoody1973/legislator-lens)

---

<div align="center">

### 🇺🇸 Empowering Civic Engagement Through AI 🤖

**Built with ❤️ for the Google Chrome AI Challenge 2025**

[⭐ Star this repo](https://github.com/tmoody1973/legislator-lens) · [🐛 Report Issues](https://github.com/tmoody1973/legislator-lens/issues) · [💡 Request Features](https://github.com/tmoody1973/legislator-lens/issues)

</div>
