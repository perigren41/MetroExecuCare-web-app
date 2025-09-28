# Email Routing Issues Analysis & Fix Plan
**Date:** September 18, 2025
**Status:** 🚨 **CRITICAL ISSUES IDENTIFIED**
**Priority:** High - Email routing completely broken

---

## 🚨 **CRITICAL ISSUES FOUND**

### **Email Delivery Problems:**

#### **1. Wrong Recipients (Cross-contamination)**
- **Issue:** Executive email sent to Welfare Head (`perigrenj09@gmail.com`)
- **Issue:** Welfare Head email sent to Executive (`jomarperigren41@gmail.com`)
- **Impact:** Users receiving wrong notifications, confusion, privacy concerns

#### **2. Missing Notifications (Complete failures)**
- **HR Personnel:** `jannahmaeperigren@gmail.com` - **NO EMAIL RECEIVED**
- **Benefits Officer:** `debbieperigren@gmail.com` - **NO EMAIL RECEIVED**
- **Impact:** Critical workflow notifications not reaching intended recipients

#### **3. Workflow Sequence Broken**
- **Expected:** Executive creates request → HR notified → HR assigns → Executive notified
- **Actual:** Executive directly received "approved" notification without assignment step
- **Impact:** Users missing critical workflow steps

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Server Log Evidence:**
```bash
# What the server logged (WRONG):
✅ Email sent successfully to admin@metrobank.com  # Should be jannahmaeperigren@gmail.com
✅ Email sent successfully to admin@metrobank.com  # Should be debbieperigren@gmail.com

# What actually happened:
jomarperigren41@gmail.com ← Received "Request Approved" (Wrong content)
perigrenj09@gmail.com ← Received "Final Approval" (Wrong recipient)
jannahmaeperigren@gmail.com ← NO EMAIL (Missing)
debbieperigren@gmail.com ← NO EMAIL (Missing)
```

### **Suspected Code Issues:**

#### **1. Test Route Email Logic Problem**
- **File:** `routes/emailRoutes.js`
- **Issue:** Test notifications using admin user data instead of specified recipients
- **Evidence:** Server logs show `admin@metrobank.com` instead of test user emails

#### **2. Email Template Data Mapping**
- **File:** `services/emailService.js`
- **Issue:** User data may be incorrectly mapped in template generation
- **Evidence:** Wrong email content reaching wrong recipients

#### **3. Mock Data vs Real User Data Confusion**
- **File:** `routes/emailRoutes.js` lines 47-73
- **Issue:** Mock data may not be using actual user database records
- **Evidence:** Real emails sent but to wrong addresses

---

## 🛠️ **SPECIFIC FIXES REQUIRED**

### **Fix 1: Email Routing Logic**
**Location:** `routes/emailRoutes.js`
**Problem:**
```javascript
// Current (BROKEN):
const mockExecutive = {
  email: recipientEmail,  // This is correct
  // ... other fields from req.user (ADMIN data)
}
```
**Required Fix:** Use actual database user records, not mock admin data

### **Fix 2: Template Recipient Validation**
**Location:** `services/emailService.js`
**Problem:** Email addresses not properly validated before sending
**Required Fix:** Add recipient validation and logging

### **Fix 3: Workflow Email Integration**
**Location:** `controllers/requestWorkflowController.js`
**Problem:** Test endpoints vs real workflow email triggers mismatch
**Required Fix:** Test real workflow, not just admin test endpoints

### **Fix 4: Database User Data Fetching**
**Problem:** Mock data instead of real user records from database
**Required Fix:** Query actual users table for correct email addresses and user data

---

## 📋 **DETAILED FIX CHECKLIST**

### **Priority 1: Critical Routing Fixes**
- [ ] **Fix test notification recipient lookup** - Use actual user database records
- [ ] **Validate email addresses before sending** - Ensure correct mapping
- [ ] **Add email routing logs** - Log who should receive vs who actually receives
- [ ] **Fix template data mapping** - Ensure correct user data in templates

### **Priority 2: Workflow Integration Fixes**
- [ ] **Test real workflow endpoints** - Create actual request to trigger emails
- [ ] **Validate HR notification targeting** - Ensure ALL HR personnel get notified
- [ ] **Fix role-based email distribution** - Benefits/Welfare notifications
- [ ] **Verify email sequence order** - Assignment before approval notifications

### **Priority 3: Validation & Testing**
- [ ] **Add recipient email validation** - Prevent wrong address sending
- [ ] **Create test workflow from scratch** - Executive login → create request → full flow
- [ ] **Verify each notification step** - Check each email reaches correct recipient
- [ ] **Test error scenarios** - Invalid emails, missing users, etc.

---

## 🎯 **EXPECTED CORRECT BEHAVIOR**

### **Step 1: Executive Creates Request**
- **Trigger:** Executive submits request via `/api/requests`
- **Expected Email:** → **ALL HR Personnel** (`jannahmaeperigren@gmail.com`)
- **Template:** New Request Notification
- **Content:** "New executive checkup request requires HR attention"

### **Step 2: HR Assigns/Claims Request**
- **Trigger:** HR claims or admin assigns via workflow endpoints
- **Expected Emails:**
  - → **Executive** (`jomarperigren41@gmail.com`): "Your request assigned to [HR Name]"
  - → **Assigned HR** (`jannahmaeperigren@gmail.com`): "Request assigned to you"

### **Step 3: HR Approves Request**
- **Trigger:** HR approves at HR stage
- **Expected Emails:**
  - → **Executive** (`jomarperigren41@gmail.com`): "HR approved your request"
  - → **ALL Benefits Officers** (`debbieperigren@gmail.com`): "New request requires Benefits review"

### **Step 4: Benefits Officer Approves**
- **Trigger:** Benefits Officer approves
- **Expected Emails:**
  - → **Executive** (`jomarperigren41@gmail.com`): "Benefits approved your request"
  - → **ALL Welfare Heads** (`perigrenj09@gmail.com`): "New request requires Welfare review"

### **Step 5: Welfare Head Final Approval**
- **Trigger:** Welfare Head approves
- **Expected Emails:**
  - → **Executive** (`jomarperigren41@gmail.com`): "Request fully approved - download letters"
  - → **Assigned HR** (`jannahmaeperigren@gmail.com`): "Request approved - generate letters"

---

## 🔧 **DEBUGGING APPROACH**

### **Phase 1: Immediate Diagnosis**
1. **Check test route email logic** - Why admin email instead of specified recipients?
2. **Verify user data fetching** - Are we getting correct user records from database?
3. **Trace email routing flow** - From recipient parameter to actual SMTP delivery

### **Phase 2: Code Fixes**
1. **Fix recipient lookup logic** - Use actual database user records
2. **Update template data mapping** - Ensure correct user info in templates
3. **Add comprehensive logging** - Track email routing at each step

### **Phase 3: Integration Testing**
1. **Test each email type individually** - Verify correct recipients
2. **Test complete workflow** - End-to-end request creation to approval
3. **Verify all role notifications** - HR, Benefits, Welfare getting correct emails

---

## ⚠️ **RISKS OF CURRENT STATE**

### **User Experience Issues:**
- Users receiving wrong notifications causes confusion
- Missing notifications breaks workflow coordination
- Cross-contaminated emails create privacy concerns

### **Business Process Impact:**
- HR personnel not aware of new requests
- Benefits/Welfare officers not getting approval requests
- Executives not properly informed of workflow progress

### **System Reliability:**
- Email system appears working but delivering wrong content
- False positive testing results (emails sent but to wrong people)
- Workflow coordination completely broken

---

## 🎯 **SUCCESS CRITERIA FOR FIXES**

### **Email Routing Validation:**
- ✅ `jomarperigren41@gmail.com` receives only Executive-targeted emails
- ✅ `jannahmaeperigren@gmail.com` receives only HR-targeted emails
- ✅ `debbieperigren@gmail.com` receives only Benefits Officer-targeted emails
- ✅ `perigrenj09@gmail.com` receives only Welfare Head-targeted emails

### **Workflow Sequence Validation:**
- ✅ New request → HR notification
- ✅ Assignment → Executive + HR notifications
- ✅ HR approval → Executive + Benefits notifications
- ✅ Benefits approval → Executive + Welfare notifications
- ✅ Welfare approval → Executive + HR notifications

### **Content Accuracy:**
- ✅ Each email contains correct role-specific content
- ✅ Email templates use correct recipient user data
- ✅ No cross-contamination of email content or recipients

---

**Status:** 🚨 **CRITICAL FIXES REQUIRED BEFORE PRODUCTION**
**Next Step:** Begin systematic debugging and fixing of email routing logic
**Priority:** HIGH - Email system completely broken for intended users