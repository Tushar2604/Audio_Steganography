import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import clerk_auth
import models
import email_service

router = APIRouter(prefix="/api/files", tags=["files"])


class SendRequest(BaseModel):
    recipient_email: str


@router.get("/history")
def get_history(
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    files = (
        db.query(models.AudioFile)
        .filter(models.AudioFile.owner_id == current_user_id, models.AudioFile.is_encoded == True)
        .order_by(models.AudioFile.created_at.desc())
        .all()
    )
    return [
        {
            "id": f.id,
            "original_filename": f.original_filename,
            "file_size": f.file_size,
            "created_at": f.created_at.isoformat(),
            "is_encoded": f.is_encoded,
        }
        for f in files
    ]


@router.get("/sent")
def get_sent(
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    sent = (
        db.query(models.SentFile)
        .filter(models.SentFile.sender_id == current_user_id)
        .order_by(models.SentFile.sent_at.desc())
        .all()
    )
    return [
        {
            "id": s.id,
            "recipient_email": s.recipient_email,
            "file_id": s.file_id,
            "filename": s.file.original_filename if s.file else "unknown",
            "sent_at": s.sent_at.isoformat(),
            "message_preview": s.message_preview,
        }
        for s in sent
    ]


@router.get("/{file_id}/download")
def download_file(
    file_id: int,
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    db_file = db.query(models.AudioFile).filter(
        models.AudioFile.id == file_id,
        models.AudioFile.owner_id == current_user_id,
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if not os.path.exists(db_file.stored_path):
        raise HTTPException(status_code=404, detail="File no longer exists on disk")

    return FileResponse(
        path=db_file.stored_path,
        media_type="audio/wav",
        filename=f"encoded_{db_file.original_filename}",
    )


@router.post("/{file_id}/send")
def send_file(
    file_id: int,
    body: SendRequest,
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    db_file = db.query(models.AudioFile).filter(
        models.AudioFile.id == file_id,
        models.AudioFile.owner_id == current_user_id,
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if not os.path.exists(db_file.stored_path):
        raise HTTPException(status_code=404, detail="File no longer exists on disk")

    try:
        email_service.send_audio_file(
            recipient_email=body.recipient_email,
            sender_name="AudioStego User",
            file_path=db_file.stored_path,
            filename=f"encoded_{db_file.original_filename}",
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    sent_record = models.SentFile(
        sender_id=current_user_id,
        recipient_email=body.recipient_email,
        file_id=file_id,
    )
    db.add(sent_record)
    db.commit()

    return {"success": True, "message": f"File sent to {body.recipient_email}"}


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    db_file = db.query(models.AudioFile).filter(
        models.AudioFile.id == file_id,
        models.AudioFile.owner_id == current_user_id,
    ).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")

    if os.path.exists(db_file.stored_path):
        os.remove(db_file.stored_path)

    # Delete related sent records
    db.query(models.SentFile).filter(models.SentFile.file_id == file_id).delete()
    db.delete(db_file)
    db.commit()
    return {"success": True, "message": "File deleted"}


@router.get("/stats")
def get_stats(
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    encoded_count = db.query(models.AudioFile).filter(
        models.AudioFile.owner_id == current_user_id,
        models.AudioFile.is_encoded == True,
    ).count()
    sent_count = db.query(models.SentFile).filter(models.SentFile.sender_id == current_user_id).count()
    return {"encoded": encoded_count, "sent": sent_count}
