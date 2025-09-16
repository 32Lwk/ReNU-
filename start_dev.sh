#!/bin/bash

echo "ReNU打 開発サーバーを起動しています..."

# バックエンドサーバーの起動
echo "バックエンドサーバーを起動中..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
python init_data.py
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# フロントエンドディレクトリに戻る
cd ..

# 少し待機
sleep 5

# フロントエンドサーバーの起動
echo "フロントエンドサーバーを起動中..."
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "ReNU打 開発サーバーが起動しました！"
echo "=========================================="
echo ""
echo "アクセス情報:"
echo "- フロントエンド: http://localhost:3000"
echo "- バックエンドAPI: http://localhost:8000"
echo "- API ドキュメント: http://localhost:8000/docs"
echo ""
echo "管理者アカウント:"
echo "- ユーザー名: admin"
echo "- パスワード: admin123"
echo ""
echo "開発サーバーを停止するには Ctrl+C を押してください。"
echo ""

# シグナルハンドリング
trap 'echo "サーバーを停止しています..."; kill $BACKEND_PID $FRONTEND_PID; exit' INT

# プロセスの監視
wait
