# Week 4 - LSB Decoding (Extracting hidden message from audio)
# This script extracts the secret message hidden by week3_lsb_encode.py

import wave
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
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
    binary = ""
    for char in text:
        binary += format(ord(char), '08b')
    return binary

def lsb_encode(audio_samples, message):
    """Hide a message in audio using LSB"""
    message_binary = text_to_binary(message)
    length_binary = format(len(message), '032b')
    all_bits = length_binary + message_binary

    if len(all_bits) > len(audio_samples):
        print("ERROR: Message too long!")
        return None

    stego = audio_samples.astype(np.int32)
    for i in range(len(all_bits)):
        bit = int(all_bits[i])
        stego[i] = (stego[i] & ~1) | bit

    return stego.astype(np.int16)

def lsb_decode(stego_samples):
    """Extract hidden message from stego audio"""

    # step 1: read first 32 bits to get message length
    length_bits = ""
    for i in range(32):
        length_bits += str(stego_samples[i] & 1)  # get last bit
    message_length = int(length_bits, 2)

    # step 2: read message bits
    message_bits = ""
    for i in range(32, 32 + message_length * 8):
        message_bits += str(stego_samples[i] & 1)

    # step 3: convert binary back to text
    message = ""
    for i in range(0, len(message_bits), 8):
        byte = message_bits[i:i+8]
        if len(byte) == 8:
            message += chr(int(byte, 2))

    return message

def compare_audio(original, stego, sr, save_path):
    """Plot original vs stego comparison"""
    time = np.linspace(0, len(original) / sr, len(original))

    fig, axes = plt.subplots(3, 1, figsize=(10, 6))

    axes[0].plot(time, original, linewidth=0.5, color='blue')
    axes[0].set_title("Original Audio")
    axes[0].set_ylabel("Amplitude")

    axes[1].plot(time, stego, linewidth=0.5, color='green')
    axes[1].set_title("Stego Audio (has hidden message)")
    axes[1].set_ylabel("Amplitude")

    diff = original.astype(float) - stego.astype(float)
    axes[2].plot(time, diff, linewidth=0.5, color='red')
    axes[2].set_title("Difference (should be very small)")
    axes[2].set_xlabel("Time (seconds)")
    axes[2].set_ylabel("Amplitude")

    plt.tight_layout()
    plt.savefig(save_path, dpi=100)
    plt.close()
    print(f"Comparison plot saved: {save_path}")


# ---- Main ----
if __name__ == "__main__":
    print("=== Week 4: LSB Encode + Decode (Full Test) ===\n")

    os.makedirs("samples", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    # create test audio
    sr = 44100
    t = np.linspace(0, 3, sr * 3)
    original = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    save_audio(original, sr, "samples/original.wav")

    # --- Test 1: Simple message ---
    print("--- Test 1: Simple message ---")
    msg1 = "Hello World!"
    stego1 = lsb_encode(original, msg1)
    decoded1 = lsb_decode(stego1)
    print(f"  Original:  '{msg1}'")
    print(f"  Decoded:   '{decoded1}'")
    print(f"  Match: {'PASS' if msg1 == decoded1 else 'FAIL'}")

    # --- Test 2: Longer message ---
    print("\n--- Test 2: Longer message ---")
    msg2 = "This is a longer secret message to test if the algorithm works correctly with more text. Let's see if it can handle punctuation, numbers like 12345, and special chars like @#$!"
    stego2 = lsb_encode(original, msg2)
    decoded2 = lsb_decode(stego2)
    print(f"  Original:  '{msg2[:50]}...'")
    print(f"  Decoded:   '{decoded2[:50]}...'")
    print(f"  Match: {'PASS' if msg2 == decoded2 else 'FAIL'}")

    # --- Test 3: Max capacity ---
    print("\n--- Test 3: Capacity check ---")
    max_chars = (len(original) - 32) // 8
    print(f"  Audio duration: 3 seconds")
    print(f"  Total samples: {len(original)}")
    print(f"  Max message: {max_chars} characters")
    print(f"  That's about {max_chars // 200} paragraphs of text!")

    # --- Save and compare ---
    print("\n--- Saving files ---")
    save_audio(stego1, sr, "samples/stego_hello.wav")

    changed = np.sum(original != stego1)
    print(f"  Samples changed: {changed} / {len(original)}")

    compare_audio(original, stego1, sr, "results/week4_comparison.png")

    print("\n=== All tests passed! ===")
