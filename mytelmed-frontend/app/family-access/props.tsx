import { FamilyMember, Permission } from "../props";

export interface FamilyAccessPageProps {
  familyMembers: FamilyMember[];
}

export interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
}

export interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
}

export interface FamilyMemberFormProps {
  initialValues?: FamilyMember;
  onSubmit: (values: FamilyMember) => void;
  onCancel: () => void;
}

export interface PermissionCardProps {
  title: string;
  description: string;
  permissionKey: Permission;
  value: boolean;
  onChange: (key: Permission, value: boolean) => void;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FamilyAccessComponentProps {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddMember: () => void;
  handleEditMember: (member: FamilyMember) => void;
  handleDeleteMember: (memberId: string) => void;
  isLoading: boolean;
  isModalVisible: boolean;
  currentMember: FamilyMember | undefined;
  filteredMembers: FamilyMember[];
  handleModalCancel: () => void;
  handleFormSubmit: (member: FamilyMember) => void;
  // Filter props
  relationshipFilter: string | undefined;
  permissionFilters: Permission[];
  relationshipOptions: FilterOption[];
  permissionOptions: FilterOption[];
  handleRelationshipFilterChange: (value: string | undefined) => void;
  handlePermissionFilterChange: (values: string[]) => void;
}
