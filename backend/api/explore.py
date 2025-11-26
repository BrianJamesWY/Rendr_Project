from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from pydantic import BaseModel
from database.mongodb import get_db
from datetime import datetime, timedelta

router = APIRouter()


class CreatorCard(BaseModel):
    """Creator card data for explore page"""
    id: str
    username: str
    displayName: str
    bio: Optional[str] = None
    profileImage: Optional[str] = None
    videoCount: int
    subscribers: int
    tier: str
    featured: bool = False
    trending: bool = False
    categories: List[str] = []
    tags: List[str] = []
    joinedDaysAgo: int
    lastActiveAt: Optional[str] = None


class ExploreResponse(BaseModel):
    creators: List[CreatorCard]
    total: int
    page: int
    pageSize: int


@router.get("/api/explore/creators", response_model=ExploreResponse)
async def get_creators(
    tier: Optional[str] = Query("all", description="Filter by tier: all, premium, pro, enterprise"),
    sort: Optional[str] = Query("popular", description="Sort by: popular, recent, subscribers, videos, active"),
    search: Optional[str] = Query(None, description="Search by username or display name"),
    category: Optional[str] = Query(None, description="Filter by category"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    featured: Optional[bool] = Query(None, description="Show only featured creators"),
    trending: Optional[bool] = Query(None, description="Show only trending creators"),
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(48, ge=1, le=100, description="Items per page"),
    db = Depends(get_db)
):
    """
    Get list of creators for explore page.
    Only returns creators with public showcases.
    Does not expose sensitive data.
    """
    
    # Build match stage for aggregation pipeline
    match_stage = {
        "showcase_settings.isPublic": True  # Only public showcases
    }
    
    # Filter by tier (only for premium/pro/enterprise)
    if tier != "all":
        tier_map = {
            "premium": {"$in": ["pro", "enterprise"]},  # Anyone with premium capabilities
            "pro": "pro",
            "enterprise": "enterprise"
        }
        if tier in tier_map:
            match_stage["premium_tier"] = tier_map[tier]
    
    # Search filter
    if search:
        match_stage["$or"] = [
            {"username": {"$regex": search, "$options": "i"}},
            {"display_name": {"$regex": search, "$options": "i"}}
        ]
    
    # Category filter
    if category:
        match_stage["categories"] = category
    
    # Tag filter
    if tag:
        match_stage["tags"] = tag
    
    # Featured/Trending filters
    if featured is not None:
        match_stage["featured"] = featured
    if trending is not None:
        match_stage["trending"] = trending
    
    # Aggregation pipeline
    pipeline = [
        {"$match": match_stage},
        
        # Lookup public video count
        {
            "$lookup": {
                "from": "videos",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$user_id", "$$user_id"]},
                                    {"$eq": ["$visibility", "public"]}  # Only public videos
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "video_stats"
            }
        },
        
        # Lookup subscriber count (from premium folder subscriptions)
        {
            "$lookup": {
                "from": "subscriptions",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$creator_id", "$$user_id"]},
                                    {"$eq": ["$status", "active"]}
                                ]
                            }
                        }
                    },
                    {
                        "$group": {
                            "_id": "$subscriber_id"  # Distinct subscribers
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "subscriber_stats"
            }
        },
        
        # Project fields
        {
            "$project": {
                "_id": 0,
                "id": "$user_id",
                "username": 1,
                "displayName": "$display_name",
                "bio": 1,
                "profileImage": "$profile_picture",
                "videoCount": {
                    "$ifNull": [
                        {"$arrayElemAt": ["$video_stats.count", 0]},
                        0
                    ]
                },
                "subscribers": {
                    "$ifNull": [
                        {"$arrayElemAt": ["$subscriber_stats.count", 0]},
                        0
                    ]
                },
                "tier": "$premium_tier",
                "featured": {"$ifNull": ["$featured", False]},
                "trending": {"$ifNull": ["$trending", False]},
                "categories": {"$ifNull": ["$categories", []]},
                "tags": {"$ifNull": ["$tags", []]},
                "joinedDaysAgo": {
                    "$dateDiff": {
                        "startDate": "$created_at",
                        "endDate": "$$NOW",
                        "unit": "day"
                    }
                },
                "lastActiveAt": "$last_active_at"
            }
        }
    ]
    
    # Add sort stage
    sort_map = {
        "popular": {"subscribers": -1, "videoCount": -1},  # Most subscribers, then most videos
        "recent": {"joinedDaysAgo": 1},  # Recently joined
        "subscribers": {"subscribers": -1},
        "videos": {"videoCount": -1},
        "active": {"lastActiveAt": -1}  # Recently active
    }
    
    if sort in sort_map:
        pipeline.append({"$sort": sort_map[sort]})
    
    # Get total count
    count_pipeline = pipeline + [{"$count": "total"}]
    count_result = await db.users.aggregate(count_pipeline).to_list(1)
    total = count_result[0]["total"] if count_result else 0
    
    # Add pagination
    skip = (page - 1) * pageSize
    pipeline.extend([
        {"$skip": skip},
        {"$limit": pageSize}
    ])
    
    # Execute pipeline
    creators = await db.users.aggregate(pipeline).to_list(pageSize)
    
    return ExploreResponse(
        creators=creators,
        total=total,
        page=page,
        pageSize=pageSize
    )


@router.get("/api/explore/featured")
async def get_featured_creators(
    limit: int = Query(6, ge=1, le=20),
    db = Depends(get_db)
):
    """Get featured creators for homepage/spotlight"""
    
    pipeline = [
        {
            "$match": {
                "showcase_settings.isPublic": True,
                "featured": True
            }
        },
        {
            "$lookup": {
                "from": "videos",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$user_id", "$$user_id"]},
                                    {"$eq": ["$visibility", "public"]}
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "video_stats"
            }
        },
        {
            "$lookup": {
                "from": "subscriptions",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$creator_id", "$$user_id"]},
                                    {"$eq": ["$status", "active"]}
                                ]
                            }
                        }
                    },
                    {"$group": {"_id": "$subscriber_id"}},
                    {"$count": "count"}
                ],
                "as": "subscriber_stats"
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": "$user_id",
                "username": 1,
                "displayName": "$display_name",
                "bio": 1,
                "profileImage": "$profile_picture",
                "videoCount": {"$ifNull": [{"$arrayElemAt": ["$video_stats.count", 0]}, 0]},
                "subscribers": {"$ifNull": [{"$arrayElemAt": ["$subscriber_stats.count", 0]}, 0]},
                "tier": "$premium_tier"
            }
        },
        {"$limit": limit}
    ]
    
    creators = await db.users.aggregate(pipeline).to_list(limit)
    return {"creators": creators}


@router.get("/api/explore/trending")
async def get_trending_creators(limit: int = Query(6, ge=1, le=20)):
    """
    Get trending creators.
    Trending = high activity in last 7 days (new videos, new subscribers)
    """
    db = await get_db()
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    pipeline = [
        {
            "$match": {
                "showcase_settings.isPublic": True
            }
        },
        # Count recent videos
        {
            "$lookup": {
                "from": "videos",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$user_id", "$$user_id"]},
                                    {"$eq": ["$visibility", "public"]},
                                    {"$gte": ["$created_at", seven_days_ago]}
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "recent_video_stats"
            }
        },
        # Count recent subscribers
        {
            "$lookup": {
                "from": "subscriptions",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$creator_id", "$$user_id"]},
                                    {"$eq": ["$status", "active"]},
                                    {"$gte": ["$created_at", seven_days_ago]}
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "recent_subscriber_stats"
            }
        },
        # Get total counts
        {
            "$lookup": {
                "from": "videos",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$user_id", "$$user_id"]},
                                    {"$eq": ["$visibility", "public"]}
                                ]
                            }
                        }
                    },
                    {"$count": "count"}
                ],
                "as": "video_stats"
            }
        },
        {
            "$lookup": {
                "from": "subscriptions",
                "let": {"user_id": "$user_id"},
                "pipeline": [
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    {"$eq": ["$creator_id", "$$user_id"]},
                                    {"$eq": ["$status", "active"]}
                                ]
                            }
                        }
                    },
                    {"$group": {"_id": "$subscriber_id"}},
                    {"$count": "count"}
                ],
                "as": "subscriber_stats"
            }
        },
        {
            "$addFields": {
                "recentVideos": {"$ifNull": [{"$arrayElemAt": ["$recent_video_stats.count", 0]}, 0]},
                "recentSubscribers": {"$ifNull": [{"$arrayElemAt": ["$recent_subscriber_stats.count", 0]}, 0]},
                "trendingScore": {
                    "$add": [
                        {"$multiply": [{"$ifNull": [{"$arrayElemAt": ["$recent_video_stats.count", 0]}, 0]}, 2]},  # Videos worth 2x
                        {"$ifNull": [{"$arrayElemAt": ["$recent_subscriber_stats.count", 0]}, 0]}  # Subscribers worth 1x
                    ]
                }
            }
        },
        {
            "$match": {
                "trendingScore": {"$gt": 0}  # Must have some activity
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": "$user_id",
                "username": 1,
                "displayName": "$display_name",
                "bio": 1,
                "profileImage": "$profile_picture",
                "videoCount": {"$ifNull": [{"$arrayElemAt": ["$video_stats.count", 0]}, 0]},
                "subscribers": {"$ifNull": [{"$arrayElemAt": ["$subscriber_stats.count", 0]}, 0]},
                "tier": "$premium_tier",
                "trendingScore": 1
            }
        },
        {"$sort": {"trendingScore": -1}},
        {"$limit": limit}
    ]
    
    creators = await db.users.aggregate(pipeline).to_list(limit)
    return {"creators": creators}


@router.get("/api/explore/categories")
async def get_categories():
    """Get list of all creator categories"""
    db = await get_db()
    
    categories = await db.users.distinct("categories", {
        "showcase_settings.isPublic": True,
        "categories": {"$exists": True, "$ne": []}
    })
    
    return {"categories": sorted(categories)}


@router.get("/api/explore/tags")
async def get_tags():
    """Get list of all creator tags"""
    db = await get_db()
    
    tags = await db.users.distinct("tags", {
        "showcase_settings.isPublic": True,
        "tags": {"$exists": True, "$ne": []}
    })
    
    return {"tags": sorted(tags)}
