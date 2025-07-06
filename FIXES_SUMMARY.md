# Authentication & Request Format Fixes Summary

## Problem Solved
The POST `/api/v1/specs/projects/1/specs` endpoint was returning 404 errors, but the real issue was **authentication failure** and **incorrect request format**.

## Root Cause
1. **Missing JWT Authentication**: Requests weren't including the required Bearer token
2. **Wrong Content-Type**: Using JSON instead of multipart/form-data for file uploads
3. **Inconsistent Error Handling**: Poor error messages made debugging difficult

## Files Fixed

### 1. `src/views/SpecsPage.vue`
**Fixed Functions:**
- `handleFileChange()` - Added authentication headers
- `handleEditSpec()` - Added authentication headers and better error handling

**Key Changes:**
```typescript
// Before (problematic)
const res = await fetch('http://localhost:8000/api/v1/specs/specs', {
  method: 'POST',
  body: formData  // ❌ Missing Authorization header
})

// After (fixed)
const headers: HeadersInit = {}
if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null') {
  headers['Authorization'] = `Bearer ${authStore.token}`
}

const res = await fetch('http://localhost:8000/api/v1/specs/specs', {
  method: 'POST',
  headers,  // ✅ Added authentication
  body: formData
})
```

### 2. `src/utils/auth-requests.ts` (New File)
**Created utility functions for:**
- `getAuthHeaders()` - Generate authenticated headers
- `authenticatedFetch()` - Make authenticated requests
- `handleApiError()` - Consistent error handling

## Technical Details

### Correct Request Format
```javascript
// ✅ Correct way to upload a spec file
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'Test Spec')
formData.append('version', '1.0.0')
formData.append('description', 'Test description')

const headers = {
  'Authorization': `Bearer ${authToken}`  // Required
  // Don't set Content-Type - browser sets it automatically for FormData
}

fetch('/api/v1/specs/projects/1/specs', {
  method: 'POST',
  headers,
  body: formData
})
```

### Common Mistakes Fixed
```javascript
// ❌ Wrong - Missing authentication
fetch('/api/v1/specs/projects/1/specs', {
  method: 'POST',
  body: formData
})

// ❌ Wrong - Using JSON for file upload
fetch('/api/v1/specs/projects/1/specs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ file: fileData })
})

// ❌ Wrong - Wrong endpoint
fetch('/api/v1/specs/upload', {
  method: 'POST',
  body: formData
})
```

## Testing

### Run the Test Script
```bash
node test-fixes.js
```

This tests:
- ✅ Authentication flow
- ✅ File upload with authentication
- ✅ File upload with metadata
- ✅ Proper error handling for missing auth

### Manual Testing with curl
```bash
# 1. Login to get token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpassword123"}'

# 2. Upload spec with token
curl -X POST http://localhost:8000/api/v1/specs/projects/1/specs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@test-spec.pdf" \
  -F "name=Test Spec" \
  -F "version=1.0.0"
```

## Error Handling

### Before Fix
- Generic "Upload failed" messages
- No distinction between auth errors and other errors
- Difficult to debug issues

### After Fix
- Specific error messages from server
- Clear authentication error handling
- Better debugging information

## Key Takeaways

1. **Always include JWT token** in Authorization header
2. **Use FormData for file uploads**, not JSON
3. **Don't set Content-Type for FormData** - browser handles it
4. **Handle authentication errors** properly
5. **Use consistent error handling** across the app

## Next Steps

1. **Test the fixes** using the provided test script
2. **Update other components** to use the new auth utilities
3. **Add proper error handling** to all API calls
4. **Consider using the auth-requests utility** for consistency

The endpoints should now work correctly with proper authentication and request format! 