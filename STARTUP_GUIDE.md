# BloodConnect Project - Startup Guide

## 📋 Project Overview
**BloodConnect** is a smart nearby blood donor finder application built with:
- **Backend**: FastAPI (Python) with Supabase database
- **Frontend**: React with Vite
- **Database**: Supabase (PostgreSQL)

---

## ✅ Pre-Startup Verification

### Backend Configuration
✓ **Location**: `C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend`
✓ **Environment Variables** (.env):
```
SUPABASE_URL=https://cnhehaznmqmpiizrhlhu.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_publishable_DrHFV5THplEKnRH1MMrgLQ_2W1Exqc0
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

✓ **Python Virtual Environment**: `backend/venv/` exists
✓ **Dependencies**: requirements.txt configured with:
  - fastapi==0.109.0
  - uvicorn==0.27.0
  - supabase==2.3.4
  - python-dotenv==1.0.0
  - And others...

### Frontend Configuration
✓ **Location**: `C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend`
✓ **Build Tool**: Vite (React)
✓ **Dependencies**: node_modules/ exists
✓ **Dev Server Port**: 5173 (or 3000/3002)

---

## 🚀 Quick Start

### Option 1: Using Batch Scripts (Recommended for Windows)

#### Start Both Services:
```bash
# From project root, run:
setup_and_run.bat
```

This will:
1. Install/verify backend dependencies
2. Launch backend on http://127.0.0.1:8000
3. Launch frontend on http://127.0.0.1:5173

---

### Option 2: Manual Startup (Two Command Prompts)

#### Terminal 1 - Backend:
```bash
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

#### Terminal 2 - Frontend:
```bash
cd C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
npm run dev
```

---

## 📡 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://127.0.0.1:8000 | REST API endpoint |
| **API Documentation** | http://127.0.0.1:8000/docs | FastAPI Swagger UI |
| **API ReDoc** | http://127.0.0.1:8000/redoc | Alternative API docs |
| **Health Check** | http://127.0.0.1:8000/health | Backend status |
| **Frontend** | http://127.0.0.1:5173 | React application |

---

## 📦 Available API Endpoints

### Donor Management (`/api/donor`)
- `GET /api/donor/nearby` - Find nearby blood donors
- `POST /api/donor/register` - Register a new donor
- `GET /api/donor/{id}` - Get donor details
- `PUT /api/donor/{id}` - Update donor profile

### Email Verification (`/api/email`)
- `POST /api/email/send-verification` - Send verification email
- `GET /api/email/verify/{token}` - Verify email token

### Authentication (`/api/auth`)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

---

## 🔧 Database Setup

### Supabase Schema
If the database schema hasn't been initialized:

1. Go to: https://app.supabase.com
2. Login and select the project
3. Navigate to SQL Editor
4. Create a new query
5. Copy content from `backend/supabase_schema.sql`
6. Execute the query

**Current Schema Location**: `C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend\supabase_schema.sql`

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python installation
python --version

# Check virtual environment
call venv\Scripts\activate.bat

# Reinstall dependencies
python -m pip install -r requirements.txt --force-reinstall
```

### Supabase Connection Error
- Verify `.env` file has correct credentials
- Check network connectivity to Supabase
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Frontend Won't Start
```bash
# Clear node_modules and reinstall
rmdir /s /q node_modules
npm install
npm run dev
```

### CORS Issues
The backend CORS middleware is configured to accept:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:3002`
- `http://127.0.0.1:5173`

---

## 📝 Project Structure

```
BloodLinks/
├── backend/
│   ├── venv/                 # Python virtual environment
│   ├── main.py              # FastAPI entry point
│   ├── database.py          # Supabase connection
│   ├── requirements.txt      # Python dependencies
│   ├── routes/              # API route handlers
│   ├── models/              # Data models
│   ├── utils/               # Utility functions
│   ├── .env                 # Environment variables
│   └── supabase_schema.sql  # Database schema
├── frontend/
│   ├── src/                 # React components
│   ├── public/              # Static files
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── docker-compose.yml       # Docker setup (optional)
└── setup_and_run.bat        # Automated startup script
```

---

## 🔐 Security Notes

- `.env` file contains sensitive credentials - Never commit to version control
- `SUPABASE_SERVICE_ROLE_KEY` should only be used server-side
- `SUPABASE_ANON_KEY` is safe for client-side use

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation at http://127.0.0.1:8000/docs
3. Check backend console for error messages
4. Verify all environment variables are correctly set

---

**Setup Date**: 2025-04-05
**Project**: BloodConnect v1.0.0
