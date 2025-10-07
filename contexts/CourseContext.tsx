'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { courseAPI, Course, CourseDetail } from '@/lib/api';

interface CourseState {
  courses: Course[];
  selectedCourse: CourseDetail | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  selectedCategory: string;
  selectedLevel: string;
  searchTerm: string;
  
  // Enrollment
  isEnrolling: boolean;
}

type CourseAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_SELECTED_COURSE'; payload: CourseDetail | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_SELECTED_COURSE' }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_LEVEL'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ENROLLING'; payload: boolean };

const initialState: CourseState = {
  courses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  selectedCategory: 'all',
  selectedLevel: 'all',
  searchTerm: '',
  isEnrolling: false,
};

function courseReducer(state: CourseState, action: CourseAction): CourseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, isLoading: false, error: null };
    case 'SET_SELECTED_COURSE':
      return { ...state, selectedCourse: action.payload, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_SELECTED_COURSE':
      return { ...state, selectedCourse: null };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_LEVEL':
      return { ...state, selectedLevel: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_ENROLLING':
      return { ...state, isEnrolling: action.payload };
    default:
      return state;
  }
}

interface CourseContextType extends CourseState {
  fetchCourses: () => Promise<void>;
  fetchCourseById: (courseId: string) => Promise<void>;
  setCategory: (category: string) => void;
  setLevel: (level: string) => void;
  setSearchTerm: (term: string) => void;
  clearError: () => void;
  clearSelectedCourse: () => void;
  enrollInCourse: (courseId: string) => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

interface CourseProviderProps {
  children: ReactNode;
}

export function CourseProvider({ children }: CourseProviderProps) {
  const [state, dispatch] = useReducer(courseReducer, initialState);

  const fetchCourses = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      console.log('fetchCourses called');
      
      const params = new URLSearchParams();
      if (state.selectedCategory && state.selectedCategory !== 'all') {
        params.append('category', state.selectedCategory);
      }
      if (state.selectedLevel && state.selectedLevel !== 'all') {
        params.append('level', state.selectedLevel);
      }
      if (state.searchTerm) {
        params.append('search', state.searchTerm);
      }

      const courses = await courseAPI.getCourses(params.toString());
      console.log('Received courses:', courses, 'Type:', typeof courses, 'IsArray:', Array.isArray(courses));
      
      if (!Array.isArray(courses)) {
        console.error('Expected array but received:', typeof courses);
        dispatch({ type: 'SET_ERROR', payload: 'Invalid response format' });
        return;
      }
      
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      console.error('Error fetching courses:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch courses' });
    }
  }, [state.selectedCategory, state.selectedLevel, state.searchTerm]);

  const setCategory = useCallback((category: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
  }, []);

  const setLevel = useCallback((level: string) => {
    dispatch({ type: 'SET_LEVEL', payload: level });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH', payload: term });
  }, []);

  const fetchCourseById = useCallback(async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const course = await courseAPI.getCourseById(courseId);
      dispatch({ type: 'SET_SELECTED_COURSE', payload: course });
    } catch (error) {
      console.error('Error fetching course:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch course' });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const clearSelectedCourse = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_COURSE' });
  }, []);

  const enrollInCourse = useCallback(async (courseId: string) => {
    try {
      dispatch({ type: 'SET_ENROLLING', payload: true });
      await courseAPI.enrollInCourse(courseId);
      // Refresh courses to update enrollment status
      await fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_ENROLLING', payload: false });
    }
  }, [fetchCourses]);

  const contextValue: CourseContextType = {
    ...state,
    fetchCourses,
    fetchCourseById,
    setCategory,
    setLevel,
    setSearchTerm,
    clearError,
    clearSelectedCourse,
    enrollInCourse,
  };

  return (
    <CourseContext.Provider value={contextValue}>
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
}
