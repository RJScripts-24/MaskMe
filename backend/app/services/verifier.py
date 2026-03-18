import torch
from torchvision import models
from PIL import Image
from app.services.image_processor import get_preprocessor
from app.core.config import settings
from torchvision import transforms

class Verifier:
    _model = None
    _categories = None
    _category_to_idx = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            device = torch.device(settings.DEVICE)
            weights = models.MobileNet_V2_Weights.IMAGENET1K_V2
            cls._model = models.mobilenet_v2(weights=weights)
            cls._model.to(device)
            cls._model.eval()
            cls._categories = weights.meta["categories"]
            cls._category_to_idx = {name: idx for idx, name in enumerate(cls._categories)}
        return cls._model

    @classmethod
    def _predict_mobilenet(cls, image: Image.Image):
        device = torch.device(settings.DEVICE)
        model = cls.get_model()
        preprocess = get_preprocessor()

        input_tensor = preprocess(image).unsqueeze(0).to(device)
        with torch.no_grad():
            output = model(input_tensor)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)

        conf, index = torch.max(probabilities, 0)
        return {
            "label": cls._categories[index.item()],
            "confidence": float(conf.item()),
            "probabilities": probabilities,
        }

    @classmethod
    def verify_image(cls, image: Image.Image):
        prediction = cls._predict_mobilenet(image)

        return {
            "label": prediction["label"],
            "confidence": prediction["confidence"] * 100
        }

    @classmethod
    def evaluate_transfer_risk(cls, image: Image.Image, original_label: str):
        from app.services.attack_engine import attack_engine

        device = torch.device(settings.DEVICE)
        preprocess = get_preprocessor()
        input_tensor = preprocess(image).unsqueeze(0).to(device)

        # ResNet50 (attack model)
        with torch.no_grad():
            output_resnet = attack_engine.model(input_tensor)
            probs_resnet = torch.nn.functional.softmax(output_resnet[0], dim=0)
        resnet_conf, resnet_idx = torch.max(probs_resnet, 0)
        resnet_label = attack_engine.class_names[resnet_idx.item()]
        resnet_orig_conf = 0.0
        if original_label in attack_engine.class_names:
            resnet_orig_conf = float(probs_resnet[attack_engine.class_names.index(original_label)].item())

        # MobileNetV2 (independent verifier)
        mobile = cls._predict_mobilenet(image)
        mobile_orig_conf = 0.0
        if cls._category_to_idx and original_label in cls._category_to_idx:
            mobile_orig_conf = float(mobile["probabilities"][cls._category_to_idx[original_label]].item())

        mean_top1_conf = (float(resnet_conf.item()) + float(mobile["confidence"])) / 2.0
        mean_original_conf = (resnet_orig_conf + mobile_orig_conf) / 2.0
        agreement_bonus = 0.10 if resnet_label == mobile["label"] else 0.0

        score = min(100.0, max(0.0, (mean_top1_conf * 0.35 + mean_original_conf * 0.55 + agreement_bonus) * 100.0))
        level = "low" if score < 35 else "medium" if score < 65 else "high"

        return {
            "score": round(score, 1),
            "level": level,
            "note": "Lower is better. Score estimates cross-model semantic leakage risk.",
            "models": {
                "resnet50": {
                    "top1_label": resnet_label,
                    "top1_confidence": round(float(resnet_conf.item()) * 100, 2),
                    "original_label_confidence": round(resnet_orig_conf * 100, 2),
                },
                "mobilenet_v2": {
                    "top1_label": mobile["label"],
                    "top1_confidence": round(float(mobile["confidence"]) * 100, 2),
                    "original_label_confidence": round(mobile_orig_conf * 100, 2),
                },
            },
        }

    @classmethod
    def harden_for_transfer(
        cls,
        image: Image.Image,
        *,
        epsilon: float = 0.10,
        steps: int = 8,
        alpha: float = 0.015,
    ) -> Image.Image:
        """Create a transfer-oriented adversarial variant using an ensemble of ResNet50 + MobileNetV2.

        This maximizes prediction entropy (uncertainty) on both models while constraining perturbation
        in normalized pixel space so the image remains human-readable.
        """
        from app.services.attack_engine import attack_engine

        device = torch.device(settings.DEVICE)
        preprocess = get_preprocessor()

        # Normalized tensor in ImageNet space.
        x0 = preprocess(image.convert("RGB")).unsqueeze(0).to(device)
        x = x0.clone().detach()

        resnet = attack_engine.model
        mobilenet = cls.get_model()

        for _ in range(steps):
            x.requires_grad_(True)

            out_res = resnet(x)
            out_mob = mobilenet(x)

            p_res = torch.nn.functional.softmax(out_res, dim=1)
            p_mob = torch.nn.functional.softmax(out_mob, dim=1)

            entropy_res = -(p_res * torch.log(p_res + 1e-8)).sum(dim=1).mean()
            entropy_mob = -(p_mob * torch.log(p_mob + 1e-8)).sum(dim=1).mean()

            # Add top-1 confidence suppression so shapes become less machine-identifiable.
            top1_res = torch.max(p_res, dim=1).values.mean()
            top1_mob = torch.max(p_mob, dim=1).values.mean()

            objective = entropy_res + entropy_mob - 0.25 * (top1_res + top1_mob)

            if x.grad is not None:
                x.grad.zero_()
            resnet.zero_grad(set_to_none=True)
            mobilenet.zero_grad(set_to_none=True)

            objective.backward()
            grad_sign = x.grad.detach().sign()

            with torch.no_grad():
                x = x + alpha * grad_sign
                delta = torch.clamp(x - x0, min=-epsilon, max=epsilon)
                x = (x0 + delta).detach()

        # De-normalize back to RGB image.
        mean = torch.tensor([0.485, 0.456, 0.406], device=device).view(1, 3, 1, 1)
        std = torch.tensor([0.229, 0.224, 0.225], device=device).view(1, 3, 1, 1)
        out = torch.clamp(x * std + mean, 0.0, 1.0).squeeze(0).cpu()
        return transforms.ToPILImage()(out)
