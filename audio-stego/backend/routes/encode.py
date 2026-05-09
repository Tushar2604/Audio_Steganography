import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from database import get_db
import clerk_auth
import models
import steganography

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
OUTPUTS_DIR = os.path.join(os.path.dirname(__file__), "..", "outputs")

router = APIRouter(prefix="/api/encode", tags=["encode"])


@router.post("")
async def encode_audio(
    audio_file: UploadFile = File(...),
    secret_message: str = Form(...),
    passkey: str = Form(""),
    technique: str = Form("lsb"),
    current_user_id: str = Depends(clerk_auth.get_current_user_id),
    db: Session = Depends(get_db),
):
    # Validate WAV
    if not audio_file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only WAV files are supported.")

    technique = (technique or "lsb").strip().lower()
    if technique not in ("lsb", "phase"):
        raise HTTPException(status_code=400, detail="Technique must be either 'lsb' or 'phase'.")

    # Save uploaded file
    upload_id = uuid.uuid4().hex
    upload_filename = f"{upload_id}_{audio_file.filename}"
    upload_path = os.path.join(UPLOADS_DIR, upload_filename)

    content = await audio_file.read()
    with open(upload_path, "wb") as f:
        f.write(content)

    # Encode
    output_filename = f"encoded_{upload_id}_{audio_file.filename}"
    output_path = os.path.join(OUTPUTS_DIR, output_filename)

    try:
        steganography.encode_message(upload_path, secret_message, output_path, passkey, technique)
    except ValueError as e:
        os.remove(upload_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        os.remove(upload_path)
        raise HTTPException(status_code=500, detail=f"Encoding failed: {str(e)}")

    # Save DB record
    file_size = os.path.getsize(output_path)
    db_file = models.AudioFile(
        owner_id=current_user_id,
        original_filename=audio_file.filename,
        stored_path=output_path,
        file_size=file_size,
        is_encoded=True,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Clean up upload
    os.remove(upload_path)

    return {
        "file_id": db_file.id,
        "filename": output_filename,
        "file_size": file_size,
        "technique": technique,
        "message": "Message encoded successfully!",
    }


@router.get("/capacity")
async def get_capacity(
    audio_file: UploadFile = File(...),
):
    """Return the max character capacity for the uploaded audio file."""
    if not audio_file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only WAV files are supported.")

    upload_id = uuid.uuid4().hex
    tmp_path = os.path.join(UPLOADS_DIR, f"tmp_{upload_id}.wav")
    content = await audio_file.read()
    with open(tmp_path, "wb") as f:
        f.write(content)

    try:
        capacity = steganography.get_max_capacity(tmp_path)
    finally:
        os.remove(tmp_path)

    return {"capacity": capacity}
