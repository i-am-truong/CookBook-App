import { API_URL as ENV_API_URL } from "@env";

// Use environment variable if available, otherwise fallback to localtunnel
export const API_URL = ENV_API_URL || "https://cookbook-app.loca.lt";

// Log API URL for debugging
console.log("API URL configured:", API_URL);
