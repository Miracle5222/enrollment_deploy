# Login System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          /login Page (sign-up-form.tsx)                 │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Input Fields:                                  │   │   │
│  │  │  - Email (text input)                          │   │   │
│  │  │  - Password (password input)                   │   │   │
│  │  │  - Submit Button                              │   │   │
│  │  │  - Error/Success Messages                     │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │     AuthService.authenticate(credentials)               │   │
│  │     (features/auth/AuthService.ts)                       │   │
│  │  - Validates email format                               │   │
│  │  - Validates password not empty                         │   │
│  │  - Calls login() function                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        login(credentials)                                │   │
│  │        (lib/auth.ts)                                     │   │
│  │  - Prepares fetch request                               │   │
│  │  - Sends POST to API                                    │   │
│  │  - Handles response                                     │   │
│  │  - Stores auth_token in localStorage                   │   │
│  │  - Stores student data in localStorage                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│                    HTTP POST Request                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PHP BACKEND (Apache/XAMPP)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  POST /admin/api/manage_data.php?action=login_student           │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      manage_data.php (API Endpoint)                      │   │
│  │  - Receives JSON: {email, password}                     │   │
│  │  - Routes to loginStudent() function                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   loginStudent($conn, $data) Function                    │   │
│  │  - Validates email and password provided               │   │
│  │  - Prepares PDO statement                              │   │
│  │  - Queries student_tbl                                │   │
│  │  - Matches email AND password                         │   │
│  │  - If found: Returns student data + token             │   │
│  │  - If not found: Returns error message                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │       MySQL Database (enrollment database)               │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  student_tbl                                     │   │   │
│  │  │  ├─ student_id                                   │   │   │
│  │  │  ├─ email ← Searched on                         │   │   │
│  │  │  ├─ password ← Matched against                  │   │   │
│  │  │  ├─ firstname                                    │   │   │
│  │  │  ├─ lastname                                     │   │   │
│  │  │  ├─ program_id                                   │   │   │
│  │  │  └─ status                                       │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             ↓
                     JSON Response
                {
                  success: true,
                  token: "97e31...",
                  student: {
                    student_id: "2025-00002",
                    firstname: "John",
                    lastname: "Smith",
                    email: "john@example.com",
                    program_id: 1,
                    status: "Enrolled"
                  }
                }
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Response Handler in sign-up-form.tsx                │   │
│  │  - Check response.success                               │   │
│  │  - If success:                                          │   │
│  │    - Show success message                               │   │
│  │    - localStorage.setItem('auth_token', token)         │   │
│  │    - localStorage.setItem('student', JSON.stringify(...))  │   │
│  │    - setTimeout redirect to /dashboard                 │   │
│  │  - If error:                                            │   │
│  │    - Show error message                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Protected Pages (useRequireAuth)               │   │
│  │                                                           │   │
│  │  When user navigates to:                               │   │
│  │  - /dashboard                                           │   │
│  │  - /enrollment                                          │   │
│  │  - /profile (when protected)                            │   │
│  │  - /grades (when protected)                             │   │
│  │                                                           │   │
│  │  Hook checks:                                           │   │
│  │  1. Load localStorage for auth_token                  │   │
│  │  2. If not found → redirect to /login                │   │
│  │  3. If found → display page                           │   │
│  │  4. Get student data from localStorage                │   │
│  │  5. Make data available to component                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │      Navigation Bar (dashbaord-navbar.tsx)               │   │
│  │  - Display user name: "John Smith"                      │   │
│  │  - Show logout button                                   │   │
│  │  - On logout click:                                    │   │
│  │    - localStorage.removeItem('auth_token')            │   │
│  │    - localStorage.removeItem('student')               │   │
│  │    - Redirect to /login                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌─────────────────────┐
│   /login Page       │
│   (Route)           │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────────────────────────────┐
│  SignupFormDemo Component                   │
│  (components/component/sign-up-form.tsx)    │
│                                             │
│  - Renders email input                     │
│  - Renders password input                  │
│  - Renders submit button                   │
│  - Handles form submission                 │
│  - Shows error/success messages            │
└──────────┬──────────────────────────────────┘
           │
           │ calls
           ↓
┌─────────────────────────────────────────────┐
│  AuthService.authenticate()                 │
│  (features/auth/AuthService.ts)             │
│                                             │
│  - Validates inputs                        │
│  - Validates email format                  │
│  - Validates password not empty            │
│  - Calls login() function                  │
└──────────┬──────────────────────────────────┘
           │
           │ calls
           ↓
┌─────────────────────────────────────────────┐
│  login(credentials)                         │
│  (lib/auth.ts)                              │
│                                             │
│  - Fetches API endpoint                    │
│  - Sends POST request                      │
│  - Returns promise with response           │
└──────────┬──────────────────────────────────┘
           │
           │ sends request
           ↓
       [BACKEND]
           │
           │ receives
           ↓
┌─────────────────────────────────────────────┐
│  manage_data.php (API Endpoint)             │
│  (admin/api/manage_data.php)                │
│                                             │
│  - Receives POST with credentials          │
│  - Routes action=login_student             │
│  - Calls loginStudent() function           │
└──────────┬──────────────────────────────────┘
           │
           │ calls
           ↓
┌─────────────────────────────────────────────┐
│  loginStudent($conn, $data)                 │
│  (admin/api/manage_data.php)                │
│                                             │
│  - Validates input parameters              │
│  - Prepares SQL statement                  │
│  - Queries student_tbl                     │
│  - Returns JSON response                   │
└──────────┬──────────────────────────────────┘
           │
           │ queries
           ↓
       [DATABASE]
           │
           │ returns
           ↓
┌─────────────────────────────────────────────┐
│  JSON Response                              │
│                                             │
│  {                                          │
│    success: true/false,                     │
│    message: string,                         │
│    token?: string,                          │
│    student?: {                              │
│      student_id, firstname, lastname, etc   │
│    }                                        │
│  }                                          │
└──────────┬──────────────────────────────────┘
           │
           │ received by
           ↓
┌─────────────────────────────────────────────┐
│  login() function                           │
│  (lib/auth.ts)                              │
│                                             │
│  - Stores token in localStorage            │
│  - Stores student in localStorage          │
│  - Returns response to caller              │
└──────────┬──────────────────────────────────┘
           │
           │ returns to
           ↓
┌─────────────────────────────────────────────┐
│  AuthService.authenticate()                 │
│  (features/auth/AuthService.ts)             │
│                                             │
│  - Returns response to component            │
└──────────┬──────────────────────────────────┘
           │
           │ returns to
           ↓
┌─────────────────────────────────────────────┐
│  SignupFormDemo Component                   │
│  (components/component/sign-up-form.tsx)    │
│                                             │
│  - Updates UI with result                  │
│  - Shows success/error message             │
│  - Redirects on success                    │
└──────────┬──────────────────────────────────┘
           │
           │ navigates to
           ↓
┌─────────────────────────────────────────────┐
│  /dashboard Page                            │
│  (app/dashboard/page.tsx)                   │
│                                             │
│  - Calls useRequireAuth() hook              │
│  - Checks localStorage for auth_token      │
│  - Loads student data                      │
│  - Renders dashboard                       │
└─────────────────────────────────────────────┘
```

## Data Storage

### localStorage After Successful Login

```javascript
// Key: auth_token
// Value: "97e3160e24f50224bb6bb5fc3d9cbe75" (random hex string)
localStorage.setItem('auth_token', token);

// Key: student
// Value: JSON string of student object
localStorage.setItem('student', JSON.stringify({
  student_id: "2025-00002",
  firstname: "John",
  lastname: "Smith",
  email: "testjohn1766858069@example.com",
  program_id: 1,
  status: "Enrolled"
}));
```

### localStorage After Logout

```javascript
localStorage.removeItem('auth_token');
localStorage.removeItem('student');
```

## Protected Routes

```
┌─────────────────────────────────────────┐
│  useRequireAuth() Hook                  │
├─────────────────────────────────────────┤
│                                         │
│  1. Check if window exists              │
│  2. Read auth_token from localStorage   │
│  3. Set loading state                   │
│                                         │
│  ├─ If loading:                         │
│  │  └─ Show loading spinner             │
│  │                                      │
│  ├─ If NOT authenticated:               │
│  │  └─ Redirect to /login               │
│  │     (useRouter().push('/login'))     │
│  │                                      │
│  └─ If authenticated:                   │
│     └─ Return user data & page content  │
│                                         │
└─────────────────────────────────────────┘
```

## File Structure

```
online_ernollment_system/
├── lib/
│   ├── auth.ts ← Core auth functions
│   ├── hooks/
│   │   └── useAuth.ts ← Auth hooks
│   └── api.ts (existing)
│
├── features/
│   └── auth/
│       └── AuthService.ts ← Business logic
│
├── components/
│   └── component/
│       ├── sign-up-form.tsx ← Login form
│       └── dashbaord-navbar.tsx ← User nav
│
├── app/
│   ├── login/
│   │   └── page.tsx (existing)
│   ├── dashboard/
│   │   └── page.tsx ← Protected
│   ├── enrollment/
│   │   └── page.tsx ← Protected
│   └── ... (other pages)
│
├── admin/api/
│   └── manage_data.php ← API endpoint
│
└── Documentation/
    ├── LOGIN_SYSTEM.md
    ├── QUICK_START_LOGIN.md
    ├── PROTECT_PAGES_GUIDE.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── ARCHITECTURE.md (this file)
```

## Key Design Decisions

1. **localStorage for Client-Side Storage**
   - Simple and effective for MVP
   - No server-side session management needed
   - Easy to implement in Next.js
   - ⚠️ Not recommended for production (XSS vulnerable)

2. **Separation of Concerns**
   - `lib/auth.ts` - API communication
   - `features/auth/AuthService.ts` - Business logic
   - `lib/hooks/useAuth.ts` - React hooks
   - Components - UI only

3. **useRequireAuth Hook**
   - Automatic redirect to login if not authenticated
   - Handles loading state
   - Returns user data for display
   - Cleaner than route guards

4. **Existing Database**
   - Uses existing student_tbl
   - No schema changes needed
   - Compatible with current system
   - Passwords in plain text (temporary)

## Future Enhancements

```
┌─────────────────────────────────────────────┐
│  Phase 2: Security Improvements            │
├─────────────────────────────────────────────┤
│  - Password hashing (bcrypt)                │
│  - JWT tokens with expiration               │
│  - httpOnly cookies                         │
│  - CSRF protection                          │
│  - Rate limiting                            │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Phase 3: User Features                    │
├─────────────────────────────────────────────┤
│  - Remember me                              │
│  - Forgot password                          │
│  - Password reset                           │
│  - Account settings                         │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Phase 4: Advanced Security                │
├─────────────────────────────────────────────┤
│  - 2FA / MFA                                │
│  - Login audit trail                        │
│  - Account lockout                          │
│  - Suspicious activity alerts               │
└─────────────────────────────────────────────┘
```
