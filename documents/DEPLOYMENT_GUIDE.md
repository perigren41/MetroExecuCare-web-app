# MetroExecuCare Deployment Guide
**Quick Start Guide for Hosting the Application Online**

---

## 🚀 Fastest Way to Get Online (30 Minutes)

### Prerequisites
- GitHub account
- Git installed on your computer
- Your MetroExecuCare project code

---

## Option 1: Railway + Vercel (Recommended - Easiest)

### Why This Option?
- ✅ **Free to start** ($5 Railway credit, unlimited Vercel)
- ✅ **No server management** - everything is automatic
- ✅ **HTTPS included** - secure by default
- ✅ **Fast deployment** - live in 10-15 minutes
- ✅ **Perfect for testing** and small-scale production

---

### Step-by-Step Instructions

#### Part 1: Push Your Code to GitHub (5 minutes)

```bash
# 1. Navigate to your project folder
cd "C:\Program Files\MetroExecuCare"

# 2. Initialize git (if not already done)
git init

# 3. Create .gitignore file
# Add these lines to .gitignore:
node_modules/
.env
*.log
dist/
build/

# 4. Add all files
git add .

# 5. Commit
git commit -m "Initial commit - MetroExecuCare v1.3"

# 6. Create repository on GitHub.com
# Go to github.com → New Repository → Name it "MetroExecuCare"

# 7. Link to GitHub
git remote add origin https://github.com/YOUR_USERNAME/MetroExecuCare.git
git branch -M main
git push -u origin main
```

---

#### Part 2: Deploy Backend to Railway (10 minutes)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Sign in with GitHub

2. **Deploy Backend**
   - Click "Deploy from GitHub repo"
   - Select your MetroExecuCare repository
   - Railway will detect Node.js automatically

3. **Add MySQL Database**
   - In your project, click "+ New"
   - Select "Database" → "MySQL"
   - Railway will create a database automatically

4. **Configure Environment Variables**
   - Click on your backend service
   - Go to "Variables" tab
   - Add these variables:

   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_USER=${{MySQL.MYSQL_USER}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   DB_NAME=${{MySQL.MYSQL_DATABASE}}
   DB_PORT=${{MySQL.MYSQL_PORT}}
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-32-characters
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-gmail-app-password
   FRONTEND_URL=https://your-app.vercel.app
   ```

   **Note:** Railway automatically injects MySQL variables using `${{MySQL.VARIABLE}}`

5. **Get Your Backend URL**
   - Go to "Settings" → "Public Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://metroexecucare-production.up.railway.app`)

6. **Import Database**
   - In Railway, open MySQL service
   - Click "Data" → "Query"
   - Copy and paste your database schema SQL
   - Run the migration script

---

#### Part 3: Deploy Frontend to Vercel (10 minutes)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your MetroExecuCare repository
   - Click "Import"

3. **Configure Build Settings**
   - **Framework Preset:** Vite
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variable**
   - Before deploying, add:
   ```
   VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
   ```
   (Use the Railway URL from Part 2, Step 5)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your site will be live at `https://your-project.vercel.app`

---

#### Part 4: Final Configuration (5 minutes)

1. **Update CORS in Backend**
   - In Railway, add to environment variables:
   ```
   FRONTEND_URL=https://your-project.vercel.app
   ```

2. **Update Backend URL in Railway**
   - Make sure `FRONTEND_URL` points to your Vercel URL

3. **Test Your Application**
   - Visit your Vercel URL
   - Try logging in
   - Submit a test request
   - Check if emails are working

---

## Option 2: Render (All-in-One Alternative)

### Why Render?
- Everything in one place (frontend, backend, database)
- Similar pricing to Railway
- Good for beginners

### Quick Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Services:**
   - New → Web Service → Connect GitHub
   - Create one for Backend (Node.js)
   - Create one for Frontend (Static Site)

3. **Create Database:**
   - New → PostgreSQL or MySQL
   - Get connection string

4. **Configure Environment Variables**
   - Same as Railway configuration above

5. **Deploy**
   - Render automatically builds and deploys

**Estimated Cost:** $7-25/month

---

## Option 3: DigitalOcean App Platform

### Why DigitalOcean?
- More powerful than free tiers
- Great documentation
- Good for scaling

### Quick Steps:

1. **Create Account at [digitalocean.com](https://digitalocean.com)**
   - Use promo code for $200 credit (60 days)

2. **Create App:**
   - Apps → Create App → GitHub
   - Select repository

3. **Configure Components:**
   - Add Backend service (Node.js)
   - Add Frontend service (Static Site)
   - Add Managed Database (MySQL)

4. **Environment Variables:**
   - Same as Railway setup

5. **Deploy**
   - DigitalOcean handles everything

**Estimated Cost:** $12-25/month

---

## Troubleshooting Common Issues

### Issue 1: Database Connection Failed
**Solution:**
- Check if DATABASE_URL or individual DB variables are set correctly
- Make sure database is in the same region as your app
- Verify firewall rules allow connections

### Issue 2: CORS Errors
**Solution:**
```javascript
// In Backend/server.js, add:
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue 3: Build Fails on Vercel
**Solution:**
- Check that `Frontend` is set as root directory
- Verify all dependencies are in package.json
- Check build logs for specific error

### Issue 4: Email Not Sending
**Solution:**
- Verify Gmail App Password is correct
- Enable "Less secure app access" in Gmail (or use App Password)
- Check GMAIL_USER and GMAIL_APP_PASSWORD variables

### Issue 5: 404 on Page Refresh
**Solution:**
```json
// Add vercel.json in Frontend folder:
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Cost Comparison

| Platform | Free Tier | Paid (Basic) | Best For |
|----------|-----------|--------------|----------|
| **Railway + Vercel** | $5 credit/month | $10-20/month | Quick start, testing |
| **Render** | 750 hours/month | $7-25/month | Simple all-in-one |
| **DigitalOcean** | $200 credit (2 months) | $12-25/month | Production ready |
| **AWS** | 12 months free | $20-50/month | Enterprise scale |
| **VPS (Hostinger)** | No free tier | $5-12/month | Full control |

---

## My Recommendation for You

### For Testing/Demo (Next 30 minutes):
→ **Use Railway + Vercel** (Fastest, free to start)

### For Production (When ready):
→ **Use DigitalOcean** (Good balance of cost, performance, and support)

### For Long-term/Enterprise:
→ **Use AWS** (Most scalable, best security for healthcare data)

---

## Next Steps After Deployment

1. **Set up custom domain:**
   - Buy domain from Namecheap ($10/year)
   - Point DNS to Vercel/Railway
   - Enable HTTPS (automatic)

2. **Set up monitoring:**
   - Use Sentry for error tracking (free tier)
   - Use Uptime Robot for uptime monitoring (free)

3. **Set up backups:**
   - Railway: Automatic backups included
   - DigitalOcean: Enable automatic backups
   - AWS: Configure RDS snapshots

4. **Security:**
   - Enable 2FA on all platforms
   - Rotate JWT secrets regularly
   - Set up rate limiting
   - Regular security updates

---

## Need Help?

### Railway Support:
- Discord: railway.app/discord
- Docs: docs.railway.app

### Vercel Support:
- Discord: vercel.com/discord
- Docs: vercel.com/docs

### Email Me:
If you encounter issues during deployment, document:
- Error messages (full text)
- Platform you're using
- Steps you've taken
- Screenshots if possible

---

**Last Updated:** January 2025
**Difficulty:** Easy (Railway + Vercel) | Medium (DigitalOcean) | Advanced (AWS)
**Time Required:** 30 minutes to 2 hours depending on platform
