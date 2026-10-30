import { Platform } from "react-native";
import { Configuration, ReasonsApi, TicketsApi } from "./api/generated";

const defaultBaseUrl = Platform.select({
  android: "http://192.168.1.143:7000",
  default: "http://localhost:7000",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? defaultBaseUrl;

const configuration = new Configuration({ basePath: API_BASE_URL });

export const reasonsApi = new ReasonsApi(configuration);
export const ticketsApi = new TicketsApi(configuration);
