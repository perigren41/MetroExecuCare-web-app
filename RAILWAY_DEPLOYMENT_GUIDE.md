# 🚀 Railway Deployment Guide for MetroExecuCare

**Estimated Time:** 15-20 minutes
**Cost:** $5 free credit/month, then ~$5-10/month

---

## 📋 Prerequisites

Before you start, make sure you have:
- ✅ GitHub account
- ✅ Railway account (sign up at https://railway.app)
- ✅ This MetroExecuCare project pushed to GitHub

---

## 🎯 Deployment Overview

We'll deploy 3 services on Railway:
1. **MySQL Database** (stores all data)
2. **Backend API** (Node.js/Express server)
3. **Frontend** (React/Vite application)

---

## Step 1: Push Your Code to GitHub

### 1.1 Create a new GitHub repository
1. Go to https://github.com/new
2. Name it `metroexecucare` or any name you prefer
3. Set it to **Private** (recommended)
4. Don't initialize with README (we already have files)
5. Click **Create repository**

### 1.2 Push your local code to GitHub

```bash
cd "C:\Program Files\MetroExecuCare"

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - MetroExecuCare v1.3"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/metroexecucare.git

# Push to GitHub
git branch -M main
git push -u origin main
```

✅ **Checkpoint:** Your code should now be visible on GitHub!

---

## Step 2: Create Railway Account & Project

### 2.1 Sign up for Railway
1. Go to https://railway.app
2. Click **Login** → **Login with GitHub**
3. Authorize Railway to access your GitHub

### 2.2 Create a new project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Select your `metroexecucare` repository
4. Railway will show you a preview - **Don't deploy yet!**

---

## Step 3: Deploy MySQL Database

### 3.1 Add MySQL to your project
1. In your Railway project, click **+ New**
2. Select **Database** → **Add MySQL**
3. Railway will automatically provision a MySQL database
4. Wait ~30 seconds for it to deploy

### 3.2 Note the database credentials
1. Click on the **MySQL** service
2. Go to **Variables** tab
3. You'll see these variables (Railway auto-generates them):
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

✅ **Checkpoint:** MySQL database is running!

---

## Step 4: Deploy Backend API

### 4.1 Create Backend service
1. Click **+ New** → **GitHub Repo**
2. Select your `metroexecucare` repository
3. Railway will ask for the **Root Directory**
4. Enter: `Backend`
5. Click **Deploy**

### 4.2 Configure Backend environment variables
1. Click on your Backend service
2. Go to **Variables** tab
3. Click **+ New Variable** and add these one by one:

```
NODE_ENV=production
PORT=5000

# Database (Link to MySQL service)
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# JWT Secrets (IMPORTANT: Generate strong secrets!)
JWT_SECRET=your-super-strong-secret-key-change-this-to-something-very-random-and-long
JWT_REFRESH_SECRET=another-super-strong-secret-key-also-change-this-one-too
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=30d

# Gmail SMTP (use your existing credentials)
GMAIL_USER_EMAIL=metroexecucare@gmail.com
GMAIL_APP_PASSWORD=jmfh dwyb ouis pxyp
GMAIL_USE_APP_PASSWORD=true

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

**🔐 IMPORTANT:** Replace `JWT_SECRET` and `JWT_REFRESH_SECRET` with your own random strings!

You can generate strong secrets using this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4.3 Add Frontend URL (we'll update this later)
```
FRONTEND_URL=https://your-frontend-url.railway.app
```
(We'll get the actual URL after deploying the frontend)

### 4.4 Get your Backend URL
1. Go to **Settings** tab
2. Scroll to **Networking**
3. Click **Generate Domain**
4. Copy the URL (something like `https://your-backend.up.railway.app`)
5. Save this URL - you'll need it for the frontend!

✅ **Checkpoint:** Backend is deployed! Test it at `https://your-backend-url.railway.app/api/health`

---

## Step 5: Initialize Database

### 5.1 Run the initialization script locally
1. Update your local `.env` file with Railway database credentials:

```env
# Copy these from Railway MySQL Variables tab
DB_HOST=your-mysql-host.railway.app
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASSWORD=your-mysql-password
```

2. Run the initialization script:

```bash
cd "C:\Program Files\MetroExecuCare\Backend"
node scripts/railway-init-db.js
```

3. Type `yes` when prompted
4. Wait for completion (~30 seconds)

✅ **Checkpoint:** Database has all tables and default users created!

**Default Login Credentials:**
- Admin: `admin@metroexecucare.com` / `Admin@123`
- HR: `hr@metroexecucare.com` / `HR@123`
- Benefits: `benefits@metroexecucare.com` / `Benefits@123`
- Welfare: `welfare@metroexecucare.com` / `Welfare@123`
- Executive: `executive@metroexecucare.com` / `Executive@123`

⚠️ **Change these passwords after first login!**

---

## Step 6: Deploy Frontend

### 6.1 Create Frontend service
1. Back in Railway, click **+ New** → **GitHub Repo**
2. Select your `metroexecucare` repository again
3. For **Root Directory**, enter: `Frontend`
4. Click **Deploy**

### 6.2 Configure Frontend environment variables
1. Click on your Frontend service
2. Go to **Variables** tab
3. Add this variable (use your Backend URL from Step 4.4):

```
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

### 6.3 Generate Frontend Domain
1. Go to **Settings** tab
2. Scroll to **Networking**
3. Click **Generate Domain**
4. Copy the URL (something like `https://your-frontend.up.railway.app`)

### 6.4 Update Backend FRONTEND_URL
1. Go back to your **Backend service**
2. Go to **Variables** tab
3. Update the `FRONTEND_URL` variable with your Frontend URL:
```
FRONTEND_URL=https://your-frontend-url.railway.app
```
4. Backend will automatically redeploy

✅ **Checkpoint:** Frontend is deployed and connected to backend!

---

## Step 7: Test Your Deployment

### 7.1 Access your application
1. Open your Frontend URL in a browser: `https://your-frontend.railway.app`
2. You should see the MetroExecuCare login page

### 7.2 Test login
1. Try logging in with admin credentials:
   - Email: `admin@metroexecucare.com`
   - Password: `Admin@123`
2. You should be redirected to the admin dashboard

### 7.3 Test other features
- ✅ Create a new user
- ✅ Upload a file
- ✅ Submit a request
- ✅ Approve a request (with different role accounts)

---

## 🎉 Congratulations! Your App is Live!

Your MetroExecuCare application is now publicly accessible at:
- **Frontend:** `https://your-frontend.railway.app`
- **Backend API:** `https://your-backend.railway.app/api`

---

## 📊 Monitoring & Maintenance

### View Logs
1. Click on any service (Backend/Frontend/MySQL)
2. Go to **Deployments** tab
3. Click **View Logs** to see real-time logs

### Monitor Usage
1. Go to your project dashboard
2. Click **Usage** tab
3. See your credit usage and resource consumption

### Automatic Deployments
Railway automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
```
Railway detects the push and redeploys automatically!

---

## 💰 Cost Breakdown

**Free Tier ($5 credit/month):**
- MySQL: ~$1-2/month
- Backend: ~$2-3/month
- Frontend: ~$1-2/month
- **Total: ~$4-7/month** (covered by free credit!)

**After free credit:**
- You'll be charged based on actual usage
- Small traffic: $5-10/month
- Medium traffic: $10-20/month

---

## 🔧 Troubleshooting

### Backend won't start
**Problem:** Backend deployment fails or crashes
**Solution:**
1. Check logs in Railway dashboard
2. Verify all environment variables are set correctly
3. Make sure MySQL service is running
4. Check that `DB_HOST` uses Railway's internal hostname

### Frontend can't connect to backend
**Problem:** API requests fail with CORS or network errors
**Solution:**
1. Verify `VITE_API_BASE_URL` in Frontend variables
2. Make sure Backend has `FRONTEND_URL` set correctly
3. Check Backend logs for CORS errors

### Database connection errors
**Problem:** "Cannot connect to database"
**Solution:**
1. Verify MySQL service is running
2. Check database credentials in Backend variables
3. Make sure you're using Railway's MySQL variables format: `${{MySQL.MYSQLHOST}}`

### File uploads not working
**Problem:** Files upload but disappear after restart
**Solution:** This is expected - Railway's filesystem is ephemeral. For production, you need to:
1. Use Railway's Volume feature (paid)
2. Or use cloud storage (AWS S3, Cloudinary, etc.)

---

## 🔐 Security Checklist

Before going fully public, make sure you:
- [ ] Changed all default passwords
- [ ] Generated strong JWT secrets (not the template ones!)
- [ ] Set up proper email credentials (not shared ones)
- [ ] Reviewed and updated CORS settings if needed
- [ ] Enabled Railway's environment variable encryption
- [ ] Set up proper backup strategy for database

---

## 📞 Support

If you encounter issues:
1. Check Railway's status page: https://status.railway.app
2. Review Railway docs: https://docs.railway.app
3. Check the logs in Railway dashboard
4. Join Railway Discord: https://discord.gg/railway

---

## 🎯 Next Steps

After successful deployment:
1. ✅ Share your Frontend URL with users
2. ✅ Set up custom domain (optional, $0.01/month)
3. ✅ Configure automatic backups for MySQL
4. ✅ Set up monitoring and alerts
5. ✅ Implement cloud storage for file uploads (if needed)

---

**Your MetroExecuCare app is now live and accessible worldwide! 🌍**
