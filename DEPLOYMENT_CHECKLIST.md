# ✅ MetroExecuCare Railway Deployment Checklist

**Print this page and check off items as you complete them!**

---

## 🎯 Before You Start

- [ ] I have read `RAILWAY_DEPLOYMENT_GUIDE.md`
- [ ] I have a GitHub account
- [ ] I have a Railway account
- [ ] I have ~20 minutes available
- [ ] I have the project files ready

---

## Step 1: GitHub Setup

- [ ] Created GitHub repository named `metroexecucare`
- [ ] Set repository to Private
- [ ] Initialized Git in project folder
- [ ] Added all files to Git (`git add .`)
- [ ] Committed files (`git commit -m "Initial commit"`)
- [ ] Pushed to GitHub (`git push origin main`)
- [ ] Verified files are visible on GitHub

**GitHub URL:** ________________________________

---

## Step 2: Railway Account

- [ ] Signed up at https://railway.app
- [ ] Logged in with GitHub
- [ ] Authorized Railway to access GitHub
- [ ] Created new Railway project

**Railway Project Name:** ________________________________

---

## Step 3: MySQL Database

- [ ] Clicked "+ New" in Railway
- [ ] Selected "Database" → "Add MySQL"
- [ ] Waited for MySQL to deploy (~30 seconds)
- [ ] MySQL service shows "Active" status
- [ ] Noted down database credentials (in Variables tab)

**Database Status:** ⬜ Active  ⬜ Pending  ⬜ Error

---

## Step 4: Backend Deployment

- [ ] Clicked "+ New" → "GitHub Repo"
- [ ] Selected `metroexecucare` repository
- [ ] Set Root Directory to: `Backend`
- [ ] Clicked "Deploy"
- [ ] Deployment successful (shows "Active")

### Backend Environment Variables
- [ ] NODE_ENV=production
- [ ] PORT=5000
- [ ] DB_HOST=${{MySQL.MYSQLHOST}}
- [ ] DB_PORT=${{MySQL.MYSQLPORT}}
- [ ] DB_NAME=${{MySQL.MYSQLDATABASE}}
- [ ] DB_USER=${{MySQL.MYSQLUSER}}
- [ ] DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
- [ ] JWT_SECRET (generated new strong secret)
- [ ] JWT_REFRESH_SECRET (generated new strong secret)
- [ ] JWT_EXPIRE=24h
- [ ] JWT_REFRESH_EXPIRE=30d
- [ ] GMAIL_USER_EMAIL
- [ ] GMAIL_APP_PASSWORD
- [ ] GMAIL_USE_APP_PASSWORD=true
- [ ] MAX_FILE_SIZE=10485760
- [ ] UPLOAD_PATH=./uploads
- [ ] FRONTEND_URL (will update later)

### Generate JWT Secrets Command Used:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] Generated and saved JWT_SECRET
- [ ] Generated and saved JWT_REFRESH_SECRET

### Backend Domain
- [ ] Went to Settings → Networking
- [ ] Clicked "Generate Domain"
- [ ] Copied Backend URL

**Backend URL:** ________________________________

---

## Step 5: Database Initialization

- [ ] Updated local `.env` with Railway MySQL credentials
- [ ] Opened terminal in Backend folder
- [ ] Ran: `node scripts/railway-init-db.js`
- [ ] Typed "yes" when prompted
- [ ] Script completed successfully
- [ ] Saw confirmation of 5 default users created

**Database Init Status:** ⬜ Success  ⬜ Error

**Default User Credentials (MUST change these!):**
- [ ] Admin: admin@metroexecucare.com / Admin@123
- [ ] HR: hr@metroexecucare.com / HR@123
- [ ] Benefits: benefits@metroexecucare.com / Benefits@123
- [ ] Welfare: welfare@metroexecucare.com / Welfare@123
- [ ] Executive: executive@metroexecucare.com / Executive@123

---

## Step 6: Frontend Deployment

- [ ] Clicked "+ New" → "GitHub Repo"
- [ ] Selected `metroexecucare` repository
- [ ] Set Root Directory to: `Frontend`
- [ ] Clicked "Deploy"
- [ ] Deployment successful (shows "Active")

### Frontend Environment Variables
- [ ] VITE_API_BASE_URL (set to Backend URL + /api)

**VITE_API_BASE_URL value:** ________________________________

### Frontend Domain
- [ ] Went to Settings → Networking
- [ ] Clicked "Generate Domain"
- [ ] Copied Frontend URL

**Frontend URL:** ________________________________

---

## Step 7: Update Backend with Frontend URL

- [ ] Went back to Backend service
- [ ] Went to Variables tab
- [ ] Updated FRONTEND_URL variable with Frontend URL
- [ ] Backend redeployed automatically
- [ ] Backend shows "Active" again

---

## Step 8: Testing

### Initial Access
- [ ] Opened Frontend URL in browser
- [ ] Login page loads correctly
- [ ] No console errors (F12 to check)

### Admin Login Test
- [ ] Logged in as admin@metroexecucare.com
- [ ] Password: Admin@123
- [ ] Redirected to admin dashboard
- [ ] Dashboard loads correctly

### Feature Tests
- [ ] Can view users list
- [ ] Can create new user
- [ ] Can upload profile picture
- [ ] Can logout and login again

### HR Login Test
- [ ] Logged in as hr@metroexecucare.com
- [ ] Password: HR@123
- [ ] HR dashboard loads correctly
- [ ] Can view pending requests

### Executive Login Test
- [ ] Logged in as executive@metroexecucare.com
- [ ] Password: Executive@123
- [ ] Executive dashboard loads correctly
- [ ] Can request Letter of Approval
- [ ] Can upload files

**Overall Testing Status:** ⬜ All Pass  ⬜ Some Failures  ⬜ Major Issues

---

## Step 9: Security Updates

### Change Default Passwords
- [ ] Logged in as admin → Changed password
- [ ] Logged in as hr → Changed password
- [ ] Logged in as benefits → Changed password
- [ ] Logged in as welfare → Changed password
- [ ] Logged in as executive → Changed password

### Verify Security Settings
- [ ] JWT secrets are NOT the template values
- [ ] CORS is configured correctly (Frontend URL in Backend)
- [ ] Email credentials are correct
- [ ] All environment variables are set

---

## Step 10: Monitoring Setup

- [ ] Bookmarked Railway dashboard
- [ ] Checked "Usage" tab to see credit consumption
- [ ] Reviewed logs in each service
- [ ] Set up email notifications in Railway settings (optional)

**Current Credit Usage:** _________ / $5.00

---

## Step 11: Documentation

- [ ] Saved all URLs in a secure location
- [ ] Documented login credentials (encrypted/password manager)
- [ ] Shared Frontend URL with stakeholders
- [ ] Created user guide for end users (optional)

---

## 🎉 Deployment Complete!

**Completion Date:** ________________

**Completed By:** ________________

**Total Time Taken:** ________ minutes

**Final Status:** ⬜ Fully Operational  ⬜ Operational with Issues  ⬜ Failed

---

## 📝 Notes & Issues

Write down any issues encountered or special configurations:

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

_________________________________________________________________

---

## 🔄 Post-Deployment Tasks (To Do Later)

- [ ] Set up custom domain (optional)
- [ ] Implement cloud storage for file uploads
- [ ] Set up automated database backups
- [ ] Create user training materials
- [ ] Monitor for first week
- [ ] Gather user feedback
- [ ] Plan future enhancements

---

## 📞 Emergency Contacts

**If something goes wrong:**

1. Check Railway logs: Dashboard → Service → Deployments → View Logs
2. Review troubleshooting: `RAILWAY_DEPLOYMENT_GUIDE.md` Section 🔧
3. Railway Status: https://status.railway.app
4. Railway Discord: https://discord.gg/railway

---

**✅ Congratulations! Your MetroExecuCare application is now LIVE! 🚀**

**Your URLs:**
- **Frontend:** ________________________________
- **Backend:** ________________________________

**Share the Frontend URL with your users and start managing checkup requests!**
