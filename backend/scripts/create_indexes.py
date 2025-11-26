"""
Script to create MongoDB indexes for performance optimization
Run this script once to set up indexes for the Rendr platform
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "rendr"


async def create_indexes():
    """Create all necessary MongoDB indexes"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Creating MongoDB indexes for Rendr...")
    
    # Users collection indexes
    print("\n📁 Users collection:")
    
    # Index for fast username searching (Explore page)
    await db.users.create_index("username")
    print("  ✓ Created index on 'username'")
    
    # Index for filtering by premium tier (Explore page)
    await db.users.create_index("premium_tier")
    print("  ✓ Created index on 'premium_tier'")
    
    # Index for public showcase filtering
    await db.users.create_index("showcase_settings.isPublic")
    print("  ✓ Created index on 'showcase_settings.isPublic'")
    
    # Index for featured creators
    await db.users.create_index("featured")
    print("  ✓ Created index on 'featured'")
    
    # Index for trending creators
    await db.users.create_index("trending")
    print("  ✓ Created index on 'trending'")
    
    # Index for categories
    await db.users.create_index("categories")
    print("  ✓ Created index on 'categories'")
    
    # Index for tags
    await db.users.create_index("tags")
    print("  ✓ Created index on 'tags'")
    
    # Index for last active (recently active filter)
    await db.users.create_index("last_active_at")
    print("  ✓ Created index on 'last_active_at'")
    
    # Compound index for email + username lookup
    await db.users.create_index([("email", 1), ("username", 1)])
    print("  ✓ Created compound index on 'email' + 'username'")
    
    # Videos collection indexes
    print("\n📁 Videos collection:")
    
    # Index for user's videos
    await db.videos.create_index("user_id")
    print("  ✓ Created index on 'user_id'")
    
    # Index for video visibility (public/private)
    await db.videos.create_index("visibility")
    print("  ✓ Created index on 'visibility'")
    
    # Compound index for user + visibility (used in Explore aggregation)
    await db.videos.create_index([("user_id", 1), ("visibility", 1)])
    print("  ✓ Created compound index on 'user_id' + 'visibility'")
    
    # Index for created_at (for trending/recent videos)
    await db.videos.create_index("created_at")
    print("  ✓ Created index on 'created_at'")
    
    # Index for folder_id (for folder videos)
    await db.videos.create_index("folder_id")
    print("  ✓ Created index on 'folder_id'")
    
    # Subscriptions collection indexes (when it's created)
    print("\n📁 Subscriptions collection:")
    
    # Index for creator's subscriptions
    await db.subscriptions.create_index("creator_id")
    print("  ✓ Created index on 'creator_id'")
    
    # Index for subscriber's subscriptions
    await db.subscriptions.create_index("subscriber_id")
    print("  ✓ Created index on 'subscriber_id'")
    
    # Index for subscription status
    await db.subscriptions.create_index("status")
    print("  ✓ Created index on 'status'")
    
    # Compound index for creator + status (used in Explore)
    await db.subscriptions.create_index([("creator_id", 1), ("status", 1)])
    print("  ✓ Created compound index on 'creator_id' + 'status'")
    
    # Index for created_at (for trending subscribers)
    await db.subscriptions.create_index("created_at")
    print("  ✓ Created index on 'created_at'")
    
    # Premium Folders collection indexes
    print("\n📁 Premium Folders collection:")
    
    # Index for creator's folders
    await db.premium_folders.create_index("creator_id")
    print("  ✓ Created index on 'creator_id'")
    
    # Index for folder visibility
    await db.premium_folders.create_index("visibility")
    print("  ✓ Created index on 'visibility'")
    
    # Folders collection indexes
    print("\n📁 Folders collection:")
    
    # Index for user's folders
    await db.folders.create_index("user_id")
    print("  ✓ Created index on 'user_id'")
    
    # Verification codes collection
    print("\n📁 Verification collection:")
    
    # Index for verification code lookup
    await db.verification.create_index("verification_code", unique=True)
    print("  ✓ Created unique index on 'verification_code'")
    
    print("\n✅ All indexes created successfully!")
    print("\nTo view all indexes:")
    print("  db.users.getIndexes()")
    print("  db.videos.getIndexes()")
    print("  db.subscriptions.getIndexes()")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(create_indexes())
