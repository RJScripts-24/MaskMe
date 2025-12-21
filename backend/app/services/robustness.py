"""
Robustness Testing Module

This module provides tools to test the robustness of adversarial attacks
by simulating real-world conditions like image compression, blur, and resize operations.
"""

from PIL import Image, ImageFilter
from io import BytesIO
from typing import Literal
from app.utils.logger import get_logger

logger = get_logger(__name__)

TestType = Literal["jpeg", "blur", "resize"]


class RobustnessTester:
    """
    A class to apply various transformations to test adversarial attack robustness.
    
    This class simulates real-world conditions that might affect adversarial perturbations:
    - JPEG compression (common in social media and messaging apps)
    - Gaussian blur (motion blur or camera focus issues)
    - Resize operations (image scaling during uploads)
    """
    
    def __init__(self):
        logger.info("RobustnessTester initialized")
    
    def apply_compression(self, image: Image.Image, quality: int = 50) -> Image.Image:
        """
        Apply JPEG compression to simulate real-world image sharing.
        
        JPEG compression is lossy and can potentially remove subtle adversarial perturbations.
        Common platforms like WhatsApp, Facebook, and Instagram apply compression to uploaded images.
        
        Args:
            image: PIL Image object to compress
            quality: JPEG quality factor (1-100, lower = more compression, default 50)
            
        Returns:
            Compressed PIL Image object
        """
        logger.info(f"Applying JPEG compression with quality={quality}")
        
        # Convert to RGB if necessary (JPEG doesn't support RGBA)
        if image.mode in ('RGBA', 'P'):
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = rgb_image
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save to BytesIO buffer with compression, then reload
        buffer = BytesIO()
        image.save(buffer, format='JPEG', quality=quality)
        buffer.seek(0)
        compressed_image = Image.open(buffer).copy()
        buffer.close()
        
        logger.info("JPEG compression applied successfully")
        return compressed_image
    
    def apply_blur(self, image: Image.Image, radius: float = 2.0) -> Image.Image:
        """
        Apply Gaussian blur to simulate motion or focus issues.
        
        Blur can smooth out adversarial perturbations, potentially reducing attack effectiveness.
        This simulates camera motion blur, out-of-focus images, or intentional blur filters.
        
        Args:
            image: PIL Image object to blur
            radius: Blur radius (default 2.0, higher = more blur)
            
        Returns:
            Blurred PIL Image object
        """
        logger.info(f"Applying Gaussian blur with radius={radius}")
        
        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=radius))
        
        logger.info("Gaussian blur applied successfully")
        return blurred_image
    
    def apply_resize(self, image: Image.Image, scale: float = 0.5) -> Image.Image:
        """
        Resize image down and back up to simulate low-resolution uploads.
        
        Many platforms resize images to save bandwidth and storage. This downsampling
        and upsampling process can remove fine-grained adversarial noise.
        
        Args:
            image: PIL Image object to resize
            scale: Scale factor for downsampling (default 0.5 = 50% size)
            
        Returns:
            Resized PIL Image object (back to original dimensions)
        """
        logger.info(f"Applying resize transformation with scale={scale}")
        
        original_size = image.size
        
        # Calculate intermediate size
        intermediate_width = int(original_size[0] * scale)
        intermediate_height = int(original_size[1] * scale)
        
        # Downscale
        downscaled = image.resize(
            (intermediate_width, intermediate_height),
            Image.Resampling.LANCZOS
        )
        
        # Upscale back to original size
        resized_image = downscaled.resize(
            original_size,
            Image.Resampling.LANCZOS
        )
        
        logger.info(f"Resize transformation applied: {original_size} -> ({intermediate_width}, {intermediate_height}) -> {original_size}")
        return resized_image
    
    def process_test(self, image: Image.Image, test_type: TestType) -> Image.Image:
        """
        Apply the specified robustness test to the image.
        
        This is the main entry point for robustness testing. It routes to the appropriate
        transformation method based on the test type.
        
        Args:
            image: PIL Image object to test
            test_type: Type of test to apply ("jpeg", "blur", or "resize")
            
        Returns:
            Transformed PIL Image object
            
        Raises:
            ValueError: If test_type is not recognized
        """
        logger.info(f"Processing robustness test: {test_type}")
        
        if test_type == "jpeg":
            return self.apply_compression(image, quality=50)
        elif test_type == "blur":
            return self.apply_blur(image, radius=2.0)
        elif test_type == "resize":
            return self.apply_resize(image, scale=0.5)
        else:
            error_msg = f"Unknown test type: {test_type}. Must be 'jpeg', 'blur', or 'resize'."
            logger.error(error_msg)
            raise ValueError(error_msg)


# Singleton instance
robustness_tester = RobustnessTester()
