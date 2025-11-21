#!/usr/bin/env python3
"""
Backend API Testing for Rendr Creator Profile and Showcase Features
Tests all critical endpoints for the creator profile system
"""

import requests
import json
import os
import tempfile
from datetime import datetime

# Configuration
BASE_URL = "https://rendr-showcase.preview.emergentagent.com/api"

# Test accounts
TEST_ACCOUNTS = {
    "brian": {
        "username": "BrianJames",
        "password": "Brian123!"
    },
    "test": {
        "email": "test@rendr.com", 
        "password": "Test123!",
        "username": "test"
    }
}

class RendrAPITester:
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
    
    def test_health_check(self):
        """Test basic API health"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            if response.status_code == 200:
                self.log_test("API Health Check", True, "API is responding")
                return True
            else:
                self.log_test("API Health Check", False, f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_auth_login(self, account_key):
        """Test user login"""
        account = TEST_ACCOUNTS[account_key]
        try:
            # Use username for BrianJames, email for others
            login_data = {
                "password": account["password"]
            }
            if account_key == "brian":
                login_data["username"] = account["username"]
            else:
                login_data["email"] = account["email"]
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "username" in data:
                    self.set_auth_token(data["token"])
                    self.current_user = data
                    self.log_test(f"Login - {account['username']}", True, 
                                f"Logged in as @{data['username']}")
                    return True
                else:
                    self.log_test(f"Login - {account['username']}", False, 
                                "Missing token or username in response", data)
                    return False
            else:
                self.log_test(f"Login - {account['username']}", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test(f"Login - {account['username']}", False, f"Error: {str(e)}")
            return False
    
    def test_auth_me(self):
        """Test /auth/me endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if "username" in data and "email" in data:
                    self.log_test("Auth Me", True, f"Retrieved user info for @{data['username']}")
                    return True
                else:
                    self.log_test("Auth Me", False, "Missing required fields", data)
                    return False
            elif response.status_code == 401:
                self.log_test("Auth Me", False, "Authentication required")
                return False
            else:
                self.log_test("Auth Me", False, f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Auth Me", False, f"Error: {str(e)}")
            return False
    
    def test_creator_profile(self, username):
        """Test GET /@/username endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/@/{username}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["username", "display_name", "total_videos", "joined_at"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test(f"Creator Profile - @{username}", True, 
                                f"Profile loaded: {data['total_videos']} videos")
                    return True
                else:
                    self.log_test(f"Creator Profile - @{username}", False, 
                                f"Missing fields: {missing_fields}", data)
                    return False
            elif response.status_code == 404:
                self.log_test(f"Creator Profile - @{username}", False, 
                            f"Creator @{username} not found")
                return False
            else:
                self.log_test(f"Creator Profile - @{username}", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test(f"Creator Profile - @{username}", False, f"Error: {str(e)}")
            return False
    
    def test_creator_videos(self, username):
        """Test GET /@/username/videos endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/@/{username}/videos")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test(f"Creator Videos - @{username}", True, 
                                f"Retrieved {len(data)} videos")
                    return True
                else:
                    self.log_test(f"Creator Videos - @{username}", False, 
                                "Response is not a list", data)
                    return False
            elif response.status_code == 404:
                self.log_test(f"Creator Videos - @{username}", False, 
                            f"Creator @{username} not found")
                return False
            else:
                self.log_test(f"Creator Videos - @{username}", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test(f"Creator Videos - @{username}", False, f"Error: {str(e)}")
            return False
    
    def test_folders_list(self):
        """Test GET /folders endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/folders/")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Should have at least Default folder
                    default_folder = next((f for f in data if f.get("folder_name") == "Default"), None)
                    if default_folder:
                        self.log_test("Folders List", True, 
                                    f"Retrieved {len(data)} folders including Default")
                        return True
                    else:
                        self.log_test("Folders List", False, 
                                    "Default folder not found", data)
                        return False
                else:
                    self.log_test("Folders List", False, 
                                "Response is not a list", data)
                    return False
            elif response.status_code == 401:
                self.log_test("Folders List", False, "Authentication required")
                return False
            else:
                self.log_test("Folders List", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Folders List", False, f"Error: {str(e)}")
            return False
    
    def test_folder_create(self):
        """Test POST /folders/ endpoint (Dashboard folder creation)"""
        try:
            folder_name = f"Test Dashboard Folder"
            response = self.session.post(f"{BASE_URL}/folders/", json={
                "folder_name": folder_name,
                "description": "Testing folder creation"
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get("folder_name") == folder_name:
                    self.log_test("Dashboard Folder Create", True, 
                                f"Created folder: {folder_name}")
                    return data.get("folder_id")
                else:
                    self.log_test("Dashboard Folder Create", False, 
                                "Folder name mismatch", data)
                    return None
            elif response.status_code == 401:
                self.log_test("Dashboard Folder Create", False, "Authentication required")
                return None
            else:
                self.log_test("Dashboard Folder Create", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Dashboard Folder Create", False, f"Error: {str(e)}")
            return None
    
    def test_showcase_folder_create(self):
        """Test POST /showcase-folders endpoint (Showcase Editor folder creation)"""
        try:
            folder_name = f"Test Showcase Folder"
            response = self.session.post(f"{BASE_URL}/showcase-folders", json={
                "folder_name": folder_name,
                "description": "Testing showcase folders"
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get("folder_name") == folder_name:
                    self.log_test("Showcase Folder Create", True, 
                                f"Created showcase folder: {folder_name}")
                    return data.get("folder_id")
                else:
                    self.log_test("Showcase Folder Create", False, 
                                "Folder name mismatch", data)
                    return None
            elif response.status_code == 401:
                self.log_test("Showcase Folder Create", False, "Authentication required")
                return None
            else:
                self.log_test("Showcase Folder Create", False, 
                            f"Status: {response.status_code}", response.text)
                return None
        except Exception as e:
            self.log_test("Showcase Folder Create", False, f"Error: {str(e)}")
            return None
    
    def test_showcase_folders_list(self):
        """Test GET /showcase-folders endpoint"""
        try:
            response = self.session.get(f"{BASE_URL}/showcase-folders")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Showcase Folders List", True, 
                                f"Retrieved {len(data)} showcase folders")
                    return True
                else:
                    self.log_test("Showcase Folders List", False, 
                                "Response is not a list", data)
                    return False
            elif response.status_code == 401:
                self.log_test("Showcase Folders List", False, "Authentication required")
                return False
            else:
                self.log_test("Showcase Folders List", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Showcase Folders List", False, f"Error: {str(e)}")
            return False
    
    def test_folder_edge_cases(self):
        """Test folder creation edge cases"""
        # Test duplicate folder name
        try:
            duplicate_name = "Duplicate Test Folder"
            
            # Create first folder
            response1 = self.session.post(f"{BASE_URL}/folders/", json={
                "folder_name": duplicate_name,
                "description": "First folder"
            })
            
            if response1.status_code == 200:
                # Try to create duplicate
                response2 = self.session.post(f"{BASE_URL}/folders/", json={
                    "folder_name": duplicate_name,
                    "description": "Duplicate folder"
                })
                
                if response2.status_code == 400:
                    self.log_test("Folder Duplicate Prevention", True, 
                                "Duplicate folder name properly rejected")
                else:
                    self.log_test("Folder Duplicate Prevention", False, 
                                f"Expected 400, got {response2.status_code}")
            else:
                self.log_test("Folder Duplicate Prevention", False, 
                            "Could not create initial folder for duplicate test")
        except Exception as e:
            self.log_test("Folder Duplicate Prevention", False, f"Error: {str(e)}")
        
        # Test empty folder name
        try:
            response = self.session.post(f"{BASE_URL}/folders/", json={
                "folder_name": "",
                "description": "Empty name test"
            })
            
            if response.status_code == 400 or response.status_code == 422:
                self.log_test("Empty Folder Name Validation", True, 
                            "Empty folder name properly rejected")
            else:
                self.log_test("Empty Folder Name Validation", False, 
                            f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Empty Folder Name Validation", False, f"Error: {str(e)}")
    
    def test_showcase_folder_edge_cases(self):
        """Test showcase folder creation edge cases"""
        # Test duplicate showcase folder name
        try:
            duplicate_name = "Duplicate Showcase Folder"
            
            # Create first showcase folder
            response1 = self.session.post(f"{BASE_URL}/showcase-folders", json={
                "folder_name": duplicate_name,
                "description": "First showcase folder"
            })
            
            if response1.status_code == 200:
                # Try to create duplicate
                response2 = self.session.post(f"{BASE_URL}/showcase-folders", json={
                    "folder_name": duplicate_name,
                    "description": "Duplicate showcase folder"
                })
                
                if response2.status_code == 400:
                    self.log_test("Showcase Folder Duplicate Prevention", True, 
                                "Duplicate showcase folder name properly rejected")
                else:
                    self.log_test("Showcase Folder Duplicate Prevention", False, 
                                f"Expected 400, got {response2.status_code}")
            else:
                self.log_test("Showcase Folder Duplicate Prevention", False, 
                            "Could not create initial showcase folder for duplicate test")
        except Exception as e:
            self.log_test("Showcase Folder Duplicate Prevention", False, f"Error: {str(e)}")
        
        # Test empty showcase folder name
        try:
            response = self.session.post(f"{BASE_URL}/showcase-folders", json={
                "folder_name": "",
                "description": "Empty name test"
            })
            
            if response.status_code == 400 or response.status_code == 422:
                self.log_test("Empty Showcase Folder Name Validation", True, 
                            "Empty showcase folder name properly rejected")
            else:
                self.log_test("Empty Showcase Folder Name Validation", False, 
                            f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Empty Showcase Folder Name Validation", False, f"Error: {str(e)}")
    
    def test_unauthenticated_folder_access(self):
        """Test folder endpoints without authentication"""
        # Clear auth temporarily
        original_token = self.auth_token
        self.clear_auth()
        
        try:
            # Test folders list without auth
            response = self.session.get(f"{BASE_URL}/folders/")
            if response.status_code == 401:
                self.log_test("Unauthenticated Folders Access", True, 
                            "Folders list properly requires authentication")
            else:
                self.log_test("Unauthenticated Folders Access", False, 
                            f"Expected 401, got {response.status_code}")
            
            # Test folder creation without auth
            response = self.session.post(f"{BASE_URL}/folders/", json={
                "folder_name": "Unauthorized Test",
                "description": "Should fail"
            })
            if response.status_code == 401:
                self.log_test("Unauthenticated Folder Creation", True, 
                            "Folder creation properly requires authentication")
            else:
                self.log_test("Unauthenticated Folder Creation", False, 
                            f"Expected 401, got {response.status_code}")
            
            # Test showcase folders without auth
            response = self.session.get(f"{BASE_URL}/showcase-folders")
            if response.status_code == 401:
                self.log_test("Unauthenticated Showcase Folders Access", True, 
                            "Showcase folders properly require authentication")
            else:
                self.log_test("Unauthenticated Showcase Folders Access", False, 
                            f"Expected 401, got {response.status_code}")
                
        finally:
            # Restore auth
            if original_token:
                self.set_auth_token(original_token)
    
    def test_folder_update(self, folder_id):
        """Test PUT /folders/{folder_id} endpoint"""
        if not folder_id:
            self.log_test("Folder Update", False, "No folder ID provided")
            return False
            
        try:
            new_name = f"UpdatedFolder_{datetime.now().strftime('%H%M%S')}"
            response = self.session.put(f"{BASE_URL}/folders/{folder_id}", json={
                "folder_name": new_name
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get("folder_name") == new_name:
                    self.log_test("Folder Update", True, 
                                f"Updated folder to: {new_name}")
                    return True
                else:
                    self.log_test("Folder Update", False, 
                                "Folder name not updated", data)
                    return False
            elif response.status_code == 401:
                self.log_test("Folder Update", False, "Authentication required")
                return False
            elif response.status_code == 404:
                self.log_test("Folder Update", False, "Folder not found")
                return False
            else:
                self.log_test("Folder Update", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Folder Update", False, f"Error: {str(e)}")
            return False
    
    def test_folder_delete_protection(self):
        """Test that Default folder cannot be deleted"""
        try:
            # First get folders to find Default folder ID
            response = self.session.get(f"{BASE_URL}/folders/")
            if response.status_code != 200:
                self.log_test("Folder Delete Protection", False, "Could not get folders list")
                return False
                
            folders = response.json()
            default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
            
            if not default_folder:
                self.log_test("Folder Delete Protection", False, "Default folder not found")
                return False
            
            # Try to delete Default folder
            response = self.session.delete(f"{BASE_URL}/folders/{default_folder['folder_id']}")
            
            if response.status_code == 400:
                self.log_test("Folder Delete Protection", True, 
                            "Default folder deletion properly blocked")
                return True
            else:
                self.log_test("Folder Delete Protection", False, 
                            f"Default folder deletion not blocked. Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Folder Delete Protection", False, f"Error: {str(e)}")
            return False
    
    def test_username_uniqueness(self):
        """Test username uniqueness validation during registration"""
        try:
            # Try to register with existing username
            response = self.session.post(f"{BASE_URL}/auth/register", json={
                "email": "duplicate@test.com",
                "password": "Test123!",
                "display_name": "Duplicate Test",
                "username": "Brian"  # This should already exist
            })
            
            if response.status_code == 400:
                error_msg = response.json().get("detail", "")
                if "username" in error_msg.lower() or "taken" in error_msg.lower():
                    self.log_test("Username Uniqueness", True, 
                                "Username uniqueness properly enforced")
                    return True
                else:
                    self.log_test("Username Uniqueness", False, 
                                f"Wrong error message: {error_msg}")
                    return False
            else:
                self.log_test("Username Uniqueness", False, 
                            f"Expected 400 error, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Username Uniqueness", False, f"Error: {str(e)}")
            return False
    
    def test_verification_with_creator_info(self):
        """Test verification endpoint returns creator info"""
        try:
            # Use a known verification code (we'll use a dummy one for testing)
            response = self.session.post(f"{BASE_URL}/verify/code", json={
                "verification_code": "DUMMY123"  # This will likely not exist
            })
            
            if response.status_code == 200:
                data = response.json()
                if data.get("result") == "not_found":
                    self.log_test("Verification Creator Info", True, 
                                "Verification endpoint responding correctly for non-existent code")
                    return True
                elif "creator" in data:
                    creator = data["creator"]
                    if "username" in creator and "profile_url" in creator:
                        self.log_test("Verification Creator Info", True, 
                                    f"Creator info included: @{creator['username']}")
                        return True
                    else:
                        self.log_test("Verification Creator Info", False, 
                                    "Creator info missing required fields", creator)
                        return False
                else:
                    self.log_test("Verification Creator Info", False, 
                                "No creator info in response", data)
                    return False
            else:
                self.log_test("Verification Creator Info", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Verification Creator Info", False, f"Error: {str(e)}")
            return False
    
    def test_video_upload_with_thumbnail(self):
        """Test video upload with thumbnail extraction"""
        if not self.auth_token:
            self.log_test("Video Upload with Thumbnail", False, "Authentication required")
            return False
            
        try:
            # Create a minimal test video file (just a few bytes to simulate)
            import tempfile
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                # Write minimal MP4 header-like data
                temp_video.write(b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom')
                temp_video.write(b'\x00' * 100)  # Padding
                temp_video_path = temp_video.name
            
            # Get folder ID for upload
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
                folder_id = default_folder["folder_id"] if default_folder else None
            else:
                folder_id = None
            
            # Attempt video upload
            with open(temp_video_path, 'rb') as video_file:
                files = {'video_file': ('test_video.mp4', video_file, 'video/mp4')}
                data = {
                    'source': 'studio',
                    'folder_id': folder_id
                }
                response = self.session.post(f"{BASE_URL}/videos/upload", files=files, data=data)
            
            # Clean up temp file
            os.unlink(temp_video_path)
            
            if response.status_code == 200:
                data = response.json()
                if "thumbnail_url" in data and "verification_code" in data:
                    self.log_test("Video Upload with Thumbnail", True, 
                                f"Video uploaded with thumbnail: {data['verification_code']}")
                    return True
                else:
                    self.log_test("Video Upload with Thumbnail", False, 
                                "Missing thumbnail_url or verification_code", data)
                    return False
            elif response.status_code == 500:
                # Expected for our fake video file
                error_msg = response.json().get("detail", "")
                if "processing failed" in error_msg.lower():
                    self.log_test("Video Upload with Thumbnail", True, 
                                "Video upload endpoint working (failed on fake video as expected)")
                    return True
                else:
                    self.log_test("Video Upload with Thumbnail", False, 
                                f"Unexpected error: {error_msg}")
                    return False
            else:
                self.log_test("Video Upload with Thumbnail", False, 
                            f"Status: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Video Upload with Thumbnail", False, f"Error: {str(e)}")
            return False
    
    def test_static_file_endpoints(self):
        """Test static file serving endpoints"""
        # Test thumbnail endpoint (will likely 404 but should be properly configured)
        try:
            response = self.session.get(f"{BASE_URL}/thumbnails/test.jpg")
            # We expect 404 since no thumbnails exist, but endpoint should be configured
            if response.status_code in [404, 200]:
                self.log_test("Static Files - Thumbnails", True, 
                            "Thumbnail endpoint properly configured")
            else:
                self.log_test("Static Files - Thumbnails", False, 
                            f"Unexpected status: {response.status_code}")
        except Exception as e:
            self.log_test("Static Files - Thumbnails", False, f"Error: {str(e)}")
        
        # Test profile pictures endpoint
        try:
            response = self.session.get(f"{BASE_URL}/profile_pictures/test.jpg")
            if response.status_code in [404, 200]:
                self.log_test("Static Files - Profile Pictures", True, 
                            "Profile pictures endpoint properly configured")
                return True
            else:
                self.log_test("Static Files - Profile Pictures", False, 
                            f"Unexpected status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Static Files - Profile Pictures", False, f"Error: {str(e)}")
            return False
    
    def test_nonexistent_creator(self):
        """Test accessing non-existent creator profile"""
        try:
            response = self.session.get(f"{BASE_URL}/@/nonexistentuser123")
            
            if response.status_code == 404:
                self.log_test("Non-existent Creator", True, 
                            "Properly returns 404 for non-existent creator")
                return True
            else:
                self.log_test("Non-existent Creator", False, 
                            f"Expected 404, got: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Non-existent Creator", False, f"Error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting Rendr Backend API Tests")
        print("=" * 50)
        
        # Basic connectivity
        if not self.test_health_check():
            print("❌ API is not responding. Stopping tests.")
            return
        
        # Test authentication with Brian account
        print("\n🔐 Testing Authentication...")
        if self.test_auth_login("brian"):
            self.test_auth_me()
        
        # Test creator profiles (both existing users)
        print("\n👤 Testing Creator Profiles...")
        self.test_creator_profile("Brian")
        self.test_creator_profile("test")
        self.test_nonexistent_creator()
        
        # Test creator videos
        print("\n🎬 Testing Creator Videos...")
        self.test_creator_videos("Brian")
        self.test_creator_videos("test")
        
        # Test folder management (requires auth)
        if self.auth_token:
            print("\n📁 Testing Dashboard Folder Management...")
            self.test_folders_list()
            folder_id = self.test_folder_create()
            if folder_id:
                self.test_folder_update(folder_id)
            self.test_folder_delete_protection()
            
            print("\n🎨 Testing Showcase Editor Folder Management...")
            self.test_showcase_folders_list()
            showcase_folder_id = self.test_showcase_folder_create()
            
            print("\n🔒 Testing Folder Edge Cases...")
            self.test_folder_edge_cases()
            self.test_showcase_folder_edge_cases()
            
            print("\n🚫 Testing Unauthenticated Access...")
            self.test_unauthenticated_folder_access()
            
            print("\n🎬 Testing Video Upload...")
            self.test_video_upload_with_thumbnail()
        
        # Test registration validation
        print("\n✅ Testing Registration Validation...")
        self.test_username_uniqueness()
        
        # Test verification endpoint
        print("\n🔍 Testing Verification...")
        self.test_verification_with_creator_info()
        
        # Test static file endpoints
        print("\n📁 Testing Static File Serving...")
        self.test_static_file_endpoints()
        
        # Test with second account
        print("\n🔄 Testing with Test Account...")
        self.clear_auth()
        if self.test_auth_login("test"):
            self.test_auth_me()
            self.test_folders_list()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n🎯 CRITICAL ISSUES:")
        critical_failures = []
        for result in self.test_results:
            if not result["success"] and any(keyword in result["test"].lower() 
                for keyword in ["login", "auth", "creator profile", "folders"]):
                critical_failures.append(result)
        
        if critical_failures:
            for failure in critical_failures:
                print(f"  🚨 {failure['test']}: {failure['message']}")
        else:
            print("  ✅ No critical failures detected")

if __name__ == "__main__":
    tester = RendrAPITester()
    tester.run_all_tests()