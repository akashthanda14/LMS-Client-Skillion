# MicroCourses - Learning Management System

A modern, responsive Learning Management System built with Next.js 15, featuring JWT authentication and role-based access control.

## 🚀 Features

- **Authentication System**: JWT-based login/register with secure token storage
- **Role-Based Access Control**: Three user roles (LEARNER, CREATOR, ADMIN) with different permissions
- **Course Discovery**: Advanced search and filtering system for finding courses
- **Course Enrollment**: One-click enrollment with real-time feedback
- **Responsive Design**: Beautiful, mobile-first UI built with Tailwind CSS and ShadCN UI
- **Modern Stack**: Next.js 15, TypeScript, Framer Motion animations
- **State Management**: Zustand for efficient client-side state
- **API Integration**: Axios with interceptors and mock data fallbacks

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI Components
- **State Management**: Zustand with persistence
- **HTTP Client**: Axios with interceptors
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT tokens with automatic refresh

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Registration page
│   ├── courses/
│   │   ├── [id]/page.tsx          # Course detail page
│   │   └── page.tsx               # Course browsing page
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   └── not-found.tsx              # 404 page
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # Login form component
│   │   ├── RegisterForm.tsx       # Registration form
│   │   ├── Navigation.tsx         # Role-based navigation
│   │   ├── ProtectedRoute.tsx     # Route protection wrapper
│   │   └── AuthenticatedLayout.tsx # Authenticated layout
│   ├── courses/
│   │   ├── CourseCard.tsx         # Course card component
│   │   ├── CourseGrid.tsx         # Course grid layout
│   │   ├── CourseDetail.tsx       # Course detail display
│   │   ├── CourseFilters.tsx      # Search and filter controls
│   │   └── EnrollButton.tsx       # Enrollment functionality
│   └── ui/                        # ShadCN UI components
├── hooks/
│   └── useDebounce.ts             # Debounce hook for search
├── lib/
│   ├── api.ts                     # API configuration & types
│   ├── config.ts                  # App configuration
│   ├── mockData.ts                # Mock course data
│   └── utils.ts                   # Utility functions
├── store/
│   ├── authStore.ts               # Zustand auth store
│   └── courseStore.ts             # Zustand course store
└── middleware.ts                  # Next.js middleware
```

## 🔐 User Roles & Permissions

### LEARNER
- Access dashboard and personal learning content
- Enroll in courses and track progress
- View available courses

### CREATOR
- All learner permissions
- Create and manage courses
- Access creator studio and analytics

### ADMIN
- Full platform access
- User management and content moderation
- System administration tools

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ 
- Backend API running on `http://localhost:4000`

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd microcourses
npm install
```

2. **Set up environment variables:**
```bash
# Create .env.local file
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔌 API Integration

The frontend integrates with these backend endpoints:

### Authentication Endpoints
```
POST /auth/register
Body: { name: string, email: string, password: string }
Returns: { token: string, user: User }

POST /auth/login  
Body: { email: string, password: string }
Returns: { token: string, user: User }

GET /auth/me
Headers: { Authorization: "Bearer <token>" }
Returns: User object with role
```

### User Types
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'LEARNER' | 'CREATOR' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}
```

## 🎨 UI Components

Built with ShadCN UI components for consistency:
- **Forms**: Input, Label, Button with validation
- **Layout**: Card, Navigation Menu
- **Feedback**: Custom Toast notifications
- **Animation**: Framer Motion for smooth transitions

## 🔄 State Management

### Auth Store (Zustand)
```typescript
interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

## 🛡 Security Features

- **JWT Token Management**: Automatic token refresh and storage
- **Route Protection**: Middleware-based authentication
- **Role-Based Access**: Component-level permission checks
- **Secure Headers**: CORS and security headers configured
- **Input Validation**: Zod schemas for all forms

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t microcourses .
docker run -p 3000:3000 microcourses
```

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Touch-friendly interactions
- Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [ShadCN UI](https://ui.shadcn.com/) - Beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

---

Built with ❤️ for modern learning experiences.
