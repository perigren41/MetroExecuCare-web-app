# Gmail Setup Guide for MetroExecuCare

## Simple App Password Setup (Recommended)

MetroExecuCare uses Gmail App Password for reliable email notifications. This is simpler and more stable than OAuth2.

### Prerequisites
- Gmail account with 2-Factor Authentication enabled
- Admin access to the MetroExecuCare system

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled
3. Complete the 2FA setup process

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Scroll down to "App passwords"
4. Click "Select app" → "Mail"
5. Click "Select device" → "Other (Custom name)"
6. Enter: "MetroExecuCare Email System"
7. Click "Generate"
8. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Update Environment Variables
Update your `.env` file with these settings:

```env
# Gmail App Password Configuration
GMAIL_USER_EMAIL=metroexecucare@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # Your 16-character app password
GMAIL_USE_APP_PASSWORD=true
```

### Step 4: Restart the Server
```bash
npm start
```

### Step 5: Test Email Sending
Test with admin account:

```bash
# Login as admin first
curl -X POST http://localhost:5014/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@metrobank.com","password":"AdminPass123!"}'

# Test email notification
curl -X POST http://localhost:5014/api/email/test-notification \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"type":"status_update","recipientEmail":"jomarperigren41@gmail.com"}'
```

## Email Configuration Status

### Current Setup
✅ **Environment Variables**: Already configured in `.env`
✅ **App Password**: Already working (`jmfh dwyb ouis pxyp`)
✅ **Sender Email**: `metroexecucare@gmail.com`
✅ **Target Recipient**: `jomarperigren41@gmail.com`

### Email Types Available

| Type | Description | Recipient |
|------|-------------|-----------|
| `new_request` | New request submitted | HR Personnel |
| `assignment` | Request assigned to HR | Assigned HR |
| `approval_request` | Approval needed | Benefits/Welfare |
| `status_update` | Status changed | Executive |
| `final_approval` | Request completed | Executive |

### Professional Email Features
- 📧 **MetroExecuCare branding** with company colors
- 📱 **Mobile responsive** design
- 🎨 **Professional HTML** templates
- 📎 **PDF attachment** support for letters
- 🔔 **Role-specific** content and messaging

## Troubleshooting

### Email Not Sending?
1. **Check console logs** for error messages
2. **Verify App Password** is still valid in Google Account
3. **Confirm 2FA** is enabled on the Gmail account
4. **Test connection**: `GET /api/email/test`

### App Password Issues?
- **Regenerate**: Create a new app password if the current one expires
- **Copy carefully**: Ensure no extra spaces in the 16-character password
- **Update .env**: Restart server after changing environment variables

### Success Indicators
```
✅ Gmail service initialized with App Password
✅ Gmail transporter created with App Password
✅ Email sent successfully to jomarperigren41@gmail.com
📧 Message ID: <unique_message_id>
```

## Real Email Testing

Once configured, real emails will be sent to `jomarperigren41@gmail.com` with:
- Professional MetroExecuCare branding
- Request tracking numbers
- Action buttons and links
- Mobile-friendly responsive design
- Company footer and contact information

The system is already configured and ready to send real emails!