-- 1. Create the Master Ledgers Table for high-performance accounting records
CREATE TABLE IF NOT EXISTS reporting_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gl_code VARCHAR(50) NOT NULL,
    gl_name VARCHAR(255) NOT NULL,
    statement_type VARCHAR(10) CHECK (statement_type IN ('PL', 'BS')),
    ey_mapping_1 VARCHAR(100),
    vertical VARCHAR(50),
    sub_vertical VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'AED',
    
    -- Quarterly Financial Balance Metrics (Stored as raw numeric scales)
    q1_actuals NUMERIC(20, 2) DEFAULT 0.00,
    q2_budget NUMERIC(20, 2) DEFAULT 0.00,
    q3_budget NUMERIC(20, 2) DEFAULT 0.00,
    q4_budget NUMERIC(20, 2) DEFAULT 0.00,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the System Operational Audits Table to track user file processing history
CREATE TABLE IF NOT EXISTS upload_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_label VARCHAR(100) NOT NULL,
    source_mode VARCHAR(50) NOT NULL,
    row_count INT NOT NULL,
    imported_by VARCHAR(255),
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add High-Performance Indices to optimize URL Search Parameters query times
CREATE INDEX IF NOT EXISTS idx_reporting_statement_type ON reporting_rows(statement_type);
CREATE INDEX IF NOT EXISTS idx_reporting_vertical ON reporting_rows(vertical);
CREATE INDEX IF NOT EXISTS idx_reporting_sub_vertical ON reporting_rows(sub_vertical);
