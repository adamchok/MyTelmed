"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { message, Spin } from "antd";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { stateAbbreviations, citiesByState } from "@/app/constants/states";
import { Facility, UserLocation } from "@/app/props";
import { FacilityTypeOption, LocationOption } from "./props";
import { facilityTypes } from "@/app/constants/facility-types";
import FacilityApi from "@/app/api/facility";
import BrowseFacilitiesPageComponent from "./component";

const BrowseFacilitiesPage = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedFacility, setSelectedFacility] = useState<Facility | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalFacilitySize, setTotalFacilitySize] = useState<number>(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [paginatedFacilities, setPaginatedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const facilitiesPerPage: number = 10;

  const cityOptions: LocationOption[] = useMemo(() =>
    Object.entries(citiesByState).flatMap(([state, cities]) =>
      cities.map(city => ({
        label: `${city}, ${stateAbbreviations[state]}`,
        value: `${city}, ${stateAbbreviations[state]}`,
        type: "city",
      }))
    ),
    []
  );

  const stateOptions: LocationOption[] = useMemo(() =>
    Object.keys(stateAbbreviations).map(state => ({
      label: `${state.replace(/([A-Z])/g, ' $1').trim()}, ${stateAbbreviations[state]}`,
      value: `${state.replace(/([A-Z])/g, ' $1').trim()}, ${stateAbbreviations[state]}`,
      type: "state",
    })),
    []
  );

  const locationOptions: LocationOption[] = useMemo(() => [
    ...cityOptions,
    ...stateOptions,
  ], [cityOptions, stateOptions]);

  const facilityTypeOptions: FacilityTypeOption[] = useMemo(() =>
    facilityTypes.map((type: string) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    })),
    []
  );

  const findAllFacilities = useCallback(async () => {
    const { data } = await FacilityApi.findAllFacilities({
      page: currentPage - 1
    });
    setPaginatedFacilities(data?.content ?? []);
    setTotalFacilitySize(data?.totalElements ?? 0);
  }, [currentPage]);

  const filterFacilities = useCallback((facilities: Facility[]): Facility[] => {
    return facilities.filter(facility => {
      const matchesSearch =
        facility.name.toLowerCase().includes(search.toLowerCase()) ||
        facility.address.toLowerCase().includes(search.toLowerCase());
      const matchesLocation =
        !selectedLocation ||
        facility.state.toLowerCase() === selectedLocation.toLowerCase() ||
        facility.city.toLowerCase() === selectedLocation.toLowerCase();
      const matchesType = !selectedType || facility.type.toLowerCase() === selectedType.toLowerCase();
      return matchesSearch && matchesLocation && matchesType;
    });
  }, [search, selectedLocation, selectedType]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const locationFromUrl = searchParams.get("location");
    const typeFromUrl = searchParams.get("type");

    if (searchFromUrl) setSearch(searchFromUrl);
    if (locationFromUrl) setSelectedLocation(locationFromUrl);
    if (typeFromUrl) setSelectedType(typeFromUrl);
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    findAllFacilities()
      .catch((error) => {
        message.error("Failed to fetch facilities.");
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentPage]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setUserLocation(null);
          console.log(error);
        }
      );
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedLocation, selectedType]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-200">
      <Spin size="large" tip="Loading facilities..." />
    </div>
  );

  return (
    <BrowseFacilitiesPageComponent
      search={search}
      setSearch={setSearch}
      selectedLocation={selectedLocation}
      setSelectedLocation={setSelectedLocation}
      locationOptions={locationOptions}
      selectedType={selectedType}
      setSelectedType={setSelectedType}
      typeOptions={facilityTypeOptions}
      paginatedFacilities={filterFacilities(paginatedFacilities)}
      totalFacilitySize={totalFacilitySize}
      facilitiesPerPage={facilitiesPerPage}
      selectedFacility={selectedFacility}
      setSelectedFacility={setSelectedFacility}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userLocation={userLocation}
    />
  );
}

export default BrowseFacilitiesPage;
