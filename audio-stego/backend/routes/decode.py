import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
import clerk_auth
import steganography

UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")

router = APIRouter(prefix="/api/decode", tags=["decode"])


@router.post("")
async def decode_audio(
    audio_file: UploadFile = File(...),
    passkey: str = Form(""),
    technique: str = Form("lsb"),
    _current_user_id: str = Depends(clerk_auth.get_current_user_id),
):
    if not audio_file.filename.lower().endswith(".wav"):
        raise HTTPException(status_code=400, detail="Only WAV files are supported.")
    technique = (technique or "lsb").strip().lower()
    if technique not in ("lsb", "phase"):
        raise HTTPException(status_code=400, detail="Technique must be either 'lsb' or 'phase'.")

    upload_id = uuid.uuid4().hex
    tmp_path = os.path.join(UPLOADS_DIR, f"decode_{upload_id}.wav")

    content = await audio_file.read()
    with open(tmp_path, "wb") as f:
        f.write(content)

    try:
        message = steganography.decode_message(tmp_path, passkey, technique)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decoding failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    return {"message": message, "technique": technique}
