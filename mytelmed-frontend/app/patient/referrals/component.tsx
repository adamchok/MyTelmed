'use client';

import { useState } from 'react';
import {
  Typography,
  Select,
  Input,
  Pagination,
  Empty,
  DatePicker,
  Button,
  Spin,
  Divider
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { ReferralsComponentProps } from './props';
import ReferralCard from './components/ReferralCard';
import ReferralDetailModal from './components/ReferralDetailModal';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ReferralsComponent: React.FC<ReferralsComponentProps> = ({
  referrals,
  filteredReferrals,
  currentPage,
  totalPages,
  itemsPerPage,
  filters,
  statusOptions,
  specialtyOptions,
  searchQuery,
  onSearchChange,
  onFilterChange,
  onPageChange,
  isLoading
}) => {
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Handle view details click
  const handleViewDetails = (referral: any) => {
    setSelectedReferral(referral);
    setModalVisible(true);
  };

  // Handle date range change
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates) {
      onFilterChange({ dateRange: dateStrings });
    } else {
      onFilterChange({ dateRange: undefined });
    }
  };

  // Handle status change
  const handleStatusChange = (values: ('active' | 'expired' | 'used')[]) => {
    onFilterChange({ status: values.length > 0 ? values : undefined });
  };

  // Handle specialty change
  const handleSpecialtyChange = (value: string) => {
    onFilterChange({ specialty: value || undefined });
  };

  // Handle doctor name change
  const handleDoctorNameChange = (value: string) => {
    onFilterChange({ doctorName: value || undefined });
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      status: undefined,
      dateRange: undefined,
      doctorName: undefined,
      specialty: undefined
    });
    onSearchChange('');
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Format page info text
  const getPageInfoText = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, referrals.length);
    return `Showing ${start}-${end} of ${referrals.length} referrals`;
  };

  const hasActiveFilters = () => {
    return Boolean(
      searchQuery ||
      filters.status ||
      filters.dateRange ||
      filters.doctorName ||
      filters.specialty
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row mb-6 items-center justify-between">
        <Title level={2} className="my-0 text-blue-900 dark:text-blue-100">My Referrals</Title>

        <div className="mt-4 md:mt-0 flex gap-2">
          <Button
            icon={<FilterOutlined />}
            onClick={toggleFilters}
            type={showFilters ? "primary" : "default"}
          >
            Filters
          </Button>

          {hasActiveFilters() && (
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search referrals by type, doctor, or clinic..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-4">
            <Divider orientation="left" orientationMargin="0">
              <Text strong><FilterOutlined /> Filter Options</Text>
            </Divider>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <Text strong className="block mb-2">Status</Text>
                <Select
                  mode="multiple"
                  placeholder="Filter by status"
                  onChange={handleStatusChange}
                  value={filters.status || []}
                  style={{ width: '100%' }}
                  options={statusOptions}
                  allowClear
                />
              </div>

              <div>
                <Text strong className="block mb-2">Date Range</Text>
                <RangePicker
                  style={{ width: '100%' }}
                  onChange={handleDateRangeChange}
                  value={filters.dateRange ? [
                    filters.dateRange[0] ? new Date(filters.dateRange[0]) : null,
                    filters.dateRange[1] ? new Date(filters.dateRange[1]) : null
                  ] as any : null}
                  placeholder={['Start Date', 'End Date']}
                />
              </div>

              <div>
                <Text strong className="block mb-2">Referring Doctor</Text>
                <Input
                  placeholder="Doctor name"
                  value={filters.doctorName || ''}
                  onChange={(e) => handleDoctorNameChange(e.target.value)}
                  allowClear
                />
              </div>

              <div>
                <Text strong className="block mb-2">Specialty</Text>
                <Select
                  placeholder="Filter by specialty"
                  onChange={handleSpecialtyChange}
                  value={filters.specialty || undefined}
                  style={{ width: '100%' }}
                  options={specialtyOptions}
                  allowClear
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Referrals List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        {filteredReferrals.length > 0 ? (
          <div>
            {filteredReferrals.map(referral => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                onViewDetails={handleViewDetails}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex flex-col items-center mt-8 mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  {getPageInfoText()}
                </div>
                <Pagination
                  current={currentPage}
                  pageSize={itemsPerPage}
                  total={referrals.length}
                  onChange={onPageChange}
                  showSizeChanger={false}
                  showQuickJumper={referrals.length > itemsPerPage * 3}
                />
              </div>
            )}
          </div>
        ) : (
          <Empty
            description={
              hasActiveFilters()
                ? "No referrals match your filters"
                : "No referrals found"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {hasActiveFilters() && (
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            )}
          </Empty>
        )}
      </div>

      {/* Referral Detail Modal */}
      <ReferralDetailModal
        referral={selectedReferral}
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </div>
  );
};

export default ReferralsComponent; 