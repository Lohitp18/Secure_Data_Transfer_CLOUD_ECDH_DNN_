# 🔍 Diagnose Server Connection Issue

## Quick Check - Is Server Actually Running?

### Step 1: Check Server Console

Look at the terminal where you started the server. You should see:
```
Server listening on http://localhost:5000
MongoDB connected to ...
```

**If you don't see this, the server isn't running!**

### Step 2: Test in Browser

Open your browser and go to:
```
http://localhost:5000/api/health
```

**Expected:** You should see `{"ok":true}` or similar JSON

**If you see:**
- ❌ "Can't reach this page" → Server is NOT running
- ❌ "404 Not Found" → Server is running but route is wrong
- ❌ "ERR_CONNECTION_REFUSED" → Server is NOT running

### Step 3: Check Server Port

Open PowerShell and run:
```powershell
netstat -ano | findstr :5000
```

**If you see output** → Port 5000 is in use (server might be running)
**If no output** → Port 5000 is free (server is NOT running)

---

## Common Issues & Fixes

### Issue 1: Server Started But Stopped

**Symptoms:**
- You started server but it crashed
- Console shows error messages

**Fix:**
1. Check server console for error messages
2. Common errors:
   - MongoDB connection failed
   - Port already in use
   - Missing dependencies

**Solution:**
```bash
# Check MongoDB is running
# Or update MONGO_URL in .env file

# If port in use, kill process:
# Windows: Find PID from netstat, then:
taskkill /PID <process_id> /F
```

---

### Issue 2: Server Running on Different Port

**Check server console output:**
```
Server listening on http://localhost:XXXX
```

**If port is different (not 5000):**
- Set environment variable:
```powershell
$env:SERVER_URL="http://localhost:XXXX"
```

Or update `setup_and_verify.py` to use the correct port.

---

### Issue 3: Firewall Blocking Connection

**Symptoms:**
- Browser can't connect
- Python scripts can't connect

**Fix:**
1. Check Windows Firewall settings
2. Allow Node.js through firewall
3. Or temporarily disable firewall to test

---

### Issue 4: Server URL Mismatch

**Check what URL the script is trying:**

The script uses:
- Default: `http://localhost:5000`
- Can be overridden: `$env:SERVER_URL="http://localhost:5000"`

**Verify:**
1. Check server is on port 5000 (look at server console)
2. Check SERVER_URL environment variable
3. Try setting it explicitly:
```powershell
$env:SERVER_URL="http://localhost:5000"
python setup_and_verify.py
```

---

## Manual Test Steps

### Test 1: Browser Test
1. Start server: `cd server && npm start`
2. Wait for "Server listening..." message
3. Open browser: `http://localhost:5000/api/health`
4. Should see JSON response

### Test 2: PowerShell Test
```powershell
# Test connection
curl http://localhost:5000/api/health

# Or use Invoke-WebRequest
Invoke-WebRequest -Uri http://localhost:5000/api/health
```

### Test 3: Python Test
```powershell
python -c "import requests; print(requests.get('http://localhost:5000/api/health').json())"
```

---

## Debug Checklist

- [ ] Server console shows "Server listening on http://localhost:5000"
- [ ] Browser can access http://localhost:5000/api/health
- [ ] Port 5000 shows as "LISTENING" in netstat
- [ ] No firewall blocking connection
- [ ] SERVER_URL environment variable is correct (or not set)
- [ ] MongoDB is connected (check server console)

---

## Still Not Working?

1. **Check server logs** - Look for error messages in server console
2. **Check MongoDB** - Server needs MongoDB connection
3. **Try restarting** - Stop server (Ctrl+C) and start again
4. **Check dependencies** - Make sure all npm packages installed

---

## Quick Fix Script

Run this in PowerShell to check everything:

```powershell
# Check if server is running
netstat -ano | findstr :5000

# Test connection
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -UseBasicParsing
    Write-Host "✅ Server is accessible! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Cannot connect: $_"
    Write-Host "Server is not running or not accessible"
}
```

---

**Share the output of these tests to get more help!**

