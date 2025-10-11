# Resend Setup Guide for Railway

## 🎯 Why Resend?

Resend solves the **SMTP connection timeout** issue you're experiencing on Railway:
- ✅ Uses HTTPS (port 443) - never blocked by firewalls
- ✅ More reliable than Gmail SMTP for cloud hosting
- ✅ Simple integration with your existing email templates
- ✅ Better deliverability and tracking
- ✅ Free tier: 3,000 emails/month, 100 emails/day

---

## 📝 Step 1: Create Resend Account

1. Go to **https://resend.com**
2. Click **"Sign Up"** (top right)
3. Sign up with your email or GitHub account
4. Verify your email address

---

## 🔑 Step 2: Get Your API Key

1. After logging in, go to **https://resend.com/api-keys**
2. Click **"Create API Key"**
3. Give it a name (e.g., "Railway Production")
4. **Permission:** Select "Sending access"
5. Click **"Create"**
6. **IMPORTANT:** Copy the API key now - you won't be able to see it again!
   - It will look like: `re_123abc456def789...`

---

## 📧 Step 3: Add Your Domain (Optional but Recommended)

### Option A: Use Your Own Domain (Recommended for Production)

1. Go to **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `metroexecucare.com`)
4. Add the DNS records shown by Resend to your domain provider:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT - optional but recommended)
5. Wait for DNS propagation (usually 5-30 minutes)
6. Click **"Verify DNS Records"**

Once verified, you can send emails from `noreply@metroexecucare.com`

### Option B: Use Resend's Test Domain (Quick Start)

For testing, you can use Resend's onboarding domain:
- Send emails from: `onboarding@resend.dev`
- **Limitation:** Can only send to YOUR verified email address
- Good for testing before setting up your own domain

---

## ⚙️ Step 4: Configure Railway Environment Variables

1. Open your Railway dashboard: **https://railway.app**
2. Select your MetroExecuCare project
3. Click on your **Backend service**
4. Go to the **"Variables"** tab
5. Add these environment variables:

### Required Variables:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

### Optional (but recommended):

```bash
FROM_EMAIL=MetroExecuCare <noreply@metroexecucare.com>
```

**Notes:**
- Replace `re_your_actual_api_key_here` with your actual API key from Step 2
- Replace `noreply@metroexecucare.com` with your verified domain from Step 3
- If you don't set `FROM_EMAIL`, it will default to `MetroExecuCare <noreply@metroexecucare.com>`

---

## 🔄 Step 5: Redeploy Your Railway Service

After adding the environment variables:

1. Railway will automatically redeploy
2. **OR** manually trigger a redeploy:
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment

---

## ✅ Step 6: Verify Email Service is Working

### Check Railway Logs:

After deployment, check your Railway logs for:

```
✅ Email service initialized with Resend
📧 EmailService initialized with provider: resend
```

### Test Email Sending:

Trigger any workflow that sends emails:
- Executive submits a checkup request
- HR requests additional files
- Benefits Officer approves/rejects

Check the logs for:
```
✅ Email sent via Resend to user@example.com: [email-id]
```

---

## 🔧 Troubleshooting

### Issue: "Email service initialized with Gmail" instead of Resend

**Problem:** `RESEND_API_KEY` is not set correctly in Railway

**Solution:**
1. Double-check the environment variable name: `RESEND_API_KEY` (case-sensitive)
2. Make sure there are no extra spaces in the value
3. Redeploy after setting the variable

### Issue: "No email provider configured"

**Problem:** Neither Resend nor Gmail is configured

**Solution:**
- Set `RESEND_API_KEY` in Railway environment variables
- Make sure you saved the variables and redeployed

### Issue: Emails not being received

**Problem:** Possible causes:
1. Using test domain without verifying recipient
2. Domain not verified
3. Email in spam folder
4. Invalid API key

**Solution:**
1. If using `onboarding@resend.dev`, you can only send to your verified email
2. Set up your own domain (Step 3)
3. Check Resend dashboard logs: https://resend.com/emails
4. Check spam folder in recipient's inbox
5. Verify API key is correct and has "Sending access" permission

---

## 📊 Monitoring & Logs

### Resend Dashboard:
- **https://resend.com/emails** - See all sent emails
- View delivery status, opens (if enabled), bounces, etc.

### Railway Logs:
```bash
# Search for email-related logs
✅ Email sent via Resend
❌ Failed to send email
📧 EmailService initialized
```

---

## 💰 Resend Pricing (as of 2024)

| Plan | Price | Emails/Month | Emails/Day |
|------|-------|--------------|------------|
| **Free** | $0 | 3,000 | 100 |
| **Pro** | $20 | 50,000 | Unlimited |

**Your usage estimate:**
- If you have ~50 active users sending 2 requests/month
- Each request triggers ~5 emails (HR, BO, WH, Executive, etc.)
- Total: 50 × 2 × 5 = **500 emails/month**
- ✅ Well within the free tier!

---

## 🔄 Fallback to Gmail (if needed)

The system is designed to automatically fall back to Gmail if Resend is not configured:

**Priority:**
1. **Resend** (if `RESEND_API_KEY` is set) ✅ Recommended
2. **Gmail SMTP** (if `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set)

To use Gmail fallback:
- Remove or don't set `RESEND_API_KEY`
- Set `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- **Note:** May still have connection timeout issues on Railway

---

## 📞 Support

### Resend Support:
- Documentation: https://resend.com/docs
- Discord: https://resend.com/discord
- Email: support@resend.com

### Code Reference:
- Email Provider: `Backend/config/emailProvider.js`
- Email Service: `Backend/services/emailService.js`
- Email Templates: `Backend/templates/email/emailTemplates.js` (unchanged)

---

## 🎉 Success Checklist

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added domain to Resend (or using test domain)
- [ ] Set `RESEND_API_KEY` in Railway
- [ ] Set `FROM_EMAIL` in Railway (optional)
- [ ] Redeployed Railway service
- [ ] Checked logs: "Email service initialized with Resend"
- [ ] Tested sending email
- [ ] Verified email received
- [ ] Checked Resend dashboard for delivery confirmation

**Once all checked, your emails should be working perfectly!** 🚀

---

## 🆚 Resend vs Gmail Comparison

| Feature | Resend | Gmail SMTP |
|---------|--------|------------|
| **Works on Railway** | ✅ Yes | ❌ Blocked (timeout) |
| **Uses HTTPS** | ✅ Yes | ❌ No (SMTP) |
| **Free Tier** | 3,000/month | ✅ Unlimited |
| **Deliverability** | ✅ Excellent | Good |
| **Setup Complexity** | ⚡ Easy | Medium |
| **Dashboard/Tracking** | ✅ Yes | ❌ No |
| **API-based** | ✅ Yes | ❌ No |
| **Custom Domain** | ✅ Yes | ❌ No (uses Gmail) |
| **Production Ready** | ✅ Yes | ⚠️ Not recommended |

**Recommendation:** Use Resend for production deployments on Railway.
