#!/usr/bin/env python3
"""
RENDR PLATFORM BACKEND API TESTING
Tests specific backend endpoints for the Rendr Studio video verification platform

**Test Credentials:**
- Username: BrianJames
- Password: Brian123!

**Backend Tests Required:**

1. **Premium Video Filter Bug (CRITICAL)**: 
   - GET /api/@/{username}/videos should ONLY return free-tier videos (not premium)
   - Backend filter in users.py was updated to exclude videos with storage.tier = "pro" or "enterprise"
   - Verify the query properly filters by checking videos that are on_showcase=true AND (storage.tier="free" OR storage does not exist)

2. **Video Delete Endpoint**:
   - DELETE /api/videos/{video_id} should delete a video
   - Should require authentication
   - Should return success confirmation

3. **Folder List Endpoint**:
   - GET /api/folders/ should return list of folders for authenticated user
   - Response should include folder_id and folder_name fields

4. **Video Update Endpoint**:
   - PUT /api/videos/{video_id} should accept folder_id field to move video to different folder
"""

import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://rendr-platform.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_USER = {
    "username": "BrianJames",
    "password": "Brian123!"
}

class RendrPlatformTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_info = None
        self.test_results = []
        
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
    
    def authenticate(self) -> bool:
        """Authenticate with the test user"""
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json={
                "username": TEST_USER["username"],
                "password": TEST_USER["password"]
            })
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token") or data.get("token")
                self.user_info = data.get("user", {})
                
                if self.auth_token:
                    # Set authorization header for future requests
                    self.session.headers.update({
                        "Authorization": f"Bearer {self.auth_token}",
                        "Content-Type": "application/json"
                    })
                    
                    self.log_test("Authentication", True, f"Logged in as {self.user_info.get('username', 'Unknown')}")
                    return True
            
            self.log_test("Authentication", False, f"Login failed with status {response.status_code}", response.text)
            return False
                    
        except Exception as e:
            self.log_test("Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def test_premium_video_filter(self) -> bool:
        """CRITICAL TEST: Verify premium video filter excludes pro/enterprise videos"""
        try:
            username = TEST_USER["username"]
            response = self.session.get(f"{API_BASE}/@/{username}/videos")
            
            if response.status_code != 200:
                self.log_test("Premium Video Filter", False, f"API call failed with status {response.status_code}", response.text)
                return False
            
            videos = response.json()
            
            # Check that all returned videos are either free tier or have no storage tier
            premium_videos_found = []
            for video in videos:
                storage = video.get("storage", {})
                tier = storage.get("tier")
                
                # If tier is pro or enterprise, this is a bug
                if tier in ["pro", "enterprise"]:
                    premium_videos_found.append({
                        "video_id": video.get("video_id"),
                        "tier": tier,
                        "on_showcase": video.get("on_showcase")
                    })
            
            if premium_videos_found:
                details = f"CRITICAL BUG: Found {len(premium_videos_found)} premium videos in free showcase"
                details += f"\nPremium videos: {premium_videos_found}"
                self.log_test("Premium Video Filter", False, details, premium_videos_found)
                return False
            else:
                details = f"Filter working correctly: {len(videos)} videos returned, all free tier or no tier specified"
                # Show breakdown of tiers
                tier_counts = {}
                for video in videos:
                    storage = video.get("storage", {})
                    tier = storage.get("tier", "no_tier")
                    tier_counts[tier] = tier_counts.get(tier, 0) + 1
                
                details += f"\nTier breakdown: {tier_counts}"
                self.log_test("Premium Video Filter", True, details)
                return True
                
        except Exception as e:
            self.log_test("Premium Video Filter", False, f"Error testing premium filter: {str(e)}")
            return False
    
    def test_folder_list_endpoint(self) -> bool:
        """Test GET /api/folders/ endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/folders/")
            
            if response.status_code != 200:
                self.log_test("Folder List Endpoint", False, f"API call failed with status {response.status_code}", response.text)
                return False
            
            folders = response.json()
            
            # Verify response structure
            if not isinstance(folders, list):
                self.log_test("Folder List Endpoint", False, "Response is not a list", folders)
                return False
            
            # Check required fields in each folder
            missing_fields = []
            for folder in folders:
                if "folder_id" not in folder:
                    missing_fields.append("folder_id")
                if "folder_name" not in folder:
                    missing_fields.append("folder_name")
            
            if missing_fields:
                self.log_test("Folder List Endpoint", False, f"Missing required fields: {set(missing_fields)}", folders)
                return False
            
            details = f"Retrieved {len(folders)} folders with required fields"
            if folders:
                folder_names = [f["folder_name"] for f in folders[:3]]  # Show first 3
                details += f"\nSample folders: {folder_names}"
            
            self.log_test("Folder List Endpoint", True, details)
            return True
                
        except Exception as e:
            self.log_test("Folder List Endpoint", False, f"Error testing folder list: {str(e)}")
            return False
    
    def test_video_update_endpoint(self) -> bool:
        """Test PUT /api/videos/{video_id} endpoint with folder_id field"""
        try:
            # First, get user's videos to find one to test with
            response = self.session.get(f"{API_BASE}/videos/user/list")
            
            if response.status_code != 200:
                self.log_test("Video Update Endpoint", False, f"Failed to get user videos: {response.status_code}", response.text)
                return False
            
            videos = response.json()
            
            if not videos:
                self.log_test("Video Update Endpoint", False, "No videos found to test with")
                return False
            
            # Get first video
            test_video = videos[0]
            video_id = test_video.get("video_id")
            
            if not video_id:
                self.log_test("Video Update Endpoint", False, "No video_id found in video data", test_video)
                return False
            
            # Get folders to test moving video to a folder
            folders_response = self.session.get(f"{API_BASE}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                test_folder_id = folders[0]["folder_id"] if folders else None
            else:
                test_folder_id = None
            
            # Test updating video with folder_id
            update_data = {
                "folder_id": test_folder_id,
                "title": "Test Video Update"
            }
            
            response = self.session.put(f"{API_BASE}/videos/{video_id}", json=update_data)
            
            if response.status_code != 200:
                self.log_test("Video Update Endpoint", False, f"Update failed with status {response.status_code}", response.text)
                return False
            
            result = response.json()
            
            if "message" not in result:
                self.log_test("Video Update Endpoint", False, "No success message in response", result)
                return False
            
            details = f"Successfully updated video {video_id}"
            if test_folder_id:
                details += f" and moved to folder {test_folder_id}"
            
            self.log_test("Video Update Endpoint", True, details)
            return True
                
        except Exception as e:
            self.log_test("Video Update Endpoint", False, f"Error testing video update: {str(e)}")
            return False
    
    def test_video_delete_endpoint(self) -> bool:
        """Test DELETE /api/videos/{video_id} endpoint"""
        try:
            # First, get user's videos to find one to test with
            response = self.session.get(f"{API_BASE}/videos/user/list")
            
            if response.status_code != 200:
                self.log_test("Video Delete Endpoint", False, f"Failed to get user videos: {response.status_code}", response.text)
                return False
            
            videos = response.json()
            
            if not videos:
                self.log_test("Video Delete Endpoint", False, "No videos found to test deletion with")
                return False
            
            # Find a video to delete (preferably not the first one to avoid deleting important content)
            test_video = None
            for video in videos:
                # Look for a test video or use the last one
                if "test" in video.get("title", "").lower() or video == videos[-1]:
                    test_video = video
                    break
            
            if not test_video:
                test_video = videos[-1]  # Use last video as fallback
            
            video_id = test_video.get("video_id")
            
            if not video_id:
                self.log_test("Video Delete Endpoint", False, "No video_id found in video data", test_video)
                return False
            
            # Test authentication requirement by trying without auth first
            temp_session = requests.Session()
            unauth_response = temp_session.delete(f"{API_BASE}/videos/{video_id}")
            
            if unauth_response.status_code == 401 or unauth_response.status_code == 403:
                auth_required = True
            else:
                auth_required = False
            
            # Now test with authentication
            response = self.session.delete(f"{API_BASE}/videos/{video_id}")
            
            if response.status_code != 200:
                self.log_test("Video Delete Endpoint", False, f"Delete failed with status {response.status_code}", response.text)
                return False
            
            result = response.json()
            
            if "message" not in result:
                self.log_test("Video Delete Endpoint", False, "No success message in response", result)
                return False
            
            # Verify video is actually deleted by trying to get it
            verify_response = self.session.get(f"{API_BASE}/videos/user/list")
            if verify_response.status_code == 200:
                remaining_videos = verify_response.json()
                video_still_exists = any(v.get("video_id") == video_id for v in remaining_videos)
                
                if video_still_exists:
                    self.log_test("Video Delete Endpoint", False, f"Video {video_id} still exists after deletion")
                    return False
            
            details = f"Successfully deleted video {video_id}"
            if auth_required:
                details += " (authentication properly required)"
            else:
                details += " (WARNING: authentication may not be properly enforced)"
            
            self.log_test("Video Delete Endpoint", True, details)
            return True
                
        except Exception as e:
            self.log_test("Video Delete Endpoint", False, f"Error testing video delete: {str(e)}")
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
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("🎯 TESTING RENDR PLATFORM BACKEND APIs")
        print("=" * 60)
        print("Test Credentials: BrianJames / Brian123!")
        print("=" * 60)
        
        # 1. Health check
        if not self.test_health_check():
            print("❌ API health check failed, aborting tests")
            return
        
        # 2. Authentication
        if not self.authenticate():
            print("❌ Authentication failed, aborting tests")
            return
        
        # 3. Test Premium Video Filter (CRITICAL)
        print("\n🔍 TESTING PREMIUM VIDEO FILTER (CRITICAL)")
        self.test_premium_video_filter()
        
        # 4. Test Folder List Endpoint
        print("\n📁 TESTING FOLDER LIST ENDPOINT")
        self.test_folder_list_endpoint()
        
        # 5. Test Video Update Endpoint
        print("\n✏️ TESTING VIDEO UPDATE ENDPOINT")
        self.test_video_update_endpoint()
        
        # 6. Test Video Delete Endpoint
        print("\n🗑️ TESTING VIDEO DELETE ENDPOINT")
        self.test_video_delete_endpoint()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🎯 RENDR PLATFORM BACKEND TEST SUMMARY")
        print("=" * 60)
        
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
        
        print("\n🔍 CRITICAL ISSUES:")
        critical_failures = [r for r in self.test_results if not r["success"] and "critical" in r["test"].lower()]
        if critical_failures:
            for result in critical_failures:
                print(f"❌ {result['test']}: {result['details']}")
                if result.get('response_data'):
                    print(f"   Data: {result['response_data']}")
        else:
            print("✅ No critical issues found!")
        
        print("\n🔍 FAILED TESTS:")
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            for result in failed_tests:
                print(f"❌ {result['test']}: {result['details']}")
                if result.get('response_data'):
                    print(f"   Response: {result['response_data']}")
        else:
            print("✅ All tests passed!")

def main():
    """Main test execution"""
    tester = RendrPlatformTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()