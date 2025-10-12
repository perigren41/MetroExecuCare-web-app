# GoDaddy DNS Fixes Needed - URGENT

**Date:** January 12, 2025
**Issue:** SPF record pointing to Amazon SES instead of Resend
**Status:** 🔴 Blocking email verification

---

## 🚨 Critical Fix Required: SPF Record

### Current Problem:
Your SPF record is configured for Amazon SES (a different email service), not Resend.

**What you have:**
```
Type: TXT
Name: @
Value: v=spf1 include:amazonses.com ~all  ❌ WRONG
```

**What you need:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all  ✅ CORRECT
```

### How to Fix in GoDaddy:

#### Option A: Edit Existing Record (RECOMMENDED)
1. Go to GoDaddy DNS Management
2. Find the TXT record with:
   - Name: `@`
   - Value: `v=spf1 include:amazonses.com ~all`
3. Click the **pencil/edit icon** on the right
4. Change the value to: `v=spf1 include:_spf.resend.com ~all`
5. Click **Save**

#### Option B: Delete and Re-add (If edit doesn't work)
1. Click the **trash icon** to delete the old SPF record
2. Wait 2 minutes
3. Click **Add** button
4. Select Type: **TXT**
5. Configure:
   - **Name:** `@`
   - **Value:** `v=spf1 include:_spf.resend.com ~all`
   - **TTL:** 1 Hour
6. Click **Save**

---

## ⚠️ Optional Fix: Remove Duplicate DMARC

You have TWO `_dmarc` records. You only need ONE.

### Keep This One:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: 1 Hour
```

### Delete This One:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
TTL: 1 Hour
```

**Why:** Multiple DMARC records can cause conflicts. Keep the simpler one.

**How to Delete:**
1. Find the longer `_dmarc` record with `p=quarantine`
2. Click the **trash icon**
3. Confirm deletion

---

## ✅ Current Status (From Your Screenshots)

### What's Working:
- ✅ **DKIM Record:** Verified in Resend
- ✅ **Domain Added:** metroexecucare.xyz in Resend
- ✅ **DNS Records Added:** All 3 records present in GoDaddy

### What's Pending:
- ⏳ **SPF Record:** Pending (wrong value - needs fix)
- ⏳ **MX Record:** Pending (optional - only needed for receiving emails)
- ⏳ **Overall Status:** Pending (blocked by SPF)

---

## 🎯 After Fixing SPF Record

### Wait for DNS Propagation:
- **Time:** 15-30 minutes typically
- **Check:** Use [dnschecker.org](https://dnschecker.org)
- **Search for:** TXT record of `metroexecucare.xyz`
- **Look for:** `v=spf1 include:_spf.resend.com ~all`

### Verify in Resend:
1. Go to [Resend Domains](https://resend.com/domains)
2. Find your domain: `metroexecucare.xyz`
3. Click **Restart** button (if available)
4. Wait for status to update

### Expected Result:
```
✅ SPF Record: Verified
✅ DKIM Record: Verified
✅ Status: Verified
```

DMARC will remain "Recommended" (not required) but that's okay - it doesn't block email sending.

---

## 🚫 About MX Record (Optional)

**What Resend Shows:**
```
Type: MX
Host: send
Value: feedback-smtp.ap-north...
Status: Pending
```

**Do You Need This?**
- **For SENDING emails:** ❌ No
- **For RECEIVING emails at metroexecucare.xyz:** ✅ Yes

**Recommendation:**
- Skip this for now if you only need to SEND emails
- Your application sends emails but doesn't receive them
- MX records are for receiving emails (like having an inbox)

**If You Want to Add It Anyway:**
1. In GoDaddy, click **Add**
2. Select Type: **MX**
3. Configure:
   - **Name:** `send`
   - **Value:** `feedback-smtp.ap-northeast-1.amazonses.com`
   - **Priority:** `10`
   - **TTL:** 1 Hour
4. Click **Save**

---

## ❓ About "Easily verify domain ownership" in GoDaddy

**Question:** Is this useful for Resend verification?

**Answer:** **No, you don't need this.**

This GoDaddy feature is for services like:
- Google Workspace (Gmail for business)
- Microsoft 365 (Outlook for business)
- Website builders (Wix, Squarespace)
- Some hosting providers

**For Resend:**
- You verify by adding DNS records manually (which you already did)
- Resend checks the DNS records directly
- No need for GoDaddy's verification feature

---

## 🔍 Why Was Amazon SES SPF There?

Possible reasons:
1. You previously used Amazon SES for emails
2. GoDaddy's default email settings include it
3. Someone else configured it before
4. It was there from a previous service

**Action:** Just replace it with Resend's SPF record.

---

## ✅ Quick Checklist

After fixing, verify these:

### In GoDaddy DNS:
- [ ] SPF record uses `_spf.resend.com` (not `amazonses.com`)
- [ ] DKIM record shows `resend._domainkey` (already verified ✅)
- [ ] Only ONE `_dmarc` record present
- [ ] All records have TTL: 1 Hour or Auto

### In Resend Dashboard:
- [ ] SPF shows "Verified" ✅
- [ ] DKIM shows "Verified" ✅ (already done)
- [ ] Status shows "Verified" ✅
- [ ] No errors or warnings

### In Railway:
- [ ] FROM_EMAIL=MetroExecuCare <noreply@metroexecucare.xyz>
- [ ] RESEND_API_KEY is set
- [ ] Backend redeployed after domain verification

---

## 🧪 Test After Verification

Once SPF is verified and status shows "Verified":

1. **Test via Railway:**
   - Visit: `https://your-backend.railway.app/api/test/email-templates`
   - Or submit a test LOA request as executive

2. **Check Resend Dashboard:**
   - Go to [Resend Emails](https://resend.com/emails)
   - Look for sent emails
   - Check delivery status

3. **Check Recipient Inbox:**
   - Test with your Gmail: jomarperigren41@gmail.com
   - Check both Inbox and Spam folders
   - Email should arrive within seconds

---

## 📞 Need Help?

If SPF doesn't verify after 1 hour:

1. **Double-check the value:**
   - Must be exactly: `v=spf1 include:_spf.resend.com ~all`
   - No extra spaces
   - No typos

2. **Check DNS propagation:**
   - Use [dnschecker.org](https://dnschecker.org)
   - Type: TXT
   - Domain: metroexecucare.xyz
   - Should show the new SPF value

3. **Contact support:**
   - GoDaddy Support: 480-505-8877
   - Resend Support: support@resend.com

---

## ⏱️ Timeline

- **Fix SPF record:** 2 minutes
- **Remove duplicate DMARC:** 1 minute
- **DNS propagation:** 15-30 minutes
- **Verify in Resend:** 1 minute
- **Test emails:** 2 minutes

**Total:** ~20-35 minutes until emails work

---

**Action Required:** Fix SPF record ASAP - this is blocking email verification!
**Priority:** 🔴 Critical
**Estimated Time:** 2 minutes to fix, 30 minutes to propagate
