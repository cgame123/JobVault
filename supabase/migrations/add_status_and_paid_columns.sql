-- Add status column if it doesn't exist
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted';

-- Update existing rows to have 'submitted' status
UPDATE receipts SET status = 'submitted' WHERE status IS NULL;

-- Add NOT NULL constraint after setting default values
ALTER TABLE receipts ALTER COLUMN status SET NOT NULL;

-- Add paid column if it doesn't exist
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT false;

-- Update existing rows to have 'false' for paid
UPDATE receipts SET paid = false WHERE paid IS NULL;

-- Add NOT NULL constraint for paid column
ALTER TABLE receipts ALTER COLUMN paid SET NOT NULL;

-- Add check constraint for status values
ALTER TABLE receipts DROP CONSTRAINT IF EXISTS receipts_status_check;
ALTER TABLE receipts ADD CONSTRAINT receipts_status_check CHECK (status IN ('submitted', 'processing', 'needs_review', 'approved', 'rejected', 'duplicate'));

-- Force a refresh of the schema cache
COMMENT ON TABLE receipts IS 'Table for storing receipt information, updated with status and paid columns';
