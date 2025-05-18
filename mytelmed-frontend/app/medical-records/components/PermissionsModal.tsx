'use client';

import { useState, useEffect } from 'react';
import { Modal, Typography, Switch, Card, Button, Divider, Tabs, List, Avatar } from 'antd';
import { PermissionsModalProps, MedicalRecordPermission } from '../props';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import dummyFamilyMembers from '@/app/constants/dummy-data/dummyFamilyMembers';
import { FamilyMember } from '@/app/props';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface SharedPersonPermission {
  personId: string;
  personName: string;
  permissions: {
    read: boolean;
    edit: boolean;
    download: boolean;
  };
}

const PermissionsModal: React.FC<PermissionsModalProps> = ({
  record,
  isVisible,
  onClose,
  onUpdatePermissions
}) => {
  const [activeTab, setActiveTab] = useState('1');
  const [globalPermissions, setGlobalPermissions] = useState({ ...record.permissions });
  const [sharedPeoplePermissions, setSharedPeoplePermissions] = useState<SharedPersonPermission[]>([]);

  // Update permissions when record changes
  useEffect(() => {
    setGlobalPermissions({ ...record.permissions });

    // Initialize shared people permissions based on sharedWith list
    const initialSharedPeople = record.sharedWith.map(personId => {
      const person = dummyFamilyMembers.find(m => m.id === personId);
      return {
        personId,
        personName: person?.name || 'Unknown',
        permissions: {
          read: true, // Default permissions for shared people
          edit: false,
          download: true
        }
      };
    });

    setSharedPeoplePermissions(initialSharedPeople);
  }, [record]);

  // Handle global permission change
  const handleGlobalPermissionChange = (permission: MedicalRecordPermission, value: boolean) => {
    setGlobalPermissions(prev => ({
      ...prev,
      [permission]: value
    }));
  };

  // Handle person-specific permission change
  const handlePersonPermissionChange = (personId: string, permission: string, value: boolean) => {
    setSharedPeoplePermissions(prev =>
      prev.map(person =>
        person.personId === personId
          ? {
            ...person,
            permissions: {
              ...person.permissions,
              [permission]: value
            }
          }
          : person
      )
    );
  };

  // Handle save
  const handleSave = () => {
    // In a real app, you would also save the per-person permissions to the API
    onUpdatePermissions(record.id, globalPermissions);
  };

  // Remove person from shared list
  const handleRemovePerson = (personId: string) => {
    setSharedPeoplePermissions(prev => prev.filter(p => p.personId !== personId));
  };

  // Get person details from shared ID
  const getPersonDetails = (personId: string): FamilyMember | undefined => {
    return dummyFamilyMembers.find(m => m.id === personId);
  };

  // System-generated records have some fixed permissions
  const isSystemGenerated = record.category === 'system';

  return (
    <Modal
      title={<Title level={4} className="my-0">Manage Permissions</Title>}
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save Changes
        </Button>
      ]}
      width={600}
      centered
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <TeamOutlined /> Document Permissions
            </span>
          }
          key="1"
        >
          <div className="mb-4">
            <Text>Control who can access, edit, and share this document. {isSystemGenerated && 'Some permissions are fixed for system-generated records.'}</Text>
          </div>

          <div className="space-y-4">
            <Card className="w-full shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Read Access</h3>
                  <p className="text-sm text-gray-500">Allow viewing this document</p>
                </div>
                <Switch
                  checked={globalPermissions.read}
                  onChange={(checked) => handleGlobalPermissionChange('read', checked)}
                  disabled={isSystemGenerated} // System-generated records must be readable
                />
              </div>
            </Card>

            <Card className="w-full shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Edit Access</h3>
                  <p className="text-sm text-gray-500">Allow modifying this document</p>
                </div>
                <Switch
                  checked={globalPermissions.edit}
                  onChange={(checked) => handleGlobalPermissionChange('edit', checked)}
                  disabled={isSystemGenerated} // System-generated records cannot be edited
                />
              </div>
            </Card>

            <Card className="w-full shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Download Access</h3>
                  <p className="text-sm text-gray-500">Allow downloading this document</p>
                </div>
                <Switch
                  checked={globalPermissions.download}
                  onChange={(checked) => handleGlobalPermissionChange('download', checked)}
                />
              </div>
            </Card>

            <Card className="w-full shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium">Share Access</h3>
                  <p className="text-sm text-gray-500">Allow sharing this document with family members</p>
                </div>
                <Switch
                  checked={globalPermissions.share}
                  onChange={(checked) => handleGlobalPermissionChange('share', checked)}
                />
              </div>
            </Card>
          </div>
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserOutlined /> Individual Access
            </span>
          }
          key="2"
        >
          <div className="mb-4">
            <Text>Manage permissions for specific people you&apos;ve shared this document with.</Text>
          </div>

          {sharedPeoplePermissions.length === 0 ? (
            <Card className="text-center py-6">
              <Text type="secondary">No one has been given access to this document yet.</Text>
            </Card>
          ) : (
            <List
              dataSource={sharedPeoplePermissions}
              renderItem={person => {
                const familyMember = getPersonDetails(person.personId);
                return (
                  <List.Item>
                    <Card className="w-full">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
                        <div className="flex items-center mb-3 sm:mb-0">
                          <Avatar
                            src={familyMember?.profileImage}
                            icon={!familyMember?.profileImage && <UserOutlined />}
                            className="mr-3"
                          />
                          <div>
                            <Text strong>{person.personName}</Text>
                            {familyMember && (
                              <div className="text-xs text-gray-500">{familyMember.relationship}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Text>Read</Text>
                            <Switch
                              size="small"
                              checked={person.permissions.read}
                              onChange={(checked) => handlePersonPermissionChange(person.personId, 'read', checked)}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Text>Edit</Text>
                            <Switch
                              size="small"
                              checked={person.permissions.edit}
                              onChange={(checked) => handlePersonPermissionChange(person.personId, 'edit', checked)}
                              disabled={isSystemGenerated}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Text>Download</Text>
                            <Switch
                              size="small"
                              checked={person.permissions.download}
                              onChange={(checked) => handlePersonPermissionChange(person.personId, 'download', checked)}
                            />
                          </div>
                          <Button
                            size="small"
                            danger
                            onClick={() => handleRemovePerson(person.personId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </TabPane>
      </Tabs>

      <Divider />

      <div className="text-sm text-gray-500">
        <p>Note: Changes to permissions affect who can access and interact with this document.</p>
      </div>
    </Modal>
  );
};

export default PermissionsModal; 