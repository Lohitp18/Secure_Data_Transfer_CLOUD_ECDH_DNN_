# 🛡️ Complete Security Testing Documentation

## Overview

This document provides a comprehensive guide for testing your Intrusion Detection System (IDS) for secure file transfer. It includes test cases, expected behaviors, and pass/fail criteria.

---

## ⭐ PART 1 — SECURE DATA TRANSFER (VALID CASE)

**Goal:** Ensure your model + crypto + server all behave correctly in normal usage.

---

### ✅ **TEST 1 — Normal Secure Upload**

#### Run Command:
```bash
python -m client.client
```

Or:
```bash
python client/client.py
```

#### Expected Behavior

| Component     | Expected Result                  |
| ------------- | -------------------------------- |
| Handshake     | Successful mutual authentication |
| Key exchange  | ECDH → AES key derived           |
| Encryption    | AES-GCM encrypts correctly       |
| Upload        | File accepted ("OK")             |
| IDS detection | Probability < 0.3                |
| Logs          | No alerts                        |

#### Expected Server Log Example:
```
[INFO] upload_ok client=xyz size=2300
[INFO] ids_infer prob=0.12
```

#### Interpretation:
- ✅ **PASS**: If probability < 0.5, the IDS accepts normal traffic correctly
- ❌ **FAIL**: If probability > 0.5, false positive - legitimate traffic flagged

---

## ⭐ PART 2 — MITM ATTACK DETECTION

MITM = Man In The Middle
We test it by **tampering ciphertext or keys**.

---

### 🧨 **TEST 2 — MITM Attack: Tampered Ciphertext**

#### Run Command:
```bash
python attack_simulator.py
```

This function inside it already does MITM-like corruption:

```python
tampered_upload_demo()
```

#### Expected Behavior

| Component | Result                 |
| --------- | ---------------------- |
| AES-GCM   | Tag verification FAILS |
| IDS       | Probability > 0.8      |
| Server    | Rejects upload         |
| Response  | 400 or 403             |

#### Expected Server Log:
```
[ERROR] decrypt_fail client=xyz
[ALERT] IDS detected attack prob=0.94
```

#### Interpretation:
- ✅ **PASS**: If probability > 0.80, MITM detection is correct
- ❌ **FAIL**: If probability < 0.8 or file accepted, detection failed

---

### 🧨 **TEST 3 — MITM Attack: Wrong ECDH Key**

This simulates public-key tampering during handshake.

#### Function:
```python
mitm_wrong_key()
```

#### Expected Results:

```
IDS prob >= 0.85
Handshake fail (400)
Event: invalid_pub
```

#### Interpretation:
- ✅ **PASS**: Handshake fails and/or IDS probability > 0.85
- ❌ **FAIL**: Handshake succeeds with fake key

---

### 🧨 **TEST 4 — Replay Attack**

Simulates nonce reuse by uploading the same file multiple times.

#### Function:
```python
replay_attack_demo()
```

#### Expected Results:
- Server detects replay/nonce reuse
- IDS flags repeated patterns
- Subsequent uploads rejected or flagged

#### Interpretation:
- ✅ **PASS**: Replay detected or rate-limited
- ❌ **FAIL**: Multiple identical uploads accepted without detection

---

### 🧨 **TEST 5 — Brute Force Handshake**

Rapid handshake attempts to test anomaly detection.

#### Function:
```python
bruteforce_handshake(50)  # 50 attempts
```

#### Expected Results:
- Many handshake attempts fail
- IDS flags rapid connection attempts
- Anomaly scores increase with attempt count

#### Interpretation:
- ✅ **PASS**: High failure rate (>30%) or suspicious flagging
- ❌ **FAIL**: All attempts succeed without detection

---

## ⭐ PART 3 — UNSECURED & CORRUPTED FILE UPLOAD DETECTION

Test corrupted files that should be rejected.

---

### 🧨 **TEST 6 — Upload a Corrupted PNG**

#### Run Command:
```bash
python upload_corrupted_file.py
```

This will test:
- `test_files/corrupted_png.png`
- `test_files/corrupted_image.jpg`

#### Expected Behavior

| Check                  | Expected        |
| ---------------------- | --------------- |
| detect_file_corruption | TRUE            |
| entropy high           | YES             |
| malformed header       | YES             |
| IDS prob               | > 0.75          |
| server returns         | 400 with reason |

#### Expected Server Log:
```
[event=corrupted_file reason="invalid file type"]
[ids_infer prob=0.92]
```

#### Interpretation:
- ✅ **PASS**: File rejected with status 400/403 and IDS probability > 0.75
- ❌ **FAIL**: Corrupted file accepted (Status 200)

---

### 🧨 **TEST 7 — Upload a Corrupted PDF**

Same script, automatically tests corrupted PDF files.

#### Expected Results:
```
Corrupted or malicious file detected
reason: invalid file structure
IDS probability: > 0.75
Status: 400 or 403
```

#### Interpretation:
- ✅ **PASS**: PDF rejected with high IDS probability
- ❌ **FAIL**: Corrupted PDF accepted

---

### 🧨 **TEST 8 — Other Corrupted Files**

Tests additional corrupted file patterns:
- `excessive_nulls.bin` - High null byte concentration
- `repeated_pattern.bin` - Suspicious patterns
- `suspicious_encrypted.bin` - High entropy encrypted-like data

#### Expected Results:
All corrupted files should be rejected with appropriate error messages and high IDS scores.

---

## ⭐ PART 4 — FULL AUTOMATED TEST SCRIPT

Run all tests in one command:

### Run Command:
```bash
python run_full_security_tests.py
```

This master script will:
1. ✅ Check prerequisites
2. ✅ Run TEST 1: Normal Secure Upload
3. ✅ Run TEST 2-5: All MITM attacks
4. ✅ Run TEST 6-8: All corrupted file tests
5. ✅ Generate comprehensive summary report

---

## ⭐ PASS / FAIL CHECKLIST

### ✔ PASS (Good) - All these should be TRUE:

- [ ] **Normal traffic**: IDS < 0.3
- [ ] **MITM tampered ciphertext**: IDS > 0.8
- [ ] **MITM wrong key**: Handshake fails OR IDS > 0.85
- [ ] **Corrupted PNG/PDF**: Server returns 400/403
- [ ] **Corrupted files**: IDS probability > 0.75
- [ ] **Replay attack**: Detected (nonce_reuse) OR rate-limited
- [ ] **Brute force**: Many handshake errors OR suspicious flagging

### ❌ FAIL (Fix Needed) - Any of these indicates issues:

- [ ] **Normal traffic flagged**: IDS > 0.5 for legitimate files
- [ ] **Tampered ciphertext accepted**: Status 200 instead of 400/403
- [ ] **Corrupted file accepted**: Status 200 instead of 400/403
- [ ] **Replay not detected**: Multiple identical uploads accepted
- [ ] **MITM not flagged**: Low IDS probability (<0.5) for attacks
- [ ] **No error messages**: Server doesn't provide rejection reasons

---

## 📊 Interpreting IDS Probability Scores

### Score Ranges:

| Score Range | Interpretation | Action |
|------------|----------------|--------|
| 0.0 - 0.3  | Normal traffic | ✅ Accept |
| 0.3 - 0.5  | Moderate suspicion | ⚠️ Review |
| 0.5 - 0.8  | High suspicion | ⚠️ Flag for review |
| 0.8 - 1.0  | Attack detected | ❌ Reject |

### Expected Scores by Test:

| Test Type | Expected IDS Score | Pass Criteria |
|-----------|-------------------|---------------|
| Normal upload | < 0.3 | Score < 0.5 |
| MITM attack | > 0.8 | Score > 0.7 |
| Corrupted file | > 0.75 | Score > 0.6 |
| Wrong key | > 0.85 | Score > 0.7 OR handshake fails |

---

## 🔧 Setup Requirements

### Prerequisites:

1. **Server Running**: `http://localhost:5000`
   ```bash
   cd server
   npm start
   ```

2. **IDS Service Running**: `http://localhost:6000`
   ```bash
   cd ids_service
   python app.py
   ```

3. **Test Account Created**:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   
   Or set environment variables:
   ```bash
   export TEST_EMAIL=your@email.com
   export TEST_PASSWORD=YourPassword
   ```

4. **Test Files Available**:
   - `test_files/corrupted_png.png`
   - `test_files/corrupted_image.jpg`
   - `test_files/corrupted_document.pdf` (created automatically if missing)
   - `test_files/excessive_nulls.bin`
   - `test_files/repeated_pattern.bin`
   - `test_files/suspicious_encrypted.bin`

---

## 🐛 Troubleshooting

### Issue: Authentication Fails
**Solution:**
- Verify server is running
- Check credentials: `TEST_EMAIL` and `TEST_PASSWORD`
- Create test account if it doesn't exist:
  ```bash
  python create_test_account.js  # or use your registration endpoint
  ```

### Issue: IDS Service Not Responding
**Solution:**
- Check IDS service is running on port 6000
- Verify models are loaded:
  ```bash
  curl http://localhost:6000/health
  ```
- Train models if missing:
  ```bash
  cd ids_service
  python enhanced_train.py
  ```

### Issue: Test Files Not Found
**Solution:**
- Check `test_files/` directory exists
- Run file generation script:
  ```bash
  node create_corrupted_files.js
  ```
- Or create manually:
  ```python
  # Create corrupted PNG
  corrupted_data = b'\x89PNG\r\n\x1a\n' + b'\x00' * 500
  with open('test_files/corrupted_png.png', 'wb') as f:
      f.write(corrupted_data)
  ```

### Issue: High False Positives (Normal traffic flagged)
**Solution:**
- Review IDS model training data
- Check feature extraction
- Adjust thresholds in `ids_service/inference.py`
- Retrain model with more normal traffic samples

### Issue: Low Attack Detection (Attacks not flagged)
**Solution:**
- Verify attack scenarios match training data
- Check IDS model is loaded correctly
- Review feature engineering
- Retrain model with attack scenarios

---

## 📝 Test Results Template

### Test Execution Log:

```
Date: [DATE]
Tester: [NAME]
Environment: [DEV/STAGING/PROD]

TEST RESULTS:
-----------
✅ TEST 1: Normal Secure Upload
   Handshake IDS Score: 0.12
   Upload IDS Score: 0.18
   Status: PASS

✅ TEST 2: MITM Tampered Ciphertext
   Server Response: 403
   IDS Score: 0.94
   Status: PASS

✅ TEST 3: MITM Wrong Key
   Handshake Failed: Yes
   IDS Score: 0.87
   Status: PASS

✅ TEST 4: Replay Attack
   Detection: Yes
   Status: PASS

✅ TEST 5: Brute Force
   Failure Rate: 45%
   Status: PASS

✅ TEST 6: Corrupted PNG
   Server Response: 403
   IDS Score: 0.89
   Status: PASS

✅ TEST 7: Corrupted PDF
   Server Response: 403
   IDS Score: 0.91
   Status: PASS

✅ TEST 8: Other Corrupted Files
   All rejected: Yes
   Status: PASS

OVERALL: 8/8 PASSED ✅
```

---

## 🎯 Success Criteria

Your IDS is considered **ready for demonstration** if:

1. ✅ **Normal traffic**: IDS probability < 0.3 (low false positives)
2. ✅ **MITM attacks**: IDS probability > 0.8 (high detection rate)
3. ✅ **Corrupted files**: Rejected with IDS probability > 0.75
4. ✅ **Server responses**: Proper error codes (400/403 for attacks)
5. ✅ **All automated tests**: Pass in `run_full_security_tests.py`

---

## 📚 Additional Resources

- **Training Guide**: `ML_TRAINING_GUIDE.md`
- **Enhanced Detection**: `ENHANCED_DETECTION_SUMMARY.md`
- **Architecture**: `docs/architecture.md`
- **Setup Guide**: `docs/setup_guide.md`

---

## 🎓 Academic Project Notes

This test suite demonstrates:
- ✅ Comprehensive security testing methodology
- ✅ Multiple attack vector coverage
- ✅ Automated test execution
- ✅ Clear pass/fail criteria
- ✅ Detailed documentation

**Perfect for:**
- Final year project demonstrations
- Security audit reports
- System validation documentation
- Viva presentations

---

## 📧 Support

For questions or issues:
1. Review troubleshooting section above
2. Check server/IDS service logs
3. Verify test files and configuration
4. Review IDS model training data

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** ✅ Ready for Testing

