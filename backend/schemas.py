from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ランキング関連スキーマ（簡潔版）
class RankingCreate(BaseModel):
    nickname: str
    wpm: float
    accuracy: float
    errors: int
    timeElapsed: float
    charactersTyped: int
    difficulty: str
    text_content_id: Optional[int] = None

# テキストコンテンツ関連スキーマ
class TextContentBase(BaseModel):
    title: str
    content: str
    difficulty: str
    is_active: bool = True

class TextContentCreate(TextContentBase):
    pass

class TextContentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    difficulty: Optional[str] = None
    is_active: Optional[bool] = None

class TextContentResponse(TextContentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ゲームセッション関連スキーマ
class GameSessionBase(BaseModel):
    nickname: str
    text_content_id: int
    difficulty: str

class GameSessionCreate(GameSessionBase):
    pass

class GameSessionResponse(GameSessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    wpm: Optional[float] = None
    accuracy: Optional[float] = None
    is_completed: bool
    
    class Config:
        from_attributes = True

# ランキング関連スキーマ
class RankingBase(BaseModel):
    wpm: float
    accuracy: float
    difficulty: str
    text_content_id: Optional[int] = None

class RankingResponse(RankingBase):
    id: int
    nickname: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# 管理者設定関連スキーマ
class AdminSettingsBase(BaseModel):
    setting_key: str
    setting_value: str
    description: Optional[str] = None

class AdminSettingsUpdate(BaseModel):
    setting_value: str
    description: Optional[str] = None

class AdminSettingsResponse(AdminSettingsBase):
    id: int
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 統計関連スキーマ
class GameStats(BaseModel):
    total_sessions: int
    average_wpm: float
    average_accuracy: float
    best_wpm: float
    total_play_time: int  # 秒
