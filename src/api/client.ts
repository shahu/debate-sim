/**
 * HTTP API Client for CPDL Debate Simulator backend.
 * Provides methods for making HTTP requests to the Python FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Log requests in development mode
 */
function logRequest(method: string, path: string, body?: unknown): void {
  if (import.meta.env.DEV) {
    console.log(`[API] ${method} ${path}`, body ? { body } : '');
  }
}

/**
 * Log responses in development mode
 */
function logResponse(path: string, response: unknown): void {
  if (import.meta.env.DEV) {
    console.log(`[API Response] ${path}:`, response);
  }
}

/**
 * API Error class for handling HTTP errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * HTTP API Client with methods for common operations
 */
export const apiClient = {
  /**
   * Make a GET request
   * @param path - API path (without base URL)
   * @returns Promise with JSON response
   */
  async get<T>(path: string): Promise<T> {
    logRequest('GET', path);
    
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new APIError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response
        );
      }
      
      const data = await response.json();
      logResponse(path, data);
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch ${path}: ${(error as Error).message}`);
    }
  },

  /**
   * Make a POST request
   * @param path - API path (without base URL)
   * @param body - Request body object
   * @returns Promise with JSON response
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    logRequest('POST', path, body);
    
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new APIError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response
        );
      }
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        logResponse(path, data);
        return data;
      } else {
        // Return blob for non-JSON responses (e.g., audio)
        return response.blob() as Promise<T>;
      }
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to post to ${path}: ${(error as Error).message}`);
    }
  },

  /**
   * Make a POST request that returns a streaming response
   * @param path - API path (without base URL)
   * @param body - Request body object
   * @returns Response object with readable stream
   */
  async postStream(path: string, body: unknown): Promise<Response> {
    logRequest('POST STREAM', path, body);
    
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        throw new APIError(
          `HTTP error! status: ${response.status}`,
          response.status,
          response
        );
      }
      
      if (!response.body) {
        throw new APIError('Response has no body');
      }
      
      return response;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to stream from ${path}: ${(error as Error).message}`);
    }
  },
};

/**
 * Get the configured API base URL
 * @returns The base URL for API requests
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
