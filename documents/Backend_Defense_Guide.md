# Backend Defense Guide - Key Points to Review

## **Critical Backend Concepts for Defense**

### **1. API Architecture & RESTful Design**

#### **Our API Endpoint Structure:**

```
/api/auth
├─ POST /login          - User authentication
├─ POST /register       - New user registration
└─ POST /change-password - Update user password

/api/requests
├─ GET  /               - Get all requests (filtered by role)
├─ GET  /:id            - Get single request details
├─ POST /create         - Create new checkup request
├─ PUT  /:id/approve    - Approve a request
├─ PUT  /:id/reject     - Reject a request
├─ PUT  /:id/claim      - HR claims a request
└─ DELETE /:id          - Delete request (soft delete)

/api/files
├─ POST /upload         - Upload request file
├─ GET  /download/:id   - Download request file
└─ DELETE /:id          - Delete file (soft delete)

/api/users
├─ GET  /               - Get all users (admin only)
├─ GET  /profile        - Get current user profile
├─ PUT  /profile        - Update user profile
└─ POST /               - Create new user (admin only)

/api/hospitals
├─ GET  /               - Get all hospitals
├─ POST /               - Add new hospital (admin only)
└─ PUT  /:id            - Update hospital (admin only)
```

**REST Principles Applied:**
- **Stateless**: Each request contains all necessary info (JWT token)
- **Resource-based**: URLs represent resources (users, requests, files)
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

---

### **2. Backend File Structure**

```
Backend/
├── server.js              # Entry point, Express app setup
├── config/
│   └── database.js        # MySQL connection pool
├── controllers/
│   ├── authController.js  # Login, register, change password
│   ├── requestController.js # CRUD for checkup requests
│   ├── userController.js  # User management
│   └── fileController.js  # File upload/download
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   ├── uploadMiddleware.js # Multer file upload config
│   └── errorHandler.js    # Global error handling
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   ├── requestRoutes.js   # Request endpoints
│   ├── userRoutes.js      # User endpoints
│   └── fileRoutes.js      # File endpoints
├── utils/
│   ├── emailService.js    # Nodemailer/Resend email sending
│   └── helpers.js         # Utility functions
└── uploads/
    └── request-files/     # Uploaded PDF files
```

**Why This Structure?**
- **Separation of Concerns**: Routes → Controllers → Database
- **Maintainability**: Easy to find and modify code
- **Scalability**: Can split into microservices later
- **Testability**: Each layer can be tested independently

---

### **3. Database Connection & Pooling**

#### **Connection Pool Configuration:**

```javascript
// Backend/config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'metroexecucare',
  waitForConnections: true,
  connectionLimit: 10,        // Max 10 simultaneous connections
  queueLimit: 0,              // Unlimited queue
  enableKeepAlive: true,      // Keep connections alive
  keepAliveInitialDelay: 0
});

module.exports = pool;
```

**Why Connection Pooling?**

**Without Pooling:**
```
Request 1 → Create Connection → Query → Close Connection
Request 2 → Create Connection → Query → Close Connection
Request 3 → Create Connection → Query → Close Connection
↓
Slow! Each connection takes ~100ms to establish
```

**With Pooling:**
```
Request 1 → Reuse Connection from Pool → Query → Return to Pool
Request 2 → Reuse Connection from Pool → Query → Return to Pool
Request 3 → Reuse Connection from Pool → Query → Return to Pool
↓
Fast! Connections are reused, no creation overhead
```

**Key Benefits:**
- **Performance**: 10-100x faster than creating new connections
- **Resource Management**: Limits concurrent database connections
- **Auto-reconnect**: Handles connection failures gracefully
- **Promise Support**: Works with async/await syntax

---

### **4. Error Handling Strategy**

#### **Global Error Handler:**

```javascript
// Backend/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired, please log in again'
    });
  }

  // Multer File Upload Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`
    });
  }

  // Database Errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      success: false,
      error: 'Duplicate entry. This record already exists'
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'Invalid reference. Referenced record does not exist'
    });
  }

  // Default Error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
```

**Usage in server.js:**
```javascript
// Must be AFTER all routes
app.use(errorHandler);
```

---

### **5. Request Workflow Logic (Backend)**

#### **Complete Request Lifecycle in Code:**

**1. Executive Creates Request:**

```javascript
// POST /api/requests/create
const createRequest = async (req, res) => {
  const { request_type, letter_purpose, hospital_id, preferred_date } = req.body;
  const employee_id = req.user.id; // From JWT middleware

  // Validation
  if (!['letter_of_approval', 'letter_of_authorization'].includes(request_type)) {
    return res.status(400).json({ error: 'Invalid request type' });
  }

  // Generate unique request number
  const request_number = `REQ${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

  // Calculate due date (15 working days from now)
  const due_date = calculateDueDate(15);

  // Insert into database
  const [result] = await pool.execute(`
    INSERT INTO checkup_requests
    (request_number, employee_id, request_type, letter_purpose, hospital_id,
     preferred_date, current_status, due_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
  `, [request_number, employee_id, request_type, letter_purpose, hospital_id, preferred_date, due_date]);

  // Log activity
  await pool.execute(`
    INSERT INTO activity_logs (request_id, user_id, action, description)
    VALUES (?, ?, 'request_created', 'Executive submitted new request')
  `, [result.insertId, employee_id]);

  // Send email notification to HR
  await emailService.sendNewRequestNotification(result.insertId);

  res.status(201).json({
    success: true,
    message: 'Request created successfully',
    data: { request_id: result.insertId, request_number }
  });
};
```

**2. HR Claims Request:**

```javascript
// PUT /api/requests/:id/claim
const claimRequest = async (req, res) => {
  const requestId = req.params.id;
  const hrId = req.user.id;

  // Start transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Check if already claimed
    const [requests] = await connection.execute(
      'SELECT assigned_hr_id FROM checkup_requests WHERE id = ?',
      [requestId]
    );

    if (requests[0].assigned_hr_id) {
      throw new Error('Request already claimed by another HR');
    }

    // Update request
    await connection.execute(`
      UPDATE checkup_requests
      SET assigned_hr_id = ?, current_status = 'assigned_to_hr', assigned_at = NOW()
      WHERE id = ? AND assigned_hr_id IS NULL
    `, [hrId, requestId]);

    // Log activity
    await connection.execute(`
      INSERT INTO activity_logs (request_id, user_id, action, description)
      VALUES (?, ?, 'hr_assigned', 'HR Personnel claimed the request')
    `, [requestId, hrId]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Request claimed successfully'
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

**3. Benefits Officer Approves:**

```javascript
// PUT /api/requests/:id/approve
const approveRequest = async (req, res) => {
  const requestId = req.params.id;
  const approverId = req.user.id;
  const approverRole = req.user.role;
  const { comments } = req.body;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Determine approval stage
    let approvalStage, nextStatus;

    if (approverRole === 'benefits_officer') {
      approvalStage = 'benefits_stage';
      nextStatus = 'welfare_review'; // Next: Welfare Head
    } else if (approverRole === 'welfare_head') {
      approvalStage = 'welfare_stage';
      nextStatus = 'approved'; // Final approval
    }

    // Insert approval record
    await connection.execute(`
      INSERT INTO request_approvals
      (request_id, approver_id, approver_role, approval_stage, action, comments, action_date)
      VALUES (?, ?, ?, ?, 'approved', ?, NOW())
    `, [requestId, approverId, approverRole, approvalStage, comments]);

    // Update request status
    await connection.execute(`
      UPDATE checkup_requests
      SET current_status = ?, updated_at = NOW()
      WHERE id = ?
    `, [nextStatus, requestId]);

    // Log activity
    await connection.execute(`
      INSERT INTO activity_logs (request_id, user_id, action, description)
      VALUES (?, ?, 'approved', ?)
    `, [requestId, approverId, `${approverRole} approved the request`]);

    await connection.commit();

    // Send email notification
    if (nextStatus === 'approved') {
      await emailService.sendFinalApprovalNotification(requestId);
    } else {
      await emailService.sendStageApprovalNotification(requestId, 'welfare_head');
    }

    res.json({
      success: true,
      message: 'Request approved successfully'
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
```

---

### **6. Email Service Implementation**

#### **Development (Nodemailer + Gmail):**

```javascript
// Backend/utils/emailService.js
const nodemailer = require('nodemailer');

// Gmail transporter for development
const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // App-specific password, NOT regular password
  }
});

const sendNewRequestNotification = async (requestId) => {
  const [requests] = await pool.execute(`
    SELECT cr.*, u.first_name, u.last_name, u.email
    FROM checkup_requests cr
    JOIN users u ON cr.employee_id = u.id
    WHERE cr.id = ?
  `, [requestId]);

  const request = requests[0];

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'hr@metrobank.com', // HR email
    subject: `New Request Submitted - ${request.request_number}`,
    html: `
      <h2>New Executive Check-up Request</h2>
      <p><strong>Request Number:</strong> ${request.request_number}</p>
      <p><strong>Employee:</strong> ${request.first_name} ${request.last_name}</p>
      <p><strong>Type:</strong> ${request.request_type}</p>
      <p><strong>Purpose:</strong> ${request.letter_purpose}</p>
      <p><a href="${process.env.FRONTEND_URL}/loa-submit/${request.id}">View Request</a></p>
    `
  };

  await gmailTransporter.sendMail(mailOptions);
};
```

#### **Production (Resend API):**

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendNewRequestNotification = async (requestId) => {
  const [requests] = await pool.execute(`
    SELECT cr.*, u.first_name, u.last_name, u.email
    FROM checkup_requests cr
    JOIN users u ON cr.employee_id = u.id
    WHERE cr.id = ?
  `, [requestId]);

  const request = requests[0];

  await resend.emails.send({
    from: 'MetroExecuCare <noreply@metroexecucare.com>',
    to: 'hr@metrobank.com',
    subject: `New Request Submitted - ${request.request_number}`,
    html: `
      <h2>New Executive Check-up Request</h2>
      <p><strong>Request Number:</strong> ${request.request_number}</p>
      <p><strong>Employee:</strong> ${request.first_name} ${request.last_name}</p>
      <p><strong>Type:</strong> ${request.request_type}</p>
      <p><strong>Purpose:</strong> ${request.letter_purpose}</p>
      <p><a href="${process.env.FRONTEND_URL}/loa-submit/${request.id}">View Request</a></p>
    `
  });
};
```

**Why Two Email Services?**
- **Nodemailer + Gmail**: Free, easy for local development, but has rate limits (500 emails/day)
- **Resend API**: Production-grade, better deliverability, no rate limits, professional sender reputation
- We use environment variables to switch between them

---

### **7. Transaction Management (Critical for Data Integrity)**

#### **Why Transactions Matter:**

**Without Transaction:**
```javascript
// Step 1: Update request status
await pool.execute('UPDATE checkup_requests SET status = ? WHERE id = ?', ['approved', 123]);

// ❌ Server crashes here!

// Step 2: Insert approval record (NEVER HAPPENS)
await pool.execute('INSERT INTO request_approvals ...', [...]);

// Result: Request is marked approved, but no approval record exists!
```

**With Transaction:**
```javascript
const connection = await pool.getConnection();
await connection.beginTransaction();

try {
  // Step 1: Update request status
  await connection.execute('UPDATE checkup_requests SET status = ? WHERE id = ?', ['approved', 123]);

  // ❌ Server crashes here!
  // Transaction is NOT committed yet, so changes are ROLLED BACK automatically

  // Step 2: Insert approval record
  await connection.execute('INSERT INTO request_approvals ...', [...]);

  await connection.commit(); // ✅ Both steps succeed together
} catch (error) {
  await connection.rollback(); // ❌ If any step fails, undo ALL changes
  throw error;
} finally {
  connection.release(); // Return connection to pool
}
```

**ACID Properties:**
- **Atomicity**: All steps succeed or all fail (no partial updates)
- **Consistency**: Database remains in valid state
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Committed changes are permanent

---

### **8. Environment Variables (.env)**

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=metroexecucare

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production

# Email - Development (Nodemailer + Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Email - Production (Resend)
RESEND_API_KEY=re_your_resend_api_key

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/request-files
```

**Security Note:**
- `.env` is in `.gitignore` (never committed to GitHub)
- Each developer/environment has their own `.env`
- Production uses Railway's environment variables dashboard

---

### **9. API Response Format (Consistency)**

#### **Success Response:**
```javascript
res.status(200).json({
  success: true,
  message: 'Request created successfully',
  data: {
    request_id: 123,
    request_number: 'REQ20250124...'
  }
});
```

#### **Error Response:**
```javascript
res.status(400).json({
  success: false,
  error: 'Invalid request type',
  details: ['Request type must be letter_of_approval or letter_of_authorization']
});
```

**Why Consistent Format?**
- Frontend can always check `response.success`
- Error handling is uniform
- Easy to debug (clear error messages)
- API documentation is simpler

---

### **10. Important Backend Defense Questions & Answers**

**Q: How do you handle concurrent requests (e.g., two HR personnel trying to claim the same request)?**

**A:** We use database transactions with row-level locking:

```javascript
// Check if already claimed WITHIN the transaction
await connection.execute(`
  UPDATE checkup_requests
  SET assigned_hr_id = ?
  WHERE id = ? AND assigned_hr_id IS NULL
`, [hrId, requestId]);

// If assigned_hr_id is NOT NULL, the UPDATE affects 0 rows
// We can check affectedRows to see if the claim succeeded
```

This ensures that only ONE HR can claim a request, even if two click "Claim" at the exact same time.

---

**Q: How do you prevent SQL injection?**

**A:** We use parameterized queries (prepared statements) with `mysql2`:

```javascript
// ❌ VULNERABLE (String concatenation)
const query = `SELECT * FROM users WHERE email = '${email}'`;
await pool.execute(query);

// ✅ SAFE (Parameterized query)
await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
```

The `?` placeholder is automatically escaped by the `mysql2` driver, preventing SQL injection.

---

**Q: How do you handle file downloads securely?**

**A:** We verify authentication and file ownership:

```javascript
const downloadFile = async (req, res) => {
  const fileId = req.params.id;
  const userId = req.user.id; // From JWT

  // Get file metadata
  const [files] = await pool.execute(
    'SELECT * FROM request_files WHERE id = ?',
    [fileId]
  );

  const file = files[0];

  // Check if file exists
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Get request to check permissions
  const [requests] = await pool.execute(
    'SELECT employee_id, assigned_hr_id FROM checkup_requests WHERE id = ?',
    [file.request_id]
  );

  const request = requests[0];

  // Verify user has permission to download
  if (request.employee_id !== userId &&
      request.assigned_hr_id !== userId &&
      req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Send file
  res.download(file.file_path, file.original_file_name);
};
```

---

**Q: How do you log and audit user actions?**

**A:** Every significant action is logged in the `activity_logs` table:

```javascript
await pool.execute(`
  INSERT INTO activity_logs (request_id, user_id, action, description, created_at)
  VALUES (?, ?, ?, ?, NOW())
`, [requestId, userId, 'status_changed', 'Request approved by Benefits Officer']);
```

This creates a complete audit trail showing:
- **Who** performed the action (user_id)
- **What** action was performed (action)
- **When** it happened (created_at)
- **Which** request was affected (request_id)
- **Additional context** (description)

---

**Q: What happens if the database connection fails?**

**A:** The connection pool automatically handles reconnection:

```javascript
// If a connection fails, mysql2 will:
// 1. Remove it from the pool
// 2. Try to establish a new connection
// 3. Retry the query (up to a limit)

// We also have error handling
try {
  const [results] = await pool.execute('SELECT ...');
} catch (error) {
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    // Log and retry
    console.error('Database connection lost, retrying...');
    // Implement retry logic
  }
  throw error;
}
```

---

## **Summary: Backend Best Practices Implemented**

✅ **RESTful API Design** - Clear, resource-based endpoints
✅ **JWT Authentication** - Stateless, scalable auth
✅ **Connection Pooling** - Efficient database access
✅ **Transactions** - Data integrity for critical operations
✅ **Parameterized Queries** - SQL injection prevention
✅ **Error Handling** - Consistent error responses
✅ **Activity Logging** - Complete audit trail
✅ **Email Notifications** - User engagement
✅ **File Upload Security** - MIME type checking, size limits, sanitization
✅ **Role-Based Access** - Authorization checks on every endpoint
✅ **Environment Variables** - Secure configuration management

**Ready to Defend!** 🚀
