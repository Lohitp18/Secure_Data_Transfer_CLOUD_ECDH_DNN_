#!/usr/bin/env python3
"""
Quick Server Connection Test
Tests if server is accessible and shows detailed diagnostics
"""

import requests
import sys

def test_connection():
    """Test server connection with detailed diagnostics"""
    
    print("="*70)
    print("  🔍 SERVER CONNECTION DIAGNOSTICS")
    print("="*70)
    print()
    
    # URLs to try
    test_urls = [
        "http://localhost:5000/api/health",
        "http://127.0.0.1:5000/api/health",
        "http://localhost:5000/health",
        "http://127.0.0.1:5000/health",
    ]
    
    print("Testing server connection...")
    print()
    
    found = False
    
    for url in test_urls:
        print(f"Trying: {url}")
        try:
            response = requests.get(url, timeout=5)
            print(f"  ✅ Status Code: {response.status_code}")
            print(f"  ✅ Response: {response.text[:100]}")
            
            if response.status_code == 200:
                print(f"  ✅ SUCCESS! Server is running and accessible")
                print(f"\n   Working URL: {url}")
                found = True
                break
            else:
                print(f"  ⚠️  Server responded but with status {response.status_code}")
                
        except requests.exceptions.ConnectionError as e:
            print(f"  ❌ Connection Error: Cannot connect")
            print(f"     Details: {str(e)[:100]}")
        except requests.exceptions.Timeout:
            print(f"  ⏱️  Timeout: Server didn't respond in 5 seconds")
        except Exception as e:
            print(f"  ❌ Error: {type(e).__name__}: {str(e)[:100]}")
        
        print()
    
    print("="*70)
    
    if found:
        print("✅ Server is accessible!")
        print("\n   The server is running and responding.")
        print("   If setup_and_verify.py still fails, check:")
        print("   - Environment variables (SERVER_URL)")
        print("   - Firewall settings")
        print("   - Server logs for errors")
        return True
    else:
        print("❌ Cannot connect to server")
        print("\n   Troubleshooting steps:")
        print("   1. Check if server is running:")
        print("      - Look for: 'Server listening on http://localhost:5000'")
        print("   2. Start the server:")
        print("      cd server")
        print("      npm start")
        print("   3. Check if port 5000 is in use:")
        print("      netstat -ano | findstr :5000  (Windows)")
        print("      lsof -i :5000  (Mac/Linux)")
        print("   4. Try opening in browser:")
        print("      http://localhost:5000/api/health")
        print("   5. Check server console for errors")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)

