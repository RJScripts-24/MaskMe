import torch
from torchvision import models
from app.core.config import settings

class ModelLoader:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            device = torch.device(settings.DEVICE)
            cls._model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V1)
            cls._model.to(device)
            cls._model.eval()
        return cls._model