# Quick Reference - Definitions & Full Forms

---

## Full Forms

- **AES** - Advanced Encryption Standard
- **LSB** - Least Significant Bit
- **FFT** - Fast Fourier Transform
- **IFFT** - Inverse Fast Fourier Transform
- **DSSS** - Direct Sequence Spread Spectrum
- **SNR** - Signal to Noise Ratio
- **PSNR** - Peak Signal to Noise Ratio
- **BER** - Bit Error Rate
- **WAV** - Waveform Audio File Format
- **PBKDF2** - Password-Based Key Derivation Function 2

---

## Algorithm Definitions

**LSB (Least Significant Bit):**
Hides data by replacing the last bit of each audio sample with a bit of the secret message. Since the last bit changes the sample value by only ±1, the change is inaudible.

**Phase Coding:**
Splits audio into segments, converts each to frequency domain using FFT, and modifies the phase component to encode bits. Human ears cannot detect small phase changes, making it harder to detect than LSB.

**Echo Hiding:**
Embeds data by adding a small echo to audio segments. A different echo delay represents a different bit value (e.g., delay of 150 samples = 0, delay of 200 samples = 1). The decoder detects which delay was used through autocorrelation.

**Spread Spectrum (DSSS):**
Spreads each message bit across many audio samples using a pseudo-random noise sequence. The signal is added at very low amplitude. The decoder uses the same noise sequence to extract the bits through correlation.

**AES-256 Encryption:**
A symmetric encryption standard that uses a 256-bit key to encrypt data. We derive this key from a user password using PBKDF2. Even if someone extracts the hidden data, they cannot read it without the password.

---

## The "1 out of 65,536" Explanation

- Each audio sample is **16 bits**
- 16 bits can represent 2^16 = **65,536** different values
- Range: -32,768 to +32,767
- When we change the LSB, the sample value changes by **±1**
- So the change is 1 out of 65,536 possible values
- That's **0.0015%** change - completely inaudible

**Note:** 65,536 is the number of possible values, not bits. The sample is 16 bits, and we change 1 bit out of those 16 bits. But the impact on the actual value is 1 out of 65,536.

**How to explain it simply:**
"A 16-bit audio sample can hold values from -32,768 to +32,767 - that's 65,536 possible values. When we change the last bit, the value shifts by just 1. That's like changing the volume by 0.0015%. No human ear can detect that."

---

## How to Run the Code (If Panel Asks for Demo)

**Step 1: Open terminal, go to project folder**
```
cd /Users/muskanraghav/Documents/MajorProject2
```

**Step 2: Activate virtual environment**
```
source venv/bin/activate
```

**Step 3: Run whichever script they ask for**

```
python3 week1_basics.py
```
Shows: audio basics, how samples work, LSB concept with binary example

```
python3 week2_audio_handling.py
```
Shows: loads WAV file, prints info, plots waveform, saves to results/

```
python3 week3_lsb_encode.py
```
Shows: hides a message in audio, prints how many samples changed

```
python3 week4_lsb_decode.py
```
Shows: encodes + decodes messages, runs 3 tests, all show PASS

```
python3 week5_phase_coding.py
```
Shows: phase coding encode/decode, compares capacity with LSB

**If something goes wrong:**
- "venv not found" → run `python3 -m venv venv` first then activate
- "module not found" → run `pip install numpy scipy matplotlib`
- Script fails → show the screenshots/plots in results/ folder as backup
