# Legislator Lens

**AI-Powered Civic Engagement Platform** for the Google Chrome AI Challenge 2025

Transform civic engagement through AI-powered legislative analysis, multimodal interaction, and personalized democratic participation tools.

## 🚀 Features

- **AI-Powered Bill Analysis**: Understand complex legislation with Chrome's built-in AI APIs
- **Multimodal Engagement**: Text, voice, and visual interactions
- **Privacy-First**: All sensitive processing happens locally in your browser
- **Letter Writing Assistant**: AI helps you contact your representatives
- **Civic Gamification**: Track your democratic participation

## 📋 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **AI**: Chrome Built-in AI APIs (Summarizer, Prompt, Writer, Rewriter, Proofreader)
- **External APIs**: Congress.gov, NewsAPI, Guardian API

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Chrome Canary (for Chrome AI APIs)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/legislator-lens.git
cd legislator-lens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in Chrome Canary

### Enable Chrome AI APIs

1. Download [Chrome Canary](https://www.google.com/chrome/canary/)
2. Join the [Early Preview Program](https://goo.gle/chrome-ai-dev-preview-join)
3. Navigate to `chrome://flags` and enable:
   - `#optimization-guide-on-device-model`
   - `#prompt-api-for-gemini-nano`
   - `#summarization-api-for-gemini-nano`
   - `#writer-api-for-gemini-nano`
4. Restart browser

## 📚 Documentation

All documentation is available in the `/docs` folder:

- **[Getting Started](./docs/GETTING_STARTED.md)** - Setup guide
- **[Architecture](./docs/ARCHITECTURE.md)** - Technical architecture
- **[Chrome AI Guide](./docs/CHROME_AI_INTEGRATION_GUIDE.md)** - AI integration details
- **[API Integration](./docs/API_INTEGRATION_GUIDE.md)** - External APIs
- **[UI/UX Wireframes](./docs/UI_UX_WIREFRAMES.md)** - Design specifications
- **[Components](./docs/COMPONENT_SPECIFICATIONS.md)** - Component library
- **[Testing](./docs/TESTING_STRATEGY.md)** - Testing strategy

## 🏗️ Project Structure

```
legislator-lens/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── ui/                # UI primitives
│   ├── bills/             # Bill-related components
│   ├── letters/           # Letter writing components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utility libraries
│   ├── ai/               # Chrome AI integrations
│   ├── api/              # External API clients
│   └── db/               # Database utilities
├── types/                 # TypeScript definitions
├── hooks/                 # Custom React hooks
├── docs/                  # Documentation
└── public/                # Static assets
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Run accessibility tests
npm run test:a11y
```

## 🚢 Deployment

The app is designed to be deployed on Vercel:

```bash
npm run build
```

## 🤝 Contributing

This is a hackathon project for the Google Chrome AI Challenge 2025. Contributions, issues, and feature requests are welcome!

## 📝 License

ISC

## 🏆 Built For

**Google Chrome AI Challenge 2025**

Target Categories:
- Most Helpful Web Application ($14,000)
- Best Multimodal AI Application ($9,000)
- Best Hybrid AI Application ($9,000)

## 👥 Team

- Tarik Moody

---

**Empowering Civic Engagement Through AI** 🇺🇸🤖
