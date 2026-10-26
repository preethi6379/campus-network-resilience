@echo off
setlocal EnableExtensions
title Campus Network Resilience Launcher

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "VENV=%BACKEND%\.venv\Scripts\python.exe"

echo ============================================================
echo   Campus Network Resilience Visualizer
echo ============================================================
echo.

if not exist "%BACKEND%\app.py" (
    echo ERROR: This launcher must be inside the extracted
    echo campus-network-resilience-main folder, beside backend
    echo and frontend.
    pause
    exit /b 1
)
if not exist "%FRONTEND%\package.json" (
    echo ERROR: frontend\package.json was not found.
    pause
    exit /b 1
)
if not exist "%BACKEND%\requirements.txt" (
    echo ERROR: backend\requirements.txt was not found.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js was not found.
    echo Install Node.js 22.12+ or 20.19+ from https://nodejs.org/
    echo Then close and reopen this launcher.
    pause
    exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm was not found. Reinstall Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where py >nul 2>nul
if not errorlevel 1 (
    set "PYTHON=py"
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERROR: Python was not found.
        echo Install Python 3.10+ from https://www.python.org/downloads/
        echo Make sure Python is added to PATH.
        pause
        exit /b 1
    )
    set "PYTHON=python"
)

echo [1/4] Preparing Python virtual environment...
if not exist "%VENV%" (
    %PYTHON% -m venv "%BACKEND%\.venv"
    if errorlevel 1 (
        echo ERROR: Could not create the Python virtual environment.
        pause
        exit /b 1
    )
)

echo [2/4] Installing/updating backend dependencies...
"%VENV%" -m pip install -r "%BACKEND%\requirements.txt"
if errorlevel 1 (
    echo ERROR: Backend dependency installation failed.
    echo Check your internet connection and Python installation.
    pause
    exit /b 1
)

echo [3/4] Installing/updating frontend dependencies...
pushd "%FRONTEND%"
call npm install
if errorlevel 1 (
    popd
    echo ERROR: Frontend dependency installation failed.
    echo Check your internet connection and Node.js version.
    pause
    exit /b 1
)
popd

echo [4/4] Starting the backend and frontend...
echo.
echo Two server windows will open. Keep them open while using the app.
echo The browser will open once the servers have had time to start.
echo.

start "Campus Network - Backend" cmd /k "cd /d ""%BACKEND%"" && ""%VENV%"" app.py"
start "Campus Network - Frontend" cmd /k "cd /d ""%FRONTEND%"" && call npm run dev -- --host 127.0.0.1"

echo Waiting for the website to start...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://localhost:5173/'; for($i=0;$i -lt 60;$i++){ try { $r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ Start-Process $url; exit 0 } } catch {}; Start-Sleep -Seconds 2 }; Write-Host 'The site did not respond within 2 minutes. Check the Frontend server window for errors.'"
if errorlevel 1 (
    echo Could not automatically confirm the site is running.
    echo If Vite started successfully, open http://localhost:5173/
)

echo.
echo Launcher finished. Close the Backend and Frontend server windows to stop the app.
pause
