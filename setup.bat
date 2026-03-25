@echo off
REM BloodConnect Startup Script - Quick Start
REM IMPORTANT: MongoDB must be running first!

echo.
echo 🩸 BloodConnect - Quick Startup (Windows)
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.

REM Check if mongod is running
tasklist | find /i "mongod.exe" >nul
if errorlevel 1 (
    echo ⚠️  WARNING: MongoDB is not running!
    echo Please start MongoDB first:
    echo   Option 1: mongod  (if installed locally)
    echo   Option 2: Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
    echo.
    echo If using MongoDB Atlas, create backend\.env with:
    echo   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true
    echo.
    pause
)

echo Starting BloodConnect services...
echo.

REM Start Backend
echo [1/2] Starting FastAPI Backend on port 8000...
start "BloodConnect Backend" cmd /c "cd backend && venv\Scripts\activate && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak

REM Start Frontend
echo [2/2] Starting React Frontend on port 3000...
start "BloodConnect Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ============================================
echo ✅ Services started!
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8000
echo API Docs:  http://localhost:8000/docs
echo.
echo Close these windows to stop the services.
echo ============================================
echo.
