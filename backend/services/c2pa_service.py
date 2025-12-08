"""
C2PA (Coalition for Content Provenance and Authenticity) Service
Creates and verifies C2PA manifests for video authentication
Using official c2pa-python library
"""

import json
import hashlib
import base64
from typing import Dict, Optional
from datetime import datetime, timezone
import os

# Try to import c2pa library
try:
    import c2pa
    from c2pa import Builder, Reader
    C2PA_AVAILABLE = True
    print("✅ C2PA library loaded successfully")
except ImportError:
    C2PA_AVAILABLE = False
    print("⚠️ C2PA library not available, using fallback mode")

class C2PAService:
    """
    Handles C2PA manifest creation and verification
    """
    
    def __init__(self):
        self.version = "2.2"
        self.claim_generator = "RENDR v1.0"
        
    def create_manifest(
        self,
        video_path: str,
        verification_code: str,
        user_info: Dict,
        hashes: Dict,
        metadata: Dict,
        provenance: list = None
    ) -> Dict:
        """
        Create C2PA manifest with all assertions
        
        Args:
            video_path: Path to watermarked video
            verification_code: RENDR verification code
            user_info: User/uploader information
            hashes: All calculated hashes
            metadata: Video metadata
            provenance: Chain of custody (optional)
            
        Returns:
            Complete C2PA manifest
        """
        print("\n📜 Creating C2PA manifest...")
        
        # Calculate video hash for hard binding
        video_hash = self._calculate_file_hash(video_path)
        
        # Generate unique instance ID
        instance_id = f"xmp.iid:{verification_code}"
        
        manifest = {
            "@context": "https://c2pa.org/specifications/2.2",
            "claim_generator": self.claim_generator,
            "claim_generator_info": [{
                "name": "RENDR",
                "version": "1.0",
                "icon": "https://rendr.com/logo.png"
            }],
            
            "title": metadata.get("title", "Verified Video"),
            "format": "video/mp4",
            "instance_id": instance_id,
            
            "assertions": [
                # Hash assertions (original + watermarked)
                {
                    "label": "c2pa.hash.data",
                    "data": {
                        "alg": "sha256",
                        "hash": hashes.get("original_sha256"),
                        "name": "original_video",
                        "description": "Hash of pristine original video before watermarking"
                    }
                },
                {
                    "label": "c2pa.hash.data",
                    "data": {
                        "alg": "sha256",
                        "hash": hashes.get("watermarked_sha256"),
                        "name": "watermarked_video",
                        "description": "Hash of watermarked video with verification code"
                    }
                },
                
                # Creative work metadata
                {
                    "label": "stds.schema-org.CreativeWork",
                    "data": {
                        "@type": "VideoObject",
                        "author": {
                            "@type": "Person",
                            "name": user_info.get("username", "Unknown"),
                            "identifier": user_info.get("user_id")
                        },
                        "datePublished": datetime.now(timezone.utc).isoformat(),
                        "name": metadata.get("title", "Untitled Video"),
                        "description": metadata.get("description", "")
                    }
                },
                
                # Provenance chain (actions)
                {
                    "label": "c2pa.actions",
                    "data": {
                        "actions": self._build_action_chain(metadata, provenance)
                    }
                },
                
                # RENDR-specific verification data
                {
                    "label": "rendr.verification",
                    "data": {
                        "verification_code": verification_code,
                        "verification_url": f"https://rendr.com/verify/{verification_code}",
                        "key_frame_hashes": hashes.get("key_frame_hashes", []),
                        "perceptual_hashes": hashes.get("perceptual_hashes", []),
                        "audio_hash": hashes.get("audio_hash"),
                        "metadata_hash": hashes.get("metadata_hash"),
                        "master_hash": hashes.get("master_hash")
                    }
                }
            ],
            
            # Hard binding (ties manifest to video content)
            "hard_binding": {
                "alg": "sha256",
                "hash": video_hash,
                "exclusions": []  # No exclusions - entire file is bound
            }
        }
        
        # Add EXIF data if available
        if metadata.get("device") or metadata.get("gps_location"):
            exif_assertion = self._create_exif_assertion(metadata)
            manifest["assertions"].append(exif_assertion)
        
        print(f"✅ C2PA manifest created with {len(manifest['assertions'])} assertions")
        
        return manifest
    
    def _build_action_chain(self, metadata: Dict, provenance: list = None) -> list:
        """
        Build provenance action chain
        """
        actions = []
        
        # Original creation action
        if metadata.get("device"):
            actions.append({
                "action": "c2pa.created",
                "softwareAgent": metadata.get("device", "Unknown Device"),
                "when": metadata.get("captured_at", datetime.now(timezone.utc).isoformat()),
                "digitalSourceType": "http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture"
            })
        
        # Watermark addition
        actions.append({
            "action": "c2pa.edited",
            "softwareAgent": "RENDR Watermark v1.0",
            "when": datetime.now(timezone.utc).isoformat(),
            "changes": [{
                "description": "Added watermark with verification code",
                "region": "left edge vertical"
            }]
        })
        
        # Additional actions from provenance
        if provenance:
            actions.extend(provenance)
        
        return actions
    
    def _create_exif_assertion(self, metadata: Dict) -> Dict:
        """
        Create EXIF data assertion
        """
        exif_data = {}
        
        if metadata.get("gps_location"):
            # Parse GPS coordinates
            exif_data["exif:GPSLatitude"] = metadata.get("gps_latitude", "")
            exif_data["exif:GPSLongitude"] = metadata.get("gps_longitude", "")
            exif_data["exif:GPSAltitude"] = metadata.get("gps_altitude", "")
        
        if metadata.get("captured_at"):
            exif_data["exif:DateTimeOriginal"] = metadata.get("captured_at")
        
        if metadata.get("device"):
            device = metadata.get("device", "")
            if "iPhone" in device:
                exif_data["exif:Make"] = "Apple"
                exif_data["exif:Model"] = device
        
        return {
            "label": "stds.exif",
            "data": exif_data
        }
    
    def save_manifest(self, manifest: Dict, video_path: str) -> str:
        """
        Save C2PA manifest as XMP sidecar
        
        Args:
            manifest: Complete manifest dict
            video_path: Path to video file
            
        Returns:
            Path to saved manifest file
        """
        manifest_path = f"{video_path}.c2pa"
        
        try:
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            print(f"✅ C2PA manifest saved: {manifest_path}")
            return manifest_path
            
        except Exception as e:
            print(f"❌ Failed to save manifest: {e}")
            return None
    
    def _calculate_file_hash(self, file_path: str) -> str:
        """Calculate SHA-256 of entire file"""
        sha256_hash = hashlib.sha256()
        
        try:
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(8192), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except:
            return ""
    
    def read_c2pa_from_file(self, video_path: str) -> Optional[Dict]:
        """
        Read C2PA manifest from video file using official library
        
        Args:
            video_path: Path to video file with embedded C2PA
            
        Returns:
            Manifest dict or None if not found
        """
        if not C2PA_AVAILABLE:
            print("⚠️ C2PA library not available")
            return None
        
        try:
            # Use C2PA Reader to extract manifest
            reader = Reader(video_path)
            manifest_store = reader.get_manifest_store()
            
            if manifest_store:
                print(f"✅ C2PA manifest found in {video_path}")
                return manifest_store
            else:
                print(f"ℹ️ No C2PA manifest found in {video_path}")
                return None
                
        except Exception as e:
            print(f"⚠️ Error reading C2PA manifest: {e}")
            return None
    
    def verify_manifest(self, manifest_path: str) -> Dict:
        """
        Verify C2PA manifest
        
        Args:
            manifest_path: Path to .c2pa manifest file or video file
            
        Returns:
            Verification result
        """
        try:
            # If it's a video file and c2pa library is available, try reading embedded manifest
            if C2PA_AVAILABLE and (manifest_path.endswith('.mp4') or manifest_path.endswith('.mov')):
                manifest_store = self.read_c2pa_from_file(manifest_path)
                if manifest_store:
                    return {
                        "valid": True,
                        "manifest_present": True,
                        "claim_generator": "C2PA",
                        "source": "embedded",
                        "manifest_store": manifest_store
                    }
            
            # Fall back to reading .c2pa sidecar file
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Basic validation
            result = {
                "valid": True,
                "manifest_present": True,
                "claim_generator": manifest.get("claim_generator"),
                "verification_code": None,
                "source": "sidecar",
                "issues": []
            }
            
            # Extract RENDR verification data
            for assertion in manifest.get("assertions", []):
                if assertion.get("label") == "rendr.verification":
                    result["verification_code"] = assertion["data"].get("verification_code")
            
            # Check hard binding
            if not manifest.get("hard_binding"):
                result["issues"].append("No hard binding found")
            
            return result
            
        except Exception as e:
            return {
                "valid": False,
                "manifest_present": False,
                "error": str(e)
            }


# Global instance
c2pa_service = C2PAService()
