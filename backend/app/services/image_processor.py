import torch
from torchvision import transforms
from PIL import Image

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

def get_preprocessor():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=MEAN, std=STD),
    ])

def deprocess_image(tensor: torch.Tensor) -> Image.Image:
    mean = torch.tensor(MEAN).view(3, 1, 1).to(tensor.device)
    std = torch.tensor(STD).view(3, 1, 1).to(tensor.device)
    
    tensor = tensor * std + mean
    tensor = torch.clamp(tensor, 0, 1)
    
    if tensor.dim() == 4:
        tensor = tensor.squeeze(0)
        
    return transforms.ToPILImage()(tensor.cpu())