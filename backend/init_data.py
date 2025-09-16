"""
初期データの作成スクリプト
管理者ユーザーとサンプルテキストを作成します
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, TextContent, AdminSettings
from passlib.context import CryptContext
import os

# データベーステーブルの作成
Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# 管理者ユーザーは不要になったため、この関数は削除

def create_sample_texts():
    """サンプルテキストを作成"""
    db = SessionLocal()
    try:
        # 既存のテキストをチェック
        existing_texts = db.query(TextContent).count()
        if existing_texts > 0:
            print("サンプルテキストは既に存在します")
            return

        sample_texts = [
            # Easy (20問)
            {"title": "こんにちは", "content": "こんにちは", "difficulty": "easy"},
            {"title": "ありがとう", "content": "ありがとう", "difficulty": "easy"},
            {"title": "おはよう", "content": "おはよう", "difficulty": "easy"},
            {"title": "さようなら", "content": "さようなら", "difficulty": "easy"},
            {"title": "すみません", "content": "すみません", "difficulty": "easy"},
            {"title": "お疲れ様", "content": "お疲れ様", "difficulty": "easy"},
            {"title": "いただきます", "content": "いただきます", "difficulty": "easy"},
            {"title": "ごちそうさま", "content": "ごちそうさま", "difficulty": "easy"},
            {"title": "おめでとう", "content": "おめでとう", "difficulty": "easy"},
            {"title": "よろしく", "content": "よろしく", "difficulty": "easy"},
            {"title": "お願いします", "content": "お願いします", "difficulty": "easy"},
            {"title": "失礼します", "content": "失礼します", "difficulty": "easy"},
            {"title": "お疲れ様です", "content": "お疲れ様です", "difficulty": "easy"},
            {"title": "おはようございます", "content": "おはようございます", "difficulty": "easy"},
            {"title": "こんばんは", "content": "こんばんは", "difficulty": "easy"},
            {"title": "おやすみなさい", "content": "おやすみなさい", "difficulty": "easy"},
            {"title": "いってきます", "content": "いってきます", "difficulty": "easy"},
            {"title": "いってらっしゃい", "content": "いってらっしゃい", "difficulty": "easy"},
            {"title": "ただいま", "content": "ただいま", "difficulty": "easy"},
            {"title": "おかえりなさい", "content": "おかえりなさい", "difficulty": "easy"},
            
            # Medium (20問)
            {"title": "プログラミング", "content": "プログラミング", "difficulty": "medium"},
            {"title": "コンピュータ", "content": "コンピュータ", "difficulty": "medium"},
            {"title": "インターネット", "content": "インターネット", "difficulty": "medium"},
            {"title": "スマートフォン", "content": "スマートフォン", "difficulty": "medium"},
            {"title": "アプリケーション", "content": "アプリケーション", "difficulty": "medium"},
            {"title": "データベース", "content": "データベース", "difficulty": "medium"},
            {"title": "アルゴリズム", "content": "アルゴリズム", "difficulty": "medium"},
            {"title": "ソフトウェア", "content": "ソフトウェア", "difficulty": "medium"},
            {"title": "ハードウェア", "content": "ハードウェア", "difficulty": "medium"},
            {"title": "ネットワーク", "content": "ネットワーク", "difficulty": "medium"},
            {"title": "セキュリティ", "content": "セキュリティ", "difficulty": "medium"},
            {"title": "パフォーマンス", "content": "パフォーマンス", "difficulty": "medium"},
            {"title": "ユーザビリティ", "content": "ユーザビリティ", "difficulty": "medium"},
            {"title": "アクセシビリティ", "content": "アクセシビリティ", "difficulty": "medium"},
            {"title": "スケーラビリティ", "content": "スケーラビリティ", "difficulty": "medium"},
            {"title": "メンテナンス", "content": "メンテナンス", "difficulty": "medium"},
            {"title": "デバッグ", "content": "デバッグ", "difficulty": "medium"},
            {"title": "テスト", "content": "テスト", "difficulty": "medium"},
            {"title": "デプロイ", "content": "デプロイ", "difficulty": "medium"},
            {"title": "バージョン", "content": "バージョン", "difficulty": "medium"},
            
            # Hard (20問)
            {"title": "量子コンピューティング", "content": "量子コンピューティング", "difficulty": "hard"},
            {"title": "機械学習", "content": "機械学習", "difficulty": "hard"},
            {"title": "深層学習", "content": "深層学習", "difficulty": "hard"},
            {"title": "自然言語処理", "content": "自然言語処理", "difficulty": "hard"},
            {"title": "コンピュータビジョン", "content": "コンピュータビジョン", "difficulty": "hard"},
            {"title": "ニューラルネットワーク", "content": "ニューラルネットワーク", "difficulty": "hard"},
            {"title": "ブロックチェーン", "content": "ブロックチェーン", "difficulty": "hard"},
            {"title": "暗号化", "content": "暗号化", "difficulty": "hard"},
            {"title": "分散システム", "content": "分散システム", "difficulty": "hard"},
            {"title": "マイクロサービス", "content": "マイクロサービス", "difficulty": "hard"},
            {"title": "コンテナ化", "content": "コンテナ化", "difficulty": "hard"},
            {"title": "オーケストレーション", "content": "オーケストレーション", "difficulty": "hard"},
            {"title": "サーバーレス", "content": "サーバーレス", "difficulty": "hard"},
            {"title": "エッジコンピューティング", "content": "エッジコンピューティング", "difficulty": "hard"},
            {"title": "フォグコンピューティング", "content": "フォグコンピューティング", "difficulty": "hard"},
            {"title": "量子暗号", "content": "量子暗号", "difficulty": "hard"},
            {"title": "ホモモルフィック暗号", "content": "ホモモルフィック暗号", "difficulty": "hard"},
            {"title": "ゼロ知識証明", "content": "ゼロ知識証明", "difficulty": "hard"},
            {"title": "マルチパーティ計算", "content": "マルチパーティ計算", "difficulty": "hard"},
            {"title": "差分プライバシー", "content": "差分プライバシー", "difficulty": "hard"}
        ]

        for text_data in sample_texts:
            text_content = TextContent(
                title=text_data["title"],
                content=text_data["content"],
                difficulty=text_data["difficulty"],
                is_active=True
            )
            db.add(text_content)

        db.commit()
        print(f"{len(sample_texts)}個のサンプルテキストを作成しました")
    except Exception as e:
        print(f"サンプルテキスト作成エラー: {e}")
        db.rollback()
    finally:
        db.close()

def create_admin_settings():
    """管理者設定を作成"""
    db = SessionLocal()
    try:
        # 既存の設定をチェック
        existing_settings = db.query(AdminSettings).count()
        if existing_settings > 0:
            print("管理者設定は既に存在します")
            return

        settings = [
            {
                "setting_key": "game_time_limit",
                "setting_value": "300",
                "description": "ゲームの時間制限（秒）"
            },
            {
                "setting_key": "max_errors",
                "setting_value": "10",
                "description": "最大エラー数"
            },
            {
                "setting_key": "ranking_display_limit",
                "setting_value": "50",
                "description": "ランキング表示件数"
            }
        ]

        for setting_data in settings:
            admin_setting = AdminSettings(
                setting_key=setting_data["setting_key"],
                setting_value=setting_data["setting_value"],
                description=setting_data["description"]
            )
            db.add(admin_setting)

        db.commit()
        print(f"{len(settings)}個の管理者設定を作成しました")
    except Exception as e:
        print(f"管理者設定作成エラー: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("初期データを作成しています...")
    create_sample_texts()
    create_admin_settings()
    print("初期データの作成が完了しました！")
    print("管理者パスワード: admin123")
