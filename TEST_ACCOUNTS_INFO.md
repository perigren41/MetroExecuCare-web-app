# Test Accounts Information & Usage Guide

## 🎯 Purpose
This document contains information about the test accounts feature implemented for public demo and testing of MetroExecuCare.

---

## 📍 Access URL
**Public Test Accounts Page:** `https://metroexecucare.up.railway.app/test-accounts`

---

## 👥 Available Test Accounts

### 1. Executive Employee
- **Email:** `executive@metroexecucare.com`
- **Password:** `Executive@123`
- **Capabilities:**
  - Submit Letter of Approval requests
  - Submit Letter of Authorization requests
  - Upload supporting documents
  - Track request status
  - Download approved letters

### 2. HR Personnel
- **Email:** `hr@metroexecucare.com`
- **Password:** `HR@123`
- **Capabilities:**
  - View incoming requests
  - Claim requests
  - Process and forward to Benefits Officer
  - View processing history

### 3. Benefits Officer
- **Email:** `benefits@metroexecucare.com`
- **Password:** `Benefits@123`
- **Capabilities:**
  - Review requests from HR
  - Approve or reject requests
  - Forward to Welfare Head
  - Add review comments

### 4. Welfare Head (Division Head)
- **Email:** `welfare@metroexecucare.com`
- **Password:** `Welfare@123`
- **Capabilities:**
  - Give final approval
  - Review complete request history
  - Generate final approval letters

### 5. Administrator
- **Email:** `admin@metroexecucare.com`
- **Password:** `Admin@123`
- **Capabilities:**
  - User management
  - System monitoring
  - Activity logs
  - **⚠️ Testers: Please view only, do not modify users**

---

## 🔄 Complete Workflow Test Scenario

Follow this sequence to test the entire system:

### Scenario: Executive Health Checkup Request

1. **Day 1 - Executive Submits Request**
   - Login as: `executive@metroexecucare.com`
   - Navigate to: Submit LOA Approval
   - Download blank form
   - Upload filled form
   - Submit request
   - Logout

2. **Day 2 - HR Processes Request**
   - Login as: `hr@metroexecucare.com`
   - View pending requests
   - Claim the request
   - Review documents
   - Forward to Benefits Officer
   - Logout

3. **Day 3 - Benefits Officer Reviews**
   - Login as: `benefits@metroexecucare.com`
   - Review request details
   - Check uploaded documents
   - Approve request
   - Forward to Welfare Head
   - Logout

4. **Day 4 - Welfare Head Final Approval**
   - Login as: `welfare@metroexecucare.com`
   - Review complete request
   - Give final approval
   - Logout

5. **Day 5 - Executive Checks Status**
   - Login as: `executive@metroexecucare.com`
   - View approved status
   - Download approval letter
   - Track in LOA Status Tracker

---

## ✅ What Testers Can Do

### Full System Testing:
- ✅ Create actual requests in the database
- ✅ Upload real files to the server
- ✅ Process requests through all approval stages
- ✅ Download generated approval letters
- ✅ View real-time status updates
- ✅ Test all role-based features
- ✅ Experience complete workflow
- ✅ Test notifications (if enabled)
- ✅ View activity logs and history

### System Features:
- ✅ File upload/download
- ✅ Request tracking
- ✅ Multi-level approval workflow
- ✅ Role-based access control
- ✅ Dashboard analytics
- ✅ Search and filter
- ✅ Responsive design (mobile/desktop)

---

## ❌ What Testers Should NOT Do

### Restricted Actions:
- ❌ Do not delete test accounts
- ❌ Do not create new user accounts (only admin can)
- ❌ Do not change test account passwords
- ❌ Do not modify system settings
- ❌ Do not upload inappropriate content
- ❌ Do not upload very large files (>10MB)
- ❌ Do not spam requests

---

## 🛡️ Security & Privacy

### Important Notes:
- These are **DEMO accounts** for testing only
- Do **NOT** use real personal information
- Do **NOT** upload sensitive documents
- All test data may be visible to other testers
- Data may be reset periodically
- No guarantee of data persistence

### Data Handling:
- Test requests are stored in the database
- Uploaded files are stored on the server
- Activity is logged for security
- IP addresses may be logged
- All data is for demonstration purposes

---

## 📱 Supported Features for Testing

### Executive Features:
1. **Request Management**
   - Submit Letter of Approval
   - Submit Letter of Authorization
   - Upload medical documents
   - Track request status
   - View request history
   - Download approval letters

2. **Dashboard**
   - View request statistics
   - See pending requests
   - Check approval status

### HR Personnel Features:
1. **Request Processing**
   - Claim incoming requests
   - Review uploaded documents
   - Forward to Benefits Officer
   - Add processing notes

2. **Dashboard**
   - View workload statistics
   - See claimed requests
   - Track processing history

### Benefits Officer Features:
1. **Request Review**
   - Review HR-processed requests
   - Approve or reject
   - Request additional files
   - Forward to Welfare Head

2. **Dashboard**
   - View approval statistics
   - See pending reviews
   - Track approval history

### Welfare Head Features:
1. **Final Approval**
   - Review complete request chain
   - Give final approval
   - Generate approval letters
   - Reject if necessary

2. **Dashboard**
   - View division statistics
   - See final approval queue
   - Track all approvals

### Admin Features (View Only):
1. **User Management**
   - View all users
   - See user details
   - View activity logs

2. **System Monitoring**
   - View system statistics
   - Monitor request flow
   - Check system health

---

## 🐛 Bug Reporting

If you encounter bugs while testing:

### What to Report:
1. **Account used** (which test account)
2. **Page/feature** where error occurred
3. **Steps to reproduce** the issue
4. **Expected behavior** vs actual behavior
5. **Screenshots** if possible
6. **Browser** and device used

### Where to Report:
- Contact: Developer/Admin
- Include "TEST ACCOUNT BUG" in subject
- Provide detailed information

---

## 📊 Usage Statistics

The test accounts page tracks:
- Number of logins per role
- Requests created
- Approvals processed
- Files uploaded
- Common user paths

This helps improve the system!

---

## 🔄 Data Reset Schedule

Test data may be reset:
- **Weekly:** Every Sunday midnight
- **Monthly:** First day of month
- **On Demand:** When requested by admin

After reset:
- Test accounts remain active
- All test requests are deleted
- Uploaded files are removed
- Fresh start for new testers

---

## 📞 Support

### Need Help?
- Check the **FAQ page** on the website
- Review **How It Works** section
- Contact system administrator
- Email: metroexecucare@gmail.com (if configured)

### Technical Issues?
- Clear browser cache
- Try different browser
- Check internet connection
- Logout and login again

---

## 🚀 Tips for Best Testing Experience

1. **Follow the Workflow:** Test in sequence (Executive → HR → Benefits → Welfare)
2. **Use Multiple Browsers:** Open different accounts in different browsers
3. **Take Screenshots:** Document your testing journey
4. **Test Mobile:** Try on phone/tablet too
5. **Upload Valid Files:** Use real PDF files (not too large)
6. **Logout Properly:** Always logout before switching accounts
7. **Clear Cache:** If you see old data, clear browser cache

---

## 📝 Feedback Welcome!

We appreciate your testing! Your feedback helps improve MetroExecuCare.

**What to comment on:**
- User interface/experience
- Feature suggestions
- Performance issues
- Confusing workflows
- Missing features
- Design improvements

---

## 🗑️ Removal Plan

**This test accounts feature is temporary.**

When ready for production:
- Public test accounts page will be removed
- Test accounts will remain for internal use
- Direct login will still work
- See `TEST_ACCOUNTS_REMOVAL_GUIDE.md` for instructions

---

## 📄 Related Documentation

- `TEST_ACCOUNTS_REMOVAL_GUIDE.md` - How to remove this feature
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Deployment instructions
- `DATABASE_SCHEMA_DOCUMENTATION.md` - Database structure
- `README.md` - Project overview

---

**Current Version:** MetroExecuCare v1.3
**Last Updated:** October 10, 2025
**Environment:** Production (Railway)
**Test Accounts Page:** https://metroexecucare.up.railway.app/test-accounts

---

## Quick Links

- 🏠 [Home](https://metroexecucare.up.railway.app)
- 🧪 [Test Accounts](https://metroexecucare.up.railway.app/test-accounts)
- 🔐 [Login](https://metroexecucare.up.railway.app/loginpage)
- ℹ️ [About Us](https://metroexecucare.up.railway.app/about)
- ❓ [FAQ](https://metroexecucare.up.railway.app/faq)
