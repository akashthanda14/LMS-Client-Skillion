import { courseAPI, Course, CourseDetail } from '@/lib/api';

interface CourseState {
  courses: Course[];
  selectedCourse: CourseDetail | null;
  isLoading: boolean;
  isEnrolling: boolean;
  searchQuery: string;
  selectedLevel: string;
  error: string | null;
}

interface CourseActions {
  fetchCourses: () => Promise<void>;
  fetchCourseById: (id: string) => Promise<void>;
  enrollInCourse: (courseId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedLevel: (level: string) => void;
  clearError: () => void;
  clearSelectedCourse: () => void;
}

// Helper to extract a user-friendly message from unknown errors
function getErrorMessage(err: unknown, fallback = 'An error occurred'): string {
  if (!err || typeof err !== 'object') return fallback;
  const maybe = err as {
    response?: { data?: { message?: string } };
    message?: string;
  };
  return maybe.response?.data?.message ?? maybe.message ?? fallback;
}

export const useCourseStore = create<CourseState & CourseActions>((set: (arg0: { isLoading?: boolean; error?: string | null; courses?: Course[]; selectedCourse?: CourseDetail | null; isEnrolling?: boolean; searchQuery?: string; selectedLevel?: string; }) => void, get: () => { searchQuery?: string; selectedLevel?: string; selectedCourse?: CourseDetail | null; }) => ({
  // State
  courses: [],
  selectedCourse: null,
  isLoading: false,
  isEnrolling: false,
  searchQuery: '',
  selectedLevel: '',
  error: null,

  // Actions
  fetchCourses: async () => {
    try {
      set({ isLoading: true, error: null });
      const { searchQuery, selectedLevel } = get();
      console.log('Fetching courses with query:', searchQuery, 'level:', selectedLevel);
      const courses = await courseAPI.getCourses(
        searchQuery || undefined,
        selectedLevel || undefined
      );
      console.log('Received courses:', courses, 'Type:', typeof courses, 'IsArray:', Array.isArray(courses));
      
      // Safety check: ensure we have a valid array
      if (!Array.isArray(courses)) {
        console.error('API returned non-array:', courses);
        set({ courses: [], isLoading: false, error: 'Invalid course data received' });
        return;
      }
      
      set({ courses, isLoading: false });
    } catch (error: unknown) {
      console.error('Error fetching courses:', error);
      const message = getErrorMessage(error, 'Failed to fetch courses');
      set({ 
        courses: [], // Ensure courses is always an array
        error: message,
        isLoading: false 
      });
    }
  },

  fetchCourseById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const course = await courseAPI.getCourseById(id);
      set({ selectedCourse: course, isLoading: false });
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to fetch course details');
      set({ 
        error: message,
        isLoading: false 
      });
    }
  },

  enrollInCourse: async (courseId: string) => {
    try {
      set({ isEnrolling: true, error: null });
      await courseAPI.enrollInCourse(courseId);
      
      // Update the selected course to reflect enrollment
      const { selectedCourse } = get();
      if (selectedCourse && selectedCourse.id === courseId) {
        set({
          selectedCourse: { ...selectedCourse, isEnrolled: true },
          isEnrolling: false,
        });
      } else {
        set({ isEnrolling: false });
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to enroll in course');
      set({ 
        error: message,
        isEnrolling: false 
      });
      throw error;
    }
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  setSelectedLevel: (level: string) => {
    set({ selectedLevel: level });
  },

  clearError: () => {
    set({ error: null });
  },

  clearSelectedCourse: () => {
    set({ selectedCourse: null });
  },
}));
type StateCreator<T> = (
  set: (partial: Partial<T> | ((state: T) => Partial<T>)) => void,
  get: () => T
) => T;

// Allow `any` on selector return here because consumers rely on flexible selectors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function create<T>(stateCreator: StateCreator<T>): (selector?: (state: T) => any) => T {
    let state: T;
    const listeners = new Set<() => void>();
    
    const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
        const nextState = typeof partial === 'function' 
            ? { ...state, ...partial(state) } 
            : { ...state, ...partial };
        
        if (!Object.is(nextState, state)) {
            state = nextState;
            listeners.forEach(listener => listener());
        }
    };

    const getState = () => state;
    
    state = stateCreator(setState, getState) as T;
    
    const useStore = (selector = (state: T) => state) => {
        // This is a simplified version - in real implementation,
        // this would use React hooks to handle subscriptions
        return selector(state);
    };
    
    // Add subscribe method to allow external subscriptions
    useStore.subscribe = (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    };

    return useStore;
}

