import torch
import torch.nn as nn
from torchvision import models, transforms
from torchvision.models import ResNet50_Weights
from PIL import Image
from app.core.config import settings

class AttackEngine:
    def __init__(self):
        self.device = torch.device(settings.DEVICE)
        self.weights = ResNet50_Weights.IMAGENET1K_V1
        self.model = models.resnet50(weights=self.weights)
        self.model.to(self.device)
        self.model.eval()
        
        # Get ImageNet class names
        self.class_names = self.weights.meta["categories"]
        
        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _get_prediction(self, tensor):
        with torch.no_grad():
            output = self.model(tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            confidence, label = torch.max(probabilities, 0)
            return confidence.item(), label.item()

    def _deprocess(self, tensor):
        mean = torch.tensor([0.485, 0.456, 0.406]).to(self.device).view(3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225]).to(self.device).view(3, 1, 1)
        
        tensor = tensor * std + mean
        tensor = torch.clamp(tensor, 0, 1)
        
        return transforms.ToPILImage()(tensor.cpu().squeeze(0))

    def process(self, image: Image.Image, epsilon: float):
        original_tensor = self.preprocess(image).unsqueeze(0).to(self.device)
        original_tensor.requires_grad = True

        output = self.model(original_tensor)
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        orig_conf, target_label = torch.max(probabilities, 0)
        
        criterion = nn.CrossEntropyLoss()
        loss = criterion(output, torch.tensor([target_label]).to(self.device))
        
        self.model.zero_grad()
        loss.backward()
        
        data_grad = original_tensor.grad.data
        sign_data_grad = data_grad.sign()
        
        perturbed_image = original_tensor + epsilon * sign_data_grad
        
        cloaked_conf, cloaked_idx = self._get_prediction(perturbed_image)
        final_image = self._deprocess(perturbed_image)
        
        # Get class names
        original_idx = target_label.item()
        original_label = self.class_names[original_idx]
        cloaked_label = self.class_names[cloaked_idx]
        
        return {
            "original_confidence": round(orig_conf.item(), 4),
            "cloaked_confidence": round(cloaked_conf, 4),
            "original_label": original_label,
            "cloaked_label": cloaked_label,
            "cloaked_image": final_image
        }

attack_engine = AttackEngine()