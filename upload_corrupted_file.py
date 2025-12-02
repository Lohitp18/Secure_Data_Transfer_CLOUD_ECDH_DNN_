#!/usr/bin/env python3
"""
Corrupted File Upload Tester
Tests detection of corrupted PNG, PDF, and other malicious files
"""

import requests
import base64
import os
import json
from pathlib import Path

# Configuration
SERVER_URL = os.environ.get("SERVER_URL", "http://localhost:5000/api")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "test@example.com")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "Test123!@#")
TEST_FILES_DIR = Path("test_files")

def get_auth_token():
    """Get authentication token for testing"""
    try:
        response = requests.post(
            f"{SERVER_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=5
        )
        if response.status_code == 200:
            return response.json().get("token")
        print(f"⚠️  Auth failed: {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"⚠️  Cannot get auth token: {e}")
        return None

def print_test_header(test_name):
    print("\n" + "="*70)
    print(f"  {test_name}")
    print("="*70)

def print_result(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")

def upload_file(filepath, token, expected_rejection=True):
    """
    Upload a file and check if it's properly detected/rejected
    
    Args:
        filepath: Path to file to upload
        token: Authentication token
        expected_rejection: Whether file should be rejected (default: True for corrupted files)
    
    Returns:
        tuple: (passed, details_dict)
    """
    if not os.path.exists(filepath):
        print(f"   ⚠️  File not found: {filepath}")
        return False, {"error": "File not found"}
    
    try:
        filename = os.path.basename(filepath)
        
        print(f"\n📤 Uploading: {filename}")
        print(f"   Path: {filepath}")
        print(f"   Size: {os.path.getsize(filepath)} bytes")
        
        with open(filepath, 'rb') as f:
            files = {
                'file': (filename, f, 'application/octet-stream')
            }
            
            response = requests.post(
                f"{SERVER_URL}/files/upload",
                files=files,
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )
        
        status_code = response.status_code
        response_data = {}
        
        try:
            response_data = response.json() if response.text else {}
        except:
            response_data = {"raw_response": response.text[:200]}
        
        print(f"\n📊 Server Response:")
        print(f"   Status Code: {status_code}")
        print(f"   Response: {json.dumps(response_data, indent=2)}")
        
        # Extract IDS information
        details = response_data.get('details', {})
        ids_info = details.get('ids', {})
        validation_info = details.get('validation', {})
        
        anomaly_score = 0
        if isinstance(ids_info, dict):
            anomaly_score = ids_info.get('anomaly_score', 0)
        elif isinstance(validation_info, dict):
            anomaly_score = validation_info.get('risk_score', 0)
        
        verdict = response_data.get('status', '')
        error_msg = response_data.get('error', '')
        
        # Check if file was correctly rejected/flagged
        if expected_rejection:
            passed = status_code in [400, 403]
            
            if passed:
                result_details = {
                    "status": status_code,
                    "anomaly_score": anomaly_score,
                    "verdict": verdict,
                    "error": error_msg
                }
                
                print(f"\n   ✅ File correctly rejected")
                print(f"   🔍 IDS Anomaly Score: {anomaly_score:.2f}")
                
                if anomaly_score > 0.75:
                    print(f"   ✅ High IDS probability (>0.75) - strong detection")
                elif anomaly_score > 0.5:
                    print(f"   ⚠️  Moderate IDS probability (0.5-0.75)")
                else:
                    print(f"   ⚠️  Low IDS probability (<0.5) but file rejected")
                
                # Check for corruption detection
                if 'corrupt' in error_msg.lower() or 'corrupt' in str(validation_info).lower():
                    print(f"   ✅ Corruption detected explicitly")
                if verdict == 'corrupted' or 'corrupt' in verdict.lower():
                    print(f"   ✅ Verdict: {verdict}")
                
                return True, result_details
            else:
                result_details = {
                    "status": status_code,
                    "error": "File was accepted but should have been rejected"
                }
                print(f"\n   ❌ File was ACCEPTED (Status {status_code}) - SECURITY ISSUE!")
                print(f"   ⚠️  Expected rejection for corrupted file")
                return False, result_details
        else:
            # For legitimate files, should be accepted
            passed = status_code == 200
            
            result_details = {
                "status": status_code,
                "anomaly_score": anomaly_score
            }
            
            if passed:
                print(f"\n   ✅ File correctly accepted (Status 200)")
                print(f"   🔍 IDS Anomaly Score: {anomaly_score:.2f}")
                
                if anomaly_score < 0.3:
                    print(f"   ✅ Low IDS probability - normal traffic")
                else:
                    print(f"   ⚠️  Higher IDS probability than expected for normal file")
            else:
                print(f"\n   ❌ File was rejected (Status {status_code}) but should be accepted")
            
            return passed, result_details
            
    except Exception as e:
        print(f"   ❌ Error during upload: {e}")
        import traceback
        traceback.print_exc()
        return False, {"error": str(e)}

# ==================== TEST 4: Corrupted PNG Upload ====================

def test_corrupted_png(token):
    """TEST 4: Upload Corrupted PNG"""
    print_test_header("TEST 4: Upload Corrupted PNG")
    
    if not token:
        print_result("Corrupted PNG Upload", False, "Cannot authenticate")
        return False, {}
    
    # Try different corrupted PNG files
    corrupted_files = [
        TEST_FILES_DIR / "corrupted_png.png",
        TEST_FILES_DIR / "corrupted_image.jpg"  # May also work
    ]
    
    for filepath in corrupted_files:
        if filepath.exists():
            passed, details = upload_file(str(filepath), token, expected_rejection=True)
            
            if passed:
                print_result("Corrupted PNG Upload", True, 
                           f"File correctly rejected with IDS score: {details.get('anomaly_score', 0):.2f}")
                return True, details
            else:
                print_result("Corrupted PNG Upload", False, 
                           f"File was not rejected: {details.get('error', 'Unknown error')}")
                return False, details
    
    print_result("Corrupted PNG Upload", False, "No corrupted PNG file found in test_files/")
    return False, {"error": "File not found"}

# ==================== TEST 5: Corrupted PDF Upload ====================

def test_corrupted_pdf(token):
    """TEST 5: Upload Corrupted PDF"""
    print_test_header("TEST 5: Upload Corrupted PDF")
    
    if not token:
        print_result("Corrupted PDF Upload", False, "Cannot authenticate")
        return False, {}
    
    # Look for corrupted PDF or create a test one
    corrupted_pdf = TEST_FILES_DIR / "corrupted_document.pdf"
    
    # If file doesn't exist, create a corrupted PDF (invalid structure)
    if not corrupted_pdf.exists():
        print(f"   Creating test corrupted PDF: {corrupted_pdf}")
        TEST_FILES_DIR.mkdir(exist_ok=True)
        
        # Create a file that looks like PDF but is corrupted
        corrupted_data = b"%PDF-1.4\n" + b"\x00" * 500 + b"Invalid PDF content without proper structure"
        with open(corrupted_pdf, 'wb') as f:
            f.write(corrupted_data)
        print(f"   Created corrupted PDF ({len(corrupted_data)} bytes)")
    
    passed, details = upload_file(str(corrupted_pdf), token, expected_rejection=True)
    
    if passed:
        print_result("Corrupted PDF Upload", True, 
                   f"File correctly rejected with IDS score: {details.get('anomaly_score', 0):.2f}")
    else:
        print_result("Corrupted PDF Upload", False, 
                   f"File was not rejected: {details.get('error', 'Unknown error')}")
    
    return passed, details

# ==================== TEST: Other Corrupted Files ====================

def test_other_corrupted_files(token):
    """Test other types of corrupted files"""
    print_test_header("TEST: Other Corrupted Files")
    
    if not token:
        print_result("Other Corrupted Files", False, "Cannot authenticate")
        return False
    
    results = []
    
    # Test excessive nulls
    nulls_file = TEST_FILES_DIR / "excessive_nulls.bin"
    if nulls_file.exists():
        print(f"\n📁 Testing: excessive_nulls.bin")
        passed, _ = upload_file(str(nulls_file), token, expected_rejection=True)
        results.append(("Excessive Nulls", passed))
    
    # Test repeated pattern
    pattern_file = TEST_FILES_DIR / "repeated_pattern.bin"
    if pattern_file.exists():
        print(f"\n📁 Testing: repeated_pattern.bin")
        passed, _ = upload_file(str(pattern_file), token, expected_rejection=True)
        results.append(("Repeated Pattern", passed))
    
    # Test suspicious encrypted
    encrypted_file = TEST_FILES_DIR / "suspicious_encrypted.bin"
    if encrypted_file.exists():
        print(f"\n📁 Testing: suspicious_encrypted.bin")
        passed, _ = upload_file(str(encrypted_file), token, expected_rejection=True)
        results.append(("Suspicious Encrypted", passed))
    
    if not results:
        print("   ⚠️  No additional corrupted files found in test_files/")
        return False
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\n📊 Results: {passed_count}/{total_count} files correctly rejected")
    
    for name, passed in results:
        status = "✅" if passed else "❌"
        print(f"   {status} {name}")
    
    return passed_count == total_count

# ==================== Main Execution ====================

if __name__ == "__main__":
    print("\n" + "="*70)
    print("  📁 CORRUPTED FILE UPLOAD TESTER")
    print("="*70)
    print("\nThis script tests detection of corrupted and malicious files:")
    print("  1. Corrupted PNG files")
    print("  2. Corrupted PDF files")
    print("  3. Other suspicious file patterns")
    print("\nMake sure your server and IDS service are running!")
    print(f"   Server: {SERVER_URL}")
    print(f"   Test Files Directory: {TEST_FILES_DIR}")
    print()
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        print("❌ Cannot authenticate. Please check:")
        print(f"   - Server is running at {SERVER_URL}")
        print(f"   - Test credentials: {TEST_EMAIL} / {TEST_PASSWORD}")
        print("   - User account exists and is accessible")
        exit(1)
    
    print(f"✅ Authenticated successfully")
    
    # Run all corrupted file tests
    results = []
    
    result_png, details_png = test_corrupted_png(token)
    results.append(("Corrupted PNG", result_png))
    
    result_pdf, details_pdf = test_corrupted_pdf(token)
    results.append(("Corrupted PDF", result_pdf))
    
    result_other = test_other_corrupted_files(token)
    results.append(("Other Corrupted Files", result_other))
    
    # Summary
    print("\n" + "="*70)
    print("  📊 CORRUPTED FILE TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {status} - {name}")
    
    print(f"\n  Total: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n  🎉 All corrupted file tests passed!")
        print("  Your IDS is correctly detecting corrupted files.")
    else:
        print(f"\n  ⚠️  {total - passed} test(s) failed.")
        print("  Review file validation and IDS configuration.")

