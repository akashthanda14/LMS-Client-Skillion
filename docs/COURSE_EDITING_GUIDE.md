# Course & Lesson Management - Implementation Guide

## Overview
Complete course editing interface for creators to manage courses, upload video lessons, and submit for review.

## Features Implemented

### 1. Course Editor (`/creator/courses/[id]/edit`)
- **Course Details Form**: Edit title, description, and thumbnail URL
- **Real-time Validation**: Character limits and URL validation
- **Thumbnail Preview**: Live preview of course thumbnail
- **Auto-save Feedback**: Visual confirmation when changes are saved

### 2. Video Lesson Upload (`LessonUploader.tsx`)
- **Drag-and-Drop Upload**: Drag video files or click to browse
- **File Validation**: 
  - Only video files accepted
  - Max file size: 500MB
  - Supported formats: MP4, MOV, AVI
- **Three-Step Process**:
  1. Get Cloudinary upload credentials from backend
  2. Upload video directly to Cloudinary with progress tracking
  3. Create lesson record in backend with video URL
- **Upload Progress**: Real-time progress bar with percentage
- **Auto-fill Title**: Automatically suggests title from filename

### 3. Lesson Management (`LessonList.tsx`)
- **Drag-and-Drop Reordering**: Using @hello-pangea/dnd
- **Inline Editing**: Edit lesson titles directly in the list
- **Delete Confirmation**: Alert dialog before deletion
- **Visual Feedback**: Loading states and animations
- **Empty State**: Helpful message when no lessons exist

### 4. Course Submission (`SubmitCourseButton.tsx`)
- **Validation**: Ensures at least one lesson exists
- **Confirmation Dialog**: Shows course details before submission
- **Status Transition**: DRAFT → PENDING
- **Clear Instructions**: Explains what happens after submission

## API Integration

### Endpoints Used

```typescript
// Get Cloudinary upload credentials
POST /api/courses/:courseId/lessons/upload
Response: { uploadUrl, signature, timestamp, apiKey, publicId, ... }

// Create lesson after upload
POST /api/courses/:courseId/lessons
Body: { title, videoUrl, order }
Response: { success: true, data: Lesson }

// Update lesson (title or order)
PATCH /api/lessons/:lessonId
Body: { title?, order? }

// Delete lesson
DELETE /api/lessons/:lessonId

// Update course details
PATCH /api/courses/:courseId
Body: { title?, description?, thumbnailUrl? }

// Submit for review
POST /api/courses/:courseId/submit
Response: { success: true, data: { id, status: 'PENDING' } }
```

### Upload Flow

```
1. User selects video file
   ↓
2. Frontend calls POST /api/courses/:id/lessons/upload
   ← Backend returns Cloudinary credentials
   ↓
3. Frontend uploads directly to Cloudinary
   - XMLHttpRequest with progress tracking
   - FormData with signature authentication
   ↓
4. Cloudinary returns secure_url
   ↓
5. Frontend calls POST /api/courses/:id/lessons
   - Sends title, videoUrl, order
   ← Backend creates lesson record
   ↓
6. Success! Lesson appears in list
```

## Component Architecture

```
/creator/courses/[id]/edit/page.tsx (Main Page)
├── CourseEditor.tsx (Course details form)
├── LessonUploader.tsx (Video upload)
│   └── UploadProgress.tsx (Progress indicator)
├── LessonList.tsx (Drag-and-drop list)
│   └── AlertDialog (Delete confirmation)
└── SubmitCourseButton.tsx (Submit for review)
    └── AlertDialog (Submit confirmation)
```

## Key Technologies

- **@hello-pangea/dnd**: Drag-and-drop functionality (maintained fork of react-beautiful-dnd)
- **React Hook Form + Zod**: Form validation
- **Framer Motion**: Smooth animations
- **XMLHttpRequest**: File upload with progress tracking
- **Cloudinary**: Video hosting and delivery

## User Experience

### Status-Based Permissions

- **DRAFT**: Full editing, uploading, reordering, deleting
- **PENDING**: Read-only (under admin review)
- **PUBLISHED**: Read-only (contact support to edit)
- **ARCHIVED**: Read-only (contact support to reactivate)

### Visual Feedback

- Loading spinners during async operations
- Success messages (auto-dismiss after 3s)
- Error alerts with specific messages
- Drag-and-drop visual states (isDragging, isDraggingOver)
- Progress bars for uploads (0-100%)

### Validation Rules

**Course:**
- Title: 5-100 characters
- Description: 20-1000 characters
- Thumbnail: Valid URL (optional)

**Lesson:**
- Title: 1-200 characters
- Video: Required, max 500MB
- Order: Automatically assigned

**Submission:**
- Minimum 1 lesson required
- Course must be in DRAFT status

## Error Handling

### Upload Errors
- Network errors during Cloudinary upload
- Invalid file types or sizes
- Backend API errors
- All errors show in UploadProgress component

### Reordering Errors
- Failed PATCH requests
- Automatic revert to previous order
- Toast notification for user

### Validation Errors
- Inline form validation with Zod
- Character count indicators
- URL format validation with preview

## Next Steps / Extensions

1. **Bulk Upload**: Upload multiple videos at once
2. **Video Transcoding**: Add format conversion options
3. **Thumbnail Generation**: Auto-generate thumbnails from video
4. **Lesson Preview**: Preview video before publishing
5. **Draft Auto-save**: Save changes automatically every 30s
6. **Transcript Upload**: Add transcript field to lessons
7. **Course Templates**: Save course structure as template
8. **Lesson Duplication**: Copy lesson to another course

## Testing Checklist

- [ ] Upload video successfully
- [ ] View upload progress
- [ ] Drag-and-drop reorder lessons
- [ ] Edit lesson title inline
- [ ] Delete lesson with confirmation
- [ ] Edit course details
- [ ] Preview thumbnail
- [ ] Submit course (with validation)
- [ ] Handle upload errors gracefully
- [ ] Test with different video formats
- [ ] Test with large files (near 500MB limit)
- [ ] Test with no lessons (submission blocked)
- [ ] Test status badges display correctly
- [ ] Test read-only mode for PENDING/PUBLISHED courses

## Performance Considerations

- **Direct Cloudinary Upload**: No backend bottleneck
- **Optimistic UI Updates**: Instant feedback on reorder
- **Lazy Loading**: Components load on demand
- **Image Optimization**: Thumbnails loaded with appropriate sizes
- **Progress Tracking**: XMLHttpRequest for accurate upload progress
- **Debouncing**: Form validation debounced for better UX

## Security Notes

- Cloudinary signatures generated server-side
- JWT token required for all API calls
- RBAC enforced (CREATOR role only)
- File size limits prevent abuse
- Public IDs include courseId to prevent conflicts
- Video URLs use secure_url from Cloudinary
