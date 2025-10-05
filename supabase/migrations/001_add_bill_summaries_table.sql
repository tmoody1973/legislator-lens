-- Add bill_summaries table for caching AI-generated summaries
-- This table stores summarized bill content to avoid redundant AI processing

CREATE TABLE IF NOT EXISTS public.bill_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL, -- Format: "hr-1-119"
  summary_type TEXT NOT NULL CHECK (summary_type IN ('key-points', 'tl;dr', 'teaser', 'headline')),
  summary_text TEXT NOT NULL,
  summary_length TEXT NOT NULL CHECK (summary_length IN ('short', 'medium', 'long')),
  summary_format TEXT NOT NULL CHECK (summary_format IN ('markdown', 'plain-text')),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one summary per bill per type
  UNIQUE(bill_id, summary_type)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bill_summaries_bill_id ON public.bill_summaries(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_summaries_type ON public.bill_summaries(summary_type);

-- Add updated_at trigger
CREATE TRIGGER update_bill_summaries_updated_at
  BEFORE UPDATE ON public.bill_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.bill_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow all authenticated users to read summaries
CREATE POLICY "Allow authenticated users to read bill summaries"
  ON public.bill_summaries
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow all authenticated users to insert summaries
CREATE POLICY "Allow authenticated users to create bill summaries"
  ON public.bill_summaries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow all authenticated users to update summaries
CREATE POLICY "Allow authenticated users to update bill summaries"
  ON public.bill_summaries
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow all authenticated users to delete summaries
CREATE POLICY "Allow authenticated users to delete bill summaries"
  ON public.bill_summaries
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE public.bill_summaries IS 'Stores AI-generated bill summaries for caching and performance';
