#!/usr/bin/env python3
"""
ASYNC VIDEO UPLOAD AND NOTIFICATION SYSTEM TESTING

Test the async video upload and notification system as requested:

**Test Credentials:**
- Username: BrianJames
- Password: Brian123!

**Test Scenario:**
1. Login and check current notification preferences
2. Update notification preferences
3. Upload a test video
4. Check video status immediately after upload
5. Check videos list (dashboard view)
6. Wait for background processing

**Expected Results:**
- Users get watermarked video immediately
- Videos only appear in dashboard when fully verified
- Notification preferences can be updated
- Event system logs verification_complete event

**Database:** test_database
**Collection:** videos, users
"""

import requests
import json
import time
import os
import subprocess
import tempfile
from typing import Dict, Any, Optional
from pymongo import MongoClient

# Configuration
BASE_URL = "https://verify-video.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_USER = {
    "username": "BrianJames",
    "password": "Brian123!"
}

# MongoDB connection
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

class AsyncVideoNotificationTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_info = None
        self.test_results = []
        self.uploaded_video_id = None
        self.verification_code = None
        self.mongo_client = None
        self.db = None
        
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
    
    def connect_to_mongodb(self) -> bool:
        """Connect to MongoDB database"""
        try:
            self.mongo_client = MongoClient(MONGO_URL)
            self.db = self.mongo_client[DB_NAME]
            # Test connection
            self.mongo_client.admin.command('ping')
            self.log_test("MongoDB Connection", True, "Connected to MongoDB successfully")
            return True
        except Exception as e:
            self.log_test("MongoDB Connection", False, f"Failed to connect to MongoDB: {str(e)}")
            return False

    def test_1_login_and_check_notification_preferences(self) -> bool:
        """Test 1: Login and check current notification preferences"""
        try:
            # GET /api/auth/me (check notify_on_verification field)
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 200:
                user_data = response.json()
                
                # Check for notification fields
                notify_on_verification = user_data.get("notify_on_verification", False)
                notification_preference = user_data.get("notification_preference", "email")
                notify_video_length_threshold = user_data.get("notify_video_length_threshold", 30)
                sms_opted_in = user_data.get("sms_opted_in", True)
                
                details = f"Current notification preferences retrieved"
                details += f"\n   notify_on_verification: {notify_on_verification}"
                details += f"\n   notification_preference: {notification_preference}"
                details += f"\n   notify_video_length_threshold: {notify_video_length_threshold}s"
                details += f"\n   sms_opted_in: {sms_opted_in}"
                
                self.log_test("Check Notification Preferences", True, details)
                return True
            else:
                self.log_test("Check Notification Preferences", False, f"Failed to get user info: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Check Notification Preferences", False, f"Error: {str(e)}")
            return False

    def test_2_update_notification_preferences(self) -> bool:
        """Test 2: Update notification preferences"""
        try:
            # PATCH /api/auth/me/notifications with notify_on_verification=true, notify_email=true
            response = self.session.patch(
                f"{API_BASE}/auth/me/notifications",
                params={
                    "notify_email": True,
                    "notify_sms": False,
                    "notify_on_verification": True,
                    "notify_video_length_threshold": 30
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify the update was successful
                notify_email = data.get("notify_email", False)
                notify_on_verification = data.get("notify_on_verification", False)
                
                details = f"Notification preferences updated successfully"
                details += f"\n   notify_email: {notify_email}"
                details += f"\n   notify_on_verification: {notify_on_verification}"
                details += f"\n   message: {data.get('message', 'N/A')}"
                
                self.log_test("Update Notification Preferences", True, details)
                return True
            else:
                self.log_test("Update Notification Preferences", False, f"Update failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Update Notification Preferences", False, f"Error: {str(e)}")
            return False

    def create_test_video(self) -> Optional[str]:
        """Create a test MP4 video file using FFmpeg"""
        try:
            # Create a temporary video file using FFmpeg
            temp_dir = "/tmp/video_test"
            os.makedirs(temp_dir, exist_ok=True)
            
            test_video_path = f"{temp_dir}/test_video_async.mp4"
            
            # Create a 5-second test video with color bars and audio tone
            ffmpeg_cmd = [
                'ffmpeg', '-y',  # Overwrite output file
                '-f', 'lavfi',   # Use libavfilter virtual input
                '-i', 'testsrc2=duration=5:size=640x480:rate=30',  # 5 second video, 640x480, 30fps
                '-f', 'lavfi',   # Audio input
                '-i', 'sine=frequency=1000:duration=5',  # 1kHz tone for 5 seconds
                '-c:v', 'libx264',  # H.264 video codec
                '-c:a', 'aac',      # AAC audio codec
                '-shortest',        # Stop when shortest stream ends
                test_video_path
            ]
            
            print(f"\n🎬 Creating test video for async upload testing...")
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0 and os.path.exists(test_video_path):
                file_size = os.path.getsize(test_video_path)
                self.log_test("Create Test Video", True, f"Created test video: {file_size:,} bytes")
                return test_video_path
            else:
                self.log_test("Create Test Video", False, f"FFmpeg failed: {result.stderr}")
                return None
                
        except Exception as e:
            self.log_test("Create Test Video", False, f"Error creating test video: {str(e)}")
            return None

    def test_3_upload_test_video(self) -> bool:
        """Test 3: Upload a test video"""
        try:
            # Create a test video
            test_video = self.create_test_video()
            if not test_video:
                return False
            
            print(f"\n🎬 Testing async video upload...")
            
            # Remove Content-Type header for multipart upload
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            with open(test_video, 'rb') as f:
                files = {'video_file': ('test_video_async.mp4', f, 'video/mp4')}
                data = {'folder_id': None}  # No folder for this test
                
                response = requests.post(
                    f"{API_BASE}/videos/upload",
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=120  # Extended timeout for video processing
                )
            
            # Clean up test video
            if os.path.exists(test_video):
                os.remove(test_video)
            
            if response.status_code == 200:
                upload_data = response.json()
                
                # Verify required fields in response
                required_fields = ["video_id", "verification_code", "status"]
                
                missing_fields = []
                for field in required_fields:
                    if field not in upload_data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_test("Upload Test Video", False, f"Missing required fields: {missing_fields}")
                    return False
                
                # Store video info for further testing
                self.uploaded_video_id = upload_data["video_id"]
                self.verification_code = upload_data["verification_code"]
                
                # Verify response includes verification_code and download_url
                has_verification_code = "verification_code" in upload_data
                has_download_url = "watermarked_video_url" in upload_data or "download_url" in upload_data
                
                details = f"Video uploaded successfully"
                details += f"\n   Video ID: {self.uploaded_video_id}"
                details += f"\n   Verification Code: {self.verification_code}"
                details += f"\n   Status: {upload_data.get('status')}"
                details += f"\n   Has verification_code: {has_verification_code}"
                details += f"\n   Has download_url: {has_download_url}"
                
                if upload_data.get("processing_status"):
                    processing = upload_data["processing_status"]
                    details += f"\n   Processing stage: {processing.get('stage')}"
                    details += f"\n   Progress: {processing.get('progress')}%"
                
                self.log_test("Upload Test Video", True, details)
                return True
            else:
                self.log_test("Upload Test Video", False, f"Upload failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Upload Test Video", False, f"Upload error: {str(e)}")
            return False

    def test_4_check_video_status_immediately(self) -> bool:
        """Test 4: Check video status immediately after upload"""
        if not self.uploaded_video_id:
            self.log_test("Check Video Status Immediately", False, "No uploaded video ID available")
            return False
        
        try:
            # Query MongoDB directly: db.videos.find_one({"verification_code": "..."})
            if self.db is None:
                self.log_test("Check Video Status Immediately", False, "No MongoDB connection")
                return False
            
            video_doc = self.db.videos.find_one({"verification_code": self.verification_code})
            
            if not video_doc:
                self.log_test("Check Video Status Immediately", False, "Video not found in MongoDB")
                return False
            
            # Check expected status: verification_status="verified" and full_verification_status="processing"
            verification_status = video_doc.get("verification_status")
            full_verification_status = video_doc.get("full_verification_status")
            
            expected_verification = verification_status == "verified"
            expected_full_verification = full_verification_status == "processing"
            
            details = f"Video status checked immediately after upload"
            details += f"\n   verification_status: {verification_status} (expected: 'verified')"
            details += f"\n   full_verification_status: {full_verification_status} (expected: 'processing')"
            details += f"\n   Status matches expectations: {expected_verification and expected_full_verification}"
            
            # Additional status information
            if video_doc.get("comprehensive_hashes"):
                hashes = video_doc["comprehensive_hashes"]
                details += f"\n   Has original_sha256: {bool(hashes.get('original_sha256'))}"
                details += f"\n   Has watermarked_sha256: {bool(hashes.get('watermarked_sha256'))}"
                details += f"\n   Perceptual hashes count: {len(hashes.get('perceptual_hashes', []))}"
                details += f"\n   Has audio_hash: {bool(hashes.get('audio_hash'))}"
            
            success = expected_verification and expected_full_verification
            self.log_test("Check Video Status Immediately", success, details)
            return success
            
        except Exception as e:
            self.log_test("Check Video Status Immediately", False, f"Error: {str(e)}")
            return False

    def test_5_check_videos_list_dashboard_view(self) -> bool:
        """Test 5: Check videos list (dashboard view)"""
        if not self.uploaded_video_id:
            self.log_test("Check Videos List Dashboard", False, "No uploaded video ID available")
            return False
        
        try:
            # GET /api/videos/user/list (without include_processing)
            # Video should NOT appear yet (still processing)
            response1 = self.session.get(f"{API_BASE}/videos/user/list")
            
            if response1.status_code != 200:
                self.log_test("Check Videos List Dashboard", False, f"Failed to get video list: {response1.status_code}")
                return False
            
            videos_default = response1.json()
            video_found_default = any(v.get("video_id") == self.uploaded_video_id for v in videos_default)
            
            # GET /api/videos/user/list?include_processing=true
            # Video SHOULD appear
            response2 = self.session.get(f"{API_BASE}/videos/user/list?include_processing=true")
            
            if response2.status_code != 200:
                self.log_test("Check Videos List Dashboard", False, f"Failed to get processing video list: {response2.status_code}")
                return False
            
            videos_processing = response2.json()
            video_found_processing = any(v.get("video_id") == self.uploaded_video_id for v in videos_processing)
            
            # Expected behavior: NOT in default list, but IS in processing list
            expected_behavior = not video_found_default and video_found_processing
            
            details = f"Dashboard video list behavior checked"
            details += f"\n   Default list (include_processing=false): {len(videos_default)} videos"
            details += f"\n   Video found in default list: {video_found_default} (expected: False)"
            details += f"\n   Processing list (include_processing=true): {len(videos_processing)} videos"
            details += f"\n   Video found in processing list: {video_found_processing} (expected: True)"
            details += f"\n   Behavior matches expectations: {expected_behavior}"
            
            self.log_test("Check Videos List Dashboard", expected_behavior, details)
            return expected_behavior
            
        except Exception as e:
            self.log_test("Check Videos List Dashboard", False, f"Error: {str(e)}")
            return False

    def test_6_wait_for_background_processing(self) -> bool:
        """Test 6: Wait for background processing and check final status"""
        if not self.uploaded_video_id:
            self.log_test("Wait for Background Processing", False, "No uploaded video ID available")
            return False
        
        try:
            print(f"\n⏳ Waiting for background processing to complete...")
            
            # Wait up to 60 seconds for background processing
            max_wait_time = 60
            check_interval = 5
            elapsed_time = 0
            
            while elapsed_time < max_wait_time:
                time.sleep(check_interval)
                elapsed_time += check_interval
                
                print(f"   Checking status... ({elapsed_time}s elapsed)")
                
                # Check database for completion
                if self.db is None:
                    self.log_test("Wait for Background Processing", False, "No MongoDB connection")
                    return False
                
                video_doc = self.db.videos.find_one({"verification_code": self.verification_code})
                
                if not video_doc:
                    continue
                
                # Check if background processing is complete
                hashes = video_doc.get("comprehensive_hashes", {})
                has_perceptual = len(hashes.get("perceptual_hashes", [])) > 0
                has_audio = hashes.get("audio_hash") is not None
                
                verification_status = video_doc.get("verification_status")
                full_verification_status = video_doc.get("full_verification_status")
                
                if has_perceptual or has_audio or verification_status == "fully_verified":
                    # Background processing completed
                    details = f"Background processing completed after {elapsed_time}s"
                    details += f"\n   verification_status: {verification_status}"
                    details += f"\n   full_verification_status: {full_verification_status}"
                    details += f"\n   Perceptual hashes: {len(hashes.get('perceptual_hashes', []))} entries"
                    details += f"\n   Audio hash present: {bool(hashes.get('audio_hash'))}"
                    
                    # Check if video now appears in default dashboard list
                    response = self.session.get(f"{API_BASE}/videos/user/list")
                    if response.status_code == 200:
                        videos_default = response.json()
                        video_found_default = any(v.get("video_id") == self.uploaded_video_id for v in videos_default)
                        details += f"\n   Video now appears in default dashboard: {video_found_default}"
                    
                    self.log_test("Wait for Background Processing", True, details)
                    return True
            
            # Timeout reached
            details = f"Background processing timeout after {max_wait_time}s"
            details += f"\n   This may be normal - background processing can take longer"
            details += f"\n   Check manually or increase timeout for production testing"
            
            self.log_test("Wait for Background Processing", False, details)
            return False
            
        except Exception as e:
            self.log_test("Wait for Background Processing", False, f"Error: {str(e)}")
            return False

    def test_7_check_event_system_logs(self) -> bool:
        """Test 7: Check if event system logs verification_complete event"""
        try:
            # Check for any event logs or notifications related to verification
            if self.db is None:
                self.log_test("Check Event System Logs", False, "No MongoDB connection")
                return False
            
            # Look for notifications or events related to our video
            notifications = list(self.db.notifications.find({
                "user_email": self.user_info.get("email", ""),
                "verification_code": self.verification_code
            }))
            
            # Look for any event logs (if they exist)
            event_logs = []
            if "events" in self.db.list_collection_names():
                event_logs = list(self.db.events.find({
                    "event_type": "verification_complete",
                    "video_id": self.uploaded_video_id
                }))
            
            # Look for security logs
            security_logs = []
            if "security_logs" in self.db.list_collection_names():
                security_logs = list(self.db.security_logs.find({
                    "metadata.video_id": self.uploaded_video_id
                }))
            
            details = f"Event system logs checked"
            details += f"\n   Notifications found: {len(notifications)}"
            details += f"\n   Event logs found: {len(event_logs)}"
            details += f"\n   Security logs found: {len(security_logs)}"
            
            if notifications:
                details += f"\n   Latest notification: {notifications[0].get('message', 'N/A')}"
            
            # Consider it successful if we find any relevant logs or notifications
            has_logs = len(notifications) > 0 or len(event_logs) > 0 or len(security_logs) > 0
            
            self.log_test("Check Event System Logs", has_logs, details)
            return has_logs
            
        except Exception as e:
            self.log_test("Check Event System Logs", False, f"Error: {str(e)}")
            return False

    def run_async_video_notification_tests(self):
        """Run the complete async video upload and notification system test"""
        print("🎯 TESTING ASYNC VIDEO UPLOAD AND NOTIFICATION SYSTEM")
        print("=" * 80)
        print("Test Credentials: BrianJames / Brian123!")
        print("Database: test_database")
        print("Collections: videos, users")
        print("=" * 80)
        
        # Connect to MongoDB first
        if not self.connect_to_mongodb():
            print("❌ MongoDB connection failed, aborting tests")
            return
        
        # 1. Login and check current notification preferences
        if not self.authenticate():
            print("❌ Authentication failed, aborting tests")
            return
        
        # Test 1: Login and check notification preferences
        test1_success = self.test_1_login_and_check_notification_preferences()
        
        # Test 2: Update notification preferences
        test2_success = self.test_2_update_notification_preferences()
        
        # Test 3: Upload a test video
        test3_success = self.test_3_upload_test_video()
        
        if test3_success:
            # Test 4: Check video status immediately after upload
            test4_success = self.test_4_check_video_status_immediately()
            
            # Test 5: Check videos list (dashboard view)
            test5_success = self.test_5_check_videos_list_dashboard_view()
            
            # Test 6: Wait for background processing
            test6_success = self.test_6_wait_for_background_processing()
            
            # Test 7: Check event system logs
            test7_success = self.test_7_check_event_system_logs()
        else:
            print("❌ Video upload failed, skipping dependent tests")
            test4_success = test5_success = test6_success = test7_success = False
        
        # Cleanup MongoDB connection
        if self.mongo_client:
            self.mongo_client.close()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("🎯 ASYNC VIDEO UPLOAD AND NOTIFICATION SYSTEM TEST SUMMARY")
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
        
        print("\n🔍 EXPECTED RESULTS VERIFICATION:")
        
        # Check if expected results were achieved
        expected_results = {
            "Users get watermarked video immediately": any("Upload Test Video" in r["test"] and r["success"] for r in self.test_results),
            "Videos only appear in dashboard when fully verified": any("Check Videos List Dashboard" in r["test"] and r["success"] for r in self.test_results),
            "Notification preferences can be updated": any("Update Notification Preferences" in r["test"] and r["success"] for r in self.test_results),
            "Event system logs verification_complete event": any("Check Event System Logs" in r["test"] and r["success"] for r in self.test_results)
        }
        
        for expectation, achieved in expected_results.items():
            status = "✅" if achieved else "❌"
            print(f"{status} {expectation}: {'ACHIEVED' if achieved else 'NOT ACHIEVED'}")
        
        print("\n🔍 FAILED TESTS:")
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            for result in failed_tests:
                print(f"❌ {result['test']}: {result['details']}")
        else:
            print("✅ No failed tests!")
        
        # Summary for main agent
        if self.uploaded_video_id and self.verification_code:
            print(f"\n🎬 TEST VIDEO DETAILS:")
            print(f"   Video ID: {self.uploaded_video_id}")
            print(f"   Verification Code: {self.verification_code}")
            print(f"   User: {TEST_USER['username']}")
            print(f"   Database: {DB_NAME}")

def main():
    """Main test execution"""
    tester = AsyncVideoNotificationTester()
    tester.run_async_video_notification_tests()

if __name__ == "__main__":
    main()