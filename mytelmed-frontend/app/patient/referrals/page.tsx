"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReferralApi from "@/app/api/referral";
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import { ReferralsFilterOptions, PatientOption } from "./props";
import ReferralsComponent from "./component";
import { useFamilyPermissions } from "@/app/hooks/useFamilyPermissions";

const ITEMS_PER_PAGE = 10;

const ReferralsPage = () => {
    // Family permissions hook
    const {
        getAuthorizedPatientsForMedicalRecords, // Using medical records permission for referrals
        getPatientOption,
        currentPatient,
        loading: familyLoading
    } = useFamilyPermissions();

    const [referrals, setReferrals] = useState<ReferralDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<ReferralsFilterOptions>({});

    // Patient selection state
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");

    // Get patient options from hook
    const getPatientOptions = (): PatientOption[] => {
        const authorizedPatients = getAuthorizedPatientsForMedicalRecords();
        return authorizedPatients.map(patient => {
            const option = getPatientOption(patient.id);
            return {
                id: patient.id,
                name: option?.name || patient.name,
                relationship: option?.relationship || "Unknown",
                canViewReferrals: true, // Already filtered by hook
            };
        });
    };

    // Set default patient selection when hook loads
    useEffect(() => {
        if (!familyLoading && currentPatient && !selectedPatientId) {
            setSelectedPatientId(currentPatient.id);
        }
    }, [familyLoading, currentPatient, selectedPatientId]);

    // Fetch referrals for selected patient
    const fetchReferrals = useCallback(async () => {
        if (!selectedPatientId) return;

        try {
            setIsLoading(true);
            setError(null);

            // Fetch referrals using selected patient ID
            const referralsResponse = await ReferralApi.getReferralsByPatient(selectedPatientId, {
                page: currentPage - 1, // API uses 0-based pagination
                size: ITEMS_PER_PAGE,
            });

            if (referralsResponse.data?.isSuccess && referralsResponse.data.data) {
                const paginatedData = referralsResponse.data.data;
                setReferrals(paginatedData.content);
                setTotalItems(paginatedData.totalElements);
            } else {
                setError("Failed to load referrals");
            }
        } catch (err: any) {
            console.error("Failed to fetch referrals:", err);
            setError(err.response?.data?.message || "Failed to load referrals. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [selectedPatientId, currentPage]);

    // Fetch referrals when patient selection or pagination changes
    useEffect(() => {
        if (selectedPatientId) {
            fetchReferrals();
        }
    }, [fetchReferrals, selectedPatientId]);

    // Define status options
    const statusOptions = [
        { label: "Pending", value: ReferralStatus.PENDING },
        { label: "Accepted", value: ReferralStatus.ACCEPTED },
        { label: "Rejected", value: ReferralStatus.REJECTED },
        { label: "Scheduled", value: ReferralStatus.SCHEDULED },
        { label: "Completed", value: ReferralStatus.COMPLETED },
        { label: "Expired", value: ReferralStatus.EXPIRED },
        { label: "Cancelled", value: ReferralStatus.CANCELLED },
    ];

    // Define priority options
    const priorityOptions = [
        { label: "Routine", value: ReferralPriority.ROUTINE },
        { label: "Urgent", value: ReferralPriority.URGENT },
        { label: "Emergency", value: ReferralPriority.EMERGENCY },
    ];

    // Define referral type options
    const referralTypeOptions = [
        { label: "Internal", value: ReferralType.INTERNAL },
        { label: "External", value: ReferralType.EXTERNAL },
    ];

    // Get unique specialties from referrals
    const specialtyOptions = useMemo(() => {
        const specialties = new Set<string>();

        referrals.forEach((referral) => {
            if (referral.referralType === ReferralType.INTERNAL && referral.referringDoctor.specialityList) {
                referral.referringDoctor.specialityList.forEach((specialty) => {
                    specialties.add(specialty);
                });
            } else if (referral.referralType === ReferralType.EXTERNAL && referral.externalDoctorSpeciality) {
                specialties.add(referral.externalDoctorSpeciality);
            }
        });

        return Array.from(specialties).map((specialty) => ({
            label: specialty,
            value: specialty,
        }));
    }, [referrals]);

    // Helper functions for filtering
    const matchesSearchQuery = useCallback(
        (referral: ReferralDto) => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                referral.reasonForReferral.toLowerCase().includes(query) ||
                referral.referringDoctor.name.toLowerCase().includes(query) ||
                referral.referringDoctor.facility?.name?.toLowerCase().includes(query) ||
                referral.clinicalSummary?.toLowerCase().includes(query) ||
                (referral.referralType === ReferralType.EXTERNAL &&
                    referral.externalDoctorName?.toLowerCase().includes(query)) ||
                (referral.referralType === ReferralType.EXTERNAL &&
                    referral.externalFacilityName?.toLowerCase().includes(query))
            );
        },
        [searchQuery]
    );

    const matchesFilters = useCallback(
        (referral: ReferralDto) => {
            const matchesStatus = filters.status?.length ? filters.status.includes(referral.status) : true;
            const matchesPriority = filters.priority?.length ? filters.priority.includes(referral.priority) : true;
            const matchesReferralType = filters.referralType?.length
                ? filters.referralType.includes(referral.referralType)
                : true;

            const matchesDateRange =
                filters.dateRange?.[0] && filters.dateRange?.[1]
                    ? new Date(referral.createdAt) >= new Date(filters.dateRange[0]) &&
                    new Date(referral.createdAt) <= new Date(filters.dateRange[1])
                    : true;

            const matchesDoctorName = filters.doctorName
                ? referral.referringDoctor.name.toLowerCase().includes(filters.doctorName.toLowerCase()) ||
                (referral.referralType === ReferralType.EXTERNAL &&
                    referral.externalDoctorName?.toLowerCase().includes(filters.doctorName.toLowerCase()))
                : true;

            const matchesSpecialty = filters.specialty?.length
                ? (referral.referralType === ReferralType.INTERNAL &&
                    referral.referringDoctor.specialityList?.some((s) =>
                        filters.specialty?.some(
                            (filterSpecialty) => s.toLowerCase() === filterSpecialty.toLowerCase()
                        )
                    )) ||
                (referral.referralType === ReferralType.EXTERNAL &&
                    filters.specialty?.some(
                        (filterSpecialty) =>
                            referral.externalDoctorSpeciality?.toLowerCase() === filterSpecialty.toLowerCase()
                    ))
                : true;

            return (
                matchesStatus &&
                matchesPriority &&
                matchesReferralType &&
                matchesDateRange &&
                matchesDoctorName &&
                matchesSpecialty
            );
        },
        [filters]
    );

    // Filter the referrals based on search query and filters
    const filteredReferrals = useMemo(() => {
        return referrals.filter((referral) => matchesSearchQuery(referral) && matchesFilters(referral));
    }, [referrals, matchesSearchQuery, matchesFilters]);

    // Handle search change
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
        setCurrentPage(1); // Reset to first page when search changes
    }, []);

    // Handle filter change
    const handleFilterChange = useCallback((newFilters: Partial<ReferralsFilterOptions>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page when filters change
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Handle patient change
    const handlePatientChange = useCallback((patientId: string) => {
        setSelectedPatientId(patientId);
        setCurrentPage(1); // Reset to first page when patient changes
        setSearchQuery(""); // Clear search when patient changes
        setFilters({}); // Clear filters when patient changes
    }, []);

    // Calculate pagination for mock data
    const paginatedReferrals = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredReferrals.slice(startIndex, endIndex);
    }, [filteredReferrals, currentPage]);

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        await fetchReferrals();
    }, [fetchReferrals]);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    return (
        <ReferralsComponent
            referrals={referrals}
            filteredReferrals={paginatedReferrals}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredReferrals.length}
            filters={filters}
            statusOptions={statusOptions}
            specialtyOptions={specialtyOptions}
            priorityOptions={priorityOptions}
            referralTypeOptions={referralTypeOptions}
            searchQuery={searchQuery}
            patientOptions={getPatientOptions()}
            selectedPatientId={selectedPatientId}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onPatientChange={handlePatientChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            error={error}
        />
    );
};

export default ReferralsPage;
