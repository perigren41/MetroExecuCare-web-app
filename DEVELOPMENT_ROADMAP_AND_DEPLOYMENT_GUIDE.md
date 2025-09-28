# MetroExecuCare Development Roadmap & Local Deployment Guide

## 📋 Table of Contents
1. [Current System Status](#current-system-status)
2. [Development Roadmap](#development-roadmap)
3. [**NEW: Unified Dashboard Architecture**](#unified-dashboard-architecture)
4. [Local Deployment Guide](#local-deployment-guide)
5. [Database Setup](#database-setup)
6. [Server Configuration](#server-configuration)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Current System Status

### ✅ **COMPLETED COMPONENTS**

#### **Backend (100% Complete)**
- ✅ **Authentication System**: Login/logout, JWT tokens, role-based access
- ✅ **User Management**: CRUD operations, profile management, status tracking
- ✅ **Request Workflow Engine**: Complete LOA processing pipeline
- ✅ **Email Notification System**: Automated notifications for all workflow stages
- ✅ **File Upload System**: Profile pictures, request documents
- ✅ **Database Schema**: All tables and relationships implemented
- ✅ **API Endpoints**: Full RESTful API with proper validation
- ✅ **Role System**: Admin, Executive, HR Personnel, Benefits Officer, Welfare Head

#### **Frontend (60% Complete)**
- ✅ **Admin Interface**: User management, dashboard, profile management
- ✅ **Executive Interface**: Dashboard, LOA submission, status tracking, profile
- ✅ **Authentication Flow**: Login, logout, protected routes
- ✅ **UI Components**: Reusable components, consistent styling
- ✅ **State Management**: Auth context, API service integration

### ❌ **MISSING COMPONENTS**

#### **Critical Gaps**
1. **HR Personnel Dashboard** - Backend ready, no frontend
2. **Benefits Officer Dashboard** - Backend ready, no frontend
3. **Welfare Head Dashboard** - Backend ready, no frontend
4. **Request Processing UI** - No approve/reject interfaces
5. **Workflow Management Interface** - No claim/assign request UI
6. **Executive Login Fix** - Credentials need reset

---

## 🚀 Development Roadmap

### **PHASE 1: IMMEDIATE PRIORITIES (1-2 Days)**
*Before pulling HR branch from GitHub*

#### **Priority 1: Fix Executive Authentication**
```bash
# Create proper executive test user
POST /api/auth/register
{
  "employee_id": "EXE001",
  "email": "executive@metrobank.com",
  "password": "ExecutivePass123!",
  "first_name": "John",
  "last_name": "Executive",
  "role": "executive",
  "department": "Executive Department",
  "position": "Senior Executive",
  "branch": "Metrobank BGC",
  "contact_number": "+639123456789"
}
```

#### **Priority 2: Create Unified Workflow Dashboard**
```
⚠️  ARCHITECTURE DECISION: Use unified approach instead of separate dashboards
❌ OLD APPROACH: 3 separate dashboard files
✅ NEW APPROACH: 1 unified WorkflowDashboard.jsx

Files to create:
📁 Frontend/src/webpages/
  ├── WorkflowDashboard.jsx         (Unified dashboard for HR/Benefits/Welfare)
  ├── RequestProcessor.jsx          (Unified request approval interface)
  └── WorkflowHistory.jsx           (Request history viewer)
```

**See [Unified Dashboard Architecture](#unified-dashboard-architecture) section for details**

#### **Priority 3: Request Processing Components**
```
Files to create:
📁 Frontend/src/components/RequestProcessing/
  ├── RequestClaimModal.jsx     (Claim pending requests)
  ├── RequestApprovalModal.jsx  (Approve requests)
  ├── RequestRejectionModal.jsx (Reject requests)
  ├── WorkflowStageViewer.jsx   (Show workflow progress)
  └── RequestAssignModal.jsx    (Assign to users)
```

### **PHASE 2: INTEGRATION (2-3 Days)**
*During/after HR pull*

#### **Backend Integration**
- Connect new components to existing API endpoints:
  - `GET /api/requests/dashboard` - Dashboard stats
  - `POST /api/requests/:id/claim` - Claim requests
  - `POST /api/requests/:id/approve` - Approve requests
  - `POST /api/requests/:id/reject` - Reject requests
  - `POST /api/requests/:id/assign` - Assign requests

#### **Navigation & Routing**
- Update `App.jsx` with HR role routes
- Enhance `ProtectedRoute.jsx` for new roles
- Add navigation items for HR functions

### **PHASE 3: TESTING & POLISH (1-2 Days)**

#### **End-to-End Testing**
- Complete workflow testing (Executive → HR → Benefits → Welfare)
- Email notification verification
- User management testing
- File upload functionality

#### **UI/UX Improvements**
- Consistent styling across all dashboards
- Responsive design optimization
- Loading states and error handling
- User feedback and notifications

---

## 🏗️ Unified Dashboard Architecture

> **⚡ ARCHITECTURAL RECOMMENDATION**: Instead of creating 3 separate dashboards for HR Personnel, Benefits Officer, and Welfare Head, use a **unified approach** for 90% code reduction and better maintainability.

### **📊 Role Analysis Results**

After analyzing backend permissions (`Backend/config/rolePermissions.js`) and workflow controller (`Backend/controllers/requestWorkflowController.js`):

#### **Similarities Between Roles (90% Overlap):**
- **Dashboard Layout**: Same grid structure, stats cards, request lists
- **Request Processing**: All roles approve/reject requests (different stages)
- **Profile Management**: Identical profile interfaces
- **File Management**: Same document viewing/downloading
- **Notifications**: Similar notification systems

#### **Key Differences (10% Unique):**
| Feature | HR Personnel | Benefits Officer | Welfare Head |
|---------|-------------|------------------|--------------|
| **Main Action** | Claim & Process requests | Review & Approve | Final Approval |
| **Request Scope** | Assigned requests only | All pending reviews | All system requests |
| **Special Permissions** | Hospital assignment, Letter generation | Enhanced file access, System logs | User management, FAQ management |
| **Dashboard Stats** | Assigned/Processing | Benefits queue | Overall system metrics |
| **Color Theme** | Blue (#3F6EC0) | Indigo (#00539F) | Purple (#5D3EA4) |

### **🎯 Recommended File Structure**

```
📁 Frontend/src/
  ├── webpages/
  │   ├── WorkflowDashboard.jsx           ✅ (Replaces 3 separate dashboards)
  │   ├── RequestProcessor.jsx            ✅ (Unified request approval/rejection)
  │   ├── WorkflowHistory.jsx             ✅ (Request history viewer)
  │   └── ProfilePage.jsx                 ✅ (Already exists, role-agnostic)
  │
  ├── components/WorkflowComponents/      📁 (New folder for workflow UI)
  │   ├── RoleBasedHeader.jsx             ✅ (Dynamic headers per role)
  │   ├── RequestCard.jsx                 ✅ (Smart request cards)
  │   ├── ActionButtonGroup.jsx           ✅ (Role-specific action buttons)
  │   ├── StatsCardGrid.jsx               ✅ (Role-based dashboard stats)
  │   ├── RequestApprovalModal.jsx        ✅ (Unified approval modal)
  │   ├── RequestRejectionModal.jsx       ✅ (Unified rejection modal)
  │   ├── RequestClaimModal.jsx           ✅ (HR-specific claiming)
  │   ├── HospitalAssignmentPanel.jsx     ✅ (HR-only feature)
  │   ├── UserManagementSection.jsx       ✅ (Welfare Head-only)
  │   └── WorkflowProgressViewer.jsx      ✅ (Request status tracking)
  │
  ├── hooks/
  │   ├── useRoleBasedData.js             ✅ (Role-specific API calls)
  │   ├── useWorkflowPermissions.js       ✅ (Permission checking)
  │   └── useRequestActions.js            ✅ (Claim/approve/reject logic)
  │
  └── contexts/
      └── WorkflowContext.jsx             ✅ (Shared workflow state)
```

### **💡 Implementation Strategy**

#### **1. Role-Based Configuration Object**
```jsx
// WorkflowDashboard.jsx
const ROLE_CONFIGS = {
  hr_personnel: {
    title: "HR Personnel Dashboard",
    icon: "👥",
    primaryColor: "#3F6EC0",
    accentColor: "#E8F2FF",
    actions: ["claim", "process", "assign_hospital", "generate_letter"],
    requestScope: "assigned",
    statsEndpoint: "/api/requests/dashboard?role=hr_personnel",
    permissions: ["REQUEST_CLAIM", "REQUEST_PROCESS", "HOSPITAL_ASSIGN"]
  },
  benefits_officer: {
    title: "Benefits Officer Dashboard",
    icon: "💰",
    primaryColor: "#00539F",
    accentColor: "#E6F3FF",
    actions: ["approve", "reject", "view_all_files"],
    requestScope: "pending_benefits",
    statsEndpoint: "/api/requests/dashboard?role=benefits_officer",
    permissions: ["REQUEST_APPROVE_BENEFITS", "FILE_DOWNLOAD_ALL"]
  },
  welfare_head: {
    title: "Welfare Head Dashboard",
    icon: "⚖️",
    primaryColor: "#5D3EA4",
    accentColor: "#F0EBFF",
    actions: ["final_approve", "reject", "manage_users", "view_reports"],
    requestScope: "all",
    statsEndpoint: "/api/requests/dashboard?role=welfare_head",
    permissions: ["REQUEST_APPROVE_WELFARE", "USER_MANAGE_ALL", "SYSTEM_REPORTS_VIEW"]
  }
};
```

#### **2. Smart Component Architecture**
```jsx
// WorkflowDashboard.jsx
export default function WorkflowDashboard() {
  const { user } = useAuth();
  const config = ROLE_CONFIGS[user.role];
  const { stats, requests, loading } = useRoleBasedData(user.role);

  return (
    <div style={{ '--primary-color': config.primaryColor }}>
      {/* Dynamic header based on role */}
      <RoleBasedHeader config={config} user={user} />

      {/* Stats cards with role-specific data */}
      <StatsCardGrid stats={stats} role={user.role} />

      {/* Request list filtered by role scope */}
      <RequestList
        requests={requests}
        scope={config.requestScope}
        actions={config.actions}
      />

      {/* Role-specific feature panels */}
      {user.role === 'hr_personnel' && <HospitalAssignmentPanel />}
      {user.role === 'welfare_head' && <UserManagementSection />}
    </div>
  );
}
```

#### **3. Feature Toggle Pattern**
```jsx
// ActionButtonGroup.jsx
export default function ActionButtonGroup({ request, userRole, onAction }) {
  const config = ROLE_CONFIGS[userRole];

  return (
    <div className="action-buttons">
      {config.actions.includes('claim') && (
        <Button onClick={() => onAction('claim', request.id)}>
          Claim Request
        </Button>
      )}
      {config.actions.includes('approve') && (
        <Button onClick={() => onAction('approve', request.id)}>
          Approve
        </Button>
      )}
      {config.actions.includes('final_approve') && (
        <Button onClick={() => onAction('final_approve', request.id)}>
          Final Approval
        </Button>
      )}
    </div>
  );
}
```

### **🎨 Role-Based Theming**
```jsx
// RoleBasedHeader.jsx
export default function RoleBasedHeader({ config, user }) {
  return (
    <header
      className="dashboard-header"
      style={{
        backgroundColor: config.primaryColor,
        '--accent-color': config.accentColor
      }}
    >
      <div className="header-content">
        <span className="role-icon">{config.icon}</span>
        <h1>{config.title}</h1>
        <div className="user-info">
          <span>{user.first_name} {user.last_name}</span>
          <span className="role-badge" style={{ backgroundColor: config.accentColor }}>
            {user.role.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
```

### **🔌 API Integration Strategy**
```jsx
// hooks/useRoleBasedData.js
export function useRoleBasedData(userRole) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const config = ROLE_CONFIGS[userRole];

    // Fetch role-specific dashboard stats
    const fetchStats = apiService.get(config.statsEndpoint);

    // Fetch role-specific requests
    const fetchRequests = apiService.getRequests({
      scope: config.requestScope,
      role: userRole
    });

    Promise.all([fetchStats, fetchRequests])
      .then(([statsRes, requestsRes]) => {
        setData({
          stats: statsRes.data,
          requests: requestsRes.data
        });
      })
      .finally(() => setLoading(false));
  }, [userRole]);

  return { ...data, loading };
}
```

### **🚀 Development Benefits**

#### **Advantages:**
- ✅ **90% Code Reduction**: 1 component instead of 3
- ✅ **Consistent UX**: Same behavior patterns across roles
- ✅ **Faster Development**: Focus on role logic, not UI duplication
- ✅ **Easier Maintenance**: Single source of truth for workflow UI
- ✅ **Better Testing**: Test once, covers all role scenarios
- ✅ **Scalable**: Easy to add new roles (just add config object)

#### **Implementation Time:**
- **Unified Approach**: ~8 hours (1 day)
- **Separate Dashboards**: ~24 hours (3 days)
- **Time Saved**: 66% development time reduction

#### **Maintenance Benefits:**
- Bug fixes apply to all roles automatically
- UI improvements benefit entire workflow system
- Easier to maintain consistent styling and behavior
- Simpler testing strategy

### **📋 Updated Implementation Checklist**

#### **Phase 1: Core Unified Components (4 hours)**
- [ ] Create `WorkflowDashboard.jsx` with role-based configs
- [ ] Build `RoleBasedHeader.jsx` for dynamic headers
- [ ] Implement `useRoleBasedData.js` hook
- [ ] Create `ActionButtonGroup.jsx` with feature toggles

#### **Phase 2: Request Processing (3 hours)**
- [ ] Build `RequestProcessor.jsx` for unified approval/rejection
- [ ] Create `RequestApprovalModal.jsx` and `RequestRejectionModal.jsx`
- [ ] Implement `RequestClaimModal.jsx` for HR-specific claiming
- [ ] Add `WorkflowProgressViewer.jsx` for status tracking

#### **Phase 3: Role-Specific Features (1 hour)**
- [ ] Add `HospitalAssignmentPanel.jsx` (HR only)
- [ ] Create `UserManagementSection.jsx` (Welfare Head only)
- [ ] Implement role-based theming and styling

#### **Phase 4: Integration & Testing (2 hours)**
- [ ] Update `App.jsx` routing for unified workflow
- [ ] Test all three roles with real backend data
- [ ] Verify permission-based feature visibility
- [ ] End-to-end workflow testing

### **🔗 Backend Integration Points**

The unified frontend will connect to existing backend endpoints:
```bash
# Dashboard stats (role-specific)
GET /api/requests/dashboard

# Request operations (permission-based)
POST /api/requests/:id/claim      # HR Personnel only
POST /api/requests/:id/approve    # All workflow roles
POST /api/requests/:id/reject     # All workflow roles
POST /api/requests/:id/assign     # HR Personnel only

# Request retrieval (scope-based)
GET /api/requests?status=hr_processing      # HR Personnel
GET /api/requests?status=benefits_review    # Benefits Officer
GET /api/requests?status=welfare_review     # Welfare Head
```

---

## 💻 Local Deployment Guide

### **System Requirements**
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **Node.js**: Version 18.0+
- **MySQL**: Version 8.0+
- **RAM**: Minimum 8GB recommended
- **Storage**: 2GB free space

### **Step-by-Step Local Setup**

#### **Step 1: Install Prerequisites**

##### **MySQL Installation**

**Windows:**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and select "Developer Default"
3. Set root password: `capstoneDevelopers!01`
4. Complete installation and start MySQL service

**macOS:**
```bash
# Using Homebrew
brew install mysql
brew services start mysql
mysql_secure_installation
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

##### **Node.js Installation**
1. Download from [nodejs.org](https://nodejs.org/)
2. Install LTS version (18.x or higher)
3. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

#### **Step 2: Clone and Setup Project**

```bash
# Clone the repository
git clone <your-repo-url>
cd MetroExecuCare

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

#### **Step 3: Database Setup**

```bash
# Connect to MySQL
mysql -u root -p
# Enter password: capstoneDevelopers!01

# Create database and user
CREATE DATABASE metroexecucare_db;
CREATE USER 'metroexecu_user'@'localhost' IDENTIFIED BY 'capstoneDevelopers!01';
GRANT ALL PRIVILEGES ON metroexecucare_db.* TO 'metroexecu_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# Run database schema setup
cd Backend
node config/database/manual-schema.js

# Seed initial data
node seeds/adminSeeds.js
```

#### **Step 4: Environment Configuration**

**Backend (.env):**
```bash
cd Backend
# Create .env file with:
```
```env
# Server Configuration
PORT=5032
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=metroexecucare_db
DB_USER=metroexecu_user
DB_PASSWORD=capstoneDevelopers!01

# JWT Configuration
JWT_SECRET=ec31b9ea66978015b40ec3c0c88e64aa2608d777483911655ec4dfea22a62d934dedc91a8f23faf86d1e65804e2c6db5e47068d999ca3584d33b2109e85f6501
JWT_REFRESH_SECRET=ec31b9ea66978015b40ec3c0c88e64aa2608d777483911655ec4dfea22a62d934dedc91a8f23faf86d1e65804e2c6db5e47068d999ca3584d33b2109e85f6501
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=30d

# Gmail SMTP Configuration (Optional - for email notifications)
GMAIL_USER_EMAIL=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
GMAIL_USE_APP_PASSWORD=true

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3005
```

**Frontend (.env):**
```bash
cd Frontend
# Create .env file with:
```
```env
# Frontend Environment Variables for MetroExecuCare

# API Configuration
VITE_API_BASE_URL=http://localhost:5032/api

# Application Configuration
VITE_APP_NAME=MetroExecuCare
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Features
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EMAIL_SYSTEM=true
```

#### **Step 5: Start Servers**

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
# Server should start on http://localhost:5032
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
# Frontend should start on http://localhost:3005
```

#### **Step 6: Test the System**

1. **Open browser**: Navigate to `http://localhost:3005`
2. **Test admin login**:
   - Email: `admin@metrobank.com`
   - Password: `AdminPass123!`
3. **Verify API connection**: Check browser console for any errors

---

## 🗄️ Database Setup Details

### **Schema Overview**
```sql
-- Main tables created by manual-schema.js:
users                    -- User accounts and profiles
requests                 -- LOA requests and workflow data
request_files           -- Uploaded documents
request_workflow_history -- Audit trail of workflow changes
user_activity_logs      -- User action tracking
notifications           -- Email notification history
```

### **Default Users Created**
```sql
-- Admin user (created by adminSeeds.js)
Email: admin@metrobank.com
Password: AdminPass123!
Role: admin

-- HR Personnel user (created by adminSeeds.js)
Email: hr.personnel@metrobank.com
Password: HRPass123!
Role: hr_personnel
```

### **Database Connection Test**
```bash
# Test database connection
cd Backend
node -e "
const { testConnection } = require('./config/database/connection');
testConnection().then(() => process.exit(0));
"
```

---

## ⚙️ Server Configuration

### **Port Configuration**
- **Backend**: Port 5032 (configurable in .env)
- **Frontend**: Port 3005 (auto-assigned by Vite)
- **Database**: Port 3306 (MySQL default)

### **CORS Configuration**
Backend is configured to accept requests from:
- `http://localhost:3005` (primary frontend)
- `http://localhost:3000-3010` (development flexibility)

### **File Upload Configuration**
- **Max file size**: 10MB
- **Upload directory**: `Backend/uploads/`
- **Allowed types**: Images (profile pictures), PDFs (request documents)

---

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **1. "Failed to fetch" Error**
```bash
# Check if backend is running
curl http://localhost:5032/api/health

# Expected response: {"success":true,"message":"MetroExecuCare API is running"}
```

#### **2. Database Connection Errors**
```bash
# Verify MySQL service is running
# Windows: Check Services.msc for MySQL80 service
# macOS: brew services list | grep mysql
# Linux: sudo systemctl status mysql

# Test database credentials
mysql -u metroexecu_user -p -h localhost metroexecucare_db
```

#### **3. Port Already in Use**
```bash
# Find process using port
# Windows: netstat -ano | findstr :5032
# macOS/Linux: lsof -i :5032

# Kill process (replace PID with actual process ID)
# Windows: taskkill /F /PID <PID>
# macOS/Linux: kill -9 <PID>
```

#### **4. Environment Variables Not Loading**
```bash
# Verify .env files exist and have correct format
ls -la Backend/.env
ls -la Frontend/.env

# Restart servers after .env changes
```

#### **5. Gmail Email Notifications Not Working**
1. Enable 2-factor authentication on Gmail account
2. Generate App Password: Gmail → Security → App passwords
3. Update `GMAIL_APP_PASSWORD` in Backend/.env
4. Set `GMAIL_USE_APP_PASSWORD=true`

### **Log Files & Debugging**

#### **Backend Logs**
- Console output shows detailed request/response info
- Database queries are logged in development mode
- Email sending status is logged

#### **Frontend Logs**
- Browser Developer Console (F12)
- Network tab shows API request/response details
- React DevTools for component state

### **Performance Optimization**

#### **Database Optimization**
```sql
-- Add indexes for better query performance (already included in schema)
CREATE INDEX idx_requests_status ON requests(current_status);
CREATE INDEX idx_requests_employee ON requests(employee_id);
CREATE INDEX idx_users_role ON users(role);
```

#### **Frontend Optimization**
- Images are automatically optimized during build
- API responses are cached where appropriate
- Components use React.memo for performance

---

## 📚 Additional Resources

### **API Documentation**
- Full API documentation: `Backend/Documentation/API_TESTING_DOCUMENTATION.md`
- Postman collection: `Backend/postman/MetroExecuCare.postman_collection.json`

### **Database Documentation**
- Schema details: `Backend/config/database/manual-schema.js`
- Migration guides: `Backend/Documentation/`

### **Workflow Documentation**
- Email workflow: `Frontend/FINAL_EMAIL_WORKFLOW_DOCUMENTATION.md`
- Request processing: `Backend/Documentation/`

### **Testing Guides**
- API testing: `POSTMAN_API_TESTING_GUIDE.md`
- Frontend testing: `EXECUTIVE_EMPLOYEE_API_TEST.md`

---

## 🎯 Development Next Steps

### **Immediate Actions Required**
1. **Fix Executive Login**: Create proper test user
2. **Create HR Dashboards**: Essential for workflow completion
3. **Add Request Processing UI**: Enable approve/reject functionality
4. **Test End-to-End Workflow**: Verify complete request lifecycle

### **Before Production Deployment**
1. **Security Audit**: Review authentication and authorization
2. **Performance Testing**: Load testing with realistic data volumes
3. **Email Configuration**: Set up production email service
4. **Database Backup**: Implement automated backup strategy
5. **Error Monitoring**: Add logging and monitoring tools

---

*Last Updated: January 2025*
*Version: 1.0.0*
*Contact: Development Team*