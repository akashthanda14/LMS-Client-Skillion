import { Course, CourseDetail } from '@/lib/api';

// Mock data for development and testing
export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    description: 'Learn the basics of React including components, props, state, and hooks. Perfect for beginners who want to start building modern web applications.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
    price: 0,
    duration: 240,
    level: 'BEGINNER',
    status: 'PUBLISHED',
    creatorId: 'creator1',
    creator: {
      id: 'creator1',
      name: 'John Smith'
    },
    enrollmentCount: 1247,
    rating: 4.8,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    title: 'Advanced TypeScript',
    description: 'Master advanced TypeScript concepts including generics, decorators, and advanced type manipulation. Build type-safe applications with confidence.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop',
    price: 49,
    duration: 360,
    level: 'ADVANCED',
    status: 'PUBLISHED',
    creatorId: 'creator2',
    creator: {
      id: 'creator2',
      name: 'Sarah Johnson'
    },
    enrollmentCount: 892,
    rating: 4.9,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn authentication, API design, and deployment strategies.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&h=300&fit=crop',
    price: 79,
    duration: 480,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    creatorId: 'creator3',
    creator: {
      id: 'creator3',
      name: 'Mike Chen'
    },
    enrollmentCount: 634,
    rating: 4.7,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: '4',
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamental principles of user interface and user experience design. Create beautiful and intuitive digital experiences.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    price: 39,
    duration: 300,
    level: 'BEGINNER',
    status: 'PUBLISHED',
    creatorId: 'creator4',
    creator: {
      id: 'creator4',
      name: 'Emily Davis'
    },
    enrollmentCount: 2103,
    rating: 4.6,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z'
  },
  {
    id: '5',
    title: 'Python for Data Science',
    description: 'Analyze data and build machine learning models with Python. Master pandas, numpy, matplotlib, and scikit-learn.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
    price: 89,
    duration: 600,
    level: 'INTERMEDIATE',
    status: 'PUBLISHED',
    creatorId: 'creator5',
    creator: {
      id: 'creator5',
      name: 'Dr. Alex Kumar'
    },
    enrollmentCount: 1567,
    rating: 4.9,
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z'
  },
  {
    id: '6',
    title: 'DevOps Fundamentals',
    description: 'Learn containerization with Docker, CI/CD pipelines, and cloud deployment. Bridge the gap between development and operations.',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500&h=300&fit=crop',
    price: 99,
    duration: 420,
    level: 'ADVANCED',
    status: 'PUBLISHED',
    creatorId: 'creator6',
    creator: {
      id: 'creator6',
      name: 'Robert Wilson'
    },
    enrollmentCount: 743,
    rating: 4.8,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z'
  }
];

export const mockCourseDetail: CourseDetail = {
  ...mockCourses[0],
  isEnrolled: false,
  syllabus: `This comprehensive React course will take you from beginner to confident React developer. You'll learn all the fundamentals including:

• Component architecture and best practices
• State management with hooks
• Handling events and user interactions  
• Working with forms and controlled components
• Making API calls and handling async operations
• Routing with React Router
• Testing React applications

By the end of this course, you'll have built several real-world projects and have the skills to create your own React applications from scratch.`,
  requirements: [
    'Basic knowledge of HTML, CSS, and JavaScript',
    'Familiarity with ES6+ features (arrow functions, destructuring, etc.)',
    'A computer with Node.js installed',
    'A code editor (VS Code recommended)'
  ],
  learningOutcomes: [
    'Build modern React applications from scratch',
    'Understand component lifecycle and state management',
    'Work with React hooks effectively',
    'Handle forms and user input validation',
    'Implement routing and navigation',
    'Write tests for React components',
    'Deploy React applications to production'
  ],
  lessons: [
    {
      id: 'lesson1',
      title: 'Introduction to React',
      description: 'What is React and why use it? Setting up your development environment.',
      duration: '15 min',
      order: 1,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson2',
      title: 'Your First Component',
      description: 'Create your first React component and understand JSX syntax.',
      duration: '20 min',
      order: 2,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson3',
      title: 'Props and Data Flow',
      description: 'Learn how to pass data between components using props.',
      duration: '25 min',
      order: 3,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson4',
      title: 'State and Event Handling',
      description: 'Manage component state and respond to user interactions.',
      duration: '30 min',
      order: 4,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson5',
      title: 'Knowledge Check',
      description: 'Test your understanding of React fundamentals.',
      duration: '10 min',
      order: 5,
      type: 'QUIZ',
      isCompleted: false
    },
    {
      id: 'lesson6',
      title: 'React Hooks Introduction',
      description: 'Introduction to useState and useEffect hooks.',
      duration: '35 min',
      order: 6,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson7',
      title: 'Building a Todo App',
      description: 'Put it all together by building a complete todo application.',
      duration: '45 min',
      order: 7,
      type: 'VIDEO',
      isCompleted: false
    },
    {
      id: 'lesson8',
      title: 'Final Project',
      description: 'Build your own React project to demonstrate your skills.',
      duration: '30 min',
      order: 8,
      type: 'TEXT',
      isCompleted: false
    }
  ]
};
