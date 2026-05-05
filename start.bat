@echo off
echo Starting Restaurante Gordo...
start cmd /k "npm run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5173