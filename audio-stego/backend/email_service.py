import os
import base64
import urllib.request
import urllib.error
import json


def send_audio_file(
    recipient_email: str,
    sender_name: str,
    file_path: str,
    filename: str,
    message_preview: str = "",
) -> bool:
    api_key = os.getenv("RESEND_API_KEY", "")
    from_email = os.getenv("FROM_EMAIL", "Audio Stego <onboarding@resend.dev>")

    if not api_key:
        raise ValueError(
            "Resend API key not configured. Set RESEND_API_KEY in your environment."
        )

    with open(file_path, "rb") as f:
        file_content = base64.b64encode(f.read()).decode("utf-8")

    body = f"""Hello,

{sender_name} has sent you a secret audio message using Audio Steganography!

{f'Message preview: "{message_preview[:50]}..."' if message_preview else ''}

To decode the hidden message, upload the attached WAV file at our platform.

Stay curious,
Audio Stego Team""".strip()

    payload = json.dumps({
        "from": from_email,
        "to": [recipient_email],
        "subject": f"{sender_name} sent you a secret audio message",
        "text": body,
        "attachments": [
            {
                "filename": filename,
                "content": file_content,
            }
        ],
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode("utf-8"))
            print("Email sent, id:", result.get("id"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        raise RuntimeError(f"Resend API error {e.code}: {error_body}")

    return True
