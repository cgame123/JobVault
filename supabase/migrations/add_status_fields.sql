-- Add status and payment fields to receipts table
ALTER TABLE receipts 
ADD COLUMN status TEXT NOT NULL DEFAULT 'submitted',
ADD COLUMN paid BOOLEAN NOT NULL DEFAULT false;

-- Add check constraint to ensure status is one of the allowed values
ALTER TABLE receipts
ADD CONSTRAINT receipts_status_check 
CHECK (status IN ('submitted', 'processing', 'needs_review', 'approved', 'rejected', 'duplicate'));

-- Update existing receipts to have a status of 'approved' since they're already in the system
UPDATE receipts SET status = 'approved';
