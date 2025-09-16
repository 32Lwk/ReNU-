リヌ打
運用は基本、Raspberry Pi 5をサーバーとして使用することを前提に設計しています。なお、各種サーバーにも対応可能ではあります。ネットワーク対応のタイピングゲームアプリケーションとしています。(現在はローカルのみ)

主な機能
タイピングゲーム- 楽しくタイピングスキルを向上
マルチユーザー対応- ネットワーク経由で複数ユーザーが同時プレイ
ランキングシステム- 他のプレイヤーと競ってランキングを上げよう
管理者画面- テキスト編集、難易度調整、ゲーム設定
統計・分析機能- 個人のタイピング統計と進歩を確認
SimpleUI - ニックネーム登録のみで簡単にゲーム開始
スタック技術
バックエンド
FastAPI 0.104.1 - 高速なAP​​Iサーバー（Python）
SQLite - 軽量データベース（renu_typing_game.db）
SQLAlchemy 2.0.23 - ORM（4つの管理テーブル）
Uvicorn 0.24.0 - ASGI サーバー
Pydantic 2.5.0 - データバリデーション
Python-JOSE - JWT認証
Passlib - パスワードハッシュ化
フロントエンド
React 18.2.0 - モダンなUIライブラリ
Vite 4.5.0 - 高速ビルドツール
Tailwind CSS 3.3.0 - ユーティリティファーストCSS
React Router 6.8.0 - ルーティング
Axios 1.6.0 - HTTP クライアント
Lucide React - アイコンライブラリ
開発・デプロイ
Docker - コンテナ化
Nginx - リバースプロキシ
systemd - サービス管理（Raspberry Pi）
Git - バージョン管理
開発環境でのスタート
ウィンドウズ
# 開発サーバーを起動
start_dev.bat
macOS(スタバで生きてる方向け)
# 実行権限を付与
chmod +x start_dev.sh

# 開発サーバーを起動
./start_dev.sh
手動セットアップ
バックエンド
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r ../requirements.txt
python init_data.py  # 初期データの作成
uvicorn main:app --reload --host 0.0.0.0 --port 8000
フロントエンド
npm install
npm run dev
アクセス情報
フロントエンド: http://localhost:3000
バックエンドAPI : http://localhost:8000
API ドキュメント: http://localhost:8000/docs
管理者パスワード(書いてあるから消してね♡)
パスワード:admin123
プロジェクト構造
renu-typing-game/
├── backend/                    # バックエンドAPI
│   ├── main.py                # FastAPIアプリケーション
│   ├── models.py              # データベースモデル
│   ├── schemas.py             # Pydanticスキーマ
│   ├── database.py            # データベース設定
│   ├── init_data.py           # 初期データ作成
│   ├── renu_typing_game.db    # SQLiteデータベース
│   └── venv/                  # Python仮想環境
├── src/                       # フロントエンドソース
│   ├── components/            # Reactコンポーネント
│   │   ├── TypingGame.jsx     # メインゲームコンポーネント
│   │   ├── Layout.jsx         # レイアウトコンポーネント
│   │   └── ErrorBoundary.jsx  # エラーハンドリング
│   ├── pages/                 # ページコンポーネント
│   │   ├── Game.jsx           # ゲームページ
│   │   ├── Admin.jsx          # 管理者ページ
│   │   ├── Rankings.jsx       # ランキングページ
│   │   ├── Settings.jsx       # 設定ページ
│   │   ├── Home.jsx           # ホームページ
│   │   └── HowToPlay.jsx      # 遊び方ページ
│   ├── contexts/              # React Context
│   │   └── GameContext.jsx    # ゲーム状態管理
│   ├── utils/                 # ユーティリティ
│   │   └── romaji.js          # ローマ字変換
│   ├── App.jsx                # メインアプリケーション
│   ├── main.jsx               # エントリーポイント
│   └── index.css              # グローバルスタイル
├── data/                      # データファイル
│   └── texts.json             # タイピングテキスト（60種類）追加してね♡
├── public/                    # 静的ファイル
│   └── images/                # 画像リソース
│       └── sushi/             # リー君画像（40種類）
├── scripts/                   # ユーティリティスクリプト
│   └── add_romaji_to_texts.js # ローマ字追加スクリプト
├── deploy.sh                  # デプロイスクリプト
├── start_dev.bat              # Windows開発起動スクリプト
├── start_dev.sh               # Linux/macOS開発起動スクリプト
├── docker-compose.yml         # Docker Compose設定
├── Dockerfile                 # Docker設定
├── nginx.conf                 # Nginx設定
├── package.json               # Node.js依存関係
├── requirements.txt           # Python依存関係
├── tailwind.config.js         # Tailwind CSS設定
├── vite.config.js             # Vite設定
└── README.md                  # このファイル
機能
タイピング
当面タイピング速度測定 - WPM（Words Per Minute ）計算
精度計算- タイピング精度のパーセンテージ表示
エラーカウント- 間違いの回数と位置の追跡
進捗表示- その間でのタイピング進捗
勝負度別テキスト- Easy（20種類）、Medium（20種類）、Hard（20種類）
ローマ字対応- 日本語テキストのローマ字変換機能
ランキングシステム
WPMベースランキング- タイピング速度による順位付け
困難度別ランキング- 各困難度での個別ランキング
個人統計表示- プレイヤーのタイピング履歴と統計
全体順位表示- 全プレイヤーとの比較
ニックネーム管理- ユーザー登録不要の簡単プレイ
管理者機能
テキスト管理- タイピングテキストの追加・編集・削除
難易度設定- Easy/Medium/Hardの分類管理
アクティブスイッチ- テキストの有効/無効設定
ゲーム設定管理- ゲームパラメータの調整
統計表示- プレイヤー統計とゲームデータの確認
データベース設計
テーブル構成
TextContent - タイピングテキスト（60種類の日本語テキスト）
GameSession - ゲームセッション記録
ランキング- ランキングデータ
AdminSettings - 管理者設定
データの特徴
日本語テキスト- 日常会話から技術用語まで概要
ローマ字対応- 各テキストにローマ字変換データ付き(chatGPTにさせたので間違えてます。)
難しい度分類- Easy（基本挨拶）、Medium（技術用語）、Hard（専門用語）
リーくん- 40種類の可愛いリーくんキャラクター画像(コード上は寿司になりますが、気にしないでください。打ちやすかっただけです。)
APIエンドポイント
ゲーム関連
GET /texts- タイピングテキスト一覧取得
POST /game/start- ゲーム開始
POST /game/end- ゲーム終了・結果送信
GET /rankings- ランキング取得
管理者関連
POST /admin/login- 管理者ログイン
GET /admin/texts- テキスト管理
POST /admin/texts- テキスト追加
PUT /admin/texts/{id}- テキスト更新
DELETE /admin/texts/{id}- テキスト削除
設定
環境変数
env.example参考に環境変数を設定してください：

# データベース設定
DATABASE_URL=sqlite:///./renu_typing_game.db

# セキュリティ設定
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# サーバー設定
HOST=0.0.0.0
PORT=8000
ライセンス
このプロジェクトに関してすべての権利は川嶋宥翔に帰属します。

サポート
問題が発生した場合：川嶋宥翔に連絡してください。

謝辞
寿司打 - インスピレーションの源
FastAPI - 素晴らしいPythonフレームワーク
React - モダンなフロントエンド開発
Tailwind CSS - 美しいUIデザイン