-- SEED DATA for Hospital Admin System

-- 1. Insert Demo Patients
INSERT INTO patients (patient_id, full_name, dob, gender, phone, address) VALUES
('HOSP-10001', 'John Doe', '1985-05-15', 'Male', '555-0101', '123 Maple St, Springfield'),
('HOSP-10002', 'Jane Smith', '1992-08-22', 'Female', '555-0102', '456 Oak Ave, Metropolis'),
('HOSP-10003', 'Robert Wilson', '1970-12-01', 'Male', '555-0103', '789 Pine Rd, Gotham'),
('HOSP-10004', 'Sarah Chen', '1998-03-10', 'Female', '555-0104', '321 Birch Ln, Star City'),
('HOSP-10005', 'Michael Brown', '1965-11-25', 'Male', '555-0105', '654 Cedar Ct, Central City');

-- 2. Insert Demo Inventory
INSERT INTO inventory (medicine_name, quantity, expiry_date, supplier, low_stock_threshold) VALUES
('Paracetamol 500mg', 500, '2026-12-31', 'PharmaCorp', 50),
('Amoxicillin 250mg', 20, '2025-06-15', 'GlobalMeds', 30),
('Ibuprofen 400mg', 300, '2026-08-20', 'PharmaCorp', 40),
('Insulin Glargine', 5, '2025-03-01', 'BioLife', 10),
('Cetirizine 10mg', 1000, '2027-01-10', 'MedsDirect', 100);

-- NOTE: Doctors and Appointments rely on existing Profiles (auth.users).
-- Please create users in the Supabase Auth dashboard first, then link them in the profiles table.
