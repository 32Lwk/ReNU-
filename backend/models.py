from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Userテーブルは削除し、ニックネームのみで管理

class TextContent(Base):
    __tablename__ = "text_contents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    difficulty = Column(String(20), nullable=False)  # easy, medium, hard
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # リレーションシップ
    game_sessions = relationship("GameSession", back_populates="text_content")
    rankings = relationship("Ranking", back_populates="text_content")

class GameSession(Base):
    __tablename__ = "game_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), nullable=False)
    text_content_id = Column(Integer, ForeignKey("text_contents.id"), nullable=False)
    difficulty = Column(String(20), nullable=False)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    wpm = Column(Float)
    accuracy = Column(Float)
    is_completed = Column(Boolean, default=False)
    
    # リレーションシップ
    text_content = relationship("TextContent", back_populates="game_sessions")

class Ranking(Base):
    __tablename__ = "rankings"
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), nullable=False)
    text_content_id = Column(Integer, ForeignKey("text_contents.id"), nullable=True)
    wpm = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    errors = Column(Integer, default=0)
    time_elapsed = Column(Float, default=0)
    characters_typed = Column(Integer, default=0)
    difficulty = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # リレーションシップ
    text_content = relationship("TextContent", back_populates="rankings")

class AdminSettings(Base):
    __tablename__ = "admin_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(100), unique=True, nullable=False)
    setting_value = Column(Text, nullable=False)
    description = Column(String(500))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
