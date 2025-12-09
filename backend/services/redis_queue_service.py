"""
Redis Queue Service
Background job processing for video verification tasks
"""

import redis
from rq import Queue, Worker
from rq.job import Job
import os
from datetime import timedelta

# Redis connection
redis_conn = redis.Redis(
    host='127.0.0.1',
    port=6379,
    db=0,
    decode_responses=True
)

# Create queues with different priorities
high_priority_queue = Queue('high', connection=redis_conn)
default_queue = Queue('default', connection=redis_conn)
low_priority_queue = Queue('low', connection=redis_conn)


class RedisQueueService:
    """Service for managing background jobs with Redis Queue"""
    
    def __init__(self):
        self.redis = redis_conn
        self.high_queue = high_priority_queue
        self.default_queue = default_queue
        self.low_queue = low_priority_queue
    
    def enqueue_video_processing(
        self,
        video_id: str,
        video_path: str,
        verification_code: str,
        user_id: str,
        priority: str = 'default'
    ) -> str:
        """
        Enqueue video processing job
        
        Args:
            video_id: Video UUID
            video_path: Path to video file
            verification_code: RND code
            user_id: User UUID
            priority: 'high', 'default', or 'low'
        
        Returns:
            Job ID
        """
        from services.comprehensive_hash_service import comprehensive_hash_service
        
        # Select queue based on priority
        if priority == 'high':
            queue = self.high_queue
        elif priority == 'low':
            queue = self.low_queue
        else:
            queue = self.default_queue
        
        # Enqueue the job
        job = queue.enqueue(
            'services.background_tasks.process_video_hashes',
            video_id=video_id,
            video_path=video_path,
            verification_code=verification_code,
            user_id=user_id,
            job_timeout='10m',  # 10 minute timeout
            result_ttl=3600,     # Keep result for 1 hour
            job_id=f"video_{video_id}"  # Unique job ID
        )
        
        return job.id
    
    def get_job_status(self, job_id: str) -> dict:
        """
        Get status of a background job
        
        Returns:
            {
                'status': 'queued' | 'started' | 'finished' | 'failed',
                'progress': 0-100,
                'result': dict (if finished),
                'error': str (if failed)
            }
        """
        try:
            job = Job.fetch(job_id, connection=self.redis)
            
            status = job.get_status()
            meta = job.meta
            
            return {
                'status': status,
                'progress': meta.get('progress', 0),
                'message': meta.get('message', ''),
                'result': job.result if status == 'finished' else None,
                'error': job.exc_info if status == 'failed' else None,
                'created_at': job.created_at.isoformat() if job.created_at else None,
                'started_at': job.started_at.isoformat() if job.started_at else None,
                'ended_at': job.ended_at.isoformat() if job.ended_at else None
            }
        except Exception as e:
            return {
                'status': 'not_found',
                'error': str(e)
            }
    
    def update_job_progress(self, job_id: str, progress: int, message: str = ''):
        """Update job progress (call from within job)"""
        try:
            job = Job.fetch(job_id, connection=self.redis)
            job.meta['progress'] = progress
            job.meta['message'] = message
            job.save_meta()
        except Exception as e:
            print(f"Failed to update job progress: {e}")
    
    def cancel_job(self, job_id: str):
        """Cancel a queued or running job"""
        try:
            job = Job.fetch(job_id, connection=self.redis)
            job.cancel()
            return True
        except Exception:
            return False
    
    def get_queue_info(self):
        """Get information about all queues"""
        return {
            'high': {
                'count': len(self.high_queue),
                'workers': Worker.count(queue=self.high_queue)
            },
            'default': {
                'count': len(self.default_queue),
                'workers': Worker.count(queue=self.default_queue)
            },
            'low': {
                'count': len(self.low_queue),
                'workers': Worker.count(queue=self.low_queue)
            }
        }
    
    def publish_status_update(self, video_id: str, status_data: dict):
        """
        Publish real-time status update via Redis Pub/Sub
        
        Clients can subscribe to channel: video_status:{video_id}
        """
        channel = f"video_status:{video_id}"
        self.redis.publish(channel, str(status_data))
    
    def subscribe_to_status(self, video_id: str):
        """
        Subscribe to video status updates
        
        Returns pubsub object that can be iterated
        """
        pubsub = self.redis.pubsub()
        channel = f"video_status:{video_id}"
        pubsub.subscribe(channel)
        return pubsub


# Global instance
redis_queue_service = RedisQueueService()
