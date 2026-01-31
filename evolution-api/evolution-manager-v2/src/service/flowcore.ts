import axios from "axios";

import { getToken, TOKEN_ID } from "../lib/queries/token"; // Adjusted path based on location

export const flowcoreApi = axios.create({
    baseURL: "http://localhost:3000",
    timeout: 30000,
});

flowcoreApi.interceptors.request.use(
    async (config) => {
        // We still pass the API Key because the Flowcore Service acts as a proxy/auth wrapper
        // or simply needs it to authenticate back to Evolution API if we design it that way.
        // For now, let's keep the pattern of passing the token if available, 
        // though the Service (localhost:3000) might have its own env vars.

        if (!config.headers.apiKey || config.headers.apiKey === "") {
            const token = getToken(TOKEN_ID.TOKEN);
            if (token) {
                config.headers.apikey = `${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
