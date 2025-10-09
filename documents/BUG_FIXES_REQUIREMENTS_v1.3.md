# Bug Fixes & Requirements - MetroExecuCare v1.3
## User-Reported Issues & Implementation Plan

**Date:** January 9, 2025
**Status:** 🔄 **IN PROGRESS**
**Reporter:** User Testing Session

---

## 📋 Overview

This document outlines all bugs and feature requests identified during user testing of MetroExecuCare v1.3. Issues are categorized by severity and role, with detailed implementation plans for each fix.

---

## 🔴 CRITICAL ISSUES (All Roles)

### Issue #1: Notes Not Being Saved to Database
**Severity:** HIGH
**Affected Roles:** All (Executive, HR, Benefits, Welfare, Admin)
**Status:** 🔄 IN PROGRESS

**Problem:**
- Users can enter notes in their profile
- Notes are not persisted to database
- Notes do not display when reopening profile

**Root Cause:**
- `notes` column does not exist in users table schema
- userController returns empty string for notes

**Solution:**
1. Add `notes` column to users table:
   ```sql
   ALTER TABLE users ADD COLUMN notes TEXT NULL AFTER birth_date;
   ```

2. Update `Backend/config/database/manual-schema.js` to include notes column

3. Fix `getUserNotes()` in `Backend/controllers/userController.js`:
   - Change from `SELECT id FROM users` to `SELECT notes FROM users`
   - Return actual notes value

4. Fix `updateUserNotes()` in `Backend/controllers/userController.js`:
   - Re-enable UPDATE query to set notes column
   - Log activity when notes change

**Testing:**
- [ ] Admin can add/edit notes on own profile
- [ ] HR can add/edit notes on own profile
- [ ] Executive can add/edit notes on own profile
- [ ] Benefits Officer can add/edit notes on own profile
- [ ] Welfare Head can add/edit notes on own profile
- [ ] Notes persist after logout/login
- [ ] Notes display correctly after browser refresh

---

### Issue #2: Profile Picture Not Displaying
**Severity:** HIGH
**Affected Roles:** All (Executive, HR, Benefits, Welfare, Admin)
**Status:** 🔄 IN PROGRESS

**Problem:**
- User uploads profile picture
- Picture saves to database successfully
- Picture does not display in "Basic Information" section of Profile page

**Current Behavior:**
- Upload successful
- Database updated with file path
- Frontend does not show the uploaded image

**Investigation Needed:**
1. Check if `profile_picture` path is being returned by API
2. Verify frontend is correctly reading the path
3. Ensure image file is accessible via URL
4. Check if CORS or static file serving is configured

**Files to Check:**
- `Backend/controllers/userController.js` - uploadProfilePicture function
- `Backend/controllers/profileController.js` - profile picture serving
- `Frontend/src/webpages/*Profile.jsx` - All profile pages
- `Backend/server.js` - Static file serving configuration

**Solution:**
1. Verify API returns full profile picture URL
2. Check frontend Profile components use correct image src
3. Ensure backend serves uploaded files from uploads directory
4. Add error handling for missing images

**Testing:**
- [ ] Upload profile picture as Admin
- [ ] Verify picture displays immediately after upload
- [ ] Refresh page and verify picture still displays
- [ ] Repeat for all other roles
- [ ] Test with different image formats (JPG, PNG)
- [ ] Test with large images

---

## 🟡 HIGH PRIORITY ISSUES

### Issue #3: Admin Action Logs Missing User Management Actions
**Severity:** MEDIUM
**Affected Role:** Admin
**Status:** 🔄 IN PROGRESS

**Problem:**
- Admin adds, deletes/archives, or restores users
- These actions are not appearing in Action Logs
- Admin Profile Summary should show archived/restored users

**Current Behavior:**
- User management actions are being logged to activity_logs table
- Admin Action Logs page is not displaying them
- Summary statistics don't reflect user management activities

**Files Involved:**
- `Backend/controllers/userController.js` - getAdminActivityLogs()
- `Frontend/src/webpages/AdminProfilePage.jsx` - Activity logs display
- `Backend/utils/activityLogger.js` - Activity logging utility

**Solution:**
1. Verify `getAdminActivityLogs()` queries include user management actions
2. Check frontend correctly displays all action types
3. Update Summary section to show:
   - "User [Employee ID] has been archived by [Admin Name]"
   - "User [Employee ID] has been restored by [Admin Name]"
   - "User [Employee ID] has been created by [Admin Name]"

**Testing:**
- [ ] Create new user → Verify appears in action logs
- [ ] Archive user → Verify appears in action logs with employee ID
- [ ] Restore user → Verify appears in action logs with employee ID
- [ ] Check Summary shows correct employee IDs
- [ ] Verify timestamp accuracy

---

## 🟢 MEDIUM PRIORITY ISSUES (Executive Role)

### Issue #4: Active Request Modal - Black Background
**Severity:** LOW
**Affected Role:** Executive
**Status:** 🔄 IN PROGRESS

**Problem:**
- When executive has active request and tries to submit new one
- "Active Request Exists" modal shows with black background
- Should have blurred background like other modals

**File:**
- `Frontend/src/webpages/LOA_Submit.jsx` - Active request modal

**Solution:**
Add `backdrop-blur-sm` class to modal overlay div

**Before:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center...">
```

**After:**
```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center...">
```

---

### Issue #5: Display Request Number Instead of Request ID
**Severity:** LOW
**Affected Role:** Executive
**Status:** 🔄 IN PROGRESS

**Problem:**
- Modals show "Request ID: 2"
- Should show "Request Number: MEC-2025-001" (actual request_number from database)

**Files:**
- `Frontend/src/webpages/LOA_Submit.jsx` - Active Request modal
- `Frontend/src/components/ViewRequestDetailsModal.jsx` - Request details modal
- Any other modals showing request information

**Solution:**
1. Change label from "Request ID" to "Request Number"
2. Display `request_number` field instead of `id` field

**Example:**
```jsx
// Before
<p>Request ID: {request.id}</p>

// After
<p>Request Number: {request.request_number}</p>
```

---

### Issue #6: View Request Button Goes to Static Page
**Severity:** MEDIUM
**Affected Role:** Executive
**Status:** 🔄 IN PROGRESS

**Problem:**
- Active Request modal has "View Request" button
- Button navigates to old static LOA status tracker
- Should navigate to current/updated `loa-status-tracker` page

**File:**
- `Frontend/src/webpages/LOA_Submit.jsx` - "View Request" button handler

**Solution:**
1. Update navigation path to correct status tracker page
2. Pass request ID as route parameter or query parameter
3. Ensure status tracker page accepts and displays the request

**Current (Wrong):**
```jsx
navigate('/static-loa-tracker')
```

**Should Be:**
```jsx
navigate(`/loa-status-tracker?requestId=${activeRequest.id}`)
// OR
navigate(`/loa-status-tracker/${activeRequest.id}`)
```

---

### Issue #7: Request Details Modal - Black Background
**Severity:** LOW
**Affected Role:** Executive
**Status:** 🔄 IN PROGRESS

**Problem:**
- Request Details Modal has black background
- Should have blurred background for consistency

**File:**
- `Frontend/src/components/ViewRequestDetailsModal.jsx`

**Solution:**
Add `backdrop-blur-sm` class to modal overlay

**Note:** This was supposed to be fixed already in line 113. Need to verify if fix was applied correctly.

---

### Issue #8: Replace alert() with Modal Components
**Severity:** MEDIUM
**Affected Role:** Executive (and potentially all roles)
**Status:** 🔄 IN PROGRESS

**Problem:**
- Delete request uses `alert()` for error messages
- File upload uses `alert()` for success/error messages
- Should use consistent modal-based error/success handling

**Files:**
- `Frontend/src/components/ViewRequestDetailsModal.jsx`
- Any other components using alert()

**Solution:**
1. Create reusable `ConfirmationModal` component
2. Create reusable `AlertModal` component for success/error messages
3. Replace all `alert()` and `confirm()` calls with modal components

**Example Implementation:**
```jsx
// Create components/AlertModal.jsx
const AlertModal = ({ isOpen, onClose, title, message, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className={`text-lg font-semibold mb-2 ${type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {title}
        </h3>
        <p className="text-gray-700 mb-4">{message}</p>
        <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded">
          OK
        </button>
      </div>
    </div>
  );
};
```

**Usage:**
```jsx
// Replace
alert('Files uploaded successfully!');

// With
setAlertModal({
  isOpen: true,
  type: 'success',
  title: 'Success',
  message: 'Files uploaded successfully!'
});
```

---

## 🔴 CRITICAL BUG (Executive Role)

### Issue #9: Delete Request Fails with entity_type Error
**Severity:** CRITICAL
**Affected Role:** Executive
**Status:** 🔄 IN PROGRESS

**Problem:**
- Executive tries to delete unclaimed request
- Request is deleted from database successfully
- Backend returns 500 error with message: "Unknown column 'entity_type' in 'field list'"

**Error Details:**
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
localhost:5000/api/requests/2

API Error Response:
{
  "success": false,
  "message": "Failed to delete request",
  "error": "Unknown column 'entity_type' in 'field list'"
}
```

**Root Cause:**
- Activity logger trying to insert log with `entity_type` column
- `entity_type` column does not exist in `activity_logs` table

**Files to Fix:**
- `Backend/controllers/requestManagementController.js` - deleteRequest function
- `Backend/utils/activityLogger.js` - logActivity function
- `Backend/config/database/manual-schema.js` - activity_logs table

**Investigation:**
1. Check activity_logs table schema in manual-schema.js
2. Find where entity_type is being used in logActivity
3. Either add entity_type column OR remove references to it

**Solution Option 1 (Add Column):**
```sql
ALTER TABLE activity_logs ADD COLUMN entity_type VARCHAR(50) AFTER action;
```

**Solution Option 2 (Remove References):**
Remove entity_type from logActivity calls in requestManagementController.js

**Recommended:** Option 2 - Remove references since entity_type is not defined in schema

**Testing:**
- [ ] Delete unclaimed request as executive
- [ ] Verify request is deleted
- [ ] Verify no 500 error returned
- [ ] Verify activity log is created
- [ ] Check activity_logs table for entry

---

## 📊 Implementation Priority

### Phase 1 (Critical - Do First):
1. ✅ Issue #9: Fix entity_type error in delete request
2. ✅ Issue #1: Add notes column and fix notes functionality
3. ✅ Issue #2: Fix profile picture display

### Phase 2 (High Priority):
4. ✅ Issue #3: Fix Admin action logs
5. ✅ Issue #6: Fix View Request navigation
6. ✅ Issue #8: Replace alert() with modals

### Phase 3 (Polish):
7. ✅ Issue #4: Blur background on Active Request modal
8. ✅ Issue #5: Display Request Number instead of ID
9. ✅ Issue #7: Blur background on Request Details modal

---

## 🧪 Testing Checklist

### General (All Roles):
- [ ] Notes can be added and saved
- [ ] Notes persist after logout/login
- [ ] Profile picture uploads successfully
- [ ] Profile picture displays in Basic Information
- [ ] Profile picture persists after page refresh

### Admin Specific:
- [ ] Create user action appears in logs
- [ ] Archive user action appears in logs with employee ID
- [ ] Restore user action appears in logs with employee ID
- [ ] Summary shows correct employee IDs for actions

### Executive Specific:
- [ ] Active Request modal has blurred background
- [ ] Modal shows Request Number, not Request ID
- [ ] View Request button goes to correct status tracker
- [ ] Request Details modal has blurred background
- [ ] Delete request works without errors
- [ ] Delete request shows success modal (not alert)
- [ ] File upload shows success modal (not alert)
- [ ] Error handling uses modals (not alerts)

---

## 📝 Files to Modify

### Backend:
1. `config/database/manual-schema.js` - Add notes column
2. `controllers/userController.js` - Fix notes functions, verify action logs
3. `controllers/requestManagementController.js` - Fix entity_type error
4. `utils/activityLogger.js` - Remove entity_type references

### Frontend:
1. `components/ViewRequestDetailsModal.jsx` - Blur background, modals instead of alerts
2. `webpages/LOA_Submit.jsx` - Blur background, Request Number, View Request navigation
3. `webpages/AdminProfilePage.jsx` - Verify action logs display
4. `webpages/*Profile.jsx` - Fix profile picture display (all role profiles)
5. `components/AlertModal.jsx` - CREATE NEW - Reusable alert modal
6. `components/ConfirmationModal.jsx` - CREATE NEW - Reusable confirmation modal

---

## 🎯 Success Criteria

✅ **All issues resolved when:**
1. Notes save and display correctly for all roles
2. Profile pictures upload and display correctly for all roles
3. Admin can see all user management actions in action logs
4. Executive modals have blurred backgrounds
5. Request Number displays instead of Request ID
6. View Request navigates to correct page
7. Delete request works without 500 error
8. No alert() popups - all use modal components

---

## 📌 Notes for Implementation

- **Database Changes:** Run migration to add notes column after updating manual-schema.js
- **Testing:** Test each role individually after fixes
- **Modal Components:** Create reusable components to avoid code duplication
- **Activity Logs:** Ensure consistent formatting for all action types
- **Error Handling:** All errors should use modal-based UI, not alert()

---

**Document Version:** 1.0
**Last Updated:** January 9, 2025
**Next Review:** After implementation of all fixes
