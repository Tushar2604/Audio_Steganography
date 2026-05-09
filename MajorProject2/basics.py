# Week 1 - Understanding Audio Basics
# This script generates a simple audio file and helps understand
# how digital audio works

import numpy as np
import wave

# --- What is digital audio? ---
# Sound is a wave. To store it digitally, we take "samples" of the wave
# at regular intervals. Common sample rate is 44100 samples per second.

sample_rate = 44100  # samples per second (CD quality)
duration = 3         # seconds

# Generate a simple tone (A note = 440 Hz)
t = np.linspace(0, duration, sample_rate * duration)
audio = np.sin(2 * np.pi * 440 * t)

# Scale to 16-bit range (-32768 to 32767)
audio = (audio * 16000).astype(np.int16)

print("=== Audio Basics ===")
print(f"Sample rate: {sample_rate} Hz")
print(f"Duration: {duration} seconds")
print(f"Total samples: {len(audio)}")
print(f"Each sample is a number between {audio.min()} and {audio.max()}")
print(f"Sample values (first 10): {audio[:10]}")

# Save as WAV file
with wave.open("samples/tone_440hz.wav", "wb") as f:
    f.setnchannels(1)       # mono
    f.setsampwidth(2)       # 2 bytes = 16 bit
    f.setframerate(sample_rate)
    f.writeframes(audio.tobytes())

print("\nSaved: samples/tone_440hz.wav")
print("Play this file to hear a 440Hz tone (A note)")

# --- Why is this useful for steganography? ---
# Each sample is a 16-bit number. If we change just the LAST bit,
# the value changes by only 1. That's too small to hear!
#
# Example:
#   Original sample: 12345
#   Modified sample: 12344 (changed last bit)
#   Difference: just 1 out of 65536 possible values
#
# This is the basic idea behind LSB steganography.

print("\n=== LSB Concept ===")
sample = 12345
print(f"Original sample:  {sample} = {format(sample, '016b')}")
print(f"                                              ^")
print(f"                                    LSB (last bit)")

modified = sample & ~1  # clear last bit (set to 0)
print(f"Clear last bit:   {modified} = {format(modified, '016b')}")

modified = sample | 1   # set last bit (set to 1)
print(f"Set last bit:     {modified} = {format(modified, '016b')}")

print(f"\nMax change: just 1 out of {2**16} values = {1/2**16*100:.4f}%")
print("This change is IMPOSSIBLE to hear!")
