import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)


def send_audio_file(
    recipient_email: str,
    sender_name: str,
    file_path: str,
    filename: str,
    message_preview: str = "",
) -> bool:
    """
    Send an encoded audio file as an email attachment.
    Returns True on success, raises on failure.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        raise ValueError(
            "SMTP credentials not configured. "
            "Set SMTP_USER and SMTP_PASSWORD in your .env file."
        )

    msg = MIMEMultipart()
    msg["From"] = f"Audio Stego <{FROM_EMAIL}>"
    msg["To"] = recipient_email
    msg["Subject"] = f"🔐 {sender_name} sent you a secret audio message"

    body = f"""
Hello,

{sender_name} has sent you a secret audio message using Audio Steganography!

{f'Message preview: "{message_preview[:50]}..."' if message_preview else ''}

To decode the hidden message, upload the attached WAV file at our platform.

Stay curious,
Audio Stego Team
    """.strip()

    msg.attach(MIMEText(body, "plain"))

    with open(file_path, "rb") as f:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(f.read())
    encoders.encode_base64(part)
    part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
    msg.attach(part)

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(FROM_EMAIL, recipient_email, msg.as_string())

    return True
