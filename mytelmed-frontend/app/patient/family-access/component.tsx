'use client';

import { Input, Button, Modal, Alert, Select, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { FamilyAccessComponentProps } from './props';
import FamilyMembersList from './components/FamilyMembersList';
import FamilyMemberForm from './components/FamilyMemberForm';

const { Option } = Select;

const FamilyAccessPageComponent = ({
  searchQuery,
  handleSearchChange,
  handleAddMember,
  handleEditMember,
  handleDeleteMember,
  isLoading,
  isModalVisible,
  currentMember,
  filteredMembers,
  handleModalCancel,
  handleFormSubmit,
  // Filter props
  relationshipFilter,
  permissionFilters,
  relationshipOptions,
  permissionOptions,
  handleRelationshipFilterChange,
  handlePermissionFilterChange
}: FamilyAccessComponentProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4 text-center">Family Access Management</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 sticky top-0 z-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
            <div className="w-full flex flex-col sm:flex-row gap-2 items-start">
              <Input
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Search by name, email, or relationship"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full sm:w-60"
                allowClear
              />

              <Select
                placeholder="Relationship"
                onChange={handleRelationshipFilterChange}
                value={relationshipFilter}
                style={{ minWidth: '140px' }}
                allowClear
                className="w-full sm:w-auto"
              >
                {relationshipOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>

              <Select
                mode="multiple"
                placeholder="Permissions"
                onChange={handlePermissionFilterChange}
                value={permissionFilters}
                style={{ minWidth: '180px' }}
                allowClear
                className="w-full sm:w-auto flex-grow"
                tagRender={(props) => (
                  <Tag color="blue" closable={props.closable} onClose={props.onClose} style={{ marginRight: 3 }}>
                    {props.label}
                  </Tag>
                )}
              >
                {permissionOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddMember}
              size="middle"
              className="w-full sm:w-auto whitespace-nowrap"
            >
              Add Family Member
            </Button>
          </div>

          <Alert
            message="Shared Access Information"
            description={
              <div>
                <p>Family members you add here will be able to access specific parts of your account based on the permissions you grant them.</p>
                <p>They will receive an email invitation to create their own account linked to yours.</p>
                <p>You can modify or revoke access at any time.</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          {isLoading ? (
            <div className="text-center py-10">Loading family members...</div>
          ) : (
            <FamilyMembersList
              familyMembers={filteredMembers}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          )}
        </div>
      </div>

      <Modal
        open={isModalVisible}
        onCancel={handleModalCancel}
        onClose={handleModalCancel}
        footer={null}
        width={600}
        centered
      >
        <FamilyMemberForm
          initialValues={currentMember}
          onSubmit={handleFormSubmit}
          onCancel={handleModalCancel}
        />
      </Modal>
    </div>
  );
};

export default FamilyAccessPageComponent;
