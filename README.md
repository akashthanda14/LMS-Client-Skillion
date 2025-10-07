# Features & Functionalities

This project is a full-featured, production-ready learning management system.

## 🚀 Core Functionalities

- **User Authentication:**
  - Secure registration and login (Email/Phone).
  - JWT-based session management and Google OAuth 2.0.
  - Full password lifecycle: Forgot/Reset password with OTP verification.
  - User profile completion and updates.
- **Roles & Access Control:**
  - Pre-defined roles: **Admin**, **Instructor**, and **Learner**.
  - Protected endpoints and granular access checks for role-based permissions.
- **Course & Lesson Management:**
  - Full CRUD (Create, Read, Update, Delete) for courses.
  - Nested CRUD for lessons within courses.
  - Rich lesson metadata: title, video URL, display order, and duration.
- **Enrollments & Progress Tracking:**
  - Seamless user enrollment into courses.
  - Endpoints to track lesson completion and overall course progress.
  - Idempotent progress updates.
- **Automated Certificate Generation:**
  - Asynchronous PDF certificate generation using a background queue.
  - Secure download endpoint for learners.
  - Public certificate verification system using a unique serial hash.
- **Media & Transcription Pipeline:**
  - Automated video transcription using a job queue.
  - Polling endpoint to check transcription status.
  - Cloudinary integration for robust video and image asset management.

## 🛠️ Developer Experience & DevOps

- **Database & ORM:**
  - **Prisma** with **PostgreSQL** for a type-safe database layer, including schema and migrations.
- **API Documentation:**
  - **Swagger (OpenAPI)** specification automatically generated from controller-level YAML files.
  - Interactive Swagger UI served at `/api/docs`.
- **Background Jobs & Queues:**
  - **BullMQ + Redis** for reliable, asynchronous job processing.
  - Dedicated workers for certificate generation and transcription with retry/failure handling.
- **Emails & Notifications:**
  - Flexible email delivery via **Resend**, SMTP, or **Nodemailer**.
- **Testing & Quality Assurance:**
  - Scaffolding for unit and integration tests with **Jest**.
  - Scripts for endpoint health checks and E2E smoke tests.
- **Deployment & Configuration:**
  - **Docker-ready** and configured for easy deployment on platforms like Render.
  - Centralized environment configuration using `.env` files.

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
│   ├── my-courses/page.tsx         # User's enrolled courses
│   ├── certificates/page.tsx       # User certificates list
│   ├── certificates/verify/[serialHash]/page.tsx # Certificate verification
│   ├── learn/[lessonId]/page.tsx   # Lesson player
│   └── not-found.tsx               # 404 page
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
│   ├── progress/
│   │   ├── CoursePageCertificateBanner.tsx # Certificate banner
│   │   └── CertificateDownload.tsx # Download and preview control
│   ├── certificates/
│   │   ├── CertificateCard.tsx    # Certificate card
│   │   └── CertificateDownloadButton.tsx # Download button
│   └── ui/                        # ShadCN UI components
├── hooks/
│   ├── useDebounce.ts             # Debounce hook for search
│   └── useTranscriptPolling.ts    # Polling hook for transcripts
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

### Course and Enrollment Endpoints
```
GET /api/courses
Returns: List of available courses

GET /api/courses/:id
Returns: Course details

POST /api/enrollments
Body: { courseId: string }
Returns: Enrollment object

GET /api/enrollments/:id/progress
Returns: Progress data for enrollment

POST /api/enrollments/:id/certificate/generate
Returns: Certificate generation status

GET /api/enrollments/:id/certificate
Returns: Certificate metadata

GET /api/enrollments/:id/certificate/download
Returns: PDF blob for certificate
```

### Certificate Endpoints
```
GET /api/certificates
Returns: List of user's certificates

GET /api/certificates/verify/:serialHash
Returns: Certificate verification data
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
- **Certificates**: CertificateCard, CertificateDownload, CoursePageCertificateBanner for certificate management

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
- **Certificate Verification**: Public verification of certificates by serial hash

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
