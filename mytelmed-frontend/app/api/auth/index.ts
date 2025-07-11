import repository from "../RepositoryManager";
import { LoginRequestOptions, JwtResponse, RefreshTokenRequestOptions } from "./props";
import { ApiResponse } from "../props";
import { AxiosResponse } from "axios";

const AUTH_BASE = "/api/v1/auth";

const AuthApi = {
    loginPatient(credentials: LoginRequestOptions): Promise<AxiosResponse<ApiResponse<JwtResponse>>> {
        return repository.post<ApiResponse<JwtResponse>>(`${AUTH_BASE}/login/patient`, credentials);
    },
    loginDoctor(credentials: LoginRequestOptions): Promise<AxiosResponse<ApiResponse<JwtResponse>>> {
        return repository.post<ApiResponse<JwtResponse>>(`${AUTH_BASE}/login/doctor`, credentials);
    },
    loginPharmacist(credentials: LoginRequestOptions): Promise<AxiosResponse<ApiResponse<JwtResponse>>> {
        return repository.post<ApiResponse<JwtResponse>>(`${AUTH_BASE}/login/pharmacist`, credentials);
    },
    loginAdmin(credentials: LoginRequestOptions): Promise<AxiosResponse<ApiResponse<JwtResponse>>> {
        return repository.post<ApiResponse<JwtResponse>>(`${AUTH_BASE}/login/admin`, credentials);
    },
    refreshToken(refreshToken: string): Promise<AxiosResponse<ApiResponse<JwtResponse>>> {
        // Ensure refreshToken is properly formatted for backend UUID expectation
        const request: RefreshTokenRequestOptions = {
            refreshToken: refreshToken.trim(), // Remove any whitespace that might cause UUID parsing issues
        };
        return repository.post<ApiResponse<JwtResponse>>(`${AUTH_BASE}/token/refresh`, request);
    },
    logout(): Promise<AxiosResponse<ApiResponse<void>>> {
        return repository.post<ApiResponse<void>>(`${AUTH_BASE}/logout`);
    },
};

export default AuthApi;
