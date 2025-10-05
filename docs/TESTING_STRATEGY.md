# Testing Strategy & Quality Assurance

## Overview

This document outlines the comprehensive testing strategy for Legislator Lens, ensuring high quality, reliability, and accessibility for the Google Chrome AI Challenge 2025.

---

## Testing Pyramid

```
                   ▲
                  / \
                 /   \
                /  E2E \          10% - End-to-End Tests
               /-------\
              /         \
             / Integration\       30% - Integration Tests
            /-------------\
           /               \
          /   Unit Tests    \     60% - Unit Tests
         /___________________\
```

---

## 1. Unit Testing

### Tools & Setup

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @vitest/ui jsdom
```

### Configuration

**File**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**File**: `tests/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.ai for Chrome AI APIs
global.window.ai = {
  summarizer: {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue({
      summarize: vi.fn().mockResolvedValue('Test summary'),
      destroy: vi.fn(),
    }),
  },
  languageModel: {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue({
      prompt: vi.fn().mockResolvedValue('Test response'),
      promptStreaming: vi.fn(),
      destroy: vi.fn(),
    }),
  },
  writer: {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue('Test letter'),
      writeStreaming: vi.fn(),
      destroy: vi.fn(),
    }),
  },
  rewriter: {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue({
      rewrite: vi.fn().mockResolvedValue('Rewritten text'),
      destroy: vi.fn(),
    }),
  },
  proofreader: {
    availability: vi.fn().mockResolvedValue('readily'),
    create: vi.fn().mockResolvedValue({
      proofread: vi.fn().mockResolvedValue('Proofread text'),
      destroy: vi.fn(),
    }),
  },
};

// Mock fetch for API calls
global.fetch = vi.fn();
```

### Unit Test Examples

**File**: `__tests__/components/ui/Button.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByText('Primary');
    expect(button).toHaveClass('bg-primary-600');
  });

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders with icons', () => {
    render(
      <Button leftIcon={<span>🔍</span>}>
        Search
      </Button>
    );
    expect(screen.getByText('🔍')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });
});
```

**File**: `__tests__/lib/ai/summarizer.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BillSummarizer, summarizeBill } from '@/lib/ai/summarizer';

describe('BillSummarizer', () => {
  let summarizer: BillSummarizer;

  beforeEach(() => {
    summarizer = new BillSummarizer();
    vi.clearAllMocks();
  });

  it('initializes successfully when API is available', async () => {
    await expect(summarizer.initialize()).resolves.not.toThrow();
  });

  it('throws error when API is not available', async () => {
    window.ai = undefined;
    await expect(summarizer.initialize()).rejects.toThrow('Summarizer API not available');
  });

  it('generates summary from text', async () => {
    await summarizer.initialize();
    const result = await summarizer.summarize('Test bill text');

    expect(result).toBe('Test summary');
    expect(window.ai.summarizer.create).toHaveBeenCalled();
  });

  it('destroys session properly', async () => {
    await summarizer.initialize();
    await summarizer.destroy();

    expect(summarizer['summarizer']).toBeNull();
  });

  it('caches summaries correctly', async () => {
    const summary = await summarizeBill('Test bill', {
      type: 'key-points',
      length: 'medium',
    });

    expect(summary).toHaveProperty('summary');
    expect(summary).toHaveProperty('type', 'key-points');
    expect(summary).toHaveProperty('length', 'medium');
  });
});
```

**File**: `__tests__/components/bills/BillCard.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BillCard } from '@/components/bills/BillCard';

const mockBill = {
  id: '1',
  congress_id: 'H.R. 1234',
  title: 'Infrastructure Investment Act',
  sponsor_name: 'Rep. John Smith',
  introduced_date: '2025-01-15',
  categories: ['Infrastructure', 'Economy'],
  ai_summary: {
    summary: 'This bill addresses infrastructure...',
  },
  view_count: 1234,
  letter_count: 89,
};

describe('BillCard Component', () => {
  it('renders bill information', () => {
    render(<BillCard bill={mockBill} />);

    expect(screen.getByText('H.R. 1234')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure Investment Act')).toBeInTheDocument();
    expect(screen.getByText(/Rep. John Smith/)).toBeInTheDocument();
  });

  it('displays categories as badges', () => {
    render(<BillCard bill={mockBill} />);

    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Economy')).toBeInTheDocument();
  });

  it('shows AI summary when available', () => {
    render(<BillCard bill={mockBill} />);

    expect(screen.getByText(/This bill addresses infrastructure/)).toBeInTheDocument();
  });

  it('calls onViewDetails when button clicked', () => {
    const handleViewDetails = vi.fn();
    render(<BillCard bill={mockBill} onViewDetails={handleViewDetails} />);

    fireEvent.click(screen.getByText('Read Full Analysis'));
    expect(handleViewDetails).toHaveBeenCalledWith('1');
  });

  it('renders in different variants', () => {
    const { rerender } = render(<BillCard bill={mockBill} variant="compact" />);
    expect(screen.getByText('H.R. 1234')).toBeInTheDocument();

    rerender(<BillCard bill={mockBill} variant="hero" />);
    expect(screen.getByText('H.R. 1234')).toHaveClass('text-3xl');
  });
});
```

### Coverage Targets

- **Overall Coverage**: 80% minimum
- **Critical Paths**: 95% minimum (AI integration, letter writing, bill analysis)
- **UI Components**: 70% minimum
- **Utility Functions**: 90% minimum

### Running Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run UI
npm run test:ui
```

---

## 2. Integration Testing

### Tools & Setup

```bash
# Install integration testing tools
npm install -D @playwright/test
npx playwright install
```

### Configuration

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Integration Test Examples

**File**: `tests/integration/bill-discovery.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bill Discovery Flow', () => {
  test('user can search for bills', async ({ page }) => {
    await page.goto('/bills');

    // Search for a bill
    await page.fill('input[placeholder*="Search"]', 'infrastructure');
    await page.press('input[placeholder*="Search"]', 'Enter');

    // Wait for results
    await page.waitForSelector('[data-testid="bill-card"]');

    // Verify results contain search term
    const billCards = await page.$$('[data-testid="bill-card"]');
    expect(billCards.length).toBeGreaterThan(0);

    const firstCard = await page.textContent('[data-testid="bill-card"]:first-child');
    expect(firstCard?.toLowerCase()).toContain('infrastructure');
  });

  test('user can filter bills by category', async ({ page }) => {
    await page.goto('/bills');

    // Open category filter
    await page.click('button:has-text("Categories")');

    // Select Healthcare category
    await page.click('text=Healthcare');

    // Wait for filtered results
    await page.waitForSelector('[data-testid="bill-card"]');

    // Verify all results have Healthcare badge
    const badges = await page.$$('[data-testid="category-badge"]:has-text("Healthcare")');
    expect(badges.length).toBeGreaterThan(0);
  });

  test('user can view bill details', async ({ page }) => {
    await page.goto('/bills');

    // Click first bill
    await page.click('[data-testid="bill-card"]:first-child >> text=Read Full Analysis');

    // Verify navigation to bill page
    await expect(page).toHaveURL(/\/bills\/[^\/]+/);

    // Verify bill analysis sections are present
    await expect(page.locator('text=The Gist')).toBeVisible();
    await expect(page.locator('text=Key Provisions')).toBeVisible();
  });
});
```

**File**: `tests/integration/letter-writing.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Letter Writing Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Assume user is logged in
    await page.goto('/bills/test-bill-id');
  });

  test('user can complete letter writing process', async ({ page }) => {
    // Start letter writing
    await page.click('text=Write Letter');

    // Step 1: Choose position
    await expect(page.locator('text=Choose Your Position')).toBeVisible();
    await page.click('text=I Support This Bill');
    await page.click('button:has-text("Next")');

    // Step 2: Personal story
    await expect(page.locator('text=Share Your Story')).toBeVisible();
    await page.fill('textarea', 'As a constituent, I believe this bill...');
    await page.click('button:has-text("Next")');

    // Step 3: Key points
    await expect(page.locator('text=Select Key Points')).toBeVisible();
    await page.click('input[type="checkbox"]', { clickCount: 3 }); // Select 3 points
    await page.click('button:has-text("Next")');

    // Step 4: Tone and generate
    await expect(page.locator('text=Choose Tone')).toBeVisible();
    await page.click('text=Professional');
    await page.click('button:has-text("Generate Letter")');

    // Wait for AI generation
    await page.waitForSelector('text=Generated Letter Preview');

    // Step 5: Review and send
    await page.click('button:has-text("Next")');
    await expect(page.locator('text=Review & Send')).toBeVisible();

    // Send letter
    await page.click('button:has-text("Send Letter")');

    // Verify success message
    await expect(page.locator('text=Letter sent successfully')).toBeVisible();
  });

  test('user can use voice input for personal story', async ({ page }) => {
    await page.click('text=Write Letter');
    await page.click('text=I Support This Bill');
    await page.click('button:has-text("Next")');

    // Switch to voice input
    await page.click('button:has-text("Voice")');

    // Mock voice recording (in real test, would need audio)
    await page.click('button:has-text("Start Recording")');
    await page.waitForTimeout(2000);
    await page.click('button:has-text("Stop Recording")');

    // Verify transcription appeared
    await expect(page.locator('textarea')).not.toBeEmpty();
  });
});
```

**File**: `tests/integration/ai-features.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Chrome AI Integration', () => {
  test('bill summary generates correctly', async ({ page }) => {
    await page.goto('/bills/test-bill-id');

    // Wait for AI summary to load
    await page.waitForSelector('[data-testid="ai-summary"]', { timeout: 15000 });

    // Verify summary content
    const summary = await page.textContent('[data-testid="ai-summary"]');
    expect(summary).toBeTruthy();
    expect(summary!.length).toBeGreaterThan(50);
  });

  test('interactive Q&A works', async ({ page }) => {
    await page.goto('/bills/test-bill-id');

    // Navigate to Q&A tab
    await page.click('text=Q&A');

    // Ask a question
    await page.fill('input[placeholder*="Ask"]', 'How is this bill funded?');
    await page.click('button:has-text("Send")');

    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-response"]', { timeout: 15000 });

    // Verify response
    const response = await page.textContent('[data-testid="ai-response"]');
    expect(response).toBeTruthy();
  });
});
```

---

## 3. End-to-End Testing

### Critical User Journeys

**File**: `tests/e2e/onboarding-to-action.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('new user onboarding to sending first letter', async ({ page }) => {
    // 1. Landing page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Make Democracy Accessible');

    // Try demo
    await page.fill('input[placeholder*="Search any bill"]', 'H.R. 1234');
    await expect(page.locator('text=AI Summary')).toBeVisible({ timeout: 10000 });

    // 2. Sign up
    await page.click('text=Get Started Free');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button:has-text("Sign Up")');

    // 3. Onboarding - Step 1: Interests
    await expect(page.locator('text=What topics interest you?')).toBeVisible();
    await page.click('text=Healthcare');
    await page.click('text=Education');
    await page.click('text=Climate');
    await page.click('button:has-text("Continue")');

    // Step 2: Engagement level
    await expect(page.locator('text=How do you want to engage?')).toBeVisible();
    await page.click('text=Take Action');
    await page.click('button:has-text("Continue")');

    // Step 3: Preferences
    await page.click('button:has-text("Continue")'); // Use defaults

    // Step 4: Representatives
    await page.fill('input[placeholder*="ZIP Code"]', '10001');
    await page.click('button:has-text("Find Representatives")');
    await page.waitForSelector('text=Senator');
    await page.click('button:has-text("Get Started")');

    // 4. Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Your Civic Score')).toBeVisible();

    // 5. View a bill
    await page.click('[data-testid="bill-card"]:first-child');
    await expect(page.locator('text=The Gist')).toBeVisible();

    // 6. Write letter
    await page.click('text=Write to Your Representative');

    // Complete letter writing flow
    await page.click('text=I Support This Bill');
    await page.click('button:has-text("Next")');

    await page.fill('textarea', 'This bill is important because...');
    await page.click('button:has-text("Next")');

    await page.click('input[type="checkbox"]', { clickCount: 3 });
    await page.click('button:has-text("Next")');

    await page.click('text=Professional');
    await page.click('button:has-text("Generate Letter")');
    await page.waitForSelector('text=Generated Letter Preview');
    await page.click('button:has-text("Next")');

    await page.click('button:has-text("Send Letter")');

    // 7. Verify success
    await expect(page.locator('text=Letter sent successfully')).toBeVisible();

    // Check civic score updated
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="civic-score"]')).toContainText(/[1-9]/);
  });
});
```

---

## 4. Accessibility Testing

### Tools

```bash
npm install -D @axe-core/playwright
```

### Accessibility Test Suite

**File**: `tests/accessibility/a11y.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('landing page should not have accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('bill discovery page should not have violations', async ({ page }) => {
    await page.goto('/bills');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('keyboard navigation works throughout the app', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement!);

    // Continue tabbing
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
    }

    // Verify focus is still on interactive element
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement!);
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.$$('img:not([alt])');
    expect(imagesWithoutAlt.length).toBe(0);
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/bills');

    const inputsWithoutLabels = await page.$$('input:not([aria-label]):not([aria-labelledby])');

    // Filter out inputs that have associated labels
    for (const input of inputsWithoutLabels) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.$(`label[for="${id}"]`);
        expect(label).toBeTruthy();
      }
    }
  });
});
```

### Manual Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible on all focusable elements
- [ ] Color contrast meets WCAG 2.1 AA standards (4.5:1 for normal text)
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Error messages are clear and associated with inputs
- [ ] Screen reader announces page changes
- [ ] Skip links available for navigation
- [ ] No reliance on color alone for information
- [ ] Text can be resized to 200% without loss of functionality

---

## 5. Performance Testing

### Tools

```bash
npm install -D lighthouse
```

### Performance Test Suite

**File**: `tests/performance/lighthouse.spec.ts`

```typescript
import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';

test.describe('Performance Tests', () => {
  test('landing page meets performance targets', async ({ page }) => {
    await page.goto('/');

    const results = await lighthouse(page.url(), {
      port: new URL(page.url()).port,
      onlyCategories: ['performance'],
    });

    const score = results.lhr.categories.performance.score * 100;
    expect(score).toBeGreaterThanOrEqual(90);
  });

  test('bill analysis page loads within 2 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/bills/test-bill-id');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(2000);
  });

  test('AI processing completes within 10 seconds', async ({ page }) => {
    await page.goto('/bills/test-bill-id');

    const startTime = Date.now();
    await page.waitForSelector('[data-testid="ai-summary"]', { timeout: 15000 });
    const processingTime = Date.now() - startTime;

    expect(processingTime).toBeLessThan(10000);
  });
});
```

### Performance Targets

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Bill Analysis Processing**: < 10s
- **Lighthouse Performance Score**: > 90

---

## 6. Chrome AI API Testing

### Mock Setup for Development

**File**: `tests/mocks/chrome-ai.ts`

```typescript
export const mockChromeAI = {
  summarizer: {
    availability: () => Promise.resolve('readily'),
    create: () => Promise.resolve({
      summarize: (text: string) => Promise.resolve(`Summary of: ${text.substring(0, 100)}...`),
      destroy: () => Promise.resolve(),
    }),
  },
  languageModel: {
    availability: () => Promise.resolve('readily'),
    create: ({ systemPrompt }: any) => Promise.resolve({
      prompt: (message: string) => Promise.resolve(`Response to: ${message}`),
      promptStreaming: async function* (message: string) {
        yield `Streaming response to: ${message}`;
      },
      destroy: () => Promise.resolve(),
    }),
  },
  writer: {
    availability: () => Promise.resolve('readily'),
    create: () => Promise.resolve({
      write: (prompt: string) => Promise.resolve(`Generated letter based on: ${prompt}`),
      writeStreaming: async function* (prompt: string) {
        yield `Dear Representative,\n\n`;
        yield `I am writing regarding...\n`;
        yield `\nSincerely,\nYour Constituent`;
      },
      destroy: () => Promise.resolve(),
    }),
  },
  rewriter: {
    availability: () => Promise.resolve('readily'),
    create: () => Promise.resolve({
      rewrite: (text: string) => Promise.resolve(`Rewritten: ${text}`),
      destroy: () => Promise.resolve(),
    }),
  },
  proofreader: {
    availability: () => Promise.resolve('readily'),
    create: () => Promise.resolve({
      proofread: (text: string) => Promise.resolve(text.replace(/\s+/g, ' ').trim()),
      destroy: () => Promise.resolve(),
    }),
  },
};
```

### AI-Specific Tests

**File**: `tests/ai/chrome-ai-integration.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkAIAvailability } from '@/lib/ai/availability';
import { BillSummarizer } from '@/lib/ai/summarizer';
import { LegislativeAnalyzer } from '@/lib/ai/prompt';

describe('Chrome AI Integration', () => {
  describe('API Availability', () => {
    it('detects all available APIs', async () => {
      const availability = await checkAIAvailability();

      expect(availability).toHaveProperty('summarizer');
      expect(availability).toHaveProperty('prompt');
      expect(availability).toHaveProperty('writer');
      expect(availability).toHaveProperty('rewriter');
      expect(availability).toHaveProperty('proofreader');
    });
  });

  describe('Summarizer API', () => {
    it('generates summaries with different types', async () => {
      const types: Array<'key-points' | 'tl;dr' | 'teaser' | 'headline'> = [
        'key-points',
        'tl;dr',
        'teaser',
        'headline',
      ];

      for (const type of types) {
        const summarizer = new BillSummarizer();
        await summarizer.initialize({ type });

        const summary = await summarizer.summarize('Test bill text');
        expect(summary).toBeTruthy();

        await summarizer.destroy();
      }
    });

    it('handles long text input', async () => {
      const summarizer = new BillSummarizer();
      await summarizer.initialize();

      const longText = 'A'.repeat(50000); // 50K characters
      const summary = await summarizer.summarize(longText);

      expect(summary).toBeTruthy();
      expect(summary.length).toBeLessThan(longText.length);

      await summarizer.destroy();
    });
  });

  describe('Prompt API', () => {
    it('categorizes bills accurately', async () => {
      const analyzer = new LegislativeAnalyzer();
      await analyzer.initialize();

      const response = await analyzer.prompt(`
        Categorize this bill: "Infrastructure Investment Act"
        Return as JSON array of categories.
      `);

      expect(response).toBeTruthy();

      await analyzer.destroy();
    });

    it('handles streaming responses', async () => {
      const analyzer = new LegislativeAnalyzer();
      await analyzer.initialize();

      const chunks: string[] = [];
      await analyzer.streamPrompt('Explain this bill', (chunk) => {
        chunks.push(chunk);
      });

      expect(chunks.length).toBeGreaterThan(0);

      await analyzer.destroy();
    });
  });

  describe('Error Handling', () => {
    it('handles API unavailability gracefully', async () => {
      window.ai = undefined;

      const summarizer = new BillSummarizer();
      await expect(summarizer.initialize()).rejects.toThrow();
    });

    it('provides fallback when processing fails', async () => {
      // Test fallback mechanisms
      const result = await getSummaryWithFallback('Test bill text');
      expect(result).toBeTruthy();
    });
  });
});
```

---

## 7. Test Automation & CI/CD

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run integration tests
        run: npm run test:integration

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run accessibility tests
        run: npm run test:a11y
```

---

## 8. Package Scripts

**File**: `package.json` (add to scripts section)

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:integration": "playwright test",
    "test:integration:ui": "playwright test --ui",
    "test:a11y": "playwright test tests/accessibility",
    "test:e2e": "playwright test tests/e2e",
    "test:performance": "playwright test tests/performance",
    "test:all": "npm run test:coverage && npm run test:integration"
  }
}
```

---

## 9. Test Data Management

**File**: `tests/fixtures/bills.ts`

```typescript
export const mockBills = {
  infrastructure: {
    id: '1',
    congress_id: 'H.R. 1234',
    title: 'Infrastructure Investment and Jobs Act',
    sponsor_name: 'Rep. John Smith',
    sponsor_party: 'D',
    introduced_date: '2025-01-15',
    status: 'In Committee',
    categories: ['Infrastructure', 'Economy', 'Jobs'],
    full_text: 'SECTION 1. SHORT TITLE.\nThis Act may be cited as...',
    ai_summary: {
      summary: 'This bill allocates $1.2 trillion for infrastructure...',
      type: 'key-points',
      generatedAt: new Date(),
    },
  },
  healthcare: {
    id: '2',
    congress_id: 'S. 5678',
    title: 'Medicare Expansion Act',
    sponsor_name: 'Sen. Jane Doe',
    sponsor_party: 'D',
    introduced_date: '2025-02-03',
    status: 'Floor Vote Scheduled',
    categories: ['Healthcare', 'Medicare', 'Seniors'],
    ai_summary: {
      summary: 'Expands Medicare eligibility to age 60...',
      type: 'tl;dr',
      generatedAt: new Date(),
    },
  },
};

export const mockUsers = {
  newUser: {
    email: 'newuser@example.com',
    password: 'SecurePass123!',
  },
  activeUser: {
    id: 'user-123',
    email: 'active@example.com',
    preferences: {
      interests: ['Healthcare', 'Education'],
      engagementLevel: 'take-action',
    },
    civicScore: {
      knowledge: 340,
      action: 287,
      community: 220,
      streak: 7,
    },
  },
};
```

---

## 10. Quality Gates

### Pre-Commit Checks

**File**: `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linting
npm run lint

# Run type checking
npm run type-check

# Run unit tests
npm run test -- --run
```

### Pull Request Requirements

- ✅ All unit tests passing
- ✅ Code coverage ≥ 80%
- ✅ No accessibility violations
- ✅ Lighthouse performance score ≥ 90
- ✅ All TypeScript type checks passing
- ✅ ESLint with zero errors

---

## Summary

This comprehensive testing strategy ensures Legislator Lens meets the highest quality standards for the Google Chrome AI Challenge 2025:

- **Unit Tests**: 60% of testing effort, targeting 80% coverage
- **Integration Tests**: 30% of effort, covering critical user flows
- **E2E Tests**: 10% of effort, validating complete journeys
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: <10s AI processing, >90 Lighthouse score
- **Automation**: Full CI/CD pipeline with quality gates

**Testing is built into every phase of development!** 🧪✅
