import axios, { AxiosResponse, AxiosError } from 'axios';
import config from './config';
import { ReactNode } from 'react';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('auth-user');
      
      // Redirect to single login page for all users
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'LEARNER' | 'CREATOR' | 'ADMIN';
  isVerified?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isProfileComplete?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth Request/Response Types
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
  profileToken?: string;
  user?: User;
  requiresProfileCompletion?: boolean;
}

export interface CompleteProfileRequest {
  name: string;
  password: string;
  profileToken: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface AuthResponse {
  requiresVerification: any;
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ForgotPasswordRequest {
  emailOrPhone: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  contactType?: 'email' | 'phone';
  expiresIn?: number;
}

export interface ResetPasswordRequest {
  emailOrPhone: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  name?: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface ChangePhoneRequest {
  newPhone: string;
}

export interface VerifyChangeRequest {
  newEmail?: string;
  newPhone?: string;
  otp: string;
}

export interface ResendOTPRequest {
  email?: string;
  phoneNumber?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  thumbnailUrl?: string; // Backend field (alias for thumbnail)
  category: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration: number; // Duration in minutes
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  publishedAt?: string;
  creator: {
    id: string;
    name: string | null;
    username?: string;
    email?: string;
  };
  lessonCount: number;
  enrollmentCount: number;
}

export interface CourseDetail extends Course {
  lessons: Lesson[];
  isEnrolled: boolean;
  enrolled?: boolean; // Backend field (alias for isEnrolled)
  syllabus?: string;
  requirements?: string[];
  learningOutcomes?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  isCompleted?: boolean;
}

export interface LessonDetail extends Lesson {
  videoUrl?: string;
  transcript?: string;
  content?: string;
  courseId: string;
}

// Creator Application Types
export interface CreatorApplicationRequest {
  bio: string; // 100-500 characters
  portfolio?: string; // Optional valid URL
  experience: string; // Minimum 50 characters
}

export interface CreatorApplicationResponse {
  success: boolean;
  message: string;
  application: {
    id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
  };
}

export interface CreatorStatusResponse {
  success: boolean;
  data: {
    hasApplication: boolean;
    canApply: boolean;
    application?: {
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      createdAt: string;
      reviewedAt?: string;
      reviewedBy?: string;
      rejectionReason?: string;
    };
  };
}

export interface CreatorStats {
  totalStudents: any;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  totalLessons: number;
  totalCertificates: number;
}

export interface CreatorCourse {
  studentCount: ReactNode;
  id: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  lessonCount: number;
  enrollmentCount: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorDashboardResponse {
  success: boolean;
  dashboard: {
    creator: {
      id: string;
      name: string | null;
      username?: string;
      email: string;
    };
    application: {
      approvedAt: string;
      status: 'APPROVED';
    };
    stats: CreatorStats;
    courses: CreatorCourse[];
  };
}

export interface CreateCourseRequest {
  title: string; // 5-100 characters
  description: string; // 20-1000 characters
  thumbnail?: string; // Optional URL
  category?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  duration?: number; // Optional duration in minutes
}

export interface CreateCourseResponse {
  success: boolean;
  data: {
    id: string;
    status: 'DRAFT';
    creatorId: string;
    title: string;
    description: string;
    createdAt: string;
  };
}

// Course Editing Types
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface UpdateCourseResponse {
  success: boolean;
  data: Course;
}

// Cloudinary Upload Types
export interface CloudinaryUploadCredentials {
  uploadUrl: string;
  signature: string;
  timestamp: number;
  apiKey: string;
  publicId: string;
  cloudName: string;
  folder: string;
  resourceType: string;
  eager?: any[];
  eagerAsync?: boolean;
}

export interface GetUploadCredentialsResponse {
  success: boolean;
  data: CloudinaryUploadCredentials;
}

// Lesson Management Types
export interface CreateLessonRequest {
  title: string;
  videoUrl: string;
  order: number;
  transcript?: string;
}

export interface CreateLessonResponse {
  success: boolean;
  data: Lesson;
}

export interface UpdateLessonRequest {
  title?: string;
  order?: number;
  transcript?: string;
}

export interface UpdateLessonResponse {
  success: boolean;
  data: Lesson;
}

export interface DeleteLessonResponse {
  success: boolean;
  message: string;
}

export interface SubmitCourseResponse {
  success: boolean;
  data: {
    id: string;
    status: 'PENDING';
  };
}

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data: {
    enrollment: EnrollmentDetail;
  };
}

// Progress Tracking Types
export interface LessonProgressItem {
  id: string;
  lessonId: string;
  completed: boolean;
  watchedAt?: string;
  lesson: {
    id: string;
    title: string;
    order: number;
  };
}

export interface EnrollmentDetail {
  completedLessons: number;
  totalLessons: number;
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  completedAt?: string;
  lastAccessedAt?: string;
  course: {
    totalLessons: number;
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    lessonCount: number;
    creator: {
      id: string;
      name: string | null;
      username?: string;
    };
  };
  lessonProgress: LessonProgressItem[];
}

export interface GetProgressResponse {
  success: boolean;
  data: {
    enrollments: EnrollmentDetail[];
  };
}

export interface GetCourseProgressResponse {
  success: boolean;
  data: EnrollmentDetail;
}

export interface CompleteLessonResponse {
  success: boolean;
  message: string;
  data: {
    lessonProgress: {
      id: string;
      completed: boolean;
      watchedAt: string;
    };
    enrollment: {
      completedLessons: number;
      totalLessons: number;
      progress: number;
      completedAt?: string;
    };
  };
}
``
export interface EnrollmentStatusResponse {
  success: boolean;
  data: {
    // backend uses `enrolled` flag in your sample
    enrolled: boolean;
    // full enrollment detail when enrolled
    enrollment?: EnrollmentDetail;
  };
}

// Admin Types
export interface CreatorApplication {
  id: string;
  userId: string;
  bio: string;
  portfolio?: string;
  experience: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface PendingApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  portfolioUrl: string;
  experienceYears: number;
  createdAt?: string;
}

export interface GetApplicationsResponse {
  success: boolean;
  data: {
    applications: CreatorApplication[];
  };
}

export interface GetApplicationDetailResponse {
  success: boolean;
  data: {
    application: CreatorApplication;
  };
}

export interface ApplicationApproveRequest {
  // No fields required, but can send optional metadata
}

export interface ApplicationRejectRequest {
  reason: string; // Must be at least 10 characters
}

export interface ApplicationActionResponse {
  success: boolean;
  message: string;
  data?: {
    application: CreatorApplication;
  };
}

export interface CourseForReview {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionFeedback?: string;
  lessonCount: number;
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  lessons: Array<{
    id: string;
    title: string;
    order: number;
    videoUrl: string;
  }>;
}

export interface PendingCourse {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  lessonCount: number;
  thumbnailUrl?: string;
  createdAt?: string;
}

export interface GetCoursesForReviewResponse {
  success: boolean;
  data: {
    courses: CourseForReview[];
  };
}

export interface GetCourseDetailResponse {
  success: boolean;
  data: {
    course: CourseForReview;
  };
}

export interface CoursePublishRequest {
  // No fields required, but can send optional metadata
}

export interface CourseRejectRequest {
  feedback: string; // Must be at least 10 characters
}

export interface CourseActionRequest {
  comments?: string;
}

export interface CourseActionResponse {
  success: boolean;
  message: string;
  data?: {
    course: CourseForReview;
  };
}

// Admin Metrics Types (matches backend exactly)
export interface AdminMetrics {
  users?: {
    total: number;
    byRole?: {
      USER: number;
      CREATOR: number;
      ADMIN: number;
    };
    recentSignups: number;
  };
  courses?: {
    total: number;
    byStatus?: {
      DRAFT: number;
      PENDING: number;
      PUBLISHED: number;
      REJECTED: number;
    };
    recentlyCreated: number;
  };
  enrollments?: {
    total: number;
    active: number;
    completed: number;
    completionRate: string;
    recentEnrollments: number;
  };
  certificates?: {
    total: number;
    issuanceRate: string;
  };
  applications?: {
    total: number;
    byStatus?: {
      PENDING: number;
      APPROVED: number;
      REJECTED: number;
    };
  };
  timestamp?: string;
}

export interface GetAdminMetricsResponse {
  success: boolean;
  data: AdminMetrics;
}

export interface AdminMetricsSummary {
  pendingApplications: number;
  pendingCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  recentActivity: number;
}

export interface GetAdminMetricsSummaryResponse {
  success: boolean;
  data: AdminMetricsSummary;
}

export interface GrowthMetrics {
  users: {
    current: number;
    previous: number;
    growth: number;
    growthRate: string;
  };
  enrollments: {
    current: number;
    previous: number;
    growth: number;
    growthRate: string;
  };
  courses: {
    current: number;
    previous: number;
    growth: number;
    growthRate: string;
  };
  certificates: {
    current: number;
    previous: number;
    growth: number;
    growthRate: string;
  };
}

export interface GetGrowthMetricsResponse {
  success: boolean;
  data: GrowthMetrics;
}

export interface TopCourse {
  id: string;
  title: string;
  creator: {
    name: string;
    email: string;
  };
  enrollmentCount: number;
  completionRate: string;
  averageProgress: string;
}

export interface GetTopCoursesResponse {
  success: boolean;
  data: {
    courses: TopCourse[];
  };
}

export interface ActivityItem {
  id: string;
  type: 'enrollment' | 'completion' | 'course_published' | 'application_approved';
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface GetRecentActivityResponse {
  success: boolean;
  data: {
    activities: ActivityItem[];
  };
}

// Auth API functions
export const authAPI = {
  // Registration Flow
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/user-auth/register', data);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<VerificationResponse> => {
  const response = await api.post<VerificationResponse>('/api/user-auth/verify-email', data);
    return response.data;
  },

  verifyPhone: async (data: VerifyPhoneRequest): Promise<VerificationResponse> => {
    const response = await api.post<VerificationResponse>('/api/user-auth/verify-phone-otp', data);
    return response.data;
  },

  resendOTP: async (data: ResendOTPRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/user-auth/auth/resend-otp', data);
    return response.data;
  },

  completeProfile: async (data: CompleteProfileRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/user-auth/complete-profile', data);
    return response.data;
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/user-auth/login', data);
    return response.data;
  },

  // Check if user exists (email or phone) - used by frontend contact check
  checkUser: async (data: { emailOrPhone: string }): Promise<any> => {
    const response = await api.post('/api/user/auth/check-user', data);
    return response.data;
  },

  // Send OTP (existing user flow)
  sendOTP: async (data: { emailOrPhone: string }): Promise<any> => {
    const response = await api.post('/api/user/auth/send-otp', data);
    return response.data;
  },

  // Password Management
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/api/user-auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/user-auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    // Note: Backend doesn't have dedicated change-password endpoint
    // This would need to be implemented using /api/auth/me + custom logic
    throw new Error('Change password endpoint not implemented in backend. Use forgot password flow instead.');
  },

  // Token Management
  refreshToken: async (): Promise<{ success: boolean; token: string }> => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  // Profile
  me: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ success: boolean; user: User }> => {
    // Note: Backend uses /api/auth/me for profile updates
    const response = await api.patch('/api/auth/me', data);
    return response.data;
  },

  // Email Change
  requestEmailChange: async (data: ChangeEmailRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/user-auth/request-email-change', data);
    return response.data;
  },

  verifyEmailChange: async (data: VerifyChangeRequest): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/api/user-auth/verify-email-change', data);
    return response.data;
  },

  // Phone Change
  requestPhoneChange: async (data: ChangePhoneRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/api/user-auth/request-phone-change', data);
    return response.data;
  },

  verifyPhoneChange: async (data: VerifyChangeRequest): Promise<{ success: boolean; user: User }> => {
    const response = await api.post('/api/user-auth/verify-phone-change', data);
    return response.data;
  },
};

// Course API response types
interface GetCoursesResponse {
  success: boolean;
  count: number;
  courses: Course[];
}

interface GetCourseByIdResponse {
  success: boolean;
  course: CourseDetail;
}

// Course API functions
export const courseAPI = {
  getCourses: async (search?: string, level?: string): Promise<Course[]> => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (level) params.append('level', level);
      
      const response = await api.get<GetCoursesResponse>(`/api/courses?${params.toString()}`);
      // Extract courses array from response
      return response.data.courses;
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourseById: async (id: string): Promise<CourseDetail> => {
    try {
      const response = await api.get<GetCourseByIdResponse>(`/api/courses/${id}`);
      // Extract course object from response
      return response.data.course;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  enrollInCourse: async (courseId: string): Promise<EnrollmentResponse> => {
    try {
      const response = await api.post<EnrollmentResponse>(`/api/courses/${courseId}/enroll`);
      return response.data;
    } catch (error: any) {
      // Fallback to mock response for development
      if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockEnrollment: EnrollmentDetail = {
          completedLessons: 0,
          totalLessons: 0,
          id: Math.random().toString(36).substring(2, 9),
          userId: 'dev_user',
          courseId,
          progress: 0,
          enrolledAt: new Date().toISOString(),
          completedAt: undefined,
          lastAccessedAt: undefined,
          course: {
            totalLessons: 0,
            id: courseId,
            title: 'Dev Course',
            description: '',
            thumbnail: undefined,
            level: 'BEGINNER',
            lessonCount: 0,
            creator: { id: 'dev_creator', name: null }
          },
          lessonProgress: []
        };

        return {
          success: true,
          message: 'Successfully enrolled in course',
          data: {
            enrollment: mockEnrollment,
          }
        };
      }
      throw error;
    }
  },

  // Check enrollment status
  checkEnrollmentStatus: async (courseId: string): Promise<EnrollmentStatusResponse> => {
    const response = await api.get<EnrollmentStatusResponse>(`/api/courses/${courseId}/enrollment`);
    return response.data;
  },

  // Get all lessons for a course
  getCourseLessons: async (courseId: string): Promise<{ success: boolean; data: LessonDetail[] }> => {
    const response = await api.get<{ success: boolean; data: LessonDetail[] }>(`/api/courses/${courseId}/lessons`);
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId: string): Promise<GetCourseProgressResponse> => {
    const response = await api.get<GetCourseProgressResponse>(`/api/courses/${courseId}/progress`);
    return response.data;
  },

  // Update course details (for creators)
  updateCourse: async (courseId: string, data: UpdateCourseRequest): Promise<UpdateCourseResponse> => {
    const response = await api.patch<UpdateCourseResponse>(`/api/courses/${courseId}`, data);
    return response.data;
  },

  // Submit course for review
  submitCourse: async (courseId: string): Promise<SubmitCourseResponse> => {
    const response = await api.post<SubmitCourseResponse>(`/api/courses/${courseId}/submit`, {});
    return response.data;
  },

  // Delete course (CREATOR only, DRAFT only)
  deleteCourse: async (courseId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`/api/courses/${courseId}`);
    return response.data;
  },

  // Get Cloudinary upload credentials
  getUploadCredentials: async (courseId: string): Promise<GetUploadCredentialsResponse> => {
    const response = await api.post<GetUploadCredentialsResponse>(`/api/courses/${courseId}/lessons/upload`, {});
    return response.data;
  },

  // Create lesson after upload
  createLesson: async (courseId: string, data: CreateLessonRequest): Promise<CreateLessonResponse> => {
    const response = await api.post<CreateLessonResponse>(`/api/courses/${courseId}/lessons`, data);
    return response.data;
  },
};

// Lesson API functions
export const lessonAPI = {
  // Get lesson details
  getLessonById: async (lessonId: string): Promise<{ success: boolean; data: LessonDetail }> => {
    const response = await api.get<{ success: boolean; data: LessonDetail }>(`/api/lessons/${lessonId}`);
    return response.data;
  },

  // Mark lesson as complete
  completeLesson: async (lessonId: string): Promise<CompleteLessonResponse> => {
    const response = await api.post<CompleteLessonResponse>(`/api/lessons/${lessonId}/complete`, {});
    return response.data;
  },

  // Update lesson metadata or order
  updateLesson: async (lessonId: string, data: UpdateLessonRequest): Promise<UpdateLessonResponse> => {
    const response = await api.patch<UpdateLessonResponse>(`/api/lessons/${lessonId}`, data);
    return response.data;
  },

  // Delete lesson
  deleteLesson: async (lessonId: string): Promise<DeleteLessonResponse> => {
    const response = await api.delete<DeleteLessonResponse>(`/api/lessons/${lessonId}`);
    return response.data;
  },

  // Get transcript status
  getTranscriptStatus: async (lessonId: string): Promise<{ 
    success: boolean; 
    data: { status: string; progress?: number; transcriptUrl?: string } 
  }> => {
    const response = await api.get(`/api/lessons/${lessonId}/transcript-status`);
    return response.data;
  },
};

// Creator API functions
export const creatorAPI = {
  // Submit creator application
  submitApplication: async (data: CreatorApplicationRequest): Promise<CreatorApplicationResponse> => {
    const response = await api.post<CreatorApplicationResponse>('/api/creator/apply', data);
    return response.data;
  },

  // Check application status
  getStatus: async (): Promise<CreatorStatusResponse> => {
    const response = await api.get<CreatorStatusResponse>('/api/creator/status');
    return response.data;
  },

  // Get creator dashboard data
  getDashboard: async (): Promise<CreatorDashboardResponse> => {
    const response = await api.get<CreatorDashboardResponse>('/api/creator/dashboard');
    return response.data;
  },

  // Create new course
  createCourse: async (data: CreateCourseRequest): Promise<CreateCourseResponse> => {
    const response = await api.post<CreateCourseResponse>('/api/courses', data);
    return response.data;
  },

  // Get thumbnail upload credentials
  getThumbnailUploadCredentials: async (courseId: string): Promise<GetUploadCredentialsResponse> => {
    const response = await api.post<GetUploadCredentialsResponse>(`/api/courses/${courseId}/thumbnail/upload`, {});
    return response.data;
  },

  // Upload thumbnail to Cloudinary
  uploadThumbnail: async (credentials: any, file: File, onProgress?: (progress: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add signed parameters in alphabetical order (backend signs: folder, public_id, timestamp)
    formData.append('folder', credentials.folder);
    formData.append('public_id', credentials.publicId);
    formData.append('timestamp', credentials.timestamp);
    
    // Add signature and api_key (not signed but required)
    formData.append('signature', credentials.signature);
    formData.append('api_key', credentials.apiKey);

    const response = await fetch(credentials.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary thumbnail upload failed:', response.status, errorText);
      throw new Error(`Thumbnail upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.secure_url;
  },

  // Upload video to Cloudinary with progress tracking
  uploadVideo: async (credentials: any, file: File, onProgress?: (progress: number) => void): Promise<{ url: string; duration: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add signed parameters in alphabetical order (backend signs: folder, public_id, timestamp)
    formData.append('folder', credentials.folder);
    formData.append('public_id', credentials.publicId);
    formData.append('timestamp', credentials.timestamp);
    
    // Add signature and api_key (not signed but required)
    formData.append('signature', credentials.signature);
    formData.append('api_key', credentials.apiKey);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            onProgress(percentage);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          resolve({
            url: result.secure_url,
            duration: result.duration || 0,
          });
        } else {
          console.error('Cloudinary video upload failed:', xhr.status, xhr.responseText);
          reject(new Error(`Video upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

      xhr.open('POST', credentials.uploadUrl);
      xhr.send(formData);
    });
  },

  // Persist uploaded thumbnail URL to course
  updateThumbnail: async (courseId: string, thumbnailUrl: string): Promise<UpdateCourseResponse> => {
    const response = await api.patch<UpdateCourseResponse>(`/api/courses/${courseId}/thumbnail`, { thumbnailUrl });
    return response.data;
  },
};

// Admin API functions
export const adminAPI = {
  // Get all applications (filterable by status)
  getApplications: async (status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<GetApplicationsResponse> => {
    const url = status 
      ? `/api/admin/applications?status=${status}` 
      : '/api/admin/applications';
    const response = await api.get<GetApplicationsResponse>(url);
    return response.data;
  },

  // Get pending applications (shortcut endpoint)
  getApplicationsPending: async (): Promise<GetApplicationsResponse> => {
    const response = await api.get<GetApplicationsResponse>('/api/admin/applications/pending');
    return response.data;
  },

  // Get single application detail
  getApplication: async (applicationId: string): Promise<GetApplicationDetailResponse> => {
    const response = await api.get<GetApplicationDetailResponse>(`/api/admin/applications/${applicationId}`);
    return response.data;
  },

  // Approve creator application
  approveApplication: async (applicationId: string, data?: ApplicationApproveRequest): Promise<ApplicationActionResponse> => {
    const response = await api.post<ApplicationActionResponse>(
      `/api/admin/applications/${applicationId}/approve`, 
      data || {}
    );
    return response.data;
  },

  // Reject creator application (reason required, min 10 chars)
  rejectApplication: async (applicationId: string, data: ApplicationRejectRequest): Promise<ApplicationActionResponse> => {
    const response = await api.post<ApplicationActionResponse>(
      `/api/admin/applications/${applicationId}/reject`, 
      data
    );
    return response.data;
  },

  // Get all courses (filterable by status)
  getCourses: async (status?: 'PENDING' | 'PUBLISHED' | 'REJECTED'): Promise<GetCoursesForReviewResponse> => {
    const url = status 
      ? `/api/admin/courses?status=${status}` 
      : '/api/admin/courses';
    const response = await api.get<GetCoursesForReviewResponse>(url);
    return response.data;
  },

  // Get pending courses (shortcut endpoint)
  getCoursesPending: async (): Promise<GetCoursesForReviewResponse> => {
    const response = await api.get('/api/admin/courses/pending');

    // Normalize server shapes:
    // - { success, data: { courses: [...] } }
    // - { success, count, courses: [...] }
    if (response.data && response.data.data && response.data.data.courses) {
      return { success: true, data: { courses: response.data.data.courses } } as GetCoursesForReviewResponse;
    }

    if (response.data && response.data.courses) {
      return { success: true, data: { courses: response.data.courses } } as GetCoursesForReviewResponse;
    }

    // Fallback: return empty list
    return { success: false, data: { courses: [] } } as GetCoursesForReviewResponse;
  },

  // Get single course detail for review
  getCourseDetail: async (courseId: string): Promise<GetCourseDetailResponse> => {
    const response = await api.get<GetCourseDetailResponse>(`/api/admin/courses/${courseId}`);
    return response.data;
  },

  // Publish a course
  publishCourse: async (courseId: string, data?: CoursePublishRequest): Promise<CourseActionResponse> => {
    const response = await api.post<CourseActionResponse>(
      `/api/admin/courses/${courseId}/publish`, 
      data || {}
    );
    return response.data;
  },

  // Reject a course (feedback required, min 10 chars)
  rejectCourse: async (courseId: string, data: CourseRejectRequest): Promise<CourseActionResponse> => {
    const response = await api.post<CourseActionResponse>(
      `/api/admin/courses/${courseId}/reject`, 
      data
    );
    return response.data;
  },

  // Get admin dashboard metrics
  getMetrics: async (): Promise<GetAdminMetricsResponse> => {
    const response = await api.get<GetAdminMetricsResponse>('/api/admin/metrics');
    return response.data;
  },

  // Get lightweight summary metrics (for frequent polling)
  getMetricsSummary: async (): Promise<GetAdminMetricsSummaryResponse> => {
    const response = await api.get<GetAdminMetricsSummaryResponse>('/api/admin/metrics/summary');
    return response.data;
  },

  // Get growth analytics (last 30 days vs previous 30 days)
  getGrowthMetrics: async (): Promise<GetGrowthMetricsResponse> => {
    const response = await api.get<GetGrowthMetricsResponse>('/api/admin/metrics/growth');
    return response.data;
  },

  // Get top courses by enrollment
  getTopCourses: async (limit: number = 10): Promise<GetTopCoursesResponse> => {
    const response = await api.get<GetTopCoursesResponse>(`/api/admin/metrics/top-courses?limit=${limit}`);
    return response.data;
  },

  // Get recent activity feed
  getRecentActivity: async (limit: number = 20): Promise<GetRecentActivityResponse> => {
    const response = await api.get<GetRecentActivityResponse>(`/api/admin/metrics/activity?limit=${limit}`);
    return response.data;
  },
};

// Progress & Certificate Types
export interface EnrollmentProgress {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  thumbnailUrl?: string;
}

export interface CertificateMetadata {
  serialHash: string;
  issuedAt: string;
  certificateUrl: string;
}

export interface Certificate {
  id: string;
  serialNumber: string;
  serialHash: string;
  issuedAt: string;
  imageUrl: string;
  enrollment: {
    id: string;
    completedAt: string;
    course: {
      id: string;
      title: string;
      thumbnail?: string;
      category?: string;
    };
  };
}

export interface GetCertificateResponse {
  success: boolean;
  data: {
    certificate: Certificate;
  };
}

export interface GetCertificatesResponse {
  success: boolean;
  data: {
    certificates: Certificate[];
    total?: number;
  };
}

export interface CertificateVerification {
  valid: boolean;
  courseTitle?: string;
  learnerName?: string;
  issuedAt?: string;
}

export interface VerifyCertificateResponse {
  success: boolean;
  data: CertificateVerification;
}

// Progress & Certificate API functions
export const progressAPI = {
  // Get user's enrollments and progress
  getProgress: async (): Promise<GetProgressResponse> => {
    const response = await api.get<GetProgressResponse>('/api/progress');
    return response.data;
  },

  // Get certificate metadata
  getCertificate: async (enrollmentId: string): Promise<GetCertificateResponse> => {
    const response = await api.get(`/api/enrollments/${enrollmentId}/certificate`);
    // Normalize: backend may return { success, data: { certificate } } or { success, certificate }
    if (response.data && response.data.data && response.data.data.certificate) {
      return { success: true, data: { certificate: response.data.data.certificate } } as GetCertificateResponse;
    }
    if (response.data && response.data.certificate) {
      return { success: true, data: { certificate: response.data.certificate } } as GetCertificateResponse;
    }
    // Fallback - preserve existing structure
    return response.data as GetCertificateResponse;
  },

  // Poll until certificate metadata is available or timeout
  waitForCertificate: async (
    enrollmentId: string,
    options?: { intervalMs?: number; timeoutMs?: number }
  ): Promise<GetCertificateResponse> => {
    const interval = options?.intervalMs ?? 3000;
    const timeout = options?.timeoutMs ?? 60000; // default 60s
    const start = Date.now();

    while (Date.now() - start < timeout) {
      try {
        const response = await api.get(`/api/enrollments/${enrollmentId}/certificate`);

        // Normalize similar to getCertificate
        if (response.data && response.data.data && response.data.data.certificate) {
          return { success: true, data: { certificate: response.data.data.certificate } } as GetCertificateResponse;
        }
        if (response.data && response.data.certificate) {
          return { success: true, data: { certificate: response.data.certificate } } as GetCertificateResponse;
        }

        // If server returned 200 but no certificate payload yet, wait and retry
      } catch (err: any) {
        // If 404 Not Found, certificate isn't created yet - continue polling
        if (err.response?.status === 404) {
          // continue polling
        } else {
          // For other errors, surface immediately
          throw err;
        }
      }

      // wait before next attempt
      await new Promise((res) => setTimeout(res, interval));
    }

    throw new Error('Certificate not available yet (timed out)');
  },

  // Get all user certificates
  getUserCertificates: async (): Promise<GetCertificatesResponse> => {
    const response = await api.get('/api/certificates');
    // Normalize to { success, data: { certificates, total } }
    if (response.data && response.data.data && response.data.data.certificates) {
      return { success: true, data: { certificates: response.data.data.certificates, total: response.data.data.total } } as GetCertificatesResponse;
    }
    if (response.data && response.data.certificates) {
      // older shape
      return { success: true, data: { certificates: response.data.certificates, total: response.data.total } } as GetCertificatesResponse;
    }
    return response.data as GetCertificatesResponse;
  },

  // Download certificate PDF (returns blob URL)
  downloadCertificate: async (enrollmentId: string): Promise<{ type: 'pdf'; url: string } | { type: 'json'; data: any }> => {
    // Try to fetch as blob first; if backend returns JSON (current dev behavior), return parsed JSON
    const response = await api.get(`/api/enrollments/${enrollmentId}/certificate/download`, {
      responseType: 'blob',
    });

    const contentType = response.headers['content-type'] || response.headers['Content-Type'] || '';

    // If backend returns PDF
    if (contentType.includes('application/pdf')) {
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      return { type: 'pdf', url };
    }

    // Otherwise try to parse blob as text JSON
    try {
      const text = await response.data.text();
      const json = JSON.parse(text);
      return { type: 'json', data: json };
    } catch (err) {
      // Unknown blob type - return as JSON fallback
      return { type: 'json', data: { success: false, message: 'Unsupported download response' } };
    }
  },

  // Verify certificate (public, no auth required)
  verifyCertificate: async (serialHash: string): Promise<VerifyCertificateResponse> => {
    const response = await api.get<VerifyCertificateResponse>(`/api/certificates/verify/${serialHash}`);
    return response.data;
  },
};

export default api;
