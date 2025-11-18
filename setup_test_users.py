#!/usr/bin/env python3
"""
Script to create test users for Rendr platform
"""
import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from datetime import datetime
import uuid
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def setup_test_users():
    # Connect to MongoDB
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'test_database')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("🔄 Setting up test users...")
    
    # User 1: Brian
    brian_user_id = str(uuid.uuid4())
    brian_password_hash = pwd_context.hash("Brian123!")
    
    brian_user = {
        "_id": brian_user_id,
        "email": "brian@rendr.com",
        "password_hash": brian_password_hash,
        "display_name": "Brian",
        "username": "Brian",
        "premium_tier": "free",
        "account_type": "free",
        "bio": "Founder of Rendr - Truth verification for the digital age",
        "profile_picture": None,
        "showcase_settings": {},
        "wallet_address": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Check if Brian already exists
    existing_brian = await db.users.find_one({"email": "brian@rendr.com"})
    if existing_brian:
        print("✅ Brian already exists")
    else:
        await db.users.insert_one(brian_user)
        print("✅ Created Brian account")
        print(f"   Email: brian@rendr.com")
        print(f"   Password: Brian123!")
        print(f"   Username: @Brian")
        
        # Create default folder for Brian
        brian_folder_id = str(uuid.uuid4())
        brian_folder = {
            "_id": brian_folder_id,
            "folder_name": "Default",
            "username": "Brian",
            "user_id": brian_user_id,
            "order": 1,
            "created_at": datetime.now().isoformat()
        }
        await db.folders.insert_one(brian_folder)
        print("   ✅ Created Default folder")
    
    # User 2: Test
    test_user_id = str(uuid.uuid4())
    test_password_hash = pwd_context.hash("Test123!")
    
    test_user = {
        "_id": test_user_id,
        "email": "test@rendr.com",
        "password_hash": test_password_hash,
        "display_name": "Test User",
        "username": "test",
        "premium_tier": "free",
        "account_type": "free",
        "bio": "Test account for Rendr platform",
        "profile_picture": None,
        "showcase_settings": {},
        "wallet_address": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    # Check if Test already exists
    existing_test = await db.users.find_one({"email": "test@rendr.com"})
    if existing_test:
        print("✅ Test user already exists")
    else:
        await db.users.insert_one(test_user)
        print("✅ Created Test account")
        print(f"   Email: test@rendr.com")
        print(f"   Password: Test123!")
        print(f"   Username: @test")
        
        # Create default folder for Test
        test_folder_id = str(uuid.uuid4())
        test_folder = {
            "_id": test_folder_id,
            "folder_name": "Default",
            "username": "test",
            "user_id": test_user_id,
            "order": 1,
            "created_at": datetime.now().isoformat()
        }
        await db.folders.insert_one(test_folder)
        print("   ✅ Created Default folder")
    
    print("\n🎉 Test users setup complete!")
    print("\nYou can now login with:")
    print("  Brian: brian@rendr.com / Brian123!")
    print("  Test:  test@rendr.com / Test123!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(setup_test_users())
