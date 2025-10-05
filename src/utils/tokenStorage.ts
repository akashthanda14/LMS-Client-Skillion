/**
 * Token Storage Utility
 * Supports three storage strategies:
 * 1. memory - Most secure, tokens lost on page refresh
 * 2. localStorage - Persists across sessions, XSS risk
 * 3. sessionStorage - Persists during session only
 * 
 * Configure via NEXT_PUBLIC_TOKEN_STORAGE env variable
 */

type StorageStrategy = 'memory' | 'localStorage' | 'sessionStorage';

// In-memory storage
let memoryToken: string | null = null;
let memoryUser: any = null;

/**
 * Get configured storage strategy from environment
 */
const getStorageStrategy = (): StorageStrategy => {
  const strategy = process.env.NEXT_PUBLIC_TOKEN_STORAGE as StorageStrategy;
  if (['memory', 'localStorage', 'sessionStorage'].includes(strategy)) {
    return strategy;
  }
  return 'memory'; // Default to most secure option
};

/**
 * Store authentication token
 */
export const setToken = (token: string): void => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }
      break;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authToken', token);
      }
      break;
    case 'memory':
    default:
      memoryToken = token;
      break;
  }
};

/**
 * Retrieve authentication token
 */
export const getToken = (): string | null => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
      }
      return null;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('authToken');
      }
      return null;
    case 'memory':
    default:
      return memoryToken;
  }
};

/**
 * Clear authentication token
 */
export const clearToken = (): void => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      break;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authToken');
      }
      break;
    case 'memory':
    default:
      memoryToken = null;
      break;
  }
};

/**
 * Store user data
 */
export const setUser = (user: any): void => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        localStorage.setItem('authUser', JSON.stringify(user));
      }
      break;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('authUser', JSON.stringify(user));
      }
      break;
    case 'memory':
    default:
      memoryUser = user;
      break;
  }
};

/**
 * Retrieve user data
 */
export const getUser = (): any | null => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('authUser');
        return userData ? JSON.parse(userData) : null;
      }
      return null;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        const userData = sessionStorage.getItem('authUser');
        return userData ? JSON.parse(userData) : null;
      }
      return null;
    case 'memory':
    default:
      return memoryUser;
  }
};

/**
 * Clear user data
 */
export const clearUser = (): void => {
  const strategy = getStorageStrategy();
  
  switch (strategy) {
    case 'localStorage':
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authUser');
      }
      break;
    case 'sessionStorage':
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('authUser');
      }
      break;
    case 'memory':
    default:
      memoryUser = null;
      break;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = (): void => {
  clearToken();
  clearUser();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};
