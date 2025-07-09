"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { message, Spin } from "antd";
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation";
import { stateAbbreviations, citiesByState } from "@/app/constants/states";
import { Facility } from "@/app/api/facility/props";
import { FacilityTypeOption, LocationOption, UserLocation } from "./props";
import { facilityTypes } from "@/app/constants/facility-types";
import FacilityApi from "@/app/api/facility";
import BrowseFacilitiesPageComponent from "./component";

const BrowseFacilitiesPage = () => {
  const [search, setSearch] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<
    string | undefined
  >();
  const [selectedType, setSelectedType] = useState<string | undefined>();
  const [selectedFacility, setSelectedFacility] = useState<
    Facility | undefined
  >(undefined);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const searchParams: ReadonlyURLSearchParams = useSearchParams();
  const facilitiesPerPage: number = 10;

  const cityOptions: LocationOption[] = useMemo(
    () =>
      Object.entries(citiesByState).flatMap(([state, cities]) =>
        (cities as string[]).map((city: string) => ({
          label: `${city}, ${stateAbbreviations[state]}`,
          value: `${city}, ${stateAbbreviations[state]}`,
          type: "city",
        }))
      ),
    []
  );

  const stateOptions: LocationOption[] = useMemo(
    () =>
      Object.keys(stateAbbreviations).map((state) => ({
        label: `${state.replace(/([A-Z])/g, " $1").trim()}, ${stateAbbreviations[state]
          }`,
        value: `${state.replace(/([A-Z])/g, " $1").trim()}, ${stateAbbreviations[state]
          }`,
        type: "state",
      })),
    []
  );

  const locationOptions: LocationOption[] = useMemo(
    () => [...cityOptions, ...stateOptions],
    [cityOptions, stateOptions]
  );

  const facilityTypeOptions: FacilityTypeOption[] = useMemo(
    () =>
      facilityTypes.map((type: string) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, " "),
        value: type,
      })),
    []
  );

  const findAllFacilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await FacilityApi.findFacilities({
        page: currentPage - 1,
      });

      if (response.data?.isSuccess) {
        const facilitiesData = response.data.data;
        if (Array.isArray(facilitiesData)) {
          // If response is just an array
          setAllFacilities(facilitiesData);
        } else if (facilitiesData && "content" in facilitiesData) {
          // If response is paginated
          setAllFacilities(facilitiesData.content || []);
        }
      } else {
        message.error("Failed to fetch facilities");
        setAllFacilities([]);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      message.error("Failed to fetch facilities");
      setAllFacilities([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const filterFacilities = useCallback(
    (facilities: Facility[]): Facility[] => {
      return facilities.filter((facility) => {
        const matchesSearch =
          facility.name.toLowerCase().includes(search.toLowerCase()) ||
          facility.address.toLowerCase().includes(search.toLowerCase());
        const matchesLocation =
          !selectedLocation ||
          facility.state.toLowerCase() === selectedLocation.toLowerCase() ||
          facility.city.toLowerCase() === selectedLocation.toLowerCase();
        const matchesType =
          !selectedType ||
          facility.facilityType.toLowerCase() === selectedType.toLowerCase();
        return matchesSearch && matchesLocation && matchesType;
      });
    },
    [search, selectedLocation, selectedType]
  );

  // Paginate filtered facilities for client-side filtering
  const filteredFacilities = useMemo(() => {
    const filtered = filterFacilities(allFacilities);
    const startIndex = (currentPage - 1) * facilitiesPerPage;
    const endIndex = startIndex + facilitiesPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filterFacilities, allFacilities, currentPage, facilitiesPerPage]);

  const filteredTotalSize = useMemo(() => {
    return filterFacilities(allFacilities).length;
  }, [filterFacilities, allFacilities]);

  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    const locationFromUrl = searchParams.get("location");
    const typeFromUrl = searchParams.get("type");

    if (searchFromUrl) setSearch(searchFromUrl);
    if (locationFromUrl) setSelectedLocation(locationFromUrl);
    if (typeFromUrl) setSelectedType(typeFromUrl);
  }, [searchParams]);

  useEffect(() => {
    findAllFacilities();
  }, [findAllFacilities]);

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

  if (loading)
    return (
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
      paginatedFacilities={filteredFacilities}
      totalFacilitySize={filteredTotalSize}
      facilitiesPerPage={facilitiesPerPage}
      selectedFacility={selectedFacility}
      setSelectedFacility={setSelectedFacility}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      userLocation={userLocation}
    />
  );
};

export default BrowseFacilitiesPage;
