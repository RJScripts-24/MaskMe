from PIL import Image
from app.services.attack_engine import attack_engine

def test_attack_generation():
    dummy_image = Image.new('RGB', (224, 224), color='red')
    epsilon = 0.05
    
    result = attack_engine.process(dummy_image, epsilon)
    
    assert "original_confidence" in result
    assert "cloaked_confidence" in result
    assert "cloaked_image" in result
    assert isinstance(result["cloaked_image"], Image.Image)