#!/usr/bin/env python3
"""
Special Backend Test for Super Secret Backdoor and Admin Features
Tests the following key features:
1. Super Secret Backdoor System (/pf2234-access)
2. CEO Dashboard Access (BrianJames/Brian123!)
3. Investor Dashboard Access (InvestorUser/SecureInvestor$1)
4. Login Tests
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://rendr-studio.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
CEO_USER = {
    "username": "BrianJames",
    "password": "Brian123!"
}

INVESTOR_USER = {
    "username": "InvestorUser", 
    "password": "SecureInvestor$1"
}

# Super Secret Backdoor credentials
SSB_PASSWORD = "PandaFrog2234!"

class SpecialBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.ceo_token = None
        self.investor_token = None
        self.ssb_token = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        if response_data and not success:
            print(f"   Response: {response_data}")
    
    def test_ceo_login(self) -> bool:
        """Test CEO login (BrianJames/Brian123!)"""
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json={
                "username": CEO_USER["username"],
                "password": CEO_USER["password"]
            })
            
            if response.status_code == 200:
                data = response.json()
                self.ceo_token = data.get("access_token") or data.get("token")
                user_info = data.get("user", {})
                
                if self.ceo_token:
                    self.log_test("CEO Login", True, f"Logged in as {user_info.get('username', 'Unknown')}")
                    return True
            
            self.log_test("CEO Login", False, f"Login failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("CEO Login", False, f"Login error: {str(e)}")
            return False
    
    def test_investor_login(self) -> bool:
        """Test Investor login (InvestorUser/SecureInvestor$1)"""
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json={
                "username": INVESTOR_USER["username"],
                "password": INVESTOR_USER["password"]
            })
            
            if response.status_code == 200:
                data = response.json()
                self.investor_token = data.get("access_token") or data.get("token")
                user_info = data.get("user", {})
                
                if self.investor_token:
                    self.log_test("Investor Login", True, f"Logged in as {user_info.get('username', 'Unknown')}")
                    return True
            
            self.log_test("Investor Login", False, f"Login failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("Investor Login", False, f"Login error: {str(e)}")
            return False
    
    def test_ssb_auth(self) -> bool:
        """Test Super Secret Backdoor authentication"""
        try:
            response = self.session.post(f"{API_BASE}/ssb/auth", json={
                "key": SSB_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.ssb_token = data.get("token")
                access_level = data.get("access_level")
                
                if access_level == "GOD_MODE":
                    self.log_test("SSB Authentication", True, f"Access level: {access_level}")
                    return True
                else:
                    self.log_test("SSB Authentication", False, f"Unexpected access level: {access_level}")
                    return False
            
            self.log_test("SSB Authentication", False, f"Auth failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("SSB Authentication", False, f"Auth error: {str(e)}")
            return False
    
    def test_ssb_stats_realtime(self) -> bool:
        """Test SSB realtime stats endpoint"""
        try:
            response = self.session.post(f"{API_BASE}/ssb/stats/realtime", json={
                "key": SSB_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify expected structure
                required_keys = ["timestamp", "users", "videos", "security", "activity"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if not missing_keys:
                    users_total = data["users"]["total"]
                    videos_total = data["videos"]["total"]
                    self.log_test("SSB Realtime Stats", True, f"Users: {users_total}, Videos: {videos_total}")
                    return True
                else:
                    self.log_test("SSB Realtime Stats", False, f"Missing keys: {missing_keys}")
                    return False
            
            self.log_test("SSB Realtime Stats", False, f"Request failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("SSB Realtime Stats", False, f"Error: {str(e)}")
            return False
    
    def test_ssb_users_list(self) -> bool:
        """Test SSB users list endpoint"""
        try:
            response = self.session.post(f"{API_BASE}/ssb/users/list", json={
                "key": SSB_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify expected structure
                if "total_users" in data and "users" in data:
                    total_users = data["total_users"]
                    users_list = data["users"]
                    
                    # Check if we have user data
                    if len(users_list) > 0:
                        sample_user = users_list[0]
                        user_keys = list(sample_user.keys())
                        self.log_test("SSB Users List", True, f"Total users: {total_users}, Sample keys: {user_keys[:5]}")
                        return True
                    else:
                        self.log_test("SSB Users List", True, f"Total users: {total_users} (empty list)")
                        return True
                else:
                    self.log_test("SSB Users List", False, "Missing required keys in response")
                    return False
            
            self.log_test("SSB Users List", False, f"Request failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("SSB Users List", False, f"Error: {str(e)}")
            return False
    
    def test_ssb_database_collections(self) -> bool:
        """Test SSB database collections endpoint"""
        try:
            response = self.session.post(f"{API_BASE}/ssb/database/collections", json={
                "key": SSB_PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify expected structure
                if "database" in data and "collections" in data:
                    database = data["database"]
                    collections = data["collections"]
                    
                    collection_names = [coll["name"] for coll in collections]
                    self.log_test("SSB Database Collections", True, f"Database: {database}, Collections: {len(collections)}, Names: {collection_names[:5]}")
                    return True
                else:
                    self.log_test("SSB Database Collections", False, "Missing required keys in response")
                    return False
            
            self.log_test("SSB Database Collections", False, f"Request failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("SSB Database Collections", False, f"Error: {str(e)}")
            return False
    
    def test_ceo_dashboard(self) -> bool:
        """Test CEO dashboard access"""
        if not self.ceo_token:
            self.log_test("CEO Dashboard", False, "No CEO token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.ceo_token}"}
            response = self.session.get(f"{API_BASE}/admin/ceo/dashboard", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify expected structure
                required_keys = ["users", "videos", "verifications", "ceo_metrics"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if not missing_keys:
                    users_total = data["users"]["total"]
                    videos_total = data["videos"]["total"]
                    ceo_metrics = data.get("ceo_metrics", {})
                    self.log_test("CEO Dashboard", True, f"Users: {users_total}, Videos: {videos_total}, CEO metrics: {bool(ceo_metrics)}")
                    return True
                else:
                    self.log_test("CEO Dashboard", False, f"Missing keys: {missing_keys}")
                    return False
            
            self.log_test("CEO Dashboard", False, f"Request failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("CEO Dashboard", False, f"Error: {str(e)}")
            return False
    
    def test_investor_dashboard(self) -> bool:
        """Test Investor dashboard access"""
        if not self.investor_token:
            self.log_test("Investor Dashboard", False, "No investor token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.investor_token}"}
            response = self.session.get(f"{API_BASE}/admin/investor/dashboard", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify expected structure
                required_keys = ["users", "videos", "verifications", "tier_distribution"]
                missing_keys = [key for key in required_keys if key not in data]
                
                if not missing_keys:
                    users_total = data["users"]["total"]
                    videos_total = data["videos"]["total"]
                    tier_dist = data.get("tier_distribution", {})
                    self.log_test("Investor Dashboard", True, f"Users: {users_total}, Videos: {videos_total}, Tiers: {tier_dist}")
                    return True
                else:
                    self.log_test("Investor Dashboard", False, f"Missing keys: {missing_keys}")
                    return False
            
            self.log_test("Investor Dashboard", False, f"Request failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("Investor Dashboard", False, f"Error: {str(e)}")
            return False
    
    def test_health_check(self) -> bool:
        """Test basic API health"""
        try:
            response = self.session.get(f"{API_BASE}/health")
            if response.status_code == 200:
                self.log_test("API Health Check", True, "API is healthy")
                return True
            else:
                # Try root endpoint
                response = self.session.get(f"{BASE_URL}/")
                if response.status_code == 200:
                    self.log_test("API Health Check", True, "API root endpoint accessible")
                    return True
                else:
                    self.log_test("API Health Check", False, f"Health check failed with status {response.status_code}")
                    return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False
    
    def run_complete_test_suite(self):
        """Run the complete test suite"""
        print("🎯 Starting Special Backend Testing (SSB + Admin Features)")
        print("=" * 80)
        
        # 1. Health check
        if not self.test_health_check():
            print("❌ API health check failed, aborting tests")
            return
        
        # 2. Test logins
        print("\n🔐 Testing Authentication...")
        ceo_login_success = self.test_ceo_login()
        investor_login_success = self.test_investor_login()
        
        # 3. Test Super Secret Backdoor
        print("\n🕵️ Testing Super Secret Backdoor...")
        ssb_auth_success = self.test_ssb_auth()
        
        if ssb_auth_success:
            self.test_ssb_stats_realtime()
            self.test_ssb_users_list()
            self.test_ssb_database_collections()
        else:
            print("❌ SSB authentication failed, skipping SSB tests")
        
        # 4. Test Admin Dashboards
        print("\n📊 Testing Admin Dashboards...")
        if ceo_login_success:
            self.test_ceo_dashboard()
        else:
            print("❌ CEO login failed, skipping CEO dashboard test")
        
        if investor_login_success:
            self.test_investor_dashboard()
        else:
            print("❌ Investor login failed, skipping investor dashboard test")
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🎯 SPECIAL BACKEND TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        print("\n📋 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}: {result['details']}")
        
        print("\n🔍 FAILED TESTS:")
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            for result in failed_tests:
                print(f"❌ {result['test']}: {result['details']}")
                if result.get('response_data'):
                    print(f"   Response: {result['response_data']}")
        else:
            print("✅ No failed tests!")
        
        # Critical features summary
        print(f"\n🎬 CRITICAL FEATURES STATUS:")
        
        # Check SSB features
        ssb_tests = [r for r in self.test_results if "SSB" in r["test"]]
        ssb_passed = sum(1 for r in ssb_tests if r["success"])
        print(f"   Super Secret Backdoor: {ssb_passed}/{len(ssb_tests)} tests passed")
        
        # Check login tests
        login_tests = [r for r in self.test_results if "Login" in r["test"]]
        login_passed = sum(1 for r in login_tests if r["success"])
        print(f"   Login Tests: {login_passed}/{len(login_tests)} tests passed")
        
        # Check dashboard tests
        dashboard_tests = [r for r in self.test_results if "Dashboard" in r["test"]]
        dashboard_passed = sum(1 for r in dashboard_tests if r["success"])
        print(f"   Admin Dashboards: {dashboard_passed}/{len(dashboard_tests)} tests passed")

def main():
    """Main test execution"""
    tester = SpecialBackendTester()
    tester.run_complete_test_suite()

if __name__ == "__main__":
    main()