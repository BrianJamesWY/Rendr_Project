#!/usr/bin/env python3
"""
Detailed verification tests for specific review requirements
"""

import requests
import json

BASE_URL = "https://premium-content-46.preview.emergentagent.com/api"
CREDENTIALS = {"username": "BrianJames", "password": "Brian123!"}

def get_auth_token():
    """Get authentication token"""
    response = requests.post(f"{BASE_URL}/auth/login", json=CREDENTIALS)
    if response.status_code == 200:
        return response.json()["token"]
    return None

def test_detailed_verification():
    """Test detailed verification requirements from review"""
    token = get_auth_token()
    if not token:
        print("❌ Could not authenticate")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🔍 DETAILED VERIFICATION TESTS")
    print("=" * 50)
    
    # 1. Test video structure with all required fields
    print("\n1. VIDEO STRUCTURE VERIFICATION")
    response = requests.get(f"{BASE_URL}/videos/user/list", headers=headers)
    if response.status_code == 200:
        videos = response.json()
        print(f"✅ Retrieved {len(videos)} videos")
        
        if videos:
            # Check verified videos
            verified_videos = [v for v in videos if v.get("verification_status") == "verified"]
            print(f"✅ Found {len(verified_videos)} verified videos")
            
            if verified_videos:
                sample = verified_videos[0]
                print(f"✅ Sample video ID: {sample['video_id']}")
                print(f"✅ Verification code: {sample['verification_code']}")
                
                # Check hashes structure
                if sample.get("hashes"):
                    hashes = sample["hashes"]
                    print(f"✅ Hash types: {list(hashes.keys())}")
                    print(f"✅ Original hash: {hashes.get('original', 'N/A')[:16]}...")
                    print(f"✅ Watermarked hash: {hashes.get('watermarked', 'N/A')[:16]}...")
                    print(f"✅ Center region hash: {hashes.get('center_region', 'N/A')[:16]}...")
                    print(f"✅ Audio hash: {hashes.get('audio', 'N/A')}")
                    print(f"✅ Metadata hash: {hashes.get('metadata', 'N/A')[:16]}...")
                
                # Check storage structure
                if sample.get("storage"):
                    storage = sample["storage"]
                    print(f"✅ Storage tier: {storage.get('tier')}")
                    print(f"✅ Expires at: {storage.get('expires_at')}")
                    print(f"✅ Download count: {storage.get('download_count')}")
    
    # 2. Test CEO endpoints with detailed data
    print("\n2. CEO ENDPOINTS DETAILED VERIFICATION")
    
    # CEO Stats
    response = requests.get(f"{BASE_URL}/ceo-access-b7k9m2x/stats", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ CEO Stats: {json.dumps(stats, indent=2)}")
    else:
        print(f"❌ CEO Stats failed: {response.status_code}")
    
    # CEO Users
    response = requests.get(f"{BASE_URL}/ceo-access-b7k9m2x/users", headers=headers)
    if response.status_code == 200:
        users = response.json()
        print(f"✅ CEO Users count: {len(users)}")
        if users:
            sample_user = users[0]
            print(f"✅ Sample user fields: {list(sample_user.keys())}")
    else:
        print(f"❌ CEO Users failed: {response.status_code}")
    
    # CEO Analytics
    response = requests.get(f"{BASE_URL}/ceo-access-b7k9m2x/analytics", headers=headers)
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ CEO Analytics: {json.dumps(analytics, indent=2)}")
    else:
        print(f"❌ CEO Analytics failed: {response.status_code}")
    
    # 3. Test verification endpoint
    print("\n3. VERIFICATION ENDPOINT TEST")
    response = requests.post(f"{BASE_URL}/verify/code", json={"verification_code": "RND-NONEXISTENT"})
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Verification endpoint response: {json.dumps(result, indent=2)}")
    else:
        print(f"❌ Verification endpoint failed: {response.status_code}")
    
    # 4. Test analytics dashboard
    print("\n4. ANALYTICS DASHBOARD TEST")
    response = requests.get(f"{BASE_URL}/analytics/dashboard?days=30", headers=headers)
    if response.status_code == 200:
        analytics = response.json()
        print(f"✅ Analytics Dashboard: {json.dumps(analytics, indent=2)}")
    else:
        print(f"❌ Analytics Dashboard failed: {response.status_code}")
    
    # 5. Test expired video cleanup system (check if endpoint exists)
    print("\n5. SYSTEM ENDPOINTS CHECK")
    
    # Check if there's a cleanup endpoint or similar
    endpoints_to_check = [
        "/videos/cleanup",
        "/admin/cleanup", 
        "/system/cleanup"
    ]
    
    for endpoint in endpoints_to_check:
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        if response.status_code != 404:
            print(f"✅ Found system endpoint: {endpoint} (status: {response.status_code})")
        else:
            print(f"⚪ Endpoint not found: {endpoint}")
    
    # 6. Test blockchain signature verification
    print("\n6. BLOCKCHAIN VERIFICATION CHECK")
    if videos:
        blockchain_videos = [v for v in videos if v.get("has_blockchain")]
        print(f"✅ Videos with blockchain: {len(blockchain_videos)}")
        
        if blockchain_videos:
            sample = blockchain_videos[0]
            print(f"✅ Blockchain video: {sample['video_id']}")
        else:
            print("⚪ No blockchain-verified videos found")

if __name__ == "__main__":
    test_detailed_verification()