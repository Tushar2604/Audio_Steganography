# Presentation Script - Slides 1 to 6

---

## Slide 1 - Title Slide

**Just say:**
"Good morning/afternoon everyone. Our project is Audio Steganography - hiding secret messages inside audio files. My name is [name], my guide is [guide name]."

Then move to next slide. Don't spend more than 15 seconds here.

---

## Slide 2 - Introduction

**Say this in your own words:**

"So first, what is steganography? In simple words, it means hiding secret data inside a normal-looking file. For example, I can take a regular audio file - a song or a voice recording - and hide a text message inside it. And the best part is, if someone plays that audio, it sounds exactly the same. They won't even know there's something hidden in it."

"This is different from encryption. If I encrypt a message, anyone who sees it knows I'm hiding something - the data looks like random garbage. But with steganography, the file looks completely normal."

"Steganography can be done on different media - text, images, audio, video. Our project focuses specifically on audio steganography using WAV files."

**If panel asks: "What's the difference between encryption and steganography?"**
"Encryption changes the message so it can't be read. Steganography hides the message so no one knows it exists. We actually use both together - first encrypt, then hide."

---

## Slide 3 - Problem Statement

**Say this in your own words:**

"Now why do we need this? Imagine someone is monitoring network traffic. If they see an encrypted message, they immediately know something secret is being sent. They might block it or try to break it. But if I send an audio file, it looks like I'm just sharing a song. No one suspects anything."

"The second problem is that most research has been done on image steganography. Audio steganography is less explored even though audio has some advantages."

"And the third issue - existing tools usually implement only one technique. There's no single tool where you can try different methods and see which one works best for your use case."

"So our goal is to build that tool."

**If panel asks: "What are the real-world applications?"**
- Military/defence communication
- Journalism in countries with censorship
- Copyright protection (hiding watermarks in audio)
- Secure corporate communication

---

## Slide 4 - Motivation & Objectives

**Say this in your own words:**

"Why did we choose audio specifically? Three reasons."

"First, audio has a very high data rate. CD quality audio has 44,100 samples per second. That means 44,100 places where we can potentially hide data every second."

"Second, human ears are not very sensitive to tiny changes. If I change an audio sample by just 1 out of 65,000, you simply cannot hear the difference."

"Third, audio files are shared all the time - music, podcasts, voice messages on WhatsApp. Nobody questions why someone is sending an audio file."

"Our objectives are: implement four different algorithms - LSB, Phase Coding, Echo Hiding, and Spread Spectrum. Add encryption for security. Build a web interface so it's easy to use. And finally compare all the algorithms to see which one is better in which situation."

**If panel asks: "Why four algorithms? Why not just one?"**
"Each algorithm has different trade-offs. LSB hides a lot of data but is easy to detect. Spread spectrum hides very little data but is almost impossible to detect. We want to study these trade-offs."

---

## Slide 5 - Literature Survey

**Say this in your own words:**

"We studied several research papers. Let me quickly go through them."

"The first one from Springer 2012 gives a good overview of all the techniques but it's just a survey - no implementation."

"The second paper from arXiv 2024 proposes an improved phase coding method. It works well but the capacity is very low - you can hide very little data."

"The third paper improves echo hiding but it needs long audio segments to work properly."

"The fourth one from PMC 2022 covers spread spectrum. It's very robust but you need the original audio to decode, which is a limitation."

"The gap we found is that nobody has built a single tool that implements all four and compares them on the same audio file under the same conditions. That's what our project does."

**If panel asks: "How many papers did you read?"**
"We referred to around 6-7 papers and online resources. These four were the most relevant."

**If panel asks about a specific paper in detail:**
Just explain the technique briefly. Don't panic if you don't remember exact details - say "the key contribution of that paper was..." and explain the technique.

---

## Slide 6 - Methodology & Architecture

**Say this in your own words:**

"Let me explain how our system works."

"For encoding - the user provides three things: an audio file, a secret message, and a password. First we encrypt the message using AES-256 so even if someone manages to extract the data, they can't read it without the password. Then we convert the encrypted text to binary - zeros and ones. Then we embed these bits into the audio using whichever algorithm the user selected. The output is a stego audio file that sounds exactly like the original."

"For decoding - the user provides the stego audio file and the same password. We extract the binary data using the same algorithm, decrypt it with AES, and get back the original message."

"It's a straightforward pipeline - encrypt, embed, extract, decrypt."

**If panel asks: "Why do you encrypt before embedding?"**
"Double security. Steganography hides that the message exists. Encryption protects the message content. Even if someone detects there's hidden data, they still can't read it."

**If panel asks: "What audio formats do you support?"**
"Currently WAV only, because WAV is uncompressed and gives us direct access to the raw audio samples. Compressed formats like MP3 would destroy the hidden data."

---

## General Tips

- Speak slowly and clearly
- Point at diagrams/flowcharts on the slide while explaining
- If you don't know an answer, say "That's something we plan to explore in the next phase" instead of guessing
- Keep eye contact with the panel, don't look at the screen
- If they interrupt with a question, answer it and then continue from where you left off
