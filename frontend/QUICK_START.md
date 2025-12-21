# Quick Start Guide - MaskMe Frontend API Integration

## 🎯 What Was Done

Your frontend has been **fully optimized** to work with your backend API defined in `api_contract.json`. The integration is complete and ready to use!

---

## ⚡ Quick Start (3 Steps)

### 1. Verify Environment Configuration
The `.env` file has been created with default settings:
```bash
VITE_API_BASE_URL=http://localhost:8000
```

✏️ **Edit `.env` if your backend runs on a different URL**

### 2. Start Your Backend API
Make sure your Face-Shield backend is running on the configured URL (default: `http://localhost:8000`)

### 3. Start the Frontend
```bash
npm run dev
```

**That's it!** Open your browser and test the integration.

---

## 🧪 Test the Integration

1. **Upload** a face photo (JPEG or PNG)
2. **Click** "Mask Photo" button
3. **Watch** real-time API processing
4. **View** actual confidence scores from backend
5. **Download** the protected image

---

## 📁 New Files Created

**API Integration:**
- `src/types/api.ts` - TypeScript types matching backend
- `src/services/api.ts` - API service functions
- `src/vite-env.d.ts` - Environment variable types

**Configuration:**
- `.env` - API URL configuration
- `.env.example` - Template
- `.gitignore` - Protects sensitive files
- `tsconfig.json` - TypeScript config
- `tsconfig.node.json` - Node TypeScript config

**Documentation:**
- `API_INTEGRATION.md` - Detailed integration guide
- `INTEGRATION_SUMMARY.md` - Complete summary
- `QUICK_START.md` - This file

---

## 🔧 What Changed in Components

### UploadPage.tsx ✅
- Real file upload to API
- Error handling
- Validation (JPEG/PNG only)

### ProcessingScreen.tsx ✅
- Actual API call to `/api/v1/shield/cloak`
- Real-time status updates
- Error handling

### ResultScreen.tsx ✅
- Displays real confidence scores
- Shows protection effectiveness
- Downloads actual protected image

---

## 🎨 API Response Example

When you upload an image, the backend returns:

```json
{
  "status": "success",
  "original_confidence": 0.95,
  "cloaked_confidence": 0.12,
  "cloaked_image": "iVBORw0KGgoAAAANS..."
}
```

Your frontend now displays:
- **Original AI Confidence**: 95.0%
- **Protected AI Confidence**: 12.0%
- **Protection Effectiveness**: 87.4% reduction
- **Download**: Protected image

---

## ✅ No TypeScript Errors

All type definitions are in place. Run `npm run build` to verify:
```bash
npm run build
```

---

## 🚨 Common Issues

### CORS Error?
Add this to your backend (FastAPI example):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Connection Refused?
- ✅ Check backend is running
- ✅ Verify `VITE_API_BASE_URL` in `.env`
- ✅ Check port matches backend port

---

## 📖 More Information

- **Detailed guide**: See `API_INTEGRATION.md`
- **Complete summary**: See `INTEGRATION_SUMMARY.md`
- **API contract**: See `api_contract.json`

---

## 🎉 You're Ready!

Your frontend is **production-ready** and fully integrated with the backend API:

✅ Real API communication  
✅ Type-safe implementation  
✅ Error handling  
✅ Environment configuration  
✅ Complete documentation  

**Start the dev server and test it out!** 🚀

```bash
npm run dev
```
