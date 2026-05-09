# Presentation Slides Content

---

## Slide 1 - Title Slide

**Audio Steganography: Hiding Secret Messages in Audio Files**

- [Your Name], [Roll Number]
- Guide: [Guide Name]
- Department of [Your Department]
- [College Name], [Year]

---

## Slide 2 - Introduction / Abstract

- Steganography = hiding secret data inside normal-looking files
- Unlike encryption, it hides the existence of the message itself
- Types: Text, Image, Audio, Video steganography
- This project: hiding text inside WAV audio files
- 4 algorithms implemented and compared

*[Diagram: Sender → Audio + Message → Stego Audio → Receiver extracts message]*

---

## Slide 3 - Problem Statement

- Encrypted messages attract suspicion during surveillance
- Need communication where the message's existence is hidden
- Image steganography is well-explored, audio is not
- No tool compares multiple audio steganography methods

*[Diagram: Encryption vs Steganography comparison - show encrypted text looks suspicious, stego audio looks normal]*

---

## Slide 4 - Motivation & Objectives

- Audio has high data rate (44,100 samples/sec)
- Human ears are less sensitive to small changes than eyes
- Audio files are commonly shared and don't raise suspicion

**Objectives:**
- Implement LSB, Phase Coding, Echo Hiding, Spread Spectrum
- Add AES-256 encryption + FastAPI web interface
- Compare using SNR, PSNR, BER metrics

---

## Slide 5 - Literature Survey

| Paper | Technique | Limitation |
|---|---|---|
| Springer, 2012 | LSB, Phase, Echo, Spread overview | Survey only |
| arXiv, 2024 | Improved phase coding | Low capacity |
| arXiv, 2021 | Echo hiding improvement | Needs long audio |
| PMC, 2022 | Spread spectrum for audio | Needs original to decode |

- **Gap:** No tool implements all four + compares them
- **Our work:** Single system with all 4 + comparison

---

## Slide 6 - Methodology & Architecture

*[Flowchart:]*

**Encoding:**
```
Audio File + Message + Password
    → AES Encrypt
    → Convert to Binary
    → Embed (LSB/Phase/Echo/Spread)
    → Stego Audio Output
```

**Decoding:**
```
Stego Audio + Password
    → Extract Binary
    → AES Decrypt
    → Original Message
```

---

## Slide 7 - System Design

| Component | Technology |
|---|---|
| Language | Python 3 |
| Audio | NumPy, SciPy, wave |
| Visualization | Matplotlib |
| Encryption | cryptography (AES-256) |
| Web | FastAPI, Jinja2, Bootstrap |

**Hardware:** Any system with Python 3.10+, 4GB RAM

*[Module diagram showing: Audio Handler, 4 Algorithm modules, Encryption, Metrics, Web Interface]*

---

## Slide 8 - Implementation

- Implemented LSB (Least Significant Bit) steganography
- Each audio sample is 16-bit, we replace the last bit with message bit
- Change per sample = ±1 out of 65,536 (inaudible)
- 32-bit header stores message length for automatic extraction
- Capacity: ~5,500 characters per second of audio
- Tools used: Python 3, NumPy, wave module, Matplotlib

*[Screenshot: week3/week4 terminal output showing encode/decode]*

---

## Slide 9 - Results & Analysis

**LSB Algorithm Test Results (3 second audio):**

| Metric | Value |
|---|---|
| Capacity | ~5,500 chars/sec |
| Samples modified | 0.16% |
| Max change per sample | ±1 |
| Extraction accuracy | 100% |

- Tested with short and long messages - all extracted correctly
- Original and stego audio sound identical

*[Screenshot: week4 test output showing PASS]*
*[Image: results/week4_comparison.png - waveform comparison]*

---

## Slide 10 - Conclusion & Future Scope

**Done:** LSB + Phase Coding with full encode/decode, 100% accuracy
**Remaining:** Echo Hiding, Spread Spectrum, Encryption, Web UI, Metrics

**Limitations:**
- WAV format only
- Phase coding has low capacity
- Spread spectrum needs original audio

**Future Scope:**
- MP3 support, mobile app, ML-based steganalysis

---

## Slide 11 - References

1. "Comparative study of digital audio steganography" - Springer, 2012
2. "Improved Phase Coding Algorithm" - arXiv, 2024
3. "Method for Improving Echo Hiding" - arXiv, 2021
4. "Spread Spectrum for Data Hiding in Audio" - PMC, 2022
5. Python wave module - docs.python.org
6. NumPy - numpy.org
