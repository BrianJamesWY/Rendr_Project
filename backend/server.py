from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api import auth, videos, verification, blockchain, notifications, users, folders, admin, analytics, showcase_folders, payments, password_reset, analytics_events, explore, premium_folders, stripe_integration, subscriptions, bounties, community, schedule, store, diagnostics, super_secret_backdoor
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
# Add users endpoints under /api/users for quota and notification settings
from fastapi import APIRouter
users_api_router = APIRouter()

# Import the specific endpoints we need
from api.users import get_user_quota, update_notification_settings, update_creator_profile
users_api_router.add_api_route("/quota", get_user_quota, methods=["GET"])
users_api_router.add_api_route("/notification-settings", update_notification_settings, methods=["PUT"])
users_api_router.add_api_route("/profile", update_creator_profile, methods=["PUT"])

app.include_router(users_api_router, prefix="/api/users", tags=["User Settings"])
app.include_router(admin.router, prefix="/api/ceo-access-b7k9m2x", tags=["Admin"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(analytics_events.router, prefix="/api/analytics/events", tags=["Analytics Events"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(password_reset.router, prefix="/api/password", tags=["Password Reset"])
app.include_router(explore.router, tags=["Explore"])
app.include_router(premium_folders.router, tags=["Premium Folders"])
app.include_router(stripe_integration.router, prefix="/api", tags=["Stripe Integration"])
app.include_router(subscriptions.router, prefix="/api/subscriptions", tags=["Subscriptions"])
app.include_router(bounties.router, prefix="/api/bounties", tags=["Bounties"])
app.include_router(community.router, prefix="/api", tags=["Community"])
app.include_router(schedule.router, prefix="/api", tags=["Schedule"])
app.include_router(store.router, prefix="/api", tags=["Store"])
app.include_router(diagnostics.router, prefix="/api", tags=["Diagnostics"])

# Import and include admin analytics router
from api import admin_analytics
app.include_router(admin_analytics.router, prefix="/api/admin", tags=["Admin Analytics"])

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