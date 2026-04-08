@echo off
echo Installing dependencies...
python -m pip install -r requirements.txt --quiet

echo.
echo Starting BloodLinks backend with Supabase...
echo.
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
