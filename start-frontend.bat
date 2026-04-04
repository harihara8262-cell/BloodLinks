@echo off
title BloodConnect Frontend Dev Server

cd /d "%~dp0frontend"

echo.
echo 🩸 BloodConnect - Frontend Dev Server
echo =====================================
echo.
echo Port: http://127.0.0.1:3002
echo Press Ctrl+C to stop
echo.

npm run dev

pause
