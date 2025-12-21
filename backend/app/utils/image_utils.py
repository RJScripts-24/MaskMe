import io
import base64
from PIL import Image
from fastapi import UploadFile

async def read_image_file(file: UploadFile) -> Image.Image:
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    return image.convert("RGB")

def image_to_base64(image: Image.Image) -> str:
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str