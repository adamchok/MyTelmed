import axios from "axios";
import auth from "./auth";

const repository = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

repository.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("accessToken");
  const isLogin = localStorage.getItem("isLogin") == "true";
  const noNeedBearer = ["/auth/login", "/auth/refresh-token"];
  if (accessToken && isLogin && !noNeedBearer.includes(config?.url || "")) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    config.headers.Authorization = undefined;
  }
  return config;
});

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
    window.location.href = "/sign-in";
  }
}

export default repository;
