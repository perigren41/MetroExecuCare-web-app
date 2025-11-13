# MetroExecuCare System - Comprehensive Reviewer Documentation

**Version:** 2.7
**Project Type:** Healthcare Management System
**Organization:** Metrobank Executive Check-up Management
**Documentation Date:** November 2024

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Design](#database-design)
6. [Core Workflow Process](#core-workflow-process)
7. [Security Implementation](#security-implementation)
8. [API Documentation](#api-documentation)
9. [Frontend Architecture](#frontend-architecture)
10. [Backend Architecture](#backend-architecture)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Executive Summary

### Project Purpose
MetroExecuCare is a comprehensive web-based application designed to streamline the executive health check-up request and approval process for Metrobank. The system manages the complete lifecycle of health check-up requests from initial submission by executives through a multi-stage approval workflow, culminating in the generation and delivery of official approval letters.

### Problem Statement
Traditional paper-based executive health check-up request processes are:
- Time-consuming and inefficient
- Prone to document loss and tracking issues
- Lack transparency in approval status
- Difficult to audit and maintain compliance
- Create communication bottlenecks between departments

### Solution
A full-stack web application that:
- Digitizes the entire request and approval workflow
- Provides real-time status tracking
- Automates email notifications at each stage
- Maintains complete audit trails
- Enforces role-based access control
- Generates official documents automatically

### Key Stakeholders & Roles

1. **Executive Employees** - Submit health check-up requests
2. **HR Personnel** - Process requests, assign hospitals, final verification
3. **Benefits Officers** - Review and approve benefits eligibility
4. **Welfare Head** - Final policy approval
5. **System Administrators** - User management and system configuration

---

## System Overview

### Core Features

#### 1. Request Management
- Create Letter of Approval (LOA) requests
- Create Letter of Authorization (LOAuth) requests
- Edit/Delete requests (before HR processing)
- Real-time status tracking
- Request history and analytics

#### 2. Multi-Stage Approval Workflow
- 5-stage approval process with role-based permissions
- Automatic routing between departments
- Email notifications at each transition
- Approval/Rejection with comments
- Audit trail for all actions

#### 3. Document Management
- Multi-file upload support (PDF, DOC, DOCX, images)
- File categorization by type and stage
- Secure file storage and retrieval
- File request system (approvers can request additional documents)
- Automatic letter generation

#### 4. Hospital Management
- Maintain accredited hospital database
- Hospital assignment by HR
- Search and filter capabilities

#### 5. User Management
- Role-based access control (5 distinct roles)
- User profile management
- Department and branch assignment
- Soft delete with restoration capability
- Activity logging

#### 6. Communication System
- Automated email notifications
- Workflow-triggered alerts
- File request notifications
- Status update notifications

#### 7. Analytics & Reporting
- Dashboard statistics
- Request metrics by status
- User activity logs
- Performance tracking

---

## Technology Stack

### Frontend Technologies

**Core Framework:**
- **React 18.3.1** - Modern UI library with hooks and context
- **React Router v6.26** - Client-side routing and navigation
- **Vite 5.3** - Fast build tool and development server

**Styling & UI:**
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Lucide React** - Icon library
- **clsx & tailwind-merge** - Conditional class name management

**State Management:**
- **React Context API** - Global authentication state
- **React Hooks** - Local component state (useState, useEffect, useRef)

**Specialized Libraries:**
- **PDF-lib** - PDF generation and manipulation
- **pdfjs-dist** - PDF rendering and preview
- **react-signature-canvas** - Digital signature capture
- **date-fns** - Date formatting and manipulation

**Development Tools:**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Backend Technologies

**Core Framework:**
- **Node.js 18+** - JavaScript runtime
- **Express.js 4.19** - Web application framework

**Database:**
- **MySQL 8.0** - Relational database
- **mysql2** - MySQL driver with promise support
- Connection pooling for performance

**Authentication & Security:**
- **jsonwebtoken** - JWT token generation and verification
- **bcryptjs** - Password hashing (10 rounds)
- **Helmet** - HTTP security headers
- **CORS** - Cross-Origin Resource Sharing
- **express-rate-limit** - API rate limiting
- **express-validator** - Input validation and sanitization

**File Management:**
- **Multer** - Multipart form data handling
- **Archiver** - ZIP file creation

**Email Services:**
- **Resend API** - Production email service (primary)
- **Nodemailer** - Development email service (fallback)

**Utilities:**
- **dotenv** - Environment variable management
- **morgan** - HTTP request logging
- **axios** - HTTP client for external APIs
- **uuid** - Unique identifier generation

**Development & Testing:**
- **nodemon** - Auto-restart on file changes
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

### Infrastructure & Deployment

**Hosting:**
- **Railway** - Cloud platform for deployment
- Automatic deployments from Git
- Environment variable management
- MySQL database provisioning

**Version Control:**
- **Git** - Source code management
- Structured commit history
- Branch-based development

**Development Environment:**
- **npm workspaces** - Monorepo management
- **concurrently** - Run multiple scripts simultaneously
- Environment-specific configurations

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  (React SPA running in browser - Port 3000)                 │
│                                                              │
│  Components: Landing, Login, Dashboards, Forms, Modals      │
│  State: AuthContext, Component State                        │
│  Routing: React Router (Protected Routes)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/REST API
                       │ (JSON payload with JWT token)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                     API GATEWAY LAYER                        │
│            (Express.js Server - Port 5000)                   │
│                                                              │
│  Middleware: CORS, Helmet, Rate Limit, Body Parser          │
│  Auth: JWT Verification, Role-Based Access Control          │
│  Routing: /api/auth, /api/requests, /api/users, etc.       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─────────────┬──────────────┬──────────┐
                       │             │              │          │
┌──────────────────────▼─┐  ┌───────▼────┐  ┌──────▼─────┐  ┌▼────────┐
│   BUSINESS LOGIC       │  │   FILE      │  │   EMAIL     │  │  AUTH   │
│   (Controllers)        │  │  STORAGE    │  │  SERVICE    │  │ SERVICE │
│                        │  │             │  │             │  │         │
│ - Request Workflow     │  │  Multer     │  │  Resend     │  │   JWT   │
│ - Approval Process     │  │  Local FS   │  │  Nodemailer │  │ bcrypt  │
│ - User Management      │  │             │  │             │  │         │
│ - Hospital Management  │  │             │  │             │  │         │
└────────────┬───────────┘  └─────────────┘  └─────────────┘  └─────────┘
             │
             │ SQL Queries (Parameterized)
             │
┌────────────▼──────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                      │
│                   (MySQL Database 8.0)                         │
│                                                                │
│  Tables: users, checkup_requests, request_files,              │
│          request_approvals, activity_logs, hospitals, etc.    │
│                                                                │
│  Features: Connection Pool (10), Transactions, Foreign Keys   │
└────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Interaction**
   - User interacts with React components
   - Forms collect and validate input
   - API service prepares request

2. **API Request**
   - HTTP request sent to Express server
   - JWT token included in Authorization header
   - Request routed to appropriate endpoint

3. **Authentication & Authorization**
   - JWT token verified
   - User data loaded from database
   - Role-based permissions checked

4. **Business Logic**
   - Controller processes request
   - Validation performed
   - Database queries executed
   - Business rules enforced

5. **Response**
   - Data formatted as JSON
   - Appropriate HTTP status code
   - Response sent to client

6. **Side Effects**
   - Email notifications sent (async)
   - Activity logs created
   - File operations performed

---

## Database Design

### Entity Relationship Overview

The database consists of 10 core tables organized around the central `checkup_requests` table.

### Database Tables Summary

#### 1. **users** - User Accounts
- Stores all user profiles and authentication data
- 5 role types: executive, hr_personnel, benefits_officer, welfare_head, admin
- Password hashed with bcrypt
- Soft delete support (is_active flag)

#### 2. **checkup_requests** - Main Request Table
- Central table for all health check-up requests
- 2 request types: letter_of_approval, letter_of_authorization
- Tracks workflow status through 11 possible states
- Links to employee, hospitals, and assigned personnel

#### 3. **request_files** - Document Storage
- Metadata for uploaded files
- 4 file categories: supporting_document, letter_of_approval, letter_of_authorization, additional_document
- Tracks uploader, download count, and access control

#### 4. **request_approvals** - Approval Tracking
- Tracks each stage of the approval workflow
- 4 approval stages: hr_stage, benefits_stage, welfare_stage, hr_final_stage
- Records approver, action, and comments

#### 5. **file_requests** - Additional Document Requests
- Allows approvers to request more files from executives
- Tracks status: pending, fulfilled, cancelled

#### 6. **activity_logs** - Audit Trail
- Complete system activity logging
- Tracks user actions, timestamps, and related entities
- Immutable records for compliance

#### 7. **hospitals** - Accredited Hospitals
- Master data for hospital information
- Accreditation and active status flags

#### 8. **departments** - Organizational Departments
- Department master data
- Links to users table

#### 9. **branches** - Office Branches
- Branch/location master data
- Links to users table

#### 10. **request_assignments** - Assignment History
- Historical record of request assignments
- Tracks who assigned, when, and why released

### Key Database Relationships

```
users (1) ──────< (M) checkup_requests [employee_id]
users (1) ──────< (M) checkup_requests [assigned_hr_id]
users (1) ──────< (M) checkup_requests [assigned_benefits_id]
users (1) ──────< (M) checkup_requests [assigned_welfare_id]

hospitals (1) ──< (M) checkup_requests [hospital_id]
hospitals (1) ──< (M) checkup_requests [hr_assigned_hospital_id]

departments (1) ─< (M) users [department_id]
branches (1) ────< (M) users [branch_id]

checkup_requests (1) ──< (M) request_files [request_id]
checkup_requests (1) ──< (M) request_approvals [request_id]
checkup_requests (1) ──< (M) file_requests [request_id]
checkup_requests (1) ──< (M) request_assignments [request_id]

users (1) ──────< (M) activity_logs [user_id]
users (1) ──────< (M) request_files [uploaded_by]
```

---

## Core Workflow Process

### The 5-Stage Approval Workflow

```
Executive Submits Request (pending)
    ↓
HR Initial Processing (hr_processing)
    ↓
Benefits Review (benefits_review)
    ↓
Welfare Review (welfare_review)
    ↓
HR Final Verification (hr_final_verification)
    ↓
Completed (completed)
```

### Stage 1: Executive Submission

**Status:** `pending`
**Role:** Executive Employee

**Actions:**
1. Fill out request form (LOA or LOAuth)
2. Select preferred hospital
3. Choose preferred check-up date
4. Provide letter purpose/reason
5. Upload supporting documents
6. Submit request

**System Response:**
- Generate unique request number (REQ-YYYYMMDD-XXXX)
- Create request record with status `pending`
- Create approval records for all stages
- Send email notification to all HR Personnel
- Log activity

**Permissions:**
- Executive can edit request (only if status is `pending`)
- Executive can delete request (only if status is `pending`)
- Once HR claims, executive can no longer edit/delete

---

### Stage 2: HR Initial Processing

**Status:** `hr_processing`
**Role:** HR Personnel

**Actions:**
1. View pending requests queue
2. Claim request (assigns to self)
3. Review executive's documents
4. Optionally assign accredited hospital
5. Upload HR documents
6. Request additional files if needed
7. Process to Benefits (moves to next stage)

**System Response:**
- Update `assigned_hr_id` to current HR user
- Change status to `hr_processing`
- Update hospital assignment if provided
- Send email to Benefits Officers when processed
- Create approval record for benefits stage
- Log all actions

**Business Rules:**
- Only one HR can be assigned per request
- HR can release request back to pool
- Cannot skip to completion without going through Benefits and Welfare
- Minimum 1 document should be uploaded

---

### Stage 3: Benefits Review

**Status:** `benefits_review`
**Role:** Benefits Officer

**Actions:**
1. Review request and all documents
2. Verify benefits eligibility
3. Check employee entitlements
4. Upload benefits documentation
5. **Decision:** Approve or Reject

**Approval Path:**
- Add optional comments
- Click Approve
- Request moves to Welfare Review

**Rejection Path:**
- Provide rejection reason (required)
- Click Reject
- Request status changes to `rejected`
- Workflow ENDS

**System Response (Approval):**
- Update approval record to `approved`
- Change status to `welfare_review`
- Send email to Welfare Head
- Log approval

**System Response (Rejection):**
- Update approval record to `rejected`
- Change request status to `rejected`
- Send email to Executive, HR, and Benefits Officer
- Log rejection with reason
- Workflow terminates

**Business Rules:**
- Benefits approval is REQUIRED
- Rejection is FINAL (cannot be undone)
- Rejection reason is mandatory

---

### Stage 4: Welfare Review

**Status:** `welfare_review`
**Role:** Welfare Head

**Actions:**
1. Review all previous stages' documents
2. Conduct final policy compliance check
3. Verify budget allocation
4. Upload welfare documentation
5. **Decision:** Approve or Reject

**Approval Path:**
- Add optional comments
- Click Approve
- Request moves to HR Final Verification

**Rejection Path:**
- Provide detailed rejection reason
- Click Reject
- Request status changes to `rejected`
- Workflow ENDS

**System Response (Approval):**
- Update approval record to `approved`
- Change status to `hr_final_verification`
- Send email to original HR Personnel
- Log approval

**System Response (Rejection):**
- Update approval record to `rejected`
- Change request status to `rejected`
- Send email to all stakeholders
- Log rejection
- Workflow terminates

**Business Rules:**
- Welfare is the final executive approval
- Rejection requires detailed justification
- All stages must be completed before this stage

---

### Stage 5: HR Final Verification

**Status:** `hr_final_verification` → `completed`
**Role:** HR Personnel (same person from Stage 2)

**Actions:**
1. Review ALL documents from ALL stages
2. Verify completeness and accuracy
3. **Full file management permissions:**
   - Upload additional documents
   - Delete incorrect/outdated files
   - Organize final document package
4. Generate official letters (LOA or LOAuth)
5. Add digital signatures if required
6. Click "Complete Request"

**System Response:**
- Validate all required documents present
- Change status to `completed`
- Mark completion timestamp
- Package all documents
- Send comprehensive email to Executive with:
  - All documents as attachments/links
  - Generated letters
  - Approval summary
- Send notification to all approvers (for record)
- Log completion

**Business Rules:**
- Only originally assigned HR can complete
- Must have generated letter (LOA or LOAuth)
- All approval stages must be approved
- Completion is IRREVERSIBLE
- All files are locked after completion

---

### Workflow Edge Cases

#### File Request System
- Any approver can request additional files from Executive
- Executive receives email notification
- Executive uploads requested files
- Approver notified when files uploaded
- Workflow continues

#### Request Release
- HR can release request back to pool
- Provide release reason
- Request becomes available for other HR
- Original HR activity logged

#### Request Edit/Delete (Executive)
- **Edit:** Only if status is `pending`
- **Delete:** Only if status is `pending`
- Once HR claims, editing/deleting blocked

---

## Security Implementation

### 1. Authentication (JWT)

**Token Generation:**
```javascript
const token = jwt.sign(
  {
    id: user.id,
    employee_id: user.employee_id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Token Verification:**
- Every protected route validates JWT
- Token extracted from Authorization header
- Fresh user data loaded from database
- Expired tokens rejected (401)

### 2. Password Security

**Hashing:**
- bcryptjs with 10 salt rounds
- Passwords never stored in plain text
- One-way encryption (cannot be reversed)

**Password Requirements:**
- Minimum 8 characters
- Must include uppercase, lowercase, number, special character

### 3. Role-Based Access Control (RBAC)

**5 Role Hierarchy:**
```
Admin (Level 5) - Full access
  ↓
Welfare Head (Level 4) - Welfare approval + view
  ↓
Benefits Officer (Level 3) - Benefits approval + view
  ↓
HR Personnel (Level 2) - HR processing + view
  ↓
Executive (Level 1) - Create and view own requests
```

**Permission Categories:**
- Request permissions (create, view, edit, delete, approve, reject)
- File permissions (upload, download, delete)
- User permissions (create, view, edit, delete users)
- Hospital/Department/Branch management
- Admin functions

### 4. Input Validation

**Frontend Validation:**
- Real-time form validation
- Required field checks
- Format validation
- File type and size validation

**Backend Validation:**
- express-validator for all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- Type checking and constraints

### 5. HTTP Security

**Helmet.js Headers:**
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options (prevent clickjacking)
- X-Content-Type-Options (prevent MIME sniffing)
- X-XSS-Protection

**CORS Configuration:**
- Whitelist of allowed origins
- Credentials support
- Specific methods and headers allowed

**Rate Limiting:**
- General API: 1000 requests per 5 minutes
- Authentication: 5 attempts per 15 minutes

### 6. File Upload Security

**Restrictions:**
- Maximum file size: 10MB
- Allowed types: PDF, DOC, DOCX, JPG, PNG
- MIME type verification
- Unique filename generation
- Path traversal prevention

### 7. Audit Trail

**All actions logged:**
- User authentication (login, logout)
- Request CRUD operations
- Approval/rejection actions
- File uploads/downloads/deletions
- User management actions
- System configuration changes

**Log includes:**
- User ID
- Action type
- Action description
- Related entity (request, file, user)
- IP address
- Timestamp

---

## API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://metroexecucare-backend.up.railway.app/api
```

### Authentication Endpoints

**POST /api/auth/login**
- Authenticate user
- Returns JWT token and user profile

**POST /api/auth/register**
- Create new user (Admin only)
- Returns user details

**GET /api/auth/profile**
- Get current user profile
- Requires authentication

**PUT /api/auth/profile**
- Update current user profile

**PUT /api/auth/change-password**
- Change user password

### Request Endpoints

**POST /api/requests**
- Create new request (Executive)
- Requires: request_type, hospital_id, preferred_date, letter_purpose

**GET /api/requests**
- List requests (role-filtered)
- Query params: status, request_type, page, limit, search

**GET /api/requests/:id**
- Get detailed request information
- Includes: request data, files, approvals, assignments

**PUT /api/requests/:id/edit**
- Edit request (Executive, before HR claim)

**DELETE /api/requests/:id**
- Delete request (Executive, before HR claim)

**POST /api/requests/:id/claim**
- Claim request (HR)

**POST /api/requests/:id/process**
- Process to next stage (HR → Benefits)

**POST /api/requests/:id/approve**
- Approve at current stage (Benefits/Welfare)

**POST /api/requests/:id/reject**
- Reject request (Benefits/Welfare)

**POST /api/requests/:id/upload-file**
- Upload file(s) to request
- Content-Type: multipart/form-data

**GET /api/requests/:id/files/:fileId/download**
- Download file

**DELETE /api/requests/:id/files/:fileId**
- Delete file

**POST /api/requests/file-requests**
- Request additional files from executive

**GET /api/requests/dashboard**
- Get dashboard statistics

### User Management Endpoints

**GET /api/users**
- List all users (Admin)

**GET /api/users/:id**
- Get user details

**PUT /api/users/:id**
- Update user (Admin)

**PUT /api/users/:id/status**
- Activate/deactivate user (Admin)

**DELETE /api/users/:id**
- Soft delete user (Admin)

**PUT /api/users/:id/restore**
- Restore deleted user (Admin)

### Hospital Endpoints

**GET /api/hospitals**
- List all hospitals

**POST /api/hospitals**
- Create hospital (Admin)

**PUT /api/hospitals/:id**
- Update hospital (Admin)

**DELETE /api/hospitals/:id**
- Delete hospital (Admin)

### Department & Branch Endpoints

**GET /api/departments**
- List departments

**POST /api/departments**
- Create department (Admin)

**GET /api/branches**
- List branches

**POST /api/branches**
- Create branch (Admin)

### FAQ Endpoints

**GET /api/faqs**
- List FAQs

**POST /api/faqs**
- Create FAQ (Admin)

**PUT /api/faqs/:id**
- Update FAQ (Admin)

**DELETE /api/faqs/:id**
- Delete FAQ (Admin)

---

## Frontend Architecture

### Folder Structure

```
Frontend/src/
├── webpages/              # Page components (14 pages)
├── Components/            # Reusable components (15)
├── AdminUserPageComponents/ # Admin components (10)
├── ExecutiveEmployeeProfileComponents/
├── contexts/              # React Context (AuthContext)
├── services/              # API service (api.js)
├── lib/                   # Utilities
├── assets/                # Static assets (70+ SVGs)
├── App.jsx               # Main routing
└── main.jsx              # Entry point
```

### Key Components

**1. App.jsx**
- React Router configuration
- Protected route definitions
- Role-based route guards

**2. AuthContext.jsx**
- Global authentication state
- Login/logout functions
- Token management
- User profile storage

**3. ProtectedRoute.jsx**
- Route protection HOC
- Authentication check
- Role-based access control
- Redirects unauthorized users

**4. LOA_Submit.jsx (5000+ lines)**
- **Most critical frontend file**
- Handles entire workflow for all roles
- File management (upload/download/delete)
- Approval/rejection actions
- Status-specific UI rendering
- PDF editing and preview
- Hospital assignment
- Real-time updates

**5. api.js (1021 lines)**
- Centralized API client
- All API endpoints as methods
- Token injection
- Error handling
- Request/response formatting

### State Management

**Global State (AuthContext):**
- User authentication status
- User profile data
- Login/logout functions

**Component State (useState):**
- Local UI state
- Form data
- Loading states
- Error messages
- Modal visibility

### Routing Structure

```
/ - Landing Page (public)
/login - Login Page (public)
/about - About Page (public)
/faq - FAQ Page (public)

/executive - Executive Dashboard (protected)
/executive/submit-loa - Submit LOA (protected)
/executive/submit-loauth - Submit LOAuth (protected)
/executive/status - Status Tracker (protected)
/executive/history - Request History (protected)

/hr/dashboard - HR Dashboard (protected)
/hr/pending - Pending Requests (protected)
/hr/requests/:id - Process Request (protected)
/hr/history - History (protected)

/admin - Admin Dashboard (protected)
/admin/users - User Management (protected)
```

---

## Backend Architecture

### Folder Structure

```
Backend/
├── config/
│   ├── database/
│   │   ├── connection.js      # MySQL connection pool
│   │   ├── manual-schema.js   # Database schema
│   │   └── init.js            # DB initialization
│   ├── emailProvider.js       # Email service config
│   └── rolePermissions.js     # RBAC configuration
│
├── controllers/               # Business logic
│   ├── authController.js
│   ├── requestWorkflowController.js
│   ├── requestController.js
│   ├── userController.js
│   ├── hospitalController.js
│   └── ...
│
├── middleware/
│   ├── authMiddleware.js      # JWT & RBAC
│   └── uploadMiddleware.js    # Multer config
│
├── routes/                    # API routes
│   ├── authRoutes.js
│   ├── requestRoutes.js
│   ├── userRoutes.js
│   └── ...
│
├── services/
│   └── emailService.js        # Email sending
│
├── validators/               # Input validation
│   ├── authValidators.js
│   ├── requestValidators.js
│   └── userValidators.js
│
├── templates/               # Document templates
│   ├── documents/           # Letter templates
│   └── email/              # Email templates
│
├── utils/
│   └── activityLogger.js
│
├── uploads/                # File storage
│
└── server.js              # Entry point
```

### MVC Pattern

```
Request → Router → Middleware → Controller → Service → Database
                      ↓              ↓          ↓
                   Auth Check    Business    Data
                   Validation     Logic      Access
```

### Key Backend Files

**server.js**
- Express application setup
- Middleware configuration
- Route mounting
- Database connection
- Error handling

**requestWorkflowController.js**
- Core workflow logic
- Stage transitions
- Approval/rejection
- Email notifications
- Activity logging

**emailService.js**
- Email template generation
- Email sending (Resend API)
- Notification system

**authMiddleware.js**
- JWT verification
- Role-based authorization
- Permission checking

---

## Deployment & Infrastructure

### Railway Platform

**Services:**
1. **Backend Service**
   - Node.js application
   - Port 5000
   - Auto-deploy on git push

2. **MySQL Database**
   - Railway-provided MySQL 8.0
   - Automatic backups
   - Connection pooling

3. **Frontend Service**
   - Static file hosting
   - Vite build output

### Environment Variables

**Backend:**
```bash
NODE_ENV=production
PORT=5000
DB_HOST=<railway-host>
DB_USER=root
DB_PASSWORD=<auto-generated>
DB_NAME=railway
JWT_SECRET=<secret>
RESEND_API_KEY=<api-key>
FRONTEND_URL=<frontend-url>
```

**Frontend:**
```bash
VITE_API_BASE_URL=<backend-url>/api
```

### Deployment Process

1. Push code to GitHub
2. Railway detects changes
3. Builds application
4. Runs tests (if configured)
5. Deploys new version
6. Zero-downtime deployment

### Health Checks

**GET /api/health**
- Server status
- Uptime
- Database connection
- Environment info

**GET /api/db-test**
- Database connectivity test

---

## Testing & Quality Assurance

### Testing Strategy

**1. Unit Testing**
- Test individual functions
- Mock dependencies
- Test business logic

**2. Integration Testing**
- Test API endpoints
- Test database operations
- Test workflow stages

**3. Manual Testing**
- Complete workflow testing
- Role-based testing
- Security testing
- UI/UX testing

### Test Coverage Areas

**Authentication:**
- Login/logout
- Token generation
- Token validation
- Password hashing
- Role verification

**Request Workflow:**
- Request creation
- File upload
- Approval process
- Stage transitions
- Email notifications
- Activity logging

**User Management:**
- CRUD operations
- Role assignment
- Permission verification

**Security:**
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting
- Input validation

---

## System Statistics

**Frontend:**
- 14 page components
- 25+ reusable components
- 1,021 lines in API service
- 5,000+ lines in main workflow component
- 70+ SVG assets

**Backend:**
- 10 controllers
- 7 route files
- 40+ API endpoints
- 10 database tables
- 72 permissions across 5 roles

**Database:**
- 10 core tables
- 15+ foreign key relationships
- Indexed columns for performance
- Transaction support

**Security:**
- JWT authentication
- bcrypt password hashing
- RBAC with 72 permissions
- Input validation on all endpoints
- Complete audit trail

---

## Conclusion

MetroExecuCare is a production-ready, full-stack healthcare management system that successfully digitizes and streamlines the executive health check-up approval process. The system demonstrates:

**Technical Excellence:**
- Modern technology stack
- Clean architecture
- Robust security
- Scalable design

**Business Value:**
- Streamlined workflow
- Real-time tracking
- Automated notifications
- Complete audit trail

**Capstone Quality:**
- Complex problem solving
- Full-stack proficiency
- Production deployment
- Best practices implementation

---

**End of Reviewer Documentation**