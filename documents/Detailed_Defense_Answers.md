# Detailed Answers to Capstone Defense Questions

## **Security Implementation**

### **Authentication & Authorization: JWT Token Flow Explained**

#### **Step-by-Step JWT Flow in MetroExecuCare:**

**1. User logs in → Credentials sent to `/api/auth/login`**
```javascript
// Frontend (Login.jsx)
const handleLogin = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  // Returns: { success: true, token: "eyJhbGc...", user: {...} }
};
```

**2. Backend validates → Generates JWT with user payload**
```javascript
// Backend (authController.js - login function)
const login = async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Find user in database
  const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

  // Step 2: Verify password with bcrypt
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (isValidPassword) {
    // Step 3: Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      }, // Payload (user data)
      process.env.JWT_SECRET, // Secret key
      { expiresIn: '24h' } // Token expires in 24 hours
    );

    // Step 4: Send token to frontend
    res.json({ success: true, token, user });
  }
};
```

**3. Token stored in localStorage (Frontend)**
```javascript
// Frontend stores the token
localStorage.setItem('authToken', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

// Now every time the user navigates, the token is available
```

**4. Every request includes: `Authorization: Bearer <token>`**

**WHAT DOES "EVERY REQUEST" MEAN?**

In web applications, a **"request"** is any communication from the frontend to the backend. Examples in MetroExecuCare:

- **Fetching data**: Getting list of requests, hospitals, user profile
- **Submitting forms**: Creating a new request, updating profile
- **File operations**: Uploading PDF, downloading letter
- **Status changes**: HR claiming a request, approving/rejecting

**HOW DO WE KNOW AN ACTION IS A REQUEST?**

In our code, every time you see `fetch()`, `apiService.someMethod()`, or any HTTP call, that's a request:

```javascript
// Example 1: Fetching user's requests (This is a REQUEST)
const response = await fetch('http://localhost:5000/api/requests', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}` // ← Token sent here
  }
});

// Example 2: Submitting a new request (This is a REQUEST)
const response = await fetch('http://localhost:5000/api/requests/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // ← Token sent here
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ request_type: 'letter_of_approval', ... })
});

// Example 3: Using apiService (abstraction of fetch)
// In apiService.js
const getRequests = async () => {
  const token = localStorage.getItem('authToken');
  return fetch(`${API_BASE_URL}/requests`, {
    headers: {
      'Authorization': `Bearer ${token}` // ← Token sent here
    }
  });
};
```

**Real-World Analogy:**
Think of the token like an ID badge in a secure building. Every time you want to enter a room (make a request), you show your badge (send the token). The security system (backend middleware) checks if your badge is valid before letting you in.

**5. Backend middleware verifies token before processing**

---

### **What Does Middleware Do? (DETAILED EXPLANATION)**

**Middleware = Code that runs BETWEEN receiving a request and sending a response**

In MetroExecuCare, we have `authMiddleware.js`:

```javascript
// Backend/middleware/authMiddleware.js
const authenticateToken = (req, res, next) => {
  // Step 1: Extract token from request header
  const authHeader = req.headers['authorization']; // "Bearer eyJhbGc..."
  const token = authHeader && authHeader.split(' ')[1]; // Extract "eyJhbGc..."

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    // Step 2: Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Attach user info to request object
    req.user = decoded; // Now req.user = { id: 5, email: 'john@metrobank.com', role: 'executive' }

    // Step 4: Allow request to proceed
    next(); // ← This tells Express to continue to the actual route handler
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

module.exports = authenticateToken;
```

**HOW MIDDLEWARE IS USED IN ROUTES:**

```javascript
// Backend/routes/requestRoutes.js
const authenticateToken = require('../middleware/authMiddleware');

// Protected route: Only authenticated users can access
router.get('/requests', authenticateToken, async (req, res) => {
  // Because of middleware, we can safely use req.user here
  const userId = req.user.id; // ← Comes from JWT token
  const userRole = req.user.role;

  // Fetch requests based on user's role
  if (userRole === 'executive') {
    // Get only this user's requests
    const [requests] = await pool.execute(
      'SELECT * FROM checkup_requests WHERE employee_id = ?',
      [userId]
    );
  }

  res.json({ success: true, data: requests });
});
```

**VALUE MIDDLEWARE GIVES TO THE SYSTEM:**

1. **Security**: Prevents unauthorized access (only logged-in users can make requests)
2. **User Context**: Every route knows WHO is making the request (req.user.id, req.user.role)
3. **Role-Based Access**: We can check permissions (e.g., only admins can delete users)
4. **Code Reusability**: Write authentication once, use it on all protected routes
5. **Token Expiration**: Automatically rejects expired tokens (user must log in again)

**Flow Diagram:**
```
Client Request → Express Server → Middleware → Route Handler → Response
                                      ↓
                              ✅ Valid Token?
                              ├─ YES → req.user populated → next()
                              └─ NO  → 401/403 Error → Response sent
```

---

### **Deeply Explain What JWT Does in Our System**

**JWT (JSON Web Token) = A Compact, Self-Contained Token for Authentication**

#### **Structure of a JWT Token:**
A JWT has 3 parts separated by dots: `HEADER.PAYLOAD.SIGNATURE`

**Example JWT:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiZW1haWwiOiJqb2huQG1ldHJvYmFuay5jb20iLCJyb2xlIjoiZXhlY3V0aXZlIiwiaWF0IjoxNzE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**Decoded:**

1. **Header (Algorithm + Token Type):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload (User Data):**
```json
{
  "id": 5,
  "email": "john@metrobank.com",
  "role": "executive",
  "iat": 1716239022,  // Issued At timestamp
  "exp": 1716325422   // Expiration timestamp (24 hours later)
}
```

3. **Signature (Verification Hash):**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

#### **What JWT Does in MetroExecuCare:**

**1. Stateless Authentication**
- Traditional sessions store user info on the server (in memory or database)
- JWT stores user info IN THE TOKEN ITSELF
- Backend doesn't need to query the database on every request to check "Is this user logged in?"
- Just verifies the token signature

**2. Secure User Identification**
- Every request includes the JWT
- Backend decodes the JWT to get user ID and role
- We use this to:
  - Filter data (show only user's own requests)
  - Enforce permissions (only HR can claim requests)
  - Log actions (who approved/rejected a request)

**3. Token Expiration for Security**
- JWT expires after 24 hours (set in `expiresIn: '24h'`)
- After expiration, user must log in again
- Prevents old tokens from being used indefinitely
- If a token is stolen, it's only valid for 24 hours max

**4. Prevents Tampering**
- The signature is created using a SECRET KEY (`JWT_SECRET` in `.env`)
- If someone tries to change the payload (e.g., change role from 'executive' to 'admin'), the signature won't match
- Backend rejects tampered tokens with 403 Forbidden

**5. Cross-Domain Authentication**
- JWT works across different domains (frontend on Railway, backend on another server)
- Unlike cookies (which have domain restrictions), JWT in localStorage can be sent anywhere

#### **JWT in Action (Real Example from MetroExecuCare):**

**Scenario: Executive submits a request**

```javascript
// Frontend: User clicks "Submit Request"
const submitRequest = async (formData) => {
  const response = await fetch('http://localhost:5000/api/requests/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
};

// Backend: Receives request
router.post('/create', authenticateToken, async (req, res) => {
  // Middleware already verified JWT and populated req.user
  const employeeId = req.user.id; // From JWT payload
  const { request_type, letter_purpose } = req.body;

  // Create request with this employee ID
  await pool.execute(
    'INSERT INTO checkup_requests (employee_id, request_type, letter_purpose) VALUES (?, ?, ?)',
    [employeeId, request_type, letter_purpose]
  );

  // No need to check "Is this user logged in?" - JWT already verified it!
});
```

---

### **How Multer Sanitizes Filenames (DETAILED)**

**What Multer Actually Does:**

Multer is middleware for handling `multipart/form-data` (file uploads). Here's our configuration:

```javascript
// Backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Where to save files
    cb(null, 'uploads/request-files/');
  },

  filename: (req, file, cb) => {
    // SANITIZATION HAPPENS HERE
    const userId = req.user?.id || 'anonymous';
    const timestamp = Date.now();
    const originalName = file.originalname;

    // Remove special characters and spaces from original filename
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/\s+/g, '_')             // Replace spaces with underscore
      .toLowerCase();                   // Convert to lowercase

    // Create unique filename: timestamp-userId-sanitizedName
    const uniqueFilename = `${timestamp}-${userId}-${sanitizedName}`;

    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,

  // File filter (only allow PDFs)
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Only PDF files are allowed'), false); // Reject file
    }
  },

  // File size limit (10MB)
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB in bytes
  }
});

module.exports = upload;
```

#### **Sanitization Steps in Detail:**

**Original Filename:** `Letter of Approval (Final).pdf`

**Step 1: Remove Special Characters**
```javascript
.replace(/[^a-zA-Z0-9.-]/g, '_')
// Result: "Letter_of_Approval__Final_.pdf"
```
- Regex `[^a-zA-Z0-9.-]` = "anything that's NOT alphanumeric, dot, or dash"
- Prevents directory traversal attacks (e.g., `../../etc/passwd`)
- Prevents shell injection (e.g., `; rm -rf /`)

**Step 2: Replace Spaces**
```javascript
.replace(/\s+/g, '_')
// Result: "Letter_of_Approval__Final_.pdf"
```
- Spaces in filenames can cause issues on some systems
- Makes URLs cleaner (no %20 encoding needed)

**Step 3: Lowercase**
```javascript
.toLowerCase()
// Result: "letter_of_approval__final_.pdf"
```
- Prevents case-sensitivity issues (Windows vs Linux)
- Consistent naming convention

**Step 4: Add Timestamp and User ID**
```javascript
const uniqueFilename = `${timestamp}-${userId}-${sanitizedName}`;
// Result: "1716239022-5-letter_of_approval__final_.pdf"
```
- **Timestamp**: Ensures uniqueness (no file overwrites)
- **User ID**: Tracks who uploaded the file
- **Sanitized Name**: Original filename (cleaned)

#### **Why This Matters (Security):**

**Attack Prevention:**

1. **Directory Traversal Prevention:**
   - Without sanitization: `../../../etc/passwd` could try to access system files
   - After sanitization: `_____etc_passwd` (harmless)

2. **Shell Injection Prevention:**
   - Without sanitization: `file.pdf; rm -rf /` could execute shell commands
   - After sanitization: `file.pdf__rm_-rf__` (harmless)

3. **Path Injection Prevention:**
   - Without sanitization: `../../uploads/file.pdf` could overwrite existing files
   - After sanitization: `_____uploads_file.pdf` (saved in designated folder)

4. **MIME Type Verification:**
   - File extension can be faked (rename `virus.exe` to `virus.pdf`)
   - Multer checks `file.mimetype` (content-based, harder to fake)
   - Only accepts `application/pdf`

**Database Storage:**
```sql
-- request_files table
INSERT INTO request_files (
  original_file_name,  -- "Letter of Approval (Final).pdf" (displayed to user)
  file_name,           -- "1716239022-5-letter_of_approval__final_.pdf" (actual file)
  file_path,           -- "uploads/request-files/1716239022-5-letter_of_approval__final_.pdf"
  uploaded_by,         -- 5 (user ID from JWT)
  request_id           -- 123 (which request this file belongs to)
) VALUES (?, ?, ?, ?, ?);
```

---

## **Security Layers (DEEPLY EXPLAINED)**

### **1. bcrypt.js (Password Hashing)**

**What It Does:**
- Converts passwords into irreversible hash strings
- Even if someone steals the database, they can't get the original passwords

**How It Works:**

```javascript
// During Registration (Backend/controllers/authController.js)
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Generate a "salt" (random data)
  const saltRounds = 10; // Computational cost (higher = slower but more secure)
  const salt = await bcrypt.genSalt(saltRounds);

  // Step 2: Hash password with the salt
  const hashedPassword = await bcrypt.hash(password, salt);
  // Input:  "MyPassword123"
  // Output: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"

  // Step 3: Store hashed password in database
  await pool.execute(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hashedPassword] // ← Never store plain password!
  );
};
```

**During Login:**
```javascript
const login = async (req, res) => {
  const { email, password } = req.body;

  // Step 1: Get user's hashed password from database
  const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  const user = users[0];

  // Step 2: Compare entered password with stored hash
  const isValidPassword = await bcrypt.compare(password, user.password);
  // bcrypt.compare("MyPassword123", "$2a$10$N9qo8uLO...") → true

  if (isValidPassword) {
    // Generate JWT and log in
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};
```

**Why Salt?**
- Without salt, same password = same hash
- Attacker could use "rainbow tables" (pre-computed hash tables) to crack passwords
- Salt makes every hash unique, even for same password

**Example:**
```
User A password: "password123"
Salt: "$2a$10$abcdefg"
Hash: "$2a$10$abcdefg...XYZ123"

User B password: "password123" (same password!)
Salt: "$2a$10$hijklmn" (different salt)
Hash: "$2a$10$hijklmn...ABC789" (different hash!)
```

---

### **2. Helmet.js (HTTP Header Security)**

**What It Does:**
- Adds secure HTTP headers to responses
- Protects against common web vulnerabilities

**How We Use It:**

```javascript
// Backend/server.js
const helmet = require('helmet');
app.use(helmet());
```

**Headers Helmet Sets:**

1. **X-Frame-Options: DENY**
   - Prevents clickjacking attacks
   - Stops your site from being loaded in an iframe on malicious sites

2. **X-Content-Type-Options: nosniff**
   - Prevents MIME-type sniffing
   - Browser won't guess file types (e.g., treat .txt as .html)

3. **Strict-Transport-Security (HSTS)**
   - Forces HTTPS connections
   - Prevents downgrade attacks (HTTPS → HTTP)

4. **X-XSS-Protection: 1; mode=block**
   - Enables browser's XSS (Cross-Site Scripting) filter
   - Blocks suspected XSS attacks

5. **Content-Security-Policy (CSP)**
   - Restricts where resources can be loaded from
   - Prevents injection of malicious scripts

**Real-World Analogy:**
Helmet is like adding multiple locks to your door. Each header is a different lock preventing a specific type of attack.

---

### **3. CORS (Cross-Origin Resource Sharing)**

**The Problem CORS Solves:**

By default, browsers block requests from one domain to another (security feature).

**Example:**
- Frontend: `http://localhost:3000` (Vite dev server)
- Backend: `http://localhost:5000` (Express server)
- Without CORS: Browser blocks the request (different ports = different origins)

**Our CORS Configuration:**

```javascript
// Backend/server.js
const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'http://localhost:5173',           // Vite dev server (alternate port)
  'https://yourfrontend.railway.app' // Production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // ✅ Allow this origin
    } else {
      callback(new Error('Not allowed by CORS')); // ❌ Block this origin
    }
  },
  credentials: true // Allow cookies/auth headers
}));
```

**What This Prevents:**
- Malicious websites can't make requests to your backend
- Only whitelisted domains (your frontend) can access your API
- Protects user data from being stolen by third-party sites

**Response Headers CORS Adds:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
```

---

### **4. express-rate-limit (DDoS & Brute Force Prevention)**

**What It Does:**
- Limits how many requests a user can make in a time window
- Prevents automated attacks

**Our Configuration:**

```javascript
// Backend/server.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Stricter limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/login', loginLimiter);
```

**Attack Prevention:**

**1. Brute Force Attack Prevention:**
- Attacker tries to guess passwords by trying thousands of combinations
- Rate limiter blocks them after 5 failed attempts
- Attacker must wait 15 minutes before trying again

**2. DDoS Protection:**
- Distributed Denial of Service attacks overwhelm servers with requests
- Rate limiter caps requests per IP
- Server remains available for legitimate users

**Response When Limit Exceeded:**
```json
{
  "message": "Too many login attempts, please try again later."
}
```
Plus HTTP Status: `429 Too Many Requests`

---

### **5. Input Validation (SQL Injection Prevention)**

**The Danger (SQL Injection):**

```javascript
// ❌ NEVER DO THIS (Vulnerable to SQL Injection)
const email = req.body.email; // User input: "' OR '1'='1"
const query = `SELECT * FROM users WHERE email = '${email}'`;
await pool.execute(query);

// Actual query becomes:
// SELECT * FROM users WHERE email = '' OR '1'='1'
// This returns ALL users! (Attacker can steal entire database)
```

**Our Safe Approach (Parameterized Queries):**

```javascript
// ✅ CORRECT (Using Prepared Statements)
const email = req.body.email;
await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

// mysql2 automatically escapes the input
// Even if email = "' OR '1'='1", it's treated as a literal string
// Query becomes: SELECT * FROM users WHERE email = '\' OR \'1\'=\'1'
// No SQL injection possible!
```

**Additional Validation in Our System:**

```javascript
// Backend/controllers/requestController.js
const createRequest = async (req, res) => {
  const { request_type, letter_purpose } = req.body;

  // Validate request type
  const validTypes = ['letter_of_approval', 'letter_of_authorization'];
  if (!validTypes.includes(request_type)) {
    return res.status(400).json({
      error: 'Invalid request type'
    });
  }

  // Validate letter purpose length
  if (!letter_purpose || letter_purpose.trim().length < 10) {
    return res.status(400).json({
      error: 'Letter purpose must be at least 10 characters'
    });
  }

  // Only proceed if validation passes
  await pool.execute(
    'INSERT INTO checkup_requests (employee_id, request_type, letter_purpose) VALUES (?, ?, ?)',
    [req.user.id, request_type, letter_purpose]
  );
};
```

---

### **6. File Upload Security (Multer)**

**Security Measures:**

**A. File Type Restriction**
```javascript
fileFilter: (req, file, cb) => {
  // Check MIME type (content-based, not just extension)
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept
  } else {
    cb(new Error('Only PDF files are allowed'), false); // Reject
  }
}
```

**Why MIME Type Over Extension?**
- Extensions can be faked: `virus.exe` renamed to `virus.pdf`
- MIME type is determined by file content (magic bytes)
- Harder to bypass

**B. File Size Limit**
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // 10MB max
}
```

**Why?**
- Prevents disk space attacks (upload giant files to fill server)
- Prevents memory exhaustion (huge files crash server)

**C. Filename Sanitization** (Explained earlier)

**D. Separate Upload Directory**
```javascript
destination: 'uploads/request-files/'
```

**Why?**
- Isolated from code files (can't overwrite server.js)
- Easy to back up and secure
- Can set different permissions (read-only for public access)

**E. Authentication Required**
```javascript
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  // Only logged-in users can upload
  // req.user.id tracks who uploaded
});
```

---

## **Frontend Features & UX Decisions**

### **State Management: AuthContext (DEEPLY EXPLAINED)**

**What is AuthContext?**

React Context API is a way to share data across components without passing props manually at every level ("prop drilling").

**Our AuthContext Implementation:**

```javascript
// Frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Step 1: Create the context
const AuthContext = createContext();

// Step 2: Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Step 3: Load user from localStorage on app startup
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Step 4: Login function
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      // Save to state (triggers re-render across all components using context)
      setUser(data.user);

      // Save to localStorage (persists across page refreshes)
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);

      return data;
    }
  };

  // Step 5: Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  // Step 6: Provide context value to all children
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Step 7: Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**How It's Used in the App:**

```javascript
// Frontend/src/main.jsx
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> {/* ← Wraps entire app */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

**Using AuthContext in Components:**

```javascript
// Any component in the app (e.g., Dashboard.jsx)
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user, logout } = useAuth(); // ← Access context

  if (!user) {
    return <Navigate to="/login" />; // Redirect if not logged in
  }

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Why AuthContext is Powerful:**

**1. Global State Without Props Drilling**

**Without Context (Props Drilling):**
```javascript
<App user={user} logout={logout}>
  <Layout user={user} logout={logout}>
    <Navbar user={user} logout={logout}>
      <ProfileMenu user={user} logout={logout} /> {/* ← Finally used here */}
    </Navbar>
  </Layout>
</App>
```

**With Context:**
```javascript
<App>
  <Layout>
    <Navbar>
      <ProfileMenu /> {/* ← Directly access via useAuth() */}
    </Navbar>
  </Layout>
</App>
```

**2. Automatic Re-renders**
- When `setUser()` is called (login/logout), ALL components using `useAuth()` re-render
- Navbar updates user name
- Dashboard shows/hides based on authentication
- Protected routes redirect automatically

**3. Persistent Authentication**
- User refreshes page → `useEffect` loads user from localStorage
- User closes browser and reopens → Still logged in (until logout or token expires)

**4. Centralized Auth Logic**
- Login/logout logic in ONE place
- Easy to add features (e.g., auto-logout on token expiration)

---

## **Data Backup Strategy**

### **Clarification on "Hourly Incremental Backups"**

**IMPORTANT: We DID NOT implement hourly incremental backups in the current system.**

**What We Actually Have:**
- **Railway Automated Backups**: Railway (our hosting provider) provides automated daily backups of the MySQL database
- **Manual Export Option**: We can manually export MySQL dumps using Railway's dashboard or command-line tools

**What "We'd Implement" Means:**
This is a **future recommendation** for production environments. Here's what you should say during defense:

**Current Implementation:**
"Our current system relies on Railway's built-in daily backups. We can also manually export MySQL dumps through Railway's interface or using the `mysqldump` command."

**Future Enhancement:**
"For a production-grade system handling critical employee health data, we would implement hourly incremental backups. This would involve:"

**1. Full Backup (Daily):**
```bash
# Scheduled daily at midnight
mysqldump -u username -p database_name > backup_full_$(date +%Y%m%d).sql
```

**2. Incremental Backup (Hourly):**
```bash
# Scheduled every hour (captures only changes since last backup)
mysqlbinlog /var/log/mysql/mysql-bin.000001 > backup_incremental_$(date +%Y%m%d_%H%M).sql
```

**3. Backup Storage:**
- Store backups in Amazon S3, Google Cloud Storage, or Azure Blob Storage
- Encrypt backups at rest
- Retain backups for 30 days (configurable)

**4. Automated Restoration Testing:**
```bash
# Monthly automated test to ensure backups are valid
mysql -u username -p database_name < backup_full_20250101.sql
# Run test queries to verify data integrity
```

**5. Disaster Recovery Plan:**
- Recovery Point Objective (RPO): Max 1 hour of data loss (hourly backups)
- Recovery Time Objective (RTO): Restore within 2 hours

**How to Present This:**
"While our current development environment uses Railway's daily backups, we recognize that a production system would require more robust disaster recovery. We've designed the database schema with this in mind, using normalized tables and foreign keys to ensure data consistency during restoration."

---

## **ERD (Entity Relationship Diagram) Presentation Guide**

### **How to Present Your ERD**

**1. Overview Introduction:**
"Our database design follows a relational model with 8 core tables. The ERD illustrates the relationships between users, requests, approvals, and supporting data."

**2. Core Tables Explanation:**

#### **A. Users Table**
```
users
├─ id (Primary Key)
├─ employee_id (Unique identifier)
├─ first_name, last_name
├─ email (Unique, for login)
├─ password (bcrypt hashed)
├─ role (executive, hr_personnel, benefits_officer, welfare_head, admin)
├─ department
├─ position
├─ contact_number
├─ profile_picture
├─ is_active (Soft delete flag)
└─ created_at, updated_at
```

**Relationships:**
- **One user → Many requests** (as employee)
- **One HR user → Many requests** (as assigned HR)
- **One user → Many approvals** (as approver)
- **One user → Many file uploads** (as uploader)

---

#### **B. checkup_requests Table (Core Entity)**
```
checkup_requests
├─ id (Primary Key)
├─ request_number (Unique, auto-generated: REQ20250124...)
├─ employee_id (Foreign Key → users.id)
├─ request_type (letter_of_approval / letter_of_authorization)
├─ letter_purpose
├─ hospital_id (Foreign Key → hospitals.id)
├─ preferred_date
├─ current_status (pending, assigned_to_hr, benefits_review, etc.)
├─ priority_level (normal, urgent)
├─ assigned_hr_id (Foreign Key → users.id, nullable)
├─ assigned_bo_id (Foreign Key → users.id, nullable)
├─ assigned_wh_id (Foreign Key → users.id, nullable)
├─ due_date
├─ completed_at
├─ rejected_at
├─ rejection_reason
└─ created_at, updated_at
```

**Relationships:**
- **Many requests → One employee** (creator)
- **Many requests → One HR personnel** (assigned)
- **Many requests → One hospital** (selected location)
- **One request → Many approvals** (approval history)
- **One request → Many files** (attachments)
- **One request → Many activity logs** (audit trail)

---

#### **C. request_approvals Table**
```
request_approvals
├─ id (Primary Key)
├─ request_id (Foreign Key → checkup_requests.id)
├─ approver_id (Foreign Key → users.id)
├─ approver_role (hr_personnel, benefits_officer, welfare_head)
├─ approval_stage (hr_stage, benefits_stage, welfare_stage)
├─ action (approved, rejected, pending)
├─ comments
├─ action_date
└─ created_at
```

**Purpose:**
- Tracks each approval step in the workflow
- Maintains history (who approved/rejected and when)
- Supports multi-level approval hierarchy

**Relationships:**
- **Many approvals → One request**
- **Many approvals → One approver (user)**

---

#### **D. request_files Table**
```
request_files
├─ id (Primary Key)
├─ request_id (Foreign Key → checkup_requests.id)
├─ original_file_name (User-friendly name)
├─ file_name (Sanitized storage name)
├─ file_path (Server path)
├─ file_size
├─ uploaded_by (Foreign Key → users.id)
├─ generated_by (Foreign Key → users.id, nullable, for system-generated letters)
├─ submission_type (initial_submission, additional_document, approval_letter)
├─ file_request_id (Foreign Key → file_requests.id, nullable)
├─ is_active (Soft delete)
└─ created_at
```

**Relationships:**
- **Many files → One request**
- **Many files → One uploader (user)**
- **Many files → One file request** (if uploaded in response to request)

---

#### **E. file_requests Table**
```
file_requests
├─ id (Primary Key)
├─ request_id (Foreign Key → checkup_requests.id)
├─ requested_by (Foreign Key → users.id)
├─ requested_by_role (hr_personnel, benefits_officer, welfare_head)
├─ message (Why additional files are needed)
├─ status (pending, fulfilled)
├─ fulfilled_at
└─ created_at
```

**Purpose:**
- HR/approvers can request additional documents from executive
- Executive responds by uploading files linked to this file_request_id

---

#### **F. activity_logs Table**
```
activity_logs
├─ id (Primary Key)
├─ request_id (Foreign Key → checkup_requests.id, nullable)
├─ user_id (Foreign Key → users.id)
├─ action (request_created, hr_assigned, approved, rejected, etc.)
├─ description (Human-readable log)
├─ old_values (JSON, stores previous state)
├─ new_values (JSON, stores new state)
└─ created_at
```

**Purpose:**
- Audit trail for compliance and debugging
- Tracks every action on every request
- Shows timeline of events

---

#### **G. hospitals Table**
```
hospitals
├─ id (Primary Key)
├─ name
├─ address
├─ contact_number
├─ is_active
└─ created_at, updated_at
```

**Purpose:**
- Master list of affiliated medical centers
- Executives choose from this list when submitting requests

---

#### **H. departments / branches Tables** (Optional Support Tables)
```
departments
├─ id (Primary Key)
├─ name
├─ description
└─ created_at

branches
├─ id (Primary Key)
├─ name
├─ address
├─ contact_number
└─ created_at
```

**Purpose:**
- Organizational structure data
- Used for filtering and reporting

---

### **3. Key Relationships Summary**

**One-to-Many Relationships:**
- `users` (1) → `checkup_requests` (Many) as employee
- `users` (1) → `checkup_requests` (Many) as assigned_hr
- `hospitals` (1) → `checkup_requests` (Many)
- `checkup_requests` (1) → `request_approvals` (Many)
- `checkup_requests` (1) → `request_files` (Many)
- `checkup_requests` (1) → `file_requests` (Many)
- `checkup_requests` (1) → `activity_logs` (Many)
- `users` (1) → `request_files` (Many) as uploader

**Self-Referencing Relationships:**
- `users` table has multiple foreign keys in `checkup_requests`:
  - `employee_id` → creator of request
  - `assigned_hr_id` → HR processing the request
  - `assigned_bo_id` → Benefits Officer reviewing
  - `assigned_wh_id` → Welfare Head approving

---

### **4. Data Integrity Features**

**Foreign Key Constraints:**
```sql
ALTER TABLE checkup_requests
  ADD CONSTRAINT fk_employee
    FOREIGN KEY (employee_id)
    REFERENCES users(id)
    ON DELETE RESTRICT; -- Prevent deletion of user if they have requests
```

**Indexes for Performance:**
```sql
CREATE INDEX idx_request_number ON checkup_requests(request_number);
CREATE INDEX idx_employee_id ON checkup_requests(employee_id);
CREATE INDEX idx_current_status ON checkup_requests(current_status);
```

**Cascade Behavior:**
- `ON DELETE RESTRICT`: Prevent deletion of referenced records (users, requests)
- `ON UPDATE CASCADE`: Automatically update foreign keys if primary key changes

---

### **5. Sample Data Flow Through ERD**

**Scenario: Executive Submits Request**

```
1. INSERT INTO checkup_requests
   ├─ employee_id = 5 (from users table)
   ├─ request_type = 'letter_of_approval'
   ├─ hospital_id = 3 (from hospitals table)
   └─ current_status = 'pending'

2. INSERT INTO request_files
   ├─ request_id = 123 (new request)
   ├─ uploaded_by = 5 (executive)
   └─ submission_type = 'initial_submission'

3. INSERT INTO activity_logs
   ├─ request_id = 123
   ├─ user_id = 5
   ├─ action = 'request_created'
   └─ description = 'Executive submitted new request'

4. (HR claims request)
   UPDATE checkup_requests
   SET assigned_hr_id = 10, current_status = 'assigned_to_hr'
   WHERE id = 123

5. INSERT INTO request_approvals
   ├─ request_id = 123
   ├─ approver_id = 15 (Benefits Officer)
   ├─ approval_stage = 'benefits_stage'
   ├─ action = 'approved'
   └─ comments = 'Request approved for medical check-up'
```

---

### **6. How to Present the ERD Diagram**

**Use the Image:**
- Open `Backend/uploads/MetroExecuCare_ERD.drawio (1).png` during presentation
- Point to each table and explain its purpose
- Trace a request's lifecycle through the tables

**Verbal Explanation:**
"Our ERD shows 8 interconnected tables. At the core is `checkup_requests`, which references `users` for employees and approvers, `hospitals` for medical facilities, and spawns child records in `request_approvals`, `request_files`, and `activity_logs`. This normalized structure ensures data integrity and supports complex queries for reporting and dashboard statistics."

**Highlight Design Decisions:**
- "We use soft deletes (`is_active` flag) instead of hard deletes to maintain audit trails."
- "Foreign key constraints prevent orphaned records—you can't delete a user who has active requests."
- "JSON fields in `activity_logs` (`old_values`, `new_values`) provide flexible change tracking without schema modifications."

---

### **7. ERD Strengths to Emphasize**

✅ **Normalized Design**: No data redundancy (hospitals stored once, referenced many times)
✅ **Scalability**: Adding new request types or approval stages doesn't require schema changes
✅ **Data Integrity**: Foreign keys enforce valid references
✅ **Audit Trail**: Complete history of every action via `activity_logs` and `request_approvals`
✅ **Flexibility**: JSON fields in logs support evolving requirements
✅ **Performance**: Indexes on frequently queried columns (status, dates, employee_id)

---

**Final Tip:**
Practice explaining the ERD by walking through a real-world scenario (e.g., "Executive submits request → HR reviews → Benefits approves → Letter generated"). This shows you understand not just the tables, but how data flows through the system.

---

## **Final Defense Strategy**

**Be Ready to:**
1. Show actual code snippets from your project
2. Explain trade-offs (e.g., why localStorage over cookies for tokens)
3. Discuss scalability (e.g., "If we had 10,000 users, we'd add Redis caching")
4. Acknowledge limitations (e.g., "We don't have 2FA yet, but we'd add it using...")
5. Connect to real-world systems (e.g., "This is similar to SAP's approval workflows")

**Confidence Phrases:**
- "We chose X because..."
- "This prevents Y attack by..."
- "In production, we would enhance this by..."
- "This design decision ensures..."

Good luck! You've built a comprehensive, secure, production-ready system. Own it! 🚀
