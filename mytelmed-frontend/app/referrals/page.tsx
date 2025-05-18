'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Referral, ReferralsFilterOptions } from './props';
import ReferralsComponent from './component';

// Mock data for referrals
const dummyReferrals: Referral[] = [
  {
    id: '1',
    type: 'Cardiology Consultation',
    referringDoctor: 'Michael Chang',
    referringClinic: 'Central Medical Center',
    referralDate: '2023-06-01',
    expiryDate: '2023-12-01',
    status: 'active',
    description: 'Patient requires cardiology evaluation due to abnormal ECG findings.',
    specialty: 'Cardiology'
  },
  {
    id: '2',
    type: 'Dermatology Follow-up',
    referringDoctor: 'Lisa Wong',
    referringClinic: 'Harbor Skin Clinic',
    referralDate: '2023-05-15',
    expiryDate: '2023-08-15',
    status: 'expired',
    description: 'Follow-up evaluation of previously treated skin condition.',
    specialty: 'Dermatology'
  },
  {
    id: '3',
    type: 'Orthopedic Assessment',
    referringDoctor: 'David Martinez',
    referringClinic: 'City General Hospital',
    referralDate: '2023-07-20',
    expiryDate: '2024-01-20',
    status: 'active',
    description: 'Assessment of knee injury sustained during sports activity.',
    specialty: 'Orthopedics'
  },
  {
    id: '4',
    type: 'Ophthalmology Consultation',
    referringDoctor: 'Sarah Johnson',
    referringClinic: 'Vision Care Center',
    referralDate: '2023-04-10',
    expiryDate: '2023-07-10',
    status: 'used',
    description: 'Evaluation for vision changes and potential cataracts.',
    specialty: 'Ophthalmology'
  },
  {
    id: '5',
    type: 'Gastroenterology Consultation',
    referringDoctor: 'Robert Chen',
    referringClinic: 'Digestive Health Institute',
    referralDate: '2023-08-05',
    expiryDate: '2024-02-05',
    status: 'active',
    description: 'Evaluation for persistent abdominal pain and reflux symptoms.',
    specialty: 'Gastroenterology'
  },
  {
    id: '6',
    type: 'Neurology Follow-up',
    referringDoctor: 'Emily Cruz',
    referringClinic: 'Neurological Center',
    referralDate: '2023-03-22',
    expiryDate: '2023-09-22',
    status: 'expired',
    description: 'Follow-up for management of migraine headaches.',
    specialty: 'Neurology'
  },
  {
    id: '7',
    type: 'Endocrinology Consultation',
    referringDoctor: 'James Wilson',
    referringClinic: 'Metabolic Health Center',
    referralDate: '2023-07-15',
    expiryDate: '2024-01-15',
    status: 'active',
    description: 'Evaluation for suspected thyroid disorder.',
    specialty: 'Endocrinology'
  },
  {
    id: '8',
    type: 'Pulmonology Assessment',
    referringDoctor: 'Michelle Lee',
    referringClinic: 'Respiratory Health Partners',
    referralDate: '2023-05-30',
    expiryDate: '2023-11-30',
    status: 'active',
    description: 'Assessment for chronic cough and shortness of breath.',
    specialty: 'Pulmonology'
  },
  {
    id: '9',
    type: 'Rheumatology Consultation',
    referringDoctor: 'Thomas Jackson',
    referringClinic: 'Joint & Arthritis Center',
    referralDate: '2023-02-15',
    expiryDate: '2023-08-15',
    status: 'used',
    description: 'Evaluation for joint pain and suspected autoimmune condition.',
    specialty: 'Rheumatology'
  },
  {
    id: '10',
    type: 'ENT Consultation',
    referringDoctor: 'Patricia Nguyen',
    referringClinic: 'Ear, Nose & Throat Specialists',
    referralDate: '2023-06-20',
    expiryDate: '2023-12-20',
    status: 'active',
    description: 'Evaluation for chronic sinusitis and recurring ear infections.',
    specialty: 'Otolaryngology'
  }
];

const ITEMS_PER_PAGE = 5;

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<ReferralsFilterOptions>({});

  // Fetch referrals (simulated)
  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setReferrals(dummyReferrals);
      setIsLoading(false);
    };

    fetchReferrals();
  }, []);

  // Define status options
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Expired', value: 'expired' },
    { label: 'Used', value: 'used' }
  ];

  // Get unique specialties from referrals
  const specialtyOptions = useMemo(() => {
    const specialties = Array.from(new Set(
      referrals
        .filter(ref => ref.specialty)
        .map(ref => ref.specialty as string)
    ));

    return specialties.map(specialty => ({
      label: specialty,
      value: specialty
    }));
  }, [referrals]);

  // Filter the referrals based on search query and filters
  const filteredReferrals = useMemo(() => {
    return referrals.filter(referral => {
      // Filter by search query
      const matchesSearch = searchQuery
        ? (
          referral.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          referral.referringDoctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          referral.referringClinic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (referral.description && referral.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (referral.specialty && referral.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : true;

      // Filter by status
      const matchesStatus = filters.status && filters.status.length
        ? filters.status.includes(referral.status)
        : true;

      // Filter by date range
      const matchesDateRange = filters.dateRange && filters.dateRange[0] && filters.dateRange[1]
        ? (
          new Date(referral.referralDate) >= new Date(filters.dateRange[0]) &&
          new Date(referral.referralDate) <= new Date(filters.dateRange[1])
        )
        : true;

      // Filter by doctor name
      const matchesDoctorName = filters.doctorName
        ? referral.referringDoctor.toLowerCase().includes(filters.doctorName.toLowerCase())
        : true;

      // Filter by specialty
      const matchesSpecialty = filters.specialty
        ? referral.specialty?.toLowerCase() === filters.specialty.toLowerCase()
        : true;

      return matchesSearch && matchesStatus && matchesDateRange && matchesDoctorName && matchesSpecialty;
    });
  }, [referrals, searchQuery, filters]);

  // Paginate the filtered referrals
  const paginatedReferrals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReferrals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredReferrals, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredReferrals.length / ITEMS_PER_PAGE) || 1;

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: Partial<ReferralsFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <ReferralsComponent
      referrals={referrals}
      filteredReferrals={paginatedReferrals}
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={ITEMS_PER_PAGE}
      filters={filters}
      statusOptions={statusOptions}
      specialtyOptions={specialtyOptions}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onFilterChange={handleFilterChange}
      onPageChange={handlePageChange}
      isLoading={isLoading}
    />
  );
};

export default ReferralsPage; 