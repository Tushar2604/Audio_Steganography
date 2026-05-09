
# Progress Paragraphs

## Week 1

This week I read about steganography and understood the basic idea - hiding data inside normal-looking files so no one knows it's there. I learned about different types like image, text, video, and audio steganography. I set up Python with a virtual environment and installed NumPy and Matplotlib. I also wrote a small script to generate a WAV file and understood how audio is just a series of numbers sampled thousands of times per second.

## Week 2

I wrote functions to load and save WAV files using Python's wave module. I learned that a WAV file stores raw audio as 16-bit integers, so each sample is a number between -32768 and 32767. I also plotted the waveform using Matplotlib which helped me actually see what the audio signal looks like. I tested saving and reloading a file to make sure no data gets lost.

## Week 3

I started implementing the LSB algorithm. The idea is straightforward - take each audio sample and replace its last bit with a bit from the secret message. Since the last bit only changes the value by 1, it's impossible to hear the difference. I wrote the encoder which converts text to binary, adds a length header, and hides it in the audio. The tricky part was handling the bit operations correctly in Python with NumPy arrays.

## Week 4

This week I wrote the decoder to extract hidden messages from LSB-encoded audio. It reads the first 32 bits to find the message length, then pulls out that many bits and converts them back to text. I tested with different messages including special characters and long text - the decoded message matched the original every time. I also made a comparison plot showing that the original and stego waveforms look identical. With LSB fully working I started reading about phase coding as the next algorithm.

## Week 5

I started learning about phase coding which works very differently from LSB. Instead of changing sample values directly, it operates in the frequency domain. I learned how FFT (Fast Fourier Transform) breaks audio into magnitude and phase components. The idea is to split the audio into segments of 1024 samples, apply FFT on each segment, and modify the phase of a frequency bin to represent a 0 or 1. I wrote the encoding function that takes a message, converts it to binary, and embeds each bit by setting the phase to either pi/2 or -pi/2.

## Week 6

This week I wrote the phase coding decoder and tested the full encode-decode pipeline. The decoder applies FFT on each segment and checks the phase value to determine if the hidden bit is 0 or 1. I tested with short and long messages and everything decoded correctly. I also compared phase coding with LSB - for a 10-second audio, LSB can hide around 55,000 characters while phase coding can only hide about 49. The capacity is much lower because each 1024-sample segment stores just one bit. But the advantage is that phase changes are spread across the frequency spectrum which makes it harder to detect.
