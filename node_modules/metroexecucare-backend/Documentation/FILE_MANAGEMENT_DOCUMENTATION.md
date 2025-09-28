# MetroExecuCare File Management Documentation & Implementation Plan

## Document Overview
**Date:** September 15, 2025  
**Purpose:** Comprehensive documentation of File Management requirements, workflow analysis, and implementation options  
**Status:** Planning Phase  

---

## 📋 **File Process Flow Analysis**

### **Business Workflow Requirements**

The MetroExecuCare system requires a **two-document workflow** for executive checkup requests:

#### **Document Types:**
1. **Executive Request Letter** - Created by Executive using PDF template
2. **HR Approval Letter** - Created by HR, signed by all sequential approvers

#### **Detailed Process Flow:**

**Phase 1: Executive Initiation**
1. **Executive** logs into the MetroExecuCare system
2. **Downloads** PDF template:
   - `Letter of Approval Template` (for accredited hospitals)
   - `Letter of Authorization Template` (for non-accredited hospitals)
3. **Edits** the PDF template offline with specific request details
4. **Uploads** the completed request letter to the system
5. **Submits** the request through the Request Management API

**Phase 2: HR Review & Processing**
1. **HR Personnel** receives request notification
2. **Downloads & Reviews** the Executive's completed request letter
3. If **approved**, HR creates a **separate HR approval letter**
4. **Both documents** (Executive's + HR's) are made available to the next approver
5. HR moves request to **Benefits Officer** stage

**Phase 3: Sequential Approval Chain**
1. **Benefits Officer** receives both documents:
   - Executive's original request letter (read-only)
   - HR's approval letter (for signing)
2. **Benefits Officer** signs the HR approval letter
3. **Welfare Head** receives both documents:
   - Executive's original request letter (read-only)
   - HR's approval letter with Benefits signature (for final signing)
4. **Welfare Head** provides final signature on HR approval letter
5. **Completed documents** are sent back to Executive

### **Key Workflow Characteristics:**
- **Only 2 documents** throughout the entire process
- **Executive's letter** remains unchanged after upload
- **HR's letter** accumulates signatures from each approver
- **Document progression** follows the approval workflow stages
- **Final output** contains both documents with all required signatures

---

## 🗄️ **Database Schema Analysis**

### **Current Database Support:**

#### **✅ Existing `request_files` Table:**
```sql
CREATE TABLE request_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  file_type VARCHAR(100),
  file_extension VARCHAR(10),
  file_category ENUM('supporting_document', 'letter_of_approval', 'letter_of_authorization', 'additional_document') NOT NULL,
  uploaded_by INT,
  generated_by INT,
  is_active BOOLEAN DEFAULT TRUE,
  is_sent_to_executive BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP NULL,
  access_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES checkup_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);
```

#### **✅ Profile Picture Support:**
- **Controller:** `profileController.js` (fully implemented)
- **Features:** Upload, delete, file validation, automatic cleanup
- **Storage:** `uploads/profiles/` directory

#### **⚠️ Schema Updates Needed:**
```sql
-- Update file_category enum to support workflow-specific categories
ALTER TABLE request_files MODIFY COLUMN file_category ENUM(
  'template_letter_approval',        -- PDF template for Letter of Approval
  'template_letter_authorization',   -- PDF template for Letter of Authorization  
  'executive_request_letter',        -- Executive's completed request
  'hr_approval_letter',             -- HR's letter (signed by all approvers)
  'supporting_document',            -- Additional supporting documents
  'additional_document'             -- Other documents
);
```

---

## 🏗️ **Current Implementation Status**

### **✅ What EXISTS:**

#### **1. Profile Picture Management (Complete)**
- **File:** `Backend/controllers/profileController.js`
- **Routes:** `POST /api/users/profile/picture`, `DELETE /api/users/profile/picture`
- **Features:**
  - Multer configuration for file upload
  - File validation (JPEG, JPG, PNG)
  - 5MB file size limit
  - Automatic directory creation
  - Database integration
  - File cleanup on replacement

#### **2. Database Schema (Ready)**
- **Table:** `request_files` with comprehensive structure
- **Relationships:** Properly linked to `checkup_requests` and `users` tables
- **Metadata:** File paths, sizes, types, timestamps, access control

#### **3. Partial Integration (20%)**
- **File Queries:** `requestController.js` includes file counts and retrieval
- **Basic Structure:** File metadata can be stored and retrieved

### **❌ What's MISSING:**

#### **1. Core File Management API (0%)**
- No dedicated `fileController.js`
- No file-specific routes (`/api/files/`)
- No template download functionality
- No file upload for requests
- No access control for file operations

#### **2. Workflow-Specific Features (0%)**
- No PDF template management
- No file progression tracking through approval stages
- No signature management
- No file versioning for approval process

#### **3. Security & Access Control (0%)**
- No role-based file access
- No file download authentication
- No audit trail for file operations

---

## 📁 **File Storage Structure Plan**

### **Proposed Directory Structure:**
```
Backend/
  uploads/
    documents/
      files/                        # Main file storage (as specified)
        templates/                  # PDF templates for executives
          letter_of_approval.pdf
          letter_of_authorization.pdf
        requests/                   # Executive request letters
          REQ2025001_executive.pdf
          REQ2025002_executive.pdf
        approvals/                  # HR approval letters
          REQ2025001_hr_approval.pdf
          REQ2025002_hr_approval.pdf
        temp/                       # Temporary upload processing
    profiles/                       # User profile pictures (existing)
      2_1726434939_admin.jpg
```

### **File Naming Convention:**
```javascript
// Executive Request Letters
`${requestNumber}_executive.pdf`     // REQ2025001_executive.pdf

// HR Approval Letters  
`${requestNumber}_hr_approval.pdf`   // REQ2025001_hr_approval.pdf

// Templates (static)
`letter_of_approval.pdf`
`letter_of_authorization.pdf`
```

---

## 🎯 **Implementation Options Analysis**

### **Option 1: Frontend-Handled File Management (Quick Implementation)**

#### **⏱️ Time Estimate:** 2-3 hours
#### **📋 Implementation Details:**

**Backend Changes:**
```javascript
// Modify existing requestController.js
const multer = require('multer');

// Add file upload to existing createRequest endpoint
POST /api/requests + multipart/form-data
  - Accept executive_letter file
  - Store in uploads/documents/files/requests/
  - Save file path in request_files table

// Add file upload to existing approval endpoints  
PUT /api/requests/:id/approve + multipart/form-data
  - Accept hr_approval_letter file (from HR)
  - Store in uploads/documents/files/approvals/
  - Update request_files table
```

**Frontend Responsibilities:**
```javascript
// Template Downloads (Static Files)
Frontend/public/templates/
  letter_of_approval.pdf
  letter_of_authorization.pdf

// Direct download links
<a href="/templates/letter_of_approval.pdf" download>Download Template</a>

// File Upload Integration
<form encType="multipart/form-data">
  <input type="file" name="executive_letter" accept=".pdf" />
  <input type="file" name="hr_approval_letter" accept=".pdf" />
</form>
```

#### **✅ Advantages:**
- **Fast implementation** - Builds on existing request endpoints
- **Minimal code changes** - Reuses existing request workflow
- **Quick testing** - Can validate file workflow immediately
- **Lower complexity** - No new API surface area

#### **⚠️ Limitations:**
- **No dedicated file API** - Files mixed with request operations
- **Limited access control** - Basic role-based restrictions only
- **Poor file organization** - Files scattered across request endpoints
- **No advanced features** - Limited signature support, no audit trail
- **Security concerns** - Less granular file permissions

---

### **Option 2: Dedicated File Management API (Complete Solution)**

#### **⏱️ Time Estimate:** 4-6 hours
#### **📋 Implementation Details:**

**New Backend Components:**
```javascript
// 1. Create fileController.js
const fileController = {
  // Template operations
  downloadTemplate: async (req, res) => {},
  
  // Executive operations
  uploadRequestLetter: async (req, res) => {},
  
  // HR operations
  uploadApprovalLetter: async (req, res) => {},
  
  // General operations
  downloadFile: async (req, res) => {},
  listRequestFiles: async (req, res) => {},
  deleteFile: async (req, res) => {},
  
  // Advanced features
  addSignature: async (req, res) => {},
  getFileHistory: async (req, res) => {}
};

// 2. Create fileRoutes.js
// Template Management
GET /api/files/templates/:type           // Download template (approval/authorization)

// Executive Operations  
POST /api/files/upload/:requestId        // Upload completed request letter
GET /api/files/download/:requestId/:type // Download specific document type

// HR Operations
POST /api/files/hr-letter/:requestId     // Upload HR approval letter
PUT /api/files/sign/:requestId           // Add signature to HR letter

// General Operations
GET /api/files/:requestId                // List all files for request
DELETE /api/files/:fileId                // Delete file (admin only)
GET /api/files/download/:fileId          // Download specific file by ID

// Advanced Operations
GET /api/files/history/:requestId        // Get file operation history
POST /api/files/validate/:fileId         // Validate file integrity
```

**File Access Control:**
```javascript
// Role-based file access
const filePermissions = {
  executive: {
    canDownload: ['template', 'own_request_files'],
    canUpload: ['request_letter'],
    canDelete: ['own_uploaded_files']
  },
  hr_personnel: {
    canDownload: ['all_request_files'],
    canUpload: ['hr_approval_letter'],
    canDelete: ['hr_uploaded_files']
  },
  benefits_officer: {
    canDownload: ['assigned_request_files'],
    canUpload: ['signature_to_hr_letter'],
    canDelete: []
  },
  welfare_head: {
    canDownload: ['all_request_files'],
    canUpload: ['signature_to_hr_letter'],
    canDelete: []
  },
  admin: {
    canDownload: ['all_files'],
    canUpload: ['all_file_types'],
    canDelete: ['all_files']
  }
};
```

**Advanced Features:**
```javascript
// Digital Signature Support
const addTextSignature = async (fileId, signatureData) => {
  // Use pdf-lib to add text signature to PDF
  const { name, role, timestamp } = signatureData;
  // Add signature block to HR approval letter
};

// File History Tracking
const logFileOperation = async (fileId, operation, userId) => {
  // Track all file operations for audit trail
};

// File Validation
const validatePDF = async (file) => {
  // Validate PDF format and integrity
  // Check file size limits
  // Scan for malicious content
};
```

#### **✅ Advantages:**
- **Complete file management** - Dedicated API for all file operations
- **Proper access control** - Role-based permissions and file-level security
- **Advanced features** - Digital signatures, audit trails, file validation
- **Scalable architecture** - Easy to extend with new file features
- **Better organization** - Clean separation of file and request operations
- **Security focused** - Comprehensive file access controls

#### **⚠️ Disadvantages:**
- **Longer development time** - Requires more comprehensive implementation
- **Higher complexity** - More code to maintain and test
- **Additional testing** - Need to test file API independently

---

## 🔒 **Security Considerations**

### **File Upload Security:**
```javascript
// File Type Validation
const allowedTypes = ['.pdf'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

// File Content Validation
const validatePDFContent = async (file) => {
  // Use pdf-parse to validate PDF structure
  // Check for embedded scripts or malicious content
};

// Access Control
const checkFileAccess = (user, fileId, operation) => {
  // Verify user has permission for file operation
  // Check if file belongs to user's accessible requests
};
```

### **Download Security:**
```javascript
// Secure File Download
const secureFileDownload = async (req, res) => {
  // Validate user permissions
  // Generate temporary download tokens
  // Log download activities
  // Prevent direct file system access
};
```

---

## 📊 **Storage & Performance Analysis**

### **Database Storage Impact:**
```javascript
// File Metadata Storage (per file)
const fileRecord = {
  id: 4,                           // bytes
  file_name: 255,                  // bytes  
  file_path: 500,                  // bytes
  file_size: 4,                    // bytes
  // ... other metadata
  total: ~800                      // bytes per file record
};

// Storage Calculation
const storageImpact = {
  requestsPerMonth: 100,
  filesPerRequest: 2,              // Executive + HR letters
  metadataPerFile: 800,            // bytes
  monthlyMetadata: 100 * 2 * 800,  // = 160KB/month
  yearlyMetadata: 160 * 12,        // = 1.92MB/year
};
```

### **File System Storage:**
```javascript
// File Size Estimates
const fileSizes = {
  pdfTemplate: 50,                 // KB (small template)
  executiveLetter: 200,            // KB (completed form)
  hrApprovalLetter: 150,           // KB (approval with signatures)
  totalPerRequest: 350,            // KB
  monthlyStorage: 100 * 350,       // = 35MB/month
  yearlyStorage: 35 * 12,          // = 420MB/year
};
```

**Conclusion:** Storage impact is minimal for database metadata, manageable for file system storage.

---

## 🚀 **Recommendation & Next Steps**

### **Recommended Approach: Hybrid Implementation**

**Phase 1: Quick Start (Option 1)**
- **Timeline:** 2-3 hours
- **Goal:** Get file workflow operational quickly
- **Implementation:** Modify existing request endpoints for file handling
- **Scope:** Basic upload/download with existing request operations

**Phase 2: Enhancement (Option 2)**  
- **Timeline:** 4-6 hours (future development)
- **Goal:** Complete file management system
- **Implementation:** Dedicated File Management API
- **Scope:** Advanced features, security, digital signatures

### **Immediate Action Plan:**

#### **Step 1: Create Templates Directory**
```bash
mkdir -p "Backend/uploads/documents/files/templates"
mkdir -p "Backend/uploads/documents/files/requests"  
mkdir -p "Backend/uploads/documents/files/approvals"
```

#### **Step 2: Add Template Files**
- Place `letter_of_approval.pdf` in templates directory
- Place `letter_of_authorization.pdf` in templates directory

#### **Step 3: Modify Request Controller** 
- Add multer configuration for PDF uploads
- Update `createRequest` to handle file uploads
- Update approval endpoints to handle HR letter uploads
- Add file retrieval to `getRequestById`

#### **Step 4: Test File Workflow**
- Test executive file upload during request creation
- Test HR file upload during approval process
- Verify file download functionality

#### **Step 5: Documentation Update**
- Update API testing documentation with file operations
- Document file endpoints and usage examples

### **Success Criteria:**
- ✅ Executive can upload request letter during submission
- ✅ HR can upload approval letter during processing
- ✅ Approvers can download both documents
- ✅ Files are properly stored and organized
- ✅ Basic access control prevents unauthorized downloads

---

## 🎯 **Implementation Decision Required**

**Choose Implementation Approach:**

**🚀 Option A: Quick Implementation (Recommended)**
- Modify existing request endpoints
- 2-3 hours development time
- Get file workflow operational immediately
- Can enhance later with dedicated API

**🏗️ Option B: Complete Implementation**
- Build dedicated File Management API
- 4-6 hours development time  
- Full-featured file management from start
- More comprehensive but longer development

**📋 Option C: Continue with Gmail API**
- Implement file management later
- Focus on email notifications first
- Delay file workflow testing

---

## 📝 **Technical Notes**

### **Required Dependencies:**
```json
{
  "multer": "^1.4.5-lts.1",        // File upload handling
  "pdf-lib": "^1.17.1",           // PDF manipulation (for signatures)
  "pdf-parse": "^1.1.1"           // PDF content validation
}
```

### **Environment Configuration:**
```bash
# Add to .env
FILE_UPLOAD_MAX_SIZE=10485760    # 10MB
FILE_STORAGE_PATH=./uploads/documents/files
TEMPLATE_PATH=./uploads/documents/files/templates
```

### **Multer Configuration Example:**
```javascript
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents/files/requests');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const { requestNumber } = req.body;
    const filename = `${requestNumber}_executive.pdf`;
    cb(null, filename);
  }
});
```

---

**Next Action Required:** Please specify which implementation option to proceed with, or if you prefer to continue with Gmail API integration first.