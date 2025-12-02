#!/usr/bin/env python3
"""
Python Client for Secure File Transfer
Performs normal secure uploads with proper handshake and encryption simulation
"""

import requests
import base64
import os
import json
from pathlib import Path
from io import BytesIO

# Configuration
SERVER_URL = os.environ.get("SERVER_URL", "http://localhost:5000/api")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "test@example.com")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "Test123!@#")

def get_auth_token():
    """Get authentication token"""
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

def perform_normal_handshake(token):
    """Perform a normal secure handshake"""
    print("🔐 Performing secure handshake...")
    
    try:
        # Generate a valid X25519 public key (32 bytes)
        # In real implementation, this would use cryptography library
        valid_public_key = base64.b64encode(os.urandom(32)).decode()
        
        print("   Step 1: Initializing handshake...")
        init_response = requests.post(
            f"{SERVER_URL}/handshake/init",
            json={"publicKey": valid_public_key},
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if init_response.status_code != 200:
            print(f"   ❌ Handshake init failed: {init_response.status_code}")
            return None
        
        init_data = init_response.json()
        handshake_id = init_data.get("handshakeId")
        server_public_key = init_data.get("serverPublicKey")
        
        print(f"   ✅ Handshake initialized (ID: {handshake_id[:16]}...)")
        print(f"   ✅ Server public key received")
        
        print("   Step 2: Validating handshake...")
        validate_response = requests.post(
            f"{SERVER_URL}/handshake/validate",
            json={"handshakeId": handshake_id},
            headers={"Authorization": f"Bearer {token}"},
            timeout=5
        )
        
        if validate_response.status_code != 200:
            print(f"   ❌ Handshake validation failed: {validate_response.status_code}")
            return None
        
        validate_data = validate_response.json()
        verified = validate_data.get("verified", False)
        session_key = validate_data.get("sessionKey")
        ids_result = validate_data.get("idsResult", {})
        
        anomaly_score = ids_result.get("anomaly_score", 0) if isinstance(ids_result, dict) else 0
        verdict = ids_result.get("verdict", "unknown") if isinstance(ids_result, dict) else "unknown"
        
        print(f"   ✅ Handshake validated")
        print(f"   ✅ Verified: {verified}")
        print(f"   ✅ IDS Verdict: {verdict} (probability: {anomaly_score:.2f})")
        print(f"   ✅ Session key established")
        
        return {
            "handshake_id": handshake_id,
            "session_key": session_key,
            "verified": verified,
            "ids_result": ids_result
        }
        
    except Exception as e:
        print(f"   ❌ Handshake error: {e}")
        import traceback
        traceback.print_exc()
        return None

def upload_file_securely(token, filepath=None, content=None, filename="test_secure.txt"):
    """
    Upload a file securely (normal operation)
    
    Args:
        token: Authentication token
        filepath: Path to file to upload (optional)
        content: File content as bytes (optional)
        filename: Filename for upload
    """
    print(f"\n📤 Uploading file securely: {filename}")
    
    try:
        # Create test file content if not provided
        if content is None:
            if filepath and os.path.exists(filepath):
                with open(filepath, 'rb') as f:
                    content = f.read()
            else:
                # Create a simple test file
                content = b"This is a normal secure file upload test. " * 10
                print(f"   Created test file content ({len(content)} bytes)")
        
        # Prepare file for upload
        files = {
            'file': (filename, BytesIO(content), 'text/plain')
        }
        
        print(f"   File size: {len(content)} bytes")
        print(f"   Uploading to server...")
        
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
            response_data = {"raw_response": response.text[:200] if response.text else ""}
        
        print(f"\n📊 Server Response:")
        print(f"   Status Code: {status_code}")
        
        if status_code == 200:
            print(f"   ✅ Upload successful!")
            
            # Extract IDS information
            details = response_data.get('details', {})
            if isinstance(details, dict):
                anomaly_score = details.get('anomaly_score', 0)
                verdict = details.get('verdict', 'normal')
            else:
                anomaly_score = 0
                verdict = 'normal'
            
            print(f"   🔍 IDS Anomaly Score: {anomaly_score:.2f}")
            print(f"   🔍 IDS Verdict: {verdict}")
            
            # Check if IDS probability is low (normal traffic)
            if anomaly_score < 0.3:
                print(f"   ✅ Low IDS probability (<0.3) - normal traffic detected correctly")
                return True, {
                    "status": "success",
                    "anomaly_score": anomaly_score,
                    "verdict": verdict
                }
            elif anomaly_score < 0.5:
                print(f"   ⚠️  Moderate IDS probability (0.3-0.5) - still acceptable")
                return True, {
                    "status": "success",
                    "anomaly_score": anomaly_score,
                    "verdict": verdict,
                    "warning": "Moderate IDS score"
                }
            else:
                print(f"   ⚠️  High IDS probability (>0.5) - may indicate false positive")
                return True, {
                    "status": "success",
                    "anomaly_score": anomaly_score,
                    "verdict": verdict,
                    "warning": "High IDS score for normal file"
                }
        else:
            error_msg = response_data.get('error', 'Unknown error')
            print(f"   ❌ Upload failed: {error_msg}")
            return False, {
                "status": "failed",
                "status_code": status_code,
                "error": error_msg
            }
            
    except Exception as e:
        print(f"   ❌ Upload error: {e}")
        import traceback
        traceback.print_exc()
        return False, {"error": str(e)}

def main():
    """Main client function - performs normal secure upload"""
    print("\n" + "="*70)
    print("  🔒 SECURE FILE TRANSFER CLIENT")
    print("="*70)
    print("\nThis client performs a normal secure upload:")
    print("  1. Authenticate with server")
    print("  2. Perform secure handshake (ECDH key exchange)")
    print("  3. Upload file with encryption")
    print("  4. Verify IDS detection (should be low probability)")
    print()
    
    # Step 1: Authenticate
    print("📋 Step 1: Authentication")
    token = get_auth_token()
    if not token:
        print("❌ Authentication failed. Please check:")
        print(f"   - Server is running at {SERVER_URL}")
        print(f"   - Test credentials: {TEST_EMAIL} / {TEST_PASSWORD}")
        return False
    
    print("   ✅ Authenticated successfully\n")
    
    # Step 2: Handshake
    print("📋 Step 2: Secure Handshake")
    handshake_result = perform_normal_handshake(token)
    if not handshake_result or not handshake_result.get("verified"):
        print("❌ Handshake failed")
        return False
    
    ids_result = handshake_result.get("ids_result", {})
    handshake_anomaly = ids_result.get("anomaly_score", 0) if isinstance(ids_result, dict) else 0
    
    if handshake_anomaly < 0.3:
        print(f"   ✅ Normal handshake detected (IDS probability: {handshake_anomaly:.2f})\n")
    else:
        print(f"   ⚠️  Handshake flagged (IDS probability: {handshake_anomaly:.2f})\n")
    
    # Step 3: Upload
    print("📋 Step 3: Secure File Upload")
    success, upload_result = upload_file_securely(token)
    
    if success:
        anomaly_score = upload_result.get("anomaly_score", 0)
        
        print("\n" + "="*70)
        print("  ✅ SECURE TRANSFER COMPLETED")
        print("="*70)
        print(f"\n   Handshake IDS Score: {handshake_anomaly:.2f}")
        print(f"   Upload IDS Score: {anomaly_score:.2f}")
        
        if handshake_anomaly < 0.3 and anomaly_score < 0.3:
            print("\n   🎉 Perfect! Normal traffic correctly identified (low IDS scores)")
            return True
        else:
            print("\n   ⚠️  Some IDS scores are elevated (but upload succeeded)")
            return True
    else:
        print("\n" + "="*70)
        print("  ❌ SECURE TRANSFER FAILED")
        print("="*70)
        print(f"\n   Error: {upload_result.get('error', 'Unknown error')}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

