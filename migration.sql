-- MIGRATION: Enterprise Evolution v1.0
-- Run this in Supabase SQL Editor

-- 1. Add 'patient' to user_role enum
-- Note: PostgreSQL doesn't allow adding values to enums inside a transaction in some versions, 
-- but Supabase/Postgres 12+ supports this:
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'patient' AFTER 'pharmacist';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'lab_tech' AFTER 'pharmacist';

-- 2. Enhance medical_records with health suggestions
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS health_suggestions JSONB DEFAULT '[]';

-- 3. Create Prescriptions table for granular dispensing
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'dispensed', 'cancelled'
  dispensed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enhance Billing for payments
ALTER TABLE billing ADD COLUMN IF NOT EXISTS payment_method TEXT; -- 'UPI', 'Card', 'Cash'
ALTER TABLE billing ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 5. Enable RLS for prescriptions
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can manage prescriptions" ON prescriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor'));

CREATE POLICY "Pharmacists can view and update prescriptions" ON prescriptions
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pharmacist'));

CREATE POLICY "Patients can view own prescriptions" ON prescriptions
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'patient'));
