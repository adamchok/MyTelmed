-- Add can_attach column to document_access table
ALTER TABLE document_access ADD COLUMN can_attach BOOLEAN NOT NULL DEFAULT FALSE;

-- Update existing records to have can_attach = true for documents owned by patients
-- This ensures existing documents can be attached to appointments
UPDATE document_access 
SET can_attach = true 
WHERE document_id IN (
    SELECT d.id 
    FROM document d 
    INNER JOIN patient p ON d.patient_id = p.id 
    INNER JOIN account a ON p.account_id = a.id
) 
AND permitted_account_id IN (
    SELECT p.account_id 
    FROM patient p 
    INNER JOIN document d ON p.id = d.patient_id
    WHERE d.id = document_access.document_id
); 