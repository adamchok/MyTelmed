import { AxiosResponse } from "axios";
import repository from "../RepositoryManager";
import { ApiResponse } from "../props";
import { FamilyMember, CreateFamilyMemberRequest, UpdateFamilyMemberRequest, UpdateFamilyPermissionsRequest } from "./props";

const FAMILY_RESOURCE: string = "/api/v1/family";
const FAMILY_PERMISSIONS_RESOURCE: string = "/api/v1/family/permissions";

const FamilyMemberApi = {
    /**
     * Get family members for the authenticated patient account (current user)
     */
    getFamilyMembersByPatientAccount(): Promise<AxiosResponse<ApiResponse<FamilyMember[]>>> {
        return repository.get<ApiResponse<FamilyMember[]>>(`${FAMILY_RESOURCE}`);
    },

    /**
     * Get patients that the authenticated family member account (current user) can access
     */
    getPatientsByMemberAccount(): Promise<AxiosResponse<ApiResponse<FamilyMember[]>>> {
        return repository.get<ApiResponse<FamilyMember[]>>(`${FAMILY_RESOURCE}/patients`);
    },

    /**
     * Get pending invitations for the authenticated account (current user)
     */
    getPendingInvitations(): Promise<AxiosResponse<ApiResponse<FamilyMember[]>>> {
        return repository.get<ApiResponse<FamilyMember[]>>(`${FAMILY_RESOURCE}/pending`);
    },

    /**
     * Confirm family member invitation
     */
    confirmFamilyMember(familyMemberId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.get<ApiResponse<void>>(`${FAMILY_RESOURCE}/confirm/${familyMemberId}`);
    },

    /**
     * Decline family member invitation
     */
    declineFamilyMember(familyMemberId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.get<ApiResponse<void>>(`${FAMILY_RESOURCE}/decline/${familyMemberId}`);
    },

    /**
     * Invite a new family member (uses authenticated patient account)
     */
    inviteFamilyMember(request: CreateFamilyMemberRequest): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${FAMILY_RESOURCE}`, request);
    },

    /**
     * Update family member details
     */
    updateFamilyMember(
        familyMemberId: string,
        request: UpdateFamilyMemberRequest
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${FAMILY_RESOURCE}/${familyMemberId}`, request);
    },

    /**
     * Delete family member
     */
    deleteFamilyMember(familyMemberId: string): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.delete<ApiResponse<void>>(`${FAMILY_RESOURCE}/${familyMemberId}`);
    },
};

const FamilyMemberPermissionApi = {
    /**
     * Update permissions for a family member
     */
    updatePermissions(
        familyMemberId: string,
        request: UpdateFamilyPermissionsRequest
    ): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.put<ApiResponse<void>>(`${FAMILY_PERMISSIONS_RESOURCE}/${familyMemberId}`, request);
    },
};

export { FamilyMemberApi, FamilyMemberPermissionApi };
