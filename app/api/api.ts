import { getToken } from "@/services/storage.service";
import axios from "axios";
import { baseUrl } from "./apis";

export const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      return config;
    } catch (error) {
      console.warn("Failed to attach auth token:", error);

      return config;
    }
  },
  (error) => Promise.reject(error),
);
