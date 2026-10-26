@echo off
setlocal
title Campus Network Resilience - Launcher

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

if not exist "%BACKEND%\app.py" (
    echo ERROR: Put this file in the main campus-network-resilience-main folder.
    echo It should sit beside the backend and frontend folders.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not on PATH.
    echo Install it from https://nodejs.org/ and run this file again.
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm was not found. Reinstall Node.js from https://nodejs.org/.
    pause
    exit /b 1
)

where py >nul 2>nul
if errorlevel 1 (
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERROR: Python is not installed or not on PATH.
        echo Install it from https://www.python.org/downloads/ and run this file again.
        pause
        exit /b 1
    )
    set "PYTHON=python"
) else (
    set "PYTHON=py"
)

echo Starting the backend and frontend. First launch may take a few minutes.
echo.

start "Campus Network - Backend" cmd /k "cd /d ""%BACKEND%"" && if not exist "".venv\Scripts\python.exe"" (%PYTHON% -m venv .venv) && "".venv\Scripts\python.exe"" -m pip install -r requirements.txt && "".venv\Scripts\python.exe"" app.py"

start "Campus Network - Frontend" cmd /k "cd /d ""%FRONTEND%"" && if not exist ""node_modules"" (call npm install) && call npm run dev"

echo Waiting a few seconds, then opening the website...
timeout /t 8 /nobreak >nul
start "" "http://localhost:5173/"

echo.
echo Done. Keep both server windows open while using the website.
echo To stop the app, close the Backend and Frontend windows.
pause
