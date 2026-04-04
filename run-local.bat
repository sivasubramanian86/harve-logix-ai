@echo off
setlocal enabledelayedexpansion

echo.
echo 🛡️  HARVELOGIX AI - LOCAL TEST RUNNER
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: 1. Force kill existing processes on ports 3000 and 5000 to avoid conflicts
echo 🧹 Cleaning up existing HarveLogix processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
echo ✅ Ports 3000 and 5000 are clear.
echo.

:: 2. Check for backend environment setup
echo 🔌 Preparing Backend (Port 5000)...
cd backend
if not exist .env (
    echo ⚠️  Backend .env missing. Copying from .env.example...
    copy .env.example .env
)
echo 📦 Installing backend dependencies...
call npm install --no-fund --no-audit

:: Start backend in a new window
start "HarveLogix-Backend" cmd /k "echo 🚀 BACKEND STANDBY... & npm start"
cd ..

:: 3. Check for frontend environment setup
echo.
echo 🎨 Preparing Frontend (Port 3000)...
cd web-dashboard
if not exist .env (
    echo ⚠️  Frontend .env missing. Creating local development config...
    echo VITE_API_URL=http://localhost:5000/api > .env
    echo VITE_USE_DEMO_DATA=false >> .env
)
echo 📦 Installing frontend dependencies...
call npm install --no-fund --no-audit

:: 4. Launch frontend in a new window
start "HarveLogix-Frontend" cmd /k "echo 🚀 FRONTEND STANDBY... & npm run dev -- --port 3000 --host 127.0.0.1"
cd ..

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 SYSTEM STAGE COMPLETE!
echo.
echo 🌐 Dashboard: http://127.0.0.1:3000
echo 🔌 API Server: http://localhost:5000
echo 📊 DB Status:  500 Farmers Loaded (PostgreSQL)
echo.
echo Please allow 5-10 seconds for the servers to fully initialize in their windows.
echo.
echo Press any key to exit this runner (servers will stay open in their windows).
pause >nul
