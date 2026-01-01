# How to Protect Pages with Login

This guide shows how to protect any page in the application to require user login.

## Quick Template

Copy this template to any page you want to protect (e.g., `app/mypage/page.tsx`):

```tsx
'use client';

import React from 'react';
import { useRequireAuth } from '@/lib/hooks/useAuth';
import { DashboardNavbar } from '@/components/component/dashbaord-navbar';

export default function MyProtectedPage() {
  // This hook ensures user is logged in, redirects to /login if not
  const { user, loading, isAuthenticated } = useRequireAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <DashboardNavbar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </DashboardNavbar>
    );
  }

  // If not authenticated, will be redirected by the hook
  if (!isAuthenticated) {
    return null;
  }

  // Your page content here - user is guaranteed to be logged in
  return (
    <DashboardNavbar>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, {user?.firstname} {user?.lastname}!
        </h1>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Your Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">Student ID</dt>
              <dd className="text-lg font-semibold">{user?.student_id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Email</dt>
              <dd className="text-lg font-semibold">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-600">Status</dt>
              <dd className="text-lg font-semibold">{user?.status}</dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardNavbar>
  );
}
```

## Step by Step

### 1. Import the hook
```tsx
import { useRequireAuth } from '@/lib/hooks/useAuth';
```

### 2. Call the hook in your component
```tsx
const { user, loading, isAuthenticated } = useRequireAuth();
```

### 3. Handle loading state
```tsx
if (loading) {
  return <div>Loading...</div>;
}
```

### 4. Handle not authenticated (optional)
```tsx
if (!isAuthenticated) {
  return null; // Hook handles redirect automatically
}
```

### 5. Use the user data
```tsx
<p>Welcome, {user?.firstname}!</p>
<p>Email: {user?.email}</p>
<p>Status: {user?.status}</p>
```

## Available User Properties

```typescript
user.student_id    // e.g., "2025-00002"
user.firstname     // e.g., "John"
user.lastname      // e.g., "Smith"
user.email         // e.g., "john@example.com"
user.program_id    // e.g., 1
user.status        // e.g., "Enrolled"
```

## Alternative: Check Auth Without Redirect

If you want to show different UI based on auth status without redirecting:

```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export default function MyFlexiblePage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <h1>Welcome, {user?.firstname}!</h1>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in to access this content</p>
          <a href="/login">Go to Login</a>
        </div>
      )}
    </div>
  );
}
```

## Examples

### Profile Page
File: `app/profile/page.tsx`

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { DashboardNavbar } from '@/components/component/dashbaord-navbar';

export default function ProfilePage() {
  const { user, loading, isAuthenticated } = useRequireAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <DashboardNavbar>
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

        <div className="grid gap-6">
          <section className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  First Name
                </label>
                <p className="text-lg">{user?.firstname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Name
                </label>
                <p className="text-lg">{user?.lastname}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Student ID
                </label>
                <p className="text-lg">{user?.student_id}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </DashboardNavbar>
  );
}
```

### Grade Viewing Page
File: `app/grades/page.tsx`

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { DashboardNavbar } from '@/components/component/dashbaord-navbar';

export default function GradesPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardNavbar>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">
          My Grades - {user?.firstname} {user?.lastname}
        </h1>

        {/* Your grades content here */}
        <div className="bg-white shadow rounded-lg p-6">
          <p>Grades for student: {user?.student_id}</p>
          {/* Table with grades */}
        </div>
      </div>
    </DashboardNavbar>
  );
}
```

## Best Practices

✅ **Do:**
- Always call `useRequireAuth()` in components that need authentication
- Handle the `loading` state while checking authentication
- Return `null` when `isAuthenticated` is false (hook handles redirect)
- Use user data for personalization

❌ **Don't:**
- Skip the loading check
- Try to access user data before checking isAuthenticated
- Remove the redirect logic
- Store auth data outside of localStorage for client-side checks

## Testing

To test a protected page:

1. **While logged in:** Page loads normally
2. **While logged out:** Redirected to `/login`
3. **After login:** Automatically redirected back (in future implementation)

Current behavior:
- If not logged in, redirected to `/login`
- User must login again and navigate back manually
