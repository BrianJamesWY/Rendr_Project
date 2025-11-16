from motor.motor_asyncio import AsyncIOMotorClient
import os

client = None
db = None

async def connect_db():
    global client, db
    mongodb_url = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongodb_url)
    db = client.rendr_db
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.videos.create_index("verification_code", unique=True)
    await db.videos.create_index("user_id")
    
    print("✅ MongoDB connected and indexes created")
    return db

async def close_db():
    global client
    if client:
        client.close()
        print("👋 MongoDB connection closed")

def get_db():
    return db
