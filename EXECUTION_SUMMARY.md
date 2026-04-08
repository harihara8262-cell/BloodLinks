# BloodConnect Setup - Execution Summary

## 🎯 Setup Status: READY FOR EXECUTION

### ✅ Verification Results

#### Backend Configuration
- ✓ **Location**: `C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend`
- ✓ **Python Virtual Environment**: Exists at `venv/`
- ✓ **Dependencies File**: `requirements.txt` configured
- ✓ **Main Application**: `main.py` (FastAPI)
- ✓ **Database Module**: `database.py` (Supabase)
- ✓ **Environment Variables**: `.env` file contains required credentials

#### Frontend Configuration  
- ✓ **Location**: `C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend`
- ✓ **Build Tool**: Vite v5.0.0
- ✓ **Framework**: React 18.2.0
- ✓ **Dev Server Port**: 3002 (configured in vite.config.js)
- ✓ **Dependencies**: Installed in `node_modules/`

#### Supabase Configuration
- ✓ **URL**: `https://cnhehaznmqmpiizrhlhu.supabase.co`
- ✓ **Service Role Key**: Configured
- ✓ **Anon Key**: Configured
- ✓ **Database Module**: Ready to connect

---

## 🚀 Quick Start Instructions

### **Option 1: Automated Startup (Recommended)**
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks
setup_and_run.bat
```
This will:
- Install backend dependencies
- Launch backend on port 8000
- Launch frontend on port 3002
- Both in separate command windows

### **Option 2: Manual Startup**

**Terminal 1 - Backend:**
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 - Frontend:**
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run dev
```

### **Option 3: Verify Setup First**
```batch
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks
verify_setup.bat
```

---

## 📡 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend** | http://127.0.0.1:8000 | REST API |
| **API Docs (Swagger)** | http://127.0.0.1:8000/docs | Interactive API documentation |
| **API Docs (ReDoc)** | http://127.0.0.1:8000/redoc | Alternative documentation |
| **Health Check** | http://127.0.0.1:8000/health | Backend status |
| **Frontend** | http://127.0.0.1:3002 | React application |

---

## 🔌 Available API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh token

### Donor Management (`/api/donor`)
- `GET /api/donor/nearby?blood=O+&lat=40.7128&lng=-74.0060&radius=10` - Find nearby donors
- `POST /api/donor/register` - Register as a donor
- `GET /api/donor/{id}` - Get donor details
- `PUT /api/donor/{id}` - Update donor profile
- `GET /api/donor/search?blood_group=O+&gender=M` - Search donors
- `POST /api/donor/emergency-alert` - Send emergency alert

### Email Verification (`/api/email`)
- `POST /api/email/send-verification` - Send verification email
- `GET /api/email/verify/{token}` - Verify email token
- `POST /api/email/resend-verification` - Resend verification email

---

## 📊 Project Structure

```
BloodLinks/
├── backend/
│   ├── main.py                      # FastAPI application entry point
│   ├── database.py                  # Supabase connection manager
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables
│   ├── supabase_schema.sql         # Database schema
│   ├── venv/                        # Python virtual environment
│   ├── routes/
│   │   ├── donor_routes.py         # Donor endpoints
│   │   ├── auth_routes.py          # Authentication endpoints
│   │   └── email_routes.py         # Email verification endpoints
│   ├── models/
│   │   └── donor.py                # Data models
│   └── utils/
│       ├── distance.py             # Geolocation calculations
│       └── notifications.py        # SMS/Email notifications
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main React component
│   │   ├── index.css               # Global styles
│   │   └── components/             # React components
│   ├── public/                     # Static assets
│   ├── package.json               # Node dependencies
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # Tailwind CSS config
│
├── STARTUP_GUIDE.md               # Detailed startup guide
├── verify_setup.bat               # Setup verification script
└── setup_and_run.bat             # Automated startup script
```

---

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI 0.109.0
- **Server**: Uvicorn 0.27.0
- **Database Client**: Supabase 2.3.4
- **SMS Service**: Twilio 8.10.0
- **Config**: python-dotenv 1.0.0

### Frontend
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.3.6
- **Maps**: Leaflet 1.9.4
- **Animation**: Framer Motion 12.38.0
- **Routing**: React Router DOM 6.20.0

### Database
- **Provider**: Supabase (PostgreSQL)
- **Features**: Real-time, PostGIS, Auth

---

## 🔑 Environment Variables Setup

The `.env` file is already configured with:

```env
SUPABASE_URL=https://cnhehaznmqmpiizrhlhu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_DrHFV5THplEKnRH1MMrgLQ_2W1Exqc0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TWILIO_ACCOUNT_SID=AC3b9b09029e5055215ab6f1bd8be494dd
TWILIO_AUTH_TOKEN=44db49ac7eab1b0f3179c6b8faae8f2c
TWILIO_FROM_NUMBER=+12603702957
NOTIFICATION_APP_NAME=BloodLinks
SECRET_KEY=7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c...
```

**Note**: Keep these credentials secure. Never commit `.env` to version control.

---

## 🔍 Expected Startup Output

### Backend Should Show:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
✓ Connected to Supabase successfully
```

### Frontend Should Show:
```
  VITE v5.0.0  ready in XXX ms

  ➜  Local:   http://127.0.0.1:3002/
  ➜  press h to show help
```

---

## 🐛 Troubleshooting

### Backend Won't Start
1. **Python not found**: Install Python 3.8+
2. **Dependencies missing**: Run `python -m pip install -r requirements.txt`
3. **Port 8000 in use**: Change port in the command: `--port 8001`
4. **Supabase connection error**: Verify .env credentials are correct

### Frontend Won't Start
1. **Node not found**: Install Node.js 16+
2. **Dependencies missing**: Run `npm install` in frontend directory
3. **Port 3002 in use**: Edit `vite.config.js` and change port

### Database Connection Issues
1. **Check Supabase status**: Visit https://app.supabase.com/
2. **Verify network connectivity**
3. **Test with curl**: `curl -X GET http://127.0.0.1:8000/health`

---

## ✨ Features

- 🎯 **Smart Donor Finder**: Locate nearby blood donors using geolocation
- 🚨 **Emergency Alerts**: Send urgent blood requests to nearby donors
- 👤 **Donor Profiles**: Create and manage donor profiles
- 📧 **Email Verification**: Secure email confirmation system
- 📍 **Location Services**: Real-time location-based matching
- 🔔 **SMS Notifications**: Twilio integration for instant alerts
- 🗺️ **Interactive Maps**: Leaflet maps for donor visualization
- 🎨 **Modern UI**: Responsive design with Tailwind CSS

---

## 📝 Commands Reference

```batch
# Backend
cd backend
call venv\Scripts\activate.bat                    # Activate virtual environment
python -m pip install -r requirements.txt        # Install dependencies
python -m uvicorn main:app --reload              # Run with auto-reload
python -m uvicorn main:app --port 8001           # Run on different port

# Frontend
cd frontend
npm install                                       # Install dependencies
npm run dev                                       # Start dev server
npm run build                                     # Build for production
npm run preview                                   # Preview production build

# Testing API
curl http://127.0.0.1:8000/health                # Check backend health
curl http://127.0.0.1:8000/docs                  # Open Swagger docs
```

---

## 🎉 Next Steps

1. **Run the setup**: Execute `setup_and_run.bat`
2. **Open the app**: Navigate to http://127.0.0.1:3002
3. **Explore the API**: Visit http://127.0.0.1:8000/docs
4. **Test features**: Register a donor, search nearby donors, etc.

---

**Setup Date**: April 5, 2025
**Project Version**: BloodConnect v1.0.0
**Status**: ✅ READY TO LAUNCH
