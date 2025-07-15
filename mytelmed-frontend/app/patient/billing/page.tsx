"use client";

import { useState, useEffect, useMemo } from "react";
import { message } from "antd";
import PaymentApi from "@/app/api/payment";
import { BillDto, PaymentSearchOptions, BillType, BillingStatus } from "@/app/api/payment/props";
import { useFamilyPermissions } from "@/app/hooks/useFamilyPermissions";
import dayjs from "dayjs";
import BillingComponent from "./component";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

const ITEMS_PER_PAGE = 6;

const PatientBillingPage = () => {
    // Family permissions hook
    const {
        currentPatient,
        loading: familyLoading,
        getAuthorizedPatientsForBilling
    } = useFamilyPermissions();

    // State management
    const [bills, setBills] = useState<BillDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);

    // Filters and search
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedPatientId, setSelectedPatientId] = useState<string>("all");
    const [selectedBillType, setSelectedBillType] = useState<BillType | "ALL">("ALL");
    const [selectedStatus, setSelectedStatus] = useState<BillingStatus | "ALL">("ALL");
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<"desc" | "asc" | undefined>("desc");



    // Patient options for dropdown
    const getPatientOptions = () => {
        const authorizedPatients = getAuthorizedPatientsForBilling();
        const options = [{ value: "all", label: "All Patients" }];

        authorizedPatients.forEach(patient => {
            if (patient.id === currentPatient?.id) {
                options.push({
                    value: patient.id,
                    label: `${patient.name} (You)`
                });
            } else {
                options.push({
                    value: patient.id,
                    label: patient.name
                });
            }
        });

        return options;
    };

    // Check if viewing own bills
    const isViewingOwnBills = useMemo(() => {
        return selectedPatientId === "all" || selectedPatientId === currentPatient?.id;
    }, [selectedPatientId, currentPatient?.id]);

    // Fetch bills data
    const fetchBills = async () => {
        if (familyLoading) return;

        try {
            setIsLoading(true);
            setError(null);

            const options: PaymentSearchOptions & {
                patientId?: string;
                billType?: string;
                billingStatus?: string;
                searchQuery?: string;
                startDate?: string;
                endDate?: string;
            } = {
                page: currentPage - 1, // 0-indexed
                size: ITEMS_PER_PAGE,
                sortBy,
                sortDir: sortDir
            };

            // Add filter parameters
            if (selectedPatientId !== "all") {
                options.patientId = selectedPatientId;
            }
            if (selectedBillType !== "ALL") {
                options.billType = selectedBillType;
            }
            if (selectedStatus !== "ALL") {
                options.billingStatus = selectedStatus;
            }
            if (searchQuery.trim()) {
                options.searchQuery = searchQuery.trim();
            }
            if (dateRange) {
                options.startDate = dateRange[0];
                options.endDate = dateRange[1];
            }

            const response = await PaymentApi.getPatientBills(options);

            if (response.data.isSuccess && response.data.data) {
                setBills(response.data.data.content || []);
                setTotalItems(response.data.data.totalElements || 0);
                setTotalPages(response.data.data.totalPages || 0);
            } else {
                throw new Error("Failed to fetch bills");
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to load billing information";
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Load bills on component mount and when family data changes
    useEffect(() => {
        fetchBills();
    }, [familyLoading, sortBy, sortDir, currentPage, selectedPatientId, selectedBillType, selectedStatus, searchQuery, dateRange]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedPatientId, selectedBillType, selectedStatus, dateRange]);

    // Event handlers
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handlePatientChange = (patientId: string) => {
        setSelectedPatientId(patientId);
    };

    const handleBillTypeChange = (billType: BillType | "ALL") => {
        setSelectedBillType(billType);
    };

    const handleStatusChange = (status: BillingStatus | "ALL") => {
        setSelectedStatus(status);
    };

    const handleDateRangeChange = (range: [string, string] | null) => {
        setDateRange(range);
    };

    const handleSortChange = (newSortBy: string, newSortDir: string) => {
        setSortBy(newSortBy);
        setSortDir(newSortDir as "desc" | "asc" | undefined);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleRefresh = () => {
        fetchBills();
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedPatientId("all");
        setSelectedBillType("ALL");
        setSelectedStatus("ALL");
        setDateRange(null);
        setCurrentPage(1);
    };

    // Calculate statistics (current page only - limitation of current implementation)
    const stats = useMemo(() => {
        const paidBills = bills.filter((bill: BillDto) => bill.billingStatus === "PAID");
        const unpaidBills = bills.filter((bill: BillDto) => bill.billingStatus === "UNPAID");

        const totalAmount = bills.reduce((sum: number, bill: BillDto) => sum + Number(bill.amount), 0);
        const paidAmount = paidBills.reduce((sum: number, bill: BillDto) => sum + Number(bill.amount), 0);
        const unpaidAmount = unpaidBills.reduce((sum: number, bill: BillDto) => sum + Number(bill.amount), 0);

        return {
            totalBills: totalItems, // Use total from server (correct for filtered dataset)
            totalAmount, // Note: This is only for current page, not entire filtered dataset
            paidAmount, // Note: This is only for current page, not entire filtered dataset
            unpaidAmount, // Note: This is only for current page, not entire filtered dataset
            paidBills: paidBills.length, // Note: This is only for current page
            unpaidBills: unpaidBills.length, // Note: This is only for current page
        };
    }, [bills, totalItems]);

    if (familyLoading) {
        return <div>Loading...</div>;
    }

    return (
        <BillingComponent
            bills={bills}
            stats={stats}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            searchQuery={searchQuery}
            selectedPatientId={selectedPatientId}
            selectedBillType={selectedBillType}
            selectedStatus={selectedStatus}
            dateRange={dateRange}
            sortBy={sortBy}
            sortDir={sortDir}
            patientOptions={getPatientOptions()}
            isViewingOwnBills={isViewingOwnBills}
            isLoading={isLoading}
            error={error}
            onSearchChange={handleSearchChange}
            onPatientChange={handlePatientChange}
            onBillTypeChange={handleBillTypeChange}
            onStatusChange={handleStatusChange}
            onDateRangeChange={handleDateRangeChange}
            onSortChange={handleSortChange}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            onClearFilters={handleClearFilters}
        />
    );
};

export default PatientBillingPage;
