
@echo off
chcp 65001 >nul
echo ========================================
echo    ReNU打 サーバー自動起動スクリプト
echo ========================================
echo.

REM プロジェクトディレクトリに移動
cd /d "%~dp0"

REM Node.jsのパスを設定
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Node.jsが利用可能かチェック
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.jsが見つかりません
    echo    C:\Program Files\nodejs\node.exe が存在することを確認してください
    pause
    exit /b 1
)

REM npmが利用可能かチェック
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npmが見つかりません
    echo    Node.jsが正しくインストールされていることを確認してください
    pause
    exit /b 1
)

REM サーバーが既に起動しているかチェック
netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 3000 is already in use
    echo Please stop existing servers before running again
    echo.
    echo Stopping existing servers...
    taskkill /IM node.exe /F >nul 2>&1
    taskkill /IM python.exe /F >nul 2>&1
    timeout /t 3 /nobreak >nul
)

netstat -an | findstr :8000 >nul
if %errorlevel% == 0 (
    echo WARNING: Port 8000 is already in use
    echo Please stop existing servers before running again
    echo.
    echo Stopping existing servers...
    taskkill /IM node.exe /F >nul 2>&1
    taskkill /IM python.exe /F >nul 2>&1
    timeout /t 3 /nobreak >nul
)

echo 🚀 サーバーを起動しています...
echo.

REM バックエンドサーバーを起動
echo Backend server starting...
start "ReNU Backend" /min cmd /c "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

REM 3秒待機
timeout /t 3 /nobreak > nul

REM フロントエンドサーバーを起動
echo Frontend server starting...
start "ReNU Frontend" /min cmd /c "set PATH=%PATH%;C:\Program Files\nodejs && npm run dev"

REM 5秒待機
timeout /t 5 /nobreak > nul

REM サーバーの状態を確認
echo.
echo 📊 サーバー状態確認中...
netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ✅ フロントエンドサーバー: 起動中 (ポート3000)
) else (
    echo ❌ フロントエンドサーバー: 起動失敗
)

netstat -an | findstr :8000 >nul
if %errorlevel% == 0 (
    echo ✅ バックエンドサーバー: 起動中 (ポート8000)
) else (
    echo ❌ バックエンドサーバー: 起動失敗
)

echo.
echo 🌐 アクセスURL:
echo    ローカル: http://localhost:3000
echo    外部: http://renuda.ddns.net:3000
echo.

REM NO-IP更新
if exist "update_noip.py" (
    echo 🌐 NO-IPを更新中...
    python update_noip.py
)

echo.
echo ✅ サーバーが起動しました！
echo.
echo 📝 管理コマンド:
echo    サーバー停止: stop_server.bat
echo    状態確認: netstat -an ^| findstr ":3000\|:8000"
echo.
echo This window can be closed while servers continue running.
echo To stop servers, run stop_server.bat
echo.
pause
