@echo off
setlocal EnableExtensions
title Campus Network Resilience Visualizer

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "VENV=%BACKEND%\.venv"
set "PYEXE=%VENV%\Scripts\python.exe"

echo ============================================================
echo   Campus Network Resilience Visualizer
echo ============================================================
echo.

if not exist "%BACKEND%\app.py" (
  echo ERROR: Place this BAT file in the extracted project root,
  echo alongside the backend and frontend folders.
  pause
  exit /b 1
)
if not exist "%BACKEND%\requirements.txt" (
  echo ERROR: backend\requirements.txt is missing.
  pause
  exit /b 1
)
if not exist "%FRONTEND%\package.json" (
  echo ERROR: frontend\package.json is missing.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not on PATH.
  echo Install Node.js 22.12+ or 20.19+ from https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm is not available. Reinstall Node.js and try again.
  pause
  exit /b 1
)

where py >nul 2>nul
if not errorlevel 1 (
  set "PYTHON_CMD=py"
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo ERROR: Python is not installed or not on PATH.
    echo Install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
  )
  set "PYTHON_CMD=python"
)

echo [1/4] Preparing Python environment...
if not exist "%PYEXE%" (
  %PYTHON_CMD% -m venv "%VENV%"
  if errorlevel 1 (
    echo ERROR: Could not create Python virtual environment.
    pause
    exit /b 1
  )
)

echo [2/4] Installing backend requirements...
"%PYEXE%" -m pip install --disable-pip-version-check -r "%BACKEND%\requirements.txt"
if errorlevel 1 (
  echo ERROR: Backend dependency installation failed.
  echo Check your internet connection and Python installation.
  pause
  exit /b 1
)

echo [3/4] Preparing frontend dependencies...
pushd "%FRONTEND%"
if not exist "node_modules" (
  if exist "package-lock.json" (
    call npm ci
  ) else (
    call npm install
  )
) else (
  echo node_modules already exists; skipping install.
)
if errorlevel 1 (
  popd
  echo ERROR: Frontend dependency installation failed.
  echo Check your internet connection and Node.js version.
  pause
  exit /b 1
)
popd

echo [4/4] Starting backend and frontend...
echo A separate window will open for each server. Keep both open.
echo.

start "Campus Network - Backend" cmd /k "cd /d ""%BACKEND%"" && ""%PYEXE%"" app.py"
start "Campus Network - Frontend" cmd /k "cd /d ""%FRONTEND%"" && call npm run dev -- --host 127.0.0.1"

echo Waiting for the frontend to respond...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:5173/'; for($i=0;$i -lt 60;$i++){ try { $r=Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ Start-Process $url; exit 0 } } catch {}; Start-Sleep -Seconds 2 }; Write-Host 'Frontend did not respond within 2 minutes.'; exit 1"
if errorlevel 1 (
  echo.
  echo The website did not respond automatically.
  echo Check the Frontend server window for errors.
  echo If Vite started on a different port, use the URL shown in that window.
  pause
  exit /b 1
)

echo.
echo Website opened at http://127.0.0.1:5173/
echo Keep both server windows open while using the app.
echo Close the two server windows to stop the app.
pause
