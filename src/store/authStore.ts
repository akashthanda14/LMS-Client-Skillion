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

interface AuthActions {
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
  
  // Password management
  forgotPassword: (emailOrPhone: string) => Promise<void>;
  resetPassword: (emailOrPhone: string, otp: string, newPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Email/Phone changes
  requestEmailChange: (newEmail: string) => Promise<void>;
  verifyEmailChange: (newEmail: string, otp: string) => Promise<void>;
  requestPhoneChange: (newPhone: string) => Promise<void>;
  verifyPhoneChange: (newPhone: string, otp: string) => Promise<void>;
  
  clearError: () => void;
  clearPendingVerification: () => void;
  
  // Debug function to manually sync token to cookie
  syncTokenToCookie: () => boolean;
}

// Implementation of a persist middleware with narrowed types
type StorageLike = { getItem: (name: string) => string | null; setItem: (name: string, value: string) => void };

function persist<TState>(
    createStore: (set: (partial: Partial<TState> | ((s: TState) => Partial<TState>)) => void, get: () => TState) => TState,
    options: {
        name: string;
        storage: StorageLike;
        partialize?: (state: TState) => Partial<TState>;
        onRehydrateStorage?: () => (state: Partial<TState> | null, error: unknown) => void;
    }
) {
    return (set: (partial: Partial<TState> | ((s: TState) => Partial<TState>)) => void, get: () => TState) => {
        // Load persisted state
        let hydrated = false;
        let persistedState: Partial<TState> | null = null;
        
        try {
            const storedState = options.storage.getItem(options.name);
            if (storedState) {
                persistedState = JSON.parse(storedState) as Partial<TState>;
                hydrated = true;
            }
        } catch (e) {
            console.error('Error loading persisted state:', e);
        }
        
        // Create the original store with a modified setter
        const store = createStore((state: Partial<TState> | ((s: TState) => Partial<TState>)) => {
            // Call the original set
            set(state as Partial<TState>);
            
            // Persist to storage
            try {
                const currentState = get();
                const persistableState = options.partialize ? 
                    options.partialize(currentState) : 
                    currentState;
                    
                options.storage.setItem(options.name, JSON.stringify(persistableState));
            } catch (e) {
                console.error('Error persisting state:', e);
            }
        }, get);
        
        // If we have persisted state, apply it once
        if (hydrated && persistedState) {
            set(persistedState as Partial<TState>);
        }
        
        // Call the rehydration callback if provided
        if (options.onRehydrateStorage) {
            try {
                options.onRehydrateStorage()(persistedState, null);
            } catch (e) {
                console.error('Error during rehydration callback:', e);
            }
        }
        
        return store;
    };
}

// Helper to create JSON storage
const createJSONStorage = (getStorage: () => Storage): StorageLike => ({
    getItem: (name: string) => {
        try {
            return getStorage().getItem(name);
        } catch {
            return null;
        }
    },
    setItem: (name: string, value: string) => {
        try {
            getStorage().setItem(name, value);
        } catch (e) {
            console.error('Error storing value:', e);
        }
    }
});

export const useAuthStore = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            // State
            user: null,
            token: null,
            profileToken: null,
            isLoading: false,
            isAuthenticated: false,
            pendingVerification: null,

            // Registration flow
            register: async (data: RegisterRequest) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.register(data);
                    
                    set({
                        pendingVerification: {
                            userId: response.userId,
                            contactInfo: response.contactInfo,
                            verificationType: response.verificationType,
                        },
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyEmail: async (email: string, otp: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.verifyEmail({ email, otp });
                    
                    if (response.requiresProfileCompletion && response.profileToken) {
                        // User needs to complete profile
                        set({
                            profileToken: response.profileToken,
                            isLoading: false,
                        });
                        return false; // Indicates profile completion needed
                    } else if (response.token && response.user) {
                        // User profile already complete
                        localStorage.setItem('token', response.token);
                        Cookies.set('token', response.token, { expires: 7, path: '/', sameSite: 'lax' });
                        set({
                            user: response.user,
                            token: response.token,
                            isAuthenticated: true,
                            pendingVerification: null,
                            isLoading: false,
                        });
                        return true; // Indicates login success
                    }
                    
                    set({ isLoading: false });
                    return false;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyPhone: async (phoneNumber: string, otp: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.verifyPhone({ phoneNumber, otp });
                    
                    if (response.requiresProfileCompletion && response.profileToken) {
                        set({
                            profileToken: response.profileToken,
                            isLoading: false,
                        });
                        return false;
                    } else if (response.token && response.user) {
                        localStorage.setItem('token', response.token);
                        Cookies.set('token', response.token, { expires: 7, path: '/', sameSite: 'lax' });
                        set({
                            user: response.user,
                            token: response.token,
                            isAuthenticated: true,
                            pendingVerification: null,
                            isLoading: false,
                        });
                        return true;
                    }
                    
                    set({ isLoading: false });
                    return false;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            completeProfile: async (name: string, password: string) => {
                try {
                    const { profileToken } = get();
                    if (!profileToken) {
                        throw new Error('No profile token available');
                    }
                    
                    set({ isLoading: true });
                    const response = await authAPI.completeProfile({ name, password, profileToken });
                    
                    localStorage.setItem('token', response.token);
                    Cookies.set('token', response.token, { expires: 7, path: '/', sameSite: 'lax' });
                    set({
                        user: response.user,
                        token: response.token,
                        profileToken: null,
                        isAuthenticated: true,
                        pendingVerification: null,
                        isLoading: false,
                    });
                    
                    return response.user;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            resendOTP: async (email?: string, phoneNumber?: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.resendOTP({ email, phoneNumber });
                    
                    set({
                        pendingVerification: {
                            userId: response.userId,
                            contactInfo: response.contactInfo,
                            verificationType: response.verificationType,
                        },
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Login
            login: async (credentials: LoginRequest) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.login(credentials);
                    
                    // Store token in both localStorage and cookies
                    syncTokenToCookie(response.token);
                    
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    
                    console.log('authStore: State updated, returning user:', response.user);
                    return response.user; // Return user for role-based routing
                } catch (error) {
                    console.error('authStore: Login error:', error);
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                // Clear cookie using js-cookie
                Cookies.remove('token');
                set({
                    user: null,
                    token: null,
                    profileToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    pendingVerification: null,
                });
            },

            // Check auth
            checkAuth: async () => {
                const token = localStorage.getItem('token');
                console.log('checkAuth: token exists?', !!token);
                
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    set({ isLoading: true });
                    console.log('checkAuth: calling /api/auth/me');
                    const response = await authAPI.me();
                    console.log('checkAuth: success, user:', response.user);
                    set({
                        user: response.user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('checkAuth: failed', error);
                    localStorage.removeItem('token');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },

            // Profile management
            updateProfile: async (name: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.updateProfile({ name });
                    set({
                        user: response.user,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Password management
            forgotPassword: async (emailOrPhone: string) => {
                try {
                    set({ isLoading: true });
                    await authAPI.forgotPassword({ emailOrPhone });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            resetPassword: async (emailOrPhone: string, otp: string, newPassword: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.resetPassword({ emailOrPhone, otp, newPassword });
                    
                    localStorage.setItem('token', response.token);
                    set({
                        user: response.user,
                        token: response.token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            changePassword: async (currentPassword: string, newPassword: string) => {
                try {
                    set({ isLoading: true });
                    await authAPI.changePassword({ currentPassword, newPassword });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            // Email/Phone changes
            requestEmailChange: async (newEmail: string) => {
                try {
                    set({ isLoading: true });
                    await authAPI.requestEmailChange({ newEmail });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyEmailChange: async (newEmail: string, otp: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.verifyEmailChange({ newEmail, otp });
                    set({
                        user: response.user,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            requestPhoneChange: async (newPhone: string) => {
                try {
                    set({ isLoading: true });
                    await authAPI.requestPhoneChange({ newPhone });
                    set({ isLoading: false });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            verifyPhoneChange: async (newPhone: string, otp: string) => {
                try {
                    set({ isLoading: true });
                    const response = await authAPI.verifyPhoneChange({ newPhone, otp });
                    set({
                        user: response.user,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            clearError: () => {
                // This can be extended to handle error states
            },

            clearPendingVerification: () => {
                set({ pendingVerification: null });
            },

            syncTokenToCookie: () => {
                const { token } = get();
                if (token) {
                    console.log('🔧 Manual sync: Syncing token to cookie');
                    const result = syncTokenToCookie(token);
                    return !!result; // Convert to boolean
                } else {
                    console.log('🔧 Manual sync: No token to sync');
                    return false;
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state, error) => {
                console.log('🔄 Storage rehydration triggered, state:', state, 'error:', error);
                
                if (error) {
                    console.error('❌ Rehydration error:', error);
                    return;
                }

                // When state is rehydrated, also restore the cookie
                if (state?.token && state?.isAuthenticated) {
                    console.log('🍪 Syncing token to cookie during rehydration');
                    syncTokenToCookie(state.token);
                    console.log('✅ Rehydrated with user:', state.user);
                } else {
                    console.log('⚠️ No token or not authenticated during rehydration');
                    // Try to restore from cookie if storage has nothing
                    const cookieToken = Cookies.get('token');
                    if (cookieToken) {
                        console.log('🔄 Found token in cookie, ready for checkAuth');
                    }
                }
            },
        }
    )
);
// Simple store factory function to replace zustand
function create<T extends object>() {
    return (creator: (set: (partial: Partial<T> | ((s: T) => Partial<T>)) => void, get: () => T) => T) => {
        const state = {} as T;
        const subscribers = new Set<() => void>();
        
        const store = creator(
            (nextState: Partial<T> | ((state: T) => Partial<T>)) => {
                Object.assign(state, typeof nextState === 'function' 
                    ? (nextState as (state: T) => Partial<T>)(state) 
                    : nextState
                );
                subscribers.forEach(callback => callback());
                return state;
            },
            () => state
        );
        
        // Return a simplified store with subscribe capability
        return {
            ...store,
            getState: () => state,
            setState: (nextState: Partial<T>) => {
                Object.assign(state, nextState);
                subscribers.forEach(callback => callback());
            },
            subscribe: (callback: () => void) => {
                subscribers.add(callback);
                return () => subscribers.delete(callback);
            }
        };
    };
}

