@echo off
setlocal enabledelayedexpansion

echo.
echo 🚀 Starting HarveLogix AI Platform...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm %NPM_VERSION% detected
echo.

REM Start backend
echo 📦 Starting Backend Server...
cd backend
call npm install >nul 2>&1
start "HarveLogix Backend" cmd /k npm start
echo ✅ Backend started
echo.

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start frontend
echo 🎨 Starting Frontend Dashboard...
cd ..\web-dashboard
call npm install >nul 2>&1
start "HarveLogix Frontend" cmd /k npm run dev
echo ✅ Frontend started
echo.

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 HarveLogix AI Platform is Running!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📊 Dashboard:  http://localhost:3000
echo 🔌 Backend:    http://localhost:5000
echo.
echo Two new terminal windows have been opened for the backend and frontend.
echo Close them to stop the servers.
echo.
pause
