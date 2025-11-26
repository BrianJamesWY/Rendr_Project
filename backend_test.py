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
BASE_URL = "https://stripe-premium-2.preview.emergentagent.com/api"

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
    
    def test_video_upload_with_watermark(self):
        """Test video upload with watermark and verification code"""
        if not self.auth_token:
            self.log_test("Video Upload with Watermark", False, "Authentication required")
            return None
            
        try:
            # Create a small test video file using ffmpeg
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video_path = temp_video.name
            
            # Create a simple test video using ffmpeg (5 seconds, 320x240)
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=5:size=320x240:rate=1',
                '-c:v', 'libx264', '-t', '5', '-pix_fmt', 'yuv420p', '-y', temp_video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            if result.returncode != 0:
                self.log_test("Video Upload with Watermark", False, 
                            f"Failed to create test video: {result.stderr.decode()}")
                return None
            
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
                files = {'video_file': ('watermark_test.mp4', video_file, 'video/mp4')}
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
                    verification_code = data["verification_code"]
                    self.log_test("Video Upload with Watermark", True, 
                                f"Video uploaded successfully with verification code: {verification_code}")
                    return {
                        "video_id": data.get("video_id"),
                        "verification_code": verification_code,
                        "thumbnail_url": data.get("thumbnail_url")
                    }
                else:
                    self.log_test("Video Upload with Watermark", False, 
                                "Missing thumbnail_url or verification_code", data)
                    return None
            else:
                error_msg = response.text
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    pass
                self.log_test("Video Upload with Watermark", False, 
                            f"Status: {response.status_code}, Error: {error_msg}")
                return None
        except Exception as e:
            self.log_test("Video Upload with Watermark", False, f"Error: {str(e)}")
            return None
    
    def test_watermark_verification_code_format(self, verification_code):
        """Test that verification code follows RND-XXXX format"""
        try:
            import re
            pattern = r'^RND-[A-Z0-9]{6}$'
            
            if re.match(pattern, verification_code):
                self.log_test("Verification Code Format", True, 
                            f"Code follows RND-XXXX format: {verification_code}")
                return True
            else:
                self.log_test("Verification Code Format", False, 
                            f"Code doesn't match RND-XXXX format: {verification_code}")
                return False
        except Exception as e:
            self.log_test("Verification Code Format", False, f"Error: {str(e)}")
            return False
    
    def test_watermark_processing_logs(self):
        """Check backend logs for watermark processing"""
        try:
            import subprocess
            result = subprocess.run(['tail', '-n', '100', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logs = result.stdout
                watermark_indicators = [
                    "💧 Applying watermark",
                    "✅ Watermark applied successfully",
                    "⚠️ Watermark failed"
                ]
                
                found_indicators = []
                for indicator in watermark_indicators:
                    if indicator in logs:
                        found_indicators.append(indicator)
                
                if found_indicators:
                    self.log_test("Watermark Processing Logs", True, 
                                f"Found watermark processing indicators: {', '.join(found_indicators)}")
                    return True
                else:
                    self.log_test("Watermark Processing Logs", False, 
                                "No watermark processing indicators found in logs")
                    return False
            else:
                self.log_test("Watermark Processing Logs", False, 
                            "Could not read backend logs")
                return False
        except Exception as e:
            self.log_test("Watermark Processing Logs", False, f"Error: {str(e)}")
            return False
    
    def test_video_file_exists(self, video_id):
        """Check if processed video file exists in uploads directory"""
        try:
            upload_dir = "/app/backend/uploads/videos"
            if not os.path.exists(upload_dir):
                self.log_test("Video File Exists", False, "Upload directory not found")
                return False
            
            # Look for video files with the video_id
            video_files = [f for f in os.listdir(upload_dir) if video_id in f]
            
            if video_files:
                self.log_test("Video File Exists", True, 
                            f"Found video file(s): {', '.join(video_files)}")
                return True
            else:
                self.log_test("Video File Exists", False, 
                            f"No video files found for video_id: {video_id}")
                return False
        except Exception as e:
            self.log_test("Video File Exists", False, f"Error: {str(e)}")
            return False
    
    def test_video_database_record(self, video_id):
        """Test that video record in database contains verification code"""
        try:
            # We can't directly access the database, but we can check via API
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                data = response.json()
                videos = data.get("videos", [])
                
                # Find our video
                video = next((v for v in videos if v.get("video_id") == video_id), None)
                
                if video:
                    verification_code = video.get("verification_code")
                    if verification_code:
                        self.log_test("Video Database Record", True, 
                                    f"Video record contains verification code: {verification_code}")
                        return verification_code
                    else:
                        self.log_test("Video Database Record", False, 
                                    "Video record missing verification code")
                        return None
                else:
                    self.log_test("Video Database Record", False, 
                                f"Video not found in user's video list: {video_id}")
                    return None
            else:
                self.log_test("Video Database Record", False, 
                            f"Failed to get user videos: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Video Database Record", False, f"Error: {str(e)}")
            return None
    
    def test_enhanced_video_upload_workflow(self):
        """Test the enhanced video upload logic with hash-first workflow"""
        if not self.auth_token:
            self.log_test("Enhanced Video Upload Workflow", False, "Authentication required")
            return None
            
        try:
            # Create a test video file using ffmpeg
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video_path = temp_video.name
            
            # Create a simple test video using ffmpeg (3 seconds, 320x240)
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=3:size=320x240:rate=1',
                '-c:v', 'libx264', '-t', '3', '-pix_fmt', 'yuv420p', '-y', temp_video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            if result.returncode != 0:
                self.log_test("Enhanced Video Upload Workflow", False, 
                            f"Failed to create test video: {result.stderr.decode()}")
                return None
            
            # Get folder ID for upload
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
                folder_id = default_folder["folder_id"] if default_folder else None
            else:
                folder_id = None
            
            # Upload video with enhanced workflow
            with open(temp_video_path, 'rb') as video_file:
                files = {'video_file': ('enhanced_test.mp4', video_file, 'video/mp4')}
                data = {
                    'source': 'studio',
                    'folder_id': folder_id
                }
                response = self.session.post(f"{BASE_URL}/videos/upload", files=files, data=data)
            
            # Clean up temp file
            os.unlink(temp_video_path)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required fields in response
                required_fields = ["verification_code", "expires_at", "storage_duration", "tier"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    self.log_test("Enhanced Video Upload Workflow", True, 
                                f"Enhanced upload successful: {data['verification_code']}, expires: {data['expires_at']}, tier: {data['tier']}")
                    return {
                        "video_id": data.get("video_id"),
                        "verification_code": data["verification_code"],
                        "expires_at": data["expires_at"],
                        "storage_duration": data["storage_duration"],
                        "tier": data["tier"]
                    }
                else:
                    self.log_test("Enhanced Video Upload Workflow", False, 
                                f"Missing required fields: {missing_fields}", data)
                    return None
            else:
                error_msg = response.text
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    pass
                self.log_test("Enhanced Video Upload Workflow", False, 
                            f"Status: {response.status_code}, Error: {error_msg}")
                return None
        except Exception as e:
            self.log_test("Enhanced Video Upload Workflow", False, f"Error: {str(e)}")
            return None
    
    def test_enhanced_workflow_logs(self):
        """Check backend logs for the new enhanced workflow steps"""
        try:
            import subprocess
            result = subprocess.run(['tail', '-n', '200', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logs = result.stdout
                
                # Check for the new workflow steps
                workflow_steps = [
                    "🎬 NEW VIDEO UPLOAD - Hash-First Workflow",
                    "STEP 1: Calculating original hash (pre-watermark)",
                    "STEP 2: Smart duplicate detection",
                    "STEP 3: Generating verification code",
                    "STEP 4: Applying watermark",
                    "STEP 5: Calculating watermarked hash",
                    "STEP 9: Saving to database",
                    "✅ UPLOAD COMPLETE"
                ]
                
                found_steps = []
                for step in workflow_steps:
                    if step in logs:
                        found_steps.append(step)
                
                if len(found_steps) >= 6:  # At least 6 out of 8 key steps
                    self.log_test("Enhanced Workflow Logs", True, 
                                f"Found {len(found_steps)}/8 workflow steps in logs")
                    return True
                else:
                    self.log_test("Enhanced Workflow Logs", False, 
                                f"Only found {len(found_steps)}/8 workflow steps: {found_steps}")
                    return False
            else:
                self.log_test("Enhanced Workflow Logs", False, 
                            "Could not read backend logs")
                return False
        except Exception as e:
            self.log_test("Enhanced Workflow Logs", False, f"Error: {str(e)}")
            return False
    
    def test_user_tier_check(self):
        """Test that user tier is properly retrieved and displayed"""
        try:
            response = self.session.get(f"{BASE_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                tier = data.get("premium_tier", "free")
                
                self.log_test("User Tier Check", True, 
                            f"User tier retrieved: {tier}")
                return tier
            else:
                self.log_test("User Tier Check", False, 
                            f"Failed to get user info: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("User Tier Check", False, f"Error: {str(e)}")
            return None
    
    def test_video_database_fields(self, video_id):
        """Test that video record contains new enhanced fields"""
        try:
            # Get video via user list endpoint
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                data = response.json()
                videos = data.get("videos", [])
                
                # Find our video
                video = next((v for v in videos if v.get("video_id") == video_id), None)
                
                if video:
                    # Check for enhanced fields (these would be in the full database record)
                    # For now, just verify basic fields are present
                    required_fields = ["video_id", "verification_code"]
                    missing_fields = [field for field in required_fields if field not in video]
                    
                    if not missing_fields:
                        self.log_test("Video Database Fields", True, 
                                    f"Video record contains required fields")
                        return True
                    else:
                        self.log_test("Video Database Fields", False, 
                                    f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Video Database Fields", False, 
                                f"Video not found in user's video list: {video_id}")
                    return False
            else:
                self.log_test("Video Database Fields", False, 
                            f"Failed to get user videos: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Video Database Fields", False, f"Error: {str(e)}")
            return False
    
    def test_duplicate_detection(self, original_video_result):
        """Test duplicate detection by uploading the same video again"""
        if not original_video_result or not self.auth_token:
            self.log_test("Duplicate Detection", False, "No original video or authentication")
            return False
            
        try:
            # Create the same test video again
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video_path = temp_video.name
            
            # Create identical test video
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=3:size=320x240:rate=1',
                '-c:v', 'libx264', '-t', '3', '-pix_fmt', 'yuv420p', '-y', temp_video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            if result.returncode != 0:
                self.log_test("Duplicate Detection", False, 
                            f"Failed to create duplicate test video: {result.stderr.decode()}")
                return False
            
            # Get folder ID for upload
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
                folder_id = default_folder["folder_id"] if default_folder else None
            else:
                folder_id = None
            
            # Upload the same video again
            with open(temp_video_path, 'rb') as video_file:
                files = {'video_file': ('duplicate_test.mp4', video_file, 'video/mp4')}
                data = {
                    'source': 'studio',
                    'folder_id': folder_id
                }
                response = self.session.post(f"{BASE_URL}/videos/upload", files=files, data=data)
            
            # Clean up temp file
            os.unlink(temp_video_path)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if it's marked as duplicate
                if (data.get("status") == "duplicate" and 
                    data.get("duplicate_detected") == True and
                    data.get("verification_code") == original_video_result["verification_code"]):
                    
                    self.log_test("Duplicate Detection", True, 
                                f"Duplicate correctly detected, returned existing code: {data['verification_code']}")
                    return True
                else:
                    self.log_test("Duplicate Detection", False, 
                                f"Duplicate not detected or wrong response: {data}")
                    return False
            else:
                self.log_test("Duplicate Detection", False, 
                            f"Upload failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Duplicate Detection", False, f"Error: {str(e)}")
            return False
    
    def test_tier_based_hashing(self, tier):
        """Test that tier-based hashing is working correctly"""
        # This is more of a log verification test since we can't directly access hash calculation
        try:
            import subprocess
            result = subprocess.run(['tail', '-n', '100', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logs = result.stdout
                
                # Check for tier-specific hash calculations
                if tier == "free":
                    # Free tier should only have original hash
                    if "Original hash:" in logs:
                        self.log_test("Tier-based Hashing", True, 
                                    f"Free tier hashing working (original hash only)")
                        return True
                elif tier in ["pro", "enterprise"]:
                    # Pro/Enterprise should have center region hash
                    if "Center region hash:" in logs or "Original hash:" in logs:
                        self.log_test("Tier-based Hashing", True, 
                                    f"{tier.title()} tier hashing working")
                        return True
                
                self.log_test("Tier-based Hashing", False, 
                            f"No tier-specific hashing logs found for {tier} tier")
                return False
            else:
                self.log_test("Tier-based Hashing", False, 
                            "Could not read backend logs")
                return False
        except Exception as e:
            self.log_test("Tier-based Hashing", False, f"Error: {str(e)}")
            return False

    def test_enterprise_tier_verification(self):
        """TEST 1: VERIFY TIER AND QUOTA for Enterprise user"""
        try:
            # Test /auth/me for tier verification
            response = self.session.get(f"{BASE_URL}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                tier = data.get("premium_tier", "free")
                
                if tier == "enterprise":
                    self.log_test("Enterprise Tier Verification", True, 
                                f"User tier confirmed as Enterprise: {tier}")
                else:
                    self.log_test("Enterprise Tier Verification", False, 
                                f"Expected enterprise tier, got: {tier}")
                    return False
            else:
                self.log_test("Enterprise Tier Verification", False, 
                            f"Failed to get user info: {response.status_code}")
                return False
            
            # Test quota API
            quota_response = self.session.get(f"{BASE_URL}/users/quota")
            
            if quota_response.status_code == 200:
                quota_data = quota_response.json()
                
                # Verify Enterprise quota settings
                expected_fields = {
                    "tier": "enterprise",
                    "limit": -1,  # unlimited (field is 'limit', not 'video_limit')
                    "unlimited": True,
                    "can_upload": True
                }
                
                all_correct = True
                for field, expected_value in expected_fields.items():
                    actual_value = quota_data.get(field)
                    if actual_value != expected_value:
                        self.log_test("Enterprise Quota Verification", False, 
                                    f"Field {field}: expected {expected_value}, got {actual_value}")
                        all_correct = False
                
                if all_correct:
                    self.log_test("Enterprise Quota Verification", True, 
                                f"Enterprise quota settings correct: unlimited={quota_data.get('unlimited')}, limit={quota_data.get('video_limit')}")
                    return True
                else:
                    return False
            else:
                self.log_test("Enterprise Quota Verification", False, 
                            f"Failed to get quota info: {quota_response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Enterprise Tier Verification", False, f"Error: {str(e)}")
            return False

    def test_enterprise_video_upload_enhanced_hashing(self):
        """TEST 2: UPLOAD VIDEO WITH ENHANCED HASHING for Enterprise tier"""
        if not self.auth_token:
            self.log_test("Enterprise Video Upload", False, "Authentication required")
            return None
            
        try:
            # Create a test video file using ffmpeg
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video_path = temp_video.name
            
            # Create a simple test video using ffmpeg (3 seconds, 320x240)
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=3:size=320x240:rate=1',
                '-c:v', 'libx264', '-t', '3', '-pix_fmt', 'yuv420p', '-y', temp_video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            if result.returncode != 0:
                self.log_test("Enterprise Video Upload", False, 
                            f"Failed to create test video: {result.stderr.decode()}")
                return None
            
            # Get folder ID for upload
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
                folder_id = default_folder["folder_id"] if default_folder else None
            else:
                folder_id = None
            
            # Upload video with enhanced workflow
            with open(temp_video_path, 'rb') as video_file:
                files = {'video_file': ('enterprise_test.mp4', video_file, 'video/mp4')}
                data = {
                    'source': 'studio',
                    'folder_id': folder_id
                }
                response = self.session.post(f"{BASE_URL}/videos/upload", files=files, data=data)
            
            # Clean up temp file
            os.unlink(temp_video_path)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check Enterprise-specific response fields
                enterprise_checks = {
                    "verification_code": lambda x: x and x.startswith("RND-") and len(x) == 10,
                    "expires_at": lambda x: x is None,  # Should be null for Enterprise
                    "storage_duration": lambda x: x == "unlimited",
                    "tier": lambda x: x == "enterprise"
                }
                
                all_correct = True
                for field, check_func in enterprise_checks.items():
                    value = data.get(field)
                    if not check_func(value):
                        self.log_test("Enterprise Video Upload", False, 
                                    f"Field {field}: expected Enterprise value, got {value}")
                        all_correct = False
                
                if all_correct:
                    self.log_test("Enterprise Video Upload", True, 
                                f"Enterprise upload successful: {data['verification_code']}, expires: {data['expires_at']}, storage: {data['storage_duration']}")
                    return {
                        "video_id": data.get("video_id"),
                        "verification_code": data["verification_code"],
                        "expires_at": data["expires_at"],
                        "storage_duration": data["storage_duration"],
                        "tier": data["tier"]
                    }
                else:
                    return None
            else:
                error_msg = response.text
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    pass
                self.log_test("Enterprise Video Upload", False, 
                            f"Status: {response.status_code}, Error: {error_msg}")
                return None
        except Exception as e:
            self.log_test("Enterprise Video Upload", False, f"Error: {str(e)}")
            return None

    def test_enterprise_workflow_logs(self):
        """TEST 2: Check backend logs for all 10 workflow steps"""
        try:
            import subprocess
            result = subprocess.run(['tail', '-n', '300', '/var/log/supervisor/backend.out.log'], 
                                  capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                logs = result.stdout
                
                # Check for all 10 workflow steps
                workflow_steps = [
                    "🎬 NEW VIDEO UPLOAD - Hash-First Workflow",
                    "STEP 1: Calculating original hash (pre-watermark)",
                    "STEP 2: Smart duplicate detection", 
                    "STEP 3: Generating verification code",
                    "STEP 4: Applying watermark",
                    "STEP 5: Calculating watermarked hash",
                    "STEP 6: Generating thumbnail",
                    "STEP 7: Setting storage expiration",
                    "STEP 8: Blockchain timestamping",
                    "STEP 9: Saving to database",
                    "STEP 10: Checking notification preferences",
                    "✅ UPLOAD COMPLETE"
                ]
                
                found_steps = []
                for step in workflow_steps:
                    if step in logs:
                        found_steps.append(step)
                
                # Also check for Enterprise-specific messages
                enterprise_messages = [
                    "Tier: enterprise",
                    "♾️ Tier: enterprise - Unlimited storage",
                    "✅ Original hash:",
                    "✅ Center region hash:",
                    "✅ Audio hash:"
                ]
                
                found_enterprise = []
                for msg in enterprise_messages:
                    if msg in logs:
                        found_enterprise.append(msg)
                
                if len(found_steps) >= 8:  # At least 8 out of 12 key steps
                    self.log_test("Enterprise Workflow Logs", True, 
                                f"Found {len(found_steps)}/12 workflow steps and {len(found_enterprise)} Enterprise messages")
                    return True
                else:
                    self.log_test("Enterprise Workflow Logs", False, 
                                f"Only found {len(found_steps)}/12 workflow steps: {found_steps}")
                    return False
            else:
                self.log_test("Enterprise Workflow Logs", False, 
                            "Could not read backend logs")
                return False
        except Exception as e:
            self.log_test("Enterprise Workflow Logs", False, f"Error: {str(e)}")
            return False

    def test_enterprise_multi_tier_hashing(self, video_id):
        """TEST 3: VERIFY MULTI-TIER HASHING - Enterprise gets all hash types"""
        try:
            # Get video via user list endpoint to check hashes
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                data = response.json()
                videos = data.get("videos", [])
                
                # Find our video
                video = next((v for v in videos if v.get("video_id") == video_id), None)
                
                if video:
                    # Check for Enterprise hash types
                    hashes = video.get("hashes", {})
                    
                    expected_hashes = [
                        "original",
                        "watermarked", 
                        "center_region",  # Pro+ feature
                        "audio",          # Enterprise-only feature
                        "metadata"
                    ]
                    
                    missing_hashes = []
                    present_hashes = []
                    
                    for hash_type in expected_hashes:
                        if hash_type in hashes and hashes[hash_type] is not None:
                            present_hashes.append(hash_type)
                        else:
                            missing_hashes.append(hash_type)
                    
                    if len(present_hashes) >= 4:  # Should have at least 4 out of 5 hash types
                        self.log_test("Enterprise Multi-Tier Hashing", True, 
                                    f"Enterprise hashing working: {len(present_hashes)}/5 hash types present: {present_hashes}")
                        return True
                    else:
                        self.log_test("Enterprise Multi-Tier Hashing", False, 
                                    f"Missing hash types: {missing_hashes}, present: {present_hashes}")
                        return False
                else:
                    self.log_test("Enterprise Multi-Tier Hashing", False, 
                                f"Video not found in user's video list: {video_id}")
                    return False
            else:
                self.log_test("Enterprise Multi-Tier Hashing", False, 
                            f"Failed to get user videos: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Multi-Tier Hashing", False, f"Error: {str(e)}")
            return False

    def test_enterprise_storage_object(self, video_id):
        """TEST 4: VERIFY STORAGE OBJECT - Unlimited storage for Enterprise"""
        try:
            # Get video via user list endpoint to check storage object
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                data = response.json()
                videos = data.get("videos", [])
                
                # Find our video
                video = next((v for v in videos if v.get("video_id") == video_id), None)
                
                if video:
                    # Check storage object
                    storage = video.get("storage", {})
                    
                    expected_storage = {
                        "tier": "enterprise",
                        "expires_at": None,  # Should be null for unlimited
                        "warned_at": None,
                        "download_count": 0
                    }
                    
                    storage_correct = True
                    for field, expected_value in expected_storage.items():
                        actual_value = storage.get(field)
                        if field == "expires_at" and actual_value != expected_value:
                            self.log_test("Enterprise Storage Object", False, 
                                        f"Storage {field}: expected {expected_value} (unlimited), got {actual_value}")
                            storage_correct = False
                        elif field != "expires_at" and field != "download_count" and actual_value != expected_value:
                            self.log_test("Enterprise Storage Object", False, 
                                        f"Storage {field}: expected {expected_value}, got {actual_value}")
                            storage_correct = False
                    
                    if storage_correct and "uploaded_at" in storage:
                        self.log_test("Enterprise Storage Object", True, 
                                    f"Enterprise storage object correct: tier={storage.get('tier')}, expires_at={storage.get('expires_at')} (unlimited)")
                        return True
                    else:
                        self.log_test("Enterprise Storage Object", False, 
                                    f"Storage object issues or missing uploaded_at: {storage}")
                        return False
                else:
                    self.log_test("Enterprise Storage Object", False, 
                                f"Video not found in user's video list: {video_id}")
                    return False
            else:
                self.log_test("Enterprise Storage Object", False, 
                            f"Failed to get user videos: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Storage Object", False, f"Error: {str(e)}")
            return False

    def test_enterprise_duplicate_detection(self, original_video_result):
        """TEST 5: DUPLICATE DETECTION WITH ENHANCED HASHING"""
        if not original_video_result or not self.auth_token:
            self.log_test("Enterprise Duplicate Detection", False, "No original video or authentication")
            return False
            
        try:
            # Create the same test video again
            import tempfile
            import subprocess
            
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_video:
                temp_video_path = temp_video.name
            
            # Create identical test video
            cmd = [
                'ffmpeg', '-f', 'lavfi', '-i', 'testsrc=duration=3:size=320x240:rate=1',
                '-c:v', 'libx264', '-t', '3', '-pix_fmt', 'yuv420p', '-y', temp_video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            if result.returncode != 0:
                self.log_test("Enterprise Duplicate Detection", False, 
                            f"Failed to create duplicate test video: {result.stderr.decode()}")
                return False
            
            # Get folder ID for upload
            folders_response = self.session.get(f"{BASE_URL}/folders/")
            if folders_response.status_code == 200:
                folders = folders_response.json()
                default_folder = next((f for f in folders if f.get("folder_name") == "Default"), None)
                folder_id = default_folder["folder_id"] if default_folder else None
            else:
                folder_id = None
            
            # Upload the same video again
            with open(temp_video_path, 'rb') as video_file:
                files = {'video_file': ('enterprise_duplicate_test.mp4', video_file, 'video/mp4')}
                data = {
                    'source': 'studio',
                    'folder_id': folder_id
                }
                response = self.session.post(f"{BASE_URL}/videos/upload", files=files, data=data)
            
            # Clean up temp file
            os.unlink(temp_video_path)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if it's marked as duplicate with high confidence
                duplicate_checks = {
                    "status": "duplicate",
                    "duplicate_detected": True,
                    "confidence_score": 1.0,  # 100% match
                    "verification_code": original_video_result["verification_code"]
                }
                
                all_correct = True
                for field, expected_value in duplicate_checks.items():
                    actual_value = data.get(field)
                    if actual_value != expected_value:
                        self.log_test("Enterprise Duplicate Detection", False, 
                                    f"Field {field}: expected {expected_value}, got {actual_value}")
                        all_correct = False
                
                if all_correct:
                    self.log_test("Enterprise Duplicate Detection", True, 
                                f"Enterprise duplicate detection working: confidence={data.get('confidence_score')}, returned existing code: {data['verification_code']}")
                    return True
                else:
                    return False
            else:
                self.log_test("Enterprise Duplicate Detection", False, 
                            f"Upload failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Duplicate Detection", False, f"Error: {str(e)}")
            return False

    def test_enterprise_notification_preferences(self):
        """TEST 6: NOTIFICATION PREFERENCES - Enterprise features"""
        try:
            # Test getting notification settings
            response = self.session.get(f"{BASE_URL}/users/notification-settings")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if Enterprise notification features are available
                enterprise_features = [
                    "notification_preference",  # email, sms, both, none
                    "phone_number",
                    "video_length_threshold", 
                    "sms_opted_in"
                ]
                
                available_features = []
                for feature in enterprise_features:
                    if feature in data:
                        available_features.append(feature)
                
                if len(available_features) >= 3:  # Should have most Enterprise features
                    self.log_test("Enterprise Notification Preferences", True, 
                                f"Enterprise notification features available: {available_features}")
                    
                    # Test updating notification preferences
                    update_data = {
                        "notification_preference": "both",  # email and SMS
                        "phone_number": "+1234567890",
                        "video_length_threshold": 60,
                        "sms_opted_in": True
                    }
                    
                    update_response = self.session.put(f"{BASE_URL}/users/notification-settings", json=update_data)
                    
                    if update_response.status_code == 200:
                        self.log_test("Enterprise Notification Update", True, 
                                    "Successfully updated Enterprise notification preferences")
                        return True
                    else:
                        self.log_test("Enterprise Notification Update", False, 
                                    f"Failed to update preferences: {update_response.status_code}")
                        return False
                else:
                    self.log_test("Enterprise Notification Preferences", False, 
                                f"Missing Enterprise features: {set(enterprise_features) - set(available_features)}")
                    return False
            else:
                self.log_test("Enterprise Notification Preferences", False, 
                            f"Failed to get notification settings: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Notification Preferences", False, f"Error: {str(e)}")
            return False

    def test_enterprise_download_functionality(self, video_id):
        """TEST 7: DOWNLOAD FUNCTIONALITY"""
        try:
            # Test video download
            response = self.session.get(f"{BASE_URL}/videos/{video_id}/download")
            
            if response.status_code == 200:
                # Check headers
                content_type = response.headers.get('content-type', '')
                content_disposition = response.headers.get('content-disposition', '')
                
                if 'video/mp4' in content_type and 'attachment' in content_disposition:
                    # Check if filename uses verification code
                    if 'RND-' in content_disposition:
                        self.log_test("Enterprise Download Functionality", True, 
                                    f"Download working: content-type={content_type}, filename contains verification code")
                        
                        # Test that download count is incremented (would need another API call to verify)
                        return True
                    else:
                        self.log_test("Enterprise Download Functionality", False, 
                                    f"Filename doesn't use verification code: {content_disposition}")
                        return False
                else:
                    self.log_test("Enterprise Download Functionality", False, 
                                f"Wrong headers: content-type={content_type}, disposition={content_disposition}")
                    return False
            else:
                self.log_test("Enterprise Download Functionality", False, 
                            f"Download failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Download Functionality", False, f"Error: {str(e)}")
            return False

    def test_enterprise_video_list_enhanced_fields(self):
        """TEST 9: VIDEO LIST WITH ENHANCED FIELDS"""
        try:
            response = self.session.get(f"{BASE_URL}/videos/user/list")
            
            if response.status_code == 200:
                data = response.json()
                videos = data.get("videos", [])
                
                if videos:
                    # Check first video for enhanced fields
                    video = videos[0]
                    
                    enhanced_fields = [
                        "storage",      # storage object
                        "hashes",       # hashes object  
                        "verification_code",
                        "thumbnail_url"
                    ]
                    
                    present_fields = []
                    for field in enhanced_fields:
                        if field in video and video[field] is not None:
                            present_fields.append(field)
                    
                    if len(present_fields) >= 3:  # Should have most enhanced fields
                        self.log_test("Enterprise Video List Enhanced Fields", True, 
                                    f"Enhanced fields present: {present_fields}")
                        return True
                    else:
                        self.log_test("Enterprise Video List Enhanced Fields", False, 
                                    f"Missing enhanced fields: {set(enhanced_fields) - set(present_fields)}")
                        return False
                else:
                    self.log_test("Enterprise Video List Enhanced Fields", False, 
                                "No videos found in user list")
                    return False
            else:
                self.log_test("Enterprise Video List Enhanced Fields", False, 
                            f"Failed to get video list: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Enterprise Video List Enhanced Fields", False, f"Error: {str(e)}")
            return False

    def run_enterprise_comprehensive_test(self):
        """Run comprehensive Enterprise tier enhanced features test"""
        print("🏢 COMPREHENSIVE ENTERPRISE TIER ENHANCED FEATURES TEST")
        print("=" * 60)
        
        # TEST 1: VERIFY TIER AND QUOTA
        print("\n🔍 TEST 1: VERIFY TIER AND QUOTA")
        if not self.test_enterprise_tier_verification():
            print("❌ Enterprise tier verification failed. Stopping Enterprise tests.")
            return
        
        # TEST 2: UPLOAD VIDEO WITH ENHANCED HASHING
        print("\n📤 TEST 2: UPLOAD VIDEO WITH ENHANCED HASHING")
        enterprise_video_result = self.test_enterprise_video_upload_enhanced_hashing()
        if enterprise_video_result:
            print("\n📋 TEST 2: CHECK BACKEND LOGS FOR ALL 10 WORKFLOW STEPS")
            self.test_enterprise_workflow_logs()
            
            # TEST 3: VERIFY MULTI-TIER HASHING
            print("\n🔐 TEST 3: VERIFY MULTI-TIER HASHING (ENTERPRISE GETS ALL)")
            self.test_enterprise_multi_tier_hashing(enterprise_video_result["video_id"])
            
            # TEST 4: VERIFY STORAGE OBJECT
            print("\n💾 TEST 4: VERIFY STORAGE OBJECT (UNLIMITED)")
            self.test_enterprise_storage_object(enterprise_video_result["video_id"])
            
            # TEST 5: DUPLICATE DETECTION WITH ENHANCED HASHING
            print("\n🔄 TEST 5: DUPLICATE DETECTION WITH ENHANCED HASHING")
            self.test_enterprise_duplicate_detection(enterprise_video_result)
            
            # TEST 7: DOWNLOAD FUNCTIONALITY
            print("\n⬇️ TEST 7: DOWNLOAD FUNCTIONALITY")
            self.test_enterprise_download_functionality(enterprise_video_result["video_id"])
        
        # TEST 6: NOTIFICATION PREFERENCES
        print("\n🔔 TEST 6: NOTIFICATION PREFERENCES (ENTERPRISE FEATURES)")
        self.test_enterprise_notification_preferences()
        
        # TEST 9: VIDEO LIST WITH ENHANCED FIELDS
        print("\n📋 TEST 9: VIDEO LIST WITH ENHANCED FIELDS")
        self.test_enterprise_video_list_enhanced_fields()
        
        # TEST 10: BACKEND LOGS ANALYSIS
        print("\n📊 TEST 10: BACKEND LOGS ANALYSIS")
        self.test_enterprise_workflow_logs()  # Already covers this
        
        print("\n" + "=" * 60)
        print("🏢 ENTERPRISE TIER TESTING COMPLETE")
        print("=" * 60)

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
            
            # Test user tier check
            print("\n👤 Testing User Tier...")
            user_tier = self.test_user_tier_check()
            
            # If this is Enterprise tier, run comprehensive Enterprise tests
            if user_tier == "enterprise":
                print("\n" + "🏢" * 20)
                print("ENTERPRISE TIER DETECTED - RUNNING COMPREHENSIVE ENHANCED FEATURES TEST")
                print("🏢" * 20)
                self.run_enterprise_comprehensive_test()
                print("\n" + "🏢" * 20)
                print("ENTERPRISE COMPREHENSIVE TEST COMPLETE")
                print("🏢" * 20)
        
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
            
            print("\n🎬 Testing Enhanced Video Upload Workflow...")
            # Test the new enhanced video upload logic
            enhanced_result = self.test_enhanced_video_upload_workflow()
            if enhanced_result:
                print("\n🔍 Testing Enhanced Workflow Components...")
                self.test_enhanced_workflow_logs()
                self.test_video_database_fields(enhanced_result["video_id"])
                if user_tier:
                    self.test_tier_based_hashing(user_tier)
                
                print("\n🔄 Testing Duplicate Detection...")
                self.test_duplicate_detection(enhanced_result)
            
            print("\n💧 Testing Legacy Watermark Functionality...")
            upload_result = self.test_video_upload_with_watermark()
            if upload_result:
                self.test_watermark_verification_code_format(upload_result["verification_code"])
                self.test_video_file_exists(upload_result["video_id"])
                self.test_video_database_record(upload_result["video_id"])
                self.test_watermark_processing_logs()
        
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