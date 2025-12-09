# RENDR Technical Reference Document
## CRITICAL - Read Before Making ANY Changes

**Last Updated:** December 2025
**Purpose:** Prevent duplicate errors and ensure consistency across all development

---

## 1. DATABASE CONFIGURATION

### Connection Details
```
Database Name: test_database  (NOT "rendr")
Connection: mongodb://localhost:27017
Environment Variable: DB_NAME="test_database"
```

### CRITICAL: When Creating Records
```python
# CORRECT - Use test_database
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient(os.environ.get('MONGO_URL'))
db = client.test_database  # OR client[os.environ.get('DB_NAME', 'test_database')]

# WRONG - Do NOT use
db = client.rendr  # This is a DIFFERENT database!
```

---

## 2. USER SCHEMA

### Primary Key Convention
```
Field: _id
Type: STRING (UUID format, NOT ObjectId)
Example: "bd763e13-1f30-4c3a-9c06-8ff93fd09485"
```

### CRITICAL: When Creating Users
```python
from uuid import uuid4

# CORRECT
user = {
    "_id": str(uuid4()),  # String UUID as _id
    "email": "user@example.com",
    "password_hash": hashed_password,  # Use passlib, NOT bcrypt directly
    "username": "username",
    "display_name": "Display Name",
    # ... other fields
}

# WRONG - Do NOT use
user = {
    "user_id": str(uuid4()),  # This creates a DIFFERENT field
    # MongoDB will auto-generate ObjectId for _id
}
```

### Complete User Schema
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| _id | str | YES | UUID string - THIS IS THE PRIMARY KEY |
| email | str | YES | Unique |
| password_hash | str | YES | Use passlib.hash() |
| username | str | YES | Unique, used for login |
| display_name | str | YES | Public display name |
| premium_tier | str | NO | "free", "pro", "enterprise" |
| account_type | str | NO | "free", "creator", "investor", "ceo" |
| bio | str | NO | User bio |
| profile_picture | str/None | NO | Path to profile image |
| showcase_settings | dict | NO | {"layout": "grid", "theme": "modern"} |
| wallet_address | str/None | NO | Blockchain wallet |
| roles | list | NO | ["creator", "investor", "ceo", "admin"] |
| created_at | str | YES | ISO format datetime string |
| updated_at | str | YES | ISO format datetime string |

### Password Hashing
```python
# CORRECT - Use passlib
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password_hash = pwd_context.hash(password)

# Verify
is_valid = pwd_context.verify(password, stored_hash)

# WRONG - Do NOT use bcrypt directly (different format)
import bcrypt
bcrypt.hashpw(...)  # Creates incompatible hash format
```

---

## 3. VIDEO SCHEMA

### ID Fields
| Field | Purpose |
|-------|---------|
| _id | MongoDB document ID (string UUID) |
| id | Redundant copy (legacy, being phased out) |
| user_id | Reference to user._id (owner) |
| folder_id | Reference to folder._id |
| showcase_folder_id | Reference to showcase_folder._id |

### Complete Video Schema
| Field | Type | Notes |
|-------|------|-------|
| _id | str | UUID string |
| user_id | str | Owner's _id |
| verification_code | str | "RND-XXXXXX" format |
| title | str | Video title |
| description | str | Video description |
| source | str | "upload", "url", etc. |
| uploaded_at | datetime | MongoDB datetime |
| hashes | dict | All hash values |
| storage | dict | Storage info with expires_at |
| thumbnail_path | str | Path to thumbnail |
| folder_id | str/None | Organization folder |
| showcase_folder_id | str/None | Showcase folder |
| is_public | bool | Visibility |
| on_showcase | bool | Show on public page |

---

## 4. FOLDER SCHEMA

| Field | Type | Notes |
|-------|------|-------|
| _id | str | UUID string |
| folder_name | str | Display name |
| user_id | str | Owner's _id |
| username | str | Owner's username |
| order | int | Sort order |
| created_at | str | ISO datetime |

---

## 5. API PATTERNS

### Authentication
```python
# JWT contains:
{
    "user_id": user["_id"],  # The _id field
    "email": user["email"],
    "username": user["username"],
    "exp": expiry_timestamp
}

# Roles are NOT in JWT - must query database
async def get_user_roles(current_user, db):
    user_id = current_user.get("user_id")
    user = await db.users.find_one({"_id": user_id}, {"roles": 1})
    return user.get("roles", []) if user else []
```

### Query Patterns
```python
# Find user by _id (from JWT)
user = await db.users.find_one({"_id": user_id})

# Find videos by user
videos = await db.videos.find({"user_id": user_id}).to_list(None)

# Always exclude MongoDB _id in JSON responses
result = await db.users.find({}, {"_id": 0}).to_list(None)  # Excludes _id
# OR handle serialization
```

---

## 6. EXISTING ACCOUNTS

### Test Accounts in test_database
| Username | Password | Roles | Notes |
|----------|----------|-------|-------|
| BrianJames | Brian123! | ceo, investor, admin | Primary admin |
| InvestorUser | SecureInvestor$1 | investor | Investor demo |
| Brian | (check db) | creator | Test creator |
| test | (check db) | creator | Test user |

---

## 7. ENVIRONMENT VARIABLES

### Backend (.env)
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
JWT_SECRET="rendr-secret-key-change-in-production"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://rendr-verify-1.preview.emergentagent.com
```

### Supervisor Config
**CRITICAL:** Check `/etc/supervisor/conf.d/supervisord.conf` for hardcoded URLs
- If login fails with CORS/Network errors, check this file FIRST

---

## 8. COMMON MISTAKES TO AVOID

### Database Selection
- Always use `test_database`, not `rendr`
- Check `DB_NAME` env variable
- The mongodb.py file uses `os.getenv("DB_NAME", "test_database")`

### User ID Fields
- Use `_id` as the primary key (string UUID)
- Do NOT create a separate `user_id` field for users
- Videos reference users via `user_id` field pointing to `users._id`

### Password Hashing
- Use passlib's CryptContext, not raw bcrypt
- Existing passwords were hashed with passlib

### JWT Token
- Does NOT contain user roles
- Must query database for roles
- Contains: user_id, email, username, exp

### Role Verification
- Cannot check `current_user.get("roles")` from JWT
- Must fetch from database: `await db.users.find_one({"_id": user_id}, {"roles": 1})`

---

## 9. FILE LOCATIONS

### Key Backend Files
- `/app/backend/server.py` - Main FastAPI app, router registration
- `/app/backend/database/mongodb.py` - Database connection
- `/app/backend/utils/security.py` - Auth utilities, JWT
- `/app/backend/api/auth.py` - Login/signup endpoints
- `/app/backend/api/admin_analytics.py` - CEO/Investor dashboards
- `/app/backend/api/pathway.py` - SSB endpoints

### Key Frontend Files
- `/app/frontend/src/App.js` - Routes
- `/app/frontend/src/pages/` - Page components
- `/app/frontend/.env` - REACT_APP_BACKEND_URL

### Configuration Files
- `/app/backend/.env` - Backend environment
- `/app/frontend/.env` - Frontend environment
- `/etc/supervisor/conf.d/supervisord.conf` - Service config (CAREFUL!)

---

## 10. VERIFICATION CHECKLIST

Before creating any database records:
- [ ] Using `test_database` (not `rendr`)
- [ ] Using `_id` as primary key for users (not `user_id`)
- [ ] `_id` is a string UUID (not ObjectId)
- [ ] Using passlib for password hashing
- [ ] Checking existing schema patterns first

Before modifying auth/roles:
- [ ] Roles are fetched from database, not JWT
- [ ] Query uses `{"_id": user_id}` pattern
- [ ] Role check includes fallback for missing roles

Before any deployment:
- [ ] Check `/etc/supervisor/conf.d/supervisord.conf` for hardcoded URLs
- [ ] Verify `.env` files have correct values
- [ ] Restart services after env changes

---

## 11. QUICK COMMANDS

### Check Database
```bash
cd /app/backend && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
async def check():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client.test_database
    print('Collections:', await db.list_collection_names())
    print('Users:', await db.users.count_documents({}))
asyncio.run(check())
"
```

### Check User Schema
```bash
cd /app/backend && python3 -c "
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
async def check():
    db = AsyncIOMotorClient('mongodb://localhost:27017').test_database
    user = await db.users.find_one({'username': 'BrianJames'})
    for k,v in user.items(): print(f'{k}: {type(v).__name__}')
asyncio.run(check())
"
```

### Test Login
```bash
curl -s -X POST "http://localhost:8001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"BrianJames","password":"Brian123!"}' | python3 -m json.tool
```

---

**IMPORTANT:** When in doubt, CHECK THE EXISTING DATA before creating new records. Run the quick commands above to verify patterns.
