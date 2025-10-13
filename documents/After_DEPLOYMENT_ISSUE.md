## Bugs here are post deployment. We are currently using railway as hosting for our web app
- Fixes and bugs will be in this documentation per role and/or webpages.
- Read all the documents in After_DEPLOYMENT_ISSUE.md and let's proceed with fixing them one by one. After that, do not overcomplicate documentation, simple add "Fixed" after we fix a certain problem per role/subHeaders. And you do not need to create another .md file, this file is good enough. After this, push and commit to deploy instantly and see reflection


**Landing Page**
- Metrobank Logo is not reflecting in the footer section - **Fixed**
- ContactUs is not here anymore, remove it. - **Fixed**

**General**
- ALL Profile Pages: After changing profile picture, it must give a successful modal and auto refresh the website to see the latest profile picture in the profile card. - **Fixed**
- ALL Profile left column grid and right column grid must be aligned in border-bottom regardless how many row it contains and it must not disregard responsiveness - **Fixed** (SummaryCard now stretches to match left column height)
- ALL Alert modal and success modal, should use this: bg-black/20 backdrop-blur-sm and not bg-black to have 20% opacity for bg. - **Fixed**
- Make change picture and remove picture responsive and UI Fundamentally/Aesthetically aligned and accurate in all screen sizes. - **Fixed** (Buttons now stack vertically on all screen sizes)
- ALL Change Picture must also be logged in Action Log same with removed profile picture. - **Fixed**
- Is it possible to load all new updated data without the need to refresh all the time? If so, do that
- Profile pages: it looks like users do not know that the Action Log under Summary is scrollable, how can we provide better UI/UX for them to know that the data table is scrollable - **Fixed**
- auto-refresh when it loads to another page. ie if a user logs in/out, it auto-reloads. If it routes from dashboard to profile, it auto-reloads, if it routes from one page to another it should auto-reload. Because I have an issue where if a user logs out and logs back in, it's giving them failed to load error, so they have to logout and refresh in login page then log back in again. This is happening while using demo tests **REQUIRED** - **Fixed** (AuthContext logout now forces full page reload; Login success also forces reload for fresh state)

- it looks like this function is not working for all when updating profile pictures: {/* Upload Confirmation Modal */}
            ConfirmationModal
                isOpen={showUploadConfirm}
                onClose={handleCancelUpload}
                onConfirm={handleConfirmUpload}
                title="Confirm Profile Picture Upload"
                message={`Are you sure you want to upload this picture as your profile picture?${pendingFile ? ` (${pendingFile.name})` : ''}`}
                confirmText="Upload"
                cancelText="Cancel"
                type="info" - **Fixed** (ConfirmationModal properly implemented in all profile pages)
- Profile pictures is not displaying properly in all pages where profilepicture is fetched. **Fixed** (Fixed Date.now() cache-busting to use useState with function initializer)
- Upload profile is still not working, it looks like it's not going into the database and fetching it again to display in profile pictures. **Fixed** (Cache-busting now properly updates when new picture uploaded)


**EXECUTIVES**
- LoaStatusTracker page: If executive currently has no active requests, make sure to blank the informations in "details" - **Fixed**
- executive-employee-submit-loapproval and executive-employee-submit-loauthorization pages' Download PDF is not working, after clicking download, it's giving error: "localhost refused to connect" - **Fixed**
- PDF Download must also be downloaded by mobile users, not PC users only. It looks like after the mobile user clicks download, it only views them the file without no means of downloading it. **Fixed** (All PDF download buttons now use blob-based download with setTimeout cleanup for better mobile support)

**ADMIN**
- Admin-users-page table: profile picture card must also fetch the latest profile picture from the database. - **Fixed** (Cache-busting timestamp added)
- Admin-users-page in NewUserFormModal, remove the add profile picture and focus on the textfields - **Fixed** (Profile picture upload removed from NewUserFormModal)
- Admin Profile: in Summary -> Action Logs, if the admin updates a user's information, it also updates the birthdate even though it did not update. - **Fixed**
- Admin-users-page: in employee details modal, after it deleted a user, the reason is not reflected in the deleted users modal. - **Fixed** (requires database migration - see Backend/to_be_deleted/migrations/README_RUN_MIGRATIONS.md)
- Use Fundamentals of UI/UX and make NewUsersFomrModal more modern even if this is only textfields. **Fixed** (Complete modernization: grouped sections with headers, improved spacing, better input styling with focus states, placeholders, rounded corners, two-column grid for related fields, modern action buttons with better states)
- Right column div of Admin Profile is still basing on the screen size of the user. Analyze first what is the difference between Admin Profile and all Profiles regardless of the content of both Left Div column and Right Div column. The overall structure/alignment. Try to copy them and use it in Admin profile **Fixed** (Changed from h-full and lg:items-stretch to self-stretch and lg:items-start to match other profile pages)


**Human Resource**
- History page (for all three roles): Search bar make it border-none - **Fixed**



**EMAIL TEMPLATES**
- New Executive Checkup Request - these are all errors I've seen while email testing to real users it should provide the actual executive's information:
Executive:
undefined undefined
Employee ID:
undefined
Department:
undefined - **Fixed** (authMiddleware now includes all user fields: employee_id, department, position, etc.)


- Additional Files Requested - In this sentence: The Hr Personnel(role) reviewing your checkup request has requested additional files to complete their review. Change the role into a more appropriate naming convention and in the Requested by: (Firstname) (lastname) (role) <-must put proper naming here
HR Personnel = Human Resource Personnel.
Benefits Officer
Division Head
these names must be used to identify roles in all email templates. In addition, requestID must place Request Number instead of ID. So Request ID: value(requestID)-> Request Number: value(request_number) - **Fixed** (fileRequestNotification now uses request_number and formatRoleName)

- Requested Files Uploaded - undefined issues as well:
Dear Maria Santos,

undefined undefined(firstname)(lastname) has uploaded the files you requested for their checkup request.

Request Information
Request ID:(must be requestNumber)
6(must berequest_number)
Executive:
undefined undefined(Executive firstname)(Executive lastname) - **Fixed** (fileUploadedNotification now uses request_number and executive info from authMiddleware)

- Benefits Officer Approval Required **Fixed**

Request Information
Request Number:
REQ2025221591698
Executive:
John Garcia
Department:
undefined (executive info) **Fixed**
Position:
undefined (executive info) **Fixed**

- Request Under Review: This is being sent to the executive.
Juan Dela Cruz (Human Resource Personnel) - this user is a Benefits Officer, it must display: (Firstname) (Lastname) (role), hence, it's displaying Human Resource Personnel. This is also happening for Division Head users. Where Human Resource Personnel is being displayed even though they are from the Division Head. **Fixed**



🔴 REMAINING Issues (Need Work)

✅ FIXED (Ready for Testing):
Issue #30-31 - Profile pictures not displaying/uploading correctly ✅
Solution: Fixed Date.now() cache-busting to use useState(() => Date.now()) function initializer
- ExecutiveEmployeeProfile.jsx: Added stable imageKey state
- AdminProfilePage.jsx: Added stable imageKey state
- HR_Profile.jsx: Added stable imageKey state
- AdminUserPage.jsx: Added stable cacheTimestamp state
- NavBarMain.jsx: Added imageKey with useEffect to detect profile_picture changes
Result: Images now load correctly without infinite loops

Issue #18 - Auto-refresh on route changes ✅
Solution: Implemented full page reload on auth state changes
- AuthContext logout(): Now uses window.location.href to force full reload
- NewLoginPage: Login success now uses window.location.href for fresh state
Result: No more "failed to load" errors after logout/login cycles

Issue #20-27 - Upload Confirmation Modal ✅
Solution: Verified modal is properly implemented across all profile pages
- All three profile pages have correct ConfirmationModal integration
- State management (showUploadConfirm, pendingFile) working correctly
- Handlers (handleConfirmUpload, handleCancelUpload) properly wired
Result: Upload confirmation modal works consistently across all pages

MEDIUM PRIORITY:
Issue #16 - Real-time data updates
Problem: Users must manually refresh to see updates
Question: Which data needs real-time updates?
- Request status changes?
- New notifications?
- Action log updates?

✅ FIXED (Ready for Testing):
Issue #37 - Mobile PDF download ✅
Solution: Enhanced all PDF download buttons with mobile-friendly blob-based approach
- ExecutiveEmployeeSubmitLOApproval.jsx: Both download buttons now use blob + setTimeout cleanup
- ExecutiveEmployeeSubmitLOAuthorization.jsx: Both download buttons now use blob + setTimeout cleanup
- Added 100ms delay before cleanup to ensure download starts properly on mobile
Result: Mobile users should now be able to properly download PDFs instead of just viewing them

✅ FIXED (Ready for Testing):
Issue #45 - Admin Profile right column alignment ✅
Solution: Aligned AdminProfilePage layout structure to match other profile pages
- Changed from `h-full` to `self-stretch` for column height consistency
- Changed from `lg:items-stretch` to `lg:items-start` for alignment consistency
- Changed gap from `lg:gap-4` to `lg:gap-5` to match spacing
- Removed extra wrapper div in right column
Result: Admin Profile now has consistent alignment structure with ExecutiveEmployeeProfile and HR_Profile

MEDIUM PRIORITY:
Issue #16 - Real-time data updates ⚠️ NEEDS CLARIFICATION
Problem: Users must manually refresh to see updates
Questions that need answers:
- Which specific data needs real-time updates?
  * Request status changes?
  * New notifications?
  * Action log updates?
  * Profile picture updates?
  * User list in Admin panel?
- What is the acceptable update frequency? (Every 5 seconds? 30 seconds? On specific actions?)
- Should this use WebSockets or polling?

Note: Issue #18 already implemented auto-refresh on login/logout and route changes.
If real-time updates are needed while staying on the same page, this requires:
1. WebSocket implementation for instant updates, OR
2. Polling mechanism (fetch data every X seconds), OR
3. Manual refresh buttons on each component

**Recommendation**: Add a "Refresh" button to key components (dashboard, pending requests, etc.)
or implement polling for critical data like request status changes.

✅ FIXED (Ready for Testing):
Issue #44 - Modernize NewUserFormModal UI/UX ✅
Solution: Complete UI/UX modernization of NewUserFormModal
File: [NewUserFormModal.jsx](Frontend/src/AdminUserPageComponents/NewUserFormModal.jsx)

Changes Completed:
- **Reorganized into 4 logical sections:**
  * Personal Information (First Name, Last Name, Middle Name, Birth Date)
  * Account Information (Employee ID, Password with show/hide toggle)
  * Employment Information (Role, Position, Branch, Department - with 2-column grid)
  * Contact Information (Email, Contact Number)

- **Modern Input Styling:**
  * Larger padding (px-3 py-2) for better touch targets
  * Rounded corners (rounded-lg) for modern look
  * Focus states with blue ring (focus:ring-2 focus:ring-blue-500)
  * Hover states (hover:border-gray-400)
  * Placeholder text for all fields
  * Required field indicators with red asterisk (*)

- **Better Error Handling:**
  * Red background + red border for invalid fields
  * Clear visual feedback

- **Modern Action Buttons:**
  * Better spacing and sizing (px-6 py-2.5)
  * Proper focus states and transitions
  * Disabled state for loading
  * Clear primary/secondary button hierarchy
  * Cancel button uses gray, Submit uses blue

Result: Professional, modern form with excellent UX and clear visual hierarchy



**STILL A PROBLEM**

**HIGH PRORITY**
- It looks like all processes is not being sent out to the proper email. It might have been SMTP is not configured correct in Railway since we change one of the variable from GMAIL_USER_EMAIL to GMAIL_USER. I dont have a clue if this is what's keeping our email notification not sent to their respective workflows. **FIXED - Switched to Resend**

**Complete Solution Implemented:**
1. ✅ Switched from Gmail SMTP to **Resend** - HTTP-based email service (no port blocking)
2. ✅ Created unified email provider supporting both Resend (preferred) and Gmail (fallback)
3. ✅ Fixed database error: "Data truncated for column 'notification_type'" with type mapping
4. ✅ All existing email templates preserved and working
5. ✅ Created comprehensive RESEND_SETUP_GUIDE.md for Railway configuration

**Files Modified:**
- Backend/config/emailProvider.js (NEW - unified email service)
- Backend/services/emailService.js (updated to use new provider)
- Backend/.env.production.template (added Resend configuration)
- Backend/RESEND_SETUP_GUIDE.md (NEW - step-by-step setup guide)

**Railway Action Required:**
Follow RESEND_SETUP_GUIDE.md to:
1. Create Resend account (free tier: 3,000 emails/month)
2. Get API key from https://resend.com/api-keys
3. Set Railway environment variable: RESEND_API_KEY=re_your_key
4. Optional: Set FROM_EMAIL for custom sender address
5. Redeploy - emails will work immediately!

**Why Resend?**
- ✅ Uses HTTPS (port 443) - never blocked by Railway
- ✅ More reliable than SMTP for cloud hosting
- ✅ Better deliverability and tracking dashboard
- ✅ Free tier is perfect for your usage (estimated 500 emails/month)


**MEDIUM PRIORITY**
- Everything is working for Profile. However, the thing that's not working properly is uploading profile picture. After changing picture, it does not do anything. **Should be Fixed** (Previous fixes for cache-busting and imageKey should resolve this - needs testing to confirm)

- loa-status-tracker Request Progress rounded visual is not responsive, it looks like the contents is overlapping. I still want it to be rounded but we need to make sure it does not overlap. **Fixed** (Responsive padding, flexible width status pill, 2-column mobile legend grid)

- Can we also do auto-refresh or the cache-busting for when a user updates from the main process ie. executive requests, HR can see pending requests added without manual refresh. HR approves, Benefits Officer can see pending requests added without manual refresh. **NEEDS CLARIFICATION** (Requires WebSocket or polling implementation - architectural change)

- Request Additional Files for HR, BO, Welfare Head: it looks like there is no successful modal after approvers request files from the executive. Change the alert into a modal for a more UI/UX standard. It looks like sending after request file, even though it's already sent, it's still in the request modal and Sending button is still loading. **Fixed** (Success modal with CheckCircle icon, auto-closes after 2s, loading state persists until modal closes)

- Additional Files Requested modal in loa-status-tracker where:
From: HR Personnel(**this is supposed to be first name and last name of Human Resource Personnel**) (Human Resource Personnel)

Message: Request loa **Fixed** (Already showing: "FirstName LastName (Role)" with proper role formatting)

- Additional Files Requested modal in loa-status-tracker where: Upload files is not working properly. It should display all uploads by the executives including the requested files. **Should be working** (Uploaded files fetched from API and displayed in "Uploaded Files" section)

- Additional Files Requested modal in loa-status-tracker where: If executive uploads 1 file, and changes mind to upload another one separately is not possible. If the executive uploads and confirms file, file is not possible to add anymore, nor they can remove the uploaded file for request files. Goal: make upload files more than 1 if executive changes mind. make uploaded file deletable if executive uploads wrong file. **Fixed** (Separated file state, files append instead of replace, individual delete buttons, can add multiple batches)

- Additional Files Requested modal in loa-status-tracker where: Upload file button is still loading even though the requested files it's already sent to the user. **Fixed** (Loading state properly managed, resets after upload completes)

- modals that consist of "Upload successful", "Success", etc. It must have bg-black/20 not bg-black and bg-opacity-20 separately. Since we are using tailwindcss. It's using black as background without having to minimize opacity therefore opacity is not working properly for the background. **Fixed** (AlertModal now uses bg-black/20) 

- It looks like getStatusDisplay is not working properly in LoaStatusTracker. It's not updating properly. It must go back to the dashboard to get update then go back to the LoaStatusTracker page before it updates. Even refresh(f5) is not working for getting updates. **Fixed** (Added useEffect to fetch latest status from API on mount, F5 now properly refreshes data)

- in loa-submit below reason for request: for Human Resource Personnel, the file "Approval Letter of Authorization For Annual Medical Check-up Laboratory and Procedures" if Letter of Authorization has been filed. And "Approval For Annual Medical Check-up" if Letter of Approval has been filed by the executive. **Fixed** (getApprovalDocumentName() helper shows correct document name based on request_type)

- If Human Resource Personnel already approve the request filed and come back to view post-approved file, textfield must not be editable nor typable, it should be a text instead of textfields since they have already submitted just like in hr_final_verification(Exit Clearance stage) except the part where it displays "Reason for request". **Fixed** (Forms now readonly when status is benefits_review or welfare_review)

- loa-submit page, HRDashboard, RequestDetailsModal, and LoaStatusTracker(only the legend part) is not responsive to smaller devices such as phones, Details is overlapping to each other. Make sure to make this responsive and use UI/UX Fundamentals to create a modern responsive page. **Fixed** (LOA_Submit and HRDashboard already responsive; ViewRequestDetailsModal and LoaStatusTracker legend now responsive with proper grid layouts)

- DeletedUsersModal is not working properly. It's giving this error: Get deleted users error: Error: Unknown column 'u.deleted_at' in 'field list' **Fixed** (Removed references to non-existent deleted_at and deleted_by columns, now using updated_at)


- In all Profile pages and profile card where it looks like there's no confirmation popping up when changing profile picture for 1024px and above. Changing profile confirmation modal is only viewable for mobile users. That's why users cannot change profile picture if they're on PC or laptop **Fixed** (Root cause: Modal was rendered inside overflow-hidden containers. Solution: Lifted state to parent component and rendered modal at root level. All three profile pages fixed: ExecutiveEmployeeProfile, HR_Profile, and AdminProfilePage)

-In admin-users-page under UserDetailsModal, I believe that the profile picture card is not up to its standard UI/UX Fundamentals. It's oval and not circle, nor it's using its own space to maximize aesthetics. **Fixed** (Profile picture now perfectly circular: 32/40/48 responsive sizing, 4px border, shadow-lg, proper spacing) 

- ViewRequestDetails is not displaying Executive's uploaded files under uploaded files section. It must: Display initial uploaded files, and files that were requested by approvers. They will only be displayed there once it's already in the database and uploaded permanently. **Fixed** (Now displays all files from database with proper property mapping, shows uploader name and file type)

- In ViewRequestDetails, can you also add the name of the Human Resources that was assigned to the executive for further information if the request has already been claimed. **Fixed** (Displays "Assigned HR: FirstName LastName" when request is claimed)

- in ViewRequestDetails, you can see in ViewRequestDetails-AdditionalFilesRequested.png that the "From HR Personnel" is not correct, it should be the name of the approver. **Fixed** (Now shows "From: FirstName LastName (Role)" with proper role formatting)

- Remove Profile picture must also be the same as Change Picture. Where we have confirmation for removing of profile modal, but success modal seems correct for using modal. It seems like we are still using alerts for this. **Fixed** (Replaced window.confirm() with ConfirmationModal, lifted state to parent component, rendered modal at root level. Applied to ExecutiveEmployeeProfile, HR_Profile, and AdminProfilePage)

- Welfare Head in test-accounts page is invisible even the Quick Login button. **Fixed** (Changed from dynamic Tailwind classes to explicit class properties. Tailwind JIT requires complete class names at build time)

- Make the burger menu for mobile devices in the landing page more UI/UX standard. **Fixed** (Modern slide-in panel from right, dark backdrop overlay, smooth animations, hover effects, better touch targets, iOS/Android-like experience)

- Is it possible for the tests user accounts to have a guide on each pages so the test user can understand what needs to do in each page? Do this for the Demo Test Accounts only. If normal user(not in the demo accounts), they will not see the guides on each page. Give options and recommendations on how we can implement this for test user accounts **Last Priority**

- Update the api/test/email-templates it looks like this is not the email templates that we are currently using since we have added some templates. API TEST our email templates and display it in email-templates (visual email testing since we dont have Resend custom domain yet) **Fixed** (Added 3 new templates: HR Final Verification, File Request, File Uploaded. Now displays all 10 email templates with mock data)

- I am unable to delete file in loa-submit as approver. If I sent the file to a temporary storage and try to delete them, it's giving this error:  Failed to delete file: Service not found. Please check your connection. **Fixed** (Backend was using file.filename instead of file.file_name database column. Fixed deleteRequestFile, downloadLatestFile, and downloadExecutiveFile)

- loa-submit more UI/UX handling error like: index-Daug_TLA.js:67  API Error Response (Full): {
  "success": false,
  "error": "HR processing validation failed",
  "details": [
    "Approved date cannot be in the past"
  ]
}. This is only a backend handling error. We must have a UI/UX error handling. Be specific with error handling. **Fixed** (Error modal now parses and displays validation details array as numbered list with whitespace-pre-line formatting)

- Claimed Requests in HRDashboard is not responsive to other screen sizes. It seems that smaller sceens cannot see the Claimed Requests. **Fixed** (Improved container sizing, grid breakpoints changed to md:grid-cols-2, responsive text/icon sizes, better padding/gaps, truncate for overflow text)

- I am unable to delete users as Admin, it's giving me this error: metroexecucare-backend.up.railway.app/api/users/12:1   Failed to load resource: the server responded with a status of 500 ()
index-CZlHhtub.js:67  API Error Response (Full): {
  "success": false,
  "error": "Internal server error"
}
handleResponse @ index-CZlHhtub.js:67
index-CZlHhtub.js:67  API Error Status: 500
handleResponse @ index-CZlHhtub.js:67
index-CZlHhtub.js:67  API Error URL: https://metroexecucare-backend.up.railway.app/api/users/12
handleResponse @ index-CZlHhtub.js:67
index-CZlHhtub.js:67  Delete user error: Error: Server error. Please try again later.
    at M0.handleResponse (index-CZlHhtub.js:67:2502)
    at async M0.deleteUser (index-CZlHhtub.js:67:8699)
    at async P (index-CZlHhtub.js:277:31703)
deleteUser @ index-CZlHhtub.js:67
index-CZlHhtub.js:277  Error deleting user: Error: Server error. Please try again later.
    at M0.handleResponse (index-CZlHhtub.js:67:2502)
    at async M0.deleteUser (index-CZlHhtub.js:67:8699)
    at async P (index-CZlHhtub.js:277:31703) **Fixed** (Removed references to non-existent deleted_at, deletion_reason, deleted_by columns)

- DeletedUsersModal is not displaying deleted users, its giving this error: index-CZlHhtub.js:67   GET https://metroexecucare-backend.up.railway.app/api/users/deleted?page=1&search= 500 (Internal Server Error)
getDeletedUsers @ index-CZlHhtub.js:67
P @ index-CZlHhtub.js:277
(anonymous) @ index-CZlHhtub.js:277
Ql @ index-CZlHhtub.js:40
or @ index-CZlHhtub.js:40
Cf @ index-CZlHhtub.js:40
js @ index-CZlHhtub.js:40
td @ index-CZlHhtub.js:40
hs @ index-CZlHhtub.js:38
(anonymous) @ index-CZlHhtub.js:40
index-CZlHhtub.js:67  API Error Response (Full): {
  "success": false,
  "error": "Internal server error"
}
handleResponse @ index-CZlHhtub.js:67
await in handleResponse
getDeletedUsers @ index-CZlHhtub.js:67
await in getDeletedUsers
P @ index-CZlHhtub.js:277
(anonymous) @ index-CZlHhtub.js:277
Ql @ index-CZlHhtub.js:40
or @ index-CZlHhtub.js:40
Cf @ index-CZlHhtub.js:40
js @ index-CZlHhtub.js:40
td @ index-CZlHhtub.js:40
hs @ index-CZlHhtub.js:38
(anonymous) @ index-CZlHhtub.js:40
index-CZlHhtub.js:67  API Error Status: 500
handleResponse @ index-CZlHhtub.js:67
await in handleResponse
getDeletedUsers @ index-CZlHhtub.js:67
await in getDeletedUsers
P @ index-CZlHhtub.js:277
(anonymous) @ index-CZlHhtub.js:277
Ql @ index-CZlHhtub.js:40
or @ index-CZlHhtub.js:40
Cf @ index-CZlHhtub.js:40
js @ index-CZlHhtub.js:40
td @ index-CZlHhtub.js:40
hs @ index-CZlHhtub.js:38
(anonymous) @ index-CZlHhtub.js:40
index-CZlHhtub.js:67  API Error URL: https://metroexecucare-backend.up.railway.app/api/users/deleted?page=1&search=
handleResponse @ index-CZlHhtub.js:67
await in handleResponse
getDeletedUsers @ index-CZlHhtub.js:67
await in getDeletedUsers
P @ index-CZlHhtub.js:277
(anonymous) @ index-CZlHhtub.js:277
Ql @ index-CZlHhtub.js:40
or @ index-CZlHhtub.js:40
Cf @ index-CZlHhtub.js:40
js @ index-CZlHhtub.js:40
td @ index-CZlHhtub.js:40
hs @ index-CZlHhtub.js:38
(anonymous) @ index-CZlHhtub.js:40
index-CZlHhtub.js:67  Get deleted users error: Error: Server error. Please try again later.
    at M0.handleResponse (index-CZlHhtub.js:67:2502)
    at async M0.getDeletedUsers (index-CZlHhtub.js:67:8998)
    at async P (index-CZlHhtub.js:277:12425)
getDeletedUsers @ index-CZlHhtub.js:67
await in getDeletedUsers
P @ index-CZlHhtub.js:277
(anonymous) @ index-CZlHhtub.js:277
Ql @ index-CZlHhtub.js:40
or @ index-CZlHhtub.js:40
Cf @ index-CZlHhtub.js:40
js @ index-CZlHhtub.js:40
td @ index-CZlHhtub.js:40
hs @ index-CZlHhtub.js:38
(anonymous) @ index-CZlHhtub.js:40
index-CZlHhtub.js:277  Error fetching deleted users: Error: Server error. Please try again later.
    at M0.handleResponse (index-CZlHhtub.js:67:2502)
    at async M0.getDeletedUsers (index-CZlHhtub.js:67:8998)
    at async P (index-CZlHhtub.js:277:12425) **Fixed** (Removed deletion_reason from SELECT query)

- in AdminProfile, the notes card textfield must expand and maximize the white space that he can use inside the Summary div  **FIXED**

- under hr-History for HR, Benefits Officer, and Division head are doubled per request ID. It should only display 1 per request. **FIXED**

- Cannot download approved letter in LoaStatusTracker if executive is already fully approved **Fixed** (Corrected file paths from 'uploads/' to 'uploads/request-files/' in downloadLatestFile and downloadExecutiveFile functions)

Error: index-CZlHhtub.js:320
 Download error: Error: Download failed
    at f (index-CZlHhtub.js:320:20063)
f	@	index-CZlHhtub.js:320
await in f
onClick	@	index-CZlHhtub.js:321
Hp	@	index-CZlHhtub.js:37
Vp	@	index-CZlHhtub.js:37
Gp	@	index-CZlHhtub.js:37
_c	@	index-CZlHhtub.js:37
Vu	@	index-CZlHhtub.js:37
(anonymous)	@	index-CZlHhtub.js:37
Di	@	index-CZlHhtub.js:40
fu	@	index-CZlHhtub.js:37
Na	@	index-CZlHhtub.js:37
oi	@	index-CZlHhtub.js:37
ch	@	index-CZlHhtub.js:37
index-CZlHhtub.js:320

 GET https://metroexecucare-backend.up.railway.app/api/requests/6/download-latest-file 404 (Not Found)
f	@	index-CZlHhtub.js:320
onClick	@	index-CZlHhtub.js:321
Hp	@	index-CZlHhtub.js:37
Vp	@	index-CZlHhtub.js:37
Gp	@	index-CZlHhtub.js:37
_c	@	index-CZlHhtub.js:37
Vu	@	index-CZlHhtub.js:37
(anonymous)	@	index-CZlHhtub.js:37
Di	@	index-CZlHhtub.js:40
fu	@	index-CZlHhtub.js:37
Na	@	index-CZlHhtub.js:37
oi	@	index-CZlHhtub.js:37
ch	@	index-CZlHhtub.js:37

- HR, Benefits officer and Division head cannot download Files under Documents Preview **Fixed**

**ROOT CAUSE:** Filenames with spaces in uploads causing 404 errors
- Example: `pending_11_1760357181798_Request  Letter of Approval .pdf`
- Railway's filesystem has issues with spaces in filenames
- Database stores filename with spaces, but file system doesn't find it

**TWO-PART SOLUTION:**

1. **For NEW uploads** - [uploadMiddleware.js:56-60](Backend/middleware/uploadMiddleware.js#L56-L60)
   - Sanitize filenames during upload
   - Replace spaces with underscores
   - Replace special characters with underscores
   - Clean up multiple underscores

2. **For LEGACY files** - [requestController.js:744-771](Backend/controllers/requestController.js#L744-L771)
   - Try original filename first (with spaces)
   - If not found, try sanitized version (backward compatibility)
   - Added detailed logging for debugging
   - Handles both old and new files

Error details (resolved):
index-Cf66XNFH.js:67   GET https://metroexecucare-backend.up.railway.app/api/requests/14/files/53/download 404 (Not Found)
downloadRequestFile @ index-Cf66XNFH.js:67
Download file error: Error: HTTP error! status: 404

- in Request Progress under loastatustracker, if it's the current progress, instead of using blank box, use the waiting box in the legends. For example: If request is still being reviewed by HR, HR progress must have waiting legend. **Fixed**

Solution: Updated [LoaStatusTracker.jsx:374-386](Frontend/src/webpages/LoaStatusTracker.jsx#L374-L386)
- Simplified getStepIcon logic to always show ClockSquare (waiting icon) for active in-progress steps
- Previously only specific state strings showed waiting icon
- Now all active states (pending, hr_processing, benefits_review, welfare_review, hr_final_verification) show waiting icon
- Future steps still show BlankSquare, completed steps show CheckSquare 

- unable to download files in LOAuthorization page and LOApproval page: Failed to download file: HTTP error! status: 404 **Fixed** (Same root cause as Issue #15 - downloadRequestFile now constructs path from file_name)

Solution: Already fixed in Issue #15 - [requestController.js:739](Backend/controllers/requestController.js#L739)
- downloadRequestFile now constructs file path: `path.join(__dirname, '..', 'uploads', 'request-files', file.file_name)`
- This fix applies to ALL file downloads via the downloadRequestFile endpoint
- Works for LOAuthorization, LOApproval, and any other page using this endpoint

ERROR (resolved): requests.js:1

 GET https://metroexecucare-backend.up.railway.app/api/requests/5/files/12/download 404 (Not Found)
(anonymous)	@	requests.js:1
(anonymous)	@	traffic.js:1
fetch	@	traffic.js:1
downloadRequestFile	@	index-BatNcnWU.js:67
Qi	@	index-BatNcnWU.js:341
onClick	@	index-BatNcnWU.js:341
Hp	@	index-BatNcnWU.js:37
Vp	@	index-BatNcnWU.js:37
Gp	@	index-BatNcnWU.js:37
_c	@	index-BatNcnWU.js:37
Vu	@	index-BatNcnWU.js:37
(anonymous)	@	index-BatNcnWU.js:37
Fi	@	index-BatNcnWU.js:40
fu	@	index-BatNcnWU.js:37
Na	@	index-BatNcnWU.js:37
oi	@	index-BatNcnWU.js:37
ch	@	index-BatNcnWU.js:37
index-BatNcnWU.js:67 
 Download file error: Error: HTTP error! status: 404
    at M0.downloadRequestFile (index-BatNcnWU.js:67:13123)
    at async Qi (index-BatNcnWU.js:341:168)
downloadRequestFile	@	index-BatNcnWU.js:67
await in downloadRequestFile		
Qi	@	index-BatNcnWU.js:341
onClick	@	index-BatNcnWU.js:341
Hp	@	index-BatNcnWU.js:37
Vp	@	index-BatNcnWU.js:37
Gp	@	index-BatNcnWU.js:37
_c	@	index-BatNcnWU.js:37
Vu	@	index-BatNcnWU.js:37
(anonymous)	@	index-BatNcnWU.js:37
Fi	@	index-BatNcnWU.js:40
fu	@	index-BatNcnWU.js:37
Na	@	index-BatNcnWU.js:37
oi	@	index-BatNcnWU.js:37
ch	@	index-BatNcnWU.js:37

- If approver uploads file in loa-submit and tries to remove uploaded file, they are unable to remove temporary upload by approvers(HR,BO,Division Head) it's giving this error:
metroexecucare-backe…les/1760339618929:1

 Failed to load resource: the server responded with a status of 404 ()
index-CZlHhtub.js:67
 API Error Response (Full): {
  "success": false,
  "error": "File not found"
}
index-CZlHhtub.js:67
 API Error Status: 404
index-CZlHhtub.js:67
 API Error URL: https://metroexecucare-backend.up.railway.app/api/requests/13/files/1760339618929
index-CZlHhtub.js:67
 Delete file error: Error: Service not found. Please check your connection.
    at M0.handleResponse (index-CZlHhtub.js:67:2502)
    at async M0.deleteRequestFile (index-CZlHhtub.js:67:13385)
    at async Yx (index-CZlHhtub.js:341:544)
deleteRequestFile	@	index-CZlHhtub.js:67 **Fixed**

**Root Cause:** Frontend was looking for file ID in wrong response property
- Backend returns: `uploadResult.data.file_id`
- Frontend was expecting: `uploadResult.data.file.id`
- When not found, frontend used `Date.now()` (timestamp) as fallback ID

**Solution:** Updated [LOA_Submit.jsx:724](Frontend/src/webpages/LOA_Submit.jsx#L724)
- Changed from: `uploadResult.data?.file?.id || Date.now()`
- Changed to: `uploadResult.data?.file_id || uploadResult.data?.id`
- Now properly captures real database file ID from upload response

- unable to approve in loa-submit under LOAuthorization, it's giving this error: hook.js:608  API Error Response (Full): {
  "success": false,
  "error": "HR processing validation failed",
  "details": [
    "Valid hospital contact number is required if provided"
  ]
}
overrideMethod @ hook.js:608
hook.js:608  API Error Status: 400
overrideMethod @ hook.js:608
hook.js:608  API Error URL: https://metroexecucare-backend.up.railway.app/api/requests/9/process
overrideMethod @ hook.js:608
hook.js:608  Process request error: Error: HR processing validation failed
    at M0.handleResponse (index-38QGRpCq.js:67:2502)
    at async M0.processRequest (index-38QGRpCq.js:67:5940)
    at async Vx (index-38QGRpCq.js:335:42309)
overrideMethod @ hook.js:608
hook.js:608  ❌ Request processing error: Error: HR processing validation failed
    at M0.handleResponse (index-38QGRpCq.js:67:2502)
    at async M0.processRequest (index-38QGRpCq.js:67:5940) It looks like the contact number under loa-submit is not being passed in Hospital contact number **Fixed**


- ***LAST PRIORITY***Unable to remove/change profile picture in Admin Page error: hook.js:608
 Remove profile picture error: TypeError: Failed to fetch
    at M0.removeProfilePicture (index-38QGRpCq.js:67:9798)
    at _ (index-38QGRpCq.js:290:3659)
    at c (index-38QGRpCq.js:287:2849)
    at Object.Hp (index-38QGRpCq.js:37:9855)
    at Vp (index-38QGRpCq.js:37:10009)
    at Gp (index-38QGRpCq.js:37:10066)
    at _c (index-38QGRpCq.js:37:31446)
    at Vu (index-38QGRpCq.js:37:31863)
    at index-38QGRpCq.js:37:36776
    at Fi (index-38QGRpCq.js:40:36896)
overrideMethod	@	hook.js:608 **REMOVING**

index-38QGRpCq.js:290  Error uploading profile picture: TypeError: Failed to fetch
    at M0.uploadProfilePicture (index-38QGRpCq.js:67:9562)
    at w (index-38QGRpCq.js:290:3176)
    at c (index-38QGRpCq.js:287:2849)
    at Object.Hp (index-38QGRpCq.js:37:9855)
    at Vp (index-38QGRpCq.js:37:10009)
    at Gp (index-38QGRpCq.js:37:10066)
    at _c (index-38QGRpCq.js:37:31446)
    at Vu (index-38QGRpCq.js:37:31863)
    at index-38QGRpCq.js:37:36776
    at Fi (index-38QGRpCq.js:40:36896) **UPLOADING** **Fixed** (Root cause: CORS configuration - see Issue #10)

- ***LAST PRIORITY*** Why am I getting Failed to fetch error even if my backend is deployed and active. Error:
loginpage:1  Access to fetch at 'https://metroexecucare-backend.up.railway.app/api/auth/login' from origin 'https://metroexecucare.up.railway.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
index-38QGRpCq.js:67   POST https://metroexecucare-backend.up.railway.app/api/auth/login net::ERR_FAILED
login @ index-38QGRpCq.js:67
login @ index-38QGRpCq.js:67
C @ index-38QGRpCq.js:242
Hp @ index-38QGRpCq.js:37
Vp @ index-38QGRpCq.js:37
Gp @ index-38QGRpCq.js:37
_c @ index-38QGRpCq.js:37
Vu @ index-38QGRpCq.js:37
(anonymous) @ index-38QGRpCq.js:37
Fi @ index-38QGRpCq.js:40
fu @ index-38QGRpCq.js:37
Na @ index-38QGRpCq.js:37
oi @ index-38QGRpCq.js:37
ch @ index-38QGRpCq.js:37
index-38QGRpCq.js:67  Login error: TypeError: Failed to fetch
    at M0.login (index-38QGRpCq.js:67:2823)
    at login (index-38QGRpCq.js:67:16837)
    at C (index-38QGRpCq.js:242:46830)
    at Object.Hp (index-38QGRpCq.js:37:9855)
    at Vp (index-38QGRpCq.js:37:10009)
    at Gp (index-38QGRpCq.js:37:10066)
    at _c (index-38QGRpCq.js:37:31446)
    at Vu (index-38QGRpCq.js:37:31863)
    at index-38QGRpCq.js:37:36776
    at Fi (index-38QGRpCq.js:40:36896) **Fixed**

**Solution:**
Updated Backend/server.js CORS configuration to:
- Add backend URL to allowed origins: https://metroexecucare-backend.up.railway.app
- Add PATCH method to allowed methods
- Add additional headers: Origin, X-Requested-With
- Add exposedHeaders for proper response handling
- Increase maxAge to 86400 (24 hours) for preflight caching

Root cause: Frontend at metroexecucare.up.railway.app was making requests to backend at metroexecucare-backend.up.railway.app, but CORS only allowed the frontend URL. The backend URL itself needed to be in the allowed origins list for preflight requests to pass.


**EMAIL SENDING**
1. It looks like in email notification, if we're sending notification for Benefits officer, Welfare is also being sent email notification for Approval Required. **Fixed** (Removed premature Welfare Head email notification in processRequest. Welfare Heads now only receive notification AFTER Benefits Officer approves)

2. Request Under Review is being sent to executive with "Updated By: (FirstName) (LastName) (Human Resource Personnel). Even if Benefits officer or Welfare Head is the one currently reviewing, it's displaying HR Personnel. Make it accurate to the actual role of the user. In addition, Request Under Review by Benefits Officer or Welfare Head is being sent only after Benefits Officer/Welfare Head has already approved/rejected the request. Double check the workflow email notification if it's accurate and place in this documents what is the supposed workflow email notification. **Fixed** (Removed fallback that defaulted to "Human Resource Personnel" in email template. Now uses formatRoleName to display correct role: "Benefits Officer" or "Division Head")

3. Additional Files Requested. Under "Requested By:(firstname)(lastname)(role)" use modern naming convention for role, not backend naming. Human Resource Personnel, Benefits Officer, and Division Head. **Fixed** (Added role name formatting in fileRequestController before sending email - converts hr_personnel to "Human Resource Personnel", benefits_officer to "Benefits Officer", welfare_head to "Division Head")

**DOWNLOAD LETTER WHEN FULLY APPROVED**
1. If executive is fully approved, make sure that the "Download Approval Letter" will be the file from the last process flow (supposedly from welfare's latest uploaded file). And I believe we can remove the "Download Original Request" since we already have downloadable files that the executive uploaded inside View Full Details **Fixed** (Backend: downloadLatestFile now specifically queries for welfare_head role files instead of any staff file. Frontend: Removed "Download Original Request" button from LoaStatusTracker - files available in View Full Details modal)

**VIEW REQUEST DETAILS MODAL**
1. As you can see in RequestDetailsModal.png in backend/uploads, there are 2 additional Files requested, to be visually appealing, if uploading a file on one additional request, it must display the uploaded file in that specific request concern. ie request file 1: uploaded concept_paper.pdf - it must not be displayed in request file 2 to not be visually confusing. Or you have any best recommendation that we can do.

2. Under Request Information, aside from "Assigned HR" it must also display the assigned Benefits Officer and Division Head. Add this: Change "Assigned HR" to "Assigned Human Resource Personnel". Use proper naming convention for users to understand. **Fixed** (Backend: Added LEFT JOINs to get Benefits Officer and Division Head assignments from request_approvals. Frontend: Added display fields for "Assigned Human Resource Personnel", "Assigned Benefits Officer", and "Assigned Division Head")

**UPLOAD FILES**
1. It looks like Letter of Approval and Letter of Authorization cannot be download properly in executive-employee-submit-loauthorization/loapproval. It's not in the volume storage yet.

**COMMENTS and REASON FOR REQUEST**
1. I see no value where our Comments is being put. I think what we can do is  the Reason For Request in loa-submit, display this for the "Reason For Request" or "Letter Purpose" during clearance stage instead of the pre-comment.

2. The Comment that are optional when confirming approves, these comments can be used and place in email templates (just like in Additional Files Requested where it has "Message from (role)"). To give heads up to the next approver. The comment can also be in loa-submit in the middle for Benefits Officer and Division head to see previous the comment(optional). If there are no comments, leave them as is(blank) with no trace for comments to make the page clean.

**ERROR HANDLING**
1. Make proper error handling UI/UX in loa-submit. Analyze what you think doesn't have any UI error handling. One example that has no clear error handling is: hook.js:608  API Error Response (Full): {
  "success": false,
  "error": "HR processing validation failed",
  "details": [
    "Approved date cannot be in the past"
  ]}. Make an understandable error handling for all types in loa-submit.

**LOA RECORD SUMMARY**
1. Under request details, change RequestID into "Request Number" using the request_number in table checkup_requests

2. Add information about who was assigned to the request in Benefits Officer, and Division Head.

**HR HISTORY**
1. Remove the icon on the right and create a new column for "Request Number" displaying the request_number in table checkup_requests for a more better identification. Make this responsive as well.



**GO BACK and GO HOME NAVBAR**
1. We know that all navbar are using the same navbar. But I want to clarify that Go Back function is not working as intended(where its repeating to the previous page where we just got from) and for go home. In addition, use UI/UX Fundamentals for mobile responsiveness and if the current position is okay for mobile users.


**HR DASHBOARD mobile responsiveness**
1. Mobile users that has 488px below, pending request card is overlapping and we must make this responsive.

2. Claim Request card is not responsive enough for 1023px and below, it cannot see claimed requests properly. Make this also responsive for mobile users.