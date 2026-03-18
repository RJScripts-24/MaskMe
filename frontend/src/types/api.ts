/**
 * TypeScript types matching the backend API contract
 * Based on api_contract.json OpenAPI specification
 */

// Request types
export interface CloakImageRequest {
  file: File;
  epsilon?: number; // default: 0.03
}

// Response types
export interface ShieldResponse {
  status: string;
  original_confidence: number;
  cloaked_confidence: number;
  original_label: string;
  cloaked_label: string;
  cloaked_image: string; // base64 encoded image
  noise_map?: string; // base64 encoded noise image for X-Ray Mode
}

// Error types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface VerifyResponse {
  label: string;
  confidence: number;
}

// API endpoints
export const API_ENDPOINTS = {
  CLOAK_IMAGE: '/api/v1/shield/cloak',
  VERIFY_MASKING: '/api/v1/shield/verify',
  HEALTH_CHECK: '/api/v1/health/',
  ROOT: '/',
} as const;
