# HOPI SYNC - Start All Services (Windows PowerShell)
# This script starts both Next.js and Python services

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    HOPI SYNC - Starting Services" -ForegroundColor Cyan
Write-Host "    St. Aesculapius Medical Center" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node is installed
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "    Install from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "    Press Enter to exit"
    exit 1
}

# Check if python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[✓] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "    Install from: https://python.org/" -ForegroundColor Yellow
    Read-Host "    Press Enter to exit"
    exit 1
}

Write-Host ""

# Check Python virtual environment
Write-Host "[1] Checking Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "python\.venv")) {
    Write-Host "[!] Virtual environment not found, creating..." -ForegroundColor Yellow
    Set-Location python
    python -m venv .venv
    Set-Location ..
    Write-Host "[✓] Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "[✓] Virtual environment found" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2] Starting Python API Server..." -ForegroundColor Yellow
Write-Host "    URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Start Python in new PowerShell window
$pythonScript = @"
Set-Location (Split-Path `$MyInvocation.MyCommandPath)
cd python
.\.venv\Scripts\Activate.ps1
pip install -q -r requirements.txt 2>$null
'Python API is ready on http://localhost:5000' | Write-Host -ForegroundColor Green
''
python app.py
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $pythonScript

# Wait for Python to start
Start-Sleep -Seconds 3

Write-Host "[3] Starting Next.js Development Server..." -ForegroundColor Yellow
Write-Host "    URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start Next.js in new PowerShell window
$nextScript = @"
npm run dev
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $nextScript

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✓ Both services starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  📱 Next.js:" -ForegroundColor Cyan
Write-Host "     http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "  🧠 Python API:" -ForegroundColor Cyan
Write-Host "     http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "  📋 How to use:" -ForegroundColor Yellow
Write-Host "     1. Open http://localhost:3000 in browser" -ForegroundColor Gray
Write-Host "     2. Login with your credentials" -ForegroundColor Gray
Write-Host "     3. Go to Medical Records" -ForegroundColor Gray
Write-Host "     4. Click 'Get AI Diagnosis Suggestion'" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Closing a window will stop that service" -ForegroundColor Yellow
Write-Host ""
