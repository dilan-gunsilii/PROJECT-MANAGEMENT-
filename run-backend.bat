@echo off
cd /d "%~dp0backend"
echo Starting PostgreSQL...
docker compose up -d postgres
echo Starting Backend...
java -jar target\backend-0.0.1-SNAPSHOT.jar
echo.
echo Backend stopped.
pause
