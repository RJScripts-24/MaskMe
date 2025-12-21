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
  cloaked_image: string; // base64 encoded image
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

// API endpoints
export const API_ENDPOINTS = {
  CLOAK_IMAGE: '/api/v1/shield/cloak',
  HEALTH_CHECK: '/api/v1/health/',
  ROOT: '/',
} as const;
