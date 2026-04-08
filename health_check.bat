@echo off
REM BloodConnect - Quick Diagnostics and Health Check

setlocal enabledelayedexpansion

cd /d "C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks"

echo.
echo ========================================
echo 🩸 BloodConnect - Health Check
echo ========================================
echo.
echo Generated at: %date% %time%
echo.

REM Check Python
echo [CHECK 1] Python Installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python not found in PATH
) else (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✓ !PYTHON_VERSION!
)

REM Check Node
echo.
echo [CHECK 2] Node.js Installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js not found in PATH
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✓ Node.js !NODE_VERSION!
)

REM Check Backend Setup
echo.
echo [CHECK 3] Backend Configuration
if exist "backend\.env" (
    echo ✓ .env file exists
) else (
    echo ✗ .env file NOT FOUND
)

if exist "backend\venv" (
    echo ✓ Virtual environment exists
) else (
    echo ✗ Virtual environment NOT FOUND
)

if exist "backend\requirements.txt" (
    echo ✓ requirements.txt found
) else (
    echo ✗ requirements.txt NOT FOUND
)

if exist "backend\main.py" (
    echo ✓ main.py found
) else (
    echo ✗ main.py NOT FOUND
)

REM Check Frontend Setup
echo.
echo [CHECK 4] Frontend Configuration
if exist "frontend\package.json" (
    echo ✓ package.json found
) else (
    echo ✗ package.json NOT FOUND
)

if exist "frontend\node_modules" (
    echo ✓ node_modules found
    setlocal enabledelayedexpansion
    for /f %%A in ('dir /b/ad frontend\node_modules 2^>nul ^| find /c /v ""') do set COUNT=%%A
    echo   ^(!COUNT! packages installed^)
) else (
    echo ✗ node_modules NOT FOUND (run: npm install in frontend directory)
)

if exist "frontend\vite.config.js" (
    echo ✓ vite.config.js found
) else (
    echo ✗ vite.config.js NOT FOUND
)

REM Check Database Schema
echo.
echo [CHECK 5] Database Files
if exist "backend\supabase_schema.sql" (
    echo ✓ supabase_schema.sql found
) else (
    echo ✗ supabase_schema.sql NOT FOUND
)

REM Check Routes
echo.
echo [CHECK 6] API Routes
if exist "backend\routes\donor_routes.py" (
    echo ✓ donor_routes.py found
) else (
    echo ✗ donor_routes.py NOT FOUND
)

if exist "backend\routes\auth_routes.py" (
    echo ✓ auth_routes.py found
) else (
    echo ✗ auth_routes.py NOT FOUND
)

if exist "backend\routes\email_routes.py" (
    echo ✓ email_routes.py found
) else (
    echo ✗ email_routes.py NOT FOUND
)

REM Check Utilities
echo.
echo [CHECK 7] Utility Modules
if exist "backend\utils\distance.py" (
    echo ✓ distance.py found
) else (
    echo ✗ distance.py NOT FOUND
)

if exist "backend\utils\notifications.py" (
    echo ✓ notifications.py found
) else (
    echo ✗ notifications.py NOT FOUND
)

REM Check Documentation
echo.
echo [CHECK 8] Documentation
if exist "STARTUP_GUIDE.md" (
    echo ✓ STARTUP_GUIDE.md found
) else (
    echo ✗ STARTUP_GUIDE.md NOT FOUND
)

if exist "EXECUTION_SUMMARY.md" (
    echo ✓ EXECUTION_SUMMARY.md found
) else (
    echo ✗ EXECUTION_SUMMARY.md NOT FOUND
)

REM Summary
echo.
echo ========================================
echo Summary:
echo ========================================
echo.
echo Backend: C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend
echo Frontend: C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\frontend
echo.
echo Expected URLs:
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://127.0.0.1:3002
echo   API Docs: http://127.0.0.1:8000/docs
echo.
echo To start services:
echo   Option 1: setup_and_run.bat
echo   Option 2: Manual startup in two terminals
echo.
echo For detailed instructions, see: STARTUP_GUIDE.md
echo.
pause
