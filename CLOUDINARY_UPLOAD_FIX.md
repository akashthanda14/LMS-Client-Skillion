# Cloudinary Upload 401 Error - Fixed

## Problem
Cloudinary uploads were failing with `401 Unauthorized` and the error message:
```
Invalid Signature 800b195554e11b89f315db5752ad54956788d6a2. 
String to sign - 'folder=courses/xxx/lessons&public_id=course_xxx_lesson_xxx&timestamp=1759651082'
```

## Root Cause
**Frontend was sending parameters in the wrong order and including unsigned parameters that Cloudinary thought were part of the signature.**

The Cloudinary signature validation works as follows:
1. Backend generates a signature by hashing specific parameters in **alphabetical order**
2. Backend signed exactly 3 params: `folder`, `public_id`, `timestamp`
3. Frontend must send FormData fields in a way that matches this signature

The issue was:
- Frontend was appending params in random order: `api_key`, `timestamp`, `signature`, `public_id`, `folder`
- Frontend was adding extra unsigned params like `resource_type`, `eager` that weren't part of the signed string
- **FormData field order matters** when Cloudinary validates signatures

## Solution Applied

### Files Fixed
1. `src/components/creator/LessonUploader.tsx`
2. `src/hooks/useVideoUpload.ts`
3. `src/lib/api.ts` (uploadThumbnail and uploadVideo helpers)

### Changes Made
**Before (Incorrect):**
```typescript
formData.append('file', file);
formData.append('api_key', credentials.apiKey);
formData.append('timestamp', credentials.timestamp);
formData.append('signature', credentials.signature);
formData.append('public_id', credentials.publicId);
formData.append('folder', credentials.folder);
formData.append('resource_type', 'video'); // ❌ Not signed by backend
```

**After (Correct):**
```typescript
formData.append('file', file);

// Add signed parameters in alphabetical order (must match backend)
formData.append('folder', credentials.folder);
formData.append('public_id', credentials.publicId);
formData.append('timestamp', credentials.timestamp);

// Add signature and api_key (not signed but required)
formData.append('signature', credentials.signature);
formData.append('api_key', credentials.apiKey);
```

## Key Principles

### Signed vs Unsigned Parameters
**Signed (must be in signature string, alphabetical order):**
- `folder`
- `public_id`
- `timestamp`

**Unsigned (sent but not part of signature):**
- `file` (the actual file binary)
- `api_key` (identifies your Cloudinary account)
- `signature` (the hash itself)

### Parameter Order Rules
1. **Signed params** must be sent in **alphabetical order** matching backend signature generation
2. **Unsigned params** (file, api_key, signature) can be in any order
3. **Never add extra signed params** that backend didn't include (like `resource_type`, `eager`, `transformation`, etc.) unless backend explicitly signed them

### Backend Signature Generation (Reference)
```javascript
// Backend generates signature like this:
const paramsToSign = {
  folder: 'courses/xxx/lessons',
  public_id: 'course_xxx_lesson_xxx',
  timestamp: 1759651082
};

// Cloudinary creates string: 'folder=value&public_id=value&timestamp=value'
// Then signs it with API secret
const signature = cloudinary.utils.api_sign_request(paramsToSign, API_SECRET);
```

### Frontend Upload (Corrected)
```typescript
// Frontend must match exactly what backend signed
const formData = new FormData();
formData.append('file', file);

// Signed params in alphabetical order
formData.append('folder', credentials.folder);
formData.append('public_id', credentials.publicId);
formData.append('timestamp', credentials.timestamp);

// Unsigned params
formData.append('signature', credentials.signature);
formData.append('api_key', credentials.apiKey);
```

## Testing
After this fix:
1. ✅ Video lesson uploads work
2. ✅ Thumbnail uploads work
3. ✅ No more 401 Invalid Signature errors
4. ✅ Progress tracking works correctly

## Important Notes

### If You Add More Signed Parameters
If backend starts signing additional params (like `eager`, `transformation`, etc.), you must:
1. Update backend to include them in signature generation
2. Update frontend FormData to include them **in alphabetical order**
3. Match exactly what backend signed

### If Upload URL Changes
The `uploadUrl` from backend credentials already includes the resource type:
- Images: `https://api.cloudinary.com/v1_1/{cloud_name}/image/upload`
- Videos: `https://api.cloudinary.com/v1_1/{cloud_name}/video/upload`

Do NOT add `resource_type` as a FormData parameter unless backend explicitly signed it.

## Related Files
- Backend signature generation: (in your Node.js backend)
- Frontend upload components: See files listed above
- Cloudinary credentials type: `src/lib/api.ts` - `CloudinaryUploadCredentials`

## References
- [Cloudinary Authentication Signatures](https://cloudinary.com/documentation/upload_images#generating_authentication_signatures)
- [Direct Upload with Signed Parameters](https://cloudinary.com/documentation/upload_images#direct_uploading_from_the_browser)
