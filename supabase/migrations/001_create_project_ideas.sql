-- Create project_ideas table for storing saved project ideas
CREATE TABLE project_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  effort TEXT CHECK (effort IN ('High', 'Medium', 'Low')),
  impact TEXT CHECK (impact IN ('High', 'Medium', 'Low')),
  elaboration JSONB,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_project_ideas_created_at ON project_ideas(created_at DESC);

-- Enable Row Level Security
ALTER TABLE project_ideas ENABLE ROW LEVEL SECURITY;

-- Anonymous access policies (adjust for user authentication later)
-- Allow anyone to insert new ideas
CREATE POLICY "Allow anonymous insert" ON project_ideas
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read all ideas
CREATE POLICY "Allow anonymous read" ON project_ideas
  FOR SELECT USING (true);

-- Allow anyone to delete ideas (consider restricting in production)
CREATE POLICY "Allow anonymous delete" ON project_ideas
  FOR DELETE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on update
CREATE TRIGGER update_project_ideas_updated_at
  BEFORE UPDATE ON project_ideas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create storage bucket for idea exports
-- Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: idea-exports
-- Public: false (use signed URLs for access)
