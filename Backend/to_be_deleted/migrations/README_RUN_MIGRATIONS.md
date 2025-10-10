# Database Migrations - Run Instructions

## Important: Run These Migrations on Railway Database

These migrations add necessary columns to your database to track user deletions and restorations properly.

### Migration File to Run:
- **add_deletion_tracking_fields.sql** - Adds deletion and restoration tracking fields

### How to Run the Migration on Railway:

#### Option 1: Using Railway MySQL CLI (Recommended)
1. Go to your Railway dashboard
2. Click on your MySQL database service
3. Click on the "Data" tab
4. Click on "Query" or "Console" button
5. Copy and paste the entire contents of `add_deletion_tracking_fields.sql`
6. Execute the query

#### Option 2: Using MySQL Workbench or Similar Tool
1. Get your Railway database credentials from the Railway dashboard
2. Connect to your Railway MySQL database using MySQL Workbench
3. Open the `add_deletion_tracking_fields.sql` file
4. Execute the entire script

#### Option 3: Using Command Line
```bash
# Get your Railway database credentials first
# Then connect using mysql client:
mysql -h [HOST] -u [USER] -p[PASSWORD] [DATABASE] < add_deletion_tracking_fields.sql
```

### What This Migration Does:
- Adds `deleted_at` column to track when a user was deleted
- Adds `deletion_reason` column to store why the user was deleted
- Adds `deleted_by` column to track which admin deleted the user
- Adds `restored_at` column to track when a user was restored
- Adds `restoration_reason` column to store why the user was restored
- Adds `restored_by` column to track which admin restored the user
- Creates necessary indexes for performance

### Verify Migration Success:
After running the migration, you should see output showing the new columns:
```
COLUMN_NAME          | DATA_TYPE | IS_NULLABLE | COLUMN_DEFAULT
---------------------|-----------|-------------|---------------
deleted_at           | timestamp | YES         | NULL
deletion_reason      | text      | YES         | NULL
deleted_by           | int       | YES         | NULL
restored_at          | timestamp | YES         | NULL
restoration_reason   | text      | YES         | NULL
restored_by          | int       | YES         | NULL
```

### After Running the Migration:
The following features will now work properly:
- ✅ Deletion reasons will be saved and displayed in the Deleted Users modal
- ✅ Deletion date and time will be tracked
- ✅ You'll see who deleted each user
- ✅ Restoration reasons will be tracked
- ✅ You'll see who restored each user

### Important Notes:
- **This migration is idempotent** - You can run it multiple times safely. It will only add columns that don't already exist.
- **No data will be lost** - This only adds new columns, doesn't modify or delete existing data
- **Existing deleted users** will have NULL values for deletion_reason and deleted_at (because those weren't tracked before)
- **New deletions** (after running this migration) will have all the tracking information
