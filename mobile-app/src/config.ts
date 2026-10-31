import { Platform } from "react-native";
import { Configuration, ReasonsApi, TicketsApi } from "./api/generated";

const API_TIMEOUT_MS = 8_000;

const defaultBaseUrl = Platform.select({
  android: "http://192.168.1.143:7000",
  default: "http://localhost:7000",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl;

const configuration = new Configuration({
  basePath: API_BASE_URL,
  fetchApi: async (input, init) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        const timeoutError = new Error("Request timed out");
        timeoutError.name = "TimeoutError";
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  },
});

export const reasonsApi = new ReasonsApi(configuration);
export const ticketsApi = new TicketsApi(configuration);
