# Component Specifications

## Overview

This document provides detailed specifications for all React components in Legislator Lens, including props, state management, and implementation examples.

---

## Core UI Components

### 1. Button Component

**File**: `components/ui/Button.tsx`

```typescript
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600',
        secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        ghost: 'hover:bg-gray-100 text-gray-700',
        link: 'text-primary-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner className="mr-2" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);
```

**Usage**:
```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Get Started
</Button>

<Button variant="secondary" leftIcon={<SearchIcon />}>
  Search Bills
</Button>

<Button variant="danger" isLoading={deleting}>
  Delete
</Button>
```

---

### 2. Card Component

**File**: `components/ui/Card.tsx`

```typescript
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all',
          {
            'bg-white shadow-md': variant === 'default',
            'bg-white border border-gray-200': variant === 'outlined',
            'bg-white shadow-xl': variant === 'elevated',
            'hover:shadow-lg hover:-translate-y-1': hover,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
);

export const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
);

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-500', className)}
      {...props}
    />
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
);
```

**Usage**:
```tsx
<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>H.R. 1234</CardTitle>
    <CardDescription>Infrastructure Investment Act</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Bill summary content...</p>
  </CardContent>
  <CardFooter>
    <Button>Read More</Button>
  </CardFooter>
</Card>
```

---

### 3. Badge Component

**File**: `components/ui/Badge.tsx`

```typescript
import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-primary-100 text-primary-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

export function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
  return (
    <div className={badgeVariants({ variant, className })} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}
```

**Usage**:
```tsx
<Badge variant="success">Passed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="info" icon={<ClockIcon />}>In Progress</Badge>
```

---

## Bill Components

### 4. BillCard Component

**File**: `components/bills/BillCard.tsx`

```typescript
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Bill } from '@/types/bill';

export interface BillCardProps {
  bill: Bill;
  variant?: 'compact' | 'detailed' | 'hero';
  showActions?: boolean;
  onViewDetails?: (billId: string) => void;
  onWriteLetter?: (billId: string) => void;
  onSave?: (billId: string) => void;
}

export function BillCard({
  bill,
  variant = 'compact',
  showActions = true,
  onViewDetails,
  onWriteLetter,
  onSave,
}: BillCardProps) {
  const isHero = variant === 'hero';
  const isDetailed = variant === 'detailed';

  return (
    <Card
      variant={isHero ? 'elevated' : 'default'}
      hover
      className={isHero ? 'col-span-2 row-span-2' : ''}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={isHero ? 'text-3xl' : 'text-xl'}>
              {bill.congress_id}
            </CardTitle>
            <p className={`text-gray-600 ${isHero ? 'text-lg mt-2' : 'text-sm mt-1'}`}>
              {bill.title}
            </p>
          </div>
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSave?.(bill.id)}
              aria-label="Save bill"
            >
              <BookmarkIcon />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {bill.categories.map((category) => (
            <Badge key={category} variant="primary">
              {category}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span>Sponsor: {bill.sponsor_name}</span>
          <span>•</span>
          <span>Introduced: {new Date(bill.introduced_date).toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <CardContent>
        {bill.ai_summary?.summary && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-primary-600" />
              <h4 className="font-semibold text-gray-900">AI Summary</h4>
            </div>
            <p className="text-gray-700 line-clamp-3">
              {bill.ai_summary.summary}
            </p>
          </div>
        )}

        {(isHero || isDetailed) && bill.ai_analysis?.keyPoints && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Key Points:</h4>
            <ul className="list-disc list-inside space-y-1">
              {bill.ai_analysis.keyPoints.slice(0, 3).map((point, idx) => (
                <li key={idx} className="text-gray-700 text-sm">
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isHero && (
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" size="sm">
              <ImageIcon className="mr-2" />
              Visual Impact
            </Button>
            <Button variant="secondary" size="sm">
              <SpeakerIcon className="mr-2" />
              Audio Summary
            </Button>
            <Button variant="secondary" size="sm">
              <QuestionIcon className="mr-2" />
              Ask Questions
            </Button>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            {bill.view_count || 0} views
          </span>
          <span className="flex items-center gap-1">
            <MailIcon className="w-4 h-4" />
            {bill.letter_count || 0} letters
          </span>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onViewDetails?.(bill.id)}
          >
            Read Full Analysis
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onWriteLetter?.(bill.id)}
          >
            <PencilIcon className="mr-2" />
            Write Letter
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

---

### 5. BillAnalysisPanel Component

**File**: `components/bills/BillAnalysisPanel.tsx`

```typescript
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import type { Bill } from '@/types/bill';

export interface BillAnalysisPanelProps {
  bill: Bill;
  tabs?: ('gist' | 'provisions' | 'impact' | 'stakeholders' | 'qa')[];
}

export function BillAnalysisPanel({
  bill,
  tabs = ['gist', 'provisions', 'impact', 'stakeholders', 'qa'],
}: BillAnalysisPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b">
          {tabs.includes('gist') && (
            <TabsTrigger value="gist">The Gist</TabsTrigger>
          )}
          {tabs.includes('provisions') && (
            <TabsTrigger value="provisions">Key Provisions</TabsTrigger>
          )}
          {tabs.includes('impact') && (
            <TabsTrigger value="impact">Visual Impact</TabsTrigger>
          )}
          {tabs.includes('stakeholders') && (
            <TabsTrigger value="stakeholders">Stakeholder Voices</TabsTrigger>
          )}
          {tabs.includes('qa') && (
            <TabsTrigger value="qa">Q&A</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="gist" className="py-6">
          <GistTab bill={bill} />
        </TabsContent>

        <TabsContent value="provisions" className="py-6">
          <ProvisionsTab bill={bill} />
        </TabsContent>

        <TabsContent value="impact" className="py-6">
          <VisualImpactTab bill={bill} />
        </TabsContent>

        <TabsContent value="stakeholders" className="py-6">
          <StakeholdersTab bill={bill} />
        </TabsContent>

        <TabsContent value="qa" className="py-6">
          <QATab bill={bill} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Individual tab components
function GistTab({ bill }: { bill: Bill }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <TargetIcon className="w-5 h-5" />
          Purpose
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {bill.ai_analysis?.purpose || 'AI analysis in progress...'}
        </p>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ListIcon className="w-5 h-5" />
          Key Points
        </h3>
        <ul className="space-y-2">
          {bill.ai_analysis?.keyPoints?.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="text-primary-600 font-semibold">•</span>
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ZapIcon className="w-5 h-5" />
          Quick Impact
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {bill.ai_analysis?.quickImpact || 'Impact assessment pending...'}
        </p>
      </section>

      <VisualImpactPreview bill={bill} />
      <AudioSummaryPlayer bill={bill} />
    </div>
  );
}
```

---

## Letter Writing Components

### 6. LetterWritingAssistant Component

**File**: `components/letters/LetterWritingAssistant.tsx`

```typescript
import { useState } from 'react';
import { StepIndicator } from '@/components/ui/StepIndicator';
import type { Bill, Representative } from '@/types';

export interface LetterWritingAssistantProps {
  bill: Bill;
  representative: Representative;
  onComplete: (letter: Letter) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 1, name: 'Position', description: 'Choose your stance' },
  { id: 2, name: 'Story', description: 'Share your story' },
  { id: 3, name: 'Points', description: 'Select key points' },
  { id: 4, name: 'Tone', description: 'Choose tone & generate' },
  { id: 5, name: 'Review', description: 'Review & send' },
];

export function LetterWritingAssistant({
  bill,
  representative,
  onComplete,
  onCancel,
}: LetterWritingAssistantProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [letterData, setLetterData] = useState({
    position: null as 'support' | 'oppose' | 'concerned' | null,
    personalStory: '',
    keyPoints: [] as string[],
    tone: 'professional' as 'formal' | 'professional' | 'casual',
    generatedLetter: '',
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <div className="mt-8">
        {currentStep === 1 && (
          <PositionStep
            bill={bill}
            value={letterData.position}
            onChange={(position) => setLetterData({ ...letterData, position })}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <PersonalStoryStep
            value={letterData.personalStory}
            onChange={(personalStory) => setLetterData({ ...letterData, personalStory })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <KeyPointsStep
            bill={bill}
            position={letterData.position!}
            value={letterData.keyPoints}
            onChange={(keyPoints) => setLetterData({ ...letterData, keyPoints })}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && (
          <ToneAndGenerateStep
            letterData={letterData}
            bill={bill}
            representative={representative}
            onGenerated={(generatedLetter) =>
              setLetterData({ ...letterData, generatedLetter })
            }
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 5 && (
          <ReviewAndSendStep
            letter={letterData.generatedLetter}
            representative={representative}
            onComplete={onComplete}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}
```

---

### 7. CivicScoreWidget Component

**File**: `components/dashboard/CivicScoreWidget.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CivicScore } from '@/types';

export interface CivicScoreWidgetProps {
  score: CivicScore;
  compact?: boolean;
}

export function CivicScoreWidget({ score, compact = false }: CivicScoreWidgetProps) {
  const totalPoints = score.knowledge + score.action + score.community;
  const maxPoints = 1000;
  const percentage = (totalPoints / maxPoints) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          Your Civic Score
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold text-gray-900">{totalPoints}</span>
            <span className="text-sm text-gray-500">/ {maxPoints} points</span>
          </div>
          <ProgressBar value={percentage} className="h-2" />
        </div>

        {!compact && (
          <>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Knowledge</span>
                  <span className="font-semibold">{score.knowledge}</span>
                </div>
                <ProgressBar
                  value={(score.knowledge / 400) * 100}
                  className="h-1.5"
                  variant="primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Action</span>
                  <span className="font-semibold">{score.action}</span>
                </div>
                <ProgressBar
                  value={(score.action / 400) * 100}
                  className="h-1.5"
                  variant="success"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Community</span>
                  <span className="font-semibold">{score.community}</span>
                </div>
                <ProgressBar
                  value={(score.community / 200) * 100}
                  className="h-1.5"
                  variant="info"
                />
              </div>
            </div>

            {score.streak > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                <FlameIcon className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-orange-900">
                  {score.streak}-day streak!
                </span>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Recent Achievements
              </h4>
              <div className="space-y-2">
                {score.recentAchievements?.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant="success">{achievement.icon}</Badge>
                    <span className="text-gray-700">{achievement.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="secondary" className="w-full">
              View All Achievements
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## AI Integration Components

### 8. AISummaryGenerator Component

**File**: `components/ai/AISummaryGenerator.tsx`

```typescript
import { useState, useEffect } from 'react';
import { useBillSummarizer } from '@/hooks/useAI';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';

export interface AISummaryGeneratorProps {
  billText: string;
  billId: string;
  onSummaryGenerated?: (summary: string) => void;
}

export function AISummaryGenerator({
  billText,
  billId,
  onSummaryGenerated,
}: AISummaryGeneratorProps) {
  const [summary, setSummary] = useState<string>('');
  const { summarize, loading, error } = useBillSummarizer();

  useEffect(() => {
    async function generateSummary() {
      const result = await summarize(billText, {
        type: 'key-points',
        length: 'medium',
      });

      if (result) {
        setSummary(result.summary);
        onSummaryGenerated?.(result.summary);
      }
    }

    if (billText && !summary) {
      generateSummary();
    }
  }, [billText, billId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
        <LoadingSpinner />
        <span className="text-sm text-blue-900">
          AI is analyzing this bill...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="warning">
        <AlertTitle>Summary Unavailable</AlertTitle>
        <AlertDescription>
          We couldn't generate an AI summary at this time. Please read the full bill text.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="prose prose-gray max-w-none">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold m-0">AI-Generated Summary</h3>
      </div>
      <div
        className="text-gray-700"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
    </div>
  );
}
```

---

## State Management Patterns

### Zustand Store Example

**File**: `lib/store/billStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bill } from '@/types';

interface BillState {
  savedBills: Bill[];
  recentlyViewed: Bill[];
  addSavedBill: (bill: Bill) => void;
  removeSavedBill: (billId: string) => void;
  addRecentlyViewed: (bill: Bill) => void;
  clearHistory: () => void;
}

export const useBillStore = create<BillState>()(
  persist(
    (set) => ({
      savedBills: [],
      recentlyViewed: [],

      addSavedBill: (bill) =>
        set((state) => ({
          savedBills: [...state.savedBills, bill],
        })),

      removeSavedBill: (billId) =>
        set((state) => ({
          savedBills: state.savedBills.filter((b) => b.id !== billId),
        })),

      addRecentlyViewed: (bill) =>
        set((state) => ({
          recentlyViewed: [
            bill,
            ...state.recentlyViewed.filter((b) => b.id !== bill.id),
          ].slice(0, 10), // Keep only last 10
        })),

      clearHistory: () =>
        set({ recentlyViewed: [] }),
    }),
    {
      name: 'bill-storage',
    }
  )
);
```

---

This component specification document provides detailed implementation guidance for all major components in Legislator Lens! 🎯
