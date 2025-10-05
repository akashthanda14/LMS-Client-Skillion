'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authAPI, User, LoginRequest, RegisterRequest } from '@/lib/api';

// Helper function to ensure token is in both localStorage AND cookies
const syncTokenToCookie = (token: string) => {
  localStorage.setItem('token', token);
  
  // Set cookie using both methods for maximum compatibility
  Cookies.set('token', token, { expires: 7, path: '/', sameSite: 'lax' });
  
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
  document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  
  return Cookies.get('token');
};

interface AuthState {
  user: User | null;
  token: string | null;
  profileToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Registration flow state
  pendingVerification: {
    userId?: string;
    contactInfo?: string;
    verificationType?: 'email' | 'phone';
  } | null;
}

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'SET_PENDING_VERIFICATION'; payload: any }
  | { type: 'CLEAR_AUTH' }
  | { type: 'SET_PROFILE_TOKEN'; payload: string };

const initialState: AuthState = {
  user: null,
  token: null,
  profileToken: null,
  isLoading: false,
  isAuthenticated: false,
  pendingVerification: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_PENDING_VERIFICATION':
      return { ...state, pendingVerification: action.payload, isLoading: false };
    case 'CLEAR_AUTH':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        pendingVerification: null,
        isLoading: false,
      };
    case 'SET_PROFILE_TOKEN':
      return { ...state, profileToken: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  // Registration flow
  register: (data: RegisterRequest) => Promise<void>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  verifyPhone: (phoneNumber: string, otp: string) => Promise<boolean>;
  completeProfile: (name: string, password: string) => Promise<User>;
  resendOTP: (email?: string, phoneNumber?: string) => Promise<void>;
  
  // Login & Logout
  login: (credentials: LoginRequest) => Promise<User>;
  logout: () => void;
  
  // Profile
  checkAuth: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  updateUser: (user: User) => void;
  
  // Password management
  forgotPassword: (emailOrPhone: string) => Promise<void>;
  resetPassword: (emailOrPhone: string, otp: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Manual sync helper
  manualSyncToCookie: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuthImpl = useCallback(async () => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    console.log('checkAuth: token exists?', !!token);
    
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('checkAuth: calling /api/auth/me');
      const response = await authAPI.me();
      console.log('checkAuth: success, user:', response.user);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('auth-user', JSON.stringify(response.user));
      syncTokenToCookie(token);
      
      dispatch({
        type: 'SET_USER',
        payload: { user: response.user, token }
      });
    } catch (error) {
      console.error('checkAuth: failed', error);
      localStorage.removeItem('token');
      localStorage.removeItem('auth-user');
      Cookies.remove('token');
      dispatch({ type: 'CLEAR_AUTH' });
    }
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth-user', JSON.stringify(response.user));
      syncTokenToCookie(response.token);
      
      dispatch({
        type: 'SET_USER',
        payload: { user: response.user, token: response.token }
      });
      
      return response.user;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-user');
    Cookies.remove('token');
    dispatch({ type: 'CLEAR_AUTH' });
  }, []);

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(data);
      dispatch({
        type: 'SET_PENDING_VERIFICATION',
        payload: {
          userId: response.userId,
          contactInfo: data.email || data.phoneNumber,
          verificationType: data.email ? 'email' : 'phone',
        }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const verifyEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.verifyEmail({ email, otp });
      if (response.success && response.profileToken) {
        dispatch({ type: 'SET_PROFILE_TOKEN', payload: response.profileToken });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.success;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const verifyPhone = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.verifyPhone({ phoneNumber, otp });
      if (response.success && response.profileToken) {
        dispatch({ type: 'SET_PROFILE_TOKEN', payload: response.profileToken });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.success;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const completeProfile = async (name: string, password: string): Promise<User> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.completeProfile({ 
        name, 
        password, 
        profileToken: state.profileToken! 
      });
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth-user', JSON.stringify(response.user));
      syncTokenToCookie(response.token);
      
      dispatch({
        type: 'SET_USER',
        payload: { user: response.user, token: response.token }
      });
      
      return response.user;
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const resendOTP = async (email?: string, phoneNumber?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authAPI.resendOTP({ email, phoneNumber });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateProfile = async (name: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.updateProfile({ name });
      
      // Update localStorage
      localStorage.setItem('auth-user', JSON.stringify(response.user));
      
      dispatch({
        type: 'SET_USER',
        payload: { user: response.user, token: state.token! }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const forgotPassword = async (emailOrPhone: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authAPI.forgotPassword({ emailOrPhone });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const resetPassword = async (emailOrPhone: string, otp: string, newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.resetPassword({ emailOrPhone, otp, newPassword });
      
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('auth-user', JSON.stringify(response.user));
      syncTokenToCookie(response.token);
      
      dispatch({
        type: 'SET_USER',
        payload: { user: response.user, token: response.token }
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await authAPI.changePassword({ currentPassword, newPassword });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // These methods will be implemented when the API endpoints are available
  // const uploadProfilePicture = async (file: File): Promise<string> => { ... };
  // const changeEmail = async (newEmail: string, password: string) => { ... };
  // const changePhoneNumber = async (newPhoneNumber: string, password: string) => { ... };

  const manualSyncToCookie = (): boolean => {
    if (state.token) {
      console.log('🔧 Manual sync: Syncing token to cookie');
      const result = syncTokenToCookie(state.token);
      return !!result;
    } else {
      console.log('🔧 Manual sync: No token to sync');
      return false;
    }
  };

  // Manual update user (for profile changes or manual login like admin)
  const updateUser = useCallback((user: User) => {
    const token = localStorage.getItem('token');
    if (token) {
      localStorage.setItem('auth-user', JSON.stringify(user));
      dispatch({
        type: 'SET_USER',
        payload: { user, token }
      });
    }
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    register,
    verifyEmail,
    verifyPhone,
    completeProfile,
    resendOTP,
    login,
    logout,
    checkAuth: checkAuthImpl,
    updateProfile,
    updateUser,
    forgotPassword,
    resetPassword,
    changePassword,
    manualSyncToCookie,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
