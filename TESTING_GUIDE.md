# Testing the Course Editing Feature

## Prerequisites
- Backend running on `http://localhost:4000`
- Logged in as a user with CREATOR role
- At least one DRAFT course created

## Quick Test Flow

### 1. Navigate to Course Editor
```
1. Go to /creator/dashboard
2. Click "Edit" on any DRAFT course
3. You should see /creator/courses/[id]/edit
```

### 2. Edit Course Details
```
1. Update the title (5-100 chars)
2. Update the description (20-1000 chars)
3. Add a thumbnail URL (e.g., https://picsum.photos/800/450)
4. Click "Save Changes"
5. Verify success message appears
```

### 3. Upload a Video Lesson
```
1. Scroll to "Course Lessons" section
2. Drag a video file or click "browse"
3. Verify file preview appears with size
4. Edit the auto-filled lesson title if needed
5. Click "Upload Lesson"
6. Watch progress bar (0% → 100%)
7. See "Processing video..." message
8. Verify lesson appears in list below
```

### 4. Reorder Lessons
```
1. Ensure you have at least 2 lessons
2. Grab the drag handle (≡) on any lesson
3. Drag it up or down
4. Release to drop in new position
5. Verify order persists on page refresh
```

### 5. Edit Lesson Title
```
1. Click the Edit (✏️) button on any lesson
2. Input field appears with current title
3. Change the title
4. Press Enter or click "Save"
5. Verify new title displays
```

### 6. Delete a Lesson
```
1. Click the Trash (🗑️) button on any lesson
2. Confirmation dialog appears
3. Read the warning message
4. Click "Delete" to confirm
5. Verify lesson is removed from list
```

### 7. Submit Course for Review
```
1. Ensure at least 1 lesson exists
2. Click "Submit for Review" (top right)
3. Confirmation dialog shows course details
4. Read the submission requirements
5. Click "Yes, Submit"
6. Redirected to /creator/dashboard
7. Verify course status changed to PENDING
```

## Expected Behavior

### Upload Progress States
1. **Uploading**: Blue progress bar, percentage shown
2. **Processing**: Spinner, "Processing video..." message
3. **Success**: Green checkmark, "Upload complete!"
4. **Error**: Red X, error message displayed

### Drag-and-Drop States
- **Dragging**: Card has shadow, appears lifted
- **Drop Zone**: Light blue background when hovering
- **Success**: New order visible immediately
- **Error**: Reverts to previous order, alert shown

### Status-Based Access
- **DRAFT**: All buttons enabled, full editing
- **PENDING**: Warning banner, editing disabled
- **PUBLISHED**: Info banner, editing disabled
- **ARCHIVED**: Warning banner, editing disabled

## Test with Different Files

### Video Files to Test
✅ Valid:
- MP4 (most common)
- MOV (Apple format)
- AVI (older format)
- WebM

❌ Invalid:
- PDF documents
- Images (JPG, PNG)
- Audio files (MP3)
- Text files

### File Sizes to Test
- ✅ Small: <10MB (fast upload)
- ✅ Medium: 50-100MB (typical)
- ✅ Large: 200-400MB (slow upload)
- ❌ Too Large: >500MB (rejected)

## API Debugging

### Check Network Tab
```
1. Open DevTools (F12)
2. Go to Network tab
3. Perform an action
4. Look for:
   - POST /api/courses/:id/lessons/upload (get credentials)
   - POST https://api.cloudinary.com/... (upload)
   - POST /api/courses/:id/lessons (create lesson)
   - PATCH /api/lessons/:id (update)
   - DELETE /api/lessons/:id (delete)
```

### Common Response Codes
- `200 OK`: Success
- `400 Bad Request`: Validation error (check payload)
- `401 Unauthorized`: Token expired or missing
- `403 Forbidden`: Wrong role (need CREATOR)
- `404 Not Found`: Course/lesson doesn't exist
- `500 Server Error`: Backend issue (check logs)

## Troubleshooting

### Upload Fails
- Check file size (<500MB)
- Verify file is a video
- Check backend Cloudinary config
- Look for CORS errors in console

### Reorder Doesn't Persist
- Check PATCH /api/lessons/:id succeeded
- Verify order field in response
- Check if onLessonsUpdated is called

### Can't Submit Course
- Ensure at least 1 lesson exists
- Verify course status is DRAFT
- Check console for validation errors

### Images Not Loading
- Verify thumbnail URL is valid
- Check CORS policy for image host
- Try opening URL directly in browser

## Test Data

### Sample Course Data
```json
{
  "title": "Introduction to Web Development",
  "description": "Learn HTML, CSS, and JavaScript from scratch in this comprehensive course designed for beginners.",
  "thumbnailUrl": "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
}
```

### Sample Lesson Titles
- "Getting Started with HTML"
- "CSS Basics and Styling"
- "JavaScript Fundamentals"
- "Building Your First Website"
- "Responsive Design Principles"

## Performance Testing

### Upload Performance
- 10MB file: ~5-15 seconds
- 50MB file: ~30-60 seconds
- 100MB file: ~1-2 minutes
- 500MB file: ~5-10 minutes

*Actual times depend on internet speed*

### Reorder Performance
- Should be instant (<100ms)
- No noticeable lag even with 50+ lessons

## Success Criteria

✅ All features work without errors
✅ Upload progress shows accurately
✅ Drag-and-drop feels smooth
✅ Forms validate correctly
✅ Status badges display properly
✅ Permissions enforced by status
✅ Error messages are helpful
✅ Loading states prevent double-clicks
✅ Animations enhance (not distract)
✅ Responsive on mobile devices

## Known Limitations

1. **No parallel uploads**: Only one video at a time
2. **No resume uploads**: Refresh = restart
3. **No video preview**: Can't watch before publishing
4. **No transcript editing**: Plain text only
5. **No bulk operations**: Delete one by one
6. **No undo**: Deletions are permanent

## Next Test Phase

After basic functionality works:
1. Test with slow internet (throttle in DevTools)
2. Test with backend errors (stop server mid-upload)
3. Test with expired tokens (wait 24 hours)
4. Test with multiple tabs open
5. Test on mobile devices
6. Test with keyboard navigation only
7. Test with screen reader
