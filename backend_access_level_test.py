#!/usr/bin/env python3
"""
RENDR STUDIO ACCESS LEVEL TESTING
Tests the backend changes for access level functionality as requested:

**Test Credentials:**
- Username: BrianJames
- Password: Brian123!

**Backend Tests Required:**

1. **Video Update with Access Level**:
   - PUT /api/videos/{video_id} should accept `access_level` field
   - Test updating a video with access_level = "public"
   - Test updating a video with access_level = "Silver Level" (a premium tier name)

2. **Public Showcase Videos Filter**:
   - GET /api/@/BrianJames/videos should only return videos where:
     - on_showcase = true
     - access_level = "public" OR access_level does not exist
   - Should NOT return videos with access_level = premium tier names

3. **Premium Videos Endpoint**:
   - GET /api/@/BrianJames/premium-videos should return videos where:
     - on_showcase = true
     - access_level is a premium tier name (not "public" or empty)
   - Response should include `access_level` field for grouping

4. **Folder Creation**:
   - POST /api/folders/ should create a new folder
   - Response should include folder_id and folder_name
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

class AccessLevelTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_info = None
        self.test_results = []
        self.test_video_ids = []  # Track videos created during testing
        self.test_folder_ids = []  # Track folders created during testing
        
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
            
            self.log_test("Authentication", False, f"Login failed with status {response.status_code}")
            return False
                    
        except Exception as e:
            self.log_test("Authentication", False, f"Authentication error: {str(e)}")
            return False
    
    def get_existing_videos(self) -> list:
        """Get existing videos for the user to use in tests"""
        try:
            response = self.session.get(f"{API_BASE}/videos/user/list")
            if response.status_code == 200:
                videos = response.json()
                self.log_test("Get Existing Videos", True, f"Found {len(videos)} existing videos")
                return videos
            else:
                self.log_test("Get Existing Videos", False, f"Failed to get videos: {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Get Existing Videos", False, f"Error getting videos: {str(e)}")
            return []
    
    def test_video_update_with_access_level(self) -> bool:
        """Test 1: Video Update with Access Level"""
        print(f"\n🎯 TEST 1: Video Update with Access Level")
        print("=" * 60)
        
        # Get existing videos to test with
        videos = self.get_existing_videos()
        if not videos:
            self.log_test("Video Update - Access Level", False, "No existing videos found to test with")
            return False
        
        # Use the first video for testing
        test_video = videos[0]
        video_id = test_video.get("video_id")
        
        if not video_id:
            self.log_test("Video Update - Access Level", False, "No valid video_id found in existing videos")
            return False
        
        print(f"   Testing with video ID: {video_id}")
        
        # Test 1A: Update video with access_level = "public"
        try:
            update_data = {
                "access_level": "public",
                "title": "Test Video - Public Access"
            }
            
            response = self.session.put(f"{API_BASE}/videos/{video_id}", json=update_data)
            
            if response.status_code == 200:
                self.log_test("Video Update - Public Access Level", True, 
                            f"Successfully updated video {video_id} with access_level='public'")
            else:
                self.log_test("Video Update - Public Access Level", False, 
                            f"Failed to update video: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Video Update - Public Access Level", False, f"Error updating video: {str(e)}")
            return False
        
        # Test 1B: Update video with access_level = "Silver Level" (premium tier)
        try:
            update_data = {
                "access_level": "Silver Level",
                "title": "Test Video - Silver Level Access"
            }
            
            response = self.session.put(f"{API_BASE}/videos/{video_id}", json=update_data)
            
            if response.status_code == 200:
                self.log_test("Video Update - Premium Access Level", True, 
                            f"Successfully updated video {video_id} with access_level='Silver Level'")
                return True
            else:
                self.log_test("Video Update - Premium Access Level", False, 
                            f"Failed to update video: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Video Update - Premium Access Level", False, f"Error updating video: {str(e)}")
            return False
    
    def test_public_showcase_videos_filter(self) -> bool:
        """Test 2: Public Showcase Videos Filter"""
        print(f"\n🎯 TEST 2: Public Showcase Videos Filter")
        print("=" * 60)
        
        try:
            # First, set up test data - ensure we have videos with different access levels
            videos = self.get_existing_videos()
            if len(videos) < 2:
                self.log_test("Public Showcase Filter Setup", False, "Need at least 2 videos for testing")
                return False
            
            # Set up test videos with different access levels and showcase status
            video1_id = videos[0].get("video_id")
            video2_id = videos[1].get("video_id") if len(videos) > 1 else None
            
            # Video 1: public access, on showcase
            update_data1 = {
                "access_level": "public",
                "on_showcase": True,
                "title": "Public Showcase Video"
            }
            response1 = self.session.put(f"{API_BASE}/videos/{video1_id}", json=update_data1)
            
            # Video 2: premium access, on showcase (should NOT appear in public list)
            if video2_id:
                update_data2 = {
                    "access_level": "Gold Level",
                    "on_showcase": True,
                    "title": "Premium Showcase Video"
                }
                response2 = self.session.put(f"{API_BASE}/videos/{video2_id}", json=update_data2)
            
            # Wait a moment for updates to process
            time.sleep(1)
            
            # Now test the public showcase endpoint
            response = self.session.get(f"{API_BASE}/@/BrianJames/videos")
            
            if response.status_code == 200:
                showcase_videos = response.json()
                
                print(f"   Found {len(showcase_videos)} videos in public showcase")
                
                # Verify filtering logic
                public_videos = []
                premium_videos = []
                
                for video in showcase_videos:
                    access_level = video.get("access_level", "public")
                    on_showcase = video.get("on_showcase", False)
                    
                    print(f"   Video: {video.get('title', 'Untitled')} - access_level: '{access_level}', on_showcase: {on_showcase}")
                    
                    if on_showcase:
                        if access_level in ["public", "", None] or not access_level:
                            public_videos.append(video)
                        else:
                            premium_videos.append(video)
                
                # Check that only public videos are returned
                if len(premium_videos) == 0:
                    self.log_test("Public Showcase Filter", True, 
                                f"✅ Correctly filtered: {len(public_videos)} public videos, {len(premium_videos)} premium videos (premium videos correctly excluded)")
                    return True
                else:
                    premium_titles = [v.get('title', 'Untitled') for v in premium_videos]
                    self.log_test("Public Showcase Filter", False, 
                                f"❌ Premium videos found in public showcase: {premium_titles}")
                    return False
            else:
                self.log_test("Public Showcase Filter", False, 
                            f"Failed to get showcase videos: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Public Showcase Filter", False, f"Error testing showcase filter: {str(e)}")
            return False
    
    def test_premium_videos_endpoint(self) -> bool:
        """Test 3: Premium Videos Endpoint"""
        print(f"\n🎯 TEST 3: Premium Videos Endpoint")
        print("=" * 60)
        
        try:
            response = self.session.get(f"{API_BASE}/@/BrianJames/premium-videos")
            
            if response.status_code == 200:
                premium_videos = response.json()
                
                print(f"   Found {len(premium_videos)} premium videos")
                
                # Verify each video meets premium criteria
                valid_premium_videos = []
                invalid_videos = []
                
                for video in premium_videos:
                    access_level = video.get("access_level", "")
                    on_showcase = video.get("on_showcase", False)
                    
                    print(f"   Video: {video.get('title', 'Untitled')} - access_level: '{access_level}', on_showcase: {on_showcase}")
                    
                    # Check premium criteria: on_showcase=True AND access_level is not public/empty
                    if on_showcase and access_level and access_level not in ["public", ""]:
                        valid_premium_videos.append(video)
                        
                        # Verify access_level field is included in response
                        if "access_level" not in video:
                            self.log_test("Premium Videos - Response Fields", False, 
                                        f"access_level field missing from video response")
                            return False
                    else:
                        invalid_videos.append(video)
                
                if len(invalid_videos) == 0:
                    self.log_test("Premium Videos Endpoint", True, 
                                f"✅ All {len(valid_premium_videos)} videos meet premium criteria (on_showcase=True, access_level=premium tier)")
                    
                    # Verify response includes access_level for grouping
                    if valid_premium_videos and all("access_level" in v for v in valid_premium_videos):
                        self.log_test("Premium Videos - Access Level Field", True, 
                                    "✅ All premium videos include access_level field for grouping")
                        return True
                    else:
                        self.log_test("Premium Videos - Access Level Field", False, 
                                    "❌ Some premium videos missing access_level field")
                        return False
                else:
                    invalid_titles = [v.get('title', 'Untitled') for v in invalid_videos]
                    self.log_test("Premium Videos Endpoint", False, 
                                f"❌ Invalid videos found in premium endpoint: {invalid_titles}")
                    return False
            else:
                self.log_test("Premium Videos Endpoint", False, 
                            f"Failed to get premium videos: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Premium Videos Endpoint", False, f"Error testing premium videos: {str(e)}")
            return False
    
    def test_folder_creation(self) -> bool:
        """Test 4: Folder Creation"""
        print(f"\n🎯 TEST 4: Folder Creation")
        print("=" * 60)
        
        try:
            # Create a test folder
            folder_data = {
                "folder_name": f"Test Folder {int(time.time())}",
                "description": "Test folder created by access level testing"
            }
            
            response = self.session.post(f"{API_BASE}/folders/", json=folder_data)
            
            if response.status_code == 200:
                folder_response = response.json()
                
                # Verify required fields are present
                required_fields = ["folder_id", "folder_name"]
                missing_fields = []
                
                for field in required_fields:
                    if field not in folder_response:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_test("Folder Creation - Response Fields", False, 
                                f"Missing required fields: {missing_fields}")
                    return False
                
                folder_id = folder_response.get("folder_id")
                folder_name = folder_response.get("folder_name")
                
                # Track for cleanup
                self.test_folder_ids.append(folder_id)
                
                self.log_test("Folder Creation", True, 
                            f"✅ Successfully created folder '{folder_name}' with ID: {folder_id}")
                
                # Verify folder appears in folder list
                list_response = self.session.get(f"{API_BASE}/folders/")
                if list_response.status_code == 200:
                    folders = list_response.json()
                    created_folder = next((f for f in folders if f.get("folder_id") == folder_id), None)
                    
                    if created_folder:
                        self.log_test("Folder Creation - Verification", True, 
                                    f"✅ Created folder appears in folder list")
                        return True
                    else:
                        self.log_test("Folder Creation - Verification", False, 
                                    f"❌ Created folder not found in folder list")
                        return False
                else:
                    self.log_test("Folder Creation - Verification", False, 
                                f"Failed to verify folder creation: {list_response.status_code}")
                    return False
            else:
                self.log_test("Folder Creation", False, 
                            f"Failed to create folder: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Folder Creation", False, f"Error creating folder: {str(e)}")
            return False
    
    def cleanup_test_data(self):
        """Clean up test folders created during testing"""
        print(f"\n🧹 CLEANUP: Removing test folders...")
        
        for folder_id in self.test_folder_ids:
            try:
                response = self.session.delete(f"{API_BASE}/folders/{folder_id}")
                if response.status_code == 200:
                    print(f"   ✅ Deleted test folder: {folder_id}")
                else:
                    print(f"   ⚠️ Failed to delete folder {folder_id}: {response.status_code}")
            except Exception as e:
                print(f"   ❌ Error deleting folder {folder_id}: {str(e)}")
    
    def run_access_level_tests(self):
        """Run all access level tests"""
        print("🎯 TESTING RENDR STUDIO ACCESS LEVEL FUNCTIONALITY")
        print("=" * 80)
        print("Test Scenario:")
        print("1. Video Update with Access Level (public and premium)")
        print("2. Public Showcase Videos Filter (only public videos)")
        print("3. Premium Videos Endpoint (only premium tier videos)")
        print("4. Folder Creation (with required response fields)")
        print("=" * 80)
        
        # 1. Authentication
        if not self.authenticate():
            print("❌ Authentication failed, aborting tests")
            return
        
        # 2. Run all tests
        test_results = []
        
        test_results.append(self.test_video_update_with_access_level())
        test_results.append(self.test_public_showcase_videos_filter())
        test_results.append(self.test_premium_videos_endpoint())
        test_results.append(self.test_folder_creation())
        
        # 3. Cleanup
        self.cleanup_test_data()
        
        # 4. Print summary
        self.print_summary(test_results)
    
    def print_summary(self, test_results: list):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🎯 ACCESS LEVEL FUNCTIONALITY TEST SUMMARY")
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
        
        print("\n🔍 CRITICAL FUNCTIONALITY STATUS:")
        
        # Check main test categories
        main_tests = [
            ("Video Update with Access Level", any("Video Update" in r["test"] and r["success"] for r in self.test_results)),
            ("Public Showcase Filter", any("Public Showcase Filter" in r["test"] and r["success"] for r in self.test_results)),
            ("Premium Videos Endpoint", any("Premium Videos Endpoint" in r["test"] and r["success"] for r in self.test_results)),
            ("Folder Creation", any("Folder Creation" in r["test"] and r["success"] for r in self.test_results))
        ]
        
        for test_name, success in main_tests:
            status = "✅" if success else "❌"
            result = "WORKING" if success else "FAILED"
            print(f"   {status} {test_name}: {result}")
        
        print("\n🔍 FAILED TESTS:")
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            for result in failed_tests:
                print(f"❌ {result['test']}: {result['details']}")
                if result.get('response_data'):
                    print(f"   Response: {result['response_data']}")
        else:
            print("✅ No failed tests!")
        
        # Overall assessment
        all_main_tests_passed = all(success for _, success in main_tests)
        
        if all_main_tests_passed:
            print(f"\n🎉 ALL ACCESS LEVEL FUNCTIONALITY TESTS PASSED!")
            print(f"   ✅ Video access_level field updates working")
            print(f"   ✅ Public showcase filtering working correctly")
            print(f"   ✅ Premium videos endpoint working correctly")
            print(f"   ✅ Folder creation working with required fields")
        else:
            failed_main = [name for name, success in main_tests if not success]
            print(f"\n⚠️ SOME FUNCTIONALITY ISSUES DETECTED:")
            for failed in failed_main:
                print(f"   ❌ {failed}")

def main():
    """Main test execution"""
    tester = AccessLevelTester()
    tester.run_access_level_tests()

if __name__ == "__main__":
    main()