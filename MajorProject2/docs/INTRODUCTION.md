# Chapter 1: Introduction

## 1.1 Overview

In today's digital world, secure communication has become a major concern. Every day, millions of messages, files, and documents are shared over the internet, and many of them contain sensitive or private information. While encryption is the most common method to protect data, it has one major drawback - encrypted data looks suspicious. Anyone monitoring the network can easily identify that an encrypted message is being transmitted, even if they cannot read its content. This is where steganography comes in.

Steganography is the practice of hiding secret data inside an ordinary, non-secret file so that no one suspects the existence of the hidden message. The word itself comes from the Greek words "steganos" (covered) and "graphein" (writing), meaning covered writing. Unlike encryption, which makes data unreadable, steganography makes data invisible. The carrier file looks and behaves completely normally, whether it is an image, a video, a text file, or an audio file.

Audio steganography is a specific branch of steganography that uses audio files as the carrier medium to hide secret information. Audio files are particularly well-suited for this purpose because of two main reasons. First, digital audio has a very high data rate - a standard CD-quality audio file has 44,100 samples per second, where each sample is a 16-bit number. This gives a large amount of space where data can be embedded. Second, the human auditory system is not very sensitive to small changes in audio signals. If we change a sample value by just 1 out of 65,536 possible values, no human ear can detect the difference. This makes audio a very effective cover medium.

In this project, we focus on hiding text messages inside WAV (Waveform Audio File Format) audio files. WAV is an uncompressed audio format, which means the raw sample data is stored directly without any compression. This is important because lossy compression formats like MP3 modify the audio data during compression and would destroy any hidden information. By working with WAV files, we get direct access to the raw audio samples and can manipulate them precisely.

Our project implements four different audio steganography algorithms - LSB (Least Significant Bit), Phase Coding, Echo Hiding, and Spread Spectrum. Each algorithm uses a different approach to embed data into audio, and each has its own strengths and weaknesses in terms of capacity, robustness, and detectability. By implementing all four in a single system, we can compare them directly under the same conditions and determine which algorithm is best suited for different use cases.

## 1.2 Existing Solutions

Several tools and research implementations already exist in the field of audio steganography. Some of the notable ones are:

**OpenStego** is an open-source steganography tool that primarily works with image files. It supports LSB-based data hiding and digital watermarking. However, it does not support audio steganography at all, which limits its usefulness for audio-based applications.

**Steghide** is another popular open-source tool that can embed data in JPEG, BMP, WAV, and AU files. For audio, it uses a technique based on graph theory to embed data. While it does support WAV files, it only implements a single embedding technique and does not provide any way to compare different algorithms or analyze the quality of the stego audio.

**DeepSound** is a Windows-based audio steganography tool that hides data inside WAV and FLAC files using LSB encoding. It also provides AES encryption. However, it is a closed-source tool available only on Windows, it implements only the LSB method, and it has not been updated in several years.

**SilentEye** is a cross-platform steganography tool that supports both image and audio file formats. It provides a graphical interface and supports JPEG, BMP, and WAV files. However, for audio, it only offers basic LSB encoding and does not provide any analysis or comparison features.

In academic research, many papers have proposed individual improvements to specific algorithms. For instance, improved phase coding techniques have been proposed that offer better imperceptibility, and enhanced echo hiding methods have been developed that work better with shorter audio segments. However, these implementations are typically standalone research prototypes focused on a single technique.

## 1.3 Limitations of Existing Solutions

While the existing tools and research have contributed significantly to the field, they share several common limitations:

**Single algorithm focus:** Most existing tools implement only one steganography technique, usually LSB. Users who want to compare different methods have to use different tools with different interfaces and different audio processing pipelines, making fair comparison difficult.

**No quality analysis:** Existing tools typically perform the embedding and extraction but do not provide quality metrics like SNR (Signal-to-Noise Ratio), PSNR (Peak Signal-to-Noise Ratio), or BER (Bit Error Rate). Without these metrics, users cannot objectively evaluate how much the audio quality has been affected or how reliable the extraction is.

**Limited audio format support and outdated tools:** Many tools are outdated, platform-specific (Windows only), or no longer maintained. Some require specific system configurations or dependencies that are difficult to set up on modern systems.

**No encryption integration:** Most steganography tools do not include encryption as part of their pipeline. They rely solely on the secrecy of the embedding process. If an attacker discovers the hidden data, the message is immediately readable. Combining steganography with encryption provides an additional layer of security.

**No web-based interface:** Almost all existing tools are desktop applications or command-line tools. There is no readily available web-based solution that allows users to perform audio steganography through a browser, which would make the technology more accessible.

## 1.4 Proposed Solution and Its Advantages

Our project addresses these limitations by building a unified audio steganography system with the following key features:

**Multiple algorithms in one system:** We implement four different algorithms - LSB, Phase Coding, Echo Hiding, and Spread Spectrum - all within the same codebase. All algorithms use the same audio loading, saving, and processing pipeline, which ensures that comparisons between them are fair and consistent.

**Built-in quality metrics:** Our system calculates SNR, PSNR, and BER for each algorithm after embedding. This allows users to see exactly how much the audio quality has changed and how accurate the extraction is. These metrics are displayed alongside the results so users can make informed decisions about which algorithm to use.

**Encryption layer:** Before embedding, the secret message is encrypted using AES-256 encryption with a user-provided password. The key is derived using PBKDF2 (Password-Based Key Derivation Function 2). This means that even if an attacker successfully extracts the hidden data from the audio, they still cannot read the message without the correct password. This provides double security - steganography hides the existence of the message, and encryption protects its content.

**Web-based interface:** We provide a web interface built with FastAPI that allows users to upload audio files, type their secret message, select an algorithm, and download the stego audio - all through a browser. This makes the tool accessible to users who are not comfortable with command-line tools.

**Algorithm comparison:** Since all four algorithms are implemented in the same system, users can encode the same message using different algorithms and directly compare the results in terms of capacity (how much data can be hidden), quality (how much the audio changes), and robustness (how well the hidden data survives modifications).

**Open source and modular:** The entire project is written in Python using well-known libraries like NumPy, SciPy, and Matplotlib. Each algorithm is implemented as a standalone module, making it easy to understand, modify, and extend. This also makes it useful as an educational tool for students learning about steganography.

In summary, our project fills the gap between individual research implementations and practical usability by combining multiple algorithms, encryption, quality analysis, and a web interface into a single, easy-to-use system.
