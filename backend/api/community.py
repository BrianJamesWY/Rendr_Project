from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import uuid4
import os
from database.mongodb import get_db

router = APIRouter(prefix="/community", tags=["community"])

# Pydantic Models
class PostCreate(BaseModel):
    content: str
    media_urls: Optional[List[str]] = []
    visibility: str = "public"  # public, followers, private

class PostUpdate(BaseModel):
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None

class CommentCreate(BaseModel):
    content: str

class CommentUpdate(BaseModel):
    content: str

# Dependency for auth
from api.auth import get_current_user

# ==================== POSTS ====================

@router.post("/posts")
async def create_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a community post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        username = current_user.get('username')
        
        post_data = {
            "post_id": str(uuid4()),
            "user_id": user_id,
            "username": username,
            "display_name": current_user.get('display_name', username),
            "profile_picture": current_user.get('profile_picture'),
            "content": post.content,
            "media_urls": post.media_urls or [],
            "visibility": post.visibility,
            "like_count": 0,
            "comment_count": 0,
            "share_count": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.posts.insert_one(post_data)
        
        return {
            "success": True,
            "post_id": post_data["post_id"],
            "message": "Post created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts")
async def get_posts(
    skip: int = 0,
    limit: int = 20,
    user_id: Optional[str] = None,
    db = Depends(get_db)
):
    """Get community posts feed"""
    try:
        query = {}
        if user_id:
            query["user_id"] = user_id
        
        posts = await db.posts.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "posts": posts,
            "count": len(posts)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts/{post_id}")
async def get_post(
    post_id: str,
    db = Depends(get_db)
):
    """Get a specific post"""
    try:
        post = await db.posts.find_one({"post_id": post_id}, {"_id": 0})
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return post
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    post_update: PostUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update a post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        post = await db.posts.find_one({"post_id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post.get('user_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this post")
        
        # Build update dict
        update_data = {"updated_at": datetime.now().isoformat()}
        if post_update.content is not None:
            update_data["content"] = post_update.content
        if post_update.media_urls is not None:
            update_data["media_urls"] = post_update.media_urls
        
        await db.posts.update_one(
            {"post_id": post_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Post updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        post = await db.posts.find_one({"post_id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if post.get('user_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
        # Delete post and all its comments
        await db.posts.delete_one({"post_id": post_id})
        await db.comments.delete_many({"post_id": post_id})
        await db.likes.delete_many({"post_id": post_id})
        
        return {"success": True, "message": "Post deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== LIKES ====================

@router.post("/posts/{post_id}/like")
async def like_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Like a post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check if already liked
        existing_like = await db.likes.find_one({
            "post_id": post_id,
            "user_id": user_id
        })
        
        if existing_like:
            return {"success": True, "message": "Post already liked"}
        
        # Create like
        like_data = {
            "like_id": str(uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "created_at": datetime.now().isoformat()
        }
        
        await db.likes.insert_one(like_data)
        
        # Increment like count
        await db.posts.update_one(
            {"post_id": post_id},
            {"$inc": {"like_count": 1}}
        )
        
        return {"success": True, "message": "Post liked successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/posts/{post_id}/like")
async def unlike_post(
    post_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Unlike a post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        result = await db.likes.delete_one({
            "post_id": post_id,
            "user_id": user_id
        })
        
        if result.deleted_count > 0:
            # Decrement like count
            await db.posts.update_one(
                {"post_id": post_id},
                {"$inc": {"like_count": -1}}
            )
            return {"success": True, "message": "Post unliked successfully"}
        else:
            return {"success": True, "message": "Like not found"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== COMMENTS ====================

@router.post("/posts/{post_id}/comments")
async def create_comment(
    post_id: str,
    comment: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a comment on a post"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        username = current_user.get('username')
        
        comment_data = {
            "comment_id": str(uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "username": username,
            "display_name": current_user.get('display_name', username),
            "profile_picture": current_user.get('profile_picture'),
            "content": comment.content,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        await db.comments.insert_one(comment_data)
        
        # Increment comment count
        await db.posts.update_one(
            {"post_id": post_id},
            {"$inc": {"comment_count": 1}}
        )
        
        return {
            "success": True,
            "comment_id": comment_data["comment_id"],
            "message": "Comment created successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: str,
    skip: int = 0,
    limit: int = 50,
    db = Depends(get_db)
):
    """Get comments for a post"""
    try:
        comments = await db.comments.find(
            {"post_id": post_id},
            {"_id": 0}
        ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        return {
            "comments": comments,
            "count": len(comments)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a comment"""
    try:
        user_id = current_user.get('id') or current_user.get('_id')
        
        # Check ownership
        comment = await db.comments.find_one({"comment_id": comment_id})
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        if comment.get('user_id') != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
        await db.comments.delete_one({"comment_id": comment_id})
        
        # Decrement comment count
        await db.posts.update_one(
            {"post_id": comment.get('post_id')},
            {"$inc": {"comment_count": -1}}
        )
        
        return {"success": True, "message": "Comment deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
