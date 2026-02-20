-- ============================================================
-- FIX: Add missing RLS policies for Doctors table
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- Allow all authenticated staff to VIEW doctors
CREATE POLICY "Authenticated users can view doctors"
  ON doctors FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow admins to INSERT new doctor records
CREATE POLICY "Admins can insert doctors"
  ON doctors FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Allow admins to UPDATE doctor records
CREATE POLICY "Admins can update doctors"
  ON doctors FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Also allow admins to INSERT profiles (they need this for doctor onboarding)
-- (Run only if you haven't applied this before)
CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
