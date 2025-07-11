import axios from "axios";
import auth from "./auth";

/**
 * Repository is a custom axios instance that is used to make requests to the API.
 * It sets the base URL for all API requests and adds a request interceptor to
 * add the access token to the Authorization header. It also adds a response
 * interceptor to handle 401 status codes and redirect to the login page.
 */
const repository = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Add refresh session control
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Request interceptor to add the access token to the Authorization header.
 * This is called before every request just to ensure valid access token is passed
 */
repository.interceptors.request.use(async (config) => {
    const accessToken = localStorage.getItem("accessToken");
    const isLogin = localStorage.getItem("isLogin") === "true";
    const noNeedBearer = ["/api/v1/auth/login", "/api/v1/auth/token/refresh", "/api/v1/auth/verify-email"];

    if (accessToken && isLogin && !noNeedBearer.some((url) => config?.url?.includes(url))) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
        config.headers.Authorization = undefined;
    }
    return config;
});

/**
 * Response interceptor to handle 401 status codes and redirect to the login page.
 * This is called after every request.
 */
repository.interceptors.response.use(
    (response) => response, // If the response is successful, return it
    async (error) => {
        const { config, response } = error;

        if (!response) {
            console.error("Network error: Unable to connect to the server");
            return Promise.reject(new Error("Failed to connect to the server"));
        }

        // Don't retry refresh token requests to prevent infinite loops
        if (config?.url?.includes("/api/v1/auth/token/refresh")) {
            return Promise.reject(new Error(error.message || "Token refresh failed"));
        }

        if (response?.status === 401) {
            // If already refreshing, queue this request
            if (isRefreshing && refreshPromise) {
                return refreshPromise
                    .then((token) => {
                        if (token) {
                            config.headers["Authorization"] = `Bearer ${token}`;
                            return repository.request(config);
                        } else {
                            return Promise.reject(new Error("Token refresh failed"));
                        }
                    })
                    .catch((err) => {
                        return Promise.reject(new Error(err.message || "Token refresh failed"));
                    });
            }

            // Mark as refreshing and attempt refresh
            isRefreshing = true;
            refreshPromise = refreshSession()
                .then(() => {
                    const newToken = localStorage.getItem("accessToken");
                    refreshPromise = null;
                    return newToken;
                })
                .catch((refreshError) => {
                    refreshPromise = null;
                    throw refreshError;
                })
                .finally(() => {
                    isRefreshing = false;
                });

            return refreshPromise
                .then((token) => {
                    if (token) {
                        config.headers["Authorization"] = `Bearer ${token}`;
                        return repository.request(config);
                    } else {
                        return Promise.reject(new Error("Token refresh failed"));
                    }
                })
                .catch((err) => {
                    return Promise.reject(new Error(err.message || "Token refresh failed"));
                });
        }

        return Promise.reject(new Error(error.message || "Request failed"));
    }
);

async function refreshSession(): Promise<void> {
    try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            throw new Error("No refresh token available");
        }

        const response = await auth.refreshToken(refreshToken);
        const responseData = response.data;

        if (responseData.isSuccess && responseData.data) {
            const data = responseData.data;
            localStorage.setItem("accessToken", data.accessToken ?? "");
            if (data?.refreshToken) {
                localStorage.setItem("refreshToken", data.refreshToken ?? "");
            }
        } else {
            throw new Error(responseData.message || "Failed to refresh token");
        }
    } catch (err) {
        console.error("Refresh session failed:", err);
        // Clear all auth data
        localStorage.removeItem("isLogin");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        throw err;
    }
}

export default repository;
