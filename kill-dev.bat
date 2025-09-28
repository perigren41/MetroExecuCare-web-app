@echo off
echo Killing all development servers...

echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo Killing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a >nul 2>&1

echo Killing node processes...
taskkill /f /im node.exe >nul 2>&1

echo All development servers stopped.
timeout /t 2 >nul

echo Starting clean development environment...
npm run dev