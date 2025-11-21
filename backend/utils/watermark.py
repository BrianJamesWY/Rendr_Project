import subprocess
import os
from PIL import Image, ImageDraw, ImageFont
from typing import Optional

class WatermarkProcessor:
    def __init__(self):
        self.logo_path = "/app/backend/assets/rendr_logo.png"
        self.temp_dir = "/app/backend/uploads/watermarks"
        os.makedirs(self.temp_dir, exist_ok=True)
    
    def create_watermark_overlay(
        self,
        username: str,
        position: str = "left",
        tier: str = "free",
        verification_code: str = None
    ) -> str:
        """
        Create a vertical watermark overlay image with logo, username, and verification code.
        Returns path to the overlay image.
        
        Args:
            username: Creator's username
            position: left, right, top, bottom (free tier only supports left)
            tier: free, pro, enterprise
            verification_code: Verification code to display (optional)
        """
        # Free tier only gets left position
        if tier == "free":
            position = "left"
        
        # Create a transparent image for the watermark
        # We'll make it tall and narrow for vertical text
        overlay_width = 80  # Width of vertical bar
        overlay_height = 500  # Height to accommodate logo + text + code
        
        overlay = Image.new('RGBA', (overlay_width, overlay_height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)
        
        current_y = 10
        
        # Draw username text vertically FIRST (at top)
        # Remove @ symbol if present
        text = username.lstrip('@')
        
        # Use a default font
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
            code_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
        except:
            font = ImageFont.load_default()
            code_font = ImageFont.load_default()
        
        # Create temporary image for horizontal text (username)
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        text_img = Image.new('RGBA', (text_width + 20, text_height + 20), (0, 0, 0, 0))
        text_draw = ImageDraw.Draw(text_img)
        text_draw.text((10, 10), text, fill=(255, 255, 255, 200), font=font)
        
        # Rotate text 90 degrees counter-clockwise (bottom to top, letters face left)
        text_img = text_img.rotate(90, expand=True)
        
        # Paste rotated text at top
        text_x = (overlay_width - text_img.width) // 2
        overlay.paste(text_img, (text_x, current_y), text_img)
        
        current_y += text_img.height + 5
        
        # Draw verification code (if provided) BETWEEN username and logo
        if verification_code:
            code_bbox = draw.textbbox((0, 0), verification_code, font=code_font)
            code_width = code_bbox[2] - code_bbox[0]
            code_height = code_bbox[3] - code_bbox[1]
            
            code_img = Image.new('RGBA', (code_width + 20, code_height + 20), (0, 0, 0, 0))
            code_draw = ImageDraw.Draw(code_img)
            code_draw.text((10, 10), verification_code, fill=(255, 255, 255, 200), font=code_font)
            
            # Rotate code 90 degrees counter-clockwise
            code_img = code_img.rotate(90, expand=True)
            
            # Paste rotated code
            code_x = (overlay_width - code_img.width) // 2
            overlay.paste(code_img, (code_x, current_y), code_img)
            
            current_y += code_img.height + 5
        
        # Load and resize logo (BELOW username)
        try:
            logo = Image.open(self.logo_path).convert('RGBA')
            
            # Remove white background - make it transparent
            logo_data = logo.getdata()
            new_data = []
            for item in logo_data:
                # If pixel is white or near-white, make it transparent
                if item[0] > 200 and item[1] > 200 and item[2] > 200:
                    new_data.append((255, 255, 255, 0))  # Transparent
                else:
                    new_data.append(item)
            logo.putdata(new_data)
            
            # Resize logo to fit width
            logo_size = 60
            logo.thumbnail((logo_size, logo_size), Image.Resampling.LANCZOS)
            
            # Paste logo below username
            logo_x = (overlay_width - logo.width) // 2
            overlay.paste(logo, (logo_x, current_y), logo)
            
        except Exception as e:
            print(f"Error loading logo: {e}")
        
        # Save overlay
        overlay_filename = f"watermark_{username}_{position}.png"
        overlay_path = os.path.join(self.temp_dir, overlay_filename)
        overlay.save(overlay_path)
        
        return overlay_path
    
    def apply_watermark(
        self,
        input_video_path: str,
        output_video_path: str,
        username: str,
        position: str = "left",
        tier: str = "free"
    ) -> bool:
        """
        Apply watermark to video using ffmpeg.
        
        Args:
            input_video_path: Path to input video
            output_video_path: Path for output video
            username: Creator's username
            position: Watermark position (left/right/top/bottom)
            tier: User tier
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Create watermark overlay
            watermark_path = self.create_watermark_overlay(username, position, tier)
            
            # Position calculations for ffmpeg overlay filter
            if position == "left":
                x_position = "10"
                y_position = "(main_h-overlay_h)/2"
            elif position == "right":
                x_position = "main_w-overlay_w-10"
                y_position = "(main_h-overlay_h)/2"
            elif position == "top":
                x_position = "(main_w-overlay_w)/2"
                y_position = "10"
            elif position == "bottom":
                x_position = "(main_w-overlay_w)/2"
                y_position = "main_h-overlay_h-10"
            else:
                x_position = "10"
                y_position = "(main_h-overlay_h)/2"
            
            # FFmpeg command to overlay watermark
            cmd = [
                'ffmpeg',
                '-i', input_video_path,
                '-i', watermark_path,
                '-filter_complex',
                f'[1:v]format=rgba[wm];[0:v][wm]overlay={x_position}:{y_position}',
                '-codec:a', 'copy',  # Copy audio without re-encoding
                '-y',  # Overwrite output file
                output_video_path
            ]
            
            # Run ffmpeg
            result = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=120
            )
            
            if result.returncode == 0:
                print(f"✅ Watermark applied successfully to {output_video_path}")
                # Clean up temporary watermark
                os.remove(watermark_path)
                return True
            else:
                print(f"❌ FFmpeg error: {result.stderr.decode()}")
                return False
                
        except Exception as e:
            print(f"❌ Error applying watermark: {str(e)}")
            return False
    
    def get_allowed_positions(self, tier: str) -> list:
        """Get allowed watermark positions for a tier"""
        if tier == "free":
            return ["left"]
        elif tier in ["pro", "enterprise"]:
            return ["left", "right", "top", "bottom"]
        return ["left"]
