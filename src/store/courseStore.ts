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

export const useCourseStore = create<CourseState & CourseActions>((set: (arg0: { isLoading?: boolean; error?: any; courses?: Course[] | never[]; selectedCourse?: any; isEnrolling?: boolean; searchQuery?: string; selectedLevel?: string; }) => void, get: () => { searchQuery?: any; selectedLevel?: any; selectedCourse?: any; }) => ({
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
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      set({ 
        courses: [], // Ensure courses is always an array
        error: error.response?.data?.message || 'Failed to fetch courses',
        isLoading: false 
      });
    }
  },

  fetchCourseById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const course = await courseAPI.getCourseById(id);
      set({ selectedCourse: course, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch course details',
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
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to enroll in course',
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

