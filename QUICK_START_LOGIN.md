# Student Enrollment System - Login System Quick Start

## ✅ What's Been Implemented

### 1. Authentication System
- **Email/Password Login** via `/login` page
- **Backend API** endpoint at `/admin/api/manage_data.php?action=login_student`
- **Token-based** session management (localStorage)
- **Protected routes** that auto-redirect to login if not authenticated

### 2. Created Files
```
lib/auth.ts                           # Core authentication functions
lib/hooks/useAuth.ts                  # React hooks for authentication
features/auth/AuthService.ts          # Business logic service
components/component/sign-up-form.tsx # Updated login form (renamed but still sign-up-form)
LOGIN_SYSTEM.md                       # Full documentation
```

### 3. Updated Files
```
admin/api/manage_data.php             # Added login_student endpoint
app/dashboard/page.tsx                # Added useRequireAuth() hook
app/enrollment/page.tsx               # Added useRequireAuth() hook
components/component/dashbaord-navbar.tsx # Added logout button & user display
```

## 🔑 Test Credentials

```
Email:    testjohn1766858069@example.com
Password: zdspgc-mahayag
Name:     John Smith
ID:       2025-00002
```

Or use other test students:
- `roneilbansas5222@gmail.com` / `zdspgc-mahayag`
- `roneilbansas@gmail.com` / `zdspgc-mahayag`

## 🚀 How to Use

### For Users (Students)
1. Go to `http://localhost:3001/login`
2. Enter email and password
3. Click "Login"
4. Redirected to dashboard upon success

### For Developers

#### Check if user is logged in
```tsx
import { useAuth } from '@/lib/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return <p>Welcome, {user?.firstname}</p>;
}
```

#### Protect a page (auto-redirect to login if not authenticated)
```tsx
import { useRequireAuth } from '@/lib/hooks/useAuth';

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();
  
  if (loading) return <div>Loading...</div>;
  
  // User is guaranteed to be authenticated here
  return <h1>Hi {user?.firstname}!</h1>;
}
```

#### Handle logout
```tsx
const { logout } = useAuth();

<button onClick={logout}>Sign out</button>
```

## 🔄 Data Flow

```
Login Form (sign-up-form.tsx)
    ↓
AuthService.authenticate()
    ↓
login() from lib/auth.ts
    ↓
POST /admin/api/manage_data.php?action=login_student
    ↓
loginStudent() in PHP backend
    ↓
Query student_tbl with email + password
    ↓
Return student data + auth token
    ↓
Store in localStorage
    ↓
Redirect to /dashboard
```

## 📝 Database

Uses existing `student_tbl` table:
- `email` - Login username
- `password` - Login password (plain text)
- `firstname`, `lastname` - User display name
- `student_id` - Unique student identifier
- `status` - Enrollment status

## 🔒 Security Notes

⚠️ **Current State (Development):**
- Passwords stored in plain text
- Simple token generation
- No expiration on tokens
- Uses localStorage (vulnerable to XSS)

✅ **Recommended for Production:**
- Hash passwords with bcrypt
- Implement JWT with expiration
- Use httpOnly, Secure cookies
- Add CSRF protection
- Implement rate limiting
- Add 2FA support

## 📞 Endpoints Summary

| Method | Endpoint | Action | Purpose |
|--------|----------|--------|---------|
| POST | `/admin/api/manage_data.php?action=login_student` | `login_student` | Authenticate student |
| GET | `/admin/api/manage_data.php?action=list_programs` | `list_programs` | Get available programs |
| GET | `/admin/api/manage_data.php?action=list_semesters` | `list_semesters` | Get available semesters |
| POST | `/admin/api/manage_data.php?action=enroll_student` | `enroll_student` | Enroll in program/semester |

## 🎯 Next Steps

1. **Test the login system:**
   - Go to http://localhost:3001/login
   - Use test credentials above
   - Should redirect to dashboard

2. **Protect other pages:**
   - Add `useRequireAuth()` to any page that needs authentication
   - Example: profile.tsx, myschedule.tsx, grades.tsx

3. **Security improvements:**
   - Implement password hashing in backend
   - Add JWT tokens with expiration
   - Implement refresh tokens
   - Add rate limiting on login attempts

4. **Additional features:**
   - "Forgot password" functionality
   - Password change page
   - User profile edit
   - Email verification for new accounts

## 🐛 Troubleshooting

**"Invalid email or password" after correct credentials:**
- Check that password in database matches exactly
- Current test students all have password: `zdspgc-mahayag`

**Login page doesn't show form:**
- Clear browser cache
- Make sure Next.js dev server is running on port 3001
- Check browser console for JavaScript errors

**Always redirected to login on protected pages:**
- Check that localStorage has 'auth_token' key after login
- Check browser's LocalStorage in DevTools
- Make sure cookie/storage is not cleared on page load
