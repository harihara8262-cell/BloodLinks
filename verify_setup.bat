@echo off
REM Verification script for BloodConnect setup

echo.
echo ========================================
echo 🩸 BloodConnect - Setup Verification
echo ========================================
echo.

cd /d "C:\Users\harih\OneDrive\Attachments\Bloodlinks\BloodLinks\backend"

echo.
echo [1/5] Checking Python installation...
call venv\Scripts\python.exe --version
if errorlevel 1 (
    echo ✗ Python not found!
    exit /b 1
) else (
    echo ✓ Python OK
)

echo.
echo [2/5] Checking installed packages...
call venv\Scripts\pip.exe list | findstr /I "fastapi uvicorn supabase"
if errorlevel 1 (
    echo ✗ Some packages missing, installing...
    call venv\Scripts\pip.exe install -r requirements.txt --quiet
    if errorlevel 1 (
        echo ✗ Installation failed!
        exit /b 1
    )
) else (
    echo ✓ Core packages found
)

echo.
echo [3/5] Checking environment variables...
if defined SUPABASE_URL (
    echo ✓ SUPABASE_URL found
) else (
    echo ✗ SUPABASE_URL not in system env, checking .env file...
)

if exist ".env" (
    echo ✓ .env file found
) else (
    echo ✗ .env file missing!
    exit /b 1
)

echo.
echo [4/5] Checking .env content...
findstr /I "SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY" .env >nul
if errorlevel 1 (
    echo ✗ Required Supabase credentials not in .env!
    exit /b 1
) else (
    echo ✓ Supabase credentials configured
)

echo.
echo [5/5] Checking frontend dependencies...
cd ..\frontend
if exist "node_modules" (
    echo ✓ node_modules found
) else (
    echo ✗ node_modules not found, run: npm install
)

echo.
echo ========================================
echo ✓ All verifications passed!
echo ========================================
echo.
echo Next steps:
echo 1. Run: setup_and_run.bat
echo   OR manually:
echo 2. Terminal 1: cd backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
echo 3. Terminal 2: cd frontend && npm run dev
echo.
pause
