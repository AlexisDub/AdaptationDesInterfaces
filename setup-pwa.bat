@echo off
echo ========================================
echo PWA Setup - Step by Step
echo ========================================
echo.

echo Step 1: Installing PWA plugin...
call npm install vite-plugin-pwa workbox-window --save-dev
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 2: Building production version...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build completed
echo.

echo Step 3: Starting preview server...
echo.
echo ========================================
echo IMPORTANT: 
echo 1. Open http://localhost:4173 in Chrome/Edge
echo 2. Look for install icon in address bar (next to bookmark star)
echo 3. Or open Chrome menu > "Install app"
echo ========================================
echo.
call npx vite preview
