# MetroExecuCare System - Detailed Reviewer Documentation
## Complete Technical & Non-Technical Guide

**Version:** 2.7
**Project Type:** Healthcare Management System
**Organization:** Metrobank Executive Check-up Management
**Documentation Date:** November 2024

---

## Table of Contents

1. [Executive Summary (Non-Technical)](#executive-summary-non-technical)
2. [System Overview with Examples](#system-overview-with-examples)
3. [Technology Stack Explained](#technology-stack-explained)
4. [System Architecture (Simplified)](#system-architecture-simplified)
5. [Database Design with Examples](#database-design-with-examples)
6. [Workflow Process with Real Scenarios](#workflow-process-with-real-scenarios)
7. [Security Features Explained](#security-features-explained)
8. [API Documentation with Examples](#api-documentation-with-examples)
9. [User Interface & Experience](#user-interface--experience)
10. [Implementation Details](#implementation-details)

---

## Executive Summary (Non-Technical)

### What Problem Does This System Solve?

**The Old Way (Problems):**

Imagine you're an executive at Metrobank and you need to get approval for your annual health check-up:

1. **You fill out a paper form** - Easy to lose, hard to track
2. **Submit to HR department** - Wait days for them to process it
3. **HR sends to Benefits department** - More waiting, no visibility
4. **Benefits sends to Welfare department** - Still waiting...
5. **Finally back to HR for final approval** - Where is my request?
6. **Documents get lost** - Start over!
7. **No idea what stage you're at** - Have to call/email constantly
8. **Takes 2-3 weeks** - Very slow process

**The New Way (MetroExecuCare Solution):**

1. **Log in to website** - Secure, 24/7 access
2. **Fill out digital form** - Takes 5 minutes
3. **Upload documents** - PDF, Word, images all accepted
4. **Click submit** - Done!
5. **Real-time tracking** - See exactly where your request is
6. **Automatic emails** - Get notified at every step
7. **Download final approval** - Everything in one place
8. **Takes 3-5 days** - Much faster!

**Real Impact:**
- ✅ 70% faster processing time
- ✅ Zero lost documents
- ✅ 100% transparency
- ✅ Complete audit trail (who did what, when)
- ✅ Reduced administrative workload
- ✅ Better employee satisfaction

---

### Who Uses This System?

Think of it like a relay race with 5 runners, where the baton is the health check-up request:

**1. Executive (Runner 1 - You):**
- **Role:** Request originator
- **Real Example:** Maria Santos, Senior Manager, needs annual health check-up
- **Actions:** Fill form, upload medical history, submit request
- **Analogy:** Like ordering something online - you fill the cart and checkout

**2. HR Personnel (Runner 2 - First Handler):**
- **Role:** Initial processor
- **Real Example:** John Cruz from HR department receives Maria's request
- **Actions:** Review documents, assign which hospital, forward to Benefits
- **Analogy:** Like a customer service agent who checks your order and assigns delivery

**3. Benefits Officer (Runner 3 - Eligibility Checker):**
- **Role:** Benefits verifier
- **Real Example:** Lisa Reyes checks if Maria is eligible for executive health benefits
- **Actions:** Review company policy, check Maria's benefits package, approve/reject
- **Analogy:** Like an insurance agent checking if you're covered

**4. Welfare Head (Runner 4 - Final Approver):**
- **Role:** Policy compliance
- **Real Example:** Robert Tan ensures company welfare policies are followed
- **Actions:** Final review, budget check, approve/reject
- **Analogy:** Like a bank manager approving a large loan

**5. HR Personnel (Runner 5 - Finisher):**
- **Role:** Final verification and documentation
- **Real Example:** John Cruz (same HR person) does final check
- **Actions:** Review everything, generate official letters, send to Maria
- **Analogy:** Like quality control - final check before shipping

---

### What Makes This System Special?

**1. Automation (Automatic Actions):**
- **Example:** When Benefits Officer approves, the system automatically:
  - Changes request status to "Welfare Review"
  - Sends email to Welfare Head
  - Records the action in activity log
  - Updates the dashboard statistics

  **Without automation:** Someone would have to manually email, update spreadsheets, etc.

**2. Real-Time Tracking:**
- **Example:** Maria can log in anytime and see:
  ```
  ✓ Submitted on Nov 1, 2024 at 9:00 AM
  ✓ HR Processing (John Cruz) - Nov 1, 2024 at 2:00 PM
  ✓ Benefits Approved (Lisa Reyes) - Nov 2, 2024 at 10:00 AM
  → Currently at: Welfare Review (Robert Tan)
    Pending: Final HR Verification
  ```

  **Like tracking a package:** You know exactly where it is at all times.

**3. Security & Permissions:**
- **Example:** Maria (Executive) can:
  - ✅ View her own requests
  - ✅ Upload documents to her requests
  - ❌ Cannot see other executives' requests
  - ❌ Cannot approve her own request
  - ❌ Cannot delete after HR starts processing

  **Like a building:** Different access cards for different areas.

**4. Complete Audit Trail:**
- **Example:** The system records everything:
  ```
  Nov 1, 2024 09:00 AM - Maria Santos submitted request REQ-20241101-0001
  Nov 1, 2024 09:05 AM - Maria Santos uploaded medical_history.pdf
  Nov 1, 2024 02:00 PM - John Cruz claimed the request
  Nov 1, 2024 02:15 PM - John Cruz assigned Makati Medical Center
  Nov 1, 2024 02:30 PM - John Cruz processed to Benefits
  Nov 2, 2024 10:00 AM - Lisa Reyes approved benefits eligibility
  ```

  **Like a security camera:** Everything is recorded and can be reviewed.

---

## Technology Stack Explained

### What is a "Technology Stack"?

Think of building a house:
- **Foundation:** Database (stores all information)
- **Structure:** Backend (business rules and logic)
- **Exterior:** Frontend (what users see and interact with)
- **Utilities:** Tools and services (email, security, etc.)

---

### Frontend Technologies (What Users See)

#### 1. **React 18.3.1**

**What it is:** A JavaScript library for building user interfaces

**Simple Explanation:**
React is like LEGO blocks for websites. Instead of building everything from scratch, you use pre-made, reusable pieces (called "components").

**Real Example in MetroExecuCare:**
```
Login Button Component:
┌─────────────────────┐
│      LOGIN          │  ← This is ONE component
└─────────────────────┘

We use this same button everywhere:
- Login page
- Registration page
- Profile page

If we want to change the button color, we change it once,
and it updates everywhere!
```

**Why React?**
- ✅ Fast and responsive (no page reloads)
- ✅ Reusable components (write once, use everywhere)
- ✅ Easy to maintain (organized code)
- ✅ Large community (lots of help available)

**Real-World Analogy:**
Like using templates in Microsoft Word instead of formatting everything manually.

---

#### 2. **React Router v6.26**

**What it is:** Navigation system for React applications

**Simple Explanation:**
Think of it as a GPS for your website. It controls what page you see based on the URL.

**Real Example:**
```
URL                          What You See
─────────────────────────────────────────────────
/login                    → Login Page
/executive/dashboard      → Executive Dashboard
/hr/requests/123          → Request Details (ID: 123)
/admin/users              → User Management Page
```

**Without React Router:**
Every page change would reload the entire website (slow and clunky).

**With React Router:**
Instant page changes, no reload (smooth and fast).

**Real-World Analogy:**
Like flipping through chapters in a book vs. getting a new book for each chapter.

---

#### 3. **Vite 5.3**

**What it is:** Build tool and development server

**Simple Explanation:**
Vite is like a chef's assistant that:
- Prepares ingredients (code) super fast
- Serves hot food (instant updates when coding)
- Packages leftovers (builds for production)

**Real Example:**

**During Development:**
```
You change code → Vite detects it → Page updates in 0.5 seconds
(No manual refresh needed!)
```

**For Production:**
```
Vite takes all your code files → Optimizes them → Creates a tiny, fast package
(Website loads faster for users)
```

**Why Vite?**
- ⚡ Lightning fast (10x faster than older tools)
- 🔥 Hot reload (instant updates)
- 📦 Optimized builds (smaller file sizes)

**Real-World Analogy:**
Like using an instant pot vs. a traditional slow cooker - same result, way faster.

---

#### 4. **Tailwind CSS 4.0**

**What it is:** Utility-first CSS framework for styling

**Simple Explanation:**
Instead of writing custom styles for every element, Tailwind provides pre-made style classes you can combine.

**Traditional CSS (Old Way):**
```css
/* You write this in a separate file */
.my-button {
  background-color: blue;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
}
```

**Tailwind CSS (New Way):**
```html
<!-- You write this directly in HTML -->
<button class="bg-blue-500 text-white px-5 py-2 rounded text-base">
  Login
</button>
```

**Real Benefits:**
- ✅ Faster development (no switching between files)
- ✅ Smaller final file size (removes unused styles)
- ✅ Consistent design (same spacing, colors everywhere)

**Real-World Analogy:**
Like using emoji 😊 instead of describing "a smiling face" - faster and everyone understands.

---

#### 5. **PDF-lib & pdfjs-dist**

**What it is:** Libraries for working with PDF files

**Simple Explanation:**
Tools that let the system read, edit, and create PDF documents.

**Real Example in MetroExecuCare:**

**Scenario:** HR needs to add a signature to the Letter of Approval

```
1. System loads the PDF template (blank LOA letter)
2. Fills in employee details: Name, Date, Hospital
3. Adds digital signature
4. Generates final PDF
5. Saves it to the request
```

**Without these libraries:**
HR would have to manually download, edit in Adobe, upload again (slow and error-prone).

**With these libraries:**
Click "Generate Letter" → Done in 2 seconds!

**Real-World Analogy:**
Like auto-fill in forms vs. typing everything manually.

---

### Backend Technologies (Behind the Scenes)

#### 1. **Node.js 18+**

**What it is:** JavaScript runtime for servers

**Simple Explanation:**
Normally, JavaScript only runs in web browsers. Node.js lets JavaScript run on servers (computers that handle requests).

**Real Example:**
```
User clicks "Submit Request"
    ↓
Browser sends request to server
    ↓
Node.js receives it
    ↓
Node.js processes it (checks permissions, saves to database)
    ↓
Node.js sends response back
    ↓
User sees "Request submitted successfully!"
```

**Why Node.js?**
- ✅ Same language (JavaScript) for both frontend and backend
- ✅ Fast and efficient
- ✅ Handles many users at once
- ✅ Huge ecosystem (lots of tools available)

**Real-World Analogy:**
Like speaking the same language with your coworker - easier communication, fewer misunderstandings.

---

#### 2. **Express.js 4.19**

**What it is:** Web framework for Node.js

**Simple Explanation:**
Express is like a traffic controller for your server. It routes incoming requests to the right handler.

**Real Example:**

**User visits website:**
```
GET /api/requests        → Express routes to "Get Requests" function
POST /api/requests       → Express routes to "Create Request" function
DELETE /api/requests/123 → Express routes to "Delete Request 123" function
```

**Code Example (Simplified):**
```javascript
// Think of this as a menu at a restaurant
app.get('/api/requests', function() {
  // Someone ordered "get requests"
  // Serve them the list of requests
});

app.post('/api/requests', function() {
  // Someone ordered "create request"
  // Make a new request for them
});
```

**Why Express?**
- ✅ Simple and flexible
- ✅ Industry standard (most popular Node.js framework)
- ✅ Lots of plugins (middleware)

**Real-World Analogy:**
Like a receptionist at a hotel - directs you to the right department based on what you need.

---

#### 3. **MySQL 8.0**

**What it is:** Relational database management system

**Simple Explanation:**
MySQL is like a super organized filing cabinet that stores all your data in tables.

**Real Example - Users Table:**
```
┌────┬─────────────┬───────────────────────┬──────────────┬──────────┐
│ ID │ Employee ID │ Email                 │ Name         │ Role     │
├────┼─────────────┼───────────────────────┼──────────────┼──────────┤
│ 1  │ EMP001      │ maria@metrobank.com   │ Maria Santos │ executive│
│ 2  │ EMP002      │ john@metrobank.com    │ John Cruz    │ hr       │
│ 3  │ EMP003      │ lisa@metrobank.com    │ Lisa Reyes   │ benefits │
└────┴─────────────┴───────────────────────┴──────────────┴──────────┘
```

**Real Example - Requests Table:**
```
┌────┬───────────────────┬─────────────┬────────────────┬──────────┐
│ ID │ Request Number    │ Employee ID │ Hospital       │ Status   │
├────┼───────────────────┼─────────────┼────────────────┼──────────┤
│ 1  │ REQ-20241101-0001│ 1 (Maria)   │ Makati Med     │ completed│
│ 2  │ REQ-20241102-0002│ 4 (Pedro)   │ St. Lukes      │ pending  │
└────┴───────────────────┴─────────────┴────────────────┴──────────┘
```

**Relationships (Connections):**
```
Users Table → Requests Table
   (1)            (Many)

One user (Maria) can have many requests
```

**Why MySQL?**
- ✅ Reliable (used by Facebook, Twitter, YouTube)
- ✅ Fast (optimized for reading data)
- ✅ ACID compliant (data integrity guaranteed)
- ✅ Free and open source

**Real-World Analogy:**
Like Excel spreadsheets but with superpowers - millions of rows, instant search, automatic backups.

---

#### 4. **JWT (JSON Web Tokens)**

**What it is:** Secure authentication method

**Simple Explanation:**
JWT is like a special wristband at an amusement park. Once you pay (login), you get a wristband. You show this wristband to access rides (protected pages) without paying again.

**How It Works:**

**Step 1 - Login:**
```
User: "I want to login"
      Username: maria@metrobank.com
      Password: SecurePass123!

Server: "Credentials verified! Here's your token (wristband)"
        Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 2 - Access Protected Page:**
```
User: "Show me my requests"
      + Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Server: "Token valid! You're Maria Santos (Executive)"
        "Here are your 5 requests..."
```

**Token Contents (Decoded):**
```json
{
  "id": 1,
  "employee_id": "EMP001",
  "email": "maria@metrobank.com",
  "role": "executive",
  "issued_at": "2024-11-13 09:00:00",
  "expires_at": "2024-11-14 09:00:00"  ← Valid for 24 hours
}
```

**Security Features:**
- ✅ Cannot be tampered with (cryptographically signed)
- ✅ Expires after 24 hours (automatic logout)
- ✅ Contains user info (no database lookup needed)
- ✅ Works across devices (mobile, web, tablet)

**Real-World Analogy:**
Like a passport - identifies you, has expiration date, can't be forged.

---

#### 5. **bcryptjs (Password Hashing)**

**What it is:** Password encryption library

**Simple Explanation:**
Bcrypt turns passwords into unreadable code that can never be reversed.

**How It Works:**

**When User Registers:**
```
User Password: "MySecret123!"
        ↓ (bcrypt hash with 10 rounds)
Stored in Database: "$2a$10$rOQ5PVXzPm8sj6bvJl6Kt.jHCL2LoG3KN..."

Even if hackers steal the database, they see:
"$2a$10$rOQ5PVXzPm8sj6bvJl6Kt.jHCL2LoG3KN..."
↑ Impossible to reverse back to "MySecret123!"
```

**When User Logs In:**
```
User Types: "MySecret123!"
     ↓
System: "Let me hash this..."
     ↓
Hashed: "$2a$10$rOQ5PVXzPm8sj6bvJl6Kt.jHCL2LoG3KN..."
     ↓
System: "Does this match the database? YES! Login successful!"
```

**Why Bcrypt?**
- ✅ One-way encryption (cannot be decrypted)
- ✅ Salted (same password = different hash each time)
- ✅ Slow on purpose (prevents brute force attacks)
- ✅ Industry standard

**Real Example:**
```
Password: "hello123"
Bcrypt Hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye1JgJ7ZRkfYwBFDXzvhD6J..."

Password: "hello123" (same password!)
Bcrypt Hash: "$2a$10$DIFFERENT_HASH_EVERY_TIME_xyz123..."
                ↑ Different because of random "salt"
```

**Real-World Analogy:**
Like a paper shredder - you can shred a document, but you can't un-shred it back to the original.

---

#### 6. **Multer (File Upload Handler)**

**What it is:** Middleware for handling file uploads

**Simple Explanation:**
Multer is like a postal worker who receives packages (files), checks them, and stores them safely.

**How It Works:**

**Step 1 - User Uploads File:**
```
User selects file: medical_history.pdf (2.5 MB)
     ↓
Multer checks:
  ✓ Is it allowed type? (PDF, DOC, DOCX, JPG, PNG)
  ✓ Is it under 10 MB?
  ✓ Is filename safe? (no ../../../hack.exe)
     ↓
Multer saves to: /uploads/1699876543-abc123.pdf
     ↓
Returns info to system:
  - Original name: medical_history.pdf
  - Stored as: 1699876543-abc123.pdf
  - Size: 2.5 MB
  - Type: application/pdf
```

**Security Features:**
```
❌ REJECTED: virus.exe (not allowed file type)
❌ REJECTED: huge_file.pdf (15 MB - too large)
❌ REJECTED: ../../etc/passwd (trying to hack)
✅ ACCEPTED: report.pdf (2 MB PDF file)
```

**Configuration Example:**
```javascript
Max file size: 10 MB
Allowed types: PDF, DOC, DOCX, JPG, PNG
Max files per upload: 5
Storage location: /uploads/
Filename: timestamp + random string + extension
```

**Real-World Analogy:**
Like airport security for files - checks everything before letting it through.

---

#### 7. **Resend API (Email Service)**

**What it is:** Cloud email service

**Simple Explanation:**
Resend is like a professional mail delivery service that sends emails reliably.

**Why Not Just Gmail?**

**Gmail SMTP (Old approach):**
```
❌ Limited to 500 emails per day
❌ Often blocked by cloud servers
❌ Requires app-specific passwords
❌ Can be marked as spam
❌ No delivery tracking
```

**Resend API (Current approach):**
```
✅ Unlimited emails (pay per use)
✅ Never blocked
✅ API key authentication (simple)
✅ Better deliverability (not marked as spam)
✅ Delivery tracking and analytics
```

**Real Example in MetroExecuCare:**

**When Benefits Approves Request:**
```javascript
System: "Benefits Officer approved! Send email to Welfare Head"
     ↓
Resend API:
  From: notifications@metroexecucare.xyz
  To: robert.tan@metrobank.com (Welfare Head)
  Subject: "Request Ready for Your Review - REQ-20241101-0001"
  Body: [Beautiful HTML email with details and action button]
     ↓
Delivered in 2 seconds ✓
```

**Email Template Example:**
```html
┌────────────────────────────────────────┐
│ MetroExecuCare                         │
│                                        │
│ Hi Robert,                             │
│                                        │
│ A new request is ready for your review:│
│                                        │
│ Request: REQ-20241101-0001             │
│ Employee: Maria Santos                 │
│ Status: Approved by Benefits           │
│                                        │
│ ┌──────────────────┐                  │
│ │  REVIEW REQUEST  │ ← Click here     │
│ └──────────────────┘                  │
│                                        │
└────────────────────────────────────────┘
```

**Real-World Analogy:**
Like using FedEx vs. regular mail - more reliable, faster, with tracking.

---

### Development Tools

#### 1. **Git (Version Control)**

**What it is:** System for tracking code changes

**Simple Explanation:**
Git is like a time machine for your code. You can:
- Save snapshots (commits) of your work
- Go back to any previous version
- See who changed what and when
- Work on features without breaking main code

**Real Example:**

**Timeline of Changes:**
```
Nov 1: "Initial project setup" - You
Nov 2: "Added login page" - You
Nov 3: "Created database schema" - You
Nov 5: "Fixed login bug" - You
Nov 8: "Added request workflow" - You
```

**If something breaks on Nov 8:**
```
You: "Git, take me back to Nov 5 when everything worked"
Git: "Done! Code restored to Nov 5 version"
```

**Branches (Parallel Workstreams):**
```
main (stable, working code)
│
├── feature/user-management (you working on users)
├── feature/email-notifications (you working on emails)
└── bugfix/login-error (you fixing a bug)

When done, merge back to main
```

**Real-World Analogy:**
Like Microsoft Word's "Track Changes" but for code, with time travel.

---

#### 2. **Railway (Cloud Hosting)**

**What it is:** Platform for deploying web applications

**Simple Explanation:**
Railway is like renting a high-tech apartment for your website instead of building a house.

**Without Railway (Traditional Hosting):**
```
❌ Buy a physical server ($1000+)
❌ Set up operating system
❌ Install Node.js, MySQL, etc.
❌ Configure network, security
❌ Handle crashes manually
❌ Scale manually when traffic increases
```

**With Railway:**
```
✅ Click "Deploy" - done!
✅ Automatic setup
✅ Automatic scaling
✅ Automatic backups
✅ Automatic security updates
✅ Pay only $5-20/month
```

**How Deployment Works:**
```
1. You: Push code to GitHub
2. Railway: Detects new code
3. Railway: Builds application
4. Railway: Runs tests
5. Railway: Deploys to production
6. Railway: Website is live!

Total time: 2-3 minutes
```

**Real-World Analogy:**
Like using Airbnb instead of building a hotel - faster, cheaper, managed for you.

---

## System Architecture (Simplified)

### The Big Picture: How Everything Connects

Think of the system as a restaurant:

```
┌─────────────────────────────────────────────────────────────┐
│                    CUSTOMERS (Users)                         │
│  Using phones, laptops, tablets to access the website       │
└────────────────────────────┬────────────────────────────────┘
                             │
                    Internet (The Road)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    DINING ROOM (Frontend)                    │
│                   React - What Customers See                 │
│                                                              │
│  - Menu (Pages): Login, Dashboard, Submit Request           │
│  - Waiters (Components): Buttons, Forms, Tables             │
│  - Decorations (Styles): Tailwind CSS                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                   Orders & Food Delivery
                   (API Requests & Responses)
                             │
┌────────────────────────────▼────────────────────────────────┐
│                   KITCHEN (Backend)                          │
│                   Express.js - Business Logic                │
│                                                              │
│  - Head Chef (Controllers): Make decisions                  │
│  - Sous Chefs (Services): Email, File handling             │
│  - Recipe Book (Validators): Check order correctness        │
│  - Security Guard (Middleware): Check who can enter         │
└────────────────────────────┬────────────────────────────────┘
                             │
                     Get/Store Ingredients
                             │
┌────────────────────────────▼────────────────────────────────┐
│                STORAGE ROOM (Database)                       │
│                   MySQL - Data Storage                       │
│                                                              │
│  - Shelves (Tables): Users, Requests, Files                 │
│  - Labels (Columns): ID, Name, Email, Status                │
│  - Inventory Book (Logs): Who took what, when               │
└──────────────────────────────────────────────────────────────┘
```

---

### Request Flow: Step-by-Step Example

**Scenario:** Maria wants to submit a health check-up request

#### Step 1: Maria Opens the Website

```
Maria's Browser
    ↓
Types URL: https://metroexecucare.com
    ↓
React Frontend loads:
  - Landing page appears
  - "Login" button visible
  - Navigation menu ready
    ↓
Maria sees: Beautiful, responsive website
```

#### Step 2: Maria Logs In

```
Maria clicks "Login" button
    ↓
Login form appears (React component)
    ↓
Maria types:
  Email: maria.santos@metrobank.com
  Password: MySecure123!
    ↓
Maria clicks "Submit"
    ↓
React: "Let me send this to the server"
    ↓
POST request sent to: /api/auth/login
    ↓
Express receives request
    ↓
AuthController processes:
  1. Check if email exists in database
     MySQL: "SELECT * FROM users WHERE email = 'maria.santos@metrobank.com'"
     Result: Found! User ID: 1, Name: Maria Santos, Role: executive

  2. Verify password
     Typed: "MySecure123!"
     Stored (hashed): "$2a$10$rOQ5PVXzPm8..."
     bcrypt.compare() → Match! ✓

  3. Generate JWT token
     Token includes: {id: 1, email: maria..., role: executive}
     Expires: 24 hours from now

  4. Send response back
    ↓
Maria's browser receives:
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "name": "Maria Santos",
      "role": "executive",
      "email": "maria.santos@metrobank.com"
    }
  }
    ↓
React saves token to localStorage (like a cookie jar)
    ↓
React redirects to: /executive/dashboard
    ↓
Maria sees: "Welcome, Maria Santos!" with dashboard
```

#### Step 3: Maria Submits a Request

```
Maria clicks "Submit New Request" button
    ↓
React loads LOA_Submit page with form:
  - Request Type: [Letter of Approval ▼]
  - Preferred Hospital: [Select... ▼]
  - Preferred Date: [📅 Calendar picker]
  - Purpose: [Text box]
  - Upload Files: [Choose Files button]
    ↓
Maria fills out:
  - Type: Letter of Approval
  - Hospital: Makati Medical Center
  - Date: December 15, 2024
  - Purpose: "Annual executive health check-up as per company policy"
  - Files: Uploads "medical_history.pdf" (2.3 MB)
    ↓
Maria clicks "Submit Request"
    ↓
React validates:
  ✓ All required fields filled?
  ✓ Date in the future?
  ✓ File size under 10 MB?
  ✓ File type allowed?
    ↓
React sends POST request to: /api/requests
  Headers: {Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
  Body: {
    request_type: "letter_of_approval",
    hospital_id: 5,
    preferred_date: "2024-12-15",
    letter_purpose: "Annual executive health check-up as per company policy"
  }
  Files: medical_history.pdf
    ↓
Express receives request
    ↓
Middleware chain executes:

  1. authenticateToken (Auth Middleware)
     - Extract JWT from header
     - Verify signature → Valid ✓
     - Decode payload → User ID: 1 (Maria)
     - Fetch fresh user data from database
     - Attach to req.user
     → Proceed to next middleware

  2. requireRole('executive') (Auth Middleware)
     - Check req.user.role
     - Is it 'executive'? Yes ✓
     → Proceed to next middleware

  3. validateCreateRequest (Validator)
     - Check request_type: Valid ✓
     - Check hospital_id: Exists in DB ✓
     - Check preferred_date: Future date ✓
     - Check letter_purpose: 10-1000 chars ✓
     → Proceed to controller
    ↓
RequestController.createRequest executes:

  1. Start database transaction

  2. Generate request number
     Format: REQ-YYYYMMDD-XXXX
     Result: "REQ-20241113-0001"

  3. Insert into checkup_requests table
     MySQL: INSERT INTO checkup_requests (
       request_number, employee_id, request_type,
       hospital_id, preferred_date, letter_purpose,
       current_status, created_at
     ) VALUES (
       'REQ-20241113-0001', 1, 'letter_of_approval',
       5, '2024-12-15', 'Annual executive...',
       'pending', NOW()
     )
     Result: New request ID: 456

  4. Handle file upload (Multer)
     - Receive medical_history.pdf
     - Check file type: PDF ✓
     - Check file size: 2.3 MB ✓
     - Generate unique filename: 1699876543-abc123.pdf
     - Save to: /uploads/1699876543-abc123.pdf
     - Insert metadata to request_files table

  5. Create approval records for all stages
     MySQL: INSERT INTO request_approvals (
       request_id, approval_stage, required_role,
       action, approval_order
     ) VALUES
       (456, 'hr_stage', 'hr_personnel', 'pending', 1),
       (456, 'benefits_stage', 'benefits_officer', 'pending', 2),
       (456, 'welfare_stage', 'welfare_head', 'pending', 3),
       (456, 'hr_final_stage', 'hr_personnel', 'pending', 4)

  6. Log activity
     MySQL: INSERT INTO activity_logs (
       user_id, action_type, action_description,
       related_entity_type, related_entity_id
     ) VALUES (
       1, 'create_request', 'Created request REQ-20241113-0001',
       'request', 456
     )

  7. Commit transaction (all or nothing!)

  8. Send email notification (async, doesn't block)
     EmailService.sendTaskNotification(
       recipients: [All HR Personnel emails],
       subject: "New Health Check-up Request",
       message: "Maria Santos submitted REQ-20241113-0001"
     )
     → Resend API sends emails

  9. Return success response
    ↓
Express sends response to React:
  {
    "success": true,
    "message": "Request submitted successfully",
    "request": {
      "id": 456,
      "request_number": "REQ-20241113-0001",
      "status": "pending",
      "created_at": "2024-11-13T09:00:00Z"
    }
  }
    ↓
React receives response:
  - Displays success message: "✓ Request submitted successfully!"
  - Redirects to: /executive/status-tracker
  - Shows request card with status: "Pending HR Processing"
    ↓
Maria sees:
  ┌────────────────────────────────────────┐
  │ ✓ Request Submitted Successfully!     │
  │                                        │
  │ Request Number: REQ-20241113-0001      │
  │ Status: Pending HR Processing          │
  │                                        │
  │ You will receive email notifications   │
  │ at each stage of the approval process. │
  └────────────────────────────────────────┘
```

**Meanwhile, in the background:**

```
Email Service (Resend API):
    ↓
Sends email to all HR Personnel:
  To: john.cruz@metrobank.com, jane.doe@metrobank.com
  Subject: "New Health Check-up Request - REQ-20241113-0001"
  Body:
    ┌────────────────────────────────────┐
    │ MetroExecuCare                     │
    │                                    │
    │ A new request has been submitted:  │
    │                                    │
    │ Employee: Maria Santos             │
    │ Request: REQ-20241113-0001         │
    │ Type: Letter of Approval           │
    │ Hospital: Makati Medical Center    │
    │ Date: December 15, 2024            │
    │                                    │
    │ [VIEW REQUEST]  ← Link to system  │
    └────────────────────────────────────┘
    ↓
John Cruz receives email and can now claim the request
```

---

## Database Design with Examples

### Understanding Databases: The Filing Cabinet Analogy

**Imagine a huge filing cabinet with multiple drawers:**
- Each **drawer** = Table (e.g., Users table, Requests table)
- Each **folder in drawer** = Row (e.g., one user, one request)
- Each **label on folder** = Column (e.g., Name, Email, Status)
- **Cross-references** = Relationships (e.g., "This request belongs to that user")

---

### Table 1: users (The People Using the System)

**Purpose:** Store everyone who can access the system

**Real-Life Example:**

```
┌────┬─────────────┬──────────────────────────┬────────────────┬──────────────┬──────────┬──────────┬─────────────┐
│ ID │ Employee ID │ Email                    │ First Name     │ Last Name    │ Role     │ Active?  │ Last Login  │
├────┼─────────────┼──────────────────────────┼────────────────┼──────────────┼──────────┼──────────┼─────────────┤
│ 1  │ EMP001      │ maria.santos@metrobank..│ Maria          │ Santos       │executive │ Yes      │ 2024-11-13  │
│ 2  │ HR001       │ john.cruz@metrobank.com  │ John           │ Cruz         │ hr       │ Yes      │ 2024-11-13  │
│ 3  │ BEN001      │ lisa.reyes@metrobank.com │ Lisa           │ Reyes        │benefits  │ Yes      │ 2024-11-12  │
│ 4  │ WEL001      │ robert.tan@metrobank.com │ Robert         │ Tan          │ welfare  │ Yes      │ 2024-11-11  │
│ 5  │ ADM001      │ admin@metrobank.com      │ System         │ Admin        │ admin    │ Yes      │ 2024-11-13  │
│ 6  │ EMP002      │ pedro.garcia@metrobank.. │ Pedro          │ Garcia       │executive │ No       │ 2024-10-20  │
└────┴─────────────┴──────────────────────────┴────────────────┴──────────────┴──────────┴──────────┴─────────────┘
                                                                                              ↑
                                                                            Pedro is deactivated (left company)
```

**Additional Fields Not Shown:**
- `password_hash`: Encrypted password (not shown for security)
- `middle_name`: Middle name
- `department`: Sales, IT, Finance, etc.
- `branch`: Makati, BGC, Ortigas, etc.
- `position`: Senior Manager, Analyst, etc.
- `contact_number`: Phone number
- `birth_date`: Date of birth
- `profile_picture`: Path to profile image

**Why These Fields?**
- **ID**: Unique number (like a barcode) to identify each person
- **Employee ID**: Company's own employee number (e.g., EMP001)
- **Email**: Login username + contact
- **Role**: Determines what they can do in the system
- **Active?**: Can they still use the system? (No = deactivated/left company)

**Real Scenario:**
```
When Maria logs in:
1. System finds her by email: maria.santos@metrobank.com
2. Checks if active: Yes ✓
3. Verifies password: Match ✓
4. Reads role: executive
5. Grants executive permissions
```

---

### Table 2: checkup_requests (The Main Request Table)

**Purpose:** Store all health check-up requests

**Real-Life Example:**

```
┌────┬───────────────────┬────────────┬─────────────┬──────────────────────┬────────────────────┬─────────────────┐
│ ID │ Request Number    │ Employee   │ Type        │ Hospital             │ Status             │ Created At      │
├────┼───────────────────┼────────────┼─────────────┼──────────────────────┼────────────────────┼─────────────────┤
│ 1  │ REQ-20241101-0001│ Maria (1)  │ LOA         │ Makati Med Center    │ completed          │ Nov 1, 9:00 AM  │
│ 2  │ REQ-20241102-0002│ Pedro (6)  │ LOAuth      │ St. Lukes            │ rejected           │ Nov 2, 10:30 AM │
│ 3  │ REQ-20241105-0003│ Maria (1)  │ LOA         │ Cardinal Santos      │ hr_processing      │ Nov 5, 2:15 PM  │
│ 4  │ REQ-20241108-0004│ Carlos (7) │ LOA         │ Asian Hospital       │ benefits_review    │ Nov 8, 11:00 AM │
│ 5  │ REQ-20241110-0005│ Ana (8)    │ LOAuth      │ Medical City         │ welfare_review     │ Nov 10, 3:45 PM │
│ 6  │ REQ-20241113-0006│ Maria (1)  │ LOA         │ Makati Med Center    │ pending            │ Nov 13, 9:00 AM │
└────┴───────────────────┴────────────┴─────────────┴──────────────────────┴────────────────────┴─────────────────┘
        ↑                     ↑            ↑               ↑                     ↑                      ↑
    Unique ID         Links to users   LOA or      Which hospital        Current stage      When submitted
                                      LOAuth
```

**More Hidden Fields:**
- `preferred_date`: When employee wants check-up (e.g., Dec 15, 2024)
- `letter_purpose`: Why they need check-up (text description)
- `assigned_hr_id`: Which HR person is handling it (links to users table)
- `assigned_benefits_id`: Which Benefits Officer reviewing (links to users table)
- `assigned_welfare_id`: Which Welfare Head reviewing (links to users table)
- `rejected_by`: Who rejected it (if rejected)
- `rejection_reason`: Why it was rejected
- `completed_at`: When it was completed
- `priority_level`: low, normal, high, urgent

**Request Lifecycle Example (Request ID: 1):**

```
Timeline for REQ-20241101-0001 (Maria's first request):

Nov 1, 9:00 AM   → Status: pending
                   Maria submitted request

Nov 1, 2:00 PM   → Status: hr_processing
                   John Cruz (HR) claimed it

Nov 2, 10:00 AM  → Status: benefits_review
                   John processed to Benefits
                   Lisa Reyes reviewing

Nov 2, 3:00 PM   → Status: welfare_review
                   Lisa approved
                   Robert Tan reviewing

Nov 3, 11:00 AM  → Status: hr_final_verification
                   Robert approved
                   Back to John Cruz for final check

Nov 3, 4:00 PM   → Status: completed
                   John completed verification
                   All documents sent to Maria ✓
```

**Request Number Format:**
```
REQ-20241101-0001
│   │        │
│   │        └─ Sequential number (1st request of the day)
│   └────────── Date: November 1, 2024
└──────────────── Prefix: REQ (for Request)

Makes it easy to:
- Sort chronologically
- Identify quickly
- Track in conversations ("Where is REQ-20241101-0001?")
```

---

### Table 3: request_files (Uploaded Documents)

**Purpose:** Store information about all uploaded files

**Real-Life Example:**

```
┌────┬────────────┬─────────────────────────────┬──────────────────────────┬─────────┬──────────────────────┬────────────────┬────────────────┐
│ ID │ Request ID │ Stored Filename             │ Original Filename        │ Size    │ Category             │ Uploaded By    │ Upload Time    │
├────┼────────────┼─────────────────────────────┼──────────────────────────┼─────────┼──────────────────────┼────────────────┼────────────────┤
│ 1  │ 1          │ 1699876543-abc123.pdf       │ medical_history.pdf      │ 2.3 MB  │ supporting_document  │ Maria (1)      │ Nov 1, 9:05 AM │
│ 2  │ 1          │ 1699876789-def456.pdf       │ previous_checkup.pdf     │ 1.8 MB  │ supporting_document  │ Maria (1)      │ Nov 1, 9:06 AM │
│ 3  │ 1          │ 1699890123-ghi789.docx      │ hr_form.docx             │ 0.5 MB  │ supporting_document  │ John (2)       │ Nov 1, 2:20 PM │
│ 4  │ 1          │ 1699910456-jkl012.pdf       │ benefits_cert.pdf        │ 0.8 MB  │ supporting_document  │ Lisa (3)       │ Nov 2, 10:15 AM│
│ 5  │ 1          │ 1699920789-mno345.pdf       │ LOA_Maria_Santos.pdf     │ 1.2 MB  │ letter_of_approval   │ John (2)       │ Nov 3, 4:05 PM │
│ 6  │ 6          │ 1699950123-pqr678.pdf       │ lab_results.pdf          │ 3.1 MB  │ supporting_document  │ Maria (1)      │ Nov 13, 9:10 AM│
└────┴────────────┴─────────────────────────────┴──────────────────────────┴─────────┴──────────────────────┴────────────────┴────────────────┘
         ↑               ↑                             ↑                        ↑              ↑                    ↑                ↑
    Unique ID    Links to request      What user sees         Actual size    File type       Who uploaded      When uploaded
```

**Why Two Filenames?**

**Original Filename** (`medical_history.pdf`):
- User-friendly name
- Displayed to users
- Easy to identify

**Stored Filename** (`1699876543-abc123.pdf`):
- Prevents conflicts (two users upload same filename)
- Security (hides actual filename from URLs)
- Timestamp included (1699876543 = Unix timestamp)
- Random string (abc123 = prevents guessing)

**File Categories:**
1. **supporting_document**: Documents uploaded by anyone to support the request
2. **letter_of_approval**: The official LOA document (generated by system)
3. **letter_of_authorization**: The official LOAuth document (generated by system)
4. **additional_document**: Extra documents requested later

**Real Scenario - Request ID 1 (Maria's completed request):**
```
Maria can download:
✓ medical_history.pdf (her upload)
✓ previous_checkup.pdf (her upload)
✓ hr_form.docx (uploaded by HR)
✓ benefits_cert.pdf (uploaded by Benefits)
✓ LOA_Maria_Santos.pdf (official letter - the goal!)

Total: 5 files, 6.6 MB

System tracks:
- Who uploaded each file
- When it was uploaded
- How many times downloaded
- If file is still active (or deleted)
```

---

### Table 4: request_approvals (Approval Tracking)

**Purpose:** Track each approval stage and its status

**Real-Life Example for Request ID: 1**

```
┌────┬────────────┬────────────────┬───────────────────┬─────────┬──────────────┬─────────────────┬──────────────────────┐
│ ID │ Request ID │ Approval Stage │ Required Role     │ Action  │ Approved By  │ Action Date     │ Comments             │
├────┼────────────┼────────────────┼───────────────────┼─────────┼──────────────┼─────────────────┼──────────────────────┤
│ 1  │ 1          │ hr_stage       │ hr_personnel      │approved │ John (2)     │ Nov 1, 2:30 PM  │ Documents verified   │
│ 2  │ 1          │ benefits_stage │ benefits_officer  │approved │ Lisa (3)     │ Nov 2, 3:00 PM  │ Eligible for benefit │
│ 3  │ 1          │ welfare_stage  │ welfare_head      │approved │ Robert (4)   │ Nov 3, 11:30 AM │ Policy compliant     │
│ 4  │ 1          │ hr_final_stage │ hr_personnel      │approved │ John (2)     │ Nov 3, 4:00 PM  │ Final verification OK│
└────┴────────────┴────────────────┴───────────────────┴─────────┴──────────────┴─────────────────┴──────────────────────┘

Result: All stages approved ✓ → Request completed!
```

**Real-Life Example for Request ID: 2 (Rejected)**

```
┌────┬────────────┬────────────────┬───────────────────┬─────────┬──────────────┬─────────────────┬───────────────────────────────┐
│ ID │ Request ID │ Approval Stage │ Required Role     │ Action  │ Approved By  │ Action Date     │ Comments                      │
├────┼────────────┼────────────────┼───────────────────┼─────────┼──────────────┼─────────────────┼───────────────────────────────┤
│ 5  │ 2          │ hr_stage       │ hr_personnel      │approved │ Jane (9)     │ Nov 2, 11:00 AM │ Processed                     │
│ 6  │ 2          │ benefits_stage │ benefits_officer  │rejected │ Lisa (3)     │ Nov 2, 2:00 PM  │ Not eligible - probation period│
│ 7  │ 2          │ welfare_stage  │ welfare_head      │skipped  │ -            │ -               │ -                             │
│ 8  │ 2          │ hr_final_stage │ hr_personnel      │skipped  │ -            │ -               │ -                             │
└────┴────────────┴────────────────┴───────────────────┴─────────┴──────────────┴─────────────────┴───────────────────────────────┘
                                                            ↑
                                                    Rejected at Benefits stage
                                                    → Remaining stages skipped
                                                    → Workflow ends
```

**Approval Actions:**
- **pending**: Waiting for approval
- **approved**: Stage approved, move to next
- **rejected**: Stage rejected, workflow ends
- **skipped**: Stage not reached (previous stage rejected)

**Real Scenario:**
```
When Lisa (Benefits Officer) reviews Request ID: 2:

1. System checks: Is this benefits_stage?
   → Yes ✓

2. System checks: Is Lisa a benefits_officer?
   → Yes ✓

3. Lisa clicks "Reject" and types:
   "Not eligible - employee still in probation period"

4. System updates:
   - request_approvals table: action = 'rejected', comments = "Not eligible..."
   - checkup_requests table: current_status = 'rejected'

5. System sends emails to:
   - Pedro (employee): "Your request was rejected..."
   - Jane (HR): "Request you processed was rejected..."
   - Lisa (Benefits): "You rejected request REQ-20241102-0002"

6. Workflow ends (no further stages)
```

---

### Table 5: activity_logs (Complete Audit Trail)

**Purpose:** Record every action in the system (like security cameras)

**Real-Life Example:**

```
┌────┬─────────┬────────────────┬──────────────────────────────────────────────────────┬─────────────────┬──────────────┐
│ ID │ User ID │ Action Type    │ Action Description                                   │ Related Entity  │ Timestamp    │
├────┼─────────┼────────────────┼──────────────────────────────────────────────────────┼─────────────────┼──────────────┤
│ 1  │ 1       │ login          │ User logged in from Chrome browser                   │ -               │ Nov 1, 8:55  │
│ 2  │ 1       │ create_request │ Created request REQ-20241101-0001                    │ request:1       │ Nov 1, 9:00  │
│ 3  │ 1       │ upload_file    │ Uploaded medical_history.pdf to request 1            │ file:1          │ Nov 1, 9:05  │
│ 4  │ 2       │ login          │ User logged in from Firefox browser                  │ -               │ Nov 1, 1:55  │
│ 5  │ 2       │ claim_request  │ Claimed request REQ-20241101-0001                    │ request:1       │ Nov 1, 2:00  │
│ 6  │ 2       │ upload_file    │ Uploaded hr_form.docx to request 1                   │ file:3          │ Nov 1, 2:20  │
│ 7  │ 2       │ process_request│ Processed request 1 to Benefits stage                │ request:1       │ Nov 1, 2:30  │
│ 8  │ 3       │ login          │ User logged in from Chrome browser                   │ -               │ Nov 2, 9:50  │
│ 9  │ 3       │ view_request   │ Viewed request REQ-20241101-0001 details             │ request:1       │ Nov 2, 10:00 │
│ 10 │ 3       │ approve_request│ Approved request 1 at benefits_stage                 │ request:1       │ Nov 2, 3:00  │
│ 11 │ 4       │ approve_request│ Approved request 1 at welfare_stage                  │ request:1       │ Nov 3, 11:30 │
│ 12 │ 2       │ complete_req   │ Completed request REQ-20241101-0001                  │ request:1       │ Nov 3, 4:00  │
│ 13 │ 1       │ download_file  │ Downloaded LOA_Maria_Santos.pdf from request 1       │ file:5          │ Nov 3, 4:10  │
│ 14 │ 1       │ logout         │ User logged out                                      │ -               │ Nov 3, 4:15  │
└────┴─────────┴────────────────┴──────────────────────────────────────────────────────┴─────────────────┴──────────────┘
```

**Why Activity Logs are Important:**

**Scenario 1 - Accountability:**
```
Question: "Who approved Maria's request at Benefits stage?"
Answer: Look at activity_logs
  → User ID 3 (Lisa Reyes) on Nov 2 at 3:00 PM
```

**Scenario 2 - Security Audit:**
```
Question: "Did anyone access Pedro's rejected request?"
Answer: Search activity_logs for request_id = 2
  → Shows exactly who viewed, when, and from where
```

**Scenario 3 - Troubleshooting:**
```
Problem: "Maria says she never received her approval letter"
Investigation: Check activity_logs
  → Nov 3, 4:00 PM: John completed request (system generated letter)
  → Nov 3, 4:05 PM: System sent email to maria.santos@metrobank.com
  → Nov 3, 4:10 PM: Maria downloaded the letter
Conclusion: Maria DID receive and download it!
```

**Scenario 4 - Compliance:**
```
Audit Question: "Show me all actions taken on executive requests in October"
Answer: Query activity_logs
  → Filter by action_type LIKE '%request%'
  → Filter by timestamp between Oct 1-31
  → Export to Excel for auditor
  → Complete transparency ✓
```

---

### Relationships Between Tables (How They Connect)

**Think of it like a family tree:**

```
users table
  ├─── One user can have MANY requests (1:M relationship)
  │    └─── checkup_requests table
  │           ├─── One request can have MANY files (1:M relationship)
  │           │    └─── request_files table
  │           │
  │           ├─── One request has MANY approval stages (1:M relationship)
  │           │    └─── request_approvals table
  │           │
  │           └─── One request can have MANY file requests (1:M relationship)
  │                └─── file_requests table
  │
  └─── One user performs MANY actions (1:M relationship)
       └─── activity_logs table

hospitals table
  └─── One hospital can be used in MANY requests (1:M relationship)
       └─── checkup_requests table

departments table
  └─── One department has MANY users (1:M relationship)
       └─── users table

branches table
  └─── One branch has MANY users (1:M relationship)
       └─── users table
```

**Real Example:**

```
Maria Santos (User ID: 1)
│
├─── Request 1: REQ-20241101-0001 (completed)
│    ├─── File 1: medical_history.pdf
│    ├─── File 2: previous_checkup.pdf
│    ├─── Approval 1: HR Stage ✓
│    ├─── Approval 2: Benefits Stage ✓
│    ├─── Approval 3: Welfare Stage ✓
│    └─── Approval 4: HR Final Stage ✓
│
├─── Request 3: REQ-20241105-0003 (hr_processing)
│    ├─── File 6: recent_labs.pdf
│    └─── Approval 1: HR Stage (in progress)
│
├─── Request 6: REQ-20241113-0006 (pending)
│    └─── File 10: medical_cert.pdf
│
└─── Activity Logs (14 recorded actions)
     ├─── Logged in 5 times
     ├─── Created 3 requests
     ├─── Uploaded 4 files
     └─── Downloaded 2 files
```

**How System Uses Relationships:**

**Query: "Show me all Maria's requests"**
```sql
1. Find Maria in users table
   → User ID: 1

2. Find all requests where employee_id = 1
   → Request IDs: 1, 3, 6

3. For each request, get files where request_id IN (1, 3, 6)
   → Files: 1, 2, 6, 10

4. For each request, get approvals where request_id IN (1, 3, 6)
   → Approvals: 1, 2, 3, 4 (for request 1), etc.

Result: Complete picture of all Maria's requests with files and approval status
```

---

## Workflow Process with Real Scenarios

### Complete Workflow: Maria's Journey

Let's follow Maria Santos from start to finish with her health check-up request.

---

#### Day 1 - Monday, November 1, 2024

**8:55 AM - Maria Arrives at Office**

Maria is a Senior Manager at Metrobank. It's time for her annual executive health check-up. In the past, she would need to:
- Fill out paper forms
- Print medical documents
- Walk to HR department
- Submit physically
- Wait with no visibility

Now, with MetroExecuCare, it's much easier!

**9:00 AM - Maria Submits Request**

```
Maria opens laptop → Types: metroexecucare.com
    ↓
Clicks "Login"
    ↓
Enters credentials:
  Email: maria.santos@metrobank.com
  Password: (her secure password)
    ↓
Dashboard loads: "Welcome, Maria Santos!"
    ↓
Clicks big blue button: "Submit New Request"
    ↓
Form appears with fields:

  1. Request Type:
     ○ Letter of Approval (LOA)      ← Maria selects this
     ○ Letter of Authorization (LOAuth)

     Explanation box shows:
     "LOA is for regular annual check-ups at accredited hospitals.
      Choose this if you're getting your routine health screening."

  2. Preferred Hospital:
     [Dropdown menu ▼]
     - Makati Medical Center          ← Maria selects this
     - St. Luke's Medical Center
     - Cardinal Santos Medical Center
     - Asian Hospital and Medical Center
     - The Medical City

  3. Preferred Check-up Date:
     [Calendar picker 📅]
     Maria clicks and selects: December 15, 2024
     (System validates: Must be future date ✓)

  4. Purpose of Letter:
     [Text box - 10 to 1000 characters]
     Maria types:
     "Annual executive health check-up as required by company policy.
      This is my yearly wellness screening which includes:
      - Complete blood count
      - Lipid panel
      - Chest X-ray
      - ECG
      - Physical examination"

  5. Upload Supporting Documents:
     [Choose Files button]
     Maria clicks and selects:
     - medical_history.pdf (her past medical records)
     - previous_checkup_results.pdf (last year's results)

     System shows upload progress:
     medical_history.pdf: ████████████ 100% (2.3 MB)
     previous_checkup_results.pdf: ████████████ 100% (1.8 MB)

     ✓ Both files uploaded successfully!
    ↓
Maria reviews everything one last time
    ↓
Clicks bright green button: "Submit Request"
    ↓
System shows loading spinner for 2 seconds...
    ↓
Success message appears:
┌────────────────────────────────────────────────┐
│ ✓ Request Submitted Successfully!             │
│                                                │
│ Request Number: REQ-20241101-0001              │
│                                                │
│ Your request has been submitted for processing.│
│ You will receive email notifications at each   │
│ stage of the approval process.                 │
│                                                │
│ [Track Status] [View Details] [Done]          │
└────────────────────────────────────────────────┘
```

**Behind the Scenes (What Happened in 2 Seconds):**

```
1. System validated all fields ✓
2. Generated unique request number: REQ-20241101-0001
3. Saved request to database (status: pending)
4. Uploaded 2 files to secure storage
5. Created 4 approval stage records (hr, benefits, welfare, hr_final)
6. Logged activity: "Maria created request REQ-20241101-0001"
7. Sent email to all 3 HR Personnel:
   - john.cruz@metrobank.com
   - jane.doe@metrobank.com
   - mark.santos@metrobank.com
8. Displayed success message to Maria
```

**9:05 AM - Maria Checks Status Tracker**

```
Maria clicks "Track Status"
    ↓
Beautiful timeline appears:
┌──────────────────────────────────────────────────────┐
│ Request: REQ-20241101-0001                           │
│ Status: Pending HR Processing                        │
│                                                      │
│ Timeline:                                            │
│                                                      │
│ ✓ Submitted          Nov 1, 9:00 AM                 │
│   └─ By you                                          │
│                                                      │
│ ○ HR Processing      Pending                        │
│   └─ Waiting for HR Personnel to claim              │
│                                                      │
│ ○ Benefits Review    Not Started                    │
│                                                      │
│ ○ Welfare Review     Not Started                    │
│                                                      │
│ ○ HR Final Check     Not Started                    │
│                                                      │
│ ○ Completed          Not Started                    │
│                                                      │
│ [Request Additional Files] [View Documents]         │
└──────────────────────────────────────────────────────┘
```

Maria feels relieved! She can see exactly where her request is. She closes her laptop and continues her work.

**9:10 AM - HR Personnel Receive Emails**

John Cruz, an HR Personnel, checks his email:

```
──────────────────────────────────────────────────
From: MetroExecuCare <notifications@metroexecucare.xyz>
To: john.cruz@metrobank.com
Subject: New Health Check-up Request - REQ-20241101-0001
──────────────────────────────────────────────────

Hi John,

A new executive health check-up request has been submitted and is ready for processing.

Request Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Request Number: REQ-20241101-0001
Employee: Maria Santos (EMP001)
Department: Sales
Position: Senior Manager
Request Type: Letter of Approval (LOA)
Preferred Hospital: Makati Medical Center
Preferred Date: December 15, 2024
Documents: 2 files uploaded
Submitted: November 1, 2024 at 9:00 AM

Purpose:
"Annual executive health check-up as required by company policy..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[VIEW REQUEST] ← Click here to process
──────────────────────────────────────────────────
```

John sees the email but he's in a meeting. He'll handle it after lunch.

---

**1:55 PM - John Cruz Starts His Shift**

```
John logs into MetroExecuCare
    ↓
Sees HR Dashboard:
┌────────────────────────────────────────┐
│ HR Dashboard                           │
│                                        │
│ Pending Requests: 5                    │
│ My Active Requests: 3                  │
│ Completed This Month: 12               │
│                                        │
│ [View Pending Requests]                │
└────────────────────────────────────────┘
    ↓
Clicks "View Pending Requests"
    ↓
Table appears with 5 pending requests:
┌─────────────────────┬────────────────┬──────────────┬─────────────────────┬──────────┐
│ Request Number      │ Employee       │ Type         │ Submitted           │ Action   │
├─────────────────────┼────────────────┼──────────────┼─────────────────────┼──────────┤
│ REQ-20241031-0015   │ Pedro Garcia   │ LOAuth       │ Oct 31, 4:00 PM     │ [Claim]  │
│ REQ-20241101-0001   │ Maria Santos   │ LOA          │ Nov 1, 9:00 AM      │ [Claim]  │ ← This one
│ REQ-20241101-0002   │ Carlos Reyes   │ LOA          │ Nov 1, 10:30 AM     │ [Claim]  │
│ REQ-20241101-0003   │ Ana Cruz       │ LOAuth       │ Nov 1, 2:00 PM      │ [Claim]  │
│ REQ-20241101-0004   │ Luis Santos    │ LOA          │ Nov 1, 3:15 PM      │ [Claim]  │
└─────────────────────┴────────────────┴──────────────┴─────────────────────┴──────────┘
```

**2:00 PM - John Claims Maria's Request**

```
John clicks [Claim] button on REQ-20241101-0001
    ↓
Confirmation popup:
┌───────────────────────────────────────────┐
│ Claim Request?                            │
│                                           │
│ You are about to claim this request.     │
│ Once claimed, only you can process it.   │
│                                           │
│ [Cancel] [Yes, Claim It]                 │
└───────────────────────────────────────────┘
    ↓
John clicks "Yes, Claim It"
    ↓
System updates:
  - Request status: pending → hr_processing
  - Assigned HR: John Cruz (User ID: 2)
  - Request removed from "Pending" list
  - Request added to "My Active Requests"
    ↓
Success message: "✓ Request claimed successfully!"
    ↓
Request details page opens automatically
```

**2:05 PM - John Reviews the Request**

```
John sees complete request details:
┌──────────────────────────────────────────────────────────────┐
│ Request: REQ-20241101-0001                                   │
│ Status: HR Processing (You)                                  │
│                                                              │
│ EMPLOYEE INFORMATION                                         │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Name: Maria Santos                                           │
│ Employee ID: EMP001                                          │
│ Email: maria.santos@metrobank.com                           │
│ Department: Sales                                            │
│ Branch: Makati Branch                                        │
│ Position: Senior Manager                                     │
│                                                              │
│ REQUEST DETAILS                                              │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Type: Letter of Approval (LOA)                               │
│ Preferred Hospital: Makati Medical Center                    │
│ Preferred Date: December 15, 2024                            │
│ Purpose: "Annual executive health check-up as required..."   │
│                                                              │
│ UPLOADED DOCUMENTS (2)                                       │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ 1. medical_history.pdf (2.3 MB)                              │
│    Uploaded by: Maria Santos on Nov 1, 9:05 AM               │
│    [Download] [Preview]                                      │
│                                                              │
│ 2. previous_checkup_results.pdf (1.8 MB)                     │
│    Uploaded by: Maria Santos on Nov 1, 9:06 AM               │
│    [Download] [Preview]                                      │
│                                                              │
│ HR ACTIONS                                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│ Assign Hospital: [Makati Medical Center ▼]                  │
│                                                              │
│ Upload Documents:                                            │
│ [Choose Files] [Upload]                                      │
│                                                              │
│ Comments:                                                    │
│ [Text box]                                                   │
│                                                              │
│ [Request Additional Files from Employee]                     │
│ [Process to Benefits] [Release Request]                      │
└──────────────────────────────────────────────────────────────┘
```

John reviews Maria's documents:
- Opens `medical_history.pdf` - looks good, comprehensive history
- Opens `previous_checkup_results.pdf` - last year's results, all normal

John thinks: "Everything looks in order. Maria chose Makati Medical Center, which is accredited. I'll confirm that hospital and process this to Benefits."

**2:15 PM - John Processes the Request**

```
John's actions:
1. Confirms hospital: Makati Medical Center (already selected by Maria)
2. Uploads HR internal form: "hr_processing_form.docx"
3. Types in comments: "Documents verified. Employee eligible. Ready for benefits review."
4. Clicks "Process to Benefits"
    ↓
Confirmation popup:
┌───────────────────────────────────────────┐
│ Process to Benefits?                      │
│                                           │
│ This will move the request to Benefits    │
│ review stage. You cannot undo this.       │
│                                           │
│ [Cancel] [Yes, Process]                   │
└───────────────────────────────────────────┘
    ↓
John clicks "Yes, Process"
    ↓
System processing (2 seconds):
  1. Update request status: hr_processing → benefits_review
  2. Update HR approval: action = 'approved', comments saved
  3. Update benefits approval: is_current_stage = true
  4. Log activity: "John processed REQ-20241101-0001 to Benefits"
  5. Send email to all Benefits Officers (Lisa, Mike, Sarah)
  6. Send notification to Maria
    ↓
Success message: "✓ Request processed to Benefits successfully!"
```

**2:20 PM - Maria Receives Email Notification**

```
──────────────────────────────────────────────────
From: MetroExecuCare <notifications@metroexecucare.xyz>
To: maria.santos@metrobank.com
Subject: Status Update - REQ-20241101-0001
──────────────────────────────────────────────────

Hi Maria,

Your health check-up request has been updated.

Request: REQ-20241101-0001
Status: Benefits Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your request has been processed by the HR department and
is now being reviewed by the Benefits team for eligibility
verification.

Processed by: John Cruz (HR Personnel)
Date: November 1, 2024 at 2:15 PM
Comments: "Documents verified. Employee eligible. Ready for benefits review."

You will receive another notification once the Benefits
review is complete.

[VIEW REQUEST STATUS]
──────────────────────────────────────────────────
```

Maria sees the email notification pop up on her phone. She smiles - the process is moving along nicely!

---

#### Day 2 - Tuesday, November 2, 2024

**9:50 AM - Lisa Reyes (Benefits Officer) Logs In**

```
Lisa is a Benefits Officer. She checks her dashboard:

┌────────────────────────────────────────┐
│ Benefits Dashboard                     │
│                                        │
│ Pending My Review: 7                   │
│ Approved This Week: 15                 │
│ Rejected This Week: 2                  │
│                                        │
│ [View Pending Reviews]                 │
└────────────────────────────────────────┘
    ↓
Clicks "View Pending Reviews"
    ↓
Sees list of 7 requests waiting for her:
┌─────────────────────┬────────────────┬─────────────────────┬──────────┐
│ Request Number      │ Employee       │ Processed by HR     │ Action   │
├─────────────────────┼────────────────┼─────────────────────┼──────────┤
│ REQ-20241029-0012   │ Ramon Diaz     │ Oct 30, 3:00 PM     │ [Review] │
│ REQ-20241031-0015   │ Pedro Garcia   │ Nov 1, 11:00 AM     │ [Review] │
│ REQ-20241101-0001   │ Maria Santos   │ Nov 1, 2:15 PM      │ [Review] │ ← This one
│ REQ-20241101-0002   │ Carlos Reyes   │ Nov 1, 4:00 PM      │ [Review] │
│ ... (3 more)        │                │                     │          │
└─────────────────────┴────────────────┴─────────────────────┴──────────┘
```

**10:00 AM - Lisa Reviews Maria's Request**

```
Lisa clicks [Review] on REQ-20241101-0001
    ↓
Request details load:
┌──────────────────────────────────────────────────────────────┐
│ Request: REQ-20241101-0001                                   │
│ Status: Benefits Review (Your Stage)                         │
│                                                              │
│ EMPLOYEE: Maria Santos (EMP001)                              │
│ Position: Senior Manager                                     │
│ Department: Sales                                            │
│                                                              │
│ DOCUMENTS (3)                                                │
│ 1. medical_history.pdf - Maria Santos                        │
│ 2. previous_checkup_results.pdf - Maria Santos               │
│ 3. hr_processing_form.docx - John Cruz (HR)                  │
│                                                              │
│ APPROVAL HISTORY                                             │
│ ✓ HR Stage - Approved by John Cruz on Nov 1, 2:15 PM        │
│   "Documents verified. Employee eligible."                   │
│                                                              │
│ YOUR ACTION                                                  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│ Upload Supporting Documents (optional):                      │
│ [Choose Files] [Upload]                                      │
│                                                              │
│ Comments:                                                    │
│ [Text box - optional for approval, required for rejection]  │
│                                                              │
│ [APPROVE] [REJECT]                                           │
└──────────────────────────────────────────────────────────────┘
```

Lisa's thought process:
1. Opens Maria's employee record in benefits system
2. Checks:
   - ✓ Maria is permanent employee (not probationary)
   - ✓ Maria is executive level (qualifies for LOA)
   - ✓ Maria hasn't used her annual check-up yet this year
   - ✓ Makati Medical Center is accredited
   - ✓ All requirements met!

**10:10 AM - Lisa Uploads Benefits Certificate**

```
Lisa creates a benefits eligibility certificate (PDF) and uploads it:

1. Clicks [Choose Files]
2. Selects "benefits_eligibility_Maria_Santos.pdf"
3. Clicks [Upload]
4. File uploads successfully ✓

Now there are 4 documents in the request.
```

**10:15 AM - Lisa Approves the Request**

```
Lisa types in comments:
"Benefits eligibility verified. Employee is entitled to annual
executive health check-up. Makati Medical Center is approved.
All benefits requirements met."
    ↓
Lisa clicks [APPROVE]
    ↓
Confirmation popup:
┌────────────────────────────────────────────┐
│ Approve Request?                           │
│                                            │
│ Are you sure you want to approve this      │
│ request? It will move to Welfare Review.   │
│                                            │
│ [Cancel] [Yes, Approve]                    │
└────────────────────────────────────────────┘
    ↓
Lisa clicks "Yes, Approve"
    ↓
System processing:
  1. Update benefits_approval: action = 'approved'
  2. Update request status: benefits_review → welfare_review
  3. Update welfare_approval: is_current_stage = true
  4. Log activity
  5. Send email to Welfare Head (Robert Tan)
  6. Send notification to Maria, John, and Lisa
    ↓
Success: "✓ Request approved and sent to Welfare for review!"
```

**10:20 AM - Multiple Email Notifications Sent**

**To Maria (Employee):**
```
Subject: Status Update - REQ-20241101-0001

Your request has been approved by the Benefits department!

Status: Welfare Review
Approved by: Lisa Reyes (Benefits Officer)
Comments: "Benefits eligibility verified..."

Next: Your request will be reviewed by the Welfare department
for final policy compliance.

[VIEW STATUS]
```

**To Robert Tan (Welfare Head):**
```
Subject: Request Ready for Your Review - REQ-20241101-0001

Hi Robert,

A request has been approved by Benefits and is ready for your review.

Employee: Maria Santos
Request: REQ-20241101-0001
Type: Letter of Approval
Hospital: Makati Medical Center

[REVIEW REQUEST]
```

**To John and Lisa (For Records):**
```
Subject: Update - REQ-20241101-0001 Approved by Benefits

The request you processed has been approved by Benefits
and moved to Welfare review.
```

---

#### Day 3 - Wednesday, November 3, 2024

**11:00 AM - Robert Tan (Welfare Head) Reviews Request**

```
Robert is the Welfare Head. He's responsible for final policy compliance.

He logs in and sees Maria's request waiting:
┌──────────────────────────────────────────────────────────────┐
│ Request: REQ-20241101-0001                                   │
│ Status: Welfare Review (Your Final Approval Needed)          │
│                                                              │
│ EMPLOYEE: Maria Santos                                       │
│ Request Type: Letter of Approval                             │
│ Hospital: Makati Medical Center                              │
│ Preferred Date: December 15, 2024                            │
│                                                              │
│ DOCUMENTS (4)                                                │
│ 1. medical_history.pdf - Maria                               │
│ 2. previous_checkup_results.pdf - Maria                      │
│ 3. hr_processing_form.docx - John (HR)                       │
│ 4. benefits_eligibility_Maria_Santos.pdf - Lisa (Benefits)   │
│                                                              │
│ APPROVAL HISTORY                                             │
│ ✓ HR Stage - Approved by John Cruz                           │
│   "Documents verified. Employee eligible."                   │
│                                                              │
│ ✓ Benefits Stage - Approved by Lisa Reyes                    │
│   "Benefits eligibility verified. All requirements met."     │
│                                                              │
│ YOUR DECISION                                                │
│ [APPROVE] [REJECT]                                           │
└──────────────────────────────────────────────────────────────┘
```

Robert's review process:
1. Checks company budget for health check-ups: ✓ Budget available
2. Verifies company policy compliance: ✓ Follows all guidelines
3. Reviews previous approvals: ✓ Both HR and Benefits approved
4. Checks employee welfare history: ✓ Good standing, no issues

**11:25 AM - Robert Uploads Welfare Approval Memo**

```
Robert creates an official welfare approval memo and uploads it.

Now there are 5 documents total.
```

**11:30 AM - Robert Approves (Final Executive Approval!)**

```
Robert types comments:
"Final welfare approval granted. Request complies with company
wellness policy. Budget allocated. Approved for processing."
    ↓
Robert clicks [APPROVE]
    ↓
System processing:
  1. Update welfare_approval: action = 'approved'
  2. Update request status: welfare_review → hr_final_verification
  3. Update hr_final_approval: is_current_stage = true
  4. Log activity
  5. Send email to John Cruz (original HR person)
  6. Send notification to Maria, Lisa, Robert
    ↓
Success: "✓ Request approved! Sent back to HR for final verification."
```

**11:35 AM - John Receives Email**

```
Subject: Request Ready for Final Verification - REQ-20241101-0001

Hi John,

Great news! The request you processed has been approved by both
Benefits and Welfare.

Request: REQ-20241101-0001
Employee: Maria Santos
Status: Ready for Final Verification

Please complete the final verification and generate the approval letter.

[COMPLETE VERIFICATION]
```

---

**3:50 PM - John Does Final Verification**

```
John returns to the request (now in hr_final_verification stage):

┌──────────────────────────────────────────────────────────────┐
│ Request: REQ-20241101-0001                                   │
│ Status: HR Final Verification (You)                          │
│                                                              │
│ 🎉 All approvals received!                                   │
│                                                              │
│ COMPLETE APPROVAL CHAIN                                      │
│ ✓ HR Stage - You (John Cruz) - Nov 1, 2:15 PM               │
│ ✓ Benefits - Lisa Reyes - Nov 2, 10:15 AM                   │
│ ✓ Welfare - Robert Tan - Nov 3, 11:30 AM                    │
│ → Final Verification - Pending your completion               │
│                                                              │
│ DOCUMENTS (5)                                                │
│ 1. medical_history.pdf                                       │
│ 2. previous_checkup_results.pdf                              │
│ 3. hr_processing_form.docx                                   │
│ 4. benefits_eligibility_Maria_Santos.pdf                     │
│ 5. welfare_approval_memo.pdf                                 │
│                                                              │
│ FINAL VERIFICATION ACTIONS                                   │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │
│                                                              │
│ Generate Official Letter:                                    │
│ [Generate LOA Letter]  ← Click to create official document   │
│                                                              │
│ Additional Documents:                                        │
│ [Upload Files]                                               │
│                                                              │
│ File Management:                                             │
│ [Delete Files] (You have permission to delete any file)      │
│                                                              │
│ Final Comments:                                              │
│ [Text box]                                                   │
│                                                              │
│ [COMPLETE REQUEST]                                           │
└──────────────────────────────────────────────────────────────┘
```

**3:55 PM - John Generates the Official Letter**

```
John clicks [Generate LOA Letter]
    ↓
Modal popup appears:
┌────────────────────────────────────────┐
│ Generate Letter of Approval            │
│                                        │
│ Employee: Maria Santos                 │
│ Hospital: Makati Medical Center        │
│ Date: December 15, 2024                │
│                                        │
│ Preview:                               │
│ [PDF Preview showing filled letter]    │
│                                        │
│ [Cancel] [Generate & Save]             │
└────────────────────────────────────────┘
    ↓
John reviews the preview - looks perfect!
    ↓
Clicks [Generate & Save]
    ↓
System generates PDF:
  - Fills in all details from request
  - Includes company letterhead
  - Adds signatures (digital)
  - Saves as: LOA_Maria_Santos_REQ-20241101-0001.pdf
  - Adds to request files
    ↓
Success: "✓ Letter generated successfully!"

Now there are 6 documents total.
```

**4:00 PM - John Completes the Request**

```
John does final review:
- All 6 documents present ✓
- Letter generated ✓
- Everything in order ✓
    ↓
John types final comments:
"Final verification complete. All documents reviewed and approved.
Official LOA letter generated and attached."
    ↓
John clicks [COMPLETE REQUEST]
    ↓
Confirmation popup:
┌────────────────────────────────────────────┐
│ Complete Request?                          │
│                                            │
│ This will mark the request as COMPLETED    │
│ and send all documents to the employee.    │
│                                            │
│ This action CANNOT be undone.              │
│                                            │
│ [Cancel] [Yes, Complete It]                │
└────────────────────────────────────────────┘
    ↓
John clicks "Yes, Complete It"
    ↓
System processing (5 seconds):
  1. Update hr_final_approval: action = 'approved'
  2. Update request status: hr_final_verification → completed
  3. Set completed_at: Nov 3, 2024, 4:00 PM
  4. Lock all files (no more changes allowed)
  5. Log activity
  6. Prepare email with ALL 6 documents
  7. Send comprehensive email to Maria
  8. Send notification emails to John, Lisa, Robert
    ↓
Success message:
┌────────────────────────────────────────────┐
│ ✓ Request Completed Successfully!          │
│                                            │
│ REQ-20241101-0001 has been marked as       │
│ completed and all documents have been      │
│ sent to Maria Santos.                      │
│                                            │
│ [Back to Dashboard]                        │
└────────────────────────────────────────────┘
```

**4:05 PM - Maria Receives Completion Email**

```
──────────────────────────────────────────────────
From: MetroExecuCare <notifications@metroexecucare.xyz>
To: maria.santos@metrobank.com
Subject: ✓ Your Request is Complete - REQ-20241101-0001
──────────────────────────────────────────────────

Hi Maria,

Congratulations! Your health check-up request has been
completed and approved.

Request: REQ-20241101-0001
Status: COMPLETED ✓
Completion Date: November 3, 2024 at 4:00 PM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

APPROVED DETAILS:
- Hospital: Makati Medical Center
- Date: December 15, 2024
- Type: Letter of Approval (LOA)

APPROVAL CHAIN:
✓ HR Processing - John Cruz (Nov 1)
✓ Benefits Review - Lisa Reyes (Nov 2)
✓ Welfare Review - Robert Tan (Nov 3)
✓ Final Verification - John Cruz (Nov 3)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ATTACHED DOCUMENTS (6):

1. medical_history.pdf (your upload)
2. previous_checkup_results.pdf (your upload)
3. hr_processing_form.docx
4. benefits_eligibility_Maria_Santos.pdf
5. welfare_approval_memo.pdf
6. LOA_Maria_Santos_REQ-20241101-0001.pdf ⭐ YOUR OFFICIAL LETTER

You can also download all documents anytime from:
[VIEW REQUEST & DOWNLOAD DOCUMENTS]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:

1. Download your official LOA letter (attached)
2. Contact Makati Medical Center to schedule your appointment
3. Bring the LOA letter to your check-up
4. Present it at the hospital before your examination

For questions, contact HR at hr@metrobank.com

Thank you for using MetroExecuCare!
──────────────────────────────────────────────────
```

**4:10 PM - Maria Opens Email on Her Phone**

```
Maria is thrilled! She sees the email notification.

Maria's actions:
1. Opens email
2. Downloads LOA_Maria_Santos_REQ-20241101-0001.pdf
3. Opens the PDF:

   ╔══════════════════════════════════════════╗
   ║                                          ║
   ║         [Metrobank Logo]                 ║
   ║                                          ║
   ║      LETTER OF APPROVAL                  ║
   ║                                          ║
   ║  Date: November 3, 2024                  ║
   ║  Request No: REQ-20241101-0001           ║
   ║                                          ║
   ║  TO WHOM IT MAY CONCERN:                 ║
   ║                                          ║
   ║  This is to certify that Ms. Maria       ║
   ║  Santos, Senior Manager of the Sales     ║
   ║  Department, is approved to undergo an   ║
   ║  annual executive health check-up at:    ║
   ║                                          ║
   ║  Makati Medical Center                   ║
   ║  2 Amorsolo Street, Legaspi Village      ║
   ║  Makati City                             ║
   ║                                          ║
   ║  Scheduled Date: December 15, 2024       ║
   ║                                          ║
   ║  This health check-up is authorized      ║
   ║  under the company's Executive Wellness  ║
   ║  Program and all costs will be billed    ║
   ║  directly to Metrobank.                  ║
   ║                                          ║
   ║  Thank you for your attention.           ║
   ║                                          ║
   ║  Approved by:                            ║
   ║  John Cruz - HR Personnel                ║
   ║  Lisa Reyes - Benefits Officer           ║
   ║  Robert Tan - Welfare Head               ║
   ║                                          ║
   ║  [Digital Signatures]                    ║
   ║                                          ║
   ║  [QR Code for Verification]              ║
   ║                                          ║
   ╚══════════════════════════════════════════╝

4. Maria saves the PDF
5. Maria immediately calls Makati Medical Center
6. Maria schedules her appointment for Dec 15
7. Maria is done! ✓
```

---

### Summary: The Complete Journey

**Total Time: 3 days (Nov 1-3)**

**Old Paper-Based Process:**
- Estimated time: 2-3 weeks
- Required: Multiple office visits, phone calls, following up
- Visibility: Zero (no idea where request is)
- Risk: Documents lost, delayed, forgotten

**New MetroExecuCare Process:**
- Actual time: 3 days
- Required: Just login and track online
- Visibility: 100% (real-time status updates)
- Risk: Zero (everything digital, logged, tracked)

**Timeline Recap:**
```
Day 1 (Nov 1):
  9:00 AM   - Maria submits request (5 minutes)
  2:00 PM   - John claims request
  2:15 PM   - John processes to Benefits

Day 2 (Nov 2):
  10:00 AM  - Lisa reviews request
  10:15 AM  - Lisa approves (moves to Welfare)

Day 3 (Nov 3):
  11:30 AM  - Robert approves (all approvals done!)
  4:00 PM   - John completes final verification
  4:05 PM   - Maria receives her approval letter ✓
```

**Everyone Happy:**
- ✓ Maria: Got approval in 3 days, complete visibility
- ✓ John: Easy to process, all info in one place
- ✓ Lisa: Quick review, clear criteria
- ✓ Robert: Final oversight, proper compliance
- ✓ Company: Complete audit trail, efficient process

---

## Security Features Explained

(This section continues with detailed examples of JWT, RBAC, encryption, etc. - would you like me to continue with the remaining sections?)

---

**Note:** This document is already quite extensive. The remaining sections (Security, API Documentation, UI/UX, Implementation Details) will follow the same pattern of:
1. Simple explanations
2. Real-world analogies
3. Detailed examples
4. Visual representations
5. Scenario-based walkthroughs

Would you like me to continue with the complete remaining sections, or would you prefer I create the Executive Summary document first?