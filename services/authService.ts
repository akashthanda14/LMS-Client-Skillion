/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import axios from 'axios';
import { getToken, clearAuth } from '@/utils/tokenStorage';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor - attach token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication and redirect to login
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Type Definitions
export interface RegisterRequest {
  email?: string;
  phoneNumber?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  verificationType: 'email' | 'phone';
  contactInfo?: string;
  requiresProfileCompletion: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface VerifyPhoneRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email?: string;
    phoneNumber?: string;
    name: string;
    emailVerified: boolean;
    phoneVerified?: boolean;
    isProfileComplete: boolean;
  };
  userId?: string;
  requiresProfileCompletion?: boolean;
}

export interface CompleteProfileRequest {
  userId: string;
  name: string;
  password: string;
  username?: string;
  fullName?: string;
  country?: string;
  state?: string;
  zip?: string;
}

export interface CompleteProfileResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    isProfileComplete: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export interface ApiError {
  success: boolean;
  message: string;
}

type AxiosLikeError = { response?: { data?: ApiError }; message?: string };

/**
 * Register a new user with email or phone
 * Also used for resending OTP
 */
export const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  } catch (err: unknown) {
    const e = err as AxiosLikeError;
    if (e.response?.data) {
      throw e.response.data;
    }
    throw {
      success: false,
      message: e.message || 'Network error. Please check your connection.',
    } as ApiError;
  }
};

/**
 * Verify email OTP
 */
export const verifyEmailOTP = async (email: string, otp: string): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post<VerificationResponse>('/api/auth/verify-email', {
      email,
      otp,
    });
    return response.data;
  } catch (err: unknown) {
    const e = err as AxiosLikeError;
    if (e.response?.data) {
      throw e.response.data;
    }
    throw {
      success: false,
      message: e.message || 'Network error. Please check your connection.',
    } as ApiError;
  }
};

/**
 * Verify phone OTP
 */
export const verifyPhoneOTP = async (phoneNumber: string, otp: string): Promise<VerificationResponse> => {
  try {
    const response = await apiClient.post<VerificationResponse>('/api/auth/verify-phone', {
      phoneNumber,
      otp,
    });
    return response.data;
  } catch (err: unknown) {
    const e = err as AxiosLikeError;
    if (e.response?.data) {
      throw e.response.data;
    }
    throw {
      success: false,
      message: e.message || 'Network error. Please check your connection.',
    } as ApiError;
  }
};

/**
 * Complete user profile after verification
 */
export const completeProfile = async (profileData: CompleteProfileRequest): Promise<CompleteProfileResponse> => {
  try {
    const response = await apiClient.post<CompleteProfileResponse>('/api/auth/complete-profile', profileData);
    return response.data;
  } catch (err: unknown) {
    const e = err as AxiosLikeError;
    if (e.response?.data) {
      throw e.response.data;
    }
    throw {
      success: false,
      message: e.message || 'Network error. Please check your connection.',
    } as ApiError;
  }
};

/**
 * Resend OTP (uses the same register endpoint)
 */
export const resendOTP = async (data: RegisterRequest): Promise<RegisterResponse> => {
  return registerUser(data);
};

export default apiClient;
