import axios from "axios";
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  APIError,
  ValidationError,
} from "./errors";
import { ZodError } from "zod";
import { useUserStore } from "../stores/user.store.js";
import { envs } from "./env-schema.js";
/**
 * @typedef {{
 *   baseURL: string;
 *   timeout?: number;
 * }} HttpClientConfig
 */

/**
 * A custom HTTP API client built on top of Axios
 */
class ApiClient {
  /** @type {axios.AxiosInstance} */
  axiosInstance;

  /**
   * A custom HTTP API client built on top of Axios
   * @param {Object} config
   * @param {string} config.baseURL - The base URL for the API
   * @param {number} [config.timeout=10000] - Request timeout in milliseconds (default: 10000ms)
   */
  constructor({ baseURL, timeout = 10000 }) {
    baseURL =
      baseURL.at(baseURL.length - 1) === "/" ? baseURL.slice(0, -1) : baseURL;

    this.axiosInstance = axios.create({
      baseURL: baseURL + "/",
      timeout: timeout || 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const user = useUserStore.getState().user;
        if (user?.authToken) {
          config.headers.Authorization = `Bearer ${user?.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Clear persisted user state so client-side route guards react to unauthenticated state
          try {
            useUserStore.getState().setUser(null);
          } catch (err) {
            // ignore
          }

          const user = useUserStore.getState().user;
          if (user?.authToken) {
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${user?.authToken}`;
              return this.axiosInstance.request(error.config);
            }
          }

          throw new AuthenticationError({
            message: "Authentication failed. Please sign in again.",
          });
        }

        if (error.response?.status === 403) {
          throw new AuthorizationError({
            message:
              "Access denied. You don't have permission to perform this action or access this resource.",
            errorCode: "ACCESS_DENIED",
          });
        }

        if (error.code === "ECONNABORTED") {
          throw new NetworkError({
            message: "Request timeout",
            errorCode: "CONNECTION_TIMEOUT",
            statusCode: undefined,
            cause: error,
          });
        }

        if (!error.response || !error.response.data) {
          throw new NetworkError({
            message: "Network error. Please check your connection.",
            errorCode: "NETWORK_ERROR",
            statusCode: undefined,
            cause: error,
          });
        }
        /** @typedef {{
         errorCode: string;
         message: string;
         statusCode: number;
         cause?: any;
         stack?: string;
         }} ErrorResponseData
         */

        /** @type {ErrorResponseData} */
        const errorData = error.response.data;

        if (errorData?.name === "ValidationError") {
          throw new ValidationError({
            message: errorData?.message || "Validation failed",
            errorCode: errorData?.errorCode || "VALIDATION_ERROR",
            issues: errorData?.issues,
          });
        }

        throw new APIError({
          message: errorData?.message || `HTTP ${error.response.status}`,
          errorCode: errorData?.errorCode ?? "BAD_API_REQUEST",
          statusCode: errorData.statusCode,
          isOperational:
            typeof errorData?.statusCode === "number" &&
            errorData?.statusCode !== 500,
          errorData: {
            cause: errorData.cause,
            stack: errorData.stack,
            ...error.response.headers,
          },
        });
      },
    );
  }

  validateResponse(data, schema) {
    if (schema) {
      try {
        return schema.parse(data);
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const err = new ValidationError({
            message: "API response schema validation failed",
            errorCode: "API_RESPONSE_VALIDATION_FAILED",
            issues: validationError.issues,
          });
          console.error("Response validation error issues:", validationError.issues);
          console.error("Response validation error:", err.toJSON());
          throw err;
        }
      }
    }
    return data;
  }

  async makeRequest(config) {
    const response = await this.axiosInstance.request(config);
    return this.validateResponse(response.data, config?.schema);
  }
}

export const apiClient = new ApiClient({
  baseURL: envs.VITE_API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});
