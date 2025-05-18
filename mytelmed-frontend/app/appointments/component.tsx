'use client';

import { useState } from 'react';
import { Tabs, Typography, Pagination, Empty, Select, DatePicker, Input, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { AppointmentComponentProps } from './props';
import AppointmentCard from './components/AppointmentCard';
import RescheduleModal from './components/RescheduleModal';
import AppointmentDetailsModal from './components/AppointmentDetailsModal';
import ShareAppointmentModal from './components/ShareAppointmentModal';
import { Appointment } from '../props';

const { Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AppointmentManagementComponent: React.FC<AppointmentComponentProps> = ({
  upcomingAppointments,
  pastAppointments,
  upcomingCurrentPage,
  upcomingTotalPages,
  pastCurrentPage,
  pastTotalPages,
  filters,
  statusOptions,
  patientOptions,
  searchQuery,
  onSearchChange,
  onCancelAppointment,
  onRescheduleAppointment,
  onUpdateAppointmentDetails,
  onAddDocument,
  onRemoveDocument,
  onShareAppointment,
  onUpcomingPageChange,
  onPastPageChange,
  onFilterChange,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Generate some dummy available time slots for the reschedule modal
  const availableTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleShareClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowShareModal(true);
    if (onShareAppointment) {
      onShareAppointment(appointment);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleStatusFilterChange = (values: string[]) => {
    onFilterChange({ status: values as any[] });
  };

  const handlePatientFilterChange = (value: string | undefined) => {
    onFilterChange({ patientId: value });
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      const dateRange: [string, string] = [
        dates[0].format('YYYY-MM-DD'),
        dates[1].format('YYYY-MM-DD')
      ];
      onFilterChange({ dateRange });
    } else {
      onFilterChange({ dateRange: undefined });
    }
  };

  const renderEmptyState = () => (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <Text>
          {activeTab === 'upcoming'
            ? "You don't have any upcoming appointments"
            : "You don't have any past appointments"}
        </Text>
      }
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4 text-center">
          My Appointments
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 sticky top-0 z-20">
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab="Upcoming Appointments" key="upcoming">
              <div className="mb-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Search by doctor name or facility"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full"
                    allowClear
                  />

                  <Space wrap className="w-full lg:flex-grow">
                    <Select
                      placeholder="Patient"
                      onChange={handlePatientFilterChange}
                      value={filters.patientId}
                      style={{ minWidth: '140px' }}
                      allowClear
                    >
                      {patientOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">Loading appointments...</div>
              ) : upcomingAppointments.length === 0 ? (
                renderEmptyState()
              ) : (
                <div>
                  {upcomingAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={onCancelAppointment}
                      onReschedule={handleRescheduleClick}
                      onUpdateDetails={handleDetailsClick}
                      onShare={handleShareClick}
                      showActions={true}
                    />
                  ))}

                  {upcomingTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        current={upcomingCurrentPage}
                        total={upcomingTotalPages * 10}
                        onChange={onUpcomingPageChange}
                        showSizeChanger={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabPane>

            <TabPane tab="Past Appointments" key="past">
              <div className="mb-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                  <Input
                    prefix={<SearchOutlined className="text-gray-400" />}
                    placeholder="Search by doctor name or facility"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full lg:w-60"
                    allowClear
                  />

                  <Space wrap className="w-full lg:flex-grow">
                    <Select
                      mode="multiple"
                      placeholder="Status"
                      onChange={handleStatusFilterChange}
                      value={filters.status as string[]}
                      style={{ minWidth: '140px' }}
                      allowClear
                    >
                      {statusOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>

                    <Select
                      placeholder="Patient"
                      onChange={handlePatientFilterChange}
                      value={filters.patientId}
                      style={{ minWidth: '140px' }}
                      allowClear
                    >
                      {patientOptions.map(option => (
                        <Option key={option.value} value={option.value}>
                          {option.label}
                        </Option>
                      ))}
                    </Select>

                    <RangePicker
                      onChange={handleDateRangeChange}
                      value={filters.dateRange ? [
                        dayjs(filters.dateRange[0]),
                        dayjs(filters.dateRange[1])
                      ] : undefined}
                      allowClear
                    />
                  </Space>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">Loading appointments...</div>
              ) : pastAppointments.length === 0 ? (
                renderEmptyState()
              ) : (
                <div>
                  {pastAppointments.map(appointment => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onCancel={onCancelAppointment}
                      onReschedule={handleRescheduleClick}
                      onUpdateDetails={handleDetailsClick}
                      onShare={handleShareClick}
                      showActions={false}
                    />
                  ))}

                  {pastTotalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination
                        current={pastCurrentPage}
                        total={pastTotalPages * 10}
                        onChange={onPastPageChange}
                        showSizeChanger={false}
                      />
                    </div>
                  )}
                </div>
              )}
            </TabPane>
          </Tabs>
        </div>

        {/* Modals */}
        <RescheduleModal
          appointment={selectedAppointment}
          isVisible={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          onReschedule={onRescheduleAppointment}
          availableTimes={availableTimes}
        />

        <AppointmentDetailsModal
          appointment={selectedAppointment}
          isVisible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onUpdateDetails={onUpdateAppointmentDetails}
          onAddDocument={onAddDocument}
          onRemoveDocument={onRemoveDocument}
        />

        <ShareAppointmentModal
          appointment={selectedAppointment}
          isVisible={showShareModal}
          onClose={() => setShowShareModal(false)}
        />
      </div>
    </div>
  );
};

export default AppointmentManagementComponent; 