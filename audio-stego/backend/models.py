from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(String, nullable=False, index=True)
    original_filename = Column(String, nullable=False)
    stored_path = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    is_encoded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    sent_records = relationship("SentFile", back_populates="file", cascade="all, delete-orphan")


class SentFile(Base):
    __tablename__ = "sent_files"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String, nullable=False, index=True)
    recipient_email = Column(String, nullable=False)
    file_id = Column(Integer, ForeignKey("audio_files.id"), nullable=False)
    message_preview = Column(String, nullable=True)
    sent_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("AudioFile", back_populates="sent_records")
