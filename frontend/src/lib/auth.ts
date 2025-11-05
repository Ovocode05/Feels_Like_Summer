import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

/**
 * Check if a JWT token is expired
 * @param token - The JWT token to check
 * @returns true if expired, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Add a 30 second buffer to refresh before actual expiration
    return decoded.exp < currentTime + 30;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

/**
 * Get the current token from localStorage
 */
export const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

/**
 * Set token in localStorage
 */
export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

/**
 * Check if user is authenticated with a valid token
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !isTokenExpired(token);
};
