-- SQL INSERT statements for referral table
-- Replace the placeholder IDs with actual UUIDs from your database

-- Internal Referrals (with referred doctor)
INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-001', 
    '{{PATIENT_ID_1}}', '{{REFERRING_DOCTOR_ID_1}}', '{{REFERRED_DOCTOR_ID_1}}',
    'INTERNAL', 'ACCEPTED', 'URGENT',
    'Patient presents with chest pain and shortness of breath. ECG shows ST elevation. Requires immediate cardiology consultation.',
    'Chest Pain Evaluation',
    'ECG, Troponin levels, Chest X-ray',
    'Aspirin 100mg daily, Metoprolol 25mg twice daily',
    'Penicillin',
    'BP: 140/90, HR: 95, Temp: 37.2°C',
    '2024-12-31', 'Patient has family history of heart disease. Father had MI at age 45.',
    NOW(), NOW()
);

INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-002',
    '{{PATIENT_ID_1}}', '{{REFERRING_DOCTOR_ID_1}}', '{{REFERRED_DOCTOR_ID_2}}',
    'INTERNAL', 'SCHEDULED', 'ROUTINE',
    'Annual diabetes review. Patient well-controlled on current medication.',
    'Diabetes Management',
    'HbA1c, Fasting glucose, Lipid profile',
    'Metformin 500mg twice daily, Gliclazide 80mg daily',
    'None known',
    'BP: 130/85, HR: 75, Temp: 36.9°C',
    '2024-10-31', 'Patient lost 5kg in last 6 months through diet and exercise.',
    NOW(), NOW()
);

INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-003',
    '{{PATIENT_ID_2}}', '{{REFERRING_DOCTOR_ID_2}}', '{{REFERRED_DOCTOR_ID_3}}',
    'INTERNAL', 'PENDING', 'URGENT',
    '8-year-old child with recurrent seizures. First episode 2 weeks ago.',
    'Seizure Evaluation',
    'EEG, Brain MRI',
    'None',
    'None known',
    'BP: 90/60, HR: 88, Temp: 37.0°C',
    '2024-12-15', 'Family history of epilepsy in maternal grandmother.',
    NOW(), NOW()
);

-- External Referrals (no referred doctor, external details provided)
INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    external_doctor_name, external_doctor_speciality, external_facility_name,
    external_facility_address, external_contact_number, external_email,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-004',
    '{{PATIENT_ID_1}}', '{{REFERRING_DOCTOR_ID_1}}',
    'EXTERNAL', 'PENDING', 'ROUTINE',
    'Patient with persistent lower back pain for 3 months. Conservative treatment ineffective.',
    'Lower Back Pain',
    'Lumbar X-ray, MRI L-spine',
    'Ibuprofen 400mg as needed',
    'None known',
    'BP: 120/80, HR: 72, Temp: 36.8°C',
    'Dr. James Wong', 'Orthopedics', 'Singapore Orthopedic Center',
    '789 Spine Road, Singapore 345678', '+65 9345 6789', 'james.wong@soc.com.sg',
    '2024-11-30', 'Patient works as a delivery driver. Pain worse with prolonged sitting.',
    NOW(), NOW()
);

INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    external_doctor_name, external_doctor_speciality, external_facility_name,
    external_facility_address, external_contact_number, external_email,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-005',
    '{{PATIENT_ID_2}}', '{{REFERRING_DOCTOR_ID_2}}',
    'EXTERNAL', 'REJECTED', 'EMERGENCY',
    'Patient with severe abdominal pain and signs of peritonitis.',
    'Acute Abdomen',
    'CT abdomen, Blood tests',
    'IV antibiotics, Pain relief',
    'None known',
    'BP: 110/70, HR: 110, Temp: 38.5°C',
    'Dr. Amanda Ng', 'General Surgery', 'Singapore General Hospital',
    '1 Hospital Drive, Singapore 169608', '+65 6222 3322', 'amanda.ng@sgh.com.sg',
    '2024-01-20', 'Hospital at full capacity. Please try National University Hospital.',
    NOW(), NOW()
);

INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    external_doctor_name, external_doctor_speciality, external_facility_name,
    external_facility_address, external_contact_number, external_email,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-006',
    '{{PATIENT_ID_3}}', '{{REFERRING_DOCTOR_ID_3}}',
    'EXTERNAL', 'COMPLETED', 'ROUTINE',
    'Patient with suspicious skin lesion on right forearm.',
    'Skin Lesion Evaluation',
    'Skin biopsy',
    'None',
    'None known',
    'BP: 118/75, HR: 68, Temp: 36.6°C',
    'Dr. Peter Zhang', 'Dermatology', 'Singapore Dermatology Clinic',
    '456 Skin Avenue, Singapore 123456', '+65 6789 0123', 'peter.zhang@sdc.com.sg',
    '2024-12-31', 'Patient cancelled due to personal reasons. Will reschedule.',
    NOW(), NOW()
);

-- More Internal Referrals
INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-007',
    '{{PATIENT_ID_2}}', '{{REFERRING_DOCTOR_ID_2}}', '{{REFERRED_DOCTOR_ID_4}}',
    'INTERNAL', 'COMPLETED', 'ROUTINE',
    'Patient with chronic knee pain. Previous physiotherapy ineffective.',
    'Knee Pain Assessment',
    'Knee X-ray, MRI knee',
    'Paracetamol 500mg as needed',
    'None known',
    'BP: 125/80, HR: 70, Temp: 36.7°C',
    '2024-01-01', 'Patient is a retired teacher. Pain worse with stairs and walking.',
    NOW(), NOW()
);

INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-008',
    '{{PATIENT_ID_3}}', '{{REFERRING_DOCTOR_ID_3}}', '{{REFERRED_DOCTOR_ID_1}}',
    'INTERNAL', 'EXPIRED', 'ROUTINE',
    'Patient with suspicious skin lesion on right forearm.',
    'Skin Lesion Evaluation',
    'Skin biopsy',
    'None',
    'None known',
    'BP: 118/75, HR: 68, Temp: 36.6°C',
    '2024-12-31', 'Patient cancelled due to personal reasons. Will reschedule.',
    NOW(), NOW()
);

-- External Referral with different status
INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    external_doctor_name, external_doctor_speciality, external_facility_name,
    external_facility_address, external_contact_number, external_email,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-009',
    '{{PATIENT_ID_1}}', '{{REFERRING_DOCTOR_ID_2}}',
    'EXTERNAL', 'CANCELLED', 'URGENT',
    'Patient with severe headache and visual disturbances.',
    'Neurological Assessment',
    'CT head, Blood pressure monitoring',
    'Paracetamol 500mg as needed',
    'None known',
    'BP: 160/95, HR: 85, Temp: 37.1°C',
    'Dr. Sarah Lim', 'Neurology', 'National Neuroscience Institute',
    '11 Jalan Tan Tock Seng, Singapore 308433', '+65 6357 7153', 'sarah.lim@nni.com.sg',
    '2024-12-31', 'Patient requested cancellation due to improvement in symptoms.',
    NOW(), NOW()
);

-- Internal Referral with different priority
INSERT INTO referral (
    id, referral_number, patient_id, referring_doctor_id, referred_doctor_id,
    referral_type, status, priority, clinical_summary, reason_for_referral,
    investigations_done, current_medications, allergies, vital_signs,
    expiry_date, notes, created_at, updated_at
) VALUES (
    gen_random_uuid(), 'REF-2024-010',
    '{{PATIENT_ID_3}}', '{{REFERRING_DOCTOR_ID_1}}', '{{REFERRED_DOCTOR_ID_2}}',
    'INTERNAL', 'PENDING', 'EMERGENCY',
    'Patient with acute respiratory distress and fever.',
    'Respiratory Assessment',
    'Chest X-ray, Blood tests, COVID-19 test',
    'None',
    'None known',
    'BP: 95/60, HR: 120, Temp: 39.2°C',
    '2024-12-31', 'Patient requires immediate assessment for possible pneumonia.',
    NOW(), NOW()
);

-- Notes on placeholder replacement:
-- Replace the following placeholders with actual UUIDs from your database:
-- {{PATIENT_ID_1}}, {{PATIENT_ID_2}}, {{PATIENT_ID_3}} - Patient UUIDs
-- {{REFERRING_DOCTOR_ID_1}}, {{REFERRING_DOCTOR_ID_2}}, {{REFERRING_DOCTOR_ID_3}} - Referring Doctor UUIDs
-- {{REFERRED_DOCTOR_ID_1}}, {{REFERRED_DOCTOR_ID_2}}, {{REFERRED_DOCTOR_ID_3}}, {{REFERRED_DOCTOR_ID_4}} - Referred Doctor UUIDs
--
-- Example:
-- '{{PATIENT_ID_1}}' -> '550e8400-e29b-41d4-a716-446655440000'
-- '{{REFERRING_DOCTOR_ID_1}}' -> '550e8400-e29b-41d4-a716-446655440001' 