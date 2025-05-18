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

/**
 * Request interceptor to add the access token to the Authorization header.
 * This is called before every request just to ensure valid access token is passed
 */
repository.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken");
  const isLogin = localStorage.getItem("isLogin") == "true";
  const noNeedBearer = ["/auth/login", "/auth/refresh-token", "/auth/register", "/auth/verify-email"];
  if (accessToken && isLogin && !noNeedBearer.includes(config?.url ?? "")) {
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
    if (response?.status === 401) {
      await refreshSession();
      config.headers["Authorization"] = `Bearer ${localStorage.getItem("accessToken")}`;
      return repository.request(config);
    }
    return Promise.reject(error);
  }
);

let subscribers: any[] = [];

function onRefreshed() {
  subscribers.map((cb: any) => cb());
}

async function refreshSession() {
  try {
    const refreshToken = localStorage.getItem("refreshToken") as string;
    const { data } = await auth.refreshSession(refreshToken);
    localStorage.setItem("accessToken", data?.accessToken);
    if (data?.newRefreshToken) {
      localStorage.setItem("refreshToken", data?.newRefreshToken);
    }
    onRefreshed();
    subscribers = [];
  } catch (err) {
    console.log(err);
    localStorage.removeItem("isLogin");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  }
}

export default repository;
