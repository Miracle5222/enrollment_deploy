# Testing the Dashboard Data Integration

## Quick Start

### Step 1: Open Login Page
Navigate to: `http://localhost:3001/login`

### Step 2: Login with Test Credentials
- **Email:** `testjohn1766858069@example.com`
- **Password:** `zdspgc-mahayag`

### Step 3: Dashboard Should Display Real Student Data

#### Expected Data Display:
```
Name (Header): Smith, John D.
ID Number: 2025-00002
Last Name: Smith
First Name: John
Middle Name: Doe
Gender: Male
Civil Status: Single
Date of Birth: January 15, 2005
Religion: Catholic
Contact No: 09171234567
Parents No.: 09189876543
Address: 123 Main Street, Quezon City
Email: testjohn1766858069@example.com
```

## What Changed

### Before
- Hardcoded dummy data displayed
- Only showed 12 fields with placeholder "#" values
- No database integration
- Static student name: "Sun, John S."

### After
- Real student data from database
- Displays all 13 fields including email
- All missing values show "N/A"
- Authenticated user's actual data displayed
- Dates formatted nicely (e.g., "January 15, 2005")

## Verification Checklist

### Visual Verification
- [ ] Student name displays as "Smith, John D."
- [ ] Student ID shows "2025-00002"
- [ ] All field values match the database
- [ ] No errors in the browser console
- [ ] Loading spinner appeared briefly while fetching
- [ ] Lens hover effect still works

### Data Validation
- [ ] All required fields are populated from database
- [ ] Date of birth is formatted correctly
- [ ] Phone numbers display properly
- [ ] Address text is complete
- [ ] Email field is visible and correct

### Error Handling
- [ ] If logged out, dashboard redirects to login
- [ ] Network errors display error message
- [ ] Missing student data shows "No student data available"

## Browser Console Checks

### Expected Console Output
```
Logging in at: /api/proxy
Credentials: {email: "...", password: "..."}
Response status: 200
Proxying POST to: http://localhost/online_enrollment_system/admin/api/manage_data.php?action=get_student&student_id=2025-00002
```

### Look For Warnings
- No "Hydration failed" errors
- No "Cannot read property of undefined" errors
- No CORS errors

## API Network Requests

### Check Network Tab
1. Open DevTools → Network tab
2. Login and navigate to dashboard
3. Look for two POST requests to `/api/proxy`:

**Request 1: Login**
```
POST /api/proxy
Body: {action: "login_student", email: "...", password: "..."}
Response: {success: true, token: "...", student: {...}}
```

**Request 2: Get Student Data**
```
POST /api/proxy
Body: {action: "get_student", student_id: "2025-00002"}
Response: {success: true, student: {...}, family: [...], education: [...]}
```

## Troubleshooting

### Issue: Dashboard shows "Loading student data..." forever
**Solution:**
- Check if user.student_id is populated in localStorage
- Open DevTools → Application → Local Storage
- Look for key "student" with student_id field

### Issue: Shows "Error: Failed to fetch"
**Solution:**
- Verify PHP backend is running
- Check if `http://localhost/online_enrollment_system/admin/api/manage_data.php` is accessible
- Check browser console for detailed error

### Issue: Shows "No student data available"
**Solution:**
- Verify student_id exists in database
- Check if database has data for that student ID
- Verify `get_student` endpoint works directly

### Issue: Student name shows as "undefined, undefined"
**Solution:**
- Database record may have NULL values for firstname/lastname
- Insert test data or update student record with proper name

## Other Test Accounts

If you want to test with other students:

### Student 2: Roneil Bansas
- **Email:** `roneilbansas5222@gmail.com`
- **Password:** `zdspgc-mahayag`
- **Student ID:** `2025-00003`

### Student 3: Rogernel Bansas
- **Email:** `roneilbansas@gmail.com`
- **Password:** `zdspgc-mahayag`
- **Student ID:** `2025-00004`

## Database Query

To verify data in the database, run:
```sql
SELECT * FROM student_tbl WHERE student_id = '2025-00002';
```

This should return all the fields displayed on the dashboard.

## Performance

- Initial load time: ~2-5 seconds (includes page render + API call)
- Subsequent navigations: ~500ms (only page render, data cached)
- No unnecessary API calls (data fetched once on mount)

## Next Steps

After verifying the integration works:

1. Test with all student accounts in the database
2. Verify all field values display correctly
3. Test error scenarios (network down, invalid student ID)
4. Check that only authenticated users can see dashboard
5. Consider adding data refresh/reload functionality
6. Plan for program_id to program name conversion
