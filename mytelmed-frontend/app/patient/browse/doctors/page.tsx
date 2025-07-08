'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Doctor, UserLocation } from '@/app/props';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateDummyDoctors } from '@/app/constants/dummy-data/dummyDoctors';
import BrowseDoctorsPageComponent from './component';
import { DateRange, FacilityOption, LocationOption, SpecialtyOption } from './props';

const BrowseDoctorsPage = () => {
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get('facility');
  const router = useRouter();
  const doctorsPerPage = 10;

  // State definitions
  const [search, setSearch] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(facilityParam);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(),
    end: new Date(new Date().setDate(new Date().getDate() + 13))
  });
  const [doctors, setDoctors] = useState<Doctor[]>(generateDummyDoctors(dateRange));
  const [facilityOptions, setFacilityOptions] = useState<FacilityOption[]>([]);
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string | undefined>(facilityParam ?? undefined);
  const [currentDatePage, setCurrentDatePage] = useState<number>(0);

  // Filtered doctors based on search criteria
  const filteredDoctors: Doctor[] = useMemo(() => doctors.filter(doctor => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doctor.facility.name.toLowerCase().includes(search.toLowerCase());

    const matchesLocation = !selectedLocation ||
      `${doctor.facility.city}, ${doctor.facility.state}` === selectedLocation;

    const matchesSpecialty = !selectedSpecialty ||
      doctor.specialty === selectedSpecialty;

    const matchesFacility = !selectedFacility ||
      doctor.facility.name === selectedFacility;

    return matchesSearch && matchesLocation && matchesSpecialty && matchesFacility;
  }), [doctors, search, selectedLocation, selectedSpecialty, selectedFacility]);

  // Generate specialty options from available doctors
  const specialtyOptions: SpecialtyOption[] = useMemo(() => {
    const specialtiesSet = new Set<string>();
    doctors.forEach(doctor => specialtiesSet.add(doctor.specialty));
    return Array.from(specialtiesSet).map(specialty => ({
      label: specialty,
      value: specialty
    }));
  }, [doctors]);

  // Generate location options from available doctors
  const locationOptions: LocationOption[] = useMemo(() => {
    const locationsSet = new Set<string>();
    doctors.forEach(doctor => locationsSet.add(`${doctor.facility.city}, ${doctor.facility.state}`));
    return Array.from(locationsSet).map(location => ({
      label: location,
      value: location,
      type: "city"
    }));
  }, [doctors]);

  // Get paginated doctors for current page
  const paginatedDoctors: Doctor[] = useMemo(() => {
    const startIndex = (currentPage - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;
    return filteredDoctors.slice(startIndex, endIndex);
  }, [filteredDoctors, currentPage, doctorsPerPage]);

  // Handle date range navigation
  const handleDateRangeNavigation = useCallback((direction: 'prev' | 'next') => {
    setDateRange(prevRange => {
      const newStart = new Date(prevRange.start);
      const newEnd = new Date(prevRange.end);

      if (direction === 'prev') {
        newStart.setDate(newStart.getDate() - 14);
        newEnd.setDate(newEnd.getDate() - 14);
        setCurrentDatePage(prev => Math.max(0, prev - 1));
      } else {
        newStart.setDate(newStart.getDate() + 14);
        newEnd.setDate(newEnd.getDate() + 14);
        setCurrentDatePage(prev => prev + 1);
      }

      return { start: newStart, end: newEnd };
    });
  }, []);

  // Handle facility filter change with URL update
  const handleFacilityFilterChange = useCallback((value: string | undefined) => {
    setSelectedFacilityFilter(value);

    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newSearchParams.set('facility', value);
    } else {
      newSearchParams.delete('facility');
    }

    const queryString = newSearchParams.toString();
    const url = '/browse/doctors' + (queryString ? '?' + queryString : '');
    router.push(url);
  }, [searchParams, router]);

  // Format date range for display
  const formatDateRangeDisplay = useCallback(() => {
    if (!paginatedDoctors.length || !paginatedDoctors[0].availability) return 'Select Dates';

    const firstDate = paginatedDoctors[0].availability.find(slot => slot.date)?.date || '';
    const lastDate = [...paginatedDoctors[0].availability].reverse().find(slot => slot.date)?.date || '';

    return firstDate && lastDate ? `${firstDate} - ${lastDate}` : 'Today';
  }, [paginatedDoctors]);

  // Effects
  // Update doctors when date range changes
  useEffect(() => {
    setDoctors(generateDummyDoctors(dateRange));
  }, [dateRange]);

  // Update selected facility when URL parameter changes
  useEffect(() => {
    setSelectedFacility(facilityParam);
    setCurrentPage(1);
  }, [facilityParam]);

  // Update facility options when filtered doctors change
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      const uniqueFacilities = new Set<string>();
      filteredDoctors.forEach(doctor => {
        if (doctor.facility) {
          uniqueFacilities.add(doctor.facility.name);
        }
      });

      setFacilityOptions(Array.from(uniqueFacilities).map(facility => ({
        label: facility,
        value: facility
      })));
    }
  }, [filteredDoctors]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedLocation, selectedSpecialty, selectedFacility]);

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        error => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  return (
    <BrowseDoctorsPageComponent
      search={search}
      setSearch={setSearch}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      locationOptions={locationOptions}
      selectedSpecialty={selectedSpecialty}
      setSelectedSpecialty={setSelectedSpecialty}
      specialtyOptions={specialtyOptions}
      paginatedDoctors={paginatedDoctors}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userLocation={userLocation}
      filteredDoctors={filteredDoctors}
      doctorsPerPage={doctorsPerPage}
      onDateRangeChange={handleDateRangeNavigation}
      onFacilityChange={handleFacilityFilterChange}
      selectedFacilityFilter={selectedFacilityFilter}
      facilityOptions={facilityOptions}
      currentDatePage={currentDatePage}
      getDateRangeDisplay={formatDateRangeDisplay}
    />
  );
}

export default BrowseDoctorsPage;
