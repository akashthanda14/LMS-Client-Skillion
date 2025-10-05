import { adminAPI } from '@/lib/api';

// Normalize various adminAPI responses into a consistent shape:
// { data: { courses: CourseForReview[], statusCounts?: { PENDING, PUBLISHED, ... } } }
export const getCoursesForReview = async (status?: string) => {
  let res: any;
  if (status === 'ALL' || typeof status === 'undefined') {
    res = await adminAPI.getCourses();
  } else if (status === 'PENDING') {
    res = await adminAPI.getCoursesPending();
  } else {
    res = await adminAPI.getCourses(status as any);
  }

  // adminAPI may return either { success, data: { courses } } or { success, courses, statusCounts }
  const r = res as any;
  const normalized = {
    data: {
      courses: r?.data?.courses ?? r?.courses ?? [],
      statusCounts: r?.data?.statusCounts ?? r?.statusCounts,
    },
  };

  return normalized;
};

export const getPendingCourses = async () => {
  const res2 = await adminAPI.getCoursesPending();
  const r2 = res2 as any;
  return {
    data: {
      courses: r2?.data?.courses ?? r2?.applications ?? r2?.courses ?? [],
    },
  };
};

export const getCourseForReview = async (courseId: string) => {
  const res3 = await adminAPI.getCourseDetail(courseId);
  const r3 = res3 as any;
  return {
    data: {
      course: r3?.data?.course ?? r3?.course ?? null,
    },
  };
};

export const publishCourse = async (courseId: string) => {
  return adminAPI.publishCourse(courseId);
};

export const rejectCourse = async (courseId: string, feedback: string) => {
  return adminAPI.rejectCourse(courseId, { feedback });
};
