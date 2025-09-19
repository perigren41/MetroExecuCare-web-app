# MetroExecuCare: Web-Based Annual Executive Check Up Benefit System

## Purpose and Description

The MetroExecuCare: Web-Based Annual Executive Check Up Benefit System is designed to improve the management of employee benefits by making the process faster, more accessible, and more organized. It serves as a convenient platform where employee executives can easily check their benefits, submit requests, and track their status without having to go through lengthy and complicated manual procedures.

The system aims to address common challenges such as:
- Lack of accessible tracking information
- Lengthy approval process for hospital check-ups
- Time delays with succeeding signatories

By automating these procedures, MetroExecuCare reduces the administrative burden on Human Resource (HR), minimizes delays, and ensures a smoother and more efficient experience.

This project is intended to modernize the way Annual Executive Check-up Benefits are managed, improving efficiency in handling benefits requests, reducing approval times and ensuring that executives receive timely access to their healthcare check-ups. The system's streamlined workflow helps manage and control waiting times, ensuring that requests are processed in 15 working days or less.

## Objectives

### Main Objective
To enhance efficiency, transparency, and accuracy at Metrobank in managing Annual Executive Check-Up Benefits, while improving the overall employee experience and reducing the workload for Human Resource personnel.

### Specific Objectives

1. **System Development**: Design and develop MetroExecuCare with regards to requests, processing, and approval workflows, focusing on the application process for executives' check-ups and special requests, ensuring automated updates across all involved personnel.

2. **Transparency and Accessibility**: Improve transparency and accessibility for employees by providing a self-service portal where they can independently schedule checkups, request special medical checkups, and access real-time updates on their benefits.

3. **Feature Optimization**: Optimize features such as a comprehensive FAQs page to address common questions and implement a notification system that ensures executives and all relevant personnel receive timely updates on the status and progress of their check-up requests.

## Scope and Limitations

### Scope

The Web-Based Annual Executive Check Up Benefit System enables:

- **Employee Self-Service**: Metrobank employees can apply for their Annual Executive Check-up benefits through the system
- **Special Requests**: Submit special requests for medical tests or hospital preferences not on the accredited hospital list
- **Real-time Tracking**: Check and monitor the status of check-up requests with real-time updates
- **Automated Notifications**: Email notifications to executives and all subsequent personnel when documents are submitted
- **Workflow Management**: HR personnel, Benefits Officer, and Employee Welfare Division Head can review, verify, approve, and reject executive requests efficiently

### Key Features

- Request submission and tracking system
- Multi-stage approval workflow
- Email notification system
- File upload and document management
- Hospital management and assignment
- User role-based access control
- Comprehensive audit logging
- FAQ management system

## User Roles & Permissions

### 1. Executive (Basic User)
**Permissions:**
- ✅ Submit checkup requests (Letter of Approval and Letter of Authorization)
- ✅ Upload supporting documents
- ✅ View own request status and history
- ✅ Download own letters
- ✅ Access FAQ section
- ✅ Edit profile information (profile picture and password only)
- ✅ Receive email notifications on request status updates

**Restrictions:**
- ❌ Cannot view other executives' requests
- ❌ Cannot access admin functions

### 2. HR Personnel (Request Handler)
**Permissions:**
- ✅ View unassigned request queue
- ✅ Claim/assign requests to themselves
- ✅ Process requests through HR stage
- ✅ View assigned requests only
- ✅ Generate and upload letters after final approval
- ✅ Send letters to executives via email
- ✅ View basic analytics for assigned requests
- ✅ Receive email notifications on new requests

**Restrictions:**
- ❌ Cannot approve beyond HR stage
- ❌ Cannot view other HR personnel's assigned requests
- ❌ Cannot access system settings

### 3. Benefits Officer (Mid-Level Approver)
**Permissions:**
- ✅ View requests in benefits review stage
- ✅ Approve/reject requests at benefits stage
- ✅ Add comments and conditions
- ✅ View all requests in their approval queue
- ✅ Receive email notifications on requests needing their action

**Restrictions:**
- ❌ Cannot assign requests to HR
- ❌ Cannot generate letters
- ❌ Cannot access system settings

### 4. Employee Welfare Division Head (Senior Approver)
**Permissions:**
- ✅ View requests in welfare review stage
- ✅ Final approval/rejection authority
- ✅ Override previous decisions if needed
- ✅ View all requests across all stages
- ✅ View system performance metrics
- ✅ Receive email notifications on requests needing their action

**Restrictions:**
- ❌ Cannot assign requests to HR
- ❌ Cannot generate letters
- ❌ Limited system settings access

### 5. System Admin (Full System Control)
**Permissions:**
- ✅ Full system access
- ✅ User management (create, update, deactivate accounts)
- ✅ Hospital management
- ✅ System settings configuration
- ✅ FAQ management
- ✅ System analytics and logs
- ✅ Database maintenance functions

## Development Action Plan

### Step 1: Database Implementation (Week 1)
1. **Database Setup**
   - Install and configure MySQL
   - Create database schema from ERD
   - Set up database connection in Node.js using mysql2

2. **Table Creation**
   - Implement all 10 tables from schema
   - Set up foreign key constraints
   - Create indexes for performance optimization
   - Seed initial data (hospitals, system settings, FAQs)

### Step 2: Authentication System (Week 1-2)
1. **JWT Authentication Setup**
   - Implement user registration/login endpoints
   - Create JWT token generation and validation middleware
   - Set up password hashing with bcrypt
   - Implement role-based access control (RBAC) middleware

2. **User Management APIs**
   - Create user CRUD operations
   - Implement user profile management
   - Set up session management

### Step 3: Core API Development (Week 2-3)
1. **Request Management APIs**
   - Create checkup request submission endpoint
   - Implement request status tracking
   - Build approval workflow endpoints
   - Create request handling

2. **Hospital Management APIs**
   - Hospital listing functionality
   - Hospital assignment logic for HR

3. **File Management APIs**
   - File upload endpoints for supporting documents
   - File download with access control
   - Letter generation system

### Step 4: Gmail API Integration (Week 3-4)
1. **Email Service Setup**
   - Configure Gmail API credentials
   - Create email templates for different notification types
   - Implement notification system for all workflow stages
   - Set up email scheduling and retry logic

### Step 5: Advanced Features (Week 4-5)
1. **Activity Logging System**
   - Implement comprehensive audit trail
   - Track all user actions and system changes

2. **Reporting and Analytics**
   - Create dashboard endpoints for different user roles
   - Implement request statistics and timeline tracking

### Step 6: API Testing and Documentation (Week 5)
1. **Testing Implementation**
   - Unit tests for all API endpoints
   - Integration tests for workflow processes
   - Authentication and authorization tests

2. **API Documentation**
   - Create comprehensive API documentation
   - Set up Postman collection for testing

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Email Service**: Gmail API
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting

### Database Schema
- **users**: Employee information and authentication
- **hospitals**: Healthcare facilities management
- **checkup_requests**: Main request tracking
- **request_files**: Document management
- **request_assignments**: HR task assignments
- **request_approvals**: Multi-stage approval workflow
- **notifications**: Email notification logging
- **system_settings**: Configuration management
- **faqs**: Help documentation
- **activity_logs**: Audit trail

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - System health check
- `GET /api/db-test` - Database connection test
- `GET /api/db-verify` - Database verification

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/profile/picture` - Upload profile picture
- `DELETE /api/users/profile/picture` - Delete profile picture

### Request Management
- `POST /api/requests` - Submit new request
- `GET /api/requests` - Get requests (role-based)
- `GET /api/requests/:id` - Get specific request
- `PUT /api/requests/:id` - Update request
- `PUT /api/requests/:id/status` - Update request status

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Gmail API credentials

### Environment Variables
Create a `.env` file in the Backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=metroexecucare

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Gmail API Configuration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
```

### Installation Steps
1. Clone the repository
2. Navigate to the Backend directory
3. Install dependencies: `npm install`
4. Configure environment variables
5. Set up MySQL database
6. Run database migrations/schema setup
7. Start the server: `npm start` or `npm run dev`

## Contributing

1. Follow the established code structure and conventions
2. Ensure all new features have appropriate tests
3. Update documentation for any API changes
4. Follow security best practices
5. Use proper error handling and logging
