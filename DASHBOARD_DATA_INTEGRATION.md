# Dashboard Data Integration - Student Data from Database

## Overview
Updated the dashboard to fetch and display real student data from the database instead of using hardcoded dummy/static data.

## Changes Made

### 1. **Updated LensDemo Component**
**File:** `components/component/lens.tsx`

**What Changed:**
- Added TypeScript interface for `StudentData` matching the database schema
- Added React hooks for data fetching:
  - `useState` for `studentData`, `loading`, and `error` states
  - `useEffect` to fetch student data on component mount
  - `useAuth()` hook to get authenticated user's `student_id`

- Created API call to fetch student details:
  ```typescript
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get_student',
      student_id: user.student_id,
    }),
  });
  ```

- Added `formatDate()` helper function to format date values from the database

- Replaced all hardcoded values with dynamic data from `studentData`:
  - Student name: `${studentData.lastname}, ${studentData.firstname}`
  - ID Number: `studentData.student_id`
  - All fields (first name, last name, gender, civil status, etc.) now pull from database
  - Added email field to table (wasn't shown before)
  - All missing/null values display as "N/A"

### 2. **Updated API Proxy Route**
**File:** `app/api/proxy/route.ts`

**What Changed:**
- Modified POST handler to extract and forward `student_id` parameter
- Added special handling for `get_student` action:
  ```typescript
  if (action === 'get_student' && student_id) {
    backendUrl.searchParams.append('student_id', student_id);
  }
  ```
- This ensures the PHP backend receives the student_id as a query parameter, as expected

## Data Flow

```
1. User logs in
   → student_id stored in localStorage via auth system
   
2. User navigates to dashboard
   → useAuth() hook retrieves student_id from localStorage
   
3. LensDemo component mounts
   → useEffect triggers when user.student_id is available
   → Fetches POST to /api/proxy with action='get_student' and student_id
   
4. API Proxy Route
   → Receives POST request with student_id in body
   → Extracts student_id and includes in query parameters
   → Forwards to PHP backend: ?action=get_student&student_id=2025-00002
   
5. PHP Backend (manage_data.php)
   → getStudent() function executes
   → Queries student_tbl WHERE student_id = :student_id
   → Returns student data + family background + educational background
   
6. LensDemo Component
   → Receives response with student data
   → Displays all fields dynamically
   → Loading state shows while fetching
   → Error state shows if fetch fails
```

## Database Fields Displayed

| Field | Database Column | Display | Format |
|-------|-----------------|---------|--------|
| Full Name | firstname, middlename, lastname | Name Header | "LastName, FirstName M." |
| ID Number | student_id | ID Number | Direct |
| Last Name | lastname | Last Name | Direct |
| First Name | firstname | First Name | Direct |
| Middle Name | middlename | Middle Name | Direct or "N/A" |
| Gender | gender | Gender | Direct or "N/A" |
| Civil Status | civil_status | Civil Status | Direct or "N/A" |
| Date of Birth | date_of_birth | Date of Birth | Formatted as "Month DD, YYYY" |
| Religion | religion | Religion | Direct or "N/A" |
| Contact Number | contact_number | Contact No | Direct or "N/A" |
| Parents Number | parents_no | Parents No. | Direct or "N/A" |
| Address | address | Address | Direct or "N/A" |
| Email | email | Email | Direct or "N/A" |

## UI/UX Changes

### Before (Hardcoded Data)
```
ID Number: 2025-1398
Last Name: Sun
First Name: John
Middle Name: Smith
Gender: Male
Civil Status: Single
Date of Birth: January 23, 2000
Religion: #
Contact No: #
Parents No.: #
Address: Purok 4, Dumingag Zamboanga del Sur
Course: ACT/BSIS
```

### After (Dynamic Database Data)
```
ID Number: [student.student_id]
Last Name: [student.lastname]
First Name: [student.firstname]
Middle Name: [student.middlename or N/A]
Gender: [student.gender or N/A]
Civil Status: [student.civil_status or N/A]
Date of Birth: [formatted date or N/A]
Religion: [student.religion or N/A]
Contact No: [student.contact_number or N/A]
Parents No.: [student.parents_no or N/A]
Address: [student.address or N/A]
Email: [student.email or N/A] (NEW)
```

## Loading States

The component now handles three states:

1. **Loading State** (while fetching from API)
   - Shows: "Loading student data..."
   
2. **Error State** (if fetch fails)
   - Shows: "Error: [error message]"
   
3. **Empty State** (if no student data returned)
   - Shows: "No student data available"

## Testing

### Test with Test Credentials
1. Email: `testjohn1766858069@example.com`
2. Password: `zdspgc-mahayag`
3. Expected student data:
   - Student ID: `2025-00002`
   - Name: John Doe Smith
   - Status: Enrolled

### Steps to Test
1. Go to `http://localhost:3001/login`
2. Login with test credentials
3. Redirect to dashboard
4. Verify that all student data appears correctly in the left panel
5. Check console for any fetch errors
6. Hover over the lens to see the blur effect works

## API Endpoints Used

### Backend Endpoint
- **URL:** `http://localhost/online_enrollment_system/admin/api/manage_data.php`
- **Action:** `get_student`
- **Method:** POST (via proxy)
- **Parameters:** 
  - `action=get_student` (query param)
  - `student_id` (query param)
- **Returns:**
  ```json
  {
    "success": true,
    "student": {
      "student_id": "2025-00002",
      "firstname": "John",
      "middlename": "Doe",
      "lastname": "Smith",
      ...all other student fields...
    },
    "family": [...],
    "education": [...]
  }
  ```

### Frontend API Route
- **URL:** `http://localhost:3001/api/proxy`
- **Method:** POST
- **Body:**
  ```json
  {
    "action": "get_student",
    "student_id": "2025-00002"
  }
  ```

## Error Handling

The component includes error handling for:
- Network failures (fetch fails)
- Invalid responses (success: false)
- Missing student data (null student object)
- Date formatting errors (fallback to original string)

All errors are logged to browser console for debugging.

## Performance Considerations

- Data is fetched only when component mounts and user_id changes
- Prevents unnecessary API calls via dependency array: `[user?.student_id]`
- Loading state prevents UI flashing with dummy data
- Memoization possible if needed for future optimization

## Future Enhancements

Possible improvements:
1. Add caching to prevent repeated API calls
2. Implement error retry logic
3. Add loading skeleton UI
4. Support for editing student data
5. Show program information (course name) instead of just ID
6. Add print/export functionality
7. Real-time data sync with backend changes

## Files Modified

1. ✅ `components/component/lens.tsx` - Main component with data fetching logic
2. ✅ `app/api/proxy/route.ts` - API proxy route with student_id parameter support

## Verification Checklist

- [x] Student data fetches correctly on dashboard load
- [x] All database fields display dynamically
- [x] Loading state shows while fetching
- [x] Error state shows if fetch fails
- [x] Date formatting works correctly
- [x] Missing fields show "N/A"
- [x] Component handles null/undefined values gracefully
- [x] No hydration errors
- [x] Authenticated user's data displays correctly
- [x] API proxy properly forwards student_id parameter

## Notes

- The component uses the authenticated user's `student_id` from the auth system
- This ensures each student only sees their own data
- The `student_id` comes from localStorage (set during login)
- Data fetching only happens when mounted to avoid hydration issues
