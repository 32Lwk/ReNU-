from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
import os
from datetime import datetime

from database import get_db, engine
from models import Base, GameSession, TextContent, AdminSettings, Ranking
from schemas import (
    GameSessionCreate, GameSessionResponse,
    TextContentCreate, TextContentUpdate, AdminSettingsUpdate,
    RankingResponse, RankingCreate
)

# データベーステーブルの作成
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ReNU打 API",
    description="タイピングゲームのAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限してください
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 管理者認証用のシンプルな設定
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# ルートエンドポイント
@app.get("/")
async def root():
    return {"message": "ReNU打 API へようこそ！"}

# デバッグ用エンドポイント
@app.get("/api/debug/status")
async def debug_status():
    import json
    import os
    
    debug_info = {
        "timestamp": datetime.now().isoformat(),
        "backend_status": "running",
        "texts_file": {
            "path": os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json'),
            "exists": False,
            "readable": False,
            "size": 0,
            "error": None
        },
        "texts_data": {
            "count": 0,
            "sample": [],
            "error": None
        }
    }
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        debug_info["texts_file"]["path"] = texts_file
        debug_info["texts_file"]["exists"] = os.path.exists(texts_file)
        
        if os.path.exists(texts_file):
            debug_info["texts_file"]["size"] = os.path.getsize(texts_file)
            debug_info["texts_file"]["readable"] = os.access(texts_file, os.R_OK)
            
            # ファイルの内容を読み込み
            try:
                with open(texts_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    texts = data.get('texts', [])
                    debug_info["texts_data"]["count"] = len(texts)
                    debug_info["texts_data"]["sample"] = texts[:3] if texts else []
            except Exception as e:
                debug_info["texts_data"]["error"] = str(e)
        else:
            debug_info["texts_file"]["error"] = "ファイルが存在しません"
            
    except Exception as e:
        debug_info["texts_file"]["error"] = str(e)
    
    return debug_info

# 管理者認証用のシンプルな関数
def verify_admin_password(password: str):
    print(f"認証試行: 入力パスワード='{password}', 正しいパスワード='{ADMIN_PASSWORD}'")
    result = password == ADMIN_PASSWORD
    print(f"認証結果: {result}")
    return result

# ゲームセッション関連エンドポイント
@app.post("/api/game/session", response_model=GameSessionResponse)
async def create_game_session(
    session_data: GameSessionCreate,
    db: Session = Depends(get_db)
):
    db_session = GameSession(
        nickname=session_data.nickname,
        text_content_id=session_data.text_content_id,
        difficulty=session_data.difficulty,
        start_time=datetime.utcnow()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@app.get("/api/game/texts")
async def get_text_contents():
    import json
    import os
    
    print("=== テキスト取得API開始 ===")
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        print(f"テキストファイルパス: {texts_file}")
        print(f"ファイル存在確認: {os.path.exists(texts_file)}")
        
        # ファイルが存在しない場合はデフォルトテキストを返す
        if not os.path.exists(texts_file):
            print("警告: テキストファイルが存在しません。デフォルトテキストを返します。")
            default_texts = [
                {"id": 1, "title": "こんにちは", "content": "こんにちは", "difficulty": "easy", "is_active": True},
                {"id": 2, "title": "ありがとう", "content": "ありがとう", "difficulty": "easy", "is_active": True},
                {"id": 3, "title": "おはよう", "content": "おはよう", "difficulty": "easy", "is_active": True}
            ]
            print(f"デフォルトテキスト返却: {len(default_texts)}件")
            return default_texts
        
        # ファイルサイズを確認
        file_size = os.path.getsize(texts_file)
        print(f"ファイルサイズ: {file_size} bytes")
        
        # ファイルからテキストを読み込み
        print("ファイル読み込み開始...")
        with open(texts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            texts = data.get('texts', [])
            print(f"JSON読み込み成功: {len(texts)}件のテキスト")
            
        # アクティブなテキストのみを返す
        active_texts = [text for text in texts if text.get('is_active', True)]
        print(f"アクティブテキスト: {len(active_texts)}件")
        
        # 難易度別の統計
        easy_count = len([t for t in active_texts if t.get('difficulty') == 'easy'])
        medium_count = len([t for t in active_texts if t.get('difficulty') == 'medium'])
        hard_count = len([t for t in active_texts if t.get('difficulty') == 'hard'])
        print(f"難易度別統計 - Easy: {easy_count}, Medium: {medium_count}, Hard: {hard_count}")
        
        print("=== テキスト取得API成功 ===")
        return active_texts
        
    except json.JSONDecodeError as e:
        print(f"JSON解析エラー: {e}")
        print("デフォルトテキストを返します")
        return [
            {"id": 1, "title": "こんにちは", "content": "こんにちは", "difficulty": "easy", "is_active": True},
            {"id": 2, "title": "ありがとう", "content": "ありがとう", "difficulty": "easy", "is_active": True},
            {"id": 3, "title": "おはよう", "content": "おはよう", "difficulty": "easy", "is_active": True}
        ]
    except Exception as e:
        print(f"予期しないエラー: {e}")
        print(f"エラータイプ: {type(e).__name__}")
        import traceback
        print(f"スタックトレース: {traceback.format_exc()}")
        # エラー時はデフォルトテキストを返す
        return [
            {"id": 1, "title": "こんにちは", "content": "こんにちは", "difficulty": "easy", "is_active": True},
            {"id": 2, "title": "ありがとう", "content": "ありがとう", "difficulty": "easy", "is_active": True},
            {"id": 3, "title": "おはよう", "content": "おはよう", "difficulty": "easy", "is_active": True}
        ]

# ランキング関連エンドポイント
@app.get("/api/rankings", response_model=List[RankingResponse])
async def get_rankings(
    limit: int = 10,
    date_filter: Optional[str] = None,  # "today", "week", "month", "all"
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta
    
    query = db.query(Ranking)
    
    # 日付フィルタリング
    if date_filter and date_filter != "all":
        now = datetime.utcnow()
        
        if date_filter == "today":
            # 今日のランキング
            start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
            query = query.filter(Ranking.created_at >= start_of_day)
        elif date_filter == "week":
            # 過去1週間のランキング
            week_ago = now - timedelta(days=7)
            query = query.filter(Ranking.created_at >= week_ago)
        elif date_filter == "month":
            # 過去1ヶ月のランキング
            month_ago = now - timedelta(days=30)
            query = query.filter(Ranking.created_at >= month_ago)
    
    rankings = query.order_by(Ranking.wpm.desc()).limit(limit).all()
    return rankings

@app.post("/api/rankings")
async def submit_ranking(
    ranking_data: RankingCreate,
    db: Session = Depends(get_db)
):
    print("=== ランキング送信受信 ===")
    print(f"受信データ: {ranking_data}")
    
    try:
        ranking = Ranking(
            nickname=ranking_data.nickname,
            wpm=ranking_data.wpm,
            accuracy=ranking_data.accuracy,
            errors=ranking_data.errors,
            time_elapsed=ranking_data.timeElapsed,
            characters_typed=ranking_data.charactersTyped,
            difficulty=ranking_data.difficulty,
            text_content_id=ranking_data.text_content_id,
            created_at=datetime.utcnow()
        )
        
        print(f"作成されたランキングオブジェクト: {ranking}")
        
        db.add(ranking)
        db.commit()
        db.refresh(ranking)
        
        print(f"ランキング保存成功: ID={ranking.id}")
        print("=== ランキング送信完了 ===")
        
        return ranking
    except Exception as e:
        print(f"ランキング保存エラー: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"ランキング保存に失敗しました: {str(e)}")

# 管理者関連エンドポイント
@app.get("/api/admin/texts")
async def get_all_texts(password: str = None):
    import json
    import os
    
    print(f"管理者テキスト取得リクエスト: password='{password}'")
    if not password or not verify_admin_password(password):
        print("認証失敗")
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        
        if not os.path.exists(texts_file):
            return []
        
        # ファイルからテキストを読み込み
        with open(texts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            texts = data.get('texts', [])
            
        print(f"テキスト取得成功: {len(texts)}件")
        return texts
        
    except Exception as e:
        print(f"テキスト読み込みエラー: {e}")
        return []

@app.post("/api/admin/texts")
async def create_text_content(
    text_data: TextContentCreate,
    password: str = None
):
    import json
    import os
    
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        
        # 既存のテキストを読み込み
        texts = []
        if os.path.exists(texts_file):
            with open(texts_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                texts = data.get('texts', [])
        
        # 新しいIDを生成
        new_id = max([t.get('id', 0) for t in texts], default=0) + 1
        
        # 新しいテキストを追加
        new_text = {
            "id": new_id,
            "title": text_data.title,
            "content": text_data.content,
            "difficulty": text_data.difficulty,
            "is_active": text_data.is_active
        }
        texts.append(new_text)
        
        # ファイルに保存
        with open(texts_file, 'w', encoding='utf-8') as f:
            json.dump({"texts": texts}, f, ensure_ascii=False, indent=2)
        
        return new_text
        
    except Exception as e:
        print(f"テキスト保存エラー: {e}")
        raise HTTPException(status_code=500, detail="テキストの保存に失敗しました")

@app.put("/api/admin/texts/{text_id}")
async def update_text_content(
    text_id: int,
    text_data: TextContentUpdate,
    password: str = None
):
    import json
    import os
    
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        
        if not os.path.exists(texts_file):
            raise HTTPException(status_code=404, detail="テキストファイルが見つかりません")
        
        # 既存のテキストを読み込み
        with open(texts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            texts = data.get('texts', [])
        
        # 対象のテキストを検索
        text_index = None
        for i, text in enumerate(texts):
            if text.get('id') == text_id:
                text_index = i
                break
        
        if text_index is None:
            raise HTTPException(status_code=404, detail="テキストが見つかりません")
        
        # テキストを更新
        update_data = text_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            texts[text_index][field] = value
        
        # ファイルに保存
        with open(texts_file, 'w', encoding='utf-8') as f:
            json.dump({"texts": texts}, f, ensure_ascii=False, indent=2)
        
        return texts[text_index]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"テキスト更新エラー: {e}")
        raise HTTPException(status_code=500, detail="テキストの更新に失敗しました")

@app.delete("/api/admin/texts/{text_id}")
async def delete_text_content(
    text_id: int,
    password: str = None
):
    import json
    import os
    
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        # テキストファイルのパス
        texts_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'texts.json')
        
        if not os.path.exists(texts_file):
            raise HTTPException(status_code=404, detail="テキストファイルが見つかりません")
        
        # 既存のテキストを読み込み
        with open(texts_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            texts = data.get('texts', [])
        
        # 対象のテキストを検索して削除
        original_length = len(texts)
        texts = [text for text in texts if text.get('id') != text_id]
        
        if len(texts) == original_length:
            raise HTTPException(status_code=404, detail="テキストが見つかりません")
        
        # ファイルに保存
        with open(texts_file, 'w', encoding='utf-8') as f:
            json.dump({"texts": texts}, f, ensure_ascii=False, indent=2)
        
        return {"message": "テキストが削除されました"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"テキスト削除エラー: {e}")
        raise HTTPException(status_code=500, detail="テキストの削除に失敗しました")

# ランキング管理エンドポイント
@app.get("/api/admin/rankings")
async def get_all_rankings(password: str = None):
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        db = next(get_db())
        rankings = db.query(Ranking).order_by(Ranking.created_at.desc()).all()
        db.close()
        return rankings
    except Exception as e:
        print(f"ランキング取得エラー: {e}")
        raise HTTPException(status_code=500, detail="ランキングの取得に失敗しました")

@app.delete("/api/admin/rankings/{ranking_id}")
async def delete_ranking(ranking_id: int, password: str = None):
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        db = next(get_db())
        ranking = db.query(Ranking).filter(Ranking.id == ranking_id).first()
        
        if not ranking:
            db.close()
            raise HTTPException(status_code=404, detail="ランキングが見つかりません")
        
        db.delete(ranking)
        db.commit()
        db.close()
        
        return {"message": "ランキングが削除されました"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"ランキング削除エラー: {e}")
        raise HTTPException(status_code=500, detail="ランキングの削除に失敗しました")

@app.delete("/api/admin/rankings")
async def reset_all_rankings(password: str = None):
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        db = next(get_db())
        deleted_count = db.query(Ranking).delete()
        db.commit()
        db.close()
        
        return {"message": f"{deleted_count}件のランキングがリセットされました"}
    except Exception as e:
        print(f"ランキングリセットエラー: {e}")
        raise HTTPException(status_code=500, detail="ランキングのリセットに失敗しました")

@app.put("/api/admin/rankings/{ranking_id}")
async def update_ranking(
    ranking_id: int, 
    ranking_data: dict,
    password: str = None
):
    if not password or not verify_admin_password(password):
        raise HTTPException(status_code=403, detail="管理者パスワードが正しくありません")
    
    try:
        db = next(get_db())
        ranking = db.query(Ranking).filter(Ranking.id == ranking_id).first()
        
        if not ranking:
            db.close()
            raise HTTPException(status_code=404, detail="ランキングが見つかりません")
        
        # 更新可能なフィールドを更新
        if 'nickname' in ranking_data:
            ranking.nickname = ranking_data['nickname']
        if 'wpm' in ranking_data:
            ranking.wpm = ranking_data['wpm']
        if 'accuracy' in ranking_data:
            ranking.accuracy = ranking_data['accuracy']
        if 'errors' in ranking_data:
            ranking.errors = ranking_data['errors']
        if 'time_elapsed' in ranking_data:
            ranking.time_elapsed = ranking_data['time_elapsed']
        if 'characters_typed' in ranking_data:
            ranking.characters_typed = ranking_data['characters_typed']
        if 'difficulty' in ranking_data:
            ranking.difficulty = ranking_data['difficulty']
        
        db.commit()
        db.refresh(ranking)
        db.close()
        
        return ranking
    except HTTPException:
        raise
    except Exception as e:
        print(f"ランキング更新エラー: {e}")
        raise HTTPException(status_code=500, detail="ランキングの更新に失敗しました")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
