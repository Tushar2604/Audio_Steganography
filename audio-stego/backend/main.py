from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from sqlalchemy import text

from database import engine
import models
from routes import encode, decode, files

def migrate_legacy_auth_columns():
    """Drop legacy auth columns and ensure Clerk ownership columns exist."""
    if engine.url.get_backend_name() != "sqlite":
        return

    with engine.begin() as conn:
        audio_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(audio_files)")).fetchall()
        }
        sent_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(sent_files)")).fetchall()
        }

        conn.execute(text("PRAGMA foreign_keys=OFF"))

        if "user_id" in audio_cols:
            conn.execute(text("ALTER TABLE audio_files RENAME TO audio_files_old"))
            conn.execute(
                text(
                    """
                    CREATE TABLE audio_files (
                        id INTEGER PRIMARY KEY,
                        original_filename VARCHAR NOT NULL,
                        stored_path VARCHAR NOT NULL,
                        file_size INTEGER,
                        is_encoded BOOLEAN,
                        created_at DATETIME
                    )
                    """
                )
            )
            conn.execute(
                text(
                    """
                    INSERT INTO audio_files (id, original_filename, stored_path, file_size, is_encoded, created_at)
                    SELECT id, original_filename, stored_path, file_size, is_encoded, created_at
                    FROM audio_files_old
                    """
                )
            )
            conn.execute(text("DROP TABLE audio_files_old"))

        if "sender_id" in sent_cols:
            conn.execute(text("ALTER TABLE sent_files RENAME TO sent_files_old"))
            conn.execute(
                text(
                    """
                    CREATE TABLE sent_files (
                        id INTEGER PRIMARY KEY,
                        recipient_email VARCHAR NOT NULL,
                        file_id INTEGER NOT NULL,
                        message_preview VARCHAR,
                        sent_at DATETIME,
                        FOREIGN KEY(file_id) REFERENCES audio_files (id)
                    )
                    """
                )
            )
            conn.execute(
                text(
                    """
                    INSERT INTO sent_files (id, recipient_email, file_id, message_preview, sent_at)
                    SELECT id, recipient_email, file_id, message_preview, sent_at
                    FROM sent_files_old
                    """
                )
            )
            conn.execute(text("DROP TABLE sent_files_old"))

        audio_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(audio_files)")).fetchall()
        }
        sent_cols = {
            row[1]
            for row in conn.execute(text("PRAGMA table_info(sent_files)")).fetchall()
        }

        if "owner_id" not in audio_cols:
            conn.execute(text("ALTER TABLE audio_files ADD COLUMN owner_id VARCHAR NOT NULL DEFAULT 'legacy-user'"))

        if "sender_id" not in sent_cols:
            conn.execute(text("ALTER TABLE sent_files ADD COLUMN sender_id VARCHAR NOT NULL DEFAULT 'legacy-user'"))

        conn.execute(text("PRAGMA foreign_keys=ON"))


migrate_legacy_auth_columns()

# Create DB tables
models.Base.metadata.create_all(bind=engine)

# Ensure storage dirs exist
for d in ["uploads", "outputs"]:
    os.makedirs(os.path.join(os.path.dirname(__file__), d), exist_ok=True)

app = FastAPI(
    title="Audio Steganography API",
    description="Hide and reveal secret messages inside WAV audio files using LSB steganography.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(encode.router)
app.include_router(decode.router)
app.include_router(files.router)


@app.get("/")
def root():
    return {"message": "Audio Steganography API is running 🔐"}


@app.get("/health")
def health():
    return {"status": "ok"}
