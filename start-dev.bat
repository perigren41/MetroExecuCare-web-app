@echo off
echo Starting MetroExecuCare Development Environment...

echo.
echo ================================
echo Starting Backend Server (Port 5000)
echo ================================
cd Backend
start "MetroExecuCare Backend" cmd /k "npm run dev"

echo.
echo ================================
echo Starting Frontend Server (Port 3000)
echo ================================
cd ..\Frontend
start "MetroExecuCare Frontend" cmd /k "npm run dev"

echo.
echo ================================
echo Development servers are starting...
echo ================================
echo Backend:  http://localhost:5000/api
echo Frontend: http://localhost:3000
echo.
echo Both terminals will open in separate windows.
echo Press any key to exit this launcher...
pause