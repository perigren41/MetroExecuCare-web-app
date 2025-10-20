# Database Migration Instructions - Phase 1 & Phase 2

## Prerequisites
- ✅ Code changes already deployed to Railway (commit `8ab0856`)
- ✅ Railway application should be running with new code
- ⚠️ Backup verification script ready: `Backend/migrations/verify_backups.sql`

---

## Option 1: Using Railway CLI (Recommended)

### Step 1: Install Railway CLI (if not installed)
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Link to Your Project
```bash
cd "C:\Program Files\MetroExecuCare"
railway link
```
- Select your MetroExecuCare project from the list

### Step 4: Connect to MySQL Database
```bash
railway connect mysql
```
This will open a MySQL shell connected to your Railway database.

### Step 5: Run Phase 1 Migration
Once in the MySQL shell, load and execute the Phase 1 script:

```sql
source Backend/migrations/phase1_cleanup_unused_columns.sql
```

**OR** if `source` doesn't work, copy-paste the entire content of `phase1_cleanup_unused_columns.sql` into the MySQL shell.

### Step 6: Verify Phase 1 Backups
```sql
-- Quick verification
SELECT COUNT(*) FROM notifications_backup_phase1;
SELECT COUNT(*) FROM request_assignments_backup_phase1;
```

### Step 7: Run Phase 2 Migration
```sql
source Backend/migrations/phase2_remove_hospital_duplication.sql
```

**OR** copy-paste the entire content of `phase2_remove_hospital_duplication.sql`.

### Step 8: Verify Phase 2 Backup
```sql
-- Quick verification
SELECT COUNT(*) FROM checkup_requests_backup_phase2;
```

### Step 9: Run Complete Verification Script
```sql
source Backend/migrations/verify_backups.sql
```

### Step 10: Exit MySQL Shell
```sql
exit;
```

---

## Option 2: Using Railway Web Dashboard

### Step 1: Access Railway Dashboard
1. Go to https://railway.app/dashboard
2. Login to your account
3. Select your **MetroExecuCare** project

### Step 2: Open MySQL Database
1. Click on your **MySQL** service/plugin
2. Click on the **"Data"** tab or **"Connect"** tab
3. You should see database connection options

### Step 3: Use Query Interface (if available)
Some Railway MySQL plugins have a built-in query interface:
1. Look for a "Query" or "SQL" tab
2. Copy the content of `Backend/migrations/phase1_cleanup_unused_columns.sql`
3. Paste and execute
4. Verify results
5. Repeat for `phase2_remove_hospital_duplication.sql`
6. Run verification with `verify_backups.sql`

### Step 4: Alternative - Use External MySQL Client
If Railway doesn't have a query interface:

1. **Get Connection Details** from Railway dashboard:
   - Host (e.g., `containers-us-west-xxx.railway.app`)
   - Port (e.g., `6789`)
   - Username (usually `root`)
   - Password (from environment variables)
   - Database name (e.g., `railway`)

2. **Connect using MySQL Workbench, DBeaver, or any MySQL client**:
   ```
   Host: [from Railway]
   Port: [from Railway]
   User: root
   Password: [from Railway]
   Database: railway
   ```

3. **Execute the migration scripts** in order:
   - `phase1_cleanup_unused_columns.sql`
   - `phase2_remove_hospital_duplication.sql`
   - `verify_backups.sql`

---

## Option 3: Using MySQL Command Line with Connection String

### Step 1: Get MySQL Connection URL
From your Railway dashboard:
1. Go to your MySQL service
2. Copy the **DATABASE_URL** or connection string
   - Format: `mysql://root:password@host:port/database`

### Step 2: Connect via Command Line
```bash
# Windows (using mysql.exe if installed)
mysql -h [HOST] -P [PORT] -u root -p[PASSWORD] [DATABASE_NAME]

# Example:
mysql -h containers-us-west-123.railway.app -P 6789 -u root -pYOUR_PASSWORD railway
```

### Step 3: Run Migration Scripts
```sql
source C:/Program Files/MetroExecuCare/Backend/migrations/phase1_cleanup_unused_columns.sql
source C:/Program Files/MetroExecuCare/Backend/migrations/phase2_remove_hospital_duplication.sql
source C:/Program Files/MetroExecuCare/Backend/migrations/verify_backups.sql
```

---

## Expected Results After Migration

### Phase 1 Expected Output:
```
✅ Backup created: notifications_backup_phase1
✅ Backup created: request_assignments_backup_phase1
✅ Dropped 7 columns from notifications
✅ Dropped 4 columns from request_assignments
```

### Phase 2 Expected Output:
```
✅ Backup created: checkup_requests_backup_phase2
✅ Dropped 3 columns from checkup_requests (hospital_name, hospital_address, hospital_contact)
✅ Foreign keys intact: hospital_id, hr_assigned_hospital_id
✅ JOIN queries working correctly
```

### Verification Script Expected Output:
```
✅ MATCH - notifications record count matches backup
✅ MATCH - request_assignments record count matches backup
✅ MATCH - checkup_requests record count matches backup
✅ Hospital columns successfully removed from checkup_requests
✅ 3 backup tables created
✅ Total records backed up: [number]
✅ Backup size: [size] MB
```

---

## Post-Migration Testing Checklist

### Test 1: Letter of Authorization (New Hospital)
1. Login as Executive employee
2. Submit Letter of Authorization request
3. HR processes request with NEW hospital (name not in system)
4. Verify hospital is created in database
5. Verify request shows correct hospital info

### Test 2: Letter of Authorization (Existing Hospital)
1. Login as Executive employee
2. Submit Letter of Authorization request
3. HR processes request with EXISTING hospital (auto-fill)
4. Verify request uses existing hospital_id
5. Verify no duplicate hospital created

### Test 3: Letter of Approval (Accredited Hospital)
1. Login as Executive employee
2. Submit Letter of Approval request
3. HR processes request with accredited hospital
4. Verify request shows correct hospital info

### Test 4: View Request History
1. Login as HR/Executive
2. View request history
3. Verify all hospital names/addresses display correctly
4. Verify no "undefined" or null values

### Test 5: Edit Request
1. Login as HR
2. Edit an existing Letter of Authorization request
3. Change hospital selection
4. Verify changes save correctly

---

## Rollback Instructions (If Needed)

### If Something Goes Wrong After Phase 1:
```sql
-- Restore notifications from backup
DROP TABLE IF EXISTS notifications;
CREATE TABLE notifications AS SELECT * FROM notifications_backup_phase1;

-- Restore request_assignments from backup
DROP TABLE IF EXISTS request_assignments;
CREATE TABLE request_assignments AS SELECT * FROM request_assignments_backup_phase1;

-- You'll need to recreate indexes and foreign keys after restore
```

### If Something Goes Wrong After Phase 2:
```sql
-- Restore checkup_requests from backup
DROP TABLE IF EXISTS checkup_requests;
CREATE TABLE checkup_requests AS SELECT * FROM checkup_requests_backup_phase2;

-- You'll need to recreate indexes and foreign keys after restore
```

**IMPORTANT**: If you need to rollback, you must also revert the code changes on Railway by pushing the previous commit.

---

## Backup Retention Policy

**Keep backup tables for 30 days**, then drop them to free up space:

```sql
-- After 30 days, when you're confident everything works:
DROP TABLE IF EXISTS notifications_backup_phase1;
DROP TABLE IF EXISTS request_assignments_backup_phase1;
DROP TABLE IF EXISTS checkup_requests_backup_phase2;
```

---

## Troubleshooting

### Issue: "Table doesn't exist" error
- **Cause**: Migration script ran out of order
- **Solution**: Check which tables exist, ensure Phase 1 runs before Phase 2

### Issue: "Foreign key constraint fails"
- **Cause**: Trying to drop column referenced by FK
- **Solution**: The migration scripts handle this, but verify FK relationships first

### Issue: "Column doesn't exist" error
- **Cause**: Column already dropped or migration ran twice
- **Solution**: Check current schema, skip already-completed steps

### Issue: Connection timeout
- **Cause**: Railway database sleeping or connection limit
- **Solution**: Retry connection, check Railway service status

### Issue: Backup verification shows MISMATCH
- **Cause**: Data was modified between backup creation and verification
- **Solution**: This is normal if system is in use, verify timestamp differences

---

## Support

If you encounter issues:
1. Check Railway logs for application errors
2. Verify database connection is active
3. Check backup tables exist before proceeding
4. Run verification script after each phase
5. Test one feature at a time after migration

**Contact**: Check Railway dashboard for real-time database metrics and logs