# Jarvis AI Voice Assistant for DroidScript

This project is a Siri-like AI voice assistant called **Jarvis**, designed specifically for Android 9+ using DroidScript. It is based on the OM AI Jarvis web application but enhanced with native Android capabilities.

## Features
- **Voice Recognition & TTS:** Native Android Speech-to-Text and Text-to-Speech with Indian English accent support.
- **Wake Word:** Background service that listens for the word "Jarvis" to wake up the app.
- **Native Commands:**
    - "Call [name/number]"
    - "Open Camera"
    - "Set Alarm for [time]"
    - "Open [App Name]"
    - WhatsApp integration
    - YouTube search
- **Offline/Hybrid:** Works offline for native commands and has a beautiful futuristic UI.

## Installation Steps

1.  **Install DroidScript:** If you haven't already, install the **DroidScript** app from the Google Play Store or their website.
2.  **Create New App:**
    - Open DroidScript.
    - Click the **menu (three dots)** or the **plus (+)** icon.
    - Select **"New App"**.
    - Name it **"Jarvis"**.
    - Choose **"HTML"** as the app type.
3.  **Copy the Code:**
    - Open the newly created "Jarvis" app in the DroidScript editor.
    - Open the `Jarvis.html` file provided in this project.
    - **Select All** and **Copy** the entire content of `Jarvis.html`.
    - In DroidScript, delete all existing code in the editor and **Paste** the copied content.
    - Save the file.
4.  **Grant Permissions:**
    - When you run the app for the first time, DroidScript will ask for various permissions (Microphone, Contacts, Phone, etc.). **Allow all** for Jarvis to function like Siri.

## How to use the Background Wake Word
- On the first run, the app will automatically create a `Service.js` file in your project folder.
- This service allows Jarvis to listen for its name even when the app is in the background.
- To enable this, ensure you have allowed "Draw over other apps" or "Background execution" if your Android version prompts for it.

## Building the APK
To convert this into a standalone APK:
1.  Long-press the **Jarvis** icon in the DroidScript app list.
2.  Select **"Build APK"**.
3.  Follow the prompts to name your package (e.g., `com.myname.jarvis`).
4.  Once built, you can install the `.apk` file on any Android 9 device.

## Notes for Android 9
- Ensure **Google Speech Services** is updated.
- For the Indian English accent, go to **Android Settings > System > Languages & Input > Text-to-speech output** and ensure the "English (India)" voice pack is downloaded.

---
Created for DroidScript - Jarvis AI
