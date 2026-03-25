@echo off
REM Start BloodConnect Backend

cd /d C:\Users\harih\OneDrive\Attachments\bloodlink\backend

echo.
echo 🩸 BloodConnect - FastAPI Backend
echo ==================================
echo.
echo Starting backend on http://127.0.0.1:8000
echo API Docs: http://127.0.0.1:8000/docs
echo.
echo Press Ctrl+C to stop
echo.

call venv\Scripts\activate.bat
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

pause
