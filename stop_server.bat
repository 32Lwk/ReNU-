@echo off
echo ========================================
echo    ReNU打 サーバー停止スクリプト
echo ========================================
echo.

echo 🛑 サーバーを停止しています...

REM ポート3000を使用しているプロセスを終了
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo ポート3000のプロセスを終了中: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM ポート8000を使用しているプロセスを終了
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo ポート8000のプロセスを終了中: %%a
    taskkill /PID %%a /F >nul 2>&1
)

REM Node.jsプロセスを終了
taskkill /IM node.exe /F >nul 2>&1

REM Pythonプロセス（uvicorn）を終了
taskkill /IM python.exe /F >nul 2>&1

echo.
echo 📊 サーバー状態確認中...
timeout /t 2 /nobreak > nul

netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ⚠️  ポート3000はまだ使用されています
) else (
    echo ✅ ポート3000: 解放されました
)

netstat -an | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ⚠️  ポート8000はまだ使用されています
) else (
    echo ✅ ポート8000: 解放されました
)

echo.
echo ✅ サーバーが停止しました！
echo.
pause
