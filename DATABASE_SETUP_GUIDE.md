# MetroExecuCare Database Setup Guide

## Overview
This guide helps developers set up the MySQL database for the MetroExecuCare application.

## Prerequisites
- MySQL Server 8.0 or higher
- MySQL Workbench (recommended)
- Node.js 16+ and npm

## Database Setup Instructions

### Step 1: Install MySQL
1. Download MySQL from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Install MySQL Server with default settings
3. Remember the root password you set during installation
4. Install MySQL Workbench from [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)

### Step 2: MySQL Workbench Setup

#### Creating a New Connection
1. Open MySQL Workbench
2. Click the **+** button next to "MySQL Connections"
3. Fill in the connection details:
   - **Connection Name**: `MetroExecuCare_Local`
   - **Hostname**: `localhost` (or `127.0.0.1`)
   - **Port**: `3306` (default)
   - **Username**: `root` (or create a new user)
   - **Password**: Click "Store in Keychain" and enter your MySQL root password
4. Click **Test Connection** to verify
5. Click **OK** to save the connection

#### Creating the Database
1. Double-click your connection to open it
2. In the query editor, run these commands:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS metroexecucare_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user for the application
CREATE USER IF NOT EXISTS 'metroexecu_user'@'localhost' IDENTIFIED BY 'capstoneDevelopers!01';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON metroexecucare_db.* TO 'metroexecu_user'@'localhost';
FLUSH PRIVILEGES;

-- Use the database
USE metroexecucare_db;
```

### Step 3: Import Database Schema

#### Option 1: Using the Schema File (Recommended)
1. In MySQL Workbench, open your connection
2. Go to **File** → **Open SQL Script**
3. Navigate to `Backend/config/database/schema.sql`
4. Click **Open**
5. Click the **Execute** button (⚡) or press `Ctrl+Shift+Enter`
6. The script will create the database, tables, and insert initial data

#### Option 2: Using MySQL Workbench Data Import
1. In MySQL Workbench, go to **Server** → **Data Import**
2. Select **Import from Self-Contained File**
3. Choose the `Backend/config/database/schema.sql` file
4. Select `metroexecucare_db` as the target schema (or create new schema)
5. Click **Start Import**

#### Option 3: Using Node.js Initialization (For Developers)
```bash
# In the Backend directory
node -e "require('./config/database/init').initializeDatabase()"
```

### Step 4: Environment Configuration

#### Copy Environment File
```bash
# In the Backend directory
cp .env.example .env
```

#### Edit .env File
Open the `.env` file and update these values:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=metroexecucare_db
DB_USER=metroexecu_user
DB_PASSWORD=capstoneDevelopers!01

# Generate new JWT secrets (use online generator or run: node -p "require('crypto').randomBytes(64).toString('hex')")
JWT_SECRET=your_new_64_character_secret_here
JWT_REFRESH_SECRET=your_new_64_character_refresh_secret_here

# Gmail Configuration (optional for email features)
GMAIL_USER_EMAIL=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

### Step 5: Install Dependencies and Start
```bash
# Backend
cd Backend
npm install
npm start

# Frontend (in a new terminal)
cd Frontend
npm install
npm run dev
```

## MySQL Workbench Tips

### Viewing Data
- Navigate to **Schemas** in the sidebar
- Expand `metroexecucare_db`
- Expand **Tables**
- Right-click any table → **Select Rows - Limit 1000**

### Backup Database
- Go to **Server** → **Data Export**
- Select `metroexecucare_db`
- Choose export options
- Click **Start Export**

### Monitoring Connections
- Go to **Server** → **Client Connections** to see active connections
- Use **Performance** → **Dashboard** to monitor database performance

## Troubleshooting

### Common Issues

#### Connection Refused
- Ensure MySQL service is running
- Check if port 3306 is available
- Verify firewall settings

#### Authentication Failed
- Verify username and password
- Check user privileges:
```sql
SHOW GRANTS FOR 'metroexecu_user'@'localhost';
```

#### Database Not Found
```sql
SHOW DATABASES;
```

#### Permission Errors
```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON metroexecucare_db.* TO 'metroexecu_user'@'localhost';
FLUSH PRIVILEGES;
```

## Security Notes

### For Development
- The provided credentials are for development only
- Never commit `.env` files to version control

### For Production
- Change all default passwords
- Use environment-specific configurations
- Enable SSL connections
- Regularly backup your database
- Monitor access logs

## Contact
If you encounter issues, check:
1. MySQL error logs
2. Application console output
3. Network connectivity
4. User permissions

## Additional Resources
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [MySQL Workbench Manual](https://dev.mysql.com/doc/workbench/en/)
- [Node.js MySQL2 Documentation](https://github.com/sidorares/node-mysql2)