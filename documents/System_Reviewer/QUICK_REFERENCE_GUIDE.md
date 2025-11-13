# MetroExecuCare - Quick Reference Guide

**Version:** 2.7 | **Last Updated:** November 2024

---

## What is MetroExecuCare?

A web-based system for managing Metrobank executive health check-up requests through a 5-stage approval workflow.

**Problem:** Paper-based processes are slow, error-prone, and hard to track.
**Solution:** Digital system with automated workflow, email notifications, and real-time tracking.

---

## Technology Stack (One-Liner)

**Frontend:** React 18 + Vite + Tailwind CSS + React Router
**Backend:** Node.js + Express + MySQL + JWT
**Deployment:** Railway (Cloud hosting)

---

## 5 User Roles

1. **Executive** - Submit requests, upload documents, track status
2. **HR Personnel** - Process requests, assign hospitals, final verification
3. **Benefits Officer** - Review and approve/reject benefits eligibility
4. **Welfare Head** - Final policy approval
5. **Admin** - User management, system configuration

---

## The 5-Stage Workflow (Simple)

```
1. Executive Submits (pending)
   ↓
2. HR Processes (hr_processing)
   ↓
3. Benefits Reviews (benefits_review)
   ↓
4. Welfare Approves (welfare_review)
   ↓
5. HR Final Verification (hr_final_verification)
   ↓
   COMPLETED ✓
```

**Rejection at any stage = Workflow ENDS**

---

## Key Features (Top 10)

1. **Multi-stage approval workflow** - 5 stages with role-based permissions
2. **Real-time status tracking** - See where your request is at any time
3. **File management** - Upload/download/delete documents
4. **Email notifications** - Automatic alerts at each stage
5. **Hospital assignment** - HR assigns accredited hospitals
6. **Role-based access control** - 72 permissions across 5 roles
7. **Activity logging** - Complete audit trail of all actions
8. **Request history** - View past requests and outcomes
9. **User management** - Admin can create/edit/delete users
10. **Document generation** - Automatic LOA/LOAuth letter creation

---

## Database Tables (10 Core Tables)

1. **users** - User accounts and profiles
2. **checkup_requests** - Main request table
3. **request_files** - Uploaded documents
4. **request_approvals** - Approval stage tracking
5. **file_requests** - Request additional files
6. **activity_logs** - Complete audit trail
7. **hospitals** - Accredited hospitals
8. **departments** - Organizational departments
9. **branches** - Office branches
10. **request_assignments** - Assignment history

---

## Request Statuses (11 Total)

1. **pending** - Waiting for HR to claim
2. **assigned_to_hr** - HR claimed (legacy)
3. **hr_processing** - HR processing documents
4. **benefits_review** - Benefits Officer reviewing
5. **welfare_review** - Welfare Head reviewing
6. **hr_final_verification** - HR final verification
7. **approved** - Approved (legacy)
8. **rejected** - Rejected (final)
9. **completed** - All stages complete
10. **cancelled** - Cancelled by user
11. **deleted** - Soft deleted

---

## Critical Files to Know

### Backend (Top 5)
1. **server.js** (329 lines) - Express app entry point
2. **requestWorkflowController.js** - Core workflow logic
3. **manual-schema.js** (418 lines) - Database schema
4. **authMiddleware.js** - JWT authentication & RBAC
5. **emailService.js** - Email notifications

### Frontend (Top 5)
1. **LOA_Submit.jsx** (5000+ lines) - Main workflow page
2. **api.js** (1021 lines) - Centralized API client
3. **App.jsx** (240 lines) - Routing configuration
4. **AuthContext.jsx** - Global authentication state
5. **ProtectedRoute.jsx** - Route protection

---

## API Endpoints (Quick List)

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register (Admin)
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/change-password` - Change password

### Requests
- `POST /api/requests` - Create request
- `GET /api/requests` - List requests
- `GET /api/requests/:id` - Get request details
- `POST /api/requests/:id/claim` - Claim (HR)
- `POST /api/requests/:id/process` - Process to next stage
- `POST /api/requests/:id/approve` - Approve
- `POST /api/requests/:id/reject` - Reject
- `POST /api/requests/:id/upload-file` - Upload file
- `GET /api/requests/:id/files/:fileId/download` - Download

### Users (Admin)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Hospitals
- `GET /api/hospitals` - List hospitals
- `POST /api/hospitals` - Create hospital (Admin)

---

## Security Features (7 Layers)

1. **JWT Authentication** - Token-based auth (24hr expiry)
2. **Password Hashing** - bcrypt with 10 salt rounds
3. **Role-Based Access Control** - 72 permissions
4. **Input Validation** - Frontend + Backend validation
5. **SQL Injection Prevention** - Parameterized queries
6. **Rate Limiting** - 1000 req/5min (API), 5 req/15min (login)
7. **HTTP Security Headers** - Helmet.js (XSS, clickjacking, etc.)

---

## Workflow Details (Stage-by-Stage)

### Stage 1: Executive Submission
- **Status:** pending
- **Who:** Executive
- **Actions:** Fill form, select hospital, upload docs, submit
- **Next:** Email sent to HR

### Stage 2: HR Processing
- **Status:** hr_processing
- **Who:** HR Personnel
- **Actions:** Claim, review docs, assign hospital, upload docs, process to Benefits
- **Next:** Email sent to Benefits

### Stage 3: Benefits Review
- **Status:** benefits_review
- **Who:** Benefits Officer
- **Actions:** Review eligibility, upload docs, approve OR reject
- **Next:** If approved → Welfare; If rejected → ENDS

### Stage 4: Welfare Review
- **Status:** welfare_review
- **Who:** Welfare Head
- **Actions:** Final policy check, upload docs, approve OR reject
- **Next:** If approved → HR Final; If rejected → ENDS

### Stage 5: HR Final Verification
- **Status:** hr_final_verification → completed
- **Who:** HR Personnel (same from Stage 2)
- **Actions:** Review all docs, delete/add files, generate letters, complete
- **Next:** Email with all docs sent to Executive

---

## File Management

**Allowed File Types:** PDF, DOC, DOCX, JPG, PNG
**Max File Size:** 10MB
**File Categories:**
- supporting_document
- letter_of_approval
- letter_of_authorization
- additional_document

**Upload Permissions:**
- Executive: Own requests (any stage)
- HR: Assigned requests (hr_processing, hr_final_verification)
- Benefits: Assigned requests (benefits_review)
- Welfare: Assigned requests (welfare_review)
- Admin: All requests

**Delete Permissions:**
- Own uploaded files
- HR in final verification (can delete any file)

---

## Email Notifications

**When Sent:**
1. Executive submits → Email to HR
2. HR processes → Email to Benefits
3. Benefits approves → Email to Welfare
4. Welfare approves → Email to HR
5. HR completes → Email to Executive (with all docs)
6. Any rejection → Email to all stakeholders

**Email Provider:**
- Production: Resend API
- Development: Gmail SMTP (fallback)

---

## Common Defense Questions & Answers

**Q: What problem does this solve?**
A: Digitizes paper-based health check-up approval process, reducing time, errors, and improving transparency.

**Q: How many stages in the workflow?**
A: 5 stages: Executive Submit → HR Process → Benefits Review → Welfare Review → HR Final Verification

**Q: What happens if Benefits rejects?**
A: Workflow ends immediately. Request status changes to "rejected". All stakeholders notified via email.

**Q: Can executives edit requests after submission?**
A: Only if status is "pending" (not yet claimed by HR). Once HR claims, editing/deleting is blocked.

**Q: How is security implemented?**
A: 7 layers - JWT auth, bcrypt passwords, RBAC with 72 permissions, input validation, SQL injection prevention, rate limiting, and HTTP security headers.

**Q: How many API endpoints?**
A: 40+ endpoints covering authentication, requests, users, hospitals, departments, branches, and FAQs.

**Q: What database is used?**
A: MySQL 8.0 with 10 core tables, connection pooling, and transaction support.

**Q: How are files stored?**
A: Locally in Backend/uploads/ folder. Metadata stored in request_files table. Cloud storage (S3) recommended for production scale.

**Q: What happens in HR Final Verification?**
A: HR reviews ALL documents from ALL stages, has full file management (add/delete), generates official letters (LOA/LOAuth), and completes the request. All documents sent to Executive via email.

**Q: How do you handle concurrent requests?**
A: Database transactions ensure data consistency. Connection pooling (10 connections) handles concurrent requests. Rate limiting prevents abuse.

---

## Project Statistics

**Lines of Code:**
- Backend: ~2,500 lines (core logic)
- Frontend: ~8,000+ lines (including LOA_Submit: 5000 lines)
- Total: ~10,500+ lines

**Components:**
- Frontend: 39 components (14 pages + 25 reusable)
- Backend: 10 controllers
- API Endpoints: 40+

**Database:**
- Tables: 10 core + 2 optional
- Relationships: 15+ foreign keys
- Indexes: 8 performance indexes

**Features:**
- User Roles: 5
- Permissions: 72
- Workflow Stages: 5
- Request Statuses: 11
- File Types Supported: 5

---

## Deployment Info

**Platform:** Railway (https://railway.app)

**Services:**
1. Backend (Node.js on port 5000)
2. MySQL Database (Railway-provided)
3. Frontend (Static hosting)

**URLs:**
- Backend: `https://metroexecucare-backend.up.railway.app`
- Frontend: `https://metroexecucare.up.railway.app`

**Deployment Process:**
1. Push to GitHub
2. Railway auto-detects changes
3. Builds and deploys
4. Zero-downtime deployment

---

## Key Environment Variables

### Backend
```bash
NODE_ENV=production
PORT=5000
DB_HOST=<railway-db-host>
DB_USER=root
DB_PASSWORD=<auto-generated>
DB_NAME=railway
JWT_SECRET=<strong-secret>
RESEND_API_KEY=<resend-key>
FRONTEND_URL=<frontend-url>
```

### Frontend
```bash
VITE_API_BASE_URL=<backend-url>/api
```

---

## Testing Checklist (Quick)

**Authentication:**
- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Token expires after 24 hours

**Workflow:**
- [ ] Executive can submit request
- [ ] HR can claim and process
- [ ] Benefits can approve/reject
- [ ] Welfare can approve/reject
- [ ] HR can complete verification
- [ ] Emails sent at each stage

**Security:**
- [ ] Unauthorized access blocked
- [ ] Role permissions enforced
- [ ] SQL injection prevented
- [ ] Rate limiting works

---

## Folder Structure (Quick View)

```
MetroExecuCare/
├── Backend/
│   ├── config/          # Database, email, permissions
│   ├── controllers/     # Business logic (10 files)
│   ├── middleware/      # Auth, file upload
│   ├── routes/          # API routes (7 files)
│   ├── services/        # Email service
│   ├── validators/      # Input validation
│   ├── uploads/         # File storage
│   └── server.js        # Entry point
│
├── Frontend/
│   └── src/
│       ├── webpages/           # 14 page components
│       ├── Components/         # 15 reusable components
│       ├── AdminUserPageComponents/ # 10 admin components
│       ├── contexts/           # AuthContext
│       ├── services/           # api.js (1021 lines)
│       ├── App.jsx            # Routing (240 lines)
│       └── main.jsx           # Entry point
│
└── documents/          # Documentation files
```

---

## Tech Stack Details (for deep dive questions)

**Frontend:**
- React 18.3.1 (hooks, context)
- React Router v6.26 (client-side routing)
- Vite 5.3 (build tool)
- Tailwind CSS 4.0 (styling)
- PDF-lib (PDF manipulation)
- react-signature-canvas (digital signatures)

**Backend:**
- Node.js 18+ (runtime)
- Express.js 4.19 (web framework)
- MySQL 8.0 (database)
- mysql2 (database driver with promises)
- jsonwebtoken (JWT)
- bcryptjs (password hashing)
- Multer (file uploads)
- Resend API (emails)
- Helmet (security headers)
- express-validator (input validation)

**Tools:**
- Git (version control)
- Railway (deployment)
- npm workspaces (monorepo)
- Jest (testing)
- ESLint (linting)

---

## Defense Presentation Tips

### Opening (30 seconds)
"MetroExecuCare is a full-stack healthcare management system that digitizes Metrobank's executive health check-up approval process. Built with React, Node.js, and MySQL, it implements a 5-stage approval workflow with role-based access control, automated email notifications, and complete audit trails."

### System Demo Flow (5 minutes)
1. Show landing page and login
2. Executive: Create request, upload documents
3. HR: Claim request, assign hospital, process
4. Benefits: Review and approve
5. Welfare: Review and approve
6. HR: Final verification and completion
7. Show email notifications
8. Show admin user management

### Technical Highlights (2 minutes)
- "5-stage workflow with automatic routing"
- "72 granular permissions across 5 roles"
- "40+ RESTful API endpoints"
- "10 database tables with proper relationships"
- "JWT authentication with bcrypt password hashing"
- "Complete audit trail with activity logging"
- "Cloud deployment on Railway platform"

### Challenges Overcome (1 minute)
- "Complex workflow state management across 5 stages"
- "Role-based permissions with file management rules"
- "Email reliability (switched from Gmail to Resend API)"
- "Database design for audit trails and historical data"

### Architecture Overview (1 minute)
- "React SPA communicates with Express REST API"
- "JWT tokens for authentication"
- "MySQL for data persistence with connection pooling"
- "MVC pattern on backend for clean separation"
- "React Context API for global auth state"

---

## Common Mistakes to Avoid

1. **Don't say:** "This is a simple CRUD app"
   **Say:** "This is a complex workflow management system with 5-stage approval process"

2. **Don't say:** "We just store files in a folder"
   **Say:** "We implement secure file management with metadata tracking, access control, and audit trails"

3. **Don't say:** "Anyone can access the API"
   **Say:** "All API endpoints are protected with JWT authentication and role-based authorization"

4. **Don't say:** "The workflow is automatic"
   **Say:** "The workflow requires explicit approval at each stage with email notifications"

5. **Don't say:** "We use React and Node"
   **Say:** "We use React 18 with hooks and context for the frontend, Express.js with MVC pattern for the backend, and MySQL for data persistence"

---

## Quick Demo Script

**1. Login (30 sec)**
- Show login page
- Enter credentials
- Redirect to role-specific dashboard

**2. Executive Flow (1 min)**
- Click "Submit Request"
- Fill form (request type, hospital, date, purpose)
- Upload documents
- Submit
- Show success message + request tracker

**3. HR Flow (1.5 min)**
- Login as HR
- View pending requests
- Claim request
- Assign hospital
- Upload HR documents
- Process to Benefits

**4. Benefits/Welfare Flow (1 min)**
- Login as Benefits
- Review request and documents
- Add comments
- Approve (moves to Welfare)
- Login as Welfare
- Approve (moves back to HR)

**5. HR Final Flow (1 min)**
- Login as HR (same person)
- Review all documents
- Delete/add files if needed
- Generate LOA letter
- Complete request
- Show completion email

**6. Admin Panel (30 sec)**
- Login as Admin
- Show user management
- Show request statistics
- Show activity logs

---

## One-Liner Explanations (for quick questions)

**What is MetroExecuCare?**
"A web-based health check-up approval workflow system for Metrobank executives."

**What technologies?**
"React frontend, Node.js/Express backend, MySQL database, deployed on Railway."

**How many stages?**
"5 stages: Submit → HR → Benefits → Welfare → HR Final → Complete."

**What's special about it?**
"Automated workflow with role-based permissions, email notifications, and complete audit trails."

**How is it secured?**
"JWT authentication, bcrypt passwords, RBAC with 72 permissions, input validation, and rate limiting."

**What's the hardest part?**
"Managing complex workflow state transitions across 5 stages with role-based file permissions."

**Can you scale it?**
"Yes - connection pooling, rate limiting, modular architecture, and cloud deployment support scaling."

**What's next?**
"Real-time notifications with WebSockets, mobile app, and integration with existing HR systems."

---

## Final Checklist Before Defense

- [ ] System is deployed and accessible
- [ ] Test accounts created for all 5 roles
- [ ] Database seeded with sample data
- [ ] All team members know their roles/sections
- [ ] Demo script practiced (under 10 minutes)
- [ ] Backup slides prepared (architecture diagrams)
- [ ] Known bugs/limitations documented
- [ ] Future enhancements prepared
- [ ] All documentation printed/ready
- [ ] Confidence level: HIGH ✓

---

**Good luck with your defense! 🚀**

---

**Quick Access:**
- Reviewer Doc: `documents/CAPSTONE_REVIEWER_DOCUMENTATION.md`
- This Guide: `documents/QUICK_REFERENCE_GUIDE.md`
- Backend Entry: `Backend/server.js`
- Frontend Entry: `Frontend/src/main.jsx`
- Main Workflow: `Frontend/src/webpages/LOA_Submit.jsx`
- Database Schema: `Backend/config/database/manual-schema.js`