# MetroExecuCare - Developer Setup Guide

## Quick Start for New Developers

### 1. Prerequisites
- **Node.js** 16+ and npm
- **MySQL Server** 8.0+
- **MySQL Workbench** (recommended)
- **Git** for version control

### 2. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/perigren41/MetroExecuCare-web-app.git
cd MetroExecuCare-web-app

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

### 3. Database Setup

#### Quick Method (MySQL Workbench)
1. Open MySQL Workbench
2. Create a new connection:
   - **Connection Name**: `MetroExecuCare_Local`
   - **Hostname**: `localhost`
   - **Port**: `3306`
   - **Username**: `root` (or your MySQL username)
   - **Password**: Your MySQL password
3. Connect to the database
4. Go to **File** → **Open SQL Script**
5. Select `Backend/config/database/schema.sql`
6. Click **Execute** (⚡) to run the script

This will create:
- Database: `metroexecucare_db`
- User: `metroexecu_user` with password: `capstoneDevelopers!01`
- All tables with sample data
- Default admin user: `admin@metroexecucare.com` / `admin123`

### 4. Environment Configuration
```bash
# In Backend directory
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
# Database (use these if you ran the schema.sql)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=metroexecucare_db
DB_USER=metroexecu_user
DB_PASSWORD=capstoneDevelopers!01

# Generate new JWT secrets (use: node -p "require('crypto').randomBytes(64).toString('hex')")
JWT_SECRET=your_64_character_secret_here
JWT_REFRESH_SECRET=your_64_character_refresh_secret_here

# Email (optional - for notifications)
GMAIL_USER_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### 5. Start the Application
```bash
# Terminal 1: Start Backend
cd Backend
npm start
# Server runs on http://localhost:5000

# Terminal 2: Start Frontend
cd Frontend
npm run dev
# App runs on http://localhost:3000
```

### 6. Test the Setup
1. Open http://localhost:3000 in your browser
2. Click "Login"
3. Use default admin credentials:
   - **Email**: `admin@metroexecucare.com`
   - **Password**: `admin123`

## Project Structure
```
MetroExecuCare/
├── Backend/                 # Node.js + Express API
│   ├── config/
│   │   └── database/        # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth, validation middleware
│   ├── routes/             # API routes
│   └── .env                # Environment variables (create from .env.example)
├── Frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── webpages/       # Page components
│   │   └── services/       # API services
└── Database Setup Files/
    ├── .env.example        # Template for environment variables
    ├── schema.sql          # Complete database schema
    └── DATABASE_SETUP_GUIDE.md # Detailed setup instructions
```

## Common Issues & Solutions

### Database Connection Error
```bash
# Check if MySQL is running
# Windows: services.msc → MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Port Already in Use
```bash
# Backend (port 5000)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Frontend (port 3000)
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### JWT Secret Generation
```bash
# Generate secure JWT secrets
node -p "require('crypto').randomBytes(64).toString('hex')"
```

### Email Configuration (Optional)
1. Enable 2-factor authentication on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character app password (not your Gmail password)

## Development Workflow

### Making Changes
```bash
# Always work on a feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Commit and push
git add .
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
```

### Database Changes
- Edit `Backend/config/database/manual-schema.js` for schema changes
- Run `node -e "require('./config/database/init').resetDatabase()"` to reset
- Or manually run SQL commands in MySQL Workbench

### API Testing
- Backend API docs: http://localhost:5000/api/health
- Use Postman or similar tools for API testing
- Check `Backend/routes/` for available endpoints

## Important Notes

### Security
- **Never commit `.env` files** - they contain sensitive data
- Change default passwords in production
- Generate new JWT secrets for production

### Environment Files
- `.env` - Your local configuration (ignored by git)
- `.env.example` - Template for other developers (committed to git)

### Database Credentials (Development Only)
- Database: `metroexecucare_db`
- Username: `metroexecu_user`
- Password: `capstoneDevelopers!01`
- Admin User: `admin@metroexecucare.com` / `admin123`

**⚠️ These are development credentials only. Never use in production!**

## Need Help?

1. Check the detailed [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md)
2. Review error logs in terminal/console
3. Check if all services are running (MySQL, Node.js)
4. Verify your `.env` configuration
5. Test database connection in MySQL Workbench

## Next Steps

After setup:
1. Explore the admin panel at http://localhost:3000
2. Check the HR dashboard functionality
3. Test the LOA request submission process
4. Review the codebase structure
5. Start developing your features!