#!/bin/bash

# ReNU打 - Raspberry Pi 5 デプロイメントスクリプト

echo "ReNU打 デプロイメントを開始します..."

# システムの更新
echo "システムを更新しています..."
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
echo "必要なパッケージをインストールしています..."
sudo apt install -y python3-pip python3-venv python3-dev git curl

# Node.jsのインストール
echo "Node.jsをインストールしています..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# プロジェクトディレクトリの作成
PROJECT_DIR="/opt/renu-typing"
echo "プロジェクトディレクトリを作成しています: $PROJECT_DIR"
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# プロジェクトファイルのコピー
echo "プロジェクトファイルをコピーしています..."
cp -r . $PROJECT_DIR/
cd $PROJECT_DIR

# Python仮想環境の作成とセットアップ
echo "Python仮想環境をセットアップしています..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Node.js依存関係のインストール
echo "Node.js依存関係をインストールしています..."
npm install

# フロントエンドのビルド
echo "フロントエンドをビルドしています..."
npm run build

# データベースの初期化
echo "データベースを初期化しています..."
cd backend
python init_data.py
cd ..

# systemdサービスの作成
echo "systemdサービスを作成しています..."
sudo tee /etc/systemd/system/renu-typing.service > /dev/null <<EOF
[Unit]
Description=ReNU打 Typing Game API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR
Environment=PATH=$PROJECT_DIR/venv/bin
ExecStart=$PROJECT_DIR/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# nginxのインストールと設定
echo "nginxをインストール・設定しています..."
sudo apt install -y nginx

sudo tee /etc/nginx/sites-available/renu-typing > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # フロントエンド
    location / {
        root $PROJECT_DIR/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# nginxサイトの有効化
sudo ln -sf /etc/nginx/sites-available/renu-typing /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# nginxの設定テストと再起動
sudo nginx -t
sudo systemctl reload nginx

# サービスの開始と有効化
echo "サービスを開始しています..."
sudo systemctl daemon-reload
sudo systemctl enable renu-typing
sudo systemctl start renu-typing

# ファイアウォールの設定
echo "ファイアウォールを設定しています..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# サービスの状態確認
echo "サービスの状態を確認しています..."
sudo systemctl status renu-typing --no-pager
sudo systemctl status nginx --no-pager

echo ""
echo "=========================================="
echo "ReNU打 デプロイメントが完了しました！"
echo "=========================================="
echo ""
echo "アクセス情報:"
echo "- Webアプリケーション: http://$(hostname -I | awk '{print $1}')"
echo "- API: http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "管理者アカウント:"
echo "- ユーザー名: admin"
echo "- パスワード: admin123"
echo ""
echo "サービス管理コマンド:"
echo "- サービス開始: sudo systemctl start renu-typing"
echo "- サービス停止: sudo systemctl stop renu-typing"
echo "- サービス再起動: sudo systemctl restart renu-typing"
echo "- ログ確認: sudo journalctl -u renu-typing -f"
echo ""
echo "ログファイル:"
echo "- アプリケーションログ: sudo journalctl -u renu-typing"
echo "- nginxログ: sudo tail -f /var/log/nginx/access.log"
echo "- nginxエラーログ: sudo tail -f /var/log/nginx/error.log"
echo ""
