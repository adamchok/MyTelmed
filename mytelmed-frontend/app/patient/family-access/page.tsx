// 'use client';

// import { useState, useEffect, useMemo } from 'react';
// import { message } from 'antd';
// import { FamilyMember, Permission } from '../props';
// import dummyFamilyMembers from '@/app/constants/dummy-data/dummyFamilyMembers';
// import FamilyAccessPageComponent from './component';
// import { FilterOption } from './props';

// const FamilyAccessPage = () => {
//   const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
//   const [filteredMembers, setFilteredMembers] = useState<FamilyMember[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [currentMember, setCurrentMember] = useState<FamilyMember | undefined>(undefined);
//   const [searchQuery, setSearchQuery] = useState('');
//   // New filter states
//   const [relationshipFilter, setRelationshipFilter] = useState<string | undefined>(undefined);
//   const [permissionFilters, setPermissionFilters] = useState<Permission[]>([]);

//   // Create relationship options from family members data
//   const relationshipOptions: FilterOption[] = useMemo(() => {
//     const uniqueRelationships = new Set<string>();

//     dummyFamilyMembers.forEach(member => {
//       if (member.relationship) {
//         uniqueRelationships.add(member.relationship);
//       }
//     });

//     return Array.from(uniqueRelationships).map(relationship => ({
//       label: relationship.charAt(0).toUpperCase() + relationship.slice(1),
//       value: relationship
//     })).sort((a, b) => a.label.localeCompare(b.label));
//   }, []);

//   // Create permission options
//   const permissionOptions: FilterOption[] = [
//     { label: 'Book Appointments', value: 'appointmentBooking' },
//     { label: 'Manage Appointments', value: 'appointmentManagement' },
//     { label: 'View Medical Records', value: 'viewMedicalRecords' },
//     { label: 'Manage Prescriptions', value: 'managePrescriptions' },
//   ];

//   useEffect(() => {
//     // In a real app, this would be an API call
//     setTimeout(() => {
//       setFamilyMembers(dummyFamilyMembers);
//       setFilteredMembers(dummyFamilyMembers);
//       setIsLoading(false);
//     }, 100);
//   }, []);

//   useEffect(() => {
//     let filtered = [...familyMembers];

//     // Apply search query filter
//     if (searchQuery.trim() !== '') {
//       const lowercaseQuery = searchQuery.toLowerCase();
//       filtered = filtered.filter(member =>
//         member.name.toLowerCase().includes(lowercaseQuery) ||
//         member.email.toLowerCase().includes(lowercaseQuery) ||
//         member.relationship.toLowerCase().includes(lowercaseQuery)
//       );
//     }

//     // Apply relationship filter
//     if (relationshipFilter) {
//       filtered = filtered.filter(member => member.relationship === relationshipFilter);
//     }

//     // Apply permission filters
//     if (permissionFilters.length > 0) {
//       filtered = filtered.filter(member => {
//         // Member must have ALL selected permissions (AND logic)
//         return permissionFilters.every(permission =>
//           member.permissions[permission] === true
//         );
//       });
//     }

//     setFilteredMembers(filtered);
//   }, [searchQuery, familyMembers, relationshipFilter, permissionFilters]);

//   const handleAddMember = () => {
//     setCurrentMember(undefined);
//     setIsModalVisible(true);
//   };

//   const handleEditMember = (member: FamilyMember) => {
//     setCurrentMember(member);
//     setIsModalVisible(true);
//   };

//   const handleDeleteMember = (memberId: string) => {
//     setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
//     setFilteredMembers(prev => prev.filter(member => member.id !== memberId));
//     message.success('Family member access has been removed');
//   };

//   const handleModalCancel = () => {
//     setIsModalVisible(false);
//     setCurrentMember(undefined);
//   };

//   const handleFormSubmit = (member: FamilyMember) => {
//     if (currentMember) {
//       // Update existing member
//       const updatedMembers = familyMembers.map(m => m.id === member.id ? member : m);
//       setFamilyMembers(updatedMembers);
//     } else {
//       // Add new member
//       const newMembers = [...familyMembers, member];
//       setFamilyMembers(newMembers);
//     }
//     setIsModalVisible(false);
//   };

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//   };

//   const handleRelationshipFilterChange = (value: string | undefined) => {
//     setRelationshipFilter(value);
//   };

//   const handlePermissionFilterChange = (values: string[]) => {
//     setPermissionFilters(values as Permission[]);
//   };

//   return (
//     <FamilyAccessPageComponent
//       searchQuery={searchQuery}
//       handleSearchChange={handleSearchChange}
//       handleAddMember={handleAddMember}
//       handleEditMember={handleEditMember}
//       handleDeleteMember={handleDeleteMember}
//       isLoading={isLoading}
//       isModalVisible={isModalVisible}
//       currentMember={currentMember}
//       filteredMembers={filteredMembers}
//       handleModalCancel={handleModalCancel}
//       handleFormSubmit={handleFormSubmit}
//       relationshipFilter={relationshipFilter}
//       permissionFilters={permissionFilters}
//       relationshipOptions={relationshipOptions}
//       permissionOptions={permissionOptions}
//       handleRelationshipFilterChange={handleRelationshipFilterChange}
//       handlePermissionFilterChange={handlePermissionFilterChange}
//     />
//   );
// };

// export default FamilyAccessPage;
