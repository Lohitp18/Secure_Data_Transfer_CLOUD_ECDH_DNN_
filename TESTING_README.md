# 🧪 Complete Testing Suite for IDS Security Project

## Overview

This comprehensive testing suite validates your Intrusion Detection System (IDS) for secure file transfer. It tests normal operations, MITM attacks, and corrupted file detection.

---

## 📁 Files Created

### Test Scripts:
1. **`client/client.py`** - Normal secure upload testing
2. **`attack_simulator.py`** - MITM and attack scenario testing
3. **`upload_corrupted_file.py`** - Corrupted file detection testing
4. **`run_full_security_tests.py`** - Master test runner (runs everything)

### Documentation:
1. **`SECURITY_TEST_DOCUMENTATION.md`** - Complete detailed documentation
2. **`QUICK_TEST_REFERENCE.md`** - Quick reference guide
3. **`TESTING_README.md`** - This file

---

## 🚀 Quick Start

### Option 1: Run All Tests (Recommended)
```bash
python run_full_security_tests.py
```

This will:
- ✅ Check prerequisites
- ✅ Run all security tests
- ✅ Generate comprehensive summary report
- ✅ Show PASS/FAIL checklist

### Option 2: Run Individual Tests

```bash
# Test 1: Normal secure upload
python -m client.client

# Test 2-5: MITM attacks
python attack_simulator.py

# Test 6-8: Corrupted files
python upload_corrupted_file.py
```

---

## 📋 What Gets Tested

### ✅ PART 1: Secure Data Transfer (Normal)
- Normal handshake and key exchange
- Secure file upload
- IDS probability for normal traffic (< 0.3 expected)

### 🧨 PART 2: MITM Attack Detection
- **Tampered ciphertext** - File corruption in transit
- **Wrong ECDH key** - Public key tampering
- **Replay attack** - Nonce reuse detection
- **Brute force** - Rapid handshake attempts

### 📁 PART 3: Corrupted File Detection
- **Corrupted PNG** - Invalid image structure
- **Corrupted PDF** - Invalid document structure
- **Other corrupted files** - Null bytes, patterns, encrypted data

---

## 🎯 Expected Results

### Normal Traffic (PASS):
- ✅ IDS probability: **< 0.3**
- ✅ Server response: **200 OK**
- ✅ File accepted

### Attacks (PASS):
- ✅ IDS probability: **> 0.8**
- ✅ Server response: **400 or 403**
- ✅ Attack rejected

### Corrupted Files (PASS):
- ✅ IDS probability: **> 0.75**
- ✅ Server response: **400 or 403**
- ✅ File rejected

---

## 🔧 Setup Requirements

### 1. Start Your Services

```bash
# Terminal 1: Start Server
cd server
npm start

# Terminal 2: Start IDS Service
cd ids_service
python app.py
```

### 2. Verify Services Running

```bash
# Check server
curl http://localhost:5000/api/health

# Check IDS
curl http://localhost:6000/health
```

### 3. Create Test Account (if needed)

```bash
# Use your registration endpoint or:
node create_test_account.js
```

Or set environment variables:
```bash
export TEST_EMAIL=your@email.com
export TEST_PASSWORD=YourPassword
```

### 4. Prepare Test Files

```bash
# Create corrupted test files
node create_corrupted_files.js
```

Or files should be in `test_files/` directory:
- `corrupted_png.png`
- `corrupted_image.jpg`
- `corrupted_document.pdf` (created automatically if missing)
- `excessive_nulls.bin`
- `repeated_pattern.bin`
- `suspicious_encrypted.bin`

---

## 📊 Test Results Interpretation

### IDS Probability Scores:

| Score | Meaning | Action |
|-------|---------|--------|
| 0.0 - 0.3 | Normal | ✅ Accept |
| 0.3 - 0.5 | Suspicious | ⚠️ Review |
| 0.5 - 0.8 | Highly Suspicious | ⚠️ Flag |
| 0.8 - 1.0 | Attack Detected | ❌ Reject |

### What to Look For:

✅ **GOOD**:
- Normal upload: Score < 0.3
- MITM attack: Score > 0.8
- Corrupted file: Score > 0.75

❌ **BAD**:
- Normal upload: Score > 0.5 (false positive)
- MITM attack: Score < 0.5 (attack missed)
- Corrupted file: Score < 0.6 (corruption missed)

---

## ✅ PASS/FAIL Checklist

After running tests, verify:

- [ ] **Normal traffic**: IDS < 0.3, Upload succeeds
- [ ] **MITM tampered ciphertext**: IDS > 0.8, Rejected (400/403)
- [ ] **MITM wrong key**: Handshake fails OR IDS > 0.85
- [ ] **Replay attack**: Detected or rate-limited
- [ ] **Brute force**: Many failures or suspicious flagging
- [ ] **Corrupted PNG**: Rejected, IDS > 0.75
- [ ] **Corrupted PDF**: Rejected, IDS > 0.75
- [ ] **Other corrupted files**: All rejected

---

## 🐛 Troubleshooting

### Authentication Fails
```bash
# Check server is running
curl http://localhost:5000/api/health

# Verify credentials
export TEST_EMAIL=test@example.com
export TEST_PASSWORD=Test123!@#
```

### IDS Service Not Responding
```bash
# Check IDS is running
curl http://localhost:6000/health

# Train models if missing
cd ids_service
python enhanced_train.py
```

### Test Files Not Found
```bash
# Create test files
node create_corrupted_files.js

# Or create manually
mkdir -p test_files
# Create corrupted files...
```

### High False Positives (Normal traffic flagged)
- Review IDS model training data
- Adjust thresholds in `ids_service/inference.py`
- Retrain model with more normal samples

### Low Attack Detection (Attacks not flagged)
- Verify attack scenarios match training
- Check IDS model is loaded correctly
- Retrain model with attack scenarios

---

## 📝 Example Test Run Output

```
================================================================================
  🛡️  COMPLETE SECURITY TEST SUITE
================================================================================

✅ Prerequisites Check: PASSED

================================================================================
  PART 1: SECURE DATA TRANSFER (NORMAL CASE)
================================================================================

✅ TEST 1: Normal Secure Upload
   Handshake IDS Score: 0.12
   Upload IDS Score: 0.18
   Status: PASS

================================================================================
  PART 2: MITM ATTACK DETECTION
================================================================================

✅ TEST 2-4: MITM & Attack Scenarios
   MITM Tampered Ciphertext: PASS (IDS: 0.94)
   MITM Wrong Key: PASS (IDS: 0.87)
   Replay Attack: PASS
   Brute Force: PASS (45% failure rate)

================================================================================
  PART 3: CORRUPTED FILE UPLOAD DETECTION
================================================================================

✅ TEST 5-7: Corrupted File Detection
   Corrupted PNG: PASS (IDS: 0.89, Status: 403)
   Corrupted PDF: PASS (IDS: 0.91, Status: 403)
   Other Files: PASS

================================================================================
  📊 FINAL TEST SUMMARY
================================================================================

Total: 3/3 test groups passed

🎉 ALL SECURITY TESTS PASSED!
```

---

## 📚 Documentation Files

1. **`SECURITY_TEST_DOCUMENTATION.md`** - Complete detailed guide
   - All test cases explained
   - Expected behaviors
   - Troubleshooting guide
   - Test results template

2. **`QUICK_TEST_REFERENCE.md`** - Quick reference
   - One-line commands
   - Expected results table
   - Quick troubleshooting

3. **`TESTING_README.md`** - This file
   - Overview and setup
   - Quick start guide
   - Results interpretation

---

## 🎓 For Academic Projects

This test suite demonstrates:
- ✅ Comprehensive security testing methodology
- ✅ Multiple attack vector coverage
- ✅ Automated test execution
- ✅ Clear pass/fail criteria
- ✅ Professional documentation

**Perfect for:**
- Final year project demonstrations
- Security audit reports
- System validation documentation
- Viva presentations

---

## 🔗 Related Files

- **Training**: `ids_service/enhanced_train.py`
- **IDS Service**: `ids_service/app.py`
- **Server Routes**: `server/routes/api.js`
- **File Validation**: `server/utils/fileValidation.js`
- **IDS Inference**: `ids_service/inference.py`

---

## 📧 Support

1. Review `SECURITY_TEST_DOCUMENTATION.md` for detailed help
2. Check server/IDS service logs for errors
3. Verify all prerequisites are met
4. Review IDS model training data

---

## 🎉 Success!

If all tests pass, your IDS is:
- ✅ Correctly identifying normal traffic (low false positives)
- ✅ Detecting MITM attacks (high detection rate)
- ✅ Rejecting corrupted files (proper validation)
- ✅ Ready for demonstration!

---

**Last Updated:** 2024
**Status:** ✅ Ready for Testing

