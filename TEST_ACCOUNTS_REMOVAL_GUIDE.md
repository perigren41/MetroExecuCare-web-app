# Test Accounts Setup - Removal Guide

## Overview
This document provides instructions for removing the public test accounts feature that was implemented for demo and testing purposes. Once you're ready to deploy the production version without public testing capabilities, follow the steps below.

---

## Files Added for Test Accounts Feature

### 1. Frontend Test Accounts Page
**File:** `Frontend/src/webpages/TestAccountsPage.jsx`
- **Purpose:** Displays all test account credentials for public testers
- **Features:** Copy-to-clipboard, workflow guide, test account cards
- **Action:** DELETE this entire file

### 2. App Route Configuration
**File:** `Frontend/src/App.jsx`
- **Lines Added:**
  - Line 24: `import TestAccountsPage from "@/webpages/TestAccountsPage.jsx";`
  - Line 37: `<Route path="/test-accounts" element={<TestAccountsPage />} />`
- **Action:** REMOVE these two lines

### 3. Landing Page Hero Section
**File:** `Frontend/src/Components/HeroSection.jsx`
- **Lines Added:**
  - Line 4: Added `TestTube2` to lucide-react imports
  - Line 5: Added `import { useNavigate } from 'react-router-dom';`
  - Line 8: Added `const navigate = useNavigate();`
  - Lines 59-65: Added "Try Demo with Test Accounts" button
- **Action:** REMOVE the button and clean up unused imports

---

## Step-by-Step Removal Instructions

### Step 1: Delete Test Accounts Page
```bash
cd "C:\Program Files\MetroExecuCare"
rm Frontend/src/webpages/TestAccountsPage.jsx
```

### Step 2: Remove Route from App.jsx
Edit `Frontend/src/App.jsx` and remove:

**Line 24 (remove):**
```javascript
import TestAccountsPage from "@/webpages/TestAccountsPage.jsx";
```

**Line 37 (remove):**
```javascript
<Route path="/test-accounts" element={<TestAccountsPage />} />
```

### Step 3: Remove Button from HeroSection.jsx
Edit `Frontend/src/Components/HeroSection.jsx`:

**Line 4 - Update import (remove TestTube2):**
```javascript
// BEFORE:
import { ArrowDown, TestTube2 } from 'lucide-react';

// AFTER:
import { ArrowDown } from 'lucide-react';
```

**Line 5 - Remove (if useNavigate is not used elsewhere):**
```javascript
import { useNavigate } from 'react-router-dom';
```

**Line 8 - Remove (if navigate is not used elsewhere):**
```javascript
const navigate = useNavigate();
```

**Lines 59-65 - Remove the entire button:**
```javascript
<button
    onClick={() => navigate('/test-accounts')}
    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 group"
>
    <TestTube2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
    <span>Try Demo with Test Accounts</span>
</button>
```

**Restore original spacing:**
```javascript
// Change mb-6 back to mb-8
<p className="text-sm md:text-base lg:text-lg text-secondary/80 mb-8">
    Where health meets convenience.
</p>
```

### Step 4: Optional - Remove/Lock Test Accounts in Database

If you want to disable the test accounts (not recommended if you want to keep them for internal testing):

**Option A: Deactivate Test Accounts**
```sql
UPDATE users
SET is_active = FALSE
WHERE employee_id IN ('ADMIN001', 'HR001', 'BEN001', 'WEL001', 'EXE001');
```

**Option B: Change Test Account Passwords**
```sql
-- Change passwords to something only you know
-- Use the Backend API or admin interface to change passwords
```

**Option C: Keep Test Accounts Active**
- Recommended: Keep the test accounts for internal testing/demos
- Just remove public access via the test accounts page

---

## Git Commands for Removal

```bash
# Delete the test accounts page
git rm Frontend/src/webpages/TestAccountsPage.jsx

# Stage the modified files
git add Frontend/src/App.jsx
git add Frontend/src/Components/HeroSection.jsx

# Commit the removal
git commit -m "Remove public test accounts feature for production

Removed test accounts page and demo button from landing page.
Test accounts remain in database for internal testing purposes.

- Deleted TestAccountsPage.jsx
- Removed /test-accounts route from App.jsx
- Removed demo button from HeroSection.jsx
- Cleaned up unused imports

Production-ready deployment without public testing interface."

# Push to repository
git push
```

---

## Database Cleanup (Optional)

If you want to clean up test data created during public testing:

### Clean Up Test Requests
```sql
-- View test requests
SELECT * FROM checkup_requests
WHERE created_by IN (
    SELECT id FROM users
    WHERE employee_id IN ('ADMIN001', 'HR001', 'BEN001', 'WEL001', 'EXE001')
);

-- Delete test requests (WARNING: This deletes data!)
DELETE FROM checkup_requests
WHERE created_by IN (
    SELECT id FROM users
    WHERE employee_id IN ('ADMIN001', 'HR001', 'BEN001', 'WEL001', 'EXE001')
);
```

### Clean Up Test Files
```bash
# Backup uploads directory first
cp -r Backend/uploads Backend/uploads_backup

# Remove test files (manual review recommended)
# Check Backend/uploads/profile-pictures/
# Check Backend/uploads/request-files/
```

---

## Post-Removal Checklist

After removing the test accounts feature, verify:

- [ ] `/test-accounts` route returns 404
- [ ] Landing page hero section has no demo button
- [ ] No references to TestAccountsPage in codebase
- [ ] Application builds without errors
- [ ] No broken imports
- [ ] Test accounts still work (if keeping them)
- [ ] Railway deployment successful
- [ ] Frontend redeployed and rebuilt

---

## Search and Verify

Use these commands to ensure all references are removed:

```bash
# Search for TestAccountsPage references
grep -r "TestAccountsPage" Frontend/src/

# Search for /test-accounts route
grep -r "test-accounts" Frontend/src/

# Search for TestTube2 icon (if removed)
grep -r "TestTube2" Frontend/src/
```

---

## Alternative: Hide Instead of Delete

If you want to keep the feature for later use:

### Option 1: Comment Out Route
```javascript
// <Route path="/test-accounts" element={<TestAccountsPage />} />
```

### Option 2: Hide Button
```javascript
// Wrap button in condition
{process.env.VITE_ENABLE_TEST_ACCOUNTS === 'true' && (
    <button onClick={() => navigate('/test-accounts')}>
        Try Demo
    </button>
)}
```

Then set `VITE_ENABLE_TEST_ACCOUNTS=false` in Railway production environment.

---

## Rollback Instructions

If you need to restore the test accounts feature:

```bash
# View the commit that added test accounts
git log --grep="test accounts"

# Checkout the files from that commit
git checkout c5f116e -- Frontend/src/webpages/TestAccountsPage.jsx
git checkout c5f116e -- Frontend/src/App.jsx
git checkout c5f116e -- Frontend/src/Components/HeroSection.jsx

# Commit the restoration
git add .
git commit -m "Restore test accounts feature"
git push
```

---

## Notes

- **Test Account Credentials** will remain in the database (safe to keep)
- **Test Data** created by public testers can be cleaned up separately
- **Route `/test-accounts`** will return 404 after removal
- **Landing Page** will no longer show demo button
- **Internal Testing** can still use test accounts via direct login

---

## Contact

For questions about removing this feature, refer to:
- Commit: `c5f116e - Add public test accounts page for demo and testing`
- Files Modified: 3 files
- Lines Added: ~234 lines

---

**Last Updated:** October 10, 2025
**Created By:** Claude Code Agent
**Version:** MetroExecuCare v1.3
