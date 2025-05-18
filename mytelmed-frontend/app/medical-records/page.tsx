'use client';

import { useState, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MedicalRecord, MedicalRecordType, MedicalRecordCategory } from './props';
import MedicalRecordsComponent from './component';
import { dummyMedicalRecords } from '../constants/dummy-data/dummyMedicalRecords';
import dummyFamilyMembers from '../constants/dummy-data/dummyFamilyMembers';

const RECORDS_PER_PAGE = 10;

const MedicalRecordsPage = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(dummyMedicalRecords);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<MedicalRecordType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<MedicalRecordCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter records based on type, category, and search query
  const filteredRecords = useMemo(() => {
    return medicalRecords.filter(record => {
      const matchesType = selectedType === 'all' || record.type === selectedType;
      const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory;
      const matchesSearch = record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [medicalRecords, selectedType, selectedCategory, searchQuery]);

  // Paginate filtered records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredRecords, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE) || 1;

  // Handler functions
  const handleUploadRecord = useCallback((file: File, type: MedicalRecordType, description?: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newRecord: MedicalRecord = {
        id: uuidv4(),
        name: file.name,
        type: type,
        category: 'self-uploaded',
        fileType: file.name.split('.').pop() || 'pdf',
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        fileUrl: '/sample-url', // This would be the actual URL in a real app
        description: description,
        permissions: {
          read: true,
          edit: true,
          download: true,
          share: false
        },
        sharedWith: []
      };

      setMedicalRecords(prev => [newRecord, ...prev]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDeleteRecord = useCallback((recordId: string) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMedicalRecords(prev => prev.filter(record => record.id !== recordId));
      setIsLoading(false);
    }, 500);
  }, []);

  const handleUpdateRecord = useCallback((recordId: string, updates: Partial<MedicalRecord>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMedicalRecords(prev =>
        prev.map(record =>
          record.id === recordId
            ? { ...record, ...updates }
            : record
        )
      );
      setIsLoading(false);
    }, 500);
  }, []);

  const handleUpdatePermissions = useCallback((recordId: string, permissions: Partial<MedicalRecord['permissions']>) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMedicalRecords(prev =>
        prev.map(record =>
          record.id === recordId
            ? { ...record, permissions: { ...record.permissions, ...permissions } }
            : record
        )
      );
      setIsLoading(false);
    }, 500);
  }, []);

  const handleShareRecord = useCallback((recordId: string, familyMemberIds: string[]) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setMedicalRecords(prev =>
        prev.map(record =>
          record.id === recordId
            ? { ...record, sharedWith: familyMemberIds }
            : record
        )
      );
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter handlers
  const handleTypeChange = useCallback((type: MedicalRecordType | 'all') => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleCategoryChange = useCallback((category: MedicalRecordCategory | 'all') => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Pagination handler
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <MedicalRecordsComponent
      medicalRecords={medicalRecords}
      filteredRecords={paginatedRecords}
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={RECORDS_PER_PAGE}
      selectedType={selectedType}
      selectedCategory={selectedCategory}
      searchQuery={searchQuery}
      onUploadRecord={handleUploadRecord}
      onDeleteRecord={handleDeleteRecord}
      onUpdateRecord={handleUpdateRecord}
      onUpdatePermissions={handleUpdatePermissions}
      onShareRecord={handleShareRecord}
      onTypeChange={handleTypeChange}
      onCategoryChange={handleCategoryChange}
      onSearchChange={handleSearchChange}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      familyMembers={dummyFamilyMembers}
    />
  );
};

export default MedicalRecordsPage;
