// Minimal mock data used by development API routes and tests
import { Course } from './api';

export const mockCourses: Course[] = [
  {
    id: 'course_101',
    title: 'Intro to Testing',
    description: 'A short intro course used as mock data in development',
    thumbnail: '',
    thumbnailUrl: '',
    category: 'Development',
    level: 'BEGINNER',
    duration: 30,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    creator: { id: 'creator_1', name: 'Dev Creator', username: 'dev', email: 'dev@example.com' },
    lessonCount: 2,
    enrollmentCount: 0,
  }
];

export default mockCourses;
