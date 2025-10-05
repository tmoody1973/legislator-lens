# Legislator Lens - Technical Architecture

## System Overview

Legislator Lens is a privacy-first, AI-powered civic engagement platform built for the Google Chrome AI Challenge 2025. The application leverages Chrome's built-in AI APIs for local processing while maintaining a hybrid architecture for enhanced functionality.

## Architecture Principles

### 1. Privacy-First Design
- **Local AI Processing**: All sensitive user data (political preferences, personal views) processed locally using Chrome's built-in AI APIs
- **Minimal Cloud Storage**: Only anonymized metrics and public bill data stored in cloud
- **User Control**: Transparent AI processing with user-controllable privacy settings

### 2. Progressive Enhancement
- **Core Functionality Offline**: Essential features work without internet using local AI
- **Enhanced Features Online**: News integration, social features, real-time updates available when connected
- **Graceful Degradation**: Seamless fallbacks when network unavailable

### 3. Performance Optimization
- **Target Metrics**:
  - Bill analysis: <10 seconds
  - Page load: <2 seconds
  - Offline capability: 100% for core features
- **Caching Strategy**: Intelligent caching of AI results, bill data, and user preferences

## Technology Stack

### Frontend Layer
```
Next.js 14 (App Router)
├── Framework: React 18 with Server Components
├── Language: TypeScript 5.x
├── Styling: Tailwind CSS 3.x
├── State Management: React Context + Zustand (for complex state)
└── UI Components: Custom component library with shadcn/ui primitives
```

### Backend & Data Layer
```
Supabase
├── Database: PostgreSQL with Row Level Security (RLS)
├── Authentication: Integrated with Clerk
├── Edge Functions: API orchestration and rate limiting
├── Real-time: WebSocket subscriptions for collaborative features
└── Storage: User-generated content (optional profile images)
```

### Authentication
```
Clerk
├── Social Login: Google, GitHub
├── Session Management: JWT with refresh tokens
├── User Metadata: Synced with Supabase
└── Middleware: Route protection and role-based access
```

### External APIs
```
Primary Data Sources
├── Congress.gov API: Bill data, metadata, full text
├── NewsAPI: Current events and news articles
├── Guardian API: Additional news coverage
└── Chrome AI APIs: Local AI processing (detailed below)
```

## Chrome AI APIs Integration

### 1. Summarizer API
**Purpose**: Generate concise bill summaries

**Configuration Options**:
```typescript
interface SummarizerOptions {
  sharedContext?: string;        // Additional context for summarization
  type: 'key-points' | 'tl;dr' | 'teaser' | 'headline';
  format: 'markdown' | 'plain-text';
  length: 'short' | 'medium' | 'long';
}
```

**Usage Pattern**:
```typescript
// Create summarizer with configuration
const summarizer = await ai.summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  sharedContext: 'Congressional legislation analysis'
});

// Generate summary
const summary = await summarizer.summarize(billText);
```

**Implementation Strategy**:
- Cache summaries by bill ID and version
- Provide multiple summary types (key-points, TL;DR, teaser)
- Fallback to manual summaries if API unavailable

### 2. Prompt API
**Purpose**: Bill categorization, analysis, Q&A, stakeholder perspectives

**Key Use Cases**:
- **Dynamic Categorization**: Analyze bill content to generate contextual categories
- **Key Provision Extraction**: Identify and explain important sections
- **Impact Analysis**: Assess potential effects on different stakeholders
- **Interactive Q&A**: Answer user questions about bills

**Implementation Pattern**:
```typescript
// Create session with system prompt
const session = await ai.languageModel.create({
  systemPrompt: `You are a legislative analyst helping citizens understand
                 congressional bills. Provide clear, unbiased analysis.`
});

// Categorize bill
const categories = await session.prompt(`
  Analyze this bill and suggest 3-5 contextual categories:
  ${billText}

  Return as JSON: ["category1", "category2", ...]
`);

// Extract key provisions
const provisions = await session.prompt(`
  Extract and explain the 5 most important provisions from this bill:
  ${billText}
`);
```

**Multimodal Capabilities**:
- Accept text, images (local issue photos), audio (voice input)
- Generate visual descriptions for impact imagery
- Process voice recordings for letter writing

### 3. Writer API
**Purpose**: Generate personalized letters to representatives

**Implementation**:
```typescript
const writer = await ai.writer.create({
  tone: 'formal',
  format: 'plain-text',
  length: 'medium'
});

const letter = await writer.write(`
  Write a letter to my representative about ${billTitle}.
  Position: ${userPosition}
  Personal story: ${userStory}
  Key points: ${keyPoints.join(', ')}
`);
```

**Features**:
- 5-step guided process (position, story, points, tone, review)
- Multimodal input (text, voice, images)
- Template system for different bill types

### 4. Rewriter API
**Purpose**: Optimize content clarity and provide alternative explanations

**Use Cases**:
- Simplify complex legislative language
- Provide multiple explanation styles
- Adjust tone for different audiences

### 5. Proofreader API
**Purpose**: Quality assurance for user-generated letters

**Implementation**:
```typescript
const proofreader = await ai.proofreader.create();
const corrections = await proofreader.proofread(userLetter);

// Apply suggestions
const polishedLetter = applyCorrections(userLetter, corrections);
```

### 6. Translator API (Optional)
**Purpose**: Multilingual accessibility

**Implementation**:
- Detect user language preferences
- Translate bill summaries and UI
- Support correspondence in multiple languages

## Data Architecture

### Database Schema

#### Bills Table
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  congress_id VARCHAR(50) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  full_text TEXT,
  sponsor_name VARCHAR(255),
  sponsor_party VARCHAR(50),
  introduced_date DATE,
  last_action_date DATE,
  status VARCHAR(50),
  categories JSONB DEFAULT '[]',
  ai_analysis JSONB,
  ai_summary JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bills_congress_id ON bills(congress_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_categories ON bills USING GIN(categories);
```

#### Users Table
```sql
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

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
```

#### News Articles Table
```sql
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

CREATE INDEX idx_news_bill_id ON news_articles(bill_id);
CREATE INDEX idx_news_relevance ON news_articles(relevance_score DESC);
```

#### Letters Table
```sql
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

CREATE INDEX idx_letters_user_id ON letters(user_id);
CREATE INDEX idx_letters_bill_id ON letters(bill_id);
```

#### Engagement Tracking Table
```sql
CREATE TABLE engagement_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  bill_id UUID REFERENCES bills(id),
  action_type VARCHAR(50) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_engagement_user_id ON engagement_tracking(user_id);
CREATE INDEX idx_engagement_action_type ON engagement_tracking(action_type);
```

## Application Architecture

### Directory Structure
```
legislator-lens/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (sign-in, sign-up)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/            # Main dashboard
│   │   ├── bills/                # Bill discovery and analysis
│   │   │   ├── [id]/            # Individual bill page
│   │   │   └── search/          # Search interface
│   │   ├── letters/              # Letter writing interface
│   │   └── profile/              # User profile and settings
│   ├── api/                      # API routes
│   │   ├── bills/                # Bill data endpoints
│   │   ├── ai/                   # AI processing endpoints
│   │   ├── news/                 # News integration
│   │   └── webhooks/             # External webhooks (Clerk, etc.)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # Reusable UI primitives
│   ├── bills/                    # Bill-specific components
│   ├── letters/                  # Letter writing components
│   ├── dashboard/                # Dashboard components
│   └── shared/                   # Shared components
├── lib/                          # Utility libraries
│   ├── ai/                       # Chrome AI API integrations
│   │   ├── summarizer.ts
│   │   ├── prompt.ts
│   │   ├── writer.ts
│   │   └── proofreader.ts
│   ├── api/                      # External API clients
│   │   ├── congress.ts
│   │   ├── news.ts
│   │   └── guardian.ts
│   ├── db/                       # Database utilities
│   │   ├── supabase.ts
│   │   └── queries.ts
│   └── utils/                    # Helper functions
├── types/                        # TypeScript type definitions
│   ├── bill.ts
│   ├── user.ts
│   ├── ai.ts
│   └── index.ts
├── hooks/                        # Custom React hooks
│   ├── useAI.ts
│   ├── useBills.ts
│   └── useAuth.ts
└── public/                       # Static assets
    ├── images/
    └── icons/
```

### Component Architecture

#### Core Components

**BillCard** - Displays bill preview with AI-generated summary
```typescript
interface BillCardProps {
  bill: Bill;
  variant: 'compact' | 'detailed';
  showActions?: boolean;
}
```

**BillAnalysisPanel** - Tabbed interface for comprehensive bill analysis
```typescript
interface BillAnalysisPanelProps {
  bill: Bill;
  tabs: ('gist' | 'provisions' | 'impact' | 'stakeholders' | 'qa')[];
}
```

**LetterWritingAssistant** - Multi-step letter creation interface
```typescript
interface LetterWritingAssistantProps {
  bill: Bill;
  representative: Representative;
  onComplete: (letter: Letter) => void;
}
```

**CivicScoreWidget** - Gamification dashboard
```typescript
interface CivicScoreWidgetProps {
  score: number;
  streak: number;
  achievements: Achievement[];
  nextMilestone: Milestone;
}
```

## AI Processing Pipeline

### Bill Analysis Workflow
```
1. Bill Ingestion
   └─> Fetch from Congress.gov API
   └─> Store raw data in database

2. AI Processing Queue
   └─> Check cache for existing analysis
   └─> If not cached:
       ├─> Summarizer API: Generate summaries
       ├─> Prompt API: Extract categories
       ├─> Prompt API: Identify key provisions
       ├─> Prompt API: Analyze stakeholder impacts
       └─> Cache results

3. Visual Enhancement
   └─> Prompt API: Generate visual descriptions
   └─> Create imagery prompts

4. Store & Serve
   └─> Save processed data
   └─> Update search indexes
   └─> Serve to users
```

### Caching Strategy
- **Bill Summaries**: Cache indefinitely (update only on bill changes)
- **Categories**: Cache for 7 days (allow periodic refinement)
- **News Articles**: Cache for 24 hours (fresh content)
- **User Preferences**: Local storage + database sync

## Security & Privacy

### Data Protection
- **RLS Policies**: Enforce user-level data access
- **API Keys**: Stored in environment variables, never exposed to client
- **CORS**: Strict origin validation
- **Rate Limiting**: Prevent API abuse

### Privacy Features
- **Local Processing**: Sensitive AI operations run on-device
- **Anonymous Metrics**: No tracking of political preferences
- **Data Minimization**: Collect only essential information
- **User Control**: Export, delete account capabilities

## Performance Optimization

### Client-Side
- **Code Splitting**: Dynamic imports for heavy features
- **Image Optimization**: Next.js Image component with lazy loading
- **Service Workers**: Offline capability and asset caching
- **Virtual Scrolling**: For long bill lists

### Server-Side
- **Edge Functions**: Deploy API routes to edge for low latency
- **Database Indexes**: Optimize query performance
- **Connection Pooling**: Efficient database connections
- **CDN**: Static asset delivery

## Monitoring & Analytics

### Metrics to Track
- **Performance**: Page load times, AI processing duration
- **Engagement**: Bill views, letters sent, civic score progression
- **Errors**: API failures, AI processing errors
- **Usage**: Popular bills, feature adoption

### Tools
- **Vercel Analytics**: Performance monitoring
- **Sentry**: Error tracking
- **Supabase Dashboard**: Database metrics
- **Custom Events**: User engagement tracking

## Deployment Architecture

### Production Environment
```
Vercel Edge Network
├── Next.js App (Edge Functions)
├── Static Assets (CDN)
└── API Routes (Serverless Functions)

Supabase Cloud
├── PostgreSQL Database (Primary)
├── PostgreSQL Database (Replica - Read)
├── Edge Functions
└── Real-time Subscriptions

External Services
├── Clerk (Authentication)
├── Congress.gov API
├── NewsAPI
└── Guardian API
```

### CI/CD Pipeline
```
GitHub Repository
└─> Push to main branch
    └─> GitHub Actions
        ├─> Run tests
        ├─> Type checking
        ├─> Linting
        └─> Deploy to Vercel
            ├─> Preview deployment (PR)
            └─> Production deployment (main)
```

## Scalability Considerations

### Horizontal Scaling
- **Stateless Architecture**: All state in database or client
- **Edge Deployment**: Geographic distribution
- **CDN**: Asset delivery optimization

### Vertical Scaling
- **Database**: Supabase auto-scaling
- **Caching**: Redis layer for high-traffic scenarios
- **Background Jobs**: Queue system for heavy processing

## Future Enhancements

### Phase 2 Features
- **Real-time Collaboration**: Bill annotations and discussions
- **Advanced Analytics**: Personal civic impact dashboard
- **Mobile Apps**: React Native for iOS/Android
- **API Platform**: Public API for third-party integrations

### AI Enhancements
- **Custom Models**: Fine-tuned for legislative analysis
- **Predictive Analytics**: Bill passage likelihood
- **Sentiment Analysis**: Public opinion tracking
- **Automated Alerts**: Personalized bill notifications
