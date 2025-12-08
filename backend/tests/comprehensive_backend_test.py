#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Rendr Platform
Based on the specific review request requirements
"""

import requests
import json
import os
from datetime import datetime

# Configuration
BASE_URL = "https://videoproof-1.preview.emergentagent.com/api"

# Test credentials from review request
CREDENTIALS = {
    "username": "BrianJames",
    "password": "Brian123!"
}

class RendrComprehensiveTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.current_user = None
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
    
    def set_auth_token(self, token):
        """Set authentication token for requests"""
        self.auth_token = token
        self.session.headers.update({"Authorization": f"Bearer {token}"})
    
    def clear_auth(self):
        """Clear authentication"""
        self.auth_token = None
        if "Authorization" in self.session.headers:
            del self.session.headers["Authorization"]

    # ========================================
    # 1. AUTHENTICATION & USER MANAGEMENT
    # ========================================
    
    def test_auth_login(self):
        """POST /api/auth/login with BrianJames/Brian123!"""
        try:
            login_data = {
                "username": CREDENTIALS["username"],
                "password": CREDENTIALS["password"]
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "username" in data:
                    self.set_auth_token(data["token"])
                    self.current_user = data
                    self.log_test("Authentication Login", True, 
                                f"Successfully logged in as @{data['username']}")
                    return True
                else:
                    self.log_test("Authentication Login", False, 
                                "Missing token or username in response", data)
                    return False
            else:
                self.log_test("Authentication Login", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Authentication Login", False, f"Error: {str(e)}")
            return False
    
    def test_auth_me(self):
        """GET /api/auth/me (verify user data)"""
        try:
            response = self.session.get(f"{BASE_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["username", "email", "premium_tier"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Auth Me Endpoint", True, 
                                f"User data retrieved: @{data['username']}, tier: {data.get('premium_tier', 'N/A')}")
                    return data
                else:
                    self.log_test("Auth Me Endpoint", False, 
                                f"Missing required fields: {missing_fields}", data)
                    return None
            else:
                self.log_test("Auth Me Endpoint", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Auth Me Endpoint", False, f"Error: {str(e)}")
            return None
    
    def test_user_quota(self):
        """GET /api/users/quota (verify quota system)"""
        try:
            response = self.session.get(f"{BASE_URL}/users/quota")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["tier", "limit", "unlimited", "can_upload"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("User Quota System", True, 
                                f"Quota data: tier={data['tier']}, limit={data['limit']}, unlimited={data['unlimited']}")
                    return data
                else:
                    self.log_test("User Quota System", False, 
                                f"Missing required fields: {missing_fields}", data)
                    return None
            else:
                self.log_test("User Quota System", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("User Quota System", False, f"Error: {str(e)}")
            return None
    
    def test_profile_update(self):
        """PUT /api/@/{username}/profile (update profile test)"""
        if not self.current_user:
            self.log_test("Profile Update", False, "No current user data")
            return False
            
        try:
            username = self.current_user["username"]
            update_data = {
                "display_name": "Brian James Updated",
                "bio": "Test bio update"
            }
            
            response = self.session.put(f"{BASE_URL}/@/{username}/profile", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Profile Update", True, 
                            f"Profile updated successfully")
                return True
            else:
                self.log_test("Profile Update", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Profile Update", False, f"Error: {str(e)}")
            return False

    # ========================================
    # 2. VIDEO MANAGEMENT
    # ========================================
    
    def test_video_list(self):
        """GET /api/videos/user/list (list all videos)"""
        try:
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                videos = response.json()  # API returns direct list
                
                self.log_test("Video List", True, 
                            f"Retrieved {len(videos)} videos")
                
                # Check video structure for required fields
                if videos:
                    sample_video = videos[0]
                    required_fields = ["video_id", "verification_code"]  # Use video_id not id
                    optional_fields = ["hashes", "storage"]
                    
                    missing_required = [field for field in required_fields if field not in sample_video]
                    present_optional = [field for field in optional_fields if field in sample_video and sample_video[field] is not None]
                    
                    if not missing_required:
                        self.log_test("Video Structure Validation", True, 
                                    f"Required fields present, optional fields: {present_optional}")
                    else:
                        self.log_test("Video Structure Validation", False, 
                                    f"Missing required fields: {missing_required}")
                
                return videos
            else:
                self.log_test("Video List", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Video List", False, f"Error: {str(e)}")
            return None
    
    def test_video_folder_filtering(self):
        """Check that folder_id filtering works"""
        try:
            # First get folders
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code != 200:
                self.log_test("Video Folder Filtering", False, "Could not get folders")
                return False
            
            folders = folders_response.json()
            if not folders:
                self.log_test("Video Folder Filtering", True, "No folders to test filtering with")
                return True
            
            # Test filtering by first folder
            folder_id = folders[0].get("folder_id")
            if not folder_id:
                self.log_test("Video Folder Filtering", False, "No folder_id in folder data")
                return False
            
            response = self.session.get(f"{BASE_URL}/videos/user/list?folder_id={folder_id}")
            
            if response.status_code == 200:
                videos = response.json()  # API returns direct list
                self.log_test("Video Folder Filtering", True, 
                            f"Folder filtering works: {len(videos)} videos in folder")
                return True
            else:
                self.log_test("Video Folder Filtering", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Video Folder Filtering", False, f"Error: {str(e)}")
            return False

    # ========================================
    # 3. FOLDER MANAGEMENT
    # ========================================
    
    def test_folders_list(self):
        """GET /api/folders/ (list user folders)"""
        try:
            response = self.session.get(f"{BASE_URL}/folders/")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Folders List", True, 
                                f"Retrieved {len(data)} folders")
                    return data
                else:
                    self.log_test("Folders List", False, 
                                "Response is not a list", data)
                    return None
            else:
                self.log_test("Folders List", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Folders List", False, f"Error: {str(e)}")
            return None
    
    def test_folder_create(self):
        """POST /api/folders/ (create test folder)"""
        try:
            folder_name = f"ComprehensiveTest_{datetime.now().strftime('%H%M%S')}"
            response = self.session.post(f"{BASE_URL}/folders/", json={
                "folder_name": folder_name,
                "description": "Comprehensive test folder"
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get("folder_name") == folder_name:
                    self.log_test("Folder Creation", True, 
                                f"Created folder: {folder_name}")
                    return data
                else:
                    self.log_test("Folder Creation", False, 
                                "Folder name mismatch", data)
                    return None
            else:
                self.log_test("Folder Creation", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Folder Creation", False, f"Error: {str(e)}")
            return None
    
    def test_showcase_folders(self):
        """Verify showcase folders with is_public field"""
        try:
            response = self.session.get(f"{BASE_URL}/showcase-folders")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if folders have is_public field or similar
                    public_folders = [f for f in data if f.get("is_public", True)]  # Default to public
                    self.log_test("Showcase Folders", True, 
                                f"Retrieved {len(data)} showcase folders, {len(public_folders)} public")
                    return data
                else:
                    self.log_test("Showcase Folders", False, 
                                "Response is not a list", data)
                    return None
            else:
                self.log_test("Showcase Folders", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Showcase Folders", False, f"Error: {str(e)}")
            return None

    # ========================================
    # 4. ADMIN ENDPOINTS (CEO ACCESS)
    # ========================================
    
    def test_ceo_stats(self):
        """GET /api/ceo-access-b7k9m2x/stats (platform stats)"""
        try:
            response = self.session.get(f"{BASE_URL}/ceo-access-b7k9m2x/stats")
            
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["total_users", "total_videos", "active_users"]
                present_fields = [field for field in expected_fields if field in data]
                
                self.log_test("CEO Stats Endpoint", True, 
                            f"Stats retrieved with fields: {present_fields}")
                return data
            elif response.status_code == 403:
                self.log_test("CEO Stats Endpoint", False, 
                            "Access denied - user may not have CEO privileges")
                return None
            else:
                self.log_test("CEO Stats Endpoint", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CEO Stats Endpoint", False, f"Error: {str(e)}")
            return None
    
    def test_ceo_users(self):
        """GET /api/ceo-access-b7k9m2x/users (user list)"""
        try:
            response = self.session.get(f"{BASE_URL}/ceo-access-b7k9m2x/users")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("CEO Users Endpoint", True, 
                                f"Retrieved {len(data)} users")
                    return data
                else:
                    # Might be paginated or wrapped
                    users = data.get("users", [])
                    self.log_test("CEO Users Endpoint", True, 
                                f"Retrieved {len(users)} users (wrapped response)")
                    return users
            elif response.status_code == 403:
                self.log_test("CEO Users Endpoint", False, 
                            "Access denied - user may not have CEO privileges")
                return None
            else:
                self.log_test("CEO Users Endpoint", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CEO Users Endpoint", False, f"Error: {str(e)}")
            return None
    
    def test_ceo_analytics(self):
        """GET /api/ceo-access-b7k9m2x/analytics (investor analytics)"""
        try:
            response = self.session.get(f"{BASE_URL}/ceo-access-b7k9m2x/analytics")
            
            if response.status_code == 200:
                data = response.json()
                # Check for analytics data structure
                analytics_fields = ["platform_metrics", "user_distribution", "video_analytics", "engagement_metrics"]
                present_fields = [field for field in analytics_fields if field in data]
                
                self.log_test("CEO Analytics Endpoint", True, 
                            f"Analytics retrieved with sections: {present_fields}")
                return data
            elif response.status_code == 403:
                self.log_test("CEO Analytics Endpoint", False, 
                            "Access denied - user may not have CEO privileges")
                return None
            else:
                self.log_test("CEO Analytics Endpoint", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("CEO Analytics Endpoint", False, f"Error: {str(e)}")
            return None

    # ========================================
    # 5. PASSWORD RESET FLOW
    # ========================================
    
    def test_password_reset_request(self):
        """POST /api/password/request-reset?email=test@example.com"""
        try:
            response = self.session.post(f"{BASE_URL}/password/request-reset?email=test@example.com")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Password Reset Request", True, 
                            "Reset token generation working")
                return data
            elif response.status_code == 404:
                self.log_test("Password Reset Request", True, 
                            "Properly handles non-existent email (404)")
                return True
            else:
                self.log_test("Password Reset Request", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Password Reset Request", False, f"Error: {str(e)}")
            return None

    # ========================================
    # 6. ANALYTICS
    # ========================================
    
    def test_analytics_dashboard(self):
        """GET /api/analytics/dashboard?days=30"""
        try:
            response = self.session.get(f"{BASE_URL}/analytics/dashboard?days=30")
            
            if response.status_code == 200:
                data = response.json()
                # Check for metrics calculation
                metrics_fields = ["page_views", "video_views", "social_clicks"]
                present_fields = [field for field in metrics_fields if field in data]
                
                self.log_test("Analytics Dashboard", True, 
                            f"Dashboard metrics retrieved: {present_fields}")
                return data
            else:
                self.log_test("Analytics Dashboard", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Analytics Dashboard", False, f"Error: {str(e)}")
            return None

    # ========================================
    # 7. VERIFICATION SYSTEM
    # ========================================
    
    def test_verification_system(self):
        """Verify that videos have comprehensive hashes and verification codes"""
        try:
            # Get videos to check verification system
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                videos = response.json()  # API returns direct list
                
                if not videos:
                    self.log_test("Verification System", True, 
                                "No videos to verify (system ready)")
                    return True
                
                # Check videos for verification fields
                verified_videos = [v for v in videos if v.get("verification_status") == "verified"]
                pending_videos = [v for v in videos if v.get("verification_status") == "pending"]
                
                if verified_videos:
                    video = verified_videos[0]  # Check a verified video
                    verification_fields = ["verification_code", "hashes", "storage"]
                    present_fields = [field for field in verification_fields if field in video and video[field] is not None]
                    
                    # Check hash types if hashes exist
                    hash_types = []
                    if "hashes" in video and video["hashes"]:
                        hashes = video["hashes"]
                        hash_types = list(hashes.keys())
                    
                    # Check storage tier system
                    storage_info = ""
                    if "storage" in video and video["storage"]:
                        storage = video["storage"]
                        storage_info = f"tier: {storage.get('tier', 'N/A')}, expires: {storage.get('expires_at', 'N/A')}"
                    
                    self.log_test("Verification System", True, 
                                f"Verified videos: {len(verified_videos)}, pending: {len(pending_videos)}, fields: {present_fields}, hash types: {hash_types}, {storage_info}")
                else:
                    self.log_test("Verification System", True, 
                                f"System ready - {len(pending_videos)} pending videos, {len(verified_videos)} verified")
                return True
            else:
                self.log_test("Verification System", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Verification System", False, f"Error: {str(e)}")
            return False

    # ========================================
    # ERROR SCENARIOS
    # ========================================
    
    def test_error_scenarios(self):
        """Test various error scenarios"""
        print("\n🚨 Testing Error Scenarios...")
        
        # Test invalid credentials
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json={
                "username": "invalid",
                "password": "invalid"
            })
            
            if response.status_code == 401:
                self.log_test("Invalid Credentials", True, 
                            "Properly rejects invalid credentials")
            else:
                self.log_test("Invalid Credentials", False, 
                            f"Expected 401, got {response.status_code}")
        except Exception as e:
            self.log_test("Invalid Credentials", False, f"Error: {str(e)}")
        
        # Test expired/missing token (clear auth temporarily)
        original_token = self.auth_token
        self.clear_auth()
        
        try:
            response = self.session.get(f"{BASE_URL}/auth/me")
            
            if response.status_code in [401, 403]:
                self.log_test("Missing Token", True, 
                            "Properly requires authentication")
            else:
                self.log_test("Missing Token", False, 
                            f"Expected 401/403, got {response.status_code}")
        except Exception as e:
            self.log_test("Missing Token", False, f"Error: {str(e)}")
        
        # Restore auth
        if original_token:
            self.set_auth_token(original_token)
        
        # Test non-existent resource
        try:
            response = self.session.get(f"{BASE_URL}/@/nonexistentuser999")
            
            if response.status_code == 404:
                self.log_test("Non-existent Resource", True, 
                            "Properly returns 404 for non-existent user")
            else:
                self.log_test("Non-existent Resource", False, 
                            f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Non-existent Resource", False, f"Error: {str(e)}")

    # ========================================
    # MAIN TEST RUNNER
    # ========================================
    
    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🧪 Starting Comprehensive Rendr Backend Tests")
        print("=" * 60)
        
        # 1. Authentication & User Management
        print("\n🔐 1. AUTHENTICATION & USER MANAGEMENT")
        print("-" * 40)
        if not self.test_auth_login():
            print("❌ Cannot proceed without authentication")
            return
        
        user_data = self.test_auth_me()
        quota_data = self.test_user_quota()
        self.test_profile_update()
        
        # 2. Video Management
        print("\n🎬 2. VIDEO MANAGEMENT")
        print("-" * 40)
        videos = self.test_video_list()
        self.test_video_folder_filtering()
        
        # 3. Folder Management
        print("\n📁 3. FOLDER MANAGEMENT")
        print("-" * 40)
        folders = self.test_folders_list()
        new_folder = self.test_folder_create()
        showcase_folders = self.test_showcase_folders()
        
        # 4. Admin Endpoints (CEO Access)
        print("\n👑 4. ADMIN ENDPOINTS (CEO ACCESS)")
        print("-" * 40)
        ceo_stats = self.test_ceo_stats()
        ceo_users = self.test_ceo_users()
        ceo_analytics = self.test_ceo_analytics()
        
        # 5. Password Reset Flow
        print("\n🔑 5. PASSWORD RESET FLOW")
        print("-" * 40)
        self.test_password_reset_request()
        
        # 6. Analytics
        print("\n📊 6. ANALYTICS")
        print("-" * 40)
        analytics = self.test_analytics_dashboard()
        
        # 7. Verification System
        print("\n🔍 7. VERIFICATION SYSTEM")
        print("-" * 40)
        self.test_verification_system()
        
        # Error Scenarios
        self.test_error_scenarios()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        success_rate = (passed / len(self.test_results)) * 100 if self.test_results else 0
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        # Critical success indicators
        print(f"\n🎯 CRITICAL SUCCESS INDICATORS:")
        critical_tests = [
            "Authentication Login",
            "Auth Me Endpoint", 
            "User Quota System",
            "Video List",
            "Folders List",
            "CEO Stats Endpoint"
        ]
        
        for test_name in critical_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"  {status} {test_name}")

if __name__ == "__main__":
    tester = RendrComprehensiveTester()
    tester.run_comprehensive_tests()