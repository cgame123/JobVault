-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the staff table
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  property TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  phone_number TEXT NOT NULL,
  staff_id UUID REFERENCES staff(id),
  staff_name TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_phone_number ON receipts(phone_number);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(date);
CREATE INDEX IF NOT EXISTS idx_staff_phone_number ON staff(phone_number);
