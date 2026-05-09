# Audio Steganography - 12 Week Plan

## Week 1 - Research & Setup
- Read about steganography (what it is, types, applications)
- Understand how audio files work (WAV format, sampling, bit depth)
- Install Python, create virtual environment
- Install numpy, matplotlib
- Write a small script to load and play a WAV file
- **Show guide:** project idea, 1-page write-up on steganography basics

## Week 2 - Audio File Handling
- Learn to read WAV files using Python wave module
- Display audio properties (duration, sample rate, channels)
- Plot audio waveform using matplotlib
- Save modified audio back to WAV
- **Show guide:** working script that loads, displays info, and plots audio

## Week 3 - LSB Algorithm (Encoding)
- Understand how LSB works (theory + examples on paper)
- Convert text to binary
- Replace LSB of audio samples with message bits
- Save stego audio and compare with original
- **Show guide:** encode a message into audio, play both files

## Week 4 - LSB Algorithm (Decoding)
- Extract LSB from stego audio samples
- Convert binary back to text
- Add message length header for automatic extraction
- Test with different messages and audio files
- **Show guide:** full encode-decode working, test results

## Week 5 - Phase Coding Algorithm
- Study FFT basics (what is frequency domain)
- Implement phase coding encoder and decoder
- Compare output quality with LSB
- **Show guide:** phase coding demo, comparison with LSB

## Week 6 - Echo Hiding Algorithm
- Study how echo/delay works in audio
- Implement echo hiding encoder
- Implement decoder using autocorrelation
- **Show guide:** echo hiding demo, comparison table so far

## Week 7 - Spread Spectrum Algorithm
- Study spread spectrum theory
- Implement DSSS encoder and decoder
- All 4 algorithms now complete
- **Show guide:** all algorithms working, basic comparison

## Week 8 - Encryption Layer
- Add AES encryption before hiding message
- Password-based key derivation
- Integrate with all algorithms
- **Show guide:** encrypted message hiding demo

## Week 9 - Web Interface
- Build FastAPI web app with upload/download
- Encode and decode pages
- Algorithm selection dropdown
- **Show guide:** working web interface

## Week 10 - Testing & Quality Metrics
- Calculate SNR, PSNR, BER for each algorithm
- Test robustness (add noise, compress to MP3)
- Create comparison table and charts
- **Show guide:** metrics results, comparison charts

## Week 11 - Documentation & Report
- Write project report (intro, literature review, implementation, results)
- Create user manual
- Clean up code, add comments
- **Show guide:** draft report

## Week 12 - Final Presentation
- Prepare slides (15-20)
- Practice demo
- Final submission
- **Show guide:** final presentation rehearsal
