@echo off
title R Square Hospitals Journal - Dev Server
echo.
echo [0/2] Clearing old processes...
taskkill /F /IM node.exe /T >nul 2>&1
echo ===================================================
echo   R SQUARE HOSPITALS JOURNAL - STARTING SYSTEM
echo ===================================================
echo.
echo [1/2] Building Frontend Assets...
call npm run build --prefix frontend
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Frontend build failed! 
    echo Please check the errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo [2/2] Starting Backend Server...
echo.
echo 🚀 CLICK THIS LINK TO OPEN: http://localhost:7000
echo.
call npm start --prefix backend
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Backend server crashed!
    pause
)
pause
