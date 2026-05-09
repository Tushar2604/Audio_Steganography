# Week 2 - Audio File Handling
# Load WAV files, display info, plot waveform, save audio

import wave
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os

def load_audio(filepath):
    """Load a WAV file and return samples + sample rate"""
    with wave.open(filepath, 'rb') as f:
        sample_rate = f.getframerate()
        n_frames = f.getnframes()
        n_channels = f.getnchannels()
        audio_data = f.readframes(n_frames)
        samples = np.frombuffer(audio_data, dtype=np.int16)

        # convert stereo to mono if needed
        if n_channels == 2:
            samples = samples.reshape(-1, 2).mean(axis=1).astype(np.int16)

    return samples, sample_rate


def save_audio(samples, sample_rate, filepath):
    """Save samples to a WAV file"""
    with wave.open(filepath, 'wb') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(samples.astype(np.int16).tobytes())


def audio_info(filepath):
    """Print info about an audio file"""
    with wave.open(filepath, 'rb') as f:
        print(f"File: {filepath}")
        print(f"  Channels: {f.getnchannels()}")
        print(f"  Sample Rate: {f.getframerate()} Hz")
        print(f"  Bit Depth: {f.getsampwidth() * 8} bit")
        print(f"  Frames: {f.getnframes()}")
        print(f"  Duration: {f.getnframes() / f.getframerate():.2f} seconds")


def plot_waveform(samples, sample_rate, title="Waveform", filename=None):
    """Plot audio waveform"""
    time = np.linspace(0, len(samples) / sample_rate, len(samples))

    plt.figure(figsize=(10, 3))
    plt.plot(time, samples, linewidth=0.5)
    plt.xlabel("Time (seconds)")
    plt.ylabel("Amplitude")
    plt.title(title)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    if filename:
        plt.savefig(filename, dpi=100)
        print(f"Saved plot: {filename}")
    else:
        plt.show()
    plt.close()


# ---- Main ----
if __name__ == "__main__":
    print("=== Week 2: Audio File Handling ===\n")

    # make sure samples folder exists
    os.makedirs("samples", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    # first create a test audio if it doesn't exist
    test_file = "samples/tone_440hz.wav"
    if not os.path.exists(test_file):
        print("Creating test audio file...")
        sr = 44100
        t = np.linspace(0, 3, sr * 3)
        audio = (np.sin(2 * np.pi * 440 * t) * 16000).astype(np.int16)
        save_audio(audio, sr, test_file)

    # load and display info
    print("--- Audio Info ---")
    audio_info(test_file)

    # load samples
    samples, sr = load_audio(test_file)
    print(f"\n--- Sample Data ---")
    print(f"Total samples: {len(samples)}")
    print(f"Min value: {samples.min()}")
    print(f"Max value: {samples.max()}")
    print(f"First 5 samples: {samples[:5]}")

    # plot waveform
    print(f"\n--- Plotting ---")
    plot_waveform(samples, sr, "440 Hz Tone", "results/week2_waveform.png")

    # test save and reload
    save_audio(samples, sr, "samples/test_copy.wav")
    reloaded, _ = load_audio("samples/test_copy.wav")
    match = np.array_equal(samples, reloaded)
    print(f"\nSave/Load test: {'PASSED' if match else 'FAILED'}")

    print("\nDone!")
