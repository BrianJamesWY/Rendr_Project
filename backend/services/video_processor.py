import cv2
import imagehash
from PIL import Image
import uuid
import random
import string
import os
from typing import Dict, List, Tuple

class VideoProcessor:
    
    @staticmethod
    def extract_frames(video_path: str, num_frames: int = 10):
        """Extract evenly spaced frames from video"""
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0
        
        frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
        frames = []
        
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_image = Image.fromarray(frame_rgb)
                frames.append(pil_image)
        
        cap.release()
        
        metadata = {
            "total_frames": total_frames,
            "fps": float(fps),
            "duration_seconds": float(duration)
        }
        
        return frames, metadata
    
    @staticmethod
    def calculate_perceptual_hash(frames: List[Image.Image]) -> Dict:
        """Calculate perceptual hash for video"""
        hashes = []
        
        for frame in frames:
            frame_hash = imagehash.phash(frame, hash_size=8)
            hashes.append(str(frame_hash))
        
        combined = ''.join(hashes)
        
        return {
            "combined_hash": combined,
            "frame_hashes": hashes,
            "num_frames": len(hashes),
            "algorithm": "phash",
            "hash_size": 8
        }
    
    @staticmethod
    def compare_hashes(original_hash: Dict, new_hash: Dict) -> Dict:
        """Compare two video hashes"""
        if len(original_hash['frame_hashes']) != len(new_hash['frame_hashes']):
            return {
                "similarity_score": 0.0,
                "confidence_level": "low",
                "result": "tampered",
                "frame_comparison": []
            }
        
        matches = 0
        total = len(original_hash['frame_hashes'])
        frame_comparison = []
        
        for i, (h1, h2) in enumerate(zip(original_hash['frame_hashes'], new_hash['frame_hashes'])):
            hash1_obj = imagehash.hex_to_hash(h1)
            hash2_obj = imagehash.hex_to_hash(h2)
            distance = hash1_obj - hash2_obj
            
            similarity = max(0, 100 - (distance * 2))
            
            if similarity >= 90:
                matches += 1
            
            frame_comparison.append({
                "frame": i + 1,
                "similarity": float(similarity),
                "distance": int(distance)
            })
        
        overall_similarity = (matches / total) * 100
        
        # Determine result
        if overall_similarity >= 85:
            result = "authentic"
            confidence = "high"
        elif overall_similarity >= 70:
            result = "authentic"
            confidence = "medium"
        else:
            result = "tampered"
            confidence = "high"
        
        return {
            "similarity_score": float(overall_similarity),
            "confidence_level": confidence,
            "result": result,
            "frame_comparison": frame_comparison
        }
    
    @staticmethod
    def generate_verification_code() -> str:
        """Generate unique verification code (RND-XXXXXX)"""
        chars = string.ascii_uppercase + string.digits
        code = ''.join(random.choices(chars, k=6))
        return f"RND-{code}"
    
    @staticmethod
    def extract_thumbnail(video_path: str, video_id: str) -> str:
        """Extract first frame from video and save as thumbnail
        
        Args:
            video_path: Path to video file
            video_id: Unique video ID for naming the thumbnail
            
        Returns:
            Path to saved thumbnail file
        """
        # Create thumbnails directory if it doesn't exist
        thumbnail_dir = "uploads/thumbnails"
        os.makedirs(thumbnail_dir, exist_ok=True)
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file for thumbnail extraction")
        
        # Read first frame
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            raise ValueError("Could not read first frame from video")
        
        # Resize frame to reasonable thumbnail size (keep aspect ratio)
        height, width = frame.shape[:2]
        max_dimension = 800
        
        if width > height:
            new_width = max_dimension
            new_height = int(height * (max_dimension / width))
        else:
            new_height = max_dimension
            new_width = int(width * (max_dimension / height))
        
        resized_frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
        
        # Save as JPEG with quality setting
        thumbnail_filename = f"{video_id}.jpg"
        thumbnail_path = os.path.join(thumbnail_dir, thumbnail_filename)
        
        cv2.imwrite(thumbnail_path, resized_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        
        print(f"✅ Thumbnail saved: {thumbnail_path}")
        
        return thumbnail_path
