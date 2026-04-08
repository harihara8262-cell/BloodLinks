# 🩸 BloodConnect - Blood Donor Discovery Platform

> A smart, real-time blood donor finder application connecting donors with recipients in need of urgent transfusions.

## 🚀 Quick Start

### One-Click Launch
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks
setup_and_run.bat
```

Then open:
- **Frontend**: http://127.0.0.1:3002
- **API Docs**: http://127.0.0.1:8000/docs

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** | Complete startup instructions |
| **[EXECUTION_SUMMARY.md](EXECUTION_SUMMARY.md)** | Technical reference & API docs |
| **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** | Setup verification & features |
| **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** | Copy-paste command reference |
| **[SETUP_REPORT.md](SETUP_REPORT.md)** | Final setup report |

---

## 💻 Technology Stack

### Backend
- **FastAPI** 0.109.0 - REST API Framework
- **Uvicorn** 0.27.0 - ASGI Server
- **Supabase** 2.3.4 - PostgreSQL Database
- **Python** 3.8+

### Frontend
- **React** 18.2.0 - UI Framework
- **Vite** 5.0.0 - Build Tool
- **Tailwind CSS** 3.3.6 - Styling
- **Leaflet** 1.9.4 - Maps
- **Node** 16+

### Database
- **Supabase** (PostgreSQL + PostGIS)
- Real-time updates
- Geospatial queries

---

## 🎯 Features

✅ **Smart Donor Discovery** - Find compatible blood donors nearby using GPS  
✅ **User Profiles** - Comprehensive donor and recipient profiles  
✅ **Email Verification** - Secure email confirmation system  
✅ **Real-time Location** - Live geolocation matching  
✅ **Interactive Maps** - Leaflet maps showing donor locations  
✅ **Modern UI** - Responsive design with animations  
✅ **Secure Auth** - JWT-based authentication  

---

## 📡 Service URLs

| Service | URL |
|---------|-----|
| Frontend App | http://127.0.0.1:3002 |
| Backend API | http://127.0.0.1:8000 |
| API Docs | http://127.0.0.1:8000/docs |
| ReDoc | http://127.0.0.1:8000/redoc |
| Health Check | http://127.0.0.1:8000/health |

---

## 🔌 API Endpoints

### Donor Management
```
GET    /api/donor/nearby                    Find nearby blood donors
POST   /api/donor/register                  Register as a donor
GET    /api/donor/{id}                      Get donor details
PUT    /api/donor/{id}                      Update donor profile
```

### Authentication
```
POST   /api/auth/login                      User login
POST   /api/auth/register                   User registration
POST   /api/auth/logout                     User logout
```

### Email
```
POST   /api/email/send-verification         Send verification email
GET    /api/email/verify/{token}            Verify email token
```

---

## 🛠️ Manual Startup (If Needed)

### Terminal 1 - Backend
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal 2 - Frontend
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run dev
```

---

## 🗂️ Project Structure

```
BloodLinks/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── database.py                # Supabase connection
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # Environment variables
│   ├── supabase_schema.sql       # Database schema
│   ├── routes/                    # API routes
│   ├── models/                    # Data models
│   ├── utils/                     # Utilities
│   └── venv/                      # Virtual environment
│
├── frontend/
│   ├── src/                       # React components
│   ├── package.json              # Node dependencies
│   ├── vite.config.js            # Vite config
│   └── node_modules/             # Installed packages
│
└── Documentation/
    ├── STARTUP_GUIDE.md
    ├── EXECUTION_SUMMARY.md
    ├── SETUP_COMPLETE.md
    ├── QUICK_COMMANDS.md
    └── SETUP_REPORT.md
```

---

## 🧪 Testing the Setup

### 1. Check Backend Health
```bash
curl http://127.0.0.1:8000/health
```

### 2. View API Documentation
Open: http://127.0.0.1:8000/docs

### 3. Test Donor Registration
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

---

## 🐛 Troubleshooting

### Backend Issues
- **Python not found**: Install Python 3.8+
- **Port 8000 in use**: Use `--port 8001`
- **Supabase error**: Verify `.env` credentials

### Frontend Issues
- **Node not found**: Install Node.js 16+
- **Port 3002 in use**: Edit `frontend/vite.config.js`
- **Module error**: Run `npm install`

See **[STARTUP_GUIDE.md](STARTUP_GUIDE.md)** for more troubleshooting.

---

## 🔐 Configuration

All required environment variables are in `.env`:
- `SUPABASE_URL` - Database endpoint
- `SUPABASE_SERVICE_ROLE_KEY` - Server authentication
- `SUPABASE_ANON_KEY` - Client authentication
- `SECRET_KEY` - JWT secret

---

## 📝 Development

### Make Backend Changes
- Edit files in `backend/`
- Uvicorn auto-reloads on changes
- Test at http://127.0.0.1:8000/docs

### Make Frontend Changes
- Edit files in `frontend/src/`
- Vite hot-reloads on changes
- View changes immediately in browser

### Add Dependencies
**Backend**: Edit `requirements.txt`, run `pip install -r requirements.txt`  
**Frontend**: Run `npm install [package-name]`

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 📞 Support

1. Check the troubleshooting section above
2. Review API documentation at http://127.0.0.1:8000/docs
3. Check backend console for error messages
4. Verify environment variables in `.env`

---

## ✅ Setup Verification

Before launching, verify:
- ✓ Python 3.8+ installed
- ✓ Node.js 16+ installed
- ✓ `.env` file configured
- ✓ Virtual environment ready
- ✓ npm dependencies installed

See **[SETUP_REPORT.md](SETUP_REPORT.md)** for detailed verification.

---

## 🚀 Ready to Launch!

```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks
setup_and_run.bat
```

Then open: **http://127.0.0.1:3002**

---

**BloodConnect v1.0.0** | A smart blood donor discovery platform  
**Status**: ✅ Ready for Launch  
**Last Updated**: April 5, 2025

🩸 **Connecting donors with those in need** 💙
