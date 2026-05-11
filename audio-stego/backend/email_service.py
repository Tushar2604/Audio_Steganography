import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

def send_audio_file(
    recipient_email: str,
    sender_name: str,
    file_path: str,
    filename: str,
    message_preview: str = "",
) -> bool:
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("FROM_EMAIL", smtp_user)

    print("SMTP_USER =", smtp_user)
    print("SMTP_PASSWORD exists =", bool(smtp_password))

    if not smtp_user or not smtp_password:
        raise ValueError(
            "SMTP credentials not configured. "
            "Set SMTP_USER and SMTP_PASSWORD in your .env file."
        )

    msg = MIMEMultipart()
    msg["From"] = f"Audio Stego <{from_email}>"
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

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(from_email, recipient_email, msg.as_string())

    return True
