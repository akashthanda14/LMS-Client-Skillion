# Cloudinary Upload Debugging Guide

## Understanding Cloudinary Signature Validation

Cloudinary uses signature-based authentication for secure uploads. The signature must match EXACTLY with the parameters being sent.

### How Signatures Work

1. **Backend generates signature** based on specific parameters
2. **Frontend sends those EXACT parameters** + the signature
3. **Cloudinary verifies** the signature matches the parameters

### Critical Rules

#### ✅ DO: Only send parameters that were signed
- `timestamp`
- `public_id`
- `folder`
- Any other params the backend included in signature generation

#### ❌ DON'T: Send parameters that weren't signed
- `resource_type` should be in the URL path, NOT in FormData
- Don't add extra parameters unless backend signed them

### Correct Upload URL Structure

```
# For images
https://api.cloudinary.com/v1_1/{cloud_name}/image/upload

# For videos
https://api.cloudinary.com/v1_1/{cloud_name}/video/upload

# For raw files
https://api.cloudinary.com/v1_1/{cloud_name}/raw/upload
```

The `resource_type` is determined by the **URL path** (`/image/`, `/video/`, `/raw/`), not by a form parameter.

---

## Common Signature Errors

### Error: Invalid Signature

**Symptoms:**
```
401 Unauthorized
{
  "error": {
    "message": "Invalid Signature abc123..."
  }
}
```

**Causes:**
1. ❌ Sending parameters not included in signature
2. ❌ Missing parameters that were signed
3. ❌ Timestamp mismatch (signature expired)
4. ❌ Wrong API secret used
5. ❌ Parameter values don't match signed values

**Solutions:**
1. ✅ Only send parameters that backend signed
2. ✅ Send ALL parameters that backend signed
3. ✅ Use fresh credentials (< 1 hour old)
4. ✅ Verify backend env vars match Cloudinary dashboard
5. ✅ Don't modify parameter values

---

## Correct Implementation

### Backend (Node.js/Express)

```javascript
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Generate signed upload parameters
router.post('/api/courses/:courseId/lessons/upload', async (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const publicId = `course_${req.params.courseId}_lesson_${Date.now()}`;
  const folder = `courses/${req.params.courseId}/lessons`;
  
  // Parameters to sign (these will be included in signature)
  const paramsToSign = {
    timestamp,
    public_id: publicId,
    folder
  };
  
  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.json({
    success: true,
    data: {
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      publicId,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    }
  });
});
```

### Frontend (React/TypeScript)

```typescript
const uploadToCloudinary = async (
  file: File,
  credentials: any
): Promise<string> => {
  const formData = new FormData();
  
  // ONLY append parameters that were signed by backend
  formData.append('file', file);
  formData.append('api_key', credentials.apiKey);
  formData.append('timestamp', credentials.timestamp.toString());
  formData.append('signature', credentials.signature);
  formData.append('public_id', credentials.publicId);
  formData.append('folder', credentials.folder);
  
  // DON'T append resource_type - it's in the URL!
  
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentage = (e.loaded / e.total) * 100;
        onProgress?.(percentage);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        console.error('Upload failed:', xhr.status, xhr.responseText);
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    
    // Resource type is in the URL path, not FormData
    xhr.open('POST', credentials.uploadUrl);
    xhr.send(formData);
  });
};
```

---

## Environment Variables

Ensure these are set correctly on your backend:

```env
CLOUDINARY_CLOUD_NAME=dumurymxf
CLOUDINARY_API_KEY=124497175293455
CLOUDINARY_API_SECRET=8o1poyk1rM_nCsJ7LUFPOjK_tvE
```

### Verify Configuration

```javascript
console.log('Cloudinary Config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key,
  // DON'T log api_secret in production
});
```

---

## Debugging Checklist

When you get a signature error:

- [ ] Check backend console for signature generation logs
- [ ] Verify all signed parameters are being sent
- [ ] Verify no extra parameters are being sent
- [ ] Check that `uploadUrl` includes correct resource type in path
- [ ] Ensure `resource_type` is NOT in FormData
- [ ] Verify timestamp is recent (within last hour)
- [ ] Check that API key matches between backend and Cloudinary
- [ ] Verify API secret is correct (check Cloudinary dashboard)
- [ ] Look at the "String to sign" in error message
- [ ] Compare "String to sign" with what you're sending

---

## Parameter Order Matters

Cloudinary alphabetically sorts parameters when generating signature. The backend SDK handles this automatically, but if you're debugging:

```
Correct order (alphabetical):
- folder
- public_id
- timestamp

NOT like this:
- timestamp
- public_id
- folder
```

---

## Testing Upload Credentials

Quick test to verify credentials work:

```bash
# Using curl
curl -X POST \
  https://api.cloudinary.com/v1_1/dumurymxf/video/upload \
  -F "file=@test-video.mp4" \
  -F "api_key=124497175293455" \
  -F "timestamp=1234567890" \
  -F "signature=abc123..." \
  -F "public_id=test_123" \
  -F "folder=test"
```

If this works, your credentials are valid. If not, regenerate signature.

---

## Common Mistakes

### ❌ WRONG: Sending resource_type in FormData
```typescript
formData.append('resource_type', 'video'); // DON'T DO THIS
```

### ✅ CORRECT: Resource type in URL
```typescript
const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
xhr.open('POST', uploadUrl);
```

### ❌ WRONG: Adding unsigned parameters
```typescript
formData.append('eager', 'transformation'); // Only if backend signed it
formData.append('tags', 'lesson'); // Only if backend signed it
```

### ✅ CORRECT: Only signed parameters
```typescript
// Only append parameters that backend included in paramsToSign
formData.append('timestamp', credentials.timestamp);
formData.append('signature', credentials.signature);
formData.append('public_id', credentials.publicId);
formData.append('folder', credentials.folder);
```

---

## Advanced: Adding Transformations

If you want eager transformations (e.g., thumbnail generation), the backend must sign them:

```javascript
// Backend
const paramsToSign = {
  timestamp,
  public_id: publicId,
  folder,
  eager: 'c_fill,w_400,h_300|c_fill,w_200,h_150',
  eager_async: true
};
```

Then frontend can send them:

```typescript
// Frontend
formData.append('eager', credentials.eager);
formData.append('eager_async', credentials.eagerAsync);
```

---

## Summary

**Key Points:**
1. Resource type goes in URL path, not FormData
2. Only send parameters that were signed
3. Send ALL parameters that were signed
4. Don't modify parameter values
5. Use fresh credentials
6. Match parameter names exactly (case-sensitive)

**Current Working Configuration:**
- ✅ `uploadUrl` includes `/video/` in path
- ✅ FormData includes: file, api_key, timestamp, signature, public_id, folder
- ✅ FormData does NOT include: resource_type
- ✅ Backend signs: timestamp, public_id, folder

---

**Last Updated**: December 2024  
**Cloudinary SDK Version**: v1
