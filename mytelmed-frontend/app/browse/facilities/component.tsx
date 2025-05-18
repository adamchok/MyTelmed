'use client';

import { Input, Pagination, Select, Empty } from 'antd';
import { BrowseFacilitiesPageComponentProps } from './props';
import { ChangeEvent, RefObject, useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Title from 'antd/es/typography/Title';
import FacilityCard from './components/FacilityCard';
import MapFrame from './components/MapFrame';

const BrowseFacilitiesPageComponent = ({
  search,
  setSearch,
  selectedLocation,
  setSelectedLocation,
  locationOptions,
  selectedType,
  setSelectedType,
  typeOptions,
  paginatedFacilities,
  selectedFacility,
  setSelectedFacility,
  currentPage,
  setCurrentPage,
  userLocation,
  facilitiesPerPage,
  totalFacilitySize,
}: BrowseFacilitiesPageComponentProps) => {
  const topRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const router: AppRouterInstance = useRouter();
  const pathname: string = usePathname();

  const updateUrlParams = useCallback((
    searchVal: string,
    locVal: string | undefined,
    typeVal: string | undefined
  ): void => {
    const params = new URLSearchParams();
    if (searchVal) params.set('search', searchVal);
    if (locVal) params.set('location', locVal);
    if (typeVal) params.set('type', typeVal);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router]);

  const handleSearch = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const newSearch: string = e.target.value;
    setSearch(newSearch);
    updateUrlParams(newSearch, selectedLocation, selectedType);
  }, [setSearch, updateUrlParams, selectedLocation, selectedType]);

  const handleLocationChange = useCallback((value: string): void => {
    setSelectedLocation(value);
    updateUrlParams(search, value, selectedType);
  }, [setSelectedLocation, updateUrlParams, search, selectedType]);

  const handleTypeChange = useCallback((value: string): void => {
    setSelectedType(value);
    updateUrlParams(search, selectedLocation, value);
  }, [setSelectedType, updateUrlParams, search, selectedLocation]);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  return (
    <div ref={topRef}>
      <Title className="text-center md:text-left" level={2}>Browse Clinics & Hospitals</Title>
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row gap-4">
        <Input.Search
          placeholder="Search by name or location"
          value={search}
          onChange={handleSearch}
          className="w-full md:w-72 lg:w-96"
          allowClear
        />
        <Select
          showSearch
          allowClear
          placeholder="Search state or city"
          className="w-full md:w-64 lg:w-72"
          value={selectedLocation}
          onChange={handleLocationChange}
          options={locationOptions}
          filterOption={(input, option) =>
            (option?.label as string).toLowerCase().includes(input.toLowerCase())
          }
        />
        <Select
          allowClear
          placeholder="Filter by type"
          className="w-full md:w-48 lg:w-64"
          value={selectedType}
          onChange={handleTypeChange}
          options={typeOptions}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="space-y-6">
            {paginatedFacilities.length === 0 &&
              <Empty
                className="text-center text-gray-500 py-12"
                description="No clinics or hospitals found."
              />
            }

            {paginatedFacilities.length > 0 && (
              paginatedFacilities.map(facility => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  setSelectedFacility={setSelectedFacility}
                  selectedFacility={selectedFacility}
                  userLocation={userLocation}
                />
              ))
            )}
          </div>

          {totalFacilitySize > facilitiesPerPage && (
            <div className="flex flex-col items-center mt-8 mb-4">
              <Pagination
                current={currentPage}
                total={totalFacilitySize}
                pageSize={facilitiesPerPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        <div className={`${selectedFacility ? 'hidden' : 'hidden lg:block lg:w-1/3'}`}>
          <div className="sticky top-8">
            <MapFrame selectedFacility={selectedFacility} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrowseFacilitiesPageComponent;
