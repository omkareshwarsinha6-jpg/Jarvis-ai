# 🤖 Jarvis AI: Siri-like Voice Assistant for Android 9+ (DroidScript)

Welcome to the **Jarvis AI Assistant** project. This repository contains a fully self-contained HTML script designed for **DroidScript**, allowing you to build a powerful, Siri-like voice assistant for your Android 9+ device.

---

## 🌟 Key Features

- **🗣️ Natural Voice Interaction**: Uses DroidScript's native `app.TextToSpeech` and `app.SpeechRec` for low-latency, Siri-like responses.
- **🇮🇳 Optimized Voice**: Specifically tuned for Indian English (`en-IN`) female voice synthesis for a friendly, "bestie" persona.
- **👂 Background Wake Word**: Integrated background service (`Service.js`) that listens for the word "Jarvis" to wake the assistant even when the screen is off or another app is open.
- **📞 Native Android Integration**:
  - **Phone Calls**: Directly dial contacts using `app.Call`.
  - **App Launching**: Open WhatsApp, YouTube, Spotify, and 200+ other apps.
  - **Alarms/Reminders**: Set system alarms and in-app reminders.
  - **Camera**: Quick access to the native camera.
- **🚀 100+ Super Tools**: Integrated calculators, unit converters, games (Tic Tac Toe, Memory), and utility tools.
- **🧠 Ollama AI Support**: Connect to a local Ollama server for advanced AI chat capabilities.
- **🎨 Customization**: Dynamic themes, custom primary colors, font size adjustments, and animation speed control.
- **📄 Single-File Design**: All CSS, logic, and HTML are consolidated into `Jarvis.html` for easy installation.

---

## 🛠️ Installation & Setup (Step-by-Step)

Follow these steps carefully to get Jarvis running on your device:

### 1. Install DroidScript
If you haven't already, download and install **DroidScript** from the Google Play Store or the [official DroidScript website](https://droidscript.org).

### 2. Create the Jarvis Project
1. Open DroidScript.
2. Tap the **'+'** icon to create a new project.
3. **App Name**: Enter `Jarvis`.
4. **App Type**: Select **HTML**.
5. **Template**: Select **Simple**.

### 3. Copy the Code
1. Open the project you just created.
2. Delete all the default code in the editor.
3. Open `Jarvis.html` from this repository.
4. Copy the entire content and paste it into the DroidScript editor.
5. Save the project (disk icon).

### 4. Required Permissions
To function correctly, you must grant the following permissions to DroidScript in your Android Settings:
- **Microphone**: For voice commands.
- **Phone**: For the calling feature.
- **Storage**: For saving your settings and custom apps.
- **Overlay/Draw over other apps**: Necessary for the wake-word service to show the app when triggered.

---

## 🏗️ Building Your APK

To turn this script into a standalone application:

1. In the DroidScript home screen, **long-press** the Jarvis icon.
2. Select **Build APK**.
3. Follow the wizard:
   - **Package Name**: Use a unique name like `com.yourname.jarvis`.
   - **Version**: `1.0.0`.
4. Once the build process is complete, DroidScript will provide a link to download/install the APK.
5. Install the APK on your Android 9+ device.

---

## 🎙️ Using Jarvis

### Wake Word
The first time you run the app, it will generate a `Service.js` file and start a background service.
- To wake Jarvis, simply say **"Jarvis"** clearly.
- The app will automatically come to the foreground and start listening for your command.

### Example Commands
- *"Call Mom"*
- *"Open WhatsApp"*
- *"Set an alarm for 7:00 AM"*
- *"Search for the nearest pizza place"*
- *"Tell me a joke"*
- *"Remind me to take medicine in 10 minutes"*

---

## 🧠 Advanced: Ollama Integration

If you have an **Ollama** server running on your network:
1. Tap the **Brain Icon** in the header or go to the **Ollama** tab in the sidebar.
2. Ensure your phone can reach the Ollama server (default is `http://11434`).
3. Select your preferred model (e.g., `llama3`) and start chatting with a locally hosted LLM!

---

## ❓ Troubleshooting

- **Voice Not Working?**: Ensure you have "Speech Services by Google" installed and set as your default TTS engine in Android Settings.
- **Wake Word Not Reliable?**: Background services on Android 9+ can be aggressive. Ensure DroidScript (or your built APK) is **excluded from Battery Optimization** in Settings.
- **Apps Won't Open?**: Jarvis uses package names (e.g., `com.whatsapp`). If an app doesn't open, verify the package name in the **Settings > All Apps** section within Jarvis and update it if necessary.
- **CSS Layout Issues?**: This script is optimized for mobile views. If testing on a tablet, use the "Customize" menu to adjust font sizes.

---

## 📜 Credits
- **Original Concept**: Inspired by the Jarvis site at `omkareshwar18.free.nf`.
- **Developer**: Assisted by AI to bridge Web technologies with Native Android DroidScript APIs.

---

Enjoy your new personal assistant! 💜
