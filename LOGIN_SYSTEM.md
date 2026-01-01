# Login System Documentation

## Overview

A complete authentication system for the student enrollment portal with login, logout, and protected routes.

## Components

### 1. Frontend Authentication (`lib/auth.ts`)
- `login()` - Authenticate user with email/password
- `logout()` - Clear auth data
- `isAuthenticated()` - Check if user is logged in
- `getAuthUser()` - Get current user data

### 2. Authentication Service (`features/auth/AuthService.ts`)
- Business logic for authentication
- Validation of credentials
- User session management

### 3. Authentication Hook (`lib/hooks/useAuth.ts`)
- `useAuth()` - Get auth state and logout function
- `useRequireAuth()` - Hook that redirects to login if not authenticated

### 4. Login Form (`components/component/sign-up-form.tsx`)
- Updated with email/password input handling
- Error and success message display
- Loading states
- Form validation

### 5. Backend API (`admin/api/manage_data.php`)
- New `login_student` endpoint
- Validates email/password against student_tbl
- Returns student data and auth token on success

### 6. Protected Pages
- Dashboard (`app/dashboard/page.tsx`)
- Enrollment (`app/enrollment/page.tsx`)
- Uses `useRequireAuth()` hook to redirect unauthenticated users

## Data Flow

1. User enters email and password on `/login` page
2. Form submits to backend `login_student` API endpoint
3. Backend validates credentials against `student_tbl`
4. On success:
   - Auth token stored in localStorage
   - Student data stored in localStorage
   - User redirected to dashboard
5. Protected pages check localStorage for auth token
6. If token missing, redirect back to login

## Test Credentials

```
Email: testjohn1766858069@example.com
Password: zdspgc-mahayag
Student ID: 2025-00002
```

## Features

- ✅ Email/password authentication
- ✅ Protected routes (auto-redirect to login if not authenticated)
- ✅ Session persistence (localStorage)
- ✅ Logout functionality
- ✅ User display in navbar
- ✅ Error handling and validation
- ✅ Loading states

## Usage Examples

### Check if user is authenticated
```typescript
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome, {user?.firstname}</div>;
}
```

### Protect a route
```typescript
import { useRequireAuth } from '@/lib/hooks/useAuth';

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();
  
  if (loading) return <div>Loading...</div>;
  
  // Page content here - user is guaranteed to be authenticated
}
```

### Logout
```typescript
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## Database

The system uses the existing `student_tbl` with columns:
- `student_id` (primary key)
- `email` (unique)
- `password`
- `firstname`
- `lastname`
- `program_id`
- `status`

## Security Notes

⚠️ Current Implementation:
- Passwords stored in plain text in database
- Token is randomly generated but simple
- No refresh token mechanism

🔒 Recommended Improvements:
- Hash passwords using bcrypt or similar
- Implement JWT tokens with expiration
- Add refresh token mechanism
- Implement CORS security
- Add rate limiting on login attempts
- Use httpOnly cookies for token storage
