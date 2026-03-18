# MaskMe Backend

FastAPI backend for MaskMe image cloaking and verification workflows.

## Run locally

1. Create and activate a Python virtual environment.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Add required environment variables in `.env` (or export them in your shell):
	- `MONGODB_URL`
	- `GOOGLE_CLIENT_ID`
	- `GOOGLE_CLIENT_SECRET`
	- `SECRET_KEY`
	- Optional: `BACKEND_CORS_ORIGINS` (comma-separated or JSON-style list)

4. Start server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Deploy on Render

This backend is configured for Render using either dashboard settings or `render.yaml`.

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/v1/health/`

Set environment variables in Render:
- `MONGODB_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SECRET_KEY`
- `BACKEND_CORS_ORIGINS` (example: `https://your-frontend.onrender.com,http://localhost:3000`)

## Notes

- The backend keeps localhost CORS defaults for development.
- Model weights are loaded lazily on first inference request to reduce cold-start pressure.
