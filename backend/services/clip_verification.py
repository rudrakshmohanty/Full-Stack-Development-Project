import torch
import clip
from PIL import Image
import io
import base64

class ClipVerificationService:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading CLIP model on {self.device}...")
        self.model, self.preprocess = clip.load("ViT-B/32", device=self.device)
        print("CLIP model loaded successfully!")

    def _process_image(self, image_data):
        """Helper function to process image data into CLIP format"""
        if isinstance(image_data, str):
            # Handle base64 string
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)
        else:
            # Handle direct bytes
            image_bytes = image_data
        
        image = Image.open(io.BytesIO(image_bytes))
        image_input = self.preprocess(image).unsqueeze(0).to(self.device)
        return image_input, image.size

    def compare_images(self, image1_data, image2_data):
        """
        Compare two images using CLIP embeddings and cosine similarity
        :param image1_data: First image (base64 or bytes)
        :param image2_data: Second image (base64 or bytes)
        :return: Dictionary containing similarity score and debug info
        """
        try:
            # Process both images
            image1_input, size1 = self._process_image(image1_data)
            image2_input, size2 = self._process_image(image2_data)
            
            # Get image embeddings
            with torch.no_grad():
                image1_features = self.model.encode_image(image1_input)
                image2_features = self.model.encode_image(image2_input)
                
                # Normalize embeddings
                image1_features = image1_features / image1_features.norm(dim=-1, keepdim=True)
                image2_features = image2_features / image2_features.norm(dim=-1, keepdim=True)
                
                # Calculate cosine similarity
                similarity = float((image1_features @ image2_features.T)[0][0])
            
            # Print debug information
            print("\n=== CLIP Image Comparison Results ===")
            print(f"Image 1 size: {size1}")
            print(f"Image 2 size: {size2}")
            print(f"Similarity score: {similarity:.4f}")
            print("===================================\n")
            
            return {
                'success': True,
                'similarity_score': similarity,
                'debug_info': {
                    'image1_size': size1,
                    'image2_size': size2
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Initialize the service (singleton)
clip_service = ClipVerificationService()
