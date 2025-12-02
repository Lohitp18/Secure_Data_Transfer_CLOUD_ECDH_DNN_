# ⚡ Quick Test Reference Guide

## 🚀 Quick Start

### Run All Tests (Recommended):
```bash
python run_full_security_tests.py
```

### Run Individual Tests:

#### 1. Normal Secure Upload
```bash
python -m client.client
# OR
python client/client.py
```
**Expected:** IDS probability < 0.3, Upload succeeds

#### 2. MITM Attacks
```bash
python attack_simulator.py
```
**Expected:** IDS probability > 0.8, Attacks rejected

#### 3. Corrupted Files
```bash
python upload_corrupted_file.py
```
**Expected:** Files rejected, IDS probability > 0.75

---

## 📋 One-Line Test Checklist

Run each command and verify:

```bash
# ✅ Normal: Should pass, IDS < 0.3
python client/client.py

# ✅ MITM: Should fail, IDS > 0.8
python attack_simulator.py

# ✅ Corrupted: Should reject, IDS > 0.75
python upload_corrupted_file.py

# ✅ All tests: Should pass all
python run_full_security_tests.py
```

---

## 🎯 Expected Results Summary

| Test | IDS Score | Server Response | Pass Criteria |
|------|-----------|-----------------|---------------|
| Normal Upload | < 0.3 | 200 OK | Score < 0.5 |
| MITM Attack | > 0.8 | 400/403 | Score > 0.7 |
| Corrupted File | > 0.75 | 400/403 | Score > 0.6 |
| Wrong Key | > 0.85 | 400/404 | Score > 0.7 OR fail |

---

## 🔧 Prerequisites

1. Server running: `http://localhost:5000`
2. IDS running: `http://localhost:6000`
3. Test account exists
4. Test files in `test_files/` directory

---

## ❓ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth fails | Check server running, verify credentials |
| IDS not responding | Check port 6000, verify models loaded |
| Files not found | Run `node create_corrupted_files.js` |
| High false positives | Retrain model, adjust thresholds |

---

## 📊 Interpreting Results

- **IDS Score < 0.3**: ✅ Normal traffic
- **IDS Score 0.3-0.5**: ⚠️ Moderate suspicion
- **IDS Score > 0.8**: ❌ Attack detected

---

**For detailed documentation, see:** `SECURITY_TEST_DOCUMENTATION.md`

