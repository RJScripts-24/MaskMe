import { API_ENDPOINTS, ShieldResponse, HTTPValidationError } from '../types/api';

/**
 * API Service for communicating with the Face-Shield backend
 * Implements the API contract defined in api_contract.json
 */

// Get API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: HTTPValidationError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Cloak/protect an image using adversarial perturbations
 * POST /api/v1/shield/cloak
 * @param file - Image file to protect (JPEG/PNG)
 * @param epsilon - Perturbation strength (default: 0.03)
 * @param attackType - Attack algorithm: "FGSM" or "PGD" (default: "FGSM")
 * @returns ShieldResponse with protected image and confidence scores
 */
export async function cloakImage(
  file: File,
  epsilon: number = 0.03,
  attackType: string = "FGSM"
): Promise<ShieldResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('epsilon', epsilon.toString());
  formData.append('attack_type', attackType);

  const url = new URL(API_ENDPOINTS.CLOAK_IMAGE, API_BASE_URL);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 422) {
        const error: HTTPValidationError = await response.json();
        throw new ApiError(
          'Validation error',
          422,
          error
        );
      }
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data: ShieldResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Check API health status
 * GET /api/v1/health/
 * @returns Health check response
 */
export async function healthCheck(): Promise<{ status: string }> {
  const url = new URL(API_ENDPOINTS.HEALTH_CHECK, API_BASE_URL);

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new ApiError(
        `Health check failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Get root endpoint
 * GET /
 */
export async function getRoot(): Promise<any> {
  const url = new URL(API_ENDPOINTS.ROOT, API_BASE_URL);

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new ApiError(
        `Root endpoint failed: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Test robustness of cloaked image under real-world conditions
 * POST /api/v1/shield/robustness
 * @param file - Cloaked image file to test
 * @param testType - Type of test: "jpeg", "blur", or "resize"
 * @returns Robustness test result with new confidence and transformed image
 */
export async function testRobustness(
  file: File,
  testType: 'jpeg' | 'blur' | 'resize'
): Promise<{
  status: string;
  new_label: string;
  new_confidence: number;
  transformed_image: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('test_type', testType);

  const url = new URL('/api/v1/shield/robustness', API_BASE_URL);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 422) {
        const error: HTTPValidationError = await response.json();
        throw new ApiError(
          'Validation error',
          422,
          error
        );
      }
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

// Export API base URL for reference
export { API_BASE_URL };
