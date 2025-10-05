# Getting Started with Legislator Lens

## Quick Start Guide

This guide will help you set up and start building Legislator Lens for the Google Chrome AI Challenge 2025.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **pnpm** package manager
- **Git** for version control
- **Chrome Canary** (for testing Chrome AI APIs)
- **Code editor** (VS Code recommended)

## Project Setup Checklist

### Phase 1: Environment Setup

- [ ] Clone or initialize the repository
- [ ] Install dependencies
- [ ] Configure environment variables
- [ ] Set up Supabase project
- [ ] Configure Clerk authentication
- [ ] Obtain API keys (Congress.gov, NewsAPI, Guardian)

### Phase 2: Development Environment

- [ ] Install Chrome Canary
- [ ] Enable Chrome AI APIs (Early Preview Program)
- [ ] Configure VS Code extensions
- [ ] Set up ESLint and Prettier
- [ ] Configure Git hooks

### Phase 3: Initial Implementation

- [ ] Create Next.js 14 project
- [ ] Set up Tailwind CSS
- [ ] Configure TypeScript
- [ ] Create basic folder structure
- [ ] Implement database schema

## Detailed Setup Instructions

### 1. Initialize Next.js Project

```bash
# Create new Next.js 14 app with TypeScript
npx create-next-app@latest legislator-lens --typescript --tailwind --app --eslint

# Navigate to project directory
cd legislator-lens

# Install additional dependencies
npm install @supabase/supabase-js @clerk/nextjs zustand
npm install -D @types/node @types/react @types/react-dom
```

### 2. Project Structure

Create the following directory structure:

```
legislator-lens/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── bills/
│   ├── letters/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── ai/
│   ├── api/
│   ├── db/
│   └── utils/
├── types/
├── hooks/
├── public/
└── docs/
```

### 3. Configure Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Congress.gov API
CONGRESS_API_KEY=your_congress_api_key

# NewsAPI
NEWS_API_KEY=your_news_api_key

# Guardian API
GUARDIAN_API_KEY=your_guardian_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Supabase

#### Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bills table
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  congress_id VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  full_text TEXT,
  sponsor_name VARCHAR(255),
  sponsor_party VARCHAR(50),
  sponsor_state VARCHAR(10),
  introduced_date DATE,
  last_action_date DATE,
  status VARCHAR(50),
  categories JSONB DEFAULT '[]',
  ai_analysis JSONB,
  ai_summary JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  interests JSONB DEFAULT '[]',
  civic_score INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  location_zip VARCHAR(10),
  representatives JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- News articles table
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES bills(id),
  title TEXT NOT NULL,
  source VARCHAR(100),
  url TEXT NOT NULL,
  published_date TIMESTAMP,
  summary TEXT,
  relevance_score FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Letters table
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  bill_id UUID REFERENCES bills(id),
  content TEXT NOT NULL,
  recipient_name VARCHAR(255),
  recipient_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Engagement tracking table
CREATE TABLE engagement_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  bill_id UUID REFERENCES bills(id),
  action_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_bills_congress_id ON bills(congress_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_categories ON bills USING GIN(categories);
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_news_bill_id ON news_articles(bill_id);
CREATE INDEX idx_letters_user_id ON letters(user_id);
CREATE INDEX idx_letters_bill_id ON letters(bill_id);
CREATE INDEX idx_engagement_user_id ON engagement_tracking(user_id);
```

#### Enable Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Letters policies
CREATE POLICY "Users can view own letters" ON letters
  FOR SELECT USING (auth.uid()::text IN (
    SELECT clerk_id FROM users WHERE id = user_id
  ));

CREATE POLICY "Users can create own letters" ON letters
  FOR INSERT WITH CHECK (auth.uid()::text IN (
    SELECT clerk_id FROM users WHERE id = user_id
  ));
```

### 5. Enable Chrome AI APIs

1. **Download Chrome Canary**: https://www.google.com/chrome/canary/
2. **Join Early Preview Program**: https://goo.gle/chrome-ai-dev-preview-join
3. **Enable AI features**:
   - Open Chrome Canary
   - Navigate to `chrome://flags`
   - Enable these flags:
     - `#optimization-guide-on-device-model`
     - `#prompt-api-for-gemini-nano`
     - `#summarization-api-for-gemini-nano`
     - `#writer-api-for-gemini-nano`
     - `#rewriter-api-for-gemini-nano`
4. **Restart browser**
5. **Test availability** in console:
   ```javascript
   await window.ai.languageModel.availability();
   // Should return 'readily' or 'downloadable'
   ```

### 6. Configure Tailwind CSS

Update `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
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
      },
    },
  },
  plugins: [],
};

export default config;
```

### 7. TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 8. Create Type Definitions

Create `types/chrome-ai.d.ts`:

```typescript
// Chrome AI API type definitions

interface Window {
  ai?: {
    summarizer?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: SummarizerOptions): Promise<Summarizer>;
    };
    languageModel?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: LanguageModelOptions): Promise<LanguageModel>;
    };
    writer?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: WriterOptions): Promise<Writer>;
    };
    rewriter?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(options?: RewriterOptions): Promise<Rewriter>;
    };
    proofreader?: {
      availability(): Promise<'readily' | 'downloadable' | 'downloading' | 'no'>;
      create(): Promise<Proofreader>;
    };
  };
}

interface SummarizerOptions {
  type?: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format?: 'markdown' | 'plain-text';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

interface Summarizer {
  summarize(text: string): Promise<string>;
  destroy(): Promise<void>;
}

interface LanguageModelOptions {
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
}

interface LanguageModel {
  prompt(message: string): Promise<string>;
  promptStreaming(message: string): AsyncIterable<string>;
  destroy(): Promise<void>;
}

interface WriterOptions {
  tone?: 'formal' | 'casual' | 'professional';
  format?: 'plain-text' | 'markdown';
  length?: 'short' | 'medium' | 'long';
  sharedContext?: string;
}

interface Writer {
  write(prompt: string): Promise<string>;
  writeStreaming(prompt: string): AsyncIterable<string>;
  destroy(): Promise<void>;
}

interface RewriterOptions {
  tone?: 'as-is' | 'more-formal' | 'more-casual';
  length?: 'as-is' | 'shorter' | 'longer';
  sharedContext?: string;
}

interface Rewriter {
  rewrite(text: string): Promise<string>;
  destroy(): Promise<void>;
}

interface Proofreader {
  proofread(text: string): Promise<string>;
  destroy(): Promise<void>;
}
```

## Development Workflow

### Daily Development Routine

1. **Check Archon tasks**:
   ```bash
   # Get current tasks
   # Use Archon MCP to view todo tasks
   ```

2. **Pick highest priority task**
3. **Mark task as 'doing'**
4. **Research before implementing**:
   - Search knowledge base
   - Find code examples
   - Review best practices
5. **Implement feature**
6. **Test thoroughly**
7. **Mark task as 'review'**
8. **Get next task**

### Testing

```bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/bill-discovery

# Make changes and commit
git add .
git commit -m "feat: implement bill discovery interface"

# Push to remote
git push origin feature/bill-discovery

# Create pull request on GitHub
```

## Next Steps

Now that your environment is set up, you're ready to start building! Follow the implementation phases outlined in the project plan:

1. **Phase 1**: Foundation Setup (Weeks 1-2)
2. **Phase 2**: Chrome AI Integration (Weeks 3-4)
3. **Phase 3**: Multimodal Features (Weeks 5-6)
4. **Phase 4**: Personalization & Community (Weeks 7-8)
5. **Phase 5**: Testing & Optimization
6. **Phase 6**: Hackathon Submission

## Resources

- **Documentation**: `/docs` folder
- **Architecture Guide**: `docs/ARCHITECTURE.md`
- **Chrome AI Guide**: `docs/CHROME_AI_INTEGRATION_GUIDE.md`
- **API Integration**: `docs/API_INTEGRATION_GUIDE.md`
- **PRD**: `docs/Legislator Lens_ Complete Product Requirements Document.md`

## Support

- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs

Happy coding! 🚀
