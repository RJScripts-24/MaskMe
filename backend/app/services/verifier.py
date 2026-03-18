import torch
from torchvision import models
from PIL import Image
from app.services.image_processor import get_preprocessor
from app.core.config import settings

class Verifier:
    _model = None
    _categories = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            device = torch.device(settings.DEVICE)
            weights = models.MobileNet_V2_Weights.IMAGENET1K_V2
            cls._model = models.mobilenet_v2(weights=weights)
            cls._model.to(device)
            cls._model.eval()
            cls._categories = weights.meta["categories"]
        return cls._model

    @classmethod
    def verify_image(cls, image: Image.Image):
        device = torch.device(settings.DEVICE)
        model = cls.get_model()
        preprocess = get_preprocessor()

        input_tensor = preprocess(image).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)

        conf, index = torch.max(probabilities, 0)
        label = cls._categories[index.item()]

        return {
            "label": label,
            "confidence": float(conf.item()) * 100
        }
