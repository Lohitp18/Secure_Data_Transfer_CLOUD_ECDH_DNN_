#!/usr/bin/env python3
"""
Complete Security Test Suite - Full Automation
Tests all security scenarios: normal operations, MITM attacks, corrupted files
"""

import subprocess
import sys
import time
import os
from pathlib import Path

# Configuration
TEST_EMAIL = os.environ.get("TEST_EMAIL", "test@example.com")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "Test123!@#")

def print_header(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_test_result(test_name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status} - {test_name}")
    if details:
        print(f"    {details}")

def run_test(test_name, script_path, description=""):
    """Run a test script and return result"""
    print_header(f"Running: {test_name}")
    if description:
        print(f"  {description}\n")
    
    try:
        # Run the test script
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=False,  # Show output in real-time
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        passed = result.returncode == 0
        return passed, result.returncode
        
    except subprocess.TimeoutExpired:
        print(f"   ⏱️  Test timed out after 5 minutes")
        return False, -1
    except Exception as e:
        print(f"   ❌ Error running test: {e}")
        return False, -1

def check_prerequisites():
    """Check if prerequisites are met"""
    print_header("Checking Prerequisites")
    
    issues = []
    
    # Check if test scripts exist
    required_scripts = [
        "client/client.py",
        "attack_simulator.py",
        "upload_corrupted_file.py"
    ]
    
    for script in required_scripts:
        if not Path(script).exists():
            issues.append(f"Missing script: {script}")
            print(f"   ❌ Missing: {script}")
        else:
            print(f"   ✅ Found: {script}")
    
    # Check if test files directory exists
    test_files_dir = Path("test_files")
    if not test_files_dir.exists():
        print(f"   ⚠️  Test files directory not found: {test_files_dir}")
        print(f"   📁 Creating directory...")
        test_files_dir.mkdir(exist_ok=True)
        print(f"   ✅ Created: {test_files_dir}")
    else:
        print(f"   ✅ Test files directory exists: {test_files_dir}")
    
    # Check for corrupted files
    expected_files = [
        "test_files/corrupted_png.png",
        "test_files/corrupted_image.jpg"
    ]
    
    found_files = []
    for filepath in expected_files:
        if Path(filepath).exists():
            found_files.append(filepath)
            print(f"   ✅ Found test file: {filepath}")
    
    if not found_files:
        print(f"   ⚠️  No corrupted test files found in test_files/")
        print(f"   💡 Some tests may create test files automatically")
    
    if issues:
        print(f"\n   ⚠️  {len(issues)} issue(s) found:")
        for issue in issues:
            print(f"      - {issue}")
        return False
    
    print(f"\n   ✅ All prerequisites met!")
    return True

def main():
    """Run complete security test suite"""
    print("\n" + "="*80)
    print("  🛡️  COMPLETE SECURITY TEST SUITE")
    print("="*80)
    print("\nThis comprehensive test suite verifies:")
    print("  ✅ Secure data transfer (normal case)")
    print("  ✅ MITM attack detection")
    print("  ✅ Corrupted file upload detection")
    print("  ✅ Secure data transfer validation")
    print("\nMake sure your services are running:")
    print("  - Server: http://localhost:5000")
    print("  - IDS Service: http://localhost:6000")
    print()
    
    input("Press Enter to continue or Ctrl+C to cancel...")
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n❌ Prerequisites not met. Please fix issues above.")
        return False
    
    # Test results
    test_results = []
    
    # ==================== PART 1: SECURE DATA TRANSFER (NORMAL) ====================
    
    print("\n" + "="*80)
    print("  PART 1: SECURE DATA TRANSFER (NORMAL CASE)")
    print("="*80)
    print("\nGoal: Ensure normal operations work correctly with low IDS scores")
    
    passed, code = run_test(
        "TEST 1: Normal Secure Upload",
        "client/client.py",
        "Performs normal secure upload with handshake - should have IDS probability < 0.3"
    )
    test_results.append(("TEST 1: Normal Secure Upload", passed))
    
    time.sleep(2)  # Brief pause between tests
    
    # ==================== PART 2: MITM ATTACK DETECTION ====================
    
    print("\n" + "="*80)
    print("  PART 2: MITM ATTACK DETECTION")
    print("="*80)
    print("\nGoal: Ensure MITM attacks are detected with high IDS scores (>0.8)")
    
    # Run attack simulator (includes multiple attack types)
    passed, code = run_test(
        "TEST 2-4: MITM & Attack Scenarios",
        "attack_simulator.py",
        "Simulates MITM attacks (tampered ciphertext, wrong keys), replay, brute force"
    )
    test_results.append(("TEST 2-4: MITM & Attack Scenarios", passed))
    
    time.sleep(2)
    
    # ==================== PART 3: CORRUPTED FILE DETECTION ====================
    
    print("\n" + "="*80)
    print("  PART 3: CORRUPTED FILE UPLOAD DETECTION")
    print("="*80)
    print("\nGoal: Ensure corrupted/malicious files are rejected with high IDS scores")
    
    passed, code = run_test(
        "TEST 5-7: Corrupted File Detection",
        "upload_corrupted_file.py",
        "Tests corrupted PNG, PDF, and other malicious file detection"
    )
    test_results.append(("TEST 5-7: Corrupted File Detection", passed))
    
    # ==================== SUMMARY ====================
    
    print("\n" + "="*80)
    print("  📊 FINAL TEST SUMMARY")
    print("="*80)
    
    passed_count = sum(1 for _, result in test_results if result)
    total_count = len(test_results)
    
    print(f"\n{'Test Name':<50} {'Result':<10}")
    print("-" * 80)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:<50} {status:<10}")
    
    print("-" * 80)
    print(f"{'TOTAL':<50} {passed_count}/{total_count} PASSED")
    
    # Detailed results
    print("\n" + "="*80)
    print("  📋 PASS/FAIL CHECKLIST")
    print("="*80)
    
    checklist = [
        ("Normal traffic", "IDS < 0.3", test_results[0][1] if len(test_results) > 0 else False),
        ("MITM attacks detected", "IDS > 0.8", test_results[1][1] if len(test_results) > 1 else False),
        ("Corrupted files rejected", "Server returns 400/403", test_results[2][1] if len(test_results) > 2 else False),
    ]
    
    print(f"\n{'Check':<40} {'Expected':<30} {'Status':<10}")
    print("-" * 80)
    
    for check, expected, result in checklist:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{check:<40} {expected:<30} {status:<10}")
    
    # Final verdict
    print("\n" + "="*80)
    if passed_count == total_count:
        print("  🎉 ALL SECURITY TESTS PASSED!")
        print("="*80)
        print("\n✅ Your IDS is correctly detecting:")
        print("   - Normal traffic (low false positives)")
        print("   - MITM attacks (high detection rate)")
        print("   - Corrupted files (proper rejection)")
        print("\n✅ Your system is secure and ready for demonstration!")
        return True
    else:
        print(f"  ⚠️  {total_count - passed_count} TEST(S) FAILED")
        print("="*80)
        print(f"\n⚠️  {total_count - passed_count} out of {total_count} test groups failed.")
        print("\nRecommendations:")
        print("   1. Review server logs for detailed error messages")
        print("   2. Verify IDS service is running and models are loaded")
        print("   3. Check that test files exist in test_files/ directory")
        print("   4. Ensure authentication credentials are correct")
        print("   5. Verify server configuration and IDS thresholds")
        return False

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

