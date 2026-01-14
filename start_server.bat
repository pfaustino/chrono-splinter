@echo off
echo Starting Zilgax local server...
echo.
echo Game will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8080
pause
