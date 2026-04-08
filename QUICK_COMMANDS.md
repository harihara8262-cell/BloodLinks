# BloodConnect - Copy-Paste Quick Commands

## 🚀 One-Line Launcher (Pick One)

### Automatic Launch (Recommended)
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks && setup_and_run.bat
```

### Verify Setup First
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks && verify_setup.bat
```

### Health Check
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks && health_check.bat
```

---

## 🎯 Manual Launch Commands

### Terminal 1: Start Backend
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2: Start Frontend
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run dev
```

---

## 📱 Access URLs (After Launch)

```
Frontend App:     http://127.0.0.1:3002
Backend API:      http://127.0.0.1:8000
API Docs:         http://127.0.0.1:8000/docs
ReDoc:            http://127.0.0.1:8000/redoc
Health Check:     http://127.0.0.1:8000/health
```

---

## 🔧 Maintenance Commands

### Install Backend Dependencies
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
call venv\Scripts\activate.bat
python -m pip install -r requirements.txt
```

### Install Frontend Dependencies
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm install
```

### Build Frontend for Production
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run build
```

### Run Frontend Preview
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run preview
```

---

## 🧪 API Testing

### Test Backend Health
```bash
curl http://127.0.0.1:8000/health
```

### List All Available Endpoints
```bash
curl http://127.0.0.1:8000/openapi.json
```

### Register a Donor (Example)
```bash
curl -X POST http://127.0.0.1:8000/api/donor/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "blood_group": "O+",
    "gender": "M",
    "date_of_birth": "1990-01-01",
    "address": "123 Main St",
    "city": "New York",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone": "+1234567890"
  }'
```

### Search Nearby Donors (Example)
```bash
curl "http://127.0.0.1:8000/api/donor/nearby?blood=O%2B&lat=40.7128&lng=-74.0060&radius=10"
```

---

## 📚 Documentation Files

```
STARTUP_GUIDE.md         - Complete startup instructions
EXECUTION_SUMMARY.md     - Technical reference
SETUP_COMPLETE.md        - Setup verification document
QUICK_COMMANDS.md        - This file
```

---

## 🗂️ Project Directories

```
Backend:     C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
Frontend:    C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
Project:     C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks
```

---

## 💡 Tips

- **Auto-reload**: Backend and frontend both auto-reload on file changes
- **API Docs**: The Swagger UI at /docs is interactive - try endpoints directly
- **Dev Mode**: Both services run in development mode with debug output
- **CORS**: All local ports are whitelisted in CORS configuration
- **Hot Reload**: Frontend uses Vite for instant hot-module replacement

---

## ❌ Stopping Services

Just press **Ctrl+C** in each terminal window.

---

**BloodConnect v1.0.0 - Ready to Launch! 🩸**
