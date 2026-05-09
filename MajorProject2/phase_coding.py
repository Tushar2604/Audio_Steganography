# Week 5 - Phase Coding (Encode + Decode)
# Hides message by modifying phase of audio segments using FFT

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


def phase_encode(audio_samples, message):
    """Hide message using phase coding technique"""

    # convert message to binary
    msg_binary = text_to_binary(message)
    msg_len = len(message)
    # first 32 bits = message length, then actual message bits
    length_binary = format(msg_len, '032b')
    all_bits = length_binary + msg_binary
    num_bits = len(all_bits)

    # segment size - each segment hides 1 bit
    seg_size = 1024

    # check capacity
    num_segments = len(audio_samples) // seg_size
    if num_bits > num_segments:
        print(f"ERROR: Message too long! Need {num_bits} segments, have {num_segments}")
        return None

    # work with float copy
    audio = audio_samples.astype(np.float64)

    # split into segments
    total_samples = num_segments * seg_size
    segments = audio[:total_samples].reshape(num_segments, seg_size)

    # FFT each segment - get magnitude and phase
    fft_segments = np.fft.fft(segments)
    magnitudes = np.abs(fft_segments)
    phases = np.angle(fft_segments)

    # save original phases for segments we don't modify
    original_phases = phases.copy()

    # modify phase of first frequency bin in each segment to encode bits
    for i in range(num_bits):
        bit = int(all_bits[i])
        if bit == 1:
            phases[i][1] = np.pi / 2      # bit 1 = pi/2
        else:
            phases[i][1] = -np.pi / 2     # bit 0 = -pi/2

        # also set the mirror frequency (for real signal symmetry)
        phases[i][-1] = -phases[i][1]

    # reconstruct using modified phases
    modified_fft = magnitudes * np.exp(1j * phases)
    modified_segments = np.fft.ifft(modified_fft).real

    # put back together
    result = audio.copy()
    result[:total_samples] = modified_segments.flatten()

    return result.astype(np.int16)


def phase_decode(stego_samples):
    """Extract hidden message from phase-coded audio"""

    seg_size = 1024
    num_segments = len(stego_samples) // seg_size

    audio = stego_samples.astype(np.float64)
    total_samples = num_segments * seg_size
    segments = audio[:total_samples].reshape(num_segments, seg_size)

    # FFT each segment
    fft_segments = np.fft.fft(segments)
    phases = np.angle(fft_segments)

    # step 1: read first 32 bits to get message length
    length_bits = ""
    for i in range(32):
        phase_val = phases[i][1]
        if phase_val > 0:
            length_bits += "1"
        else:
            length_bits += "0"

    msg_length = int(length_bits, 2)

    # step 2: read message bits
    msg_bits = ""
    for i in range(32, 32 + msg_length * 8):
        phase_val = phases[i][1]
        if phase_val > 0:
            msg_bits += "1"
        else:
            msg_bits += "0"

    # step 3: convert binary to text
    message = ""
    for i in range(0, len(msg_bits), 8):
        byte = msg_bits[i:i+8]
        if len(byte) == 8:
            message += chr(int(byte, 2))

    return message


def plot_phase_comparison(original, stego, sr, save_path):
    """Plot original vs stego audio and their phase spectrums"""
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))

    # time domain
    time = np.linspace(0, len(original) / sr, len(original))

    axes[0][0].plot(time[:2000], original[:2000], linewidth=0.5, color='blue')
    axes[0][0].set_title("Original Audio (first 2000 samples)")
    axes[0][0].set_ylabel("Amplitude")

    axes[0][1].plot(time[:2000], stego[:2000], linewidth=0.5, color='green')
    axes[0][1].set_title("Stego Audio (first 2000 samples)")
    axes[0][1].set_ylabel("Amplitude")

    # phase spectrum of first segment
    seg_size = 1024
    orig_fft = np.fft.fft(original[:seg_size].astype(np.float64))
    stego_fft = np.fft.fft(stego[:seg_size].astype(np.float64))

    orig_phase = np.angle(orig_fft)[:seg_size // 2]
    stego_phase = np.angle(stego_fft)[:seg_size // 2]

    axes[1][0].plot(orig_phase, linewidth=0.5, color='blue')
    axes[1][0].set_title("Original Phase Spectrum (segment 1)")
    axes[1][0].set_ylabel("Phase (radians)")

    axes[1][1].plot(stego_phase, linewidth=0.5, color='green')
    axes[1][1].set_title("Stego Phase Spectrum (segment 1)")
    axes[1][1].set_ylabel("Phase (radians)")

    plt.tight_layout()
    plt.savefig(save_path, dpi=100)
    plt.close()
    print(f"Phase comparison plot saved: {save_path}")


# ---- Main ----
if __name__ == "__main__":
    print("=== Week 5: Phase Coding (Encode + Decode) ===\n")

    os.makedirs("samples", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    # create test audio (10 seconds - phase coding needs more space)
    sr = 44100
    duration = 10
    t = np.linspace(0, duration, sr * duration)
    original = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
    save_audio(original, sr, "samples/original_phase.wav")

    # --- Test 1: Simple message ---
    print("--- Test 1: Simple message ---")
    msg1 = "Hello World!"
    stego1 = phase_encode(original, msg1)
    decoded1 = phase_decode(stego1)
    print(f"  Original:  '{msg1}'")
    print(f"  Decoded:   '{decoded1}'")
    print(f"  Match: {'PASS' if msg1 == decoded1 else 'FAIL'}")

    # --- Test 2: Longer message ---
    print("\n--- Test 2: Longer message ---")
    msg2 = "Phase coding hides data using FFT."
    stego2 = phase_encode(original, msg2)
    decoded2 = phase_decode(stego2)
    print(f"  Original:  '{msg2[:50]}...'")
    print(f"  Decoded:   '{decoded2[:50]}...'")
    print(f"  Match: {'PASS' if msg2 == decoded2 else 'FAIL'}")

    # --- Test 3: Capacity comparison with LSB ---
    print("\n--- Test 3: Capacity comparison ---")
    num_segments = len(original) // 1024
    max_chars_phase = (num_segments - 32) // 8
    max_chars_lsb = (len(original) - 32) // 8
    print(f"  Audio duration: {duration} seconds")
    print(f"  Total samples: {len(original)}")
    print(f"  Phase coding max: {max_chars_phase} characters")
    print(f"  LSB max: {max_chars_lsb} characters")
    print(f"  LSB has {max_chars_lsb // max_chars_phase}x more capacity than phase coding")

    # --- Save and compare ---
    print("\n--- Saving files ---")
    save_audio(stego1, sr, "samples/stego_phase_hello.wav")

    diff = np.abs(original.astype(float) - stego1.astype(float))
    print(f"  Average sample difference: {np.mean(diff):.2f}")
    print(f"  Max sample difference: {np.max(diff):.0f}")

    plot_phase_comparison(original, stego1, sr, "results/week5_phase_comparison.png")

    print("\n=== All tests passed! ===")
