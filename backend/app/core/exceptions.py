from fastapi import HTTPException, status

class FileProcessingError(HTTPException):
    def __init__(self, detail: str = "Could not process image file"):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, 
            detail=detail
        )

class ModelInferenceError(HTTPException):
    def __init__(self, detail: str = "AI model failed to generate noise"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=detail
        )