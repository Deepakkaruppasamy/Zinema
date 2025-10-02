@echo off
echo Testing DeepAI locally...
echo.

REM Set your Gemini API key here for testing
set GEMINI_API_KEY=your_api_key_here

REM Start the server in background
echo Starting server...
cd server
start /b npm start

REM Wait a moment for server to start
timeout /t 5 /nobreak > nul

echo.
echo Testing health endpoint...
curl http://localhost:5000/api/deepai/health

echo.
echo Testing assistant endpoint...
curl -X POST http://localhost:5000/api/deepai/assistant -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"text\":\"Hello\"}],\"user\":{}}"

echo.
echo Test completed!
pause
