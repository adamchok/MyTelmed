export interface UpdateAccountUsernameRequest {
    newUsername: string;
    currentPassword: string;
}

export interface UpdateAccountPasswordRequest {
    newPassword: string;
    currentPassword: string;
}
