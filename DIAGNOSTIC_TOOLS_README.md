# RENDR Platform Diagnostic Tools

## Overview
Comprehensive suite of diagnostic and debugging tools to quickly identify and resolve issues across the entire RENDR platform.

---

## 🔧 Available Tools

### 1. **Full Diagnostic Tool** (`diagnostic_tool.py`)
**Most comprehensive** - Checks everything and generates a detailed report.

```bash
python3 /app/diagnostic_tool.py
```

**What it checks:**
- ✅ Supervisor service status (frontend, backend)
- ✅ Backend API health
- ✅ MongoDB connection
- ✅ Environment variables (.env files)
- ✅ Critical API endpoints
- ✅ Frontend compilation status
- ✅ Frontend routes accessibility
- ✅ Recent error logs
- ✅ Stripe integration endpoints

**Output:**
- Color-coded terminal output
- JSON report saved to `/app/diagnostic_report_YYYYMMDD_HHMMSS.json`
- Exit code 0 (success) or 1 (errors found)

---

### 2. **Quick Health Check** (`quick_check.sh`)
**Fast** - Quick overview of system health in under 5 seconds.

```bash
/app/quick_check.sh
```

**What it checks:**
- Service status (running/stopped)
- Backend responding on port 8001
- Frontend responding on port 3000
- Recent error counts in logs
- MongoDB connection status

**Use when:**
- You need a quick status check
- Verifying services after restart
- Quick sanity check before deployment

---

### 3. **User Flow Tester** (`test_user_flow.sh`)
**End-to-end** - Tests critical user journeys.

```bash
/app/test_user_flow.sh
```

**What it tests:**
- Creator profile loading
- Creator videos endpoint
- Explore page functionality
- Premium folders endpoint
- Stripe webhook accessibility

**Use when:**
- Testing after new feature deployment
- Verifying critical paths work
- Quick smoke test

---

### 4. **Route Debugger** (`backend/debug_routes.py`)
**API mapping** - Lists all registered FastAPI routes.

```bash
python3 /app/backend/debug_routes.py
```

**What it shows:**
- All registered API endpoints
- HTTP methods for each route
- Route names and groupings

**Use when:**
- Debugging routing issues
- Verifying new endpoints are registered
- Understanding API structure

---

## 📊 Diagnostic Report Structure

When you run `diagnostic_tool.py`, it generates a JSON report:

```json
{
  "timestamp": "2025-11-27T03:10:51",
  "total_checks": 18,
  "errors": [
    "API endpoint returned: 404",
    "Premium Folders: 405 Method Not Allowed"
  ],
  "warnings": [
    "Backend Errors: 6 warnings found"
  ],
  "results": [
    {"status": "success", "message": "Backend root accessible: 200"}
  ]
}
```

---

## 🔍 Common Issues & Solutions

### Issue: "Supervisor check failed"
**Cause:** Script doesn't have sudo permissions
**Solution:** Run with proper permissions or check manually:
```bash
sudo supervisorctl status
```

### Issue: "Backend not responding"
**Symptoms:**
- Connection errors
- Timeout errors
- 502/503 errors

**Debug steps:**
1. Check if backend is running:
   ```bash
   sudo supervisorctl status backend
   ```

2. Check backend logs:
   ```bash
   tail -n 50 /var/log/supervisor/backend.err.log
   ```

3. Restart if needed:
   ```bash
   sudo supervisorctl restart backend
   ```

### Issue: "Frontend compilation failed"
**Symptoms:**
- Build errors in logs
- White screen in browser
- Import errors

**Debug steps:**
1. Check frontend logs:
   ```bash
   tail -n 100 /var/log/supervisor/frontend.out.log
   ```

2. Look for syntax errors or missing imports

3. Clear cache and restart:
   ```bash
   cd /app/frontend && rm -rf node_modules/.cache
   sudo supervisorctl restart frontend
   ```

### Issue: "MongoDB connection issues"
**Symptoms:**
- Database errors in logs
- "Connection refused" errors
- Data not loading

**Debug steps:**
1. Check MONGO_URL in `/app/backend/.env`
2. Verify MongoDB is running:
   ```bash
   sudo supervisorctl status | grep mongo
   ```
3. Check backend logs for connection errors:
   ```bash
   tail -n 50 /var/log/supervisor/backend.out.log | grep -i mongo
   ```

### Issue: "Stripe endpoints failing"
**Symptoms:**
- 405 Method Not Allowed
- 404 Not Found on Stripe routes
- Webhook not receiving events

**Debug steps:**
1. Check Stripe keys in `/app/backend/.env`:
   ```bash
   grep STRIPE /app/backend/.env
   ```

2. Verify webhook secret is set (starts with `whsec_`)

3. Check route registration:
   ```bash
   python3 /app/backend/debug_routes.py | grep stripe
   ```

4. Test webhook manually:
   ```bash
   curl -X POST https://verifyvideos.preview.emergentagent.com/api/stripe/webhook \
     -H "Content-Type: application/json" \
     -d '{"type": "test"}'
   ```

---

## 🚀 Quick Troubleshooting Workflow

When something goes wrong:

### Step 1: Quick Check (5 seconds)
```bash
/app/quick_check.sh
```

### Step 2: Full Diagnostic (30 seconds)
```bash
python3 /app/diagnostic_tool.py
```

### Step 3: Test User Flows (15 seconds)
```bash
/app/test_user_flow.sh
```

### Step 4: Check Specific Logs
```bash
# Backend errors
tail -n 100 /var/log/supervisor/backend.err.log

# Frontend errors
tail -n 100 /var/log/supervisor/frontend.err.log

# Backend output (MongoDB connection, startup messages)
tail -n 100 /var/log/supervisor/backend.out.log

# Frontend compilation
tail -n 100 /var/log/supervisor/frontend.out.log
```

### Step 5: Restart Services
```bash
# Restart specific service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend

# Restart all
sudo supervisorctl restart all
```

---

## 📝 Log File Locations

| Service | Output Log | Error Log |
|---------|-----------|-----------|
| Backend | `/var/log/supervisor/backend.out.log` | `/var/log/supervisor/backend.err.log` |
| Frontend | `/var/log/supervisor/frontend.out.log` | `/var/log/supervisor/frontend.err.log` |

**Useful log commands:**
```bash
# Last 50 lines
tail -n 50 /var/log/supervisor/backend.err.log

# Follow live (real-time)
tail -f /var/log/supervisor/backend.err.log

# Search for errors
grep -i error /var/log/supervisor/backend.err.log | tail -20

# Count errors
grep -i error /var/log/supervisor/backend.err.log | wc -l
```

---

## 🔬 Advanced Debugging

### Check Route Registration
```python
python3 /app/backend/debug_routes.py
```

### Manual API Testing
```bash
# Test endpoint
curl -v https://verifyvideos.preview.emergentagent.com/api/@/BrianJames

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://verifyvideos.preview.emergentagent.com/api/auth/me
```

### Check Environment Variables
```bash
# Backend
cat /app/backend/.env

# Frontend
cat /app/frontend/.env
```

### Database Connection Test
```bash
# Check MongoDB logs
tail -n 50 /var/log/supervisor/backend.out.log | grep -i mongo
```

---

## 🎯 Best Practices

1. **Run diagnostics before debugging manually**
   - Saves time by identifying the issue quickly
   - Provides structured output for troubleshooting

2. **Check logs in order**
   - Quick check → Full diagnostic → Specific logs
   - Avoid looking at everything at once

3. **Save diagnostic reports**
   - Reports are timestamped and saved automatically
   - Useful for comparing before/after states
   - Can be shared with team members

4. **Use appropriate tool for the task**
   - Quick check for status verification
   - Full diagnostic for troubleshooting
   - User flow tester for feature verification
   - Route debugger for API issues

5. **Restart services after changes**
   - Environment variable changes require restart
   - Code changes are hot-reloaded (no restart needed)
   - Clear caches if issues persist

---

## 💡 Tips

- **Color coding:** 
  - 🟢 Green = Success
  - 🟡 Yellow = Warning
  - 🔴 Red = Error
  - 🔵 Blue = Info

- **Exit codes:** Diagnostic tool returns 0 (success) or 1 (errors), useful for CI/CD

- **JSON reports:** Can be parsed by other tools for automation

- **Safe to run:** All tools are read-only and won't modify your system

---

## 🆘 Getting Help

If diagnostic tools show errors you can't resolve:

1. Check this README for common solutions
2. Review the diagnostic report JSON for details
3. Check specific log files mentioned in errors
4. Try restarting services
5. Clear caches if frontend issues persist

**Emergency restart (nuclear option):**
```bash
sudo supervisorctl restart all
cd /app/frontend && rm -rf node_modules/.cache build
```

---

## 📦 AWS Deployment Readiness

Before deploying to AWS, run:

```bash
# Full diagnostic
python3 /app/diagnostic_tool.py

# Test all user flows
/app/test_user_flow.sh
```

**Green light criteria:**
- ✅ All services running
- ✅ 0 critical errors
- ✅ All user flows passing
- ✅ Environment variables set
- ✅ Stripe integration working

---

## 🔄 Continuous Monitoring

**Recommended practice:**
- Run `quick_check.sh` after each deployment
- Run `diagnostic_tool.py` weekly
- Run `test_user_flow.sh` before major releases
- Keep diagnostic reports for historical comparison

---

**Created:** November 27, 2025
**Version:** 1.0
**Platform:** RENDR Creator Monetization Platform
