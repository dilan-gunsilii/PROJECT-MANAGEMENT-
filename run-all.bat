@echo off
echo Starting Backend (separate window)...
start "Backend" cmd /k "cd /d "%~dp0backend" && echo Starting PostgreSQL... && docker compose up -d postgres && echo Starting Backend... && java -jar target\backend-0.0.1-SNAPSHOT.jar"

timeout /t 5 /nobreak >nul

echo Starting Frontend (separate window)...
start "Frontend" cmd /k "cd /d "%~dp0frontend" && echo Starting Frontend... && npm run dev"

echo.
echo Both services are starting in separate windows.
echo   Backend  -^> http://localhost:8080
echo   Frontend -^> http://localhost:5173
echo.
pause
