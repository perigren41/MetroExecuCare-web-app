# Release Request Feature Documentation

## Overview
The Release Request feature allows HR personnel to release a claimed request back to the pending pool when they are unable to process it. This enables better workload management and ensures requests are handled efficiently.

---

## 🎯 Feature Purpose

**Problem Solved:** HR personnel who have claimed a request may need to release it due to:
- Going on leave/vacation
- Workload balancing
- Request requires specialized expertise
- Emergency situations
- Personal reasons

**Solution:** One-click release that returns the request to the pending pool for other HR personnel to claim.

---

## 🔑 Access Control

### Who Can Release Requests?
- **Only HR Personnel** (`role = 'hr_personnel'`)

### Release Conditions:
- Request must be in `'hr_processing'` status
- Request must be assigned to the current HR user (`assigned_hr_id = user.id`)
- HR must have claimed the request (not just viewing it)

---

## 🖥️ User Interface

### Release Button Location
**Page:** LOA_Submit.jsx
**Position:** Action buttons section (below request details)
**Appearance:**
- Orange button with white text
- Rounded full design
- Hover effect (darker orange)
- Title tooltip: "Release this request back to the pending pool for other HR to claim"

**Button Code:**
```jsx
{user?.role === 'hr_personnel' &&
 request?.current_status === 'hr_processing' &&
 request?.assigned_hr_id === user?.id && (
    <button
        onClick={handleRelease}
        className="px-6 sm:px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
        title="Release this request back to the pending pool for other HR to claim"
    >
        Release Request
    </button>
)}
```

### Release Modal
**Modal Features:**
- Gradient header matching app theme
- Confirmation message
- Optional reason textarea
- Cancel and Release Request buttons
- Loading state with spinner
- Fully responsive (mobile to desktop)

**Modal Layout:**
```
┌─────────────────────────────────────────┐
│  Release Request                     ✕  │ (Gradient header)
├─────────────────────────────────────────┤
│                                         │
│  Are you sure you want to release      │
│  this request?                          │
│                                         │
│  This request will be returned to the   │
│  pending pool and will be available     │
│  for other HR personnel to claim.       │
│                                         │
│  Reason for releasing (optional):       │
│  ┌───────────────────────────────────┐ │
│  │ e.g., Going on leave, workload    │ │
│  │ balancing, requires specialized   │ │
│  │ expertise...                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│      [Cancel]  [Release Request]        │
└─────────────────────────────────────────┘
```

---

## 🔄 User Flow

### Step-by-Step Process:

1. **HR Views Claimed Request**
   - Navigates to LOA_Submit page with a request they claimed
   - Status: `hr_processing`, assigned to them

2. **HR Clicks "Release Request" Button**
   - Button is visible below Approve/Reject buttons
   - Orange colored for clear identification

3. **Release Modal Opens**
   - Shows confirmation message
   - Optional reason textarea appears
   - Focus on user-friendly messaging

4. **HR Provides Reason (Optional)**
   - Can enter reason like:
     - "Going on leave"
     - "Workload balancing"
     - "Requires specialized expertise"
     - "Emergency situation"

5. **HR Confirms Release**
   - Clicks "Release Request" button
   - Loading spinner shows "Releasing..."
   - API call to `/api/requests/:id/release`

6. **System Processes Release**
   - Backend validates permissions
   - Updates database (see Database Changes section)
   - Sends email notifications

7. **Success Response**
   - Alert shows: "Request released successfully! The request is now available for other HR personnel to claim."
   - HR redirected to HR Dashboard
   - Modal closes automatically

8. **Request Available for Claiming**
   - Request returns to pending pool
   - Appears in other HR personnel's pending requests
   - Can be claimed by any HR personnel

---

## 🗄️ Database Changes

### Tables Updated:

#### 1. **checkup_requests** (Main Status)
```sql
UPDATE checkup_requests SET
  assigned_hr_id = NULL,        -- Cleared
  assigned_at = NULL,            -- Cleared
  current_status = 'pending',    -- Reverted
  updated_at = NOW()
WHERE id = ?
```

#### 2. **request_assignments** (Assignment History)
```sql
UPDATE request_assignments SET
  is_active = FALSE,             -- Mark as inactive
  completed_at = NOW(),          -- Record release time
  notes = CONCAT(COALESCE(notes, ''), '\nReleased by HR: ', COALESCE(?, 'No reason provided'))
WHERE request_id = ? AND hr_personnel_id = ? AND is_active = TRUE
```

**Example `notes` field after release:**
```
"Released by HR: Going on leave for 2 weeks"
```

#### 3. **request_approvals** (Workflow State)
```sql
UPDATE request_approvals SET
  approver_id = NULL,            -- Remove HR assignment
  updated_at = NOW()
WHERE request_id = ? AND approval_stage = 'hr_stage'
```

#### 4. **activity_logs** (Audit Trail)
```sql
INSERT INTO activity_logs (
  request_id, user_id, action, description,
  old_values, new_values, created_at
) VALUES (?, ?, 'request_released', ?, ?, ?, NOW())
```

**Example Activity Log:**
- `action`: `'request_released'`
- `description`: `"Request released back to pending pool by HR Personnel: Going on leave"`
- `old_values`:
  ```json
  {
    "status": "hr_processing",
    "assigned_hr_id": 3
  }
  ```
- `new_values`:
  ```json
  {
    "status": "pending",
    "assigned_hr_id": null,
    "release_reason": "Going on leave"
  }
  ```

---

## 📧 Email Notifications

### Recipients and Messages:

#### 1. **Executive (Request Owner)**
**Email Type:** Status Update
**Subject:** Request Status Update - Released
**Message:**
```
Your request has been released back to the pending pool by [HR Name].
It will be available for other HR personnel to claim.
[Reason: Going on leave] (if provided)
```

#### 2. **All Other HR Personnel**
**Email Type:** New Request Available
**Subject:** Request Available for Claiming
**Message:**
```
Request #[request_number] has been released by [HR Name] and is now
available for claiming.
[Reason: Going on leave] (if provided)
```

**Note:** The HR who released the request does NOT receive a notification.

---

## 🔍 How to Track Releases

### Query 1: Find All Released Requests
```sql
SELECT
  ra.request_id,
  cr.request_number,
  CONCAT(u.first_name, ' ', u.last_name) as hr_name,
  ra.assigned_at as claimed_at,
  ra.completed_at as released_at,
  ra.notes as release_reason
FROM request_assignments ra
JOIN users u ON ra.hr_personnel_id = u.id
JOIN checkup_requests cr ON ra.request_id = cr.id
WHERE ra.is_active = FALSE
  AND ra.notes LIKE '%Released by HR%'
ORDER BY ra.completed_at DESC;
```

### Query 2: Get Release History from Activity Logs
```sql
SELECT
  al.request_id,
  cr.request_number,
  CONCAT(u.first_name, ' ', u.last_name) as released_by,
  al.description,
  JSON_EXTRACT(al.new_values, '$.release_reason') as release_reason,
  al.created_at as released_at
FROM activity_logs al
JOIN users u ON al.user_id = u.id
JOIN checkup_requests cr ON al.request_id = cr.id
WHERE al.action = 'request_released'
ORDER BY al.created_at DESC;
```

### Query 3: Track Release Patterns by HR
```sql
SELECT
  u.id as hr_id,
  CONCAT(u.first_name, ' ', u.last_name) as hr_name,
  COUNT(*) as total_releases,
  GROUP_CONCAT(DISTINCT
    SUBSTRING_INDEX(ra.notes, 'Released by HR: ', -1)
    SEPARATOR '; ') as common_reasons
FROM request_assignments ra
JOIN users u ON ra.hr_personnel_id = u.id
WHERE ra.is_active = FALSE
  AND ra.notes LIKE '%Released by HR%'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_releases DESC;
```

---

## 🛡️ Security & Validation

### Backend Validation (requestWorkflowController.js):

1. **Role Check:**
   ```javascript
   if (userRole !== 'hr_personnel') {
     return res.status(403).json({
       success: false,
       error: 'Only Human Resource Personnel can release requests'
     });
   }
   ```

2. **Ownership Check:**
   ```javascript
   if (request.assigned_hr_id !== userId) {
     return res.status(403).json({
       success: false,
       error: 'You can only release requests assigned to you'
     });
   }
   ```

3. **Status Check:**
   ```javascript
   if (request.current_status !== 'hr_processing') {
     return res.status(400).json({
       success: false,
       error: 'Request can only be released when in HR processing status'
     });
   }
   ```

### Error Handling:
- Invalid request ID → 404 Not Found
- Wrong user role → 403 Forbidden
- Not assigned to user → 403 Forbidden
- Wrong status → 400 Bad Request
- Database error → 500 Internal Server Error

---

## 🔌 API Endpoint

### POST /api/requests/:id/release

**Authentication:** Required (JWT Token)
**Authorization:** HR Personnel only

**Request:**
```http
POST /api/requests/123/release
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "Going on leave for 2 weeks"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request released successfully and is now available for other HR personnel to claim",
  "data": {
    "request_id": 123,
    "status": "pending",
    "released_by": 5
  }
}
```

**Error Responses:**

**403 Forbidden - Wrong Role:**
```json
{
  "success": false,
  "error": "Only Human Resource Personnel can release requests"
}
```

**403 Forbidden - Not Assigned:**
```json
{
  "success": false,
  "error": "You can only release requests assigned to you"
}
```

**400 Bad Request - Wrong Status:**
```json
{
  "success": false,
  "error": "Request can only be released when in HR processing status"
}
```

---

## 📝 Frontend Code Reference

### State Management
```javascript
const [showReleaseModal, setShowReleaseModal] = useState(false);
const [releaseReason, setReleaseReason] = useState("");
```

### Event Handlers
```javascript
const handleRelease = () => {
    setShowReleaseModal(true);
};

const confirmRelease = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
        const releaseData = {
            reason: releaseReason.trim() || null
        };

        const response = await apiService.releaseRequest(requestId, releaseData);

        if (response.success) {
            alert(`Request released successfully!`);
            setShowReleaseModal(false);
            setReleaseReason("");
            navigate('/hr-dashboard', { state: { user } });
        } else {
            alert(`Failed to release request: ${response.error}`);
        }
    } catch (error) {
        console.error('Error releasing request:', error);
        alert(`Error releasing request: ${error.message}`);
    } finally {
        setIsSubmitting(false);
    }
};
```

### API Service Method
```javascript
// Frontend/src/services/api.js
async releaseRequest(requestId, releaseData) {
  try {
    const response = await fetch(`${this.baseURL}/requests/${requestId}/release`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(releaseData),
    });

    return await this.handleResponse(response);
  } catch (error) {
    console.error('Release request error:', error);
    throw error;
  }
}
```

---

## 🧪 Testing Scenarios

### Test Case 1: Successful Release
1. Login as HR personnel
2. Claim a pending request
3. Navigate to the request details
4. Click "Release Request" button
5. Enter reason: "Going on leave"
6. Click "Release Request" in modal
7. **Expected:** Request released, redirected to dashboard, email sent

### Test Case 2: Release Without Reason
1. Login as HR personnel
2. Open a claimed request
3. Click "Release Request"
4. Leave reason field empty
5. Click "Release Request"
6. **Expected:** Request released with "No reason provided" in database

### Test Case 3: Unauthorized Release Attempt
1. Login as Benefits Officer
2. Try to access release endpoint directly
3. **Expected:** 403 Forbidden error

### Test Case 4: Release Already Released Request
1. HR releases a request
2. Try to release the same request again
3. **Expected:** 400 Bad Request (status not hr_processing)

### Test Case 5: Cancel Release
1. Click "Release Request" button
2. Modal opens
3. Click "Cancel" button
4. **Expected:** Modal closes, no changes made

---

## 📊 Use Case Examples

### Example 1: HR Going on Leave
**Scenario:** Maria (HR) has claimed 5 requests but needs to go on emergency leave.

**Action:**
1. Maria opens each claimed request
2. Clicks "Release Request"
3. Enters reason: "Emergency leave - 1 week"
4. Confirms release

**Result:**
- All 5 requests return to pending pool
- Other HR personnel receive notifications
- Requests can be immediately claimed
- Audit trail shows Maria's reason

### Example 2: Workload Balancing
**Scenario:** John (HR) has 10 claimed requests but colleague has none.

**Action:**
1. John releases 5 requests
2. Reason: "Workload balancing"
3. Colleague claims the released requests

**Result:**
- Fair distribution of work
- No requests delayed
- Transparent reason documented

### Example 3: Specialized Expertise Required
**Scenario:** Request requires knowledge of specific hospital that Sarah (HR) doesn't have.

**Action:**
1. Sarah releases the request
2. Reason: "Requires expertise with Hospital XYZ"
3. Expert HR personnel claims it

**Result:**
- Request handled by appropriate person
- Better service quality
- Knowledge gaps identified

---

## 🚀 Deployment Status

**Backend:**
✅ Released endpoint implemented
✅ Database updates configured
✅ Email notifications active
✅ Error handling complete

**Frontend:**
✅ Release button added
✅ Release modal implemented
✅ API integration complete
✅ Responsive design verified

**Testing:**
✅ Backend validation tested
✅ Frontend UI tested
✅ Database tracking confirmed
✅ Email notifications verified

**Deployment:**
✅ Committed to GitHub
✅ Auto-deployed to Railway
✅ Production ready

---

## 📚 Related Documentation

- [Entity-Relationship Diagram](../ENTITY_RELATIONSHIP_DIAGRAM.md) - Database schema
- [Request Workflow Documentation](../DATABASE_SCHEMA_DOCUMENTATION.md) - Approval process
- [API Routes](../../Backend/routes/requestRoutes.js) - All request endpoints

---

**Last Updated:** January 2025
**Feature Version:** 1.0.0
**Status:** ✅ Production Ready