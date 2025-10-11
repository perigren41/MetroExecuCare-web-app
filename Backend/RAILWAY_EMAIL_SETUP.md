# Railway Email Configuration Guide

## ⚠️ CRITICAL: Email Notifications Not Working?

If emails are not being sent in production, verify these environment variables in Railway:

### Required Environment Variables

In your Railway dashboard, ensure these variables are set **EXACTLY** as shown:

```
GMAIL_USER=metroexecucare@gmail.com
GMAIL_APP_PASSWORD=jmfh dwyb ouis pxyp
```

### Common Mistakes

❌ **WRONG:**
```
GMAIL_USER_EMAIL=metroexecucare@gmail.com  # OLD variable name
```

✅ **CORRECT:**
```
GMAIL_USER=metroexecucare@gmail.com  # Current variable name
```

### How to Fix in Railway

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to "Variables" tab
4. **DELETE** the old variable: `GMAIL_USER_EMAIL` (if it exists)
5. **ADD** or **UPDATE** these variables:
   - `GMAIL_USER` = `metroexecucare@gmail.com`
   - `GMAIL_APP_PASSWORD` = `jmfh dwyb ouis pxyp`
6. Redeploy your service

### Verify Email Service is Working

After deployment, check the logs for:

```
✅ Gmail service initialized successfully
✅ Gmail connection test successful
```

If you see:
```
⚠️ Gmail credentials not configured. Email notifications will be disabled.
```

Then the environment variables are not set correctly.

### Testing Emails

You can test the email service by triggering any workflow that sends notifications:
- Executive submits a new checkup request
- HR requests additional files
- Benefits Officer approves/rejects

Check the Railway logs for:
```
✅ Email sent successfully to [email]: [messageId]
```

Or if there's an error:
```
❌ Failed to send email: [error message]
```

### Code Reference

The email service expects these variables in:
- File: `Backend/config/gmail.js`
- Lines: 21, 30-31, 63

```javascript
if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn('⚠️ Gmail credentials not configured...');
}
```

## 🔴 Current Known Issues

### Issue 1: Connection Timeout
**Error in logs:** `❌ Failed to send email: Connection timeout`

**Root Cause:** Railway's network firewall may be blocking outbound SMTP connections on port 587/465.

**Solutions:**
1. **Check Railway Network Settings:**
   - Verify that Railway allows outbound SMTP connections
   - Some hosting providers block SMTP ports to prevent spam

2. **Alternative: Use Gmail API instead of SMTP:**
   - Gmail API is more reliable and not blocked by firewalls
   - Requires OAuth2 setup (more secure than App Password)
   - Implementation guide: https://developers.google.com/gmail/api

3. **Alternative: Use SendGrid or other Email Services:**
   - SendGrid, Mailgun, AWS SES work better with cloud hosting
   - These services use HTTP/HTTPS (not blocked)

### Issue 2: Database Column Error
**Error in logs:** `⚠️ Error logging notification to database: Data truncated for column 'notification_type' at row 1`

**Root Cause:** The `notification_type` column is an ENUM with a fixed list of values, but the code is trying to insert notification types that don't exist in the ENUM.

**Temporary Solution:** The email will still send, but won't be logged to the database.

**Permanent Solution:** Database migration needed to update the ENUM values or change column to VARCHAR(50). See `Backend/to_be_deleted/migrations/` for migration scripts.

## Need Help?

If emails still don't work after following these steps:
1. Check Railway deployment logs for specific error messages
2. Verify the Gmail App Password is still valid
3. Test Gmail SMTP connectivity from Railway environment
4. Consider switching to Gmail API or alternative email service
5. Check if Gmail has any security blocks on the account
