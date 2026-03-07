@echo off
echo.
echo  ████████╗██████╗ ██╗   ██╗███████╗████████╗ ██████╗███████╗██████╗ ████████╗
echo  ╚══██╔══╝██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔════╝██╔════╝██╔══██╗╚══██╔══╝
echo     ██║   ██████╔╝██║   ██║███████╗   ██║   ██║     █████╗  ██████╔╝   ██║
echo     ██║   ██╔══██╗██║   ██║╚════██║   ██║   ██║     ██╔══╝  ██╔══██╗   ██║
echo     ██║   ██║  ██║╚██████╔╝███████║   ██║   ╚██████╗███████╗██║  ██║   ██║
echo     ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝╚══════╝╚═╝  ╚═╝   ╚═╝
echo.
echo  Blockchain Academic Certificate Portal — Polygon Amoy Testnet
echo  ---------------------------------------------------------------
echo.

:: Start Backend
echo [1/2] Starting Database API Server on http://localhost:5000 ...
start "TrustCert Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 2 /nobreak >nul

:: Start Frontend
echo [2/2] Starting Frontend Dev Server on http://localhost:5173 ...
start "TrustCert Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo  ✅ Both servers are running!
echo.
echo  Frontend  →  http://localhost:5173
echo  Backend   →  http://localhost:5000
echo  API Docs  →  http://localhost:5000/api/certificates
echo.
echo  Press any key to open in browser...
pause >nul
start http://localhost:5173
