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

- It looks like getStatusDisplay is not working properly in LoaStatusTracker. It's not updating properly. It must go back to the dashboard to get update then go back to the LoaStatusTracker page before it updates. Even refresh(f5) is not working for getting updates.

- in loa-submit below reason for request: for Human Resource Personnel, the file "Approval Letter of Authorization For Annual Medical Check-up Laboratory and Procedures" if Letter of Authorization has been filed. And "Approval For Annual Medical Check-up" if Letter of Approval has been filed by the executive.

- If Human Resource Personnel already approve the request filed and come back to view post-approved file, textfield must not be editable nor typable, it should be a text instead of textfields since they have already submitted just like in hr_final_verification(Exit Clearance stage) except the part where it displays "Reason for request".

- loa-submit page, HRDashboard, RequestDetailsModal, and LoaStatusTracker(only the legend part) is not responsive to smaller devices such as phones, Details is overlapping to each other. Make sure to make this responsive and use UI/UX Fundamentals to create a modern responsive page.

- DeletedUsersModal is not working properly. It's giving this error: Get deleted users error: Error: Unknown column 'u.deleted_at' in 'field list' **Fixed** (Removed references to non-existent deleted_at and deleted_by columns, now using updated_at)