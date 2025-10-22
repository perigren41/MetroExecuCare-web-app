MetroExecuCare System - Requirements Documentation

Document Information
- Project Name: MetroExecuCare - Executive Checkup Management System
- Version: 2.0
- Last Updated: October 20, 2025
- Status: Active Development

---

Requirements Documentation

1. Functional Requirements

1.1 User Authentication and Authorization

REQ001: The user must be able to log in using their assigned email and password.

REQ002: The system must hash all passwords using bcrypt with salt rounds of 12 before storing in the database.

REQ003: The system must generate JWT access tokens (7-day expiry) and refresh tokens (30-day expiry) upon successful login.

REQ004: The system must verify user account status (is_active) before allowing login.

REQ005: The system must provide a token refresh endpoint to generate new access tokens using valid refresh tokens.

REQ006: The system must enforce role-based access control for 5 user roles (Executive, Human Resource Personnel, Benefits Officer, Division Head, Admin).

REQ007: The user must have the option to change their password by providing current password and new password.

REQ008: The user must be able to view and update their profile information (name, email, department, position, branch, contact number).

REQ009: The system must prevent users from updating email addresses that are already taken by other users.

REQ010: The system must allow users to upload and manage profile pictures (JPG, PNG, GIF, max 5MB).

1.2 User Management (Admin)

REQ011: The admin must be able to create new user accounts with complete profile information (employee ID, email, password, name, role, department, position, branch, contact number, birth date).

REQ012: The admin must be able to view list of all users with filtering by role, department, branch, and active status.

REQ013: The admin must be able to update user information including email, name, role, department, position, and branch.

REQ014: The admin must be able to activate/deactivate user accounts.

REQ015: The admin must be able to soft delete user accounts with ability to restore deleted users.

REQ016: The admin must be able to add/update notes for any user account.

REQ017: The admin must be able to view activity logs for specific users with filtering by date range and action type.

1.3 Executive Checkup Request

REQ018: Executives must be able to submit a check-up request via an online form with the following information:
- Checkup type (pre-employment, annual, executive)
- Checkup date
- Hospital selection (accredited or custom entry)
- Reason for checkup
- File attachments (PDF only, max 10MB per file)

REQ019: The system must automatically generate unique request numbers using format REQ[YEAR][TIMESTAMP][RANDOM].

REQ020: The system must automatically calculate due dates as 15 working days from submission date (excluding weekends).

REQ021: The system must create 4 approval stage records upon request creation (HR Stage, Benefits Stage, Division Head Stage, HR Final Stage).

REQ022: The system must send email notifications to Human Resource Personnel upon new request submission.

REQ023: The system must prevent executives from creating new requests if they have an active uncompleted request.

REQ024: Executives must be able to edit their requests only if status is "pending_assignment" (unclaimed).

REQ025: Executives must be able to delete their requests only if status is "pending_assignment" (unclaimed).

REQ026: The system must perform soft delete by setting deleted_at timestamp and is_deleted flag.

1.4 Request Tracking and Viewing

REQ027: The officer must be able to track the status of their request in real-time.

REQ028: All requests must be saved in the system for historical reference.

REQ029: All users must be able to view their past transactions and records (based on role):
- Executives: Only their own requests
- Human Resource Personnel: All requests or assigned requests
- Benefits Officers: Requests at benefits stage
- Division Heads: Requests at division head stage
- Admins: All requests

REQ030: The system must support filtering requests by status, date range, assigned HR, department, and branch.

REQ031: The system must support pagination for request lists with configurable page size.

REQ032: The system must provide detailed request view showing request information, executive information, assigned HR, approval history, uploaded files, activity timeline, and file requests.

1.5 Request Assignment and Claiming

REQ033: The admin, Benefits Officer, and Division Head must be able to assign requests to Human Resource Personnel.

REQ034: The system must update request status to "assigned_to_hr" upon assignment.

REQ035: The system must send email notifications to assigned Human Resource Personnel.

REQ036: Human Resource Personnel must be able to claim unassigned requests.

REQ037: The system must update request status to "assigned_to_hr" upon claiming.

REQ038: Human Resource Personnel must be able to release (unclaim) requests they are assigned to.

REQ039: The system must update request status to "pending_assignment" upon release and clear assigned HR information.

1.6 Request Processing

REQ040: Assigned Human Resource Personnel must be able to process requests by providing processing notes and hospital assignment.

REQ041: The system must update request status to "in_progress" upon processing.

REQ042: The system must record processing details (processed_by, processed_at, processing_notes).

REQ043: The system must send email notifications to executives when their requests are being processed.

1.7 Approval Workflow

REQ044: The system must implement a 5-stage approval workflow:
1. HR Stage: Human Resource Personnel approves initial processing
2. Benefits Stage: Benefits Officer approves benefits eligibility
3. Division Head Stage: Division Head approves welfare compliance
4. HR Final Stage: Human Resource Personnel performs final approval

REQ045: The system must notify each approver in the defined approval chain when a request reaches their stage.

REQ046: Each approver must be able to approve requests at their respective stage with approval notes.

REQ047: The system must automatically progress to the next approval stage upon stage approval:
- HR Stage approval → pending_benefits status
- Benefits Stage approval → pending_division_head status
- Division Head Stage approval → pending_hr_final status
- HR Final Stage approval → approved status (final)

REQ048: Each approver must be able to reject requests at their stage with rejection reason.

REQ049: The system must update request status to "rejected" upon rejection at any stage.

REQ050: The system must send email notification to executive upon rejection with rejection reason.

REQ051: The system must record approval details for each stage (approver ID, name, timestamp, notes, stage status).

REQ052: The system must send email notification to executive when request is fully approved.

1.8 File and Document Management

REQ053: Executives must be able to upload files when creating requests and add additional files to existing requests.

REQ054: The system must support PDF file format only for uploads.

REQ055: The system must enforce maximum file size of 10MB per file.

REQ056: The system must store uploaded files in the server file system at Backend/uploads/requests/.

REQ057: The system must generate unique filenames to prevent conflicts.

REQ058: The system must store file metadata in request_files table (request_id, file_name, file_path, file_size, file_type, uploaded_by, uploaded_at).

REQ059: The system must support multiple file uploads per request.

REQ060: Authorized users must be able to download files based on role:
- Executives: Own request files only
- Human Resource Personnel: Assigned request files
- Approvers: Files for requests at their approval stage
- Admins: All files

REQ061: The system must provide endpoint to download latest approved file (Division Head file).

REQ062: The system must provide endpoint to download executive's original uploaded file.

REQ063: Executives must be able to delete files from their own unclaimed requests.

REQ064: Admins must be able to delete any file.

REQ065: The system must remove file from both file system and database upon deletion.

1.9 File Request System

REQ066: Approvers (Human Resource Personnel, Benefits Officers, Division Heads) must be able to request additional files from executives.

REQ067: The system must require request ID and message explaining what files are needed when creating file requests.

REQ068: The system must automatically set file request status to "pending" upon creation.

REQ069: The system must send email notification to the executive when file request is created.

REQ070: Executives must be able to view pending file requests for their checkup requests.

REQ071: Executives must be able to respond to file requests by uploading requested files.

REQ072: The system must update file request status to "fulfilled" upon file upload and send notification to requester.

REQ073: Executives must be able to reject file requests with rejection reason.

REQ074: The system must update file request status to "rejected" upon rejection.

1.10 Letter of Authorization and Letter of Approval Generation

REQ075: The system must allow Division Head to upload LOA files (PDF only, max 10MB) OR generate LOAs using predefined templates with executive information (name, employee ID, department, branch), request information (request number, checkup type, checkup date, hospital), and approval details (approver names, approval dates, stage completion timestamps).

REQ076: Upon final approval (HR Final Stage), the system must automatically generate the complete LOA document, store it in the database with version tracking (version number, generated by, generated at timestamp), and save the PDF file in Backend/uploads/loa/ directory.

REQ077: The system must display executive's past checkup history to all approvers during the review process, including previous request dates, hospitals visited, checkup types, approval amounts (if applicable), approval status, and total number of availments in the current year.

1.11 Hospital and Branch Management

REQ078: The system must maintain a database of accredited hospitals with name, address (city, province, region), contact number, email, accreditation status, and specializations.

REQ079: Users must be able to view list of all hospitals with filtering by city, accreditation status, and specialization.

REQ080: Users must be able to search hospitals by name or city.

REQ081: Executives must be able to create new hospital entries for non-accredited hospitals when submitting requests.

REQ082: The system must mark user-created hospitals as non-accredited by default.

REQ083: The system must maintain a database of Metrobank branches with branch code, name, address, contact number, and branch type.

1.12 Dashboard and Analytics

REQ084: The system must provide dashboard statistics based on user role:

For Executives:
- Total requests submitted
- Pending requests
- Approved requests
- Rejected requests
- Recent request history

For Human Resource Personnel:
- Total assigned requests
- Requests in progress
- Completed requests
- Pending assignments (unclaimed requests)

For Benefits Officers:
- Requests pending benefits approval
- Approved at benefits stage
- Rejected at benefits stage

For Division Heads:
- Requests pending division head approval
- Approved at division head stage
- Rejected at division head stage
- Letter generation statistics

For Admins:
- Total system requests
- Requests by status (breakdown)
- Requests by department
- Requests by branch
- User statistics
- System activity overview

REQ085: The system must calculate statistics in real-time based on current database state.

REQ086: The system must support date range filtering for dashboard statistics.

REQ087: The system must provide list of pending approvals for approvers based on their role and current approval stage.

REQ088: The system must provide user-specific action statistics (requests created, processed, approved, rejected).

REQ089: The system must provide detailed action logs for current user showing action type, target request, timestamp, description, and result.

1.13 Notification System

REQ090: The system must send email notifications for the following events:

Request Events:
- New request submitted → to Human Resource Personnel
- Request assigned → to assigned HR
- Request claimed → to executive
- Request processing started → to executive
- Request approved at stage → to executive and next approver
- Request fully approved → to executive
- Request rejected → to executive with reason

File Request Events:
- File request created → to executive
- File request fulfilled → to requester
- File request rejected → to requester

User Events:
- New user account created → to new user with credentials
- Password changed → to user
- Account activated/deactivated → to user

REQ091: The system must store notification records in notifications table with recipient, type, subject, message, request ID, send status, timestamp, and error message.

REQ092: The system must retry failed email notifications up to 3 times.

1.14 Activity Logging and Audit Trail

REQ093: The system must log all significant activities in activity_logs table with user ID, action type, description, request ID, old values (JSON), new values (JSON), IP address, and timestamp.

REQ094: The system must log the following activity types:
- USER_LOGIN, USER_LOGOUT
- CREATE_USER, UPDATE_USER, DELETE_USER, RESTORE_USER
- CREATE_REQUEST, UPDATE_REQUEST, DELETE_REQUEST
- ASSIGN_REQUEST, CLAIM_REQUEST, RELEASE_REQUEST, PROCESS_REQUEST
- APPROVE_REQUEST, REJECT_REQUEST
- UPLOAD_FILE, DELETE_FILE, DOWNLOAD_FILE
- CREATE_FILE_REQUEST, RESPOND_FILE_REQUEST
- UPDATE_PROFILE, CHANGE_PASSWORD
- UPDATE_USER_STATUS, UPDATE_USER_NOTES

REQ095: The system must provide activity log viewing for admins (all activities), users (own activities), and specific request activities.

REQ096: The system must support filtering activity logs by date range, action type, user ID, and request ID.

REQ097: The system must ensure audit logs are immutable (cannot be deleted or modified).

1.15 FAQ Management

REQ098: The system must provide a FAQ page accessible to all authenticated users.

REQ099: The system must organize FAQs into categories (Getting Started, Approval Workflow, Request Tracking, Document Requirements, Common Issues).

REQ100: The system must display FAQ content with question, answer (with formatting support), category, and display order.

REQ101: The admin must be able to create, update, delete, reorder, and activate/deactivate FAQ entries.

1.16 System Settings

REQ102: The system must maintain configurable system settings in system_settings table with setting key, value, data type, and description.

REQ103: The system must support the following system settings:
- Request processing deadline (working days)
- Maximum file upload size
- Allowed file types
- Email notification enabled/disabled
- Email sender address
- System maintenance mode

REQ104: Admins must be able to view and update all system settings.

REQ105: The system must validate setting values based on data type before saving.

1.17 User Interface Requirements

REQ106: The system must display a login page with email and password input fields, "Login" button, "Forgot Password" link, and Metrobank branding (logo, colors).

REQ107: The system must display a dashboard page upon successful login showing user-specific widgets, navigation menu, notification bell icon, and user profile dropdown in the header.

REQ108: The system must provide a request submission form with clearly labeled fields for checkup type (dropdown), checkup date (date picker), hospital selection (searchable dropdown with "Add Custom Hospital" option), reason (text area), and file upload area with drag-and-drop support.

REQ109: The system must display request status using color-coded badges (gray for pending, blue for assigned, yellow for in progress, green for approved, red for rejected).

REQ110: The system must provide a request details page showing request information card, executive details card, approval timeline visualization with progress indicators, file attachments section with download buttons, and activity history accordion.

REQ111: The system must display a requests list page with search bar, filter dropdowns (status, date range, department, branch), sortable table columns, and pagination controls at the bottom.

REQ112: The system must provide approval action buttons (Approve/Reject) at the bottom of request details page with confirmation modal dialogs that require approval notes before submission.

REQ113: The system must display file upload interface with file type indicator (PDF only), file size limit warning (10MB max), progress bar during upload, and uploaded files list with delete icons.

REQ114: The system must provide a user management page (admin only) with "Add User" button, users table with role badges, action buttons (Edit, Deactivate, Delete), and filtering controls.

REQ115: The system must display a user profile page with profile picture upload area (circular avatar), editable profile fields, "Change Password" button, and "Save Changes" button.

REQ116: The system must provide a notifications center accessible via bell icon in header, showing notification list with unread indicators, notification types (request, file request, user), timestamps, and "Mark as Read" buttons.

REQ117: The system must display dashboard statistics using card widgets with icons, numbers, and trend indicators (up/down arrows for changes).

REQ118: The system must provide a file request interface with "Request Files" button on request details page, opening a modal with message text area and "Send Request" button.

REQ119: The system must display responsive navigation menu that collapses to hamburger icon on tablet devices (768px-1024px) and shows full sidebar menu on desktop (1024px+).

REQ120: The system must provide clear error messages in red text below form fields with specific validation guidance (e.g., "Password must be at least 8 characters with uppercase, lowercase, number, and special character").

REQ121: The system must display loading spinners or skeleton screens during data fetching operations to provide visual feedback to users.

REQ122: The system must provide breadcrumb navigation at the top of pages showing current location (e.g., Dashboard > Requests > Request Details).

REQ123: The system must display confirmation dialogs for destructive actions (delete, reject) with clear warning text, "Cancel" button (gray), and "Confirm" button (red).

REQ124: The system must provide a FAQ page with collapsible accordion sections organized by category, search functionality, and smooth scroll animations.

REQ125: The system must display approval workflow visualization using a horizontal timeline with stage indicators, completion checkmarks, current stage highlighting, and approver names with timestamps.

---

2. Non-Functional Requirements

2.1 Operational Requirements

REQ126: The system will operate in any type of browser.

REQ127: The system must support modern web browsers (Google Chrome 90+, Mozilla Firefox 88+, Microsoft Edge 90+, Safari 14+).

REQ128: The system must support stable operation on Wi-Fi.

REQ129: The system must function on both desktop and tablet devices (responsive design, minimum 768px width).

REQ130: The system backend must run on Node.js version 16 or higher.

REQ131: The system must use MySQL database version 8.0 or higher.

REQ132: The system frontend must use React version 18 or higher.

REQ133: The system must support both Windows and Linux server environments.

2.2 Performance Requirements

REQ134: System actions (e.g., submitting forms, status updates) must complete within 3 seconds.

REQ135: The system must load the dashboard page within 2 seconds under normal network conditions.

REQ136: The system must support at least 100 concurrent users without performance degradation.

REQ137: The system must support the whole Human Resource department and Metrobank executives.

REQ138: The system must execute database queries with response time less than 1 second for 95% of requests.

REQ139: The system must implement database connection pooling to optimize database access.

REQ140: The system must implement pagination for all list views to limit data transfer and improve load times.

REQ141: The system must cache frequently accessed data (hospitals, branches, departments) to reduce database queries.

REQ142: File uploads must provide progress indication for files larger than 1MB.

REQ143: The system must compress response data where applicable to reduce network bandwidth.

2.3 Security Requirements

REQ144: Only authorized users can access sensitive data based on their roles.

REQ145: Passwords must be stored securely using bcrypt with salt rounds of 12 for secure authentication and authorization.

REQ146: The system must use HTTPS for all communications between client and server in production.

REQ147: The system must implement JWT-based authentication with token expiration (7 days for access tokens, 30 days for refresh tokens).

REQ148: The system must validate and sanitize all user inputs to prevent SQL injection attacks.

REQ149: The system must validate and sanitize all user inputs to prevent XSS (Cross-Site Scripting) attacks.

REQ150: The system must implement role-based access control (RBAC) for all protected endpoints.

REQ151: The system must return 401 Unauthorized for invalid or expired tokens.

REQ152: The system must return 403 Forbidden for unauthorized access attempts.

REQ153: The system must validate file types and sizes on server-side to prevent malicious uploads.

REQ154: The system must store sensitive configuration (JWT secrets, database credentials) in environment variables, not in code.

REQ155: The system must implement rate limiting to prevent brute force attacks on login endpoint.

REQ156: The system must log all authentication failures for security monitoring.

REQ157: The system must implement CORS (Cross-Origin Resource Sharing) policy to restrict API access.

REQ158: The system must not expose sensitive information in error messages to users.

REQ159: The system must implement secure session management with httpOnly and secure flags for cookies.

2.4 Cultural and Political Requirements

REQ160: The website must use English as the default language for the website interface.

REQ161: The system must comply with Philippine Data Privacy Act (DPA) of 2012.

REQ162: The website must comply with local data privacy laws, ensuring user data is securely stored and not shared without consent.

REQ163: The website's user interface must avoid using culturally inappropriate terms or symbols.

REQ164: The system must comply with Metrobank's data privacy policies.

REQ165: The system must support only Philippine-based hospitals and branches.

REQ166: The system must implement 15 working days as standard processing time for requests.

REQ167: The system must implement data retention policies compliant with company regulations.

REQ168: The system must provide audit trails for compliance purposes.

2.5 Maintainability & Scalability

REQ169: The system should support scalability for future increase in users or check-up volume.

REQ170: The system must follow RESTful API design principles for all endpoints.

REQ171: The system must implement modular architecture with separation of concerns (routes, controllers, services, models).

REQ172: The system must use environment variables for all configuration settings.

REQ173: The system must implement comprehensive logging for debugging and monitoring.

REQ174: The system must use consistent code formatting and naming conventions.

REQ175: The system must implement input validation using dedicated validator modules.

REQ176: The system must separate business logic from route handlers using controller pattern.

REQ177: The system must implement reusable middleware for common operations (authentication, file upload).

REQ178: The system must maintain database schema documentation (ERD).

REQ179: The system must use version control (Git) for all source code.

REQ180: The system must implement database indexing on frequently queried columns (user_id, request_id, status, created_at).

REQ181: The system must support horizontal scaling by maintaining stateless API design.

REQ182: The system must implement database connection pooling with configurable pool size.

REQ183: The system must support cloud deployment on platforms like Railway, Heroku, or AWS.

REQ184: The system must optimize database queries using JOINs instead of multiple sequential queries where appropriate.

2.6 Reliability Requirements

REQ185: The system must have 99% uptime availability during business hours (8 AM - 6 PM PHT, Monday-Friday).

REQ186: The system must implement database transaction management to ensure data consistency.

REQ187: The system must implement error handling for all API endpoints with appropriate HTTP status codes.

REQ188: The system must implement graceful error recovery without data loss.

REQ189: The system must perform daily automated database backups.

REQ190: The system must retain backup data for minimum 30 days.

REQ191: The system must implement database connection retry logic for transient failures.

REQ192: The system must log all errors with stack traces for debugging purposes.

REQ193: The system must validate data integrity before committing transactions.

2.7 Usability Requirements

REQ194: The system must provide clear and informative error messages for user actions.

REQ195: The system must provide confirmation dialogs for destructive actions (delete, reject).

REQ196: The system must provide visual feedback (loading indicators) for asynchronous operations.

REQ197: The system must implement intuitive navigation with clear menu structure.

REQ198: The system must use consistent UI components and styling throughout the application.

REQ199: The system must provide search and filter capabilities for all list views.

REQ200: The system must provide clear status indicators for requests (color-coded badges).

REQ201: The system must provide tooltips and help text for complex form fields.

REQ202: The system must implement form validation with real-time feedback.

REQ203: The system must support keyboard navigation for accessibility.

REQ204: The system must provide downloadable user guides and documentation.

2.8 Data Integrity Requirements

REQ205: The system must enforce foreign key constraints in the database to maintain referential integrity.

REQ206: The system must implement soft delete for critical data (users, requests) to prevent accidental data loss.

REQ207: The system must validate all input data against defined schemas before database operations.

REQ208: The system must implement database transactions for operations affecting multiple tables.

REQ209: The system must maintain timestamps (created_at, updated_at, deleted_at) for all records.

REQ210: The system must implement uniqueness constraints on key fields (email, employee_id, request_number).

REQ211: The system must validate data types and formats before accepting user input.

2.9 Monitoring and Logging Requirements

REQ212: The system must log all API requests with method, endpoint, user, timestamp, and response status.

REQ213: The system must log all errors with stack traces, user context, and timestamp.

REQ214: The system must log all security-related events (login attempts, authorization failures, suspicious activities).

REQ215: The system must provide configurable log levels (error, warn, info, debug).

REQ216: The system must implement log rotation to manage log file sizes.

REQ217: The system must provide health check endpoint for monitoring service status.

REQ218: The system must track and log performance metrics (response times, query execution times).

2.10 Documentation Requirements

REQ219: The system must maintain API documentation for all endpoints including endpoint URL and method, request parameters and body schema, response format and status codes, authentication requirements, and example requests and responses.

REQ220: The system must maintain database schema documentation (ERD) showing all tables and columns, primary and foreign keys, relationships and cardinality, and constraints and indexes.

REQ221: The system must maintain user documentation covering system overview, user roles and permissions, request submission process, approval workflow, file management, and FAQ.

REQ222: The system must maintain technical documentation covering system architecture, deployment procedures, environment configuration, and troubleshooting guides.

---

Appendices

A. Database Schema Summary

The system uses 13 normalized tables:

1. users - User accounts and profiles (21 columns)
2. checkup_requests - Main request records (26 columns)
3. hospitals - Hospital information (9 columns)
4. branches - Branch locations (10 columns)
5. departments - Department information (5 columns)
6. request_files - File attachments (11 columns)
7. activity_logs - Audit trail (11 columns)
8. notifications - Email notifications (18 columns)
9. request_approvals - Approval workflow stages (13 columns)
10. request_assignments - HR assignments (11 columns)
11. file_requests - File request tracking (8 columns)
12. faqs - FAQ content (9 columns)
13. system_settings - System configuration (5 columns)

B. Workflow Diagram

5-Stage Approval Workflow:

```
Executive Submits Request
         ↓
   [Pending Assignment]
         ↓
Human Resource Personnel Claims/Assigned
         ↓
    [Assigned to HR]
         ↓
 Human Resource Personnel Processes
         ↓
     [In Progress]
         ↓
  HR Stage Approval (Stage 1)
         ↓
  [Pending Benefits]
         ↓
Benefits Officer Approval (Stage 2)
         ↓
  [Pending Division Head]
         ↓
Division Head Approval (Stage 3)
         ↓
 [Pending HR Final]
         ↓
HR Final Approval (Stage 4)
         ↓
     [Approved]
```

Note: Rejection can occur at any stage, moving request to [Rejected] status.

C. Role-Permission Matrix

| Permission | Executive | Human Resource Personnel | Benefits Officer | Division Head | Admin |
|------------|-----------|--------------------------|------------------|---------------|-------|
| Create Request | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Own Requests | ✓ | ✓ | ✓ | ✓ | ✓ |
| View All Requests | - | ✓ | ✓ | ✓ | ✓ |
| Edit Own Request | ✓ | - | - | - | ✓ |
| Delete Own Request | ✓ | - | - | - | ✓ |
| Assign Request | - | - | ✓ | ✓ | ✓ |
| Claim Request | - | ✓ | ✓ | ✓ | ✓ |
| Release Request | - | ✓ | ✓ | ✓ | ✓ |
| Process Request | - | ✓ | ✓ | ✓ | ✓ |
| Approve HR Stage | - | ✓ | ✓ | ✓ | ✓ |
| Approve Benefits Stage | - | - | ✓ | ✓ | ✓ |
| Approve Division Head Stage | - | - | - | ✓ | ✓ |
| Generate Letter | - | - | - | ✓ | ✓ |
| Create User | - | - | - | - | ✓ |
| Update User | - | - | - | - | ✓ |
| Delete User | - | - | - | - | ✓ |
| View Activity Logs | Own | Own | Own | Own | All |
| System Settings | - | - | - | - | ✓ |

D. Status Definitions

| Status | Description | Can Be Changed By |
|--------|-------------|-------------------|
| pending_assignment | New request awaiting HR assignment | System (on creation) |
| assigned_to_hr | Request assigned to Human Resource Personnel | Admin, Benefits Officer, Division Head |
| in_progress | Human Resource Personnel actively processing | Human Resource Personnel |
| pending_benefits | Awaiting Benefits Officer approval | Human Resource Personnel (after HR stage approval) |
| pending_division_head | Awaiting Division Head approval | Benefits Officer (after benefits approval) |
| pending_hr_final | Awaiting final HR approval | Division Head (after division head approval) |
| approved | Request fully approved | Human Resource Personnel (after final stage) |
| rejected | Request rejected at any stage | Any Approver |
| cancelled | Request cancelled by executive | Executive (unclaimed only) |

---

Document Approval

Prepared By: Development Team
Reviewed By: Project Manager
Approved By: Stakeholders
Date: October 20, 2025

---

End of Requirements Documentation