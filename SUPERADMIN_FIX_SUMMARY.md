# SuperAdmin Login Fix - Summary

## Issues Fixed

### 1. **Missing SuperAdmin Role in Auth Routes** ⚠️ CRITICAL
**Problem:** The SuperAdmin role was missing from the authentication middleware in auth routes, preventing SuperAdmins from accessing basic endpoints like `/auth/me` and `/change-password`.

**Fixed in:** `apps/api/src/routes/auth.route.ts`

**Changes:**
- Added `UserRole.SuperAdmin` to `/auth/me` endpoint
- Added `UserRole.SuperAdmin` to `/auth/change-password` endpoint

### 2. **Missing SuperAdmin Role in Notification Routes**
**Problem:** SuperAdmin couldn't access notification endpoints.

**Fixed in:** `apps/api/src/routes/notification.route.ts`

**Changes:**
- Added `UserRole.SuperAdmin` to GET `/` endpoint
- Added `UserRole.SuperAdmin` to POST `/mark-all-read` endpoint

### 3. **Employee ID Generation for Non-Employees**
**Problem:** The User model was generating employee IDs for ALL users including SuperAdmin and Admin, who shouldn't have employee IDs.

**Fixed in:** `apps/api/src/models/user.model.ts`

**Changes:**
- Modified the `pre('save')` middleware to only generate `employee_id` for employee roles (Emp, Supervisor, SupervisorAdmin)
- SuperAdmin and Admin users will NOT get an `employee_id`

## Created Files

### 1. **SuperAdmin Creation Script**
**Location:** `apps/api/src/scripts/createSuperAdmin.ts`

**Purpose:** A utility script to create or update a SuperAdmin user in the database.

**Usage:**
```bash
npx ts-node apps/api/src/scripts/createSuperAdmin.ts
```

**Default Credentials:**
- Email: superadmin@tms.com
- Password: SuperAdmin@123
- Role: SuperAdmin

**Features:**
- Checks if SuperAdmin already exists
- Prompts to update password if one exists
- Creates new SuperAdmin if none exists
- Sets proper fields (no employee_id for SuperAdmin)

## How to Use

### Option 1: Create SuperAdmin via Script (Recommended)
```bash
cd /Users/rashmithakaushalya/Documents/Allion/tms
npx ts-node apps/api/src/scripts/createSuperAdmin.ts
```

### Option 2: Manual Database Creation
If you prefer to create the SuperAdmin manually in MongoDB:

```javascript
db.users.insertOne({
  firstName: "Super",
  lastName: "Admin",
  email: "superadmin@tms.com",
  password: "$2b$10$..." // hashed password
  role: "superAdmin",
  designation: "Super Administrator",
  contactNumber: "+1234567890",
  status: true,
  isVerified: true,
  isChangedPwd: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Testing the Fix

1. **Start the API server:**
   ```bash
   nx serve api
   ```

2. **Login as SuperAdmin:**
   ```
   POST /auth/login
   {
     "email": "superadmin@tms.com",
     "password": "SuperAdmin@123"
   }
   ```

3. **Verify access to protected endpoints:**
   - GET `/auth/me` - Should return SuperAdmin user details
   - POST `/auth/change-password` - Should allow password change
   - GET `/api/notifications` - Should work
   - All other endpoints with SuperAdmin role should work

## Routes with SuperAdmin Access

### ✅ Already Had SuperAdmin Access:
- `/api/user/admin` (POST, GET)
- `/api/user/active` (GET)
- `/api/user/all` (GET)
- `/api/user/:id` (PATCH)
- `/api/project/*` (all project routes)
- `/api/timesheets/*` (all timesheet routes)
- `/api/team/*` (all team routes)
- `/api/reports/*` (all report routes)

### ✅ Fixed to Include SuperAdmin:
- `/auth/me` (GET)
- `/auth/change-password` (POST)
- `/api/notifications` (GET)
- `/api/notifications/mark-all-read` (POST)

## Notes

- The SuperAdmin role value is `"superAdmin"` (camelCase) as defined in `libs/shared/src/enums/roles.enum.ts`
- SuperAdmins do NOT get an `employee_id` field
- SuperAdmins have full access to all endpoints
- Remember to change the default password after first login

## Security Recommendations

1. Change the default SuperAdmin password immediately after creation
2. Use strong passwords for SuperAdmin accounts
3. Limit the number of SuperAdmin users
4. Consider implementing 2FA for SuperAdmin accounts
5. Audit SuperAdmin access logs regularly
