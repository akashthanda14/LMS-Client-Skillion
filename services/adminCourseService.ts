import { adminAPI } from '@/lib/api';

// Safe nested property accessor for unknown responses
function getNested<T>(obj: unknown, path: string[]): T | undefined {
  let cur: unknown = obj;
  for (const key of path) {
    if (typeof cur !== 'object' || cur === null) return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur as T | undefined;
}

// Normalize various adminAPI responses into a consistent shape:
// { data: { courses: CourseForReview[], statusCounts?: { PENDING, PUBLISHED, ... } } }
export const getCoursesForReview = async (status?: string) => {
  let res: unknown;
  if (status === 'ALL' || typeof status === 'undefined') {
    res = await adminAPI.getCourses();
  } else if (status === 'PENDING') {
    res = await adminAPI.getCoursesPending();
  } else if (status === 'PUBLISHED' || status === 'REJECTED') {
    // Pass only the allowed status union
    res = await adminAPI.getCourses(status as 'PUBLISHED' | 'REJECTED');
  } else {
    // Unknown status - fall back to listing all
    res = await adminAPI.getCourses();
  }

  const courses = getNested<unknown[]>(res, ['data', 'courses']) ?? getNested<unknown[]>(res, ['courses']) ?? [];
  const statusCounts = getNested<unknown>(res, ['data', 'statusCounts']) ?? getNested<unknown>(res, ['statusCounts']);

  const normalized = {
    data: {
      courses,
      statusCounts,
    },
  };

  return normalized;
};

export const getPendingCourses = async () => {
  const res2: unknown = await adminAPI.getCoursesPending();
  const courses = getNested<unknown[]>(res2, ['data', 'courses']) ?? getNested<unknown[]>(res2, ['applications']) ?? getNested<unknown[]>(res2, ['courses']) ?? [];
  return {
    data: {
      courses,
    },
  };
};

export const getCourseForReview = async (courseId: string) => {
  const res3: unknown = await adminAPI.getCourseDetail(courseId);
  const course = getNested<unknown>(res3, ['data', 'course']) ?? getNested<unknown>(res3, ['course']) ?? null;
  return {
    data: {
      course,
    },
  };
};

export const publishCourse = async (courseId: string) => {
  return adminAPI.publishCourse(courseId);
};

export const rejectCourse = async (courseId: string, feedback: string) => {
  return adminAPI.rejectCourse(courseId, { feedback });
};
