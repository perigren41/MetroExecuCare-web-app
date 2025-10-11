# Resend Domain Requirement Documentation

**Date:** October 12, 2025
**Issue:** Email notifications not being sent despite Resend configuration
**Status:** Requires Custom Domain Purchase

---

## 🚨 Problem Summary

After successfully configuring Resend as our email provider for Railway deployment, emails are still not being sent. The system shows:

```
✅ Email service initialized with Resend
```

But when attempting to send emails, we receive:

```
❌ Failed to send email via resend
Error: "The [domain] is not verified. Please, add and verify your domain on https://resend.com/domains"
Status Code: 403
```

---

## 🔍 Root Cause Analysis

### What We Tried:

1. **Using custom domain:** `noreply@metroexecucare.com`
   - ❌ Failed: Domain not owned/verified
   - Error: "The metroexecucare.com domain is not verified"

2. **Using Gmail address:** `metroexecucare@gmail.com`
   - ❌ Failed: Gmail domain requires verification too
   - Error: "The gmail.com domain is not verified"

3. **Using Resend test domain:** `onboarding@resend.dev`
   - ⚠️ Works BUT with severe limitations:
   - Can only send to manually verified email addresses
   - Not suitable for production use
   - Cannot send to public/customer emails

### Key Discovery:

**Resend requires domain verification for ALL email addresses**, including popular providers like Gmail, Outlook, and Yahoo. This is different from other email services and was unexpected.

---

## ✅ Solution: Purchase and Verify Custom Domain

To send emails in production with Resend, we **must** purchase and verify a custom domain.

### Why We Need This:

1. **Production Email Sending:** Send to ANY email address without pre-verification
2. **Professional Appearance:** Emails from `noreply@metroexecucare.com` vs `onboarding@resend.dev`
3. **No Recipient Limits:** Can send to all users (HR, executives, employees)
4. **Railway Compatibility:** Resend works perfectly on Railway once domain is verified

---

## 💰 Domain Purchase Options

### Recommended Registrars:

| Registrar | Price (.com) | Why Choose |
|-----------|-------------|------------|
| **Cloudflare** | $9.77/year | Cheapest, excellent DNS, at-cost pricing |
| **Namecheap** | $10.98/year | User-friendly, frequent discounts |
| **Porkbun** | $9.13/year | No hidden fees, simple |

### Recommended Domain Options:

**Using `metroexecucare` with different extensions:**

| Domain | Price/Year | Pros | Cons |
|--------|-----------|------|------|
| `metroexecucare.com` | $9-15 | Most professional, trusted | Slightly expensive |
| `metroexecucare.net` | $10-13 | Professional alternative | Less common |
| `metroexecucare.org` | $10-13 | Trustworthy for healthcare | Typically for non-profits |
| `metroexecucare.co` | $8-12 | Short, modern | Less recognized |
| `metroexecucare.app` | $14-18 | Modern, tech-focused | Newer extension |
| `metroexecucare.xyz` | $1-3 | CHEAPEST option | Less professional |
| `metroexecucare.online` | $3-5 | Very cheap | Less professional |
| `metroexecucare.site` | $2-4 | Very cheap | Less professional |

**Recommended for Production:**
1. **Best:** `metroexecucare.com` - Most professional and trusted
2. **Good Alternative:** `metroexecucare.net` or `metroexecucare.co` - Still professional, slightly cheaper
3. **Budget Option:** `metroexecucare.xyz` or `metroexecucare.online` - Works fine for emails, very cheap

**All of these will work with Resend!** The domain extension doesn't matter for email functionality - only for professional appearance.

---

## 📋 Setup Process (After Domain Purchase)

### Step 1: Add Domain to Resend

1. Login to [Resend Dashboard](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your purchased domain (e.g., `metroexecucare.com`)
4. Resend will provide DNS records to add

### Step 2: Configure DNS Records

Resend will require these DNS records:

**SPF Record (TXT):**
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record (TXT):**
```
Name: resend._domainkey
Type: TXT
Value: [provided by Resend]
```

**DMARC Record (TXT):**
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@metroexecucare.com
```

### Step 3: Add DNS Records to Domain Registrar

- Go to your domain registrar's DNS management
- Add all records provided by Resend
- Wait for DNS propagation (5 minutes - 24 hours, usually ~15 minutes)

### Step 4: Verify Domain in Resend

- Return to Resend dashboard
- Click "Verify Domain"
- Resend will check DNS records
- Status should change to "Verified" ✅

### Step 5: Update Railway Environment Variables

```bash
FROM_EMAIL=MetroExecuCare <noreply@metroexecucare.com>
RESEND_API_KEY=re_your_api_key_here
```

### Step 6: Test Email Sending

- Trigger a test email (create new request)
- Check Railway logs for success message
- Verify email appears in Resend dashboard
- Confirm recipient receives email

---

## 📊 Current Configuration Status

### What's Working:
- ✅ Resend integration in codebase
- ✅ RESEND_API_KEY configured in Railway
- ✅ Email provider properly initialized
- ✅ Fallback to Gmail SMTP disabled

### What's Blocking:
- ❌ No verified domain for sending emails
- ❌ Cannot send to production email addresses
- ❌ Emails fail with 403 Forbidden error

### Required Action:
- 🛒 **Purchase custom domain** (~$10/year)
- 🔧 **Verify domain in Resend**
- ✉️ **Update FROM_EMAIL configuration**

---

## 🔄 Temporary Workaround (Testing Only)

If domain purchase is delayed, we can use Resend's test domain temporarily:

### Configuration:
```bash
FROM_EMAIL=onboarding@resend.dev
```

### Manual Email Verification Required:

1. Go to [Resend Email Verification](https://resend.com/emails)
2. Add these emails one by one:
   - `hr@metroexecucare.com`
   - `executive@metroexecucare.com`
   - `benefits@metroexecucare.com`
   - `jomarperigren41@gmail.com` (your test email)
3. Check each inbox and click verification link
4. Only verified emails can receive notifications

### Limitations:
- ⚠️ Can only send to verified addresses
- ⚠️ Not suitable for production
- ⚠️ Cannot send to new users without manual verification
- ⚠️ Unprofessional sender address

---

## 💡 Why We Chose Resend (Despite Domain Requirement)

Despite the domain verification requirement, Resend is still the best choice for Railway:

### Advantages:
1. ✅ **No SMTP Port Blocking:** Uses HTTPS API (port 443) instead of SMTP (ports 587/465)
2. ✅ **Railway Compatible:** Works perfectly on Railway's infrastructure
3. ✅ **Modern API:** Better error handling and logging
4. ✅ **Reliable Delivery:** Better deliverability than SMTP
5. ✅ **Free Tier:** 100 emails/day, 3,000 emails/month
6. ✅ **Dashboard Analytics:** Track email delivery and opens

### Why Not Gmail SMTP:
- ❌ Railway blocks SMTP ports (587/465)
- ❌ Connection timeout errors
- ❌ No delivery confirmation
- ❌ Less reliable on cloud platforms

---

## 📝 Related Issues

- **Initial Problem:** [After_DEPLOYMENT_ISSUE.md](./After_DEPLOYMENT_ISSUE.md) - HIGH PRIORITY email sending issue
- **Railway Logs:** Connection timeout with Gmail SMTP
- **Database Errors:** Notification type truncation (FIXED)
- **SMTP Configuration:** Environment variable mismatch (FIXED)

---

## 📞 Support Resources

- **Resend Documentation:** https://resend.com/docs
- **Resend Domain Verification:** https://resend.com/docs/dashboard/domains/introduction
- **DNS Propagation Checker:** https://dnschecker.org/
- **Resend Support:** support@resend.com

---

## 🎯 Next Steps

1. **Decision Required:** Purchase domain or use temporary workaround?
2. **If Purchasing:**
   - Choose registrar (recommend Cloudflare)
   - Buy `metroexecucare.com` or alternative
   - Follow setup process above
3. **If Temporary:**
   - Set `FROM_EMAIL=onboarding@resend.dev`
   - Verify recipient emails in Resend dashboard
   - Plan for domain purchase before production launch

---

## 📅 Timeline Estimate

**With Domain Purchase:**
- Domain purchase: 5-10 minutes
- DNS configuration: 10 minutes
- DNS propagation: 15 minutes - 24 hours (usually ~30 minutes)
- Testing: 5 minutes
- **Total: 30 minutes - 24 hours**

**With Temporary Workaround:**
- Email verification: 2 minutes per email
- Testing: 5 minutes
- **Total: ~15 minutes**

---

**Document Status:** Active - Awaiting domain purchase decision
**Last Updated:** October 12, 2025
**Next Review:** After domain purchase or workaround implementation
