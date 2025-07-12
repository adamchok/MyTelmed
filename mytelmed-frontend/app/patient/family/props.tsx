import { FamilyMember } from "@/app/api/family/props";

export interface FamilyAccessPageProps {
    familyMembers: FamilyMember[];
}

export interface FilterOption {
    label: string;
    value: string;
}
