-- Hybrid AI Analysis Tables
-- Store cached results from Chrome AI + Cloud AI analyses

-- Bill comprehensive analyses (hybrid router results)
CREATE TABLE IF NOT EXISTS bill_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL,
  analysis_level TEXT NOT NULL CHECK (analysis_level IN ('quick', 'standard', 'deep')),
  analysis_data JSONB NOT NULL,
  chrome_processing_time INTEGER, -- milliseconds
  cloud_processing_time INTEGER, -- milliseconds
  total_processing_time INTEGER, -- milliseconds
  providers_used JSONB, -- { chrome: true, gemini: false, news: true }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bill_id, analysis_level)
);

-- Historical bill analyses (Gemini API results)
CREATE TABLE IF NOT EXISTS bill_historical_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  processing_time INTEGER, -- milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News correlations (NewsAPI + Guardian results)
CREATE TABLE IF NOT EXISTS bill_news_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id TEXT NOT NULL,
  correlation_data JSONB NOT NULL,
  processing_time INTEGER, -- milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bill_analyses_bill_id ON bill_analyses(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_analyses_level ON bill_analyses(analysis_level);
CREATE INDEX IF NOT EXISTS idx_bill_analyses_created_at ON bill_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bill_historical_bill_id ON bill_historical_analyses(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_historical_created_at ON bill_historical_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bill_news_bill_id ON bill_news_correlations(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_news_created_at ON bill_news_correlations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE bill_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_historical_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_news_correlations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all authenticated users to read cached analyses
CREATE POLICY "Allow authenticated users to read bill analyses"
  ON bill_analyses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read historical analyses"
  ON bill_historical_analyses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read news correlations"
  ON bill_news_correlations FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert/update (for API endpoints)
CREATE POLICY "Allow service role to insert bill analyses"
  ON bill_analyses FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update bill analyses"
  ON bill_analyses FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to insert historical analyses"
  ON bill_historical_analyses FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to insert news correlations"
  ON bill_news_correlations FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bill_analyses_updated_at
  BEFORE UPDATE ON bill_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_historical_updated_at
  BEFORE UPDATE ON bill_historical_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bill_news_updated_at
  BEFORE UPDATE ON bill_news_correlations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE bill_analyses IS 'Comprehensive bill analyses using hybrid AI (Chrome + Cloud)';
COMMENT ON TABLE bill_historical_analyses IS 'Historical bill comparisons using Gemini API';
COMMENT ON TABLE bill_news_correlations IS 'News article correlations using NewsAPI and Guardian';

COMMENT ON COLUMN bill_analyses.analysis_level IS 'quick = Chrome only, standard = Chrome + selective Cloud, deep = Chrome + full Cloud';
COMMENT ON COLUMN bill_analyses.providers_used IS 'JSON object tracking which AI providers were used';
COMMENT ON COLUMN bill_analyses.chrome_processing_time IS 'Time spent on Chrome AI processing in milliseconds';
COMMENT ON COLUMN bill_analyses.cloud_processing_time IS 'Time spent on Cloud AI processing in milliseconds';
