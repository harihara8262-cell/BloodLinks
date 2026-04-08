@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================
echo    BLOODCONNECT - STARTING SERVERS
echo ============================================================
echo.

cd /d "C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks"

echo [STEP 1/4] Checking directories...
if not exist "backend" (
    echo ERROR: backend folder not found!
    pause
    exit /b 1
)
if not exist "frontend" (
    echo ERROR: frontend folder not found!
    pause
    exit /b 1
)
echo   OK - Directories exist
echo.

echo [STEP 2/4] Checking Python virtual environment...
if not exist "backend\venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run: cd backend ^&^& python -m venv venv ^&^& venv\Scripts\activate ^&^& pip install -r requirements.txt
    pause
    exit /b 1
)
echo   OK - Virtual environment exists
echo.

echo [STEP 3/4] Starting BACKEND server...
start "BloodConnect - Backend API (Port 8000)" cmd /k "cd /d C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend && call venv\Scripts\activate.bat && echo Starting FastAPI server... && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
echo   Backend server starting on port 8000...
echo   Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak >nul
echo.

echo [STEP 4/4] Starting FRONTEND server...
start "BloodConnect - Frontend (Vite)" cmd /k "cd /d C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend && echo Starting Vite dev server... && npm run dev"
echo   Frontend server starting...
echo.

echo ============================================================
echo    SERVERS STARTED!
echo ============================================================
echo.
echo Two new windows should have opened:
echo   1. Backend API  - http://localhost:8000
echo   2. Frontend App - http://localhost:3000 (or 5173)
echo.
echo API Documentation: http://localhost:8000/docs
echo.
echo IMPORTANT: Keep both server windows open!
echo            Close them when you're done with the app.
echo.
echo ============================================================
echo.
pause
