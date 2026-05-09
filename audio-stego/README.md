# 🔐 AudioStego — Audio Steganography Platform

A full-stack web application to **hide secret messages inside WAV audio files** using LSB (Least Significant Bit) steganography.

---

## 🚀 Quick Start

### Backend (FastAPI)

```bash
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: **http://localhost:8000**  
API docs: **http://localhost:8000/docs**

---

### Frontend (React + Vite + TailwindCSS)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

Before running frontend, set Clerk key:

```bash
cp frontend/.env.example frontend/.env
```

---

## ⚙️ Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in values:

```env
DATABASE_URL=sqlite:///./audio_stego.db
CLERK_ISSUER=https://YOUR-CLERK-DOMAIN.clerk.accounts.dev

# Optional: SMTP for email sending
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your@gmail.com
```

> **Gmail tip:** Enable 2FA → generate an App Password at myaccount.google.com/apppasswords

---

## 🧠 How It Works — LSB Steganography

Each WAV audio sample is stored as a byte. The **Least Significant Bit** of each byte is changed to encode one bit of the secret message:

```
Original byte:  1 0 1 1 0 1 1 0  (value: 182)
Message bit '1' → flip LSB
Encoded byte:   1 0 1 1 0 1 1 1  (value: 183)
```

The audio value changes by at most ±1 — completely **inaudible** to humans, but detectable by software.

---

## 📁 Project Structure

```
audio-stego/
├── backend/
│   ├── main.py              # FastAPI app + CORS + DB init
│   ├── models.py            # SQLAlchemy ORM (AudioFile, SentFile)
│   ├── steganography.py     # LSB encode/decode with wave module
│   ├── email_service.py     # SMTP email with attachment
│   ├── database.py          # SQLite session
│   ├── routes/
│   │   ├── encode.py        # /api/encode
│   │   ├── decode.py        # /api/decode
│   │   └── files.py         # /api/files/* (history, download, send, delete)
│   ├── uploads/             # Temp uploads
│   └── outputs/             # Encoded output files
│
└── frontend/
    └── src/
        ├── pages/           # Landing, Dashboard, Encode, Decode, History
        ├── components/      # Sidebar, Waveform, DropZone, SendModal, StepIndicator
        └── api/             # Axios instance
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **Clerk Authentication** | Secure login with user-specific workspace and API protection |
| **Dual Encoding Modes** | Basic LSB and advanced Phase Encoding for WAV files |
| **Dual Decoding Modes** | Decode using matching LSB or Phase technique |
| **Passkey Protection** | Optional passkey wraps the message for extra security |
| **Email Delivery** | Send encoded WAV as email attachment via SMTP |
| **User-scoped History** | View, download, re-send, or delete files only from your account |
| **Waveform Preview** | WaveSurfer.js real-time waveform visualization |
| **Capacity Indicator** | Shows how much of the audio's capacity the message uses |
| **Dark Premium UI** | Glassmorphism, neon accents, Framer Motion animations |
| **Mobile Responsive** | Hamburger menu, responsive tables, adaptive layout |
