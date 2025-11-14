# 🚨 Sudden Logout Debug Guide

## 🔍 **What I've Added**

I've added comprehensive debugging to help you identify why you're getting logged out suddenly:

### 1. **Enhanced Auth Store Logging**
- `checkAuth()` now logs every step of the authentication process
- `logout()` now logs when and why it's called with stack traces
- `isAuthenticated` computed property logs state changes

### 2. **Real-time Auth Debugger**
- Added `AuthDebugger.vue` component to your app
- Shows live authentication status in bottom-right corner
- Click the 🔍 button to open the debug panel

## 🧪 **How to Debug**

### Step 1: Open Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Clear any existing logs

### Step 2: Use the Auth Debugger
1. Look for the 🔍 button in the bottom-right corner
2. Click it to open the debug panel
3. Watch the real-time authentication status

### Step 3: Monitor Console Logs
Watch for these key log messages:

```
🔍 checkAuth called                    # When auth is being checked
🔐 Authentication state changed        # When auth state changes
🚪 LOGOUT CALLED                      # When logout is triggered
💥 Auth check error                   # When auth check fails
```

## 🎯 **Common Causes & Solutions**

### **Cause 1: Token Expiration**
**Symptoms:**
- Console shows: `❌ Auth check failed: 401`
- Happens after a period of inactivity

**Solution:**
```typescript
// Add token refresh logic to auth store
const refreshToken = async () => {
  // Implement token refresh if your backend supports it
}
```

### **Cause 2: Backend Unavailable**
**Symptoms:**
- Console shows: `💥 Auth check error: NetworkError`
- Happens when backend server is down

**Solution:**
- Check if backend is running on `http://localhost:8000`
- Verify network connectivity

### **Cause 3: Invalid Token Format**
**Symptoms:**
- Console shows: `❌ No valid token found`
- Token exists but is malformed

**Solution:**
- Clear localStorage: `localStorage.clear()`
- Re-login to get fresh token

### **Cause 4: Multiple Auth Checks**
**Symptoms:**
- Multiple `🔍 checkAuth called` messages
- Happens when navigating between pages

**Solution:**
- This is normal behavior
- Each page calls `checkAuth()` on mount

## 🔧 **Quick Fixes**

### Fix 1: Disable Auto-Logout on Auth Check Failure
If you want to prevent automatic logout on network issues:

```typescript
// In auth.ts, modify checkAuth to not logout on network errors
const checkAuth = async () => {
  // ... existing code ...
  } catch (error) {
    console.log('💥 Auth check error:', error)
    
    // Only logout if it's an authentication error, not network error
    if (error.message.includes('401') || error.message.includes('403')) {
      console.log('🚪 Calling logout due to auth failure')
      logout()
    } else {
      console.log('⚠️ Network error - not logging out')
    }
    return false
  }
}
```

### Fix 2: Add Token Refresh
If your backend supports token refresh:

```typescript
// Add to auth store
const refreshToken = async () => {
  try {
    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: getAuthHeader()
    })
    if (response.ok) {
      const data = await response.json()
      token.value = data.token || data.access_token
      localStorage.setItem('tapeout_token', token.value || '')
      return true
    }
  } catch (error) {
    console.log('Token refresh failed:', error)
  }
  return false
}
```

### Fix 3: Reduce Auth Check Frequency
If auth checks are too frequent:

```typescript
// Add debouncing to checkAuth
let authCheckTimeout: number | null = null

const debouncedCheckAuth = async () => {
  if (authCheckTimeout) clearTimeout(authCheckTimeout)
  authCheckTimeout = window.setTimeout(checkAuth, 1000)
}
```

## 📊 **Monitoring Dashboard**

The Auth Debugger shows:
- **Token Status**: Whether token exists and is valid
- **User Status**: Whether user data is loaded
- **Authentication State**: Overall auth status
- **Last Check**: When auth was last validated
- **Logout Count**: How many times logout was called

## 🚨 **Emergency Recovery**

If you're stuck in a logout loop:

1. **Clear Browser Storage:**
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

2. **Hard Refresh:**
   - Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Or open DevTools → Network tab → check "Disable cache" → refresh

3. **Check Backend:**
   ```bash
   curl http://localhost:8000/api/v1/auth/me
   ```

## 📝 **Next Steps**

1. **Run your app** and watch the console logs
2. **Use the Auth Debugger** to monitor real-time status
3. **Try to reproduce** the logout issue
4. **Check the logs** to identify the exact cause
5. **Apply the appropriate fix** based on what you find

## 🆘 **Still Having Issues?**

If you're still getting logged out after following this guide:

1. **Share the console logs** with the exact error messages
2. **Check if your backend is running** and accessible
3. **Verify your JWT token expiration** settings
4. **Test with a fresh browser session** (incognito mode)

The debug logs will tell us exactly what's happening! 🔍
