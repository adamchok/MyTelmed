'use client';

import { Button, Input, Pagination, Select } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { BrowseDoctorsPageComponentProps } from './props';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import DoctorCard from '@/app/components/DoctorCard/DoctorCard';

const BrowseDoctorsPageComponent = ({
  search,
  setSearch,
  selectedLocation,
  setSelectedLocation,
  locationOptions,
  selectedSpecialty,
  setSelectedSpecialty,
  specialtyOptions,
  paginatedDoctors,
  currentPage,
  setCurrentPage,
  userLocation,
  filteredDoctors,
  doctorsPerPage,
  onDateRangeChange,
  onFacilityChange,
  selectedFacilityFilter,
  facilityOptions,
  currentDatePage,
  getDateRangeDisplay
}: BrowseDoctorsPageComponentProps) => {
  const topRef = useRef<HTMLDivElement>(null);

  // Handle input search change
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, [setSearch]);

  // Handle date range navigation backward
  const navigateDateRangePrev = useCallback(() => {
    onDateRangeChange('prev');
  }, [onDateRangeChange]);

  // Handle date range navigation forward
  const navigateDateRangeNext = useCallback(() => {
    onDateRangeChange('next');
  }, [onDateRangeChange]);

  // Handle pagination change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  // Format text for pagination display
  const paginationSummary = useMemo(() => {
    const start = Math.min((currentPage - 1) * doctorsPerPage + 1, filteredDoctors.length);
    const end = Math.min(currentPage * doctorsPerPage, filteredDoctors.length);
    return `Showing ${start} - ${end} of ${filteredDoctors.length} doctors`;
  }, [currentPage, doctorsPerPage, filteredDoctors.length]);

  return (
    <div ref={topRef} className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-4 text-center">Browse Doctors</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 sticky top-0 z-20 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Input.Search
              placeholder="Search by name, hospital, or specialty"
              value={search}
              onChange={handleSearchInputChange}
              className="w-full md:w-72"
              allowClear
            />
            <Select
              showSearch
              allowClear
              placeholder="Search state or city"
              className="w-full md:w-64"
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={locationOptions}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
            <Select
              showSearch
              allowClear
              placeholder="Filter by hospital"
              className="w-full md:w-72"
              value={selectedFacilityFilter}
              onChange={onFacilityChange}
              options={facilityOptions}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
            <Select
              showSearch
              allowClear
              placeholder="Filter by specialty"
              className="w-full md:w-64"
              value={selectedSpecialty}
              onChange={setSelectedSpecialty}
              options={specialtyOptions}
              filterOption={(input, option) =>
                (option?.label as string).toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>
          <div className="flex items-center justify-center border-t border-gray-200 pt-4 mt-2">
            <div className="flex items-center space-x-4">
              <Button
                onClick={navigateDateRangePrev}
                className="text-gray-500 hover:text-blue-600 focus:outline-none bg-transparent border-none"
                disabled={currentDatePage === 0}
              >
                <LeftOutlined className="text-lg" />
              </Button>
              <span className="text-sm font-medium">{getDateRangeDisplay ? getDateRangeDisplay() : ''}</span>
              <Button
                onClick={navigateDateRangeNext}
                className="text-gray-500 hover:text-blue-600 focus:outline-none bg-transparent border-none"
              >
                <RightOutlined className="text-lg" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="space-y-6">
              {paginatedDoctors.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">No doctors found.</div>
              ) : (
                paginatedDoctors.map(doctor => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    userLocation={userLocation}
                  />
                ))
              )}
            </div>
            {filteredDoctors.length > doctorsPerPage && (
              <div className="flex flex-col items-center mt-8 mb-4">
                <div className="text-sm text-gray-600 mb-2">
                  {paginationSummary}
                </div>
                <Pagination
                  current={currentPage}
                  pageSize={doctorsPerPage}
                  total={filteredDoctors.length}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper={filteredDoctors.length > doctorsPerPage * 3}
                  showTotal={() => ``}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowseDoctorsPageComponent;
