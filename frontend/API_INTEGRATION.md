# Frontend API Integration Guide

## Overview
This frontend application has been optimized to integrate seamlessly with the Face-Shield backend API. The integration follows the OpenAPI 3.1.0 specification defined in `api_contract.json`.

## Changes Made

### 1. **Type Definitions** (`src/types/api.ts`)
- Created TypeScript interfaces matching the backend API contract
- Defined `ShieldResponse`, `CloakImageRequest`, validation error types
- Exported API endpoint constants

### 2. **API Service Layer** (`src/services/api.ts`)
- Implemented `cloakImage()` function for POST `/api/v1/shield/cloak`
- Implemented `healthCheck()` function for GET `/api/v1/health/`
- Added proper error handling with custom `ApiError` class
- Configured to read API base URL from environment variables

### 3. **Component Updates**

#### **UploadPage.tsx**
- Added state management for API responses and errors
- Integrated file upload with API service
- Added error display for validation and network errors
- Now passes actual File objects to ProcessingScreen

#### **ProcessingScreen.tsx**
- Converted from mock simulation to real API calls
- Calls `cloakImage()` with uploaded file and epsilon parameter
- Shows real-time processing status
- Handles API errors and passes them to parent component

#### **ResultScreen.tsx**
- Now accepts and displays actual API response data
- Shows original confidence vs cloaked confidence percentages
- Calculates and displays protection effectiveness percentage
- Updated status cards with real metrics from backend

### 4. **Environment Configuration**
- Created `.env` and `.env.example` files
- Added `VITE_API_BASE_URL` variable (default: `http://localhost:8000`)
- Created `.gitignore` to protect sensitive environment files

## API Endpoints Used

### POST `/api/v1/shield/cloak`
**Purpose**: Cloak/protect an image with adversarial perturbations

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (binary image file)
- Query params: `epsilon` (optional, default: 0.03)

**Response**:
```json
{
  "status": "success",
  "original_confidence": 0.95,
  "cloaked_confidence": 0.12,
  "cloaked_image": "base64_encoded_image_data"
}
```

### GET `/api/v1/health/`
**Purpose**: Check API health status

**Response**: Status object

## Environment Setup

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Configure API URL**:
   - For local development: `VITE_API_BASE_URL=http://localhost:8000`
   - For production: Update to your production API URL

3. **Start the development server**:
   ```bash
   npm run dev
   ```

## Error Handling

The application handles the following error scenarios:

1. **Validation Errors (422)**:
   - Invalid file format
   - Missing required fields
   - Displays detailed error messages to user

2. **Network Errors**:
   - Connection timeout
   - Server unavailable
   - Shows user-friendly error messages

3. **File Type Validation**:
   - Only JPEG and PNG files are accepted
   - Validated before upload

## Testing the Integration

### Prerequisites
1. Backend API must be running on the configured URL
2. API must implement the contract defined in `api_contract.json`

### Testing Steps
1. Start the backend API server
2. Start the frontend dev server: `npm run dev`
3. Upload a JPEG or PNG image with a face
4. Click "Mask Photo" button
5. Wait for processing (actual API call)
6. View results with real confidence scores

### Expected Behavior
- Upload screen accepts files via drag-drop or browse
- Processing screen shows real-time status from API
- Result screen displays:
  - Original confidence percentage
  - Cloaked confidence percentage
  - Protection effectiveness calculation
  - Downloadable protected image

## API Integration Flow

```
User Uploads Image
     ↓
UploadPage (stores File object)
     ↓
User Clicks "Mask Photo"
     ↓
ProcessingScreen
     ↓
cloakImage(file, epsilon) API call
     ↓
Backend processes image
     ↓
ShieldResponse received
     ↓
ResultScreen displays metrics
     ↓
User downloads protected image
```

## Type Safety

All API interactions are fully typed with TypeScript:
- Request parameters are validated at compile time
- Response data is type-checked
- Error handling is type-safe

## Future Enhancements

Potential improvements:
- Add retry logic for failed API calls
- Implement request cancellation
- Add progress indicators for large files
- Cache health check results
- Add support for batch processing
- Implement WebSocket for real-time progress updates

## Troubleshooting

### CORS Errors
If you encounter CORS errors, ensure the backend API has proper CORS headers configured for the frontend origin.

### Connection Refused
Verify:
1. Backend API is running
2. `VITE_API_BASE_URL` in `.env` is correct
3. No firewall blocking the connection

### 422 Validation Errors
Check:
1. File format is JPEG or PNG
2. File is not corrupted
3. File contains a face (if backend requires face detection)

## Contact

For backend API issues, refer to the backend documentation.
For frontend integration issues, check the browser console for detailed error messages.
