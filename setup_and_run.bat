@echo off
REM BloodConnect Setup and Run Script

cd /d "%~dp0"

echo.
echo ========================================
echo 🩸 BloodConnect - Setup and Launch
echo ========================================
echo.

REM Check if requirements are already installed
cd backend
echo Checking/Installing dependencies...
call venv\Scripts\pip install -r requirements.txt --quiet

echo.
echo Backend dependencies ready!
echo.

REM Display startup information
echo ========================================
echo 📍 Starting Services...
echo ========================================
echo.
echo Backend Server:
echo   URL: http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo Frontend Server:
echo   URL: http://127.0.0.1:5173 (or 3000/3002 depending on config)
echo.
echo Press Ctrl+C in either window to stop services
echo.
echo ========================================
echo.

REM Start backend in separate command window
start "BloodConnect Backend" cmd /k "cd /d %CD% && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start frontend in separate command window
cd ..
start "BloodConnect Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo Both services started! Check the command windows for details.
echo.
pause
