# Week 3 - LSB Encoding (Hiding a message in audio)
# This script hides a secret text message inside a WAV file

import wave
import numpy as np
import os

def load_audio(filepath):
    with wave.open(filepath, 'rb') as f:
        sr = f.getframerate()
        data = f.readframes(f.getnframes())
        samples = np.frombuffer(data, dtype=np.int16)
    return samples, sr

def save_audio(samples, sr, filepath):
    with wave.open(filepath, 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(samples.astype(np.int16).tobytes())

def text_to_binary(text):
    """Convert text to binary string"""
    binary = ""
    for char in text:
        binary += format(ord(char), '08b')  # each char = 8 bits
    return binary

def lsb_encode(audio_samples, message):
    """Hide a message in audio using LSB encoding"""

    # step 1: convert message to binary
    message_binary = text_to_binary(message)

    # step 2: add a 32-bit header with message length
    # this helps the decoder know how many bits to read
    length_binary = format(len(message), '032b')
    all_bits = length_binary + message_binary

    # step 3: check if audio is big enough
    if len(all_bits) > len(audio_samples):
        print("ERROR: Message too long for this audio file!")
        print(f"Need {len(all_bits)} samples, have {len(audio_samples)}")
        return None

    # step 4: hide each bit in the LSB of audio samples
    stego = audio_samples.astype(np.int32)  # use int32 to avoid overflow
    for i in range(len(all_bits)):
        bit = int(all_bits[i])
        # clear the last bit, then set it to our bit
        stego[i] = (stego[i] & ~1) | bit

    stego = stego.astype(np.int16)

    return stego


# ---- Main ----
if __name__ == "__main__":
    print("=== Week 3: LSB Encoding ===\n")

    os.makedirs("samples", exist_ok=True)

    # create test audio if needed
    audio_file = "samples/tone_440hz.wav"
    if not os.path.exists(audio_file):
        sr = 44100
        t = np.linspace(0, 3, sr * 3)
        audio = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
        save_audio(audio, sr, audio_file)

    # load audio
    samples, sr = load_audio(audio_file)
    print(f"Loaded audio: {len(samples)} samples, {sr} Hz")

    # calculate how much we can hide
    max_chars = (len(samples) - 32) // 8  # subtract header, 8 bits per char
    print(f"Max message size: {max_chars} characters")

    # our secret message
    secret = "This is a secret message hidden inside an audio file!"
    print(f"\nSecret message: '{secret}'")
    print(f"Message length: {len(secret)} characters")

    # show binary conversion
    print(f"\nFirst 3 chars in binary:")
    for ch in secret[:3]:
        print(f"  '{ch}' = {format(ord(ch), '08b')} (ASCII {ord(ch)})")

    # encode
    stego_samples = lsb_encode(samples, secret)
    if stego_samples is None:
        exit()

    # save stego audio
    save_audio(stego_samples, sr, "samples/stego_week3.wav")
    print(f"\nStego audio saved: samples/stego_week3.wav")

    # compare
    changed = np.sum(samples != stego_samples)
    print(f"\nSamples changed: {changed} out of {len(samples)}")
    print(f"That's only {changed/len(samples)*100:.4f}% of the audio")
    print(f"Max change per sample: 1 (out of 65536)")

    print("\nPlay both files - they should sound the same!")
    print("  Original: samples/tone_440hz.wav")
    print("  Stego:    samples/stego_week3.wav")
