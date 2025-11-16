"""
Rendr POC - Perceptual Hash Testing
Tests if video hashing survives re-encoding and detects edits
"""

import cv2
import imagehash
from PIL import Image
import os
import json
from datetime import datetime

def extract_frames(video_path, num_frames=10):
    """Extract evenly spaced frames from video"""
    print(f"📹 Extracting frames from: {video_path}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video file")
        return None
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps
    
    print(f"   Total frames: {total_frames}")
    print(f"   FPS: {fps:.2f}")
    print(f"   Duration: {duration:.2f} seconds")
    
    frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]
    frames = []
    
    for idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
        ret, frame = cap.read()
        if ret:
            # Convert BGR to RGB
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(frame_rgb)
            frames.append(pil_image)
    
    cap.release()
    print(f"✅ Extracted {len(frames)} frames")
    return frames

def calculate_video_phash(frames):
    """Calculate perceptual hash for video using multiple frames"""
    print(f"🔢 Calculating perceptual hashes...")
    
    hashes = []
    for i, frame in enumerate(frames):
        # Using phash (perceptual hash) - most robust for our use case
        frame_hash = imagehash.phash(frame, hash_size=8)
        hashes.append(str(frame_hash))
        print(f"   Frame {i+1}: {frame_hash}")
    
    # Combine all frame hashes into one video hash
    combined = ''.join(hashes)
    print(f"✅ Combined hash: {combined[:64]}... (truncated)")
    
    return {
        'combined_hash': combined,
        'frame_hashes': hashes,
        'num_frames': len(hashes)
    }

def compare_hashes(hash1, hash2):
    """Compare two video hashes and return similarity percentage"""
    if len(hash1['frame_hashes']) != len(hash2['frame_hashes']):
        print("⚠️ Warning: Different number of frames")
        return 0.0
    
    matches = 0
    total = len(hash1['frame_hashes'])
    
    print(f"\n🔍 Comparing frame-by-frame:")
    for i, (h1, h2) in enumerate(zip(hash1['frame_hashes'], hash2['frame_hashes'])):
        # Calculate hamming distance (how many bits differ)
        hash1_obj = imagehash.hex_to_hash(h1)
        hash2_obj = imagehash.hex_to_hash(h2)
        distance = hash1_obj - hash2_obj
        
        # Lower distance = more similar (0 = identical)
        # Typically distance < 10 means very similar
        similarity = max(0, 100 - (distance * 2))
        
        if similarity >= 90:
            matches += 1
            status = "✅"
        elif similarity >= 80:
            status = "⚠️"
        else:
            status = "❌"
        
        print(f"   Frame {i+1}: {status} {similarity:.1f}% similar (distance: {distance})")
    
    overall_similarity = (matches / total) * 100
    return overall_similarity

def test_video(video_path):
    """Process a video and return its hash"""
    if not os.path.exists(video_path):
        print(f"❌ Video not found: {video_path}")
        return None
    
    frames = extract_frames(video_path, num_frames=10)
    if frames is None:
        return None
    
    video_hash = calculate_video_phash(frames)
    return video_hash

def main():
    print("=" * 60)
    print("🎬 RENDR POC - PERCEPTUAL HASH TESTING")
    print("=" * 60)
    print()
    
    # Test 1: Hash the original video
    print("TEST 1: Original Video")
    print("-" * 60)
    original_hash = test_video("test_video_original.mp4")
    
    if original_hash is None:
        print("\n❌ FAILED: Could not process original video")
        print("Make sure 'test_video_original.mp4' is in this folder")
        return
    
    print("\n✅ Original video processed successfully!")
    print()
    
    # Save original hash for later comparison
    with open('original_hash.json', 'w') as f:
        json.dump(original_hash, f, indent=2)
    print("💾 Saved original hash to: original_hash.json")
    print()
    
    # Test 2: Compare with re-encoded version (if exists)
    print("\n" + "=" * 60)
    print("TEST 2: Re-encoded Video Comparison")
    print("-" * 60)
    
    if os.path.exists("test_video_reencoded.mp4"):
        print("📹 Found re-encoded video, comparing...")
        reencoded_hash = test_video("test_video_reencoded.mp4")
        
        if reencoded_hash:
            similarity = compare_hashes(original_hash, reencoded_hash)
            print(f"\n{'=' * 60}")
            print(f"📊 OVERALL SIMILARITY: {similarity:.1f}%")
            print(f"{'=' * 60}")
            
            if similarity >= 95:
                print("✅ EXCELLENT: Hash survives re-encoding!")
            elif similarity >= 85:
                print("⚠️ GOOD: Minor differences, likely acceptable")
            elif similarity >= 70:
                print("⚠️ MODERATE: Significant differences detected")
            else:
                print("❌ POOR: Major differences, may not work for verification")
    else:
        print("ℹ️ No re-encoded video found yet.")
        print("   Next steps:")
        print("   1. Upload 'test_video_original.mp4' to Instagram")
        print("   2. Download it back")
        print("   3. Save as 'test_video_reencoded.mp4'")
        print("   4. Run this script again")
    
    print()
    
    # Test 3: Compare with edited version (if exists)
    print("\n" + "=" * 60)
    print("TEST 3: Edited Video Detection")
    print("-" * 60)
    
    if os.path.exists("test_video_edited.mp4"):
        print("📹 Found edited video, comparing...")
        edited_hash = test_video("test_video_edited.mp4")
        
        if edited_hash:
            similarity = compare_hashes(original_hash, edited_hash)
            print(f"\n{'=' * 60}")
            print(f"📊 OVERALL SIMILARITY: {similarity:.1f}%")
            print(f"{'=' * 60}")
            
            if similarity < 90:
                print("✅ SUCCESS: Editing was detected!")
            else:
                print("⚠️ WARNING: Edit not detected (hash too similar)")
    else:
        print("ℹ️ No edited video found yet.")
        print("   To test editing detection:")
        print("   1. Edit 'test_video_original.mp4' (remove 5-10 seconds)")
        print("   2. Save as 'test_video_edited.mp4'")
        print("   3. Run this script again")
    
    print("\n" + "=" * 60)
    print("✅ POC TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
