

#### These are the concerns that we need to fix per role before proceeding with hosting:

## General Issue
General issues means all roles has the same problem.

# 1. Profile Picture update
Profile picture in each Profile pages per role is not working properly. It is giving this error: 

:5000/uploads/profile-pictures/5_1760010222277.jfif:1   GET http://localhost:5000/uploads/profile-pictures/5_1760010222277.jfif net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)



### Admin
These are issues inside Admin role, whether it is webpages related to admin or backend.
# 1. Activity Log specification
Action under Summary of Admin Profile is not specifying if an Admin adds/deletes/updates a user. It must also add the Employee ID of the user that was made action.

## Executive
These are issues inside Executive role, whether it is webpages related to Executive or backend.

# 1. Request Number inside Duplicate Request Modal
The request Number must display the request_number under checkup_requests to identify clearly. It looks like this is wrong: activeRequest?.request_number, how can I fetch the request_number?

# 2. Submitting additional files requested
If an officer request an additional files from the executive and tries to upload them, it's giving this error: :5000/api/requests/file-requests/1/respond:1   Failed to load resource: the server responded with a status of 403 (Forbidden)
api.js:38  API Error Response (Full): {
  "success": false,
  "message": "You do not have permission to respond to this file request"
}
handleResponse @ api.js:38
api.js:39  API Error Status: 403
handleResponse @ api.js:39
api.js:40  API Error URL: http://localhost:5000/api/requests/file-requests/1/respond
handleResponse @ api.js:40
api.js:844  Respond to file request error: Error: Access denied. Please contact your administrator.
    at ApiService.handleResponse (api.js:56:21)
    at async ApiService.respondToFileRequest (api.js:842:14)
    at async handleFileUpload (ViewRequestDetailsModal.jsx:98:9)
respondToFileRequest @ api.js:844
ViewRequestDetailsModal.jsx:114  Error uploading files: Error: Access denied. Please contact your administrator.
    at ApiService.handleResponse (api.js:56:21)
    at async ApiService.respondToFileRequest (api.js:842:14)
    at async handleFileUpload (ViewRequestDetailsModal.jsx:98:9)

    In addition, use proper naming conventions and and not abbreviations or backend naming conventions to improve UI/UX ie. hr personnel(X) Human Resource Personnel(Y). Lastly, I will give an example, if the HR request a file to the user, and approves the request without the executive having to upload a file, the Additional Files Requested from the previous approver must be removed in the Request Details modal. And improve the UI for uploading files in Request Details modal, I see that there are redundant components that are unnecessary. Rejected files must also include in the "Request Details Modal" where it should display the reason why it was rejected and all "Additional Files Requested" must be removed/hide since it's already rejected.

# 3. Pointer buttons
Make all buttons have pointer when hovered



### Human Resource role
These are issues inside Human Resource(HR) role, whether it is webpages related to HR, BSO, Welfare or backend.

# 1. Pending Requests card
In HR Dashboard, when an Executive deletes/cancels a request, it must also be removed in the {pendingActions} since the request is now deleted
" if (pendingAction > 0) {
                return {
                    message: `You have ${pendingAction} request/s pending to be claimed`,
                };
                }". Pending Requests must only fetch if requests has not been claimed yet. Therefore those are pendingActions.
# 2. Request Additional Files
In Request Additional Files modal, requesting additional files from the executive is working perfectly, and it also sends email to the executive, however, it still gives this error:
Error creating file request: Error: Unknown column 'user_id' in 'field list'
    at PromisePool.execute (C:\Program Files\MetroExecuCare\Backend\node_modules\mysql2\lib\promise\pool.js:54:22)
    at createFileRequest (C:\Program Files\MetroExecuCare\Backend\controllers\fileRequestController.js:89:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  code: 'ER_BAD_FIELD_ERROR',
  errno: 1054,
  sql: 'INSERT INTO notifications (request_id, user_id, notification_type, title, message, created_at)\n' +
    "       VALUES (?, ?, 'file_requested', ?, ?, CURRENT_TIMESTAMP)",
  sqlState: '42S22',
  sqlMessage: "Unknown column 'user_id' in 'field list'"
}

# 3. Disable Upload and Request Files in loa-submit
Once the request gets approved by the approver, and it now shows "Request is currently under (next stage)". previous approver must not be able to upload nor request anymore. They can only view the request and not overwrite.

# 4. Do not place current file upload inside Document Preview and place on temporary storage first. Which is below Document Preview border.
If HR is currently reviewing a request, there must be no "HR File: No upload" Inside Document Preview in LOA-submit. Whilst if other approvers are reviewing a request, it must not change the previous approver's file inside Document Preview. Files inside Document Preview are permanent storage from the database uploaded by previous approvers and Executive. Current approver must place their soon to be uploaded file in the temporary storage which is in "Staff File Display (Most Recent Approver's File)"

# 5. Remove abbreviations in naming
Instead of using HR File or "No HR documents uploaded yet", use Human Resource. Use proper naming conventions for user to understand properly

# 6. Pending Requests table for all roles
Make all Pending Requests tables responsive to all screen sizes/viewport. Some screen sizes aren't seeing all columns inside the Pending Request table.

# 7. Unable to approve as Welfare Head
After uploading a file and try approving as a Welfare Head, it gave me this error message: Approve request error: Error: Data truncated for column 'current_status' at row 1
    at PromisePool.execute (C:\Program Files\MetroExecuCare\Backend\node_modules\mysql2\lib\promise\pool.js:54:22)
    at approveRequest (C:\Program Files\MetroExecuCare\Backend\controllers\requestWorkflowController.js:788:16)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
  code: 'WARN_DATA_TRUNCATED',
  errno: 1265,
  sql: 'UPDATE checkup_requests SET current_status = ?, updated_at = NOW() WHERE id = ?',
  sqlState: '01000',
  sqlMessage: "Data truncated for column 'current_status' at row 1"
}
