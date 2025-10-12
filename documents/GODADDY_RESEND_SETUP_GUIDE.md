# GoDaddy + Resend Domain Setup Guide

**Date:** January 12, 2025
**Registrar:** GoDaddy
**Email Service:** Resend
**Time Required:** 30-60 minutes (including DNS propagation)

---

## 🎯 Overview

This guide walks you through configuring your GoDaddy domain with Resend for sending emails from MetroExecuCare.

---

## 📋 Prerequisites

- [x] GoDaddy account with domain purchased
- [x] Resend account created (free tier is fine)
- [x] Access to Railway environment variables
- [x] Domain: `metroexecucare.com` (or your chosen domain)

---

## 🔐 Step 1: Access GoDaddy DNS Management

### 1.1 Login to GoDaddy
1. Go to [GoDaddy.com](https://www.godaddy.com)
2. Click **Sign In** (top right)
3. Enter your credentials

### 1.2 Navigate to DNS Management
1. Click on your **profile icon** → **My Products**
2. Find your domain `metroexecucare.com`
3. Click **DNS** button next to the domain
4. You should see "DNS Management" page

**You're now ready to add DNS records!**

---

## 🔑 Step 2: Get DNS Records from Resend

### 2.1 Login to Resend
1. Go to [resend.com/login](https://resend.com/login)
2. Login with your Resend account

### 2.2 Add Your Domain
1. Click **Domains** in left sidebar
2. Click **Add Domain** button
3. Enter your domain: `metroexecucare.com`
4. Click **Add**

### 2.3 Get DNS Records
Resend will show 3 DNS records you need to add:

**Example records (yours will be different):**

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
TTL: 1 Hour
```

**DKIM Record:**
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ... (long key)
TTL: 1 Hour
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@metroexecucare.com
TTL: 1 Hour
```

⚠️ **IMPORTANT:** Copy YOUR actual values from Resend - don't use the examples above!

---

## ➕ Step 3: Add DNS Records to GoDaddy

### 3.1 Add SPF Record

1. On GoDaddy DNS Management page, click **Add** button
2. Select **Type: TXT**
3. Configure:
   - **Name:** `@` (this means root domain)
   - **Value:** `v=spf1 include:_spf.resend.com ~all`
   - **TTL:** 1 Hour (default is fine)
4. Click **Save**

### 3.2 Add DKIM Record

1. Click **Add** button again
2. Select **Type: TXT**
3. Configure:
   - **Name:** `resend._domainkey`
   - **Value:** [Paste the long DKIM key from Resend]
   - **TTL:** 1 Hour
4. Click **Save**

⚠️ **Common GoDaddy Issue:** If the DKIM value is too long, GoDaddy may truncate it. Solutions:
   - Try removing any spaces in the value
   - If still fails, contact GoDaddy support to manually add it
   - Alternative: Split the value into multiple TXT records (advanced)

### 3.3 Add DMARC Record

1. Click **Add** button again
2. Select **Type: TXT**
3. Configure:
   - **Name:** `_dmarc`
   - **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@metroexecucare.com`
   - **TTL:** 1 Hour
4. Click **Save**

### 3.4 Verify Your Records

Your GoDaddy DNS page should now show 3 new TXT records:
- `@` with SPF value
- `resend._domainkey` with DKIM value
- `_dmarc` with DMARC value

---

## ⏱️ Step 4: Wait for DNS Propagation

### What is DNS Propagation?
DNS propagation is the time it takes for DNS changes to spread across the internet.

### Timeline:
- **Minimum:** 5-15 minutes
- **Typical:** 30 minutes - 2 hours
- **Maximum:** 24-48 hours (rare)
- **GoDaddy Average:** ~30-60 minutes

### Check Propagation Status:
1. Go to [DNSChecker.org](https://dnschecker.org/)
2. Select **TXT** record type
3. Enter: `resend._domainkey.metroexecucare.com`
4. Click **Search**
5. Wait until you see green checkmarks in most locations

**💡 Tip:** You can continue to Step 5 while waiting, but verification won't succeed until propagation is complete.

---

## ✅ Step 5: Verify Domain in Resend

### 5.1 Verify in Resend Dashboard
1. Go back to [Resend Domains](https://resend.com/domains)
2. Find your domain `metroexecucare.com`
3. Click **Verify** button
4. Resend will check your DNS records

### 5.2 Expected Results:

**If DNS has propagated (✅ Success):**
```
✅ SPF Record: Verified
✅ DKIM Record: Verified
✅ DMARC Record: Verified
Status: Verified
```

**If DNS hasn't propagated yet (⏳ Wait):**
```
❌ SPF Record: Not found
❌ DKIM Record: Not found
Status: Pending
```

### 5.3 Troubleshooting Failed Verification:

**Problem:** Records not found after 2+ hours

**Solutions:**
1. **Check for typos:**
   - Go back to GoDaddy DNS Management
   - Verify record names exactly match (`@`, `resend._domainkey`, `_dmarc`)
   - Check for extra spaces in values

2. **Check TTL:**
   - Lower TTL = faster propagation
   - Change TTL to 600 seconds (10 minutes) if possible

3. **Force refresh:**
   - Delete the records in GoDaddy
   - Wait 5 minutes
   - Re-add them exactly as Resend specified

4. **Contact support:**
   - GoDaddy Support: [godaddy.com/help](https://www.godaddy.com/help)
   - Resend Support: support@resend.com

---

## 🚀 Step 6: Update Railway Environment Variables

### 6.1 Login to Railway
1. Go to [railway.app](https://railway.app)
2. Select your MetroExecuCare project
3. Click on your **backend service**
4. Go to **Variables** tab

### 6.2 Update FROM_EMAIL
1. Find `FROM_EMAIL` variable
2. Update value to:
   ```
   MetroExecuCare <noreply@metroexecucare.com>
   ```
3. Or use any email with your verified domain:
   ```
   MetroExecuCare <notifications@metroexecucare.com>
   MetroExecuCare <system@metroexecucare.com>
   MetroExecuCare <no-reply@metroexecucare.com>
   ```

### 6.3 Verify RESEND_API_KEY
Make sure this is already set:
```
RESEND_API_KEY=re_YourActualAPIKey
```

If not set, get it from [Resend API Keys](https://resend.com/api-keys)

### 6.4 Save and Redeploy
1. Click **Save** (or changes auto-save)
2. Railway will automatically redeploy
3. Wait 1-2 minutes for deployment to complete

---

## 🧪 Step 7: Test Email Sending

### 7.1 Test from Application

**Option A: Create Test Request (Full Workflow)**
1. Login as executive: `executive@metroexecucare.com`
2. Submit a new LOA request
3. Check if HR receives notification email

**Option B: Use Test Endpoint**
1. Visit: `https://your-backend.railway.app/api/test/email-templates`
2. View all email templates visually
3. Check Resend dashboard for sent emails

### 7.2 Check Railway Logs
1. Go to Railway → Backend Service → **Deployments** tab
2. Click on latest deployment
3. Look for logs:

**Success logs:**
```
✅ Email service initialized with Resend
📧 Email sent successfully via resend
   From: MetroExecuCare <noreply@metroexecucare.com>
   To: hr@metroexecucare.com
   Subject: New Request Notification
```

**Error logs (if domain not verified):**
```
❌ Failed to send email via resend
Error: The domain is not verified
Status Code: 403
```

### 7.3 Check Resend Dashboard
1. Go to [Resend Emails](https://resend.com/emails)
2. You should see sent emails listed
3. Click on email to see details:
   - Delivery status
   - Opens (if enabled)
   - Any errors

### 7.4 Check Recipient Inbox
1. Check the recipient's email (e.g., HR's inbox)
2. Look in **Inbox** and **Spam** folder
3. Email should arrive within seconds

**Email appearance:**
```
From: MetroExecuCare <noreply@metroexecucare.com>
Subject: New Executive Checkup Request
```

---

## 🎉 Success Checklist

Once everything is working, you should see:

- [x] ✅ Domain verified in Resend dashboard
- [x] ✅ All 3 DNS records showing "Verified"
- [x] ✅ FROM_EMAIL updated in Railway
- [x] ✅ Test email sent successfully
- [x] ✅ Email appears in Resend dashboard
- [x] ✅ Recipient receives email
- [x] ✅ Railway logs show success messages

**Congratulations! 🎊 Your email system is now fully operational!**

---

## 🔧 Common GoDaddy-Specific Issues

### Issue 1: DKIM Value Too Long

**Problem:** GoDaddy truncates long TXT record values

**Solution:**
1. Remove any line breaks or spaces in the DKIM value
2. Copy the entire value as one continuous string
3. If still fails, contact GoDaddy support: "I need to add a long TXT record for email authentication"

### Issue 2: Records Not Propagating

**Problem:** DNS changes not visible after hours

**Solution:**
1. Try using GoDaddy's "Quick Add" feature instead of manual add
2. Clear your local DNS cache:
   - Windows: `ipconfig /flushdns`
   - Mac: `sudo dscacheutil -flushcache`
3. Use GoDaddy's DNS template for email (if available)

### Issue 3: @ Symbol Not Working

**Problem:** GoDaddy doesn't accept @ in Name field

**Solution:**
- Leave Name field **empty** or use `@`
- Both mean "root domain" in GoDaddy
- Example: Empty Name = `metroexecucare.com`

### Issue 4: Duplicate Records Warning

**Problem:** GoDaddy warns about existing SPF record

**Solution:**
- Check if you already have an SPF record (`v=spf1...`)
- If yes, **merge** the records instead of adding a new one
- Example merge:
  ```
  Old: v=spf1 include:_spf.google.com ~all
  New: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
  ```

---

## 📞 Support Contacts

### GoDaddy Support
- **Phone:** 480-505-8877 (24/7)
- **Chat:** Available in your GoDaddy account
- **Help Center:** [godaddy.com/help](https://www.godaddy.com/help)

### Resend Support
- **Email:** support@resend.com
- **Docs:** [resend.com/docs](https://resend.com/docs)
- **Discord:** [discord.gg/resend](https://discord.gg/resend)

### Railway Support
- **Help:** [help.railway.app](https://help.railway.app)
- **Discord:** [discord.gg/railway](https://discord.gg/railway)

---

## 📚 Additional Resources

- **GoDaddy DNS Management Guide:** [godaddy.com/help/manage-dns](https://www.godaddy.com/help/manage-dns-680)
- **Resend Domain Verification:** [resend.com/docs/dashboard/domains](https://resend.com/docs/dashboard/domains/introduction)
- **DNS Propagation Checker:** [dnschecker.org](https://dnschecker.org)
- **SPF Record Checker:** [mxtoolbox.com/spf.aspx](https://mxtoolbox.com/spf.aspx)

---

## 🔄 Quick Reference: DNS Records

Copy these into GoDaddy (replace with YOUR values from Resend):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | @ | v=spf1 include:_spf.resend.com ~all | 1 Hour |
| TXT | resend._domainkey | [Your DKIM key from Resend] | 1 Hour |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:dmarc@metroexecucare.com | 1 Hour |

---

## ✅ Post-Setup Maintenance

### Monthly Checks:
- [ ] Verify emails are being delivered
- [ ] Check Resend usage (free tier: 3,000/month)
- [ ] Review bounce/spam rates in Resend dashboard

### Domain Renewal:
- [ ] Set GoDaddy auto-renewal to avoid domain expiration
- [ ] Domain expiration = email sending breaks immediately
- [ ] Add calendar reminder 30 days before renewal

### Security:
- [ ] Keep RESEND_API_KEY secure (never commit to git)
- [ ] Rotate API key every 6-12 months
- [ ] Monitor Resend dashboard for unusual activity

---

**Document Status:** Ready for implementation
**Last Updated:** January 12, 2025
**Tested With:** GoDaddy + Resend + Railway
**Estimated Setup Time:** 30-60 minutes
