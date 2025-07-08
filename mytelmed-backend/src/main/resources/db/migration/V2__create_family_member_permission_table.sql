-- Create family member permission table
CREATE TABLE family_member_permission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_member_id UUID NOT NULL,
    permission_type VARCHAR(50) NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT FALSE,
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_family_member_permission_family_member 
        FOREIGN KEY (family_member_id) REFERENCES family_member(id) ON DELETE CASCADE,
    CONSTRAINT uk_family_member_permission_unique 
        UNIQUE (family_member_id, permission_type)
);

-- Create indexes for better performance
CREATE INDEX idx_family_member_permission_family_member_id ON family_member_permission(family_member_id);
CREATE INDEX idx_family_member_permission_type ON family_member_permission(permission_type);
CREATE INDEX idx_family_member_permission_granted ON family_member_permission(is_granted);
CREATE INDEX idx_family_member_permission_expiry ON family_member_permission(expiry_date);

-- Insert default permissions for existing family members (if any)
-- This gives basic view permissions to existing family members
INSERT INTO family_member_permission (family_member_id, permission_type, is_granted)
SELECT id, 'VIEW_APPOINTMENT', true FROM family_member WHERE pending = false
ON CONFLICT (family_member_id, permission_type) DO NOTHING;

INSERT INTO family_member_permission (family_member_id, permission_type, is_granted)
SELECT id, 'VIEW_DOCUMENTS', true FROM family_member WHERE pending = false
ON CONFLICT (family_member_id, permission_type) DO NOTHING;

-- Add comment to document what each permission type allows
COMMENT ON TABLE family_member_permission IS 'Stores granular permissions for family members to access patient data';
COMMENT ON COLUMN family_member_permission.permission_type IS 'Type of permission: BOOK_APPOINTMENT, CANCEL_APPOINTMENT, VIEW_APPOINTMENT, JOIN_VIDEO_CALL, VIEW_DOCUMENTS, ATTACH_DOCUMENTS, VIEW_REFERRALS, MANAGE_FAMILY_MEMBERS';
COMMENT ON COLUMN family_member_permission.is_granted IS 'Whether the permission is currently granted';
COMMENT ON COLUMN family_member_permission.expiry_date IS 'Optional expiry date for the permission';
COMMENT ON COLUMN family_member_permission.notes IS 'Optional notes about the permission grant/revoke'; 