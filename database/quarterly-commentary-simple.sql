-- Quarterly Commentary System for Strategic Initiatives
-- This table stores quarterly commentary for strategic initiatives during business plan reviews

-- Create quarterly commentary table (without enum for compatibility)
CREATE TABLE IF NOT EXISTS quarterly_commentary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    initiative_id UUID NOT NULL REFERENCES strategic_initiatives(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    quarter VARCHAR(2) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    commentary TEXT NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Submitted', 'Approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique commentary per initiative per quarter per year
    UNIQUE(initiative_id, year, quarter)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quarterly_commentary_initiative_id ON quarterly_commentary(initiative_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_commentary_year_quarter ON quarterly_commentary(year, quarter);
CREATE INDEX IF NOT EXISTS idx_quarterly_commentary_reviewer ON quarterly_commentary(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_commentary_review_date ON quarterly_commentary(review_date);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quarterly_commentary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS quarterly_commentary_updated_at_trigger ON quarterly_commentary;
CREATE TRIGGER quarterly_commentary_updated_at_trigger
    BEFORE UPDATE ON quarterly_commentary
    FOR EACH ROW
    EXECUTE FUNCTION update_quarterly_commentary_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE quarterly_commentary ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view quarterly commentary in their division" ON quarterly_commentary;
DROP POLICY IF EXISTS "Managers and above can add quarterly commentary" ON quarterly_commentary;
DROP POLICY IF EXISTS "Reviewers and above can update quarterly commentary" ON quarterly_commentary;
DROP POLICY IF EXISTS "Only admins can delete quarterly commentary" ON quarterly_commentary;

-- Policy: Users can view commentary for initiatives in their division or if they're Admin/Executive
CREATE POLICY "Users can view quarterly commentary in their division" ON quarterly_commentary
    FOR SELECT USING (
        initiative_id IN (
            SELECT si.id 
            FROM strategic_initiatives si
            JOIN strategic_objectives so ON si.objective_id = so.id
            WHERE so.division_id IN (SELECT division_id FROM users WHERE id = auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Executive'))
    );

-- Policy: Only Managers, Executives, and Admins can insert commentary
CREATE POLICY "Managers and above can add quarterly commentary" ON quarterly_commentary
    FOR INSERT WITH CHECK (
        auth.uid() IN (SELECT id FROM users WHERE role IN ('Manager', 'Executive', 'Admin'))
    );

-- Policy: Only the reviewer or higher-level roles can update commentary
CREATE POLICY "Reviewers and above can update quarterly commentary" ON quarterly_commentary
    FOR UPDATE USING (
        reviewer_id = auth.uid() 
        OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Executive', 'Admin'))
    );

-- Policy: Only Admins can delete commentary
CREATE POLICY "Only admins can delete quarterly commentary" ON quarterly_commentary
    FOR DELETE USING (
        auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
    );

-- Add helpful comments
COMMENT ON TABLE quarterly_commentary IS 'Stores quarterly commentary for strategic initiatives during business plan reviews';
COMMENT ON COLUMN quarterly_commentary.initiative_id IS 'References the strategic initiative being reviewed';
COMMENT ON COLUMN quarterly_commentary.year IS 'Year of the quarterly review';
COMMENT ON COLUMN quarterly_commentary.quarter IS 'Quarter of the review (Q1, Q2, Q3, Q4)';
COMMENT ON COLUMN quarterly_commentary.commentary IS 'Detailed commentary about the initiative progress';
COMMENT ON COLUMN quarterly_commentary.reviewer_id IS 'User who provided the commentary';
COMMENT ON COLUMN quarterly_commentary.review_date IS 'Date when the review was conducted';
COMMENT ON COLUMN quarterly_commentary.status IS 'Status of the commentary (Draft, Submitted, Approved)';