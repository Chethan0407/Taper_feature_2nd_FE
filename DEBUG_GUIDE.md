# Debugging Guide: 404 Error on Spec Upload

## Issue Analysis

You're getting a 404 error on `POST /api/v1/specs/projects/1/specs`, but the endpoint actually exists and is working correctly. The real issue is **authentication failure**.

## ✅ **Endpoint Confirmed Working**

The endpoint exists and is properly configured:
- **URL**: `POST /api/v1/specs/projects/{project_id}/specs`
- **Authentication**: Required (OAuth2PasswordBearer)
- **Content-Type**: `multipart/form-data`
- **Required Fields**: `file`, `name`, `version`
- **Optional Fields**: `description`

## 🔍 **Root Cause: Authentication Issue**

The 404 error is actually a **401 Unauthorized** that's being misinterpreted. Here's why:

1. **No Authentication Token**: Your frontend isn't sending a valid JWT token
2. **Server Returns 401**: But your frontend might be treating it as 404
3. **Token Expired/Invalid**: The token might be expired or malformed

## 🛠️ **Step-by-Step Fix**

### Step 1: Verify Authentication Flow

First, check if you can authenticate:

```bash
# Test authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "password": "your-password"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

### Step 2: Test with Valid Token

Once you have a token, test the endpoint:

```bash
# Replace YOUR_TOKEN_HERE with the actual token
curl -X POST http://localhost:8000/api/v1/specs/projects/1/specs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@test-file.txt" \
  -F "name=Test Spec" \
  -F "version=1.0.0" \
  -F "description=Test description"
```

### Step 3: Fix Frontend Authentication

The issue is in your frontend authentication. Check these files:

#### 1. Check Auth Store (`src/stores/auth.ts`)
Make sure the token is being stored correctly:

```typescript
// After login, verify token is stored
console.log('Token stored:', localStorage.getItem('tapeout_token'))
```

#### 2. Check SpecsPage.vue
Verify the authentication headers are being sent:

```typescript
// Add this debug code to handleFileChange
console.log('Auth token:', authStore.token)
console.log('Headers being sent:', headers)
```

## 🔧 **Quick Fix for SpecsPage.vue**

Add this debug code to your `handleFileChange` function:

```typescript
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  const file = target.files[0]
  uploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false
  
  // DEBUG: Check authentication
  console.log('Auth token exists:', !!authStore.token)
  console.log('Auth token value:', authStore.token)
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add authentication header
    const headers: HeadersInit = {}
    if (authStore.token && authStore.token !== 'undefined' && authStore.token !== 'null') {
      headers['Authorization'] = `Bearer ${authStore.token}`
    }
    
    // DEBUG: Log the request
    console.log('Making request to:', 'http://localhost:8000/api/v1/specs/specs')
    console.log('Headers:', headers)
    console.log('FormData entries:', Array.from(formData.entries()))
    
    const res = await fetch('http://localhost:8000/api/v1/specs/specs', {
      method: 'POST',
      headers,
      body: formData
    })
    
    // DEBUG: Log the response
    console.log('Response status:', res.status)
    console.log('Response headers:', Object.fromEntries(res.headers.entries()))
    
    if (!res.ok) {
      const errorText = await res.text()
      console.log('Error response:', errorText)
      throw new Error(errorText || 'Upload failed')
    }
    
    uploadSuccess.value = true
    setTimeout(() => { uploadSuccess.value = false }, 2000)
  } catch (e: any) {
    console.error('Upload error:', e)
    uploadError.value = e.message || 'Upload failed'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
```

## 🧪 **Test Authentication Status**

Add this to your component to check authentication:

```typescript
// Add this to your component setup
onMounted(async () => {
  console.log('=== Authentication Debug ===')
  console.log('Is authenticated:', authStore.isAuthenticated)
  console.log('Token exists:', !!authStore.token)
  console.log('Token value:', authStore.token)
  
  // Test authentication
  try {
    const response = await fetch('http://localhost:8000/api/v1/auth/me', {
      headers: authStore.token ? { 'Authorization': `Bearer ${authStore.token}` } : undefined
    })
    console.log('Auth test response:', response.status)
    if (response.ok) {
      const userData = await response.json()
      console.log('User data:', userData)
    }
  } catch (error) {
    console.error('Auth test failed:', error)
  }
})
```

## 🚨 **Common Issues & Solutions**

### Issue 1: Token Not Stored
**Symptoms**: `authStore.token` is null or undefined
**Solution**: Check login flow and localStorage

### Issue 2: Token Expired
**Symptoms**: 401 Unauthorized with valid-looking token
**Solution**: Re-login to get fresh token

### Issue 3: Wrong Token Format
**Symptoms**: 401 Unauthorized
**Solution**: Ensure token starts with "Bearer "

### Issue 4: CORS Issues
**Symptoms**: Network errors in browser console
**Solution**: Check if backend allows requests from your frontend origin

## 📋 **Checklist**

- [ ] Backend server is running on port 8000
- [ ] You can access http://localhost:8000/docs
- [ ] Authentication endpoint works
- [ ] You have valid credentials
- [ ] Token is being stored correctly
- [ ] Token is being sent in Authorization header
- [ ] Request uses multipart/form-data
- [ ] All required fields are provided

## 🎯 **Expected Behavior**

When working correctly:
1. **Login** → Get JWT token
2. **Upload** → Send token + FormData
3. **Response** → 200 OK with spec data

## 🆘 **Still Getting 404?**

If you're still getting 404 after following this guide:

1. **Check browser network tab** for the actual response
2. **Verify the exact URL** being requested
3. **Check if there are any redirects**
4. **Ensure the backend route is properly registered**

The endpoint definitely exists, so the issue is likely authentication-related. 