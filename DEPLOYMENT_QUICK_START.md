# ⚡ Railway Deployment - Quick Start Checklist

**Total Time:** 15-20 minutes

---

## ✅ Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Railway account created (https://railway.app)
- [ ] GitHub connected to Railway

---

## 📝 Deployment Steps (Quick Reference)

### 1️⃣ **Create Railway Project**
```
New Project → Deploy from GitHub → Select metroexecucare repo
```

### 2️⃣ **Add MySQL Database**
```
+ New → Database → MySQL
Wait 30 seconds for deployment
```

### 3️⃣ **Deploy Backend**
```
+ New → GitHub Repo → metroexecucare
Root Directory: Backend
Deploy
```

**Backend Environment Variables:**
```bash
NODE_ENV=production
PORT=5000
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-secret>
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=30d
GMAIL_USER_EMAIL=metroexecucare@gmail.com
GMAIL_APP_PASSWORD=jmfh dwyb ouis pxyp
GMAIL_USE_APP_PASSWORD=true
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=<will-set-after-frontend>
```

**Generate JWT Secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4️⃣ **Get Backend URL**
```
Backend Service → Settings → Networking → Generate Domain
Copy URL (e.g., https://backend-xyz.railway.app)
```

### 5️⃣ **Initialize Database**
```bash
# Update Backend/.env with Railway MySQL credentials
cd Backend
node scripts/railway-init-db.js
# Type "yes" when prompted
```

### 6️⃣ **Deploy Frontend**
```
+ New → GitHub Repo → metroexecucare
Root Directory: Frontend
Deploy
```

**Frontend Environment Variables:**
```bash
VITE_API_BASE_URL=https://your-backend-url.railway.app/api
```

### 7️⃣ **Get Frontend URL & Update Backend**
```
Frontend Service → Settings → Networking → Generate Domain
Copy URL (e.g., https://frontend-xyz.railway.app)

Go back to Backend Service → Variables
Update: FRONTEND_URL=https://your-frontend-url.railway.app
```

### 8️⃣ **Test Deployment**
```
Open Frontend URL in browser
Login: admin@metroexecucare.com / Admin@123
```

---

## 🎯 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@metroexecucare.com | Admin@123 |
| HR | hr@metroexecucare.com | HR@123 |
| Benefits | benefits@metroexecucare.com | Benefits@123 |
| Welfare | welfare@metroexecucare.com | Welfare@123 |
| Executive | executive@metroexecucare.com | Executive@123 |

⚠️ **Change these immediately after first login!**

---

## 🔥 Quick Commands

### Push updates to Railway:
```bash
git add .
git commit -m "Update message"
git push origin main
# Railway auto-deploys!
```

### View logs:
```
Railway Dashboard → Service → Deployments → View Logs
```

### Restart service:
```
Railway Dashboard → Service → Settings → Restart
```

---

## 💰 Cost Estimate

- **Free tier:** $5 credit/month (usually enough!)
- **After free credit:** ~$5-10/month for small traffic

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check environment variables, especially database connection |
| Frontend can't reach backend | Verify VITE_API_BASE_URL and Backend FRONTEND_URL |
| CORS errors | Check Backend FRONTEND_URL matches your Frontend domain exactly |
| Database errors | Verify MySQL service is running and credentials are correct |
| Changes not reflecting | Push to GitHub, Railway auto-redeploys (check Deployments tab) |

---

## 📞 Need Help?

1. Read full guide: `RAILWAY_DEPLOYMENT_GUIDE.md`
2. Check logs in Railway dashboard
3. Railway docs: https://docs.railway.app
4. Railway Discord: https://discord.gg/railway

---

**🎉 You're all set! Your app is now live on Railway!**
