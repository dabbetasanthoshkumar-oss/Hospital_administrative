@echo off
REM HOPI SYNC - Start All Services (Windows)
REM This script starts both Next.js and Python services in separate windows

echo.
echo ========================================
echo    HOPI SYNC - Starting Services
echo    St. Aesculapius Medical Center
echo ========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo [1] Checking Python virtual environment...
if not exist "python\.venv" (
    echo [!] Virtual environment not found, creating...
    cd python
    python -m venv .venv
    cd ..
    echo [✓] Virtual environment created
) else (
    echo [✓] Virtual environment found
)

echo.
echo [2] Starting Python API Server...
echo     This will run on: http://localhost:5000
echo.

REM Start Python in new window
start cmd /k "cd python && .venv\Scripts\activate.bat && pip install -q -r requirements.txt 2>nul && echo. && echo Python API is ready! && echo. && python app.py"

REM Wait a moment for Python to start
timeout /t 3 /nobreak

echo.
echo [3] Starting Next.js Development Server...
echo     This will run on: http://localhost:3000
echo.

REM Start Next.js in new window
start cmd /k "npm run dev"

echo.
echo ========================================
echo    ✓ Both services starting!
echo ========================================
echo.
echo   Next.js:  http://localhost:3000
echo   Python API: http://localhost:5000
echo.
echo   Login with your credentials
echo   Medical Records -> Get AI Diagnosis Suggestion
echo.
echo   Close either window to stop that service
echo ========================================
echo.

timeout /t 2
exit /b 0
