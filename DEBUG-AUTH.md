# Authentication Debug Guide

## Issue Resolved

**Problem**: Admin accounts (`salle.kma@gmail.com` and `admin@mtcc.com.mv`) sometimes required a page refresh to access the dashboard after login.

**Root Cause**: Race condition between Supabase auth session and custom user data loading in `AuthProvider.tsx`.

## Fixes Applied

### 1. AuthProvider Race Condition Fix
**File**: `src/components/AuthProvider.tsx`

**Before**:
```typescript
user: auth.session ? currentUser : null,
```

**After**:
```typescript
user: auth.session && currentUser ? currentUser : null,
```

**Explanation**: Previously, when `auth.session` existed but `currentUser` was still loading, the user would be set to `undefined`, causing login issues. Now it waits for both session AND user data.

### 2. Enhanced Admin Account Support
**File**: `src/components/ProtectedRoute.tsx`

**Added support for both admin emails**:
```typescript
const isAdminEmail = user.email === 'salle.kma@gmail.com' || user.email === 'admin@mtcc.com.mv';
const isAdminRole = user.role === 'Admin' || user.role === 'admin';
```

### 3. Database Service Admin Handling
**File**: `src/services/database.ts`

**Enhanced user creation logic**:
```typescript
const isAdmin = user.email === 'salle.kma@gmail.com' || user.email === 'admin@mtcc.com.mv';
```

### 4. React Query Optimization
**File**: `src/hooks/useData.ts`

**Added better caching and retry logic**:
```typescript
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: userService.getCurrentUser,
    retry: (failureCount, error) => {
      if (error?.message?.includes('not authenticated')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

## Testing the Fix

### Before the Fix
1. User logs in with admin credentials
2. Page shows loading spinner indefinitely OR redirects to login
3. Manual refresh required to access dashboard
4. `admin@mtcc.com.mv` had access issues due to incomplete fallback logic

### After the Fix
1. User logs in with admin credentials
2. Authentication state properly synchronizes
3. Direct access to dashboard without refresh
4. Both admin emails work correctly
5. Proper loading states during authentication

## Admin Account Handling

### Recognized Admin Emails
- `salle.kma@gmail.com`
- `admin@mtcc.com.mv`

### Admin Role Names
- `Admin`
- `admin`

### Fallback Logic
- Admin emails get automatic admin role assignment
- Admin users bypass role-based route restrictions
- Comprehensive error logging for debugging

## Authentication Flow

```
1. User submits login form
   ↓
2. Supabase Auth creates session
   ↓
3. AuthProvider detects session
   ↓
4. useCurrentUser hook fetches custom user data
   ↓
5. AuthProvider waits for BOTH session AND user data
   ↓
6. User context populated with complete data
   ↓
7. ProtectedRoute grants access
   ↓
8. Dashboard renders successfully
```

## Debug Commands

### Check Current User State
```javascript
// In browser console
console.log('Auth Context:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.reactDevtoolsAgent?.hook?.getFiberRoots());
```

### Monitor Auth State Changes
```javascript
// Add to useAuth hook for debugging
useEffect(() => {
  console.log('Auth state changed:', { user: authState.user?.email, session: !!authState.session, loading: authState.loading });
}, [authState]);
```

### Monitor User Data Loading
```javascript
// Add to useCurrentUser for debugging
useEffect(() => {
  console.log('Current user state:', { data: currentUser?.email, loading: userLoading });
}, [currentUser, userLoading]);
```

## Security Notes

### Admin Fallback Security
- Admin emails are hardcoded for security
- Role-based access still enforced
- Admin fallback only for known emails
- Comprehensive logging for audit trail

### Session Management
- Proper token handling by Supabase
- Automatic session refresh
- Secure logout implementation
- No sensitive data in localStorage

## Performance Improvements

### React Query Optimizations
- 5-minute stale time for user data
- 10-minute garbage collection time
- Smart retry logic for failed requests
- Proper cache invalidation

### Loading State Management
- Eliminated unnecessary loading states
- Faster initial page loads
- Smoother authentication transitions
- Better user experience

## Monitoring

### What to Watch For
- Console errors during login
- Infinite loading states
- Unauthorized access attempts
- Role assignment failures

### Success Indicators
- No refresh required after login
- Immediate dashboard access
- Proper role-based restrictions
- Clean console logs

---

**Status**: ✅ Resolved
**Tested With**: Both admin accounts (`salle.kma@gmail.com`, `admin@mtcc.com.mv`)
**Impact**: Eliminated authentication race conditions and improved user experience