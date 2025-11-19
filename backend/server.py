from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api import auth, videos, verification, blockchain, notifications, users, folders, admin, analytics, showcase_folders
from database.mongodb import connect_db, close_db

app = FastAPI(
    title="Rendr API",
    description="Video verification platform",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database lifecycle
@app.on_event("startup")
async def startup():
    await connect_db()
    print("🚀 Rendr API started")

@app.on_event("shutdown")
async def shutdown():
    await close_db()

# Create uploads directories
os.makedirs("uploads/videos", exist_ok=True)
os.makedirs("uploads/temp", exist_ok=True)
os.makedirs("uploads/thumbnails", exist_ok=True)
os.makedirs("uploads/profile_pictures", exist_ok=True)
os.makedirs("uploads/banners", exist_ok=True)

# Serve static files (thumbnails, profile pictures, banners)
app.mount("/api/thumbnails", StaticFiles(directory="uploads/thumbnails"), name="thumbnails")
app.mount("/api/profile_pictures", StaticFiles(directory="uploads/profile_pictures"), name="profile_pictures")
app.mount("/api/banners", StaticFiles(directory="uploads/banners"), name="banners")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(verification.router, prefix="/api/verify", tags=["Verification"])
app.include_router(blockchain.router, prefix="/api/blockchain", tags=["Blockchain"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(folders.router, prefix="/api/folders", tags=["Folders"])
app.include_router(showcase_folders.router, tags=["Showcase Folders"])
app.include_router(users.router, prefix="/api/@", tags=["Users"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "Rendr API",
        "version": "0.1.0",
        "status": "online"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy"}