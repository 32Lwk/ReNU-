@echo off
echo ReNU打 開発サーバーを起動しています...

REM バックエンドサーバーの起動
echo バックエンドサーバーを起動中...
start "ReNU打 Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r ..\requirements.txt && python init_data.py && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM 少し待機
timeout /t 5 /nobreak > nul

REM フロントエンドサーバーの起動
echo フロントエンドサーバーを起動中...
start "ReNU打 Frontend" cmd /k "npm install && npm run dev"

echo.
echo ==========================================
echo ReNU打 開発サーバーが起動しました！
echo ==========================================
echo.
echo アクセス情報:
echo - フロントエンド: http://localhost:3000
echo - バックエンドAPI: http://localhost:8000
echo - API ドキュメント: http://localhost:8000/docs
echo.
echo 管理者アカウント:
echo - ユーザー名: admin
echo - パスワード: admin123
echo.
echo 開発サーバーを停止するには、各コマンドウィンドウで Ctrl+C を押してください。
echo.
pause
