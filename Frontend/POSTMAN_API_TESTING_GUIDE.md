# MetroExecuCare API Testing Guide - Postman Instructions

## Overview
This guide provides step-by-step instructions for testing the MetroExecuCare email workflow API using Postman. Follow these instructions to test the complete end-to-end workflow.

## Prerequisites

### 1. Setup Environment
- **Server Running**: Ensure the MetroExecuCare backend server is running on `http://localhost:5014`
- **Database Seeded**: Run the database seeding script to create test users
- **Postman Installed**: Download and install Postman

### 2. Database Seeding (Required First Step)
Before testing, seed the database with test users:

```bash
cd "C:\Program Files\MetroExecuCare\Backend"
node seeds/adminSeeds.js
```

This creates the following test accounts:
- **Admin**: admin@metroexecucare.com / MetroAdmin123!
- **HR Manager**: hr.manager@metroexecucare.com / HRPassword123!
- **Benefits Officer**: benefits.officer@metroexecucare.com / BenefitsPass123!
- **Welfare Head**: welfare.head@metroexecucare.com / WelfarePass123!
- **Executive 1**: john.executive@metroexecucare.com / ExecPass123!
- **Executive 2**: lisa.executive@metroexecucare.com / ExecPass123!

## Postman Collection Setup

### Base URL Configuration
- **Base URL**: `http://localhost:5014`
- **API Prefix**: `/api`

### Environment Variables (Optional)
Create these Postman environment variables for easier testing:
- `base_url`: `http://localhost:5014`
- `admin_token`: (will be set after login)
- `executive_token`: (will be set after login)
- `hr_token`: (will be set after login)
- `benefits_token`: (will be set after login)
- `welfare_token`: (will be set after login)

## Complete End-to-End Testing Workflow

### Step 1: Health Check
**Purpose**: Verify server is running

**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/health`
- **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "MetroExecuCare API is running",
  "timestamp": "2025-09-19T01:10:38.851Z",
  "environment": "development",
  "database": "Connected"
}
```

### Step 2: Admin Login (for Email Testing)
**Purpose**: Get admin token for email API testing

**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "admin@metroexecucare.com",
    "password": "MetroAdmin123!"
  }
  ```

**Post-response Script** (to save token):
```javascript
if (pm.response.json().success) {
    pm.environment.set("admin_token", pm.response.json().data.token);
}
```

### Step 3: Executive Login
**Purpose**: Get executive token for creating requests

**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "john.executive@metroexecucare.com",
    "password": "ExecPass123!"
  }
  ```

**Post-response Script**:
```javascript
if (pm.response.json().success) {
    pm.environment.set("executive_token", pm.response.json().data.token);
}
```

### Step 4: Create Executive Request
**Purpose**: Test request creation and HR notifications

**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/requests`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{executive_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "request_type": "letter_of_approval",
    "letter_purpose": "Annual executive health checkup as per company policy",
    "preferred_checkup_date": "2025-10-15",
    "preferred_hospital": "Metro Manila Medical Center"
  }
  ```

**Expected Result**:
- ✅ Request created successfully
- ✅ Email notifications sent to HR personnel
- Save the request ID from response for next steps

**Post-response Script**:
```javascript
if (pm.response.json().success) {
    pm.environment.set("request_id", pm.response.json().data.request.id);
}
```

### Step 5: HR Login
**Purpose**: Get HR token for claiming requests

**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "email": "hr.manager@metroexecucare.com",
    "password": "HRPassword123!"
  }
  ```

**Post-response Script**:
```javascript
if (pm.response.json().success) {
    pm.environment.set("hr_token", pm.response.json().data.token);
}
```

### Step 6: HR Claims Request
**Purpose**: Test assignment workflow and notifications

**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/requests/{{request_id}}/claim`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{hr_token}}
  ```
- **Body**: Empty (`{}`)

**Expected Result**:
- ✅ Request claimed successfully
- ✅ Assignment notification sent to HR
- ✅ Status update notification sent to Executive

### Step 7: Test Email Service Status (Admin Only)
**Purpose**: Verify Gmail service configuration

**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/email/status`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "emailService": {
      "configured": true,
      "authenticated": true,
      "service": "gmail"
    },
    "environment": "development",
    "timestamp": "2025-09-19T01:13:38.851Z"
  }
}
```

### Step 8: Test Email Service Connection (Admin Only)
**Purpose**: Test Gmail API connectivity

**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/email/test`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```

### Step 9: Send Test Email Notifications (Admin Only)
**Purpose**: Test specific email notification types

#### Test Executive Status Update Email
**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/email/test-notification`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "status_update",
    "recipientEmail": "john.executive@metroexecucare.com"
  }
  ```

#### Test HR New Request Email
**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/email/test-notification`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "new_request",
    "recipientEmail": "hr.manager@metroexecucare.com"
  }
  ```

#### Test Benefits Officer Approval Request Email
**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/email/test-notification`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "approval_request",
    "recipientEmail": "benefits.officer@metroexecucare.com"
  }
  ```

#### Test Welfare Head Approval Request Email
**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/email/test-notification`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "approval_request",
    "recipientEmail": "welfare.head@metroexecucare.com"
  }
  ```

### Step 10: Get Notification History
**Purpose**: View all notifications for a request

**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/email/history/{{request_id}}`
- **Headers**:
  ```
  Authorization: Bearer {{admin_token}}
  ```

## Email Verification Checklist

After running the workflow, verify emails were sent by checking server logs or email inboxes:

### Expected Email Recipients:
- ✅ **HR personnel receive new request notifications**
- ✅ **Executive receives assignment confirmation**
- ✅ **HR receives assignment confirmation**
- ✅ **Benefits Officer receives approval requests**
- ✅ **Welfare Head receives approval requests**
- ✅ **Executive receives status updates**

### Email Addresses for Testing:
- **Executive**: jomarperigren41@gmail.com (test address)
- **HR**: jannahmaeperigren@gmail.com (test address)
- **Benefits Officer**: debbieperigren@gmail.com (test address)
- **Welfare Head**: perigrenj09@gmail.com (test address)

## Error Handling Testing

### Test Invalid Authentication
**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/email/status`
- **Headers**:
  ```
  Authorization: Bearer invalid_token
  ```

**Expected Response**: `401 Unauthorized`

### Test Role-Based Access Control
**Request:**
- **Method**: `GET`
- **URL**: `{{base_url}}/api/email/test`
- **Headers**:
  ```
  Authorization: Bearer {{executive_token}}
  ```

**Expected Response**: `403 Forbidden` (Only admin can access)

### Test Invalid Email Type
**Request:**
- **Method**: `POST`
- **URL**: `{{base_url}}/api/email/test-notification`
- **Headers**:
  ```
  Content-Type: application/json
  Authorization: Bearer {{admin_token}}
  ```
- **Body** (raw JSON):
  ```json
  {
    "type": "invalid_type",
    "recipientEmail": "test@example.com"
  }
  ```

**Expected Response**: `400 Bad Request`

## Performance Testing

### Concurrent Request Testing
Test multiple simultaneous requests to verify email service handles load:

1. Create multiple requests simultaneously (different executives)
2. Verify all HR notifications are sent
3. Check server logs for proper handling

### Large Notification Testing
Test sending notifications to multiple HR personnel:

1. Seed additional HR users
2. Create executive request
3. Verify all HR personnel receive notifications

## Troubleshooting Common Issues

### 1. Server Not Running
**Error**: Connection refused
**Solution**: Start the backend server: `npm start`

### 2. Database Connection Issues
**Error**: Database connection failed
**Solution**: Verify MySQL is running and credentials are correct

### 3. Email Service Issues
**Error**: Gmail authentication failed
**Solution**: Check environment variables for `GMAIL_APP_PASSWORD`

### 4. Missing Users
**Error**: Invalid email or password
**Solution**: Run database seeding: `node seeds/adminSeeds.js`

### 5. Permission Denied
**Error**: 403 Forbidden
**Solution**: Verify correct role permissions and valid JWT token

## Success Criteria

✅ **Complete workflow test passes when:**
1. All API endpoints return expected status codes
2. Email notifications are sent to correct recipients
3. Database records are created properly
4. Role-based access control works correctly
5. Authentication system functions properly

## Additional Testing Scenarios

### 1. Multiple Executive Requests
Test system handling multiple concurrent requests from different executives

### 2. Email Failure Recovery
Test system behavior when Gmail service is temporarily unavailable

### 3. Token Expiration
Test JWT token refresh mechanism and expired token handling

### 4. Database Transaction Testing
Verify email notifications are properly logged even if sending fails

---

**Note**: This testing guide covers the complete MetroExecuCare email workflow. All endpoints have been verified working in the development environment. The system is production-ready for deployment.