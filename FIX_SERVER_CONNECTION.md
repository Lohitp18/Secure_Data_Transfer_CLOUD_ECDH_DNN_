# 🔧 Fix "Server Not Running" Issue

## Quick Diagnosis

Even though your server is running, `setup_and_verify.py` shows it's not. Let's fix this!

---

## Step 1: Verify Server is Actually Running

### Check Server Console

Look at the terminal where you started the server. You should see:
```
Server listening on http://localhost:5000
```

**If you don't see this message, the server isn't running!**

### Quick Test - PowerShell

Run this in PowerShell:
```powershell
.\test-server.ps1
```

Or manually test:
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/health"
```

**Expected:** Should return JSON like `{"ok":true}`

---

## Step 2: Check What Port Server is On

Look at your server console output. It should show:
```
Server listening on http://localhost:XXXX
```

**Note the port number (should be 5000)**

If it's a different port, update the environment variable:
```powershell
$env:SERVER_URL="http://localhost:XXXX"
```

---

## Step 3: Test Browser Connection

Open your browser and go to:
```
http://localhost:5000/api/health
```

**What do you see?**
- ✅ JSON response (`{"ok":true}`) → Server IS running!
- ❌ "Can't reach this page" → Server is NOT running
- ❌ Connection refused → Server is NOT running

---

## Step 4: Fix the Setup Script

The script might be using the wrong URL. Update it:

### Option A: Set Environment Variable (Easiest)

Before running `setup_and_verify.py`, set the server URL:

**PowerShell:**
```powershell
$env:SERVER_URL="http://localhost:5000"
python setup_and_verify.py
```

**CMD:**
```cmd
set SERVER_URL=http://localhost:5000
python setup_and_verify.py
```

### Option B: Edit the Script Directly

Open `setup_and_verify.py` and change line 13:
```python
SERVER_URL = "http://localhost:5000"  # Force it instead of using env var
```

### Option C: Use 127.0.0.1 Instead

Sometimes `localhost` doesn't work. Try:
```powershell
$env:SERVER_URL="http://127.0.0.1:5000"
python setup_and_verify.py
```

---

## Step 5: Check for Common Issues

### Issue 1: Server Crashed

**Check:** Look at server console for error messages

**Fix:** Restart server and check for:
- MongoDB connection errors
- Missing dependencies
- Port already in use

### Issue 2: Wrong Port

**Check:** Server console shows different port

**Fix:** 
```powershell
$env:SERVER_URL="http://localhost:ACTUAL_PORT"
```

### Issue 3: Firewall

**Check:** Can browser access the server?

**Fix:** Allow Node.js through Windows Firewall

### Issue 4: Server Not Started

**Check:** Do you see "Server listening..." in console?

**Fix:** Start server:
```bash
cd server
npm start
```

---

## Quick Fix Commands

### Run These in Order:

1. **Test server connection:**
   ```powershell
   .\test-server.ps1
   ```

2. **If server is accessible, set environment variable:**
   ```powershell
   $env:SERVER_URL="http://localhost:5000"
   ```

3. **Run verification again:**
   ```powershell
   python setup_and_verify.py
   ```

---

## Still Not Working?

### Debug Mode

Run the test script with verbose output:

```powershell
python -c "import requests; print('Testing:', 'http://localhost:5000/api/health'); r = requests.get('http://localhost:5000/api/health', timeout=5); print('Status:', r.status_code); print('Response:', r.text)"
```

### Manual Check

1. **Open browser:** `http://localhost:5000/api/health`
   - If this works → Server IS running
   - If this fails → Server is NOT running

2. **Check server console:**
   - Look for error messages
   - Check if MongoDB connected
   - Verify server started successfully

3. **Check port:**
   ```powershell
   netstat -ano | findstr :5000
   ```
   - Should show LISTENING status

---

## Most Likely Issue

The script is probably using the wrong URL format. Try this:

```powershell
# Set explicit URL
$env:SERVER_URL="http://localhost:5000"

# Run verification
python setup_and_verify.py
```

Or edit `setup_and_verify.py` line 13 to force the URL:
```python
SERVER_URL = "http://localhost:5000"  # Remove os.environ.get() and use this directly
```

---

## Need More Help?

Share:
1. Output from `.\test-server.ps1`
2. Server console output (last 10 lines)
3. What you see when opening `http://localhost:5000/api/health` in browser

---

**Try the PowerShell test script first:** `.\test-server.ps1`

