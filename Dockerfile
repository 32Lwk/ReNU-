# ReNU打 - Docker設定
FROM node:18-alpine AS frontend-build

# フロントエンドのビルド
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Python環境のセットアップ
FROM python:3.11-slim

# システムパッケージのインストール
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリの設定
WORKDIR /app

# Python依存関係のインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルのコピー
COPY backend/ ./backend/
COPY --from=frontend-build /app/dist ./dist

# データベースの初期化
RUN cd backend && python init_data.py

# ポートの公開
EXPOSE 8000

# アプリケーションの起動
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
