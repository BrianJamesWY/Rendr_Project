"""
Enhanced Video Processor with Multi-Hash Detection
Implements Progressive Enhancement and Smart Detection
"""
import cv2
import imagehash
from PIL import Image
import numpy as np
import json
import hashlib
import subprocess
from typing import Dict, List, Tuple, Optional
import os

class EnhancedVideoProcessor:
    """
    Video processor with multiple hash generation methods
    for comprehensive duplicate detection
    """
    
    def __init__(self):
        self.sample_frame_count = 10  # Frames to sample for hash
    
    def calculate_all_hashes(
        self, 
        video_path: str, 
        tier: str = "free"
    ) -> Dict[str, any]:
        """
        Calculate hashes based on user tier (Progressive Enhancement)
        
        Args:
            video_path: Path to video file
            tier: User tier (free/pro/enterprise)
            
        Returns:
            Dictionary with all calculated hashes and metadata
        """
        print(f"🔍 Calculating hashes for {tier} tier...")
        
        result = {
            "original_hash": None,
            "center_region_hash": None,
            "audio_hash": None,
            "metadata_hash": None,
            "frame_count": 0,
            "duration": 0,
            "resolution": None
        }
        
        # Get video metadata (all tiers)
        metadata = self._get_video_metadata(video_path)
        result["metadata_hash"] = self._hash_metadata(metadata)
        result["frame_count"] = metadata.get("frame_count", 0)
        result["duration"] = metadata.get("duration", 0)
        result["resolution"] = metadata.get("resolution")
        
        # Calculate original perceptual hash (all tiers)
        result["original_hash"] = self._calculate_perceptual_hash(video_path)
        print(f"✅ Original hash: {result['original_hash'][:32]}...")
        
        # Center region hash for Pro and Enterprise
        if tier in ["pro", "enterprise"]:
            result["center_region_hash"] = self._calculate_center_hash(video_path)
            print(f"✅ Center region hash: {result['center_region_hash'][:32]}...")
        
        # Audio fingerprint for Enterprise only
        if tier == "enterprise":
            result["audio_hash"] = self._calculate_audio_hash(video_path)
            print(f"✅ Audio hash: {result['audio_hash'][:32]}...")
        
        return result
    
    def _get_video_metadata(self, video_path: str) -> Dict:
        """Extract video metadata using ffprobe"""
        try:
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                video_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                data = json.loads(result.stdout)
                
                # Extract key metadata
                video_stream = next((s for s in data.get('streams', []) if s['codec_type'] == 'video'), {})
                
                return {
                    "duration": float(data.get('format', {}).get('duration', 0)),
                    "size": int(data.get('format', {}).get('size', 0)),
                    "bitrate": int(data.get('format', {}).get('bit_rate', 0)),
                    "codec": video_stream.get('codec_name'),
                    "resolution": f"{video_stream.get('width')}x{video_stream.get('height')}",
                    "fps": eval(video_stream.get('r_frame_rate', '30/1')),
                    "frame_count": int(video_stream.get('nb_frames', 0))
                }
            
            return {}
        except Exception as e:
            print(f"⚠️ Metadata extraction failed: {e}")
            return {}
    
    def _hash_metadata(self, metadata: Dict) -> str:
        """Create hash from video metadata"""
        # Use stable metadata (not file size which can vary)
        stable_data = {
            "duration": metadata.get("duration"),
            "resolution": metadata.get("resolution"),
            "fps": metadata.get("fps"),
            "codec": metadata.get("codec")
        }
        
        metadata_str = json.dumps(stable_data, sort_keys=True)
        return hashlib.sha256(metadata_str.encode()).hexdigest()
    
    def _calculate_perceptual_hash(self, video_path: str) -> str:
        """
        Calculate perceptual hash from full video frames
        (Current implementation - already exists in video_processor.py)
        """
        try:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                print("⚠️ Video has no frames")
                return "0" * 64
            
            # Sample frames evenly throughout video
            frame_indices = np.linspace(0, total_frames - 1, 
                                       min(self.sample_frame_count, total_frames), 
                                       dtype=int)
            
            frame_hashes = []
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                
                if ret:
                    # Convert to PIL Image
                    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(frame_rgb)
                    
                    # Calculate perceptual hash
                    frame_hash = imagehash.phash(pil_image, hash_size=16)
                    frame_hashes.append(str(frame_hash))
            
            cap.release()
            
            # Combine all frame hashes
            combined = ''.join(frame_hashes)
            final_hash = hashlib.sha256(combined.encode()).hexdigest()
            
            return final_hash
        
        except Exception as e:
            print(f"❌ Perceptual hash failed: {e}")
            return "0" * 64
    
    def _calculate_center_hash(self, video_path: str) -> str:
        """
        Calculate hash from center 60% of video (excludes edges where watermark is)
        This detects videos even if watermark is cropped out
        """
        try:
            cap = cv2.VideoCapture(video_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                return "0" * 64
            
            frame_indices = np.linspace(0, total_frames - 1, 
                                       min(self.sample_frame_count, total_frames), 
                                       dtype=int)
            
            frame_hashes = []
            
            for idx in frame_indices:
                cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
                ret, frame = cap.read()
                
                if ret:
                    # Crop to center 60% (removes edges where watermark typically is)
                    h, w = frame.shape[:2]
                    crop_margin_h = int(h * 0.2)  # 20% margin top/bottom
                    crop_margin_w = int(w * 0.2)  # 20% margin left/right
                    
                    center_frame = frame[
                        crop_margin_h:h-crop_margin_h,
                        crop_margin_w:w-crop_margin_w
                    ]
                    
                    # Convert to PIL and hash
                    frame_rgb = cv2.cvtColor(center_frame, cv2.COLOR_BGR2RGB)
                    pil_image = Image.fromarray(frame_rgb)
                    
                    frame_hash = imagehash.phash(pil_image, hash_size=16)
                    frame_hashes.append(str(frame_hash))
            
            cap.release()
            
            combined = ''.join(frame_hashes)
            final_hash = hashlib.sha256(combined.encode()).hexdigest()
            
            return final_hash
        
        except Exception as e:
            print(f"❌ Center hash failed: {e}")
            return "0" * 64
    
    def _calculate_audio_hash(self, video_path: str) -> str:
        """
        Calculate audio fingerprint
        Detects duplicate even if video is cropped/edited but audio is same
        """
        try:
            # Extract audio to temp file
            temp_audio = f"/tmp/audio_{os.path.basename(video_path)}.wav"
            
            cmd = [
                'ffmpeg',
                '-i', video_path,
                '-vn',  # No video
                '-acodec', 'pcm_s16le',  # PCM audio
                '-ar', '16000',  # 16kHz sample rate
                '-ac', '1',  # Mono
                '-y',
                temp_audio
            ]
            
            result = subprocess.run(cmd, capture_output=True, timeout=60)
            
            if result.returncode != 0 or not os.path.exists(temp_audio):
                print("⚠️ No audio track found")
                return "no_audio"
            
            # Read audio and create simple fingerprint
            # (In production, use chromaprint or similar)
            with open(temp_audio, 'rb') as f:
                audio_data = f.read()
                audio_hash = hashlib.sha256(audio_data).hexdigest()
            
            # Clean up
            os.remove(temp_audio)
            
            return audio_hash
        
        except Exception as e:
            print(f"⚠️ Audio hash failed: {e}")
            return "no_audio"
    
    def calculate_similarity_score(self, hash1: str, hash2: str) -> float:
        """
        Calculate similarity between two hashes (0.0 to 1.0)
        
        Returns:
            1.0 = identical
            0.95+ = very similar (likely duplicate)
            0.85+ = similar (possible duplicate)
            <0.85 = different
        """
        if not hash1 or not hash2 or hash1 == "0" * 64 or hash2 == "0" * 64:
            return 0.0
        
        # Calculate hamming distance for hex strings
        if len(hash1) != len(hash2):
            return 0.0
        
        different_chars = sum(c1 != c2 for c1, c2 in zip(hash1, hash2))
        similarity = 1.0 - (different_chars / len(hash1))
        
        return similarity
    
    def smart_duplicate_detection(
        self,
        new_hashes: Dict,
        existing_videos: List[Dict],
        tier: str
    ) -> Tuple[bool, Optional[Dict], float]:
        """
        Smart detection with tier-appropriate matching
        
        Returns:
            (is_duplicate, matching_video, confidence_score)
        """
        print(f"🔍 Smart detection: Checking {len(existing_videos)} existing videos...")
        
        for existing in existing_videos:
            # Always check original hash (check both new and legacy formats)
            existing_original_hash = (
                existing.get("hashes", {}).get("original") or  # New format
                existing.get("original_hash", "") or           # Legacy format
                existing.get("perceptual_hash", {}).get("combined_hash", "")  # Very old format
            )
            
            original_similarity = self.calculate_similarity_score(
                new_hashes["original_hash"],
                existing_original_hash
            )
            
            if original_similarity >= 0.95:
                print(f"✅ Exact match found (original hash): {original_similarity:.2%}")
                return (True, existing, original_similarity)
            
            # Check center hash for Pro/Enterprise
            if tier in ["pro", "enterprise"] and new_hashes.get("center_region_hash"):
                existing_center_hash = (
                    existing.get("hashes", {}).get("center_region") or  # New format
                    existing.get("center_region_hash", "")              # Legacy format
                )
                
                center_similarity = self.calculate_similarity_score(
                    new_hashes["center_region_hash"],
                    existing_center_hash
                )
                
                if center_similarity >= 0.95:
                    print(f"✅ Match found (center hash): {center_similarity:.2%}")
                    print("   (Possible watermark removal detected)")
                    return (True, existing, center_similarity)
            
            # Check audio hash for Enterprise
            if tier == "enterprise" and new_hashes.get("audio_hash") != "no_audio":
                existing_audio_hash = (
                    existing.get("hashes", {}).get("audio") or  # New format
                    existing.get("audio_hash", "")              # Legacy format
                )
                
                if new_hashes["audio_hash"] == existing_audio_hash:
                    print("✅ Match found (audio fingerprint)")
                    print("   (Video edited but audio identical)")
                    return (True, existing, 1.0)
            
            # Check for "possible duplicate" (85-95% similar)
            if 0.85 <= original_similarity < 0.95:
                print(f"⚠️ Possible duplicate detected: {original_similarity:.2%}")
                # Log but don't block for now
        
        print("✅ No duplicates found - new video")
        return (False, None, 0.0)

# Global instance
enhanced_processor = EnhancedVideoProcessor()
