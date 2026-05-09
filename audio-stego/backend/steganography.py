import math
import wave
from typing import Literal

import numpy as np


DELIMITER = "1111111111111110"
Technique = Literal["lsb", "phase"]
PHASE_BLOCK_SIZE = 1024


def _build_payload(message: str, passkey: str) -> str:
    if passkey:
        return f"__PK__{passkey}__MSG__{message}"
    return message


def _payload_to_binary(payload: str) -> str:
    message_binary = "".join(format(ord(c), "08b") for c in payload)
    return message_binary + DELIMITER


def _binary_to_payload(message_binary: str) -> str:
    if len(message_binary) % 8 != 0:
        raise ValueError("Decoded binary is malformed - no valid message found.")
    chars = [chr(int(message_binary[i : i + 8], 2)) for i in range(0, len(message_binary), 8)]
    return "".join(chars)


def _resolve_payload(payload: str, passkey: str) -> str:
    if payload.startswith("__PK__"):
        parts = payload.split("__MSG__", 1)
        if len(parts) != 2:
            raise ValueError("Corrupted passkey-protected message.")
        stored_key = parts[0].replace("__PK__", "", 1)
        actual_message = parts[1]
        if passkey and stored_key != passkey:
            raise ValueError("Incorrect passkey. Cannot decrypt the message.")
        if not passkey:
            raise ValueError("This message is passkey-protected. Please provide the passkey.")
        return actual_message
    return payload


def _encode_lsb(audio_path: str, message: str, output_path: str, passkey: str = "") -> None:
    """
    Encode a secret message into a WAV audio file using LSB steganography.
    If a passkey is provided, it is prepended to the message with a separator.
    """
    payload = _build_payload(message, passkey)
    message_binary = _payload_to_binary(payload)

    with wave.open(audio_path, "rb") as audio:
        frames = bytearray(audio.readframes(audio.getnframes()))
        params = audio.getparams()

    if len(message_binary) > len(frames):
        raise ValueError(
            f"Message too large for this audio file. "
            f"Max capacity: {(len(frames) - 16) // 8} characters."
        )

    for i, bit in enumerate(message_binary):
        frames[i] = (frames[i] & ~1) | int(bit)

    with wave.open(output_path, "wb") as out:
        out.setparams(params)
        out.writeframes(bytes(frames))


def _decode_lsb(audio_path: str, passkey: str = "") -> str:
    """
    Decode a secret message from a WAV audio file using LSB steganography.
    """
    with wave.open(audio_path, "rb") as audio:
        frames = bytearray(audio.readframes(audio.getnframes()))

    binary = ""
    for byte in frames:
        binary += str(byte & 1)
        if len(binary) >= 16 and binary.endswith(DELIMITER):
            break
    else:
        raise ValueError("No hidden message found or audio file is corrupted.")

    payload = _binary_to_payload(binary[: -len(DELIMITER)])
    return _resolve_payload(payload, passkey)


def _encode_phase(audio_path: str, message: str, output_path: str, passkey: str = "") -> None:
    """
    Encode using phase modulation in FFT blocks.
    One bit is stored in each block using the phase sign of a low-frequency bin.
    """
    payload = _build_payload(message, passkey)
    message_binary = _payload_to_binary(payload)

    with wave.open(audio_path, "rb") as audio:
        params = audio.getparams()
        sampwidth = audio.getsampwidth()
        n_channels = audio.getnchannels()
        frames = audio.readframes(audio.getnframes())

    if sampwidth != 2:
        raise ValueError("Phase encoding currently supports 16-bit PCM WAV files only.")

    samples = np.frombuffer(frames, dtype=np.int16).copy()
    if n_channels > 1:
        sample_matrix = samples.reshape(-1, n_channels)
        working = sample_matrix[:, 0].astype(np.float64)
    else:
        sample_matrix = None
        working = samples.astype(np.float64)

    capacity_bits = len(working) // PHASE_BLOCK_SIZE
    if len(message_binary) > capacity_bits:
        max_chars = max((capacity_bits - len(DELIMITER)) // 8, 0)
        raise ValueError(
            f"Message too large for phase encoding in this audio file. Max capacity: {max_chars} characters."
        )

    for bit_idx, bit in enumerate(message_binary):
        start = bit_idx * PHASE_BLOCK_SIZE
        end = start + PHASE_BLOCK_SIZE
        block = working[start:end]

        spec = np.fft.fft(block)
        k = 1
        phase_target = math.pi / 2 if bit == "1" else -math.pi / 2
        mag = np.abs(spec[k])
        spec[k] = mag * np.exp(1j * phase_target)
        spec[-k] = np.conj(spec[k])

        encoded_block = np.fft.ifft(spec).real
        working[start:end] = encoded_block

    encoded = np.clip(np.round(working), -32768, 32767).astype(np.int16)
    if sample_matrix is not None:
        sample_matrix[:, 0] = encoded
        output_samples = sample_matrix.astype(np.int16).reshape(-1)
    else:
        output_samples = encoded

    with wave.open(output_path, "wb") as out:
        out.setparams(params)
        out.writeframes(output_samples.tobytes())


def _decode_phase(audio_path: str, passkey: str = "") -> str:
    with wave.open(audio_path, "rb") as audio:
        sampwidth = audio.getsampwidth()
        n_channels = audio.getnchannels()
        frames = audio.readframes(audio.getnframes())

    if sampwidth != 2:
        raise ValueError("Phase decoding currently supports 16-bit PCM WAV files only.")

    samples = np.frombuffer(frames, dtype=np.int16)
    if n_channels > 1:
        working = samples.reshape(-1, n_channels)[:, 0].astype(np.float64)
    else:
        working = samples.astype(np.float64)

    n_blocks = len(working) // PHASE_BLOCK_SIZE
    bits = []
    for block_idx in range(n_blocks):
        start = block_idx * PHASE_BLOCK_SIZE
        end = start + PHASE_BLOCK_SIZE
        block = working[start:end]
        spec = np.fft.fft(block)
        phase = np.angle(spec[1])
        bits.append("1" if phase >= 0 else "0")
        if len(bits) >= len(DELIMITER) and "".join(bits[-len(DELIMITER) :]) == DELIMITER:
            break
    else:
        raise ValueError("No hidden message found for phase decoding.")

    payload = _binary_to_payload("".join(bits[: -len(DELIMITER)]))
    return _resolve_payload(payload, passkey)


def encode_message(
    audio_path: str,
    message: str,
    output_path: str,
    passkey: str = "",
    technique: Technique = "lsb",
) -> None:
    if technique == "lsb":
        _encode_lsb(audio_path, message, output_path, passkey)
        return
    if technique == "phase":
        _encode_phase(audio_path, message, output_path, passkey)
        return
    raise ValueError("Unsupported encoding technique.")


def decode_message(audio_path: str, passkey: str = "", technique: Technique = "lsb") -> str:
    if technique == "lsb":
        return _decode_lsb(audio_path, passkey)
    if technique == "phase":
        return _decode_phase(audio_path, passkey)
    raise ValueError("Unsupported decoding technique.")


def get_max_capacity(audio_path: str, technique: Technique = "lsb") -> int:
    """Return max number of characters that can be hidden in this audio file."""
    with wave.open(audio_path, "rb") as audio:
        n_frames = audio.getnframes()
        n_channels = audio.getnchannels()
        sampwidth = audio.getsampwidth()

    if technique == "lsb":
        total_bytes = n_frames * n_channels * sampwidth
        return max((total_bytes - len(DELIMITER)) // 8, 0)

    if technique == "phase":
        if sampwidth != 2:
            return 0
        total_samples = n_frames * n_channels
        capacity_bits = total_samples // PHASE_BLOCK_SIZE
        return max((capacity_bits - len(DELIMITER)) // 8, 0)

    raise ValueError("Unsupported technique for capacity calculation.")
