# MetroExecuCare System v1.3

**Enterprise Healthcare Management System for Executive Check-up Requests**

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Version](https://img.shields.io/badge/version-1.3-blue.svg)]()
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

---

## 📋 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Recent Updates](#recent-updates)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributors](#contributors)

---

## 🎯 About

MetroExecuCare is a comprehensive healthcare management system designed for Metrobank to streamline the executive check-up request and approval process. The system manages the complete workflow from request submission to final approval, involving multiple stakeholders including Executives, HR Personnel, Benefits Officers, and Welfare Heads.

### Key Capabilities
- **Executive Self-Service** - Submit and track check-up requests
- **Multi-Stage Approval** - HR → Benefits → Welfare → Final HR clearance
- **Request Management** - View, edit, delete unclaimed requests
- **File Request System** - Approvers can request additional files from executives
- **Email Notifications** - Automated notifications for all workflow events
- **Document Management** - Upload and manage medical documents
- **Real-time Tracking** - Track request status through visual progress indicators

---

## ✨ Features

### For Executives
- ✅ Submit Letter of Approval/Authorization requests
- ✅ Upload multiple medical documents (PDF)
- ✅ Track request status in real-time
- ✅ View full request details in modal
- ✅ Respond to file requests from approvers
- ✅ Edit/delete unclaimed requests
- ✅ Prevent duplicate submissions (one active request limit)
- ✅ Download final approval letters

### For HR Personnel
- ✅ Claim and process pending requests
- ✅ Assign requests to specific HR staff
- ✅ Process requests and forward to Benefits
- ✅ Perform final document verification
- ✅ Request additional files from executives
- ✅ Upload supporting documents
- ✅ View activity logs and statistics

### For Benefits Officers
- ✅ Review and approve/reject requests
- ✅ Request additional documentation
- ✅ Upload benefit-related files
- ✅ Track pending approvals
- ✅ View request history

### For Welfare Heads
- ✅ Final welfare review and approval
- ✅ Request additional files if needed
- ✅ Upload welfare clearance documents
- ✅ Dashboard with pending approvals
- ✅ Activity tracking

### System Features
- ✅ Role-based access control
- ✅ Multi-stage approval workflow
- ✅ Email notifications (Gmail integration)
- ✅ Document upload/download
- ✅ Request activity logging
- ✅ Dashboard analytics
- ✅ Mobile-responsive design
- ✅ Secure authentication (JWT)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router v6
- **HTTP Client:** Fetch API
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MySQL 8.0
- **Authentication:** JWT (jsonwebtoken)
- **Email:** Nodemailer with Gmail
- **File Upload:** Multer
- **Security:** bcrypt, cors, helmet

### Database
- **DBMS:** MySQL
- **Tables:** 8 main tables
  - users
  - checkup_requests
  - request_files
  - file_requests (NEW in v1.3)
  - request_approvals
  - notifications
  - activity_logs
  - hospitals

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.0.0
MySQL >= 8.0
Git
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/MetroExecuCare.git
cd MetroExecuCare
```

2. **Setup Backend**
```bash
cd Backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# DB_HOST, DB_USER, DB_PASSWORD, JWT_SECRET, GMAIL credentials
```

3. **Setup Database**
```bash
# Create database
mysql -u root -p
CREATE DATABASE metroexecucare_db;
exit;

# Import schema
mysql -u root -p metroexecucare_db < database/schema.sql

# Run migrations (if any)
mysql -u root -p metroexecucare_db < config/database/migrations/add_file_request_system.sql
```

4. **Setup Frontend**
```bash
cd ../Frontend
npm install

# Create .env file
cp .env.example .env

# Edit .env
VITE_API_BASE_URL=http://localhost:5000/api
```

5. **Run the Application**

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

### Default Login Credentials
```
HR Personnel:
Email: jannahmaeperigren@gmail.com
Password: (set during user creation)

Executive:
Email: sample15@gmail.com
Password: (set during user creation)

Benefits Officer:
Email: debbieperigren@gmail.com
Password: (set during user creation)

Welfare Head:
Email: perigrenj09@gmail.com
Password: (set during user creation)
```

---

## 📁 Project Structure

```
MetroExecuCare/
├── Backend/
│   ├── config/
│   │   ├── database/
│   │   │   ├── connection.js
│   │   │   └── migrations/
│   │   │       └── add_file_request_system.sql
│   │   └── gmail.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── requestController.js
│   │   ├── requestWorkflowController.js
│   │   ├── requestManagementController.js (NEW)
│   │   └── fileRequestController.js (NEW)
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── requestRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── templates/
│   │   └── email/
│   │       └── emailTemplates.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   └── requestValidators.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBarMain.jsx
│   │   │   ├── ViewRequestDetailsModal.jsx (NEW)
│   │   │   └── FileRequestModal.jsx (NEW)
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── webpages/
│   │   │   ├── NewLoginPage.jsx
│   │   │   ├── ExecutiveEmployeeDashboard.jsx
│   │   │   ├── ExecutiveEmployeeSubmitLOApproval.jsx
│   │   │   ├── ExecutiveEmployeeSubmitLOAuthorization.jsx
│   │   │   ├── LoaStatusTracker.jsx
│   │   │   ├── HRDashboard.jsx
│   │   │   ├── HR_PendingRequestsPage.jsx
│   │   │   ├── LOA_Submit.jsx
│   │   │   └── [other pages...]
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── documents/
    ├── REQUEST_MANAGEMENT_ENHANCEMENT.md
    ├── DEPLOYMENT_GUIDE.md
    └── README.md (this file)
```

---

## 🆕 Recent Updates (v1.3)

### Request Management Enhancement
**Released:** January 2025

#### New Features
1. **Duplicate Submission Prevention**
   - Executives limited to one active request at a time
   - Modal notification when attempting duplicate submission
   - Option to view existing request or return to dashboard

2. **Request Management for Executives**
   - View full request details in modal
   - Edit requests (only if unclaimed by HR)
   - Delete requests (only if unclaimed)
   - See editability status clearly

3. **File Request Workflow**
   - Approvers can request additional files from executives
   - Email notifications sent automatically
   - Executives upload files directly through modal
   - Track pending file requests

4. **Enhanced LOA Status Tracker**
   - "View Full Details" button in Details card
   - Comprehensive modal showing all request information
   - Pending file requests highlighted
   - File upload functionality integrated

5. **Approver Enhancements**
   - "Request Files" button on approval page
   - Simple modal to describe needed files
   - Automatic email to executive
   - Available at any approval stage

#### Technical Improvements
- 7 new API endpoints
- 2 new email templates
- 3 new React components
- Enhanced database schema
- Improved error handling

#### Database Changes
- Added `file_requests` table
- Added timestamp fields for assignment tracking
- Added `submission_type` to `request_files`
- Added `file_request_id` foreign key

See [REQUEST_MANAGEMENT_ENHANCEMENT.md](./documents/REQUEST_MANAGEMENT_ENHANCEMENT.md) for detailed documentation.

---

## 🌐 Deployment

### Quick Deployment (Railway + Vercel)

**Step 1: Deploy Backend to Railway**
```bash
# Push code to GitHub first
git push origin main

# Then:
# 1. Go to railway.app
# 2. Deploy from GitHub
# 3. Add MySQL database
# 4. Configure environment variables
```

**Step 2: Deploy Frontend to Vercel**
```bash
# 1. Go to vercel.com
# 2. Import from GitHub
# 3. Set root directory to "Frontend"
# 4. Add VITE_API_BASE_URL environment variable
# 5. Deploy
```

**Total Time:** ~30 minutes

See [DEPLOYMENT_GUIDE.md](./documents/DEPLOYMENT_GUIDE.md) for complete deployment instructions.

### Hosting Options
- **Development:** Railway + Vercel (Free/$5-10/month)
- **Production:** DigitalOcean ($12-25/month) or AWS ($20-50/month)
- **Budget:** VPS Hosting ($5-12/month)

---

## 📚 Documentation

- **[REQUEST_MANAGEMENT_ENHANCEMENT.md](./documents/REQUEST_MANAGEMENT_ENHANCEMENT.md)** - v1.3 feature documentation
- **[DEPLOYMENT_GUIDE.md](./documents/DEPLOYMENT_GUIDE.md)** - Hosting and deployment guide
- **[DATABASE_SETUP.md](./documents/DATABASE_SETUP.md)** - Database schema and setup
- **API Documentation** - Available at `/api/docs` (Swagger) *(coming soon)*

---

## 🔒 Security

- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- SQL injection prevention via parameterized queries
- CORS configuration for frontend-backend communication
- File upload restrictions (PDF only, size limits)
- Role-based access control (RBAC)
- Request ownership verification
- XSS protection with React's built-in sanitization

### Security Checklist for Production
- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up rate limiting
- [ ] Configure firewall rules
- [ ] Regular database backups
- [ ] Keep dependencies updated
- [ ] Set up monitoring and alerts

---

## 🧪 Testing

### Manual Testing
```bash
# Test Backend API
curl http://localhost:5000/api/health

# Test Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Automated Testing (Coming Soon)
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Cypress

---

## 📊 System Requirements

### Development
- **OS:** Windows 10/11, macOS, Linux
- **RAM:** 8GB minimum, 16GB recommended
- **Storage:** 2GB free space
- **Browser:** Chrome, Firefox, Safari, Edge (latest versions)

### Production
- **Server:** 2GB RAM minimum, 4GB recommended
- **Database:** MySQL 8.0+ with 5GB storage
- **Bandwidth:** Depends on user count (1GB/month for ~100 users)

---

## 🤝 Contributors

### Development Team
- **Backend Developer:** [Your Name]
- **Frontend Developer:** [Your Name]
- **Database Designer:** [Your Name]
- **UI/UX Designer:** [Your Name]

### Acknowledgments
- Metrobank for project requirements
- Healthcare management best practices
- Open-source community

---

## 📝 License

This project is proprietary software developed for Metrobank.
Unauthorized copying, modification, or distribution is prohibited.

© 2025 Metrobank. All rights reserved.

---

## 📞 Support

### For Technical Issues
- Check [Troubleshooting Guide](./documents/DEPLOYMENT_GUIDE.md#troubleshooting-common-issues)
- Review error logs in `Backend/logs/`
- Check browser console for frontend errors

### For Feature Requests
- Document the feature request
- Include use case and mockups if applicable
- Submit through proper channels

---

## 🗺️ Roadmap

### Version 1.4 (Planned)
- [ ] Request analytics dashboard
- [ ] Bulk file upload
- [ ] File request templates for approvers
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Request history/audit trail
- [ ] Automated reminders

### Version 2.0 (Future)
- [ ] Multi-language support
- [ ] Integration with hospital systems
- [ ] AI-powered document verification
- [ ] Video consultation scheduling
- [ ] Telemedicine integration

---

## 🎓 Learning Resources

### For New Developers
- **React:** https://react.dev/learn
- **Express.js:** https://expressjs.com/
- **MySQL:** https://dev.mysql.com/doc/
- **JWT:** https://jwt.io/introduction

### Project-Specific
- Watch the video walkthrough (coming soon)
- Read the code comments
- Review the API documentation
- Check the user flow diagrams

---

**Version:** 1.3.0
**Last Updated:** January 2025
**Status:** ✅ Production Ready

**Happy Coding! 🚀**
