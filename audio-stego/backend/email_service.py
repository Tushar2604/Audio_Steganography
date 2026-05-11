import os
import base64
import resend


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

    resend.api_key = api_key

    with open(file_path, "rb") as f:
        file_content = base64.b64encode(f.read()).decode("utf-8")

    body = f"""Hello,

{sender_name} has sent you a secret audio message using Audio Steganography!

{f'Message preview: "{message_preview[:50]}..."' if message_preview else ''}

To decode the hidden message, upload the attached WAV file at our platform.

Stay curious,
Audio Stego Team""".strip()

    params: resend.Emails.SendParams = {
        "from": from_email,
        "to": [recipient_email],
        "subject": f"{sender_name} sent you a secret audio message",
        "text": body,
        "attachments": [
            {
                "filename": filename,
                "content": list(base64.b64decode(file_content)),
            }
        ],
    }

    email = resend.Emails.send(params)
    print("Email sent, id:", email.get("id"))
    return True
