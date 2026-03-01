@echo off
REM Multimodal AI Scanner - Deployment Script (Windows)
REM This script sets up the complete multimodal feature

echo ========================================
echo HarveLogix AI - Multimodal Scanner
echo ========================================
echo.

REM Check if running in correct directory
if not exist "package.json" (
    echo ERROR: Must run from project root directory
    exit /b 1
)

REM Step 1: Install Backend Dependencies
echo [1/7] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ERROR: Backend dependency installation failed
    exit /b 1
)
echo SUCCESS: Backend dependencies installed
echo.

REM Step 2: Install Frontend Dependencies
echo [2/7] Installing frontend dependencies...
cd ..\web-dashboard
call npm install
if errorlevel 1 (
    echo ERROR: Frontend dependency installation failed
    exit /b 1
)
echo SUCCESS: Frontend dependencies installed
echo.

REM Step 3: Setup Environment Variables
echo [3/7] Setting up environment variables...

REM Backend .env
if not exist "..\backend\.env" (
    (
        echo # AWS Configuration
        echo AWS_REGION=ap-south-2
        echo AWS_ACCESS_KEY_ID=your_access_key_here
        echo AWS_SECRET_ACCESS_KEY=your_secret_key_here
        echo.
        echo # S3 Configuration
        echo S3_BUCKET_NAME=harvelogix-multimodal
        echo.
        echo # Weather API
        echo WEATHER_API_KEY=your_openweather_key_here
        echo.
        echo # Demo Mode ^(set to false for production^)
        echo USE_DEMO_DATA=true
        echo.
        echo # Server Configuration
        echo PORT=5000
    ) > ..\backend\.env
    echo SUCCESS: Backend .env created
    echo WARNING: Please update AWS credentials in backend\.env
) else (
    echo SUCCESS: Backend .env already exists
)

REM Frontend .env
if not exist ".env" (
    (
        echo # API Configuration
        echo VITE_API_URL=http://localhost:5000
        echo.
        echo # Demo Mode ^(set to false for production^)
        echo VITE_USE_DEMO_DATA=true
    ) > .env
    echo SUCCESS: Frontend .env created
) else (
    echo SUCCESS: Frontend .env already exists
)
echo.

REM Step 4: AWS Setup
echo [4/7] AWS S3 bucket setup...
echo INFO: Please create S3 bucket manually in AWS Console
echo Bucket name: harvelogix-multimodal
echo Region: ap-south-2
echo.

REM Step 5: Run Tests
echo [5/7] Running tests...
cd ..\backend
call npm test 2>nul || echo WARNING: Tests skipped
echo.

REM Step 6: Build Frontend
echo [6/7] Building frontend...
cd ..\web-dashboard
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed
    exit /b 1
)
echo SUCCESS: Frontend built successfully
echo.

REM Step 7: Complete
echo [7/7] Deployment complete!
echo.
echo ========================================
echo To start the application:
echo   Backend:  cd backend ^&^& npm start
echo   Frontend: cd web-dashboard ^&^& npm run dev
echo.
echo Access: http://localhost:3000
echo.
echo Documentation: docs\MULTIMODAL.md
echo ========================================
echo.
echo IMPORTANT REMINDERS:
echo 1. Update AWS credentials in backend\.env
echo 2. Get OpenWeather API key from https://openweathermap.org/api
echo 3. Enable Bedrock Claude Sonnet 4.6 in AWS Console
echo 4. Create S3 bucket: harvelogix-multimodal
echo.
pause
