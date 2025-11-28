#!/usr/bin/env python3
"""
URL Testing for Rendr Frontend Pages
Tests specific URLs to confirm they load without 500 errors
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://rendr-revamp.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

# Test URLs
TEST_URLS = [
    f"{BASE_URL}/dashboard",
    f"{BASE_URL}/settings",
    f"{BASE_URL}/pricing", 
    f"{BASE_URL}/showcase-editor",
    f"{BASE_URL}/@BrianJames"
]

# Login credentials
LOGIN_CREDENTIALS = {
    "username": "BrianJames",
    "password": "Brian123!"
}

class URLTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, test_name, success, message="", details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if message:
            print(f"    {message}")
        if not success and details:
            print(f"    Details: {details}")
        print()
    
    def login(self):
        """Login to get authentication token"""
        try:
            response = self.session.post(f"{API_URL}/auth/login", json=LOGIN_CREDENTIALS)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.auth_token = data["token"]
                    # Set authorization header for future requests
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("Login Authentication", True, 
                                f"Successfully logged in as @{data.get('username', 'unknown')}")
                    return True
                else:
                    self.log_test("Login Authentication", False, 
                                "No token in response", data)
                    return False
            else:
                self.log_test("Login Authentication", False, 
                            f"Login failed with status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Login Authentication", False, f"Login error: {str(e)}")
            return False
    
    def test_url(self, url):
        """Test a specific URL"""
        try:
            # Extract page name from URL for logging
            page_name = url.split('/')[-1] or "Home"
            if page_name.startswith('@'):
                page_name = f"Showcase ({page_name})"
            
            response = self.session.get(url, timeout=30)
            
            # Check status code
            if response.status_code == 200:
                # Check if response contains HTML
                content_type = response.headers.get('content-type', '').lower()
                if 'text/html' in content_type or '<html' in response.text.lower():
                    # Check for common error indicators
                    response_text = response.text.lower()
                    if 'error' in response_text and '500' in response_text:
                        self.log_test(f"URL Test - {page_name}", False, 
                                    "Page contains 500 error content")
                        return False
                    elif 'internal server error' in response_text:
                        self.log_test(f"URL Test - {page_name}", False, 
                                    "Page shows internal server error")
                        return False
                    else:
                        # Check response size (should be substantial for a real page)
                        content_length = len(response.text)
                        self.log_test(f"URL Test - {page_name}", True, 
                                    f"HTTP 200, HTML content ({content_length} chars)")
                        return True
                else:
                    self.log_test(f"URL Test - {page_name}", False, 
                                f"HTTP 200 but not HTML content. Content-Type: {content_type}")
                    return False
            elif response.status_code == 500:
                self.log_test(f"URL Test - {page_name}", False, 
                            "HTTP 500 - Internal Server Error")
                return False
            elif response.status_code == 404:
                self.log_test(f"URL Test - {page_name}", False, 
                            "HTTP 404 - Page Not Found")
                return False
            elif response.status_code == 401:
                self.log_test(f"URL Test - {page_name}", False, 
                            "HTTP 401 - Authentication Required")
                return False
            elif response.status_code == 403:
                self.log_test(f"URL Test - {page_name}", False, 
                            "HTTP 403 - Access Forbidden")
                return False
            else:
                self.log_test(f"URL Test - {page_name}", False, 
                            f"HTTP {response.status_code}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_test(f"URL Test - {page_name}", False, "Request timeout (30s)")
            return False
        except requests.exceptions.ConnectionError:
            self.log_test(f"URL Test - {page_name}", False, "Connection error")
            return False
        except Exception as e:
            self.log_test(f"URL Test - {page_name}", False, f"Error: {str(e)}")
            return False
    
    def run_url_tests(self):
        """Run all URL tests"""
        print("🌐 Starting Frontend URL Tests")
        print("=" * 50)
        
        # First login
        print("🔐 Authenticating...")
        if not self.login():
            print("❌ Login failed. Testing URLs without authentication...")
        
        # Test each URL
        print("\n🔍 Testing URLs...")
        for url in TEST_URLS:
            self.test_url(url)
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 URL TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total URLs Tested: {len(self.test_results) - 1}")  # -1 for login test
        print(f"✅ Passed: {passed - 1}")  # -1 for login test
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n❌ FAILED URLS:")
            for result in self.test_results:
                if not result["success"] and "URL Test" in result["test"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n🎯 SUMMARY:")
        url_tests = [r for r in self.test_results if "URL Test" in r["test"]]
        if all(r["success"] for r in url_tests):
            print("  ✅ All URLs return HTTP 200 with HTML content")
        else:
            print("  ❌ Some URLs have issues - see details above")

if __name__ == "__main__":
    tester = URLTester()
    tester.run_url_tests()