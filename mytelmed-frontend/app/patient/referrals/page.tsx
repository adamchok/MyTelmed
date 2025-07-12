"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ReferralApi from "@/app/api/referral";
import PatientApi from "@/app/api/patient";
import { FamilyMemberApi } from "@/app/api/family";
import { ReferralDto, ReferralStatus, ReferralPriority, ReferralType } from "@/app/api/referral/props";
import { FamilyMember } from "@/app/api/family/props";
import { ReferralsFilterOptions, PatientOption } from "./props";
import ReferralsComponent from "./component";
// import { mockReferrals } from "./mockData";

const ITEMS_PER_PAGE = 10;

const ReferralsPage = () => {
    const [referrals, setReferrals] = useState<ReferralDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<ReferralsFilterOptions>({});

    // Patient selection state
    const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>("");
    const [currentPatientId, setCurrentPatientId] = useState<string>("");

    // Fetch patient options (self + family members with referral viewing permission)
    const fetchPatientOptions = useCallback(async () => {
        try {
            setError(null);

            // Get current patient profile
            const profileResponse = await PatientApi.getPatientProfile();
            if (!profileResponse.data?.isSuccess || !profileResponse.data.data) {
                throw new Error("Failed to load patient profile");
            }

            const currentPatient = profileResponse.data.data;
            setCurrentPatientId(currentPatient.id);

            // Initialize options with current patient
            const options: PatientOption[] = [
                {
                    id: currentPatient.id,
                    name: "You",
                    relationship: "You",
                    canViewReferrals: true,
                },
            ];

            // Get family members
            try {
                const familyResponse = await FamilyMemberApi.getPatientsByMemberAccount();
                if (familyResponse.data?.isSuccess && familyResponse.data.data) {
                    const familyMembers = familyResponse.data.data;

                    // Add family members with referral viewing permission
                    familyMembers.forEach((member: FamilyMember) => {
                        if (!member.pending && member.canViewMedicalRecords && member.patient) {
                            options.push({
                                id: member.patient.id,
                                name: member.name,
                                relationship: member.relationship,
                                canViewReferrals: true,
                            });
                        }
                    });
                }
            } catch (familyError) {
                console.warn("Failed to fetch family members:", familyError);
                // Continue without family members
            }

            setPatientOptions(options);

            // Set default selection to current patient if not already set
            if (!selectedPatientId && options.length > 0) {
                setSelectedPatientId(currentPatient.id);
            }
        } catch (err: any) {
            console.error("Failed to fetch patient options:", err);
            setError(err.response?.data?.message || "Failed to load patient options. Please try again.");
        }
    }, [selectedPatientId]);

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

                // Only combine with mock data if viewing current patient's referrals
                // let combinedReferrals: ReferralDto[];
                // if (selectedPatientId === currentPatientId) {
                //     combinedReferrals = [...paginatedData.content, ...mockReferrals];
                // } else {
                //     combinedReferrals = paginatedData.content;
                // }

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
    }, [selectedPatientId, currentPage, currentPatientId]);

    // Initial load
    useEffect(() => {
        fetchPatientOptions();
    }, [fetchPatientOptions]);

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
        await Promise.all([fetchPatientOptions(), fetchReferrals()]);
    }, [fetchPatientOptions, fetchReferrals]);

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
            patientOptions={patientOptions}
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
