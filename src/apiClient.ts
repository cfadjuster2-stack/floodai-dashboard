import axios, { type AxiosInstance } from "axios";
import type { GetToken } from "@clerk/types";

export function createApiClient(getToken: GetToken) {
  const client = axios.create({
    baseURL: "/", // IMPORTANT: keep relative so Vite proxy works
  });

  client.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}
