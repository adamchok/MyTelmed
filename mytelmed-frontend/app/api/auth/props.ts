export interface LoginRequestOptions {
    username: string;
    password: string;
}

export interface JwtResponse {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenRequestOptions {
    refreshToken: string;
}
