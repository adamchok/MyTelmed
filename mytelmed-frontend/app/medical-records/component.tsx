'use client';

import { useState } from 'react';
import {
  Tabs,
  Typography,
  Pagination,
  Empty,
  Select,
  Input,
  Button,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { MedicalRecordsComponentProps, MedicalRecordType } from './props';
import RecordCard from './components/RecordCard';
import RecordUpload from './components/RecordUpload';
import PermissionsModal from './components/PermissionsModal';
import ShareRecordModal from './components/ShareRecordModal';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const MedicalRecordsComponent: React.FC<MedicalRecordsComponentProps> = ({
  medicalRecords,
  filteredRecords,
  currentPage,
  totalPages,
  itemsPerPage,
  selectedType,
  selectedCategory,
  searchQuery,
  onUploadRecord,
  onDeleteRecord,
  onUpdateRecord,
  onUpdatePermissions,
  onShareRecord,
  onTypeChange,
  onCategoryChange,
  onSearchChange,
  onPageChange,
  isLoading,
  familyMembers
}) => {
  const [activeTab, setActiveTab] = useState<MedicalRecordType | 'all'>('all');
  const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key as MedicalRecordType | 'all');
    onTypeChange(key as MedicalRecordType | 'all');
  };

  // Show permissions modal
  const showPermissionsModal = (record: any) => {
    setSelectedRecord(record);
    setPermissionsModalVisible(true);
  };

  // Show share modal
  const showShareModal = (record: any) => {
    setSelectedRecord(record);
    setShareModalVisible(true);
  };

  // Handle permissions update
  const handlePermissionsUpdate = (recordId: string, permissions: any) => {
    onUpdatePermissions(recordId, permissions);
    setPermissionsModalVisible(false);
  };

  // Handle share update
  const handleShare = (recordId: string, familyMemberIds: string[]) => {
    onShareRecord(recordId, familyMemberIds);
    setShareModalVisible(false);
  };

  // Handle showing upload modal
  const showUploadModal = () => {
    setUploadModalVisible(true);
  };

  // Render empty state
  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span>
          No {activeTab === 'all' ? 'records' : activeTab === 'medical_report' ? 'medical reports' : 'prescriptions'} found
        </span>
      }
    />
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex mb-6 items-center justify-center w-full">
        <Title level={2} className="my-0 text-3xl font-bold text-blue-900 dark:text-blue-100">Medical Records</Title>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-grow">
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              className="w-full"
            />
          </div>

          <Select
            placeholder="Record Type"
            value={selectedType}
            onChange={onTypeChange}
            style={{ minWidth: '150px' }}
            allowClear
          >
            <Option value="all">All Types</Option>
            <Option value="medical_report">Medical Report</Option>
            <Option value="prescription">Prescriptions</Option>
          </Select>

          <Select
            placeholder="Category"
            value={selectedCategory}
            onChange={onCategoryChange}
            style={{ minWidth: '150px' }}
            allowClear
          >
            <Option value="all">All Categories</Option>
            <Option value="system">System Generated</Option>
            <Option value="self-uploaded">Self-Uploaded</Option>
          </Select>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showUploadModal}
          >
            Upload
          </Button>
        </div>
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="mb-4">
          <TabPane tab="All Records" key="all">
            {isLoading ? (
              <div className="text-center py-10">Loading records...</div>
            ) : filteredRecords.length === 0 ? (
              renderEmptyState()
            ) : (
              <div>
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onDelete={onDeleteRecord}
                      onUpdate={onUpdateRecord}
                      onUpdatePermissions={() => showPermissionsModal(record)}
                      onShare={() => showShareModal(record)}
                      editable={record.category === 'self-uploaded'}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center mt-8 mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, medicalRecords.length)} - {Math.min(currentPage * itemsPerPage, medicalRecords.length)} of {medicalRecords.length} records
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={itemsPerPage}
                      total={medicalRecords.length}
                      onChange={onPageChange}
                      showSizeChanger={false}
                      showQuickJumper={medicalRecords.length > itemsPerPage * 3}
                      showTotal={() => ``}
                    />
                  </div>
                )}
              </div>
            )}
          </TabPane>

          <TabPane tab="Medical Reports" key="medical_report">
            {isLoading ? (
              <div className="text-center py-10">Loading medical reports...</div>
            ) : filteredRecords.length === 0 ? (
              renderEmptyState()
            ) : (
              <div>
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onDelete={onDeleteRecord}
                      onUpdate={onUpdateRecord}
                      onUpdatePermissions={() => showPermissionsModal(record)}
                      onShare={() => showShareModal(record)}
                      editable={record.category === 'self-uploaded'}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center mt-8 mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, medicalRecords.length)} - {Math.min(currentPage * itemsPerPage, medicalRecords.length)} of {medicalRecords.length} records
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={itemsPerPage}
                      total={medicalRecords.length}
                      onChange={onPageChange}
                      showSizeChanger={false}
                      showQuickJumper={medicalRecords.length > itemsPerPage * 3}
                      showTotal={() => ``}
                    />
                  </div>
                )}
              </div>
            )}
          </TabPane>

          <TabPane tab="Prescriptions" key="prescription">
            {isLoading ? (
              <div className="text-center py-10">Loading prescriptions...</div>
            ) : filteredRecords.length === 0 ? (
              renderEmptyState()
            ) : (
              <div>
                <div className="space-y-4">
                  {filteredRecords.map(record => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onDelete={onDeleteRecord}
                      onUpdate={onUpdateRecord}
                      onUpdatePermissions={() => showPermissionsModal(record)}
                      onShare={() => showShareModal(record)}
                      editable={record.category === 'self-uploaded'}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center mt-8 mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, medicalRecords.length)} - {Math.min(currentPage * itemsPerPage, medicalRecords.length)} of {medicalRecords.length} records
                    </div>
                    <Pagination
                      current={currentPage}
                      pageSize={itemsPerPage}
                      total={medicalRecords.length}
                      onChange={onPageChange}
                      showSizeChanger={false}
                      showQuickJumper={medicalRecords.length > itemsPerPage * 3}
                      showTotal={() => ``}
                    />
                  </div>
                )}
              </div>
            )}
          </TabPane>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedRecord && (
        <>
          <PermissionsModal
            record={selectedRecord}
            isVisible={permissionsModalVisible}
            onClose={() => setPermissionsModalVisible(false)}
            onUpdatePermissions={handlePermissionsUpdate}
          />

          <ShareRecordModal
            record={selectedRecord}
            familyMembers={familyMembers}
            isVisible={shareModalVisible}
            onClose={() => setShareModalVisible(false)}
            onShare={handleShare}
          />
        </>
      )}

      <RecordUpload
        onUpload={onUploadRecord}
        recordType={activeTab === 'all' ? 'medical_report' : activeTab as MedicalRecordType}
        isVisible={uploadModalVisible}
        onVisibleChange={setUploadModalVisible}
      />
    </div>
  );
};

export default MedicalRecordsComponent;
