# 🧠ISLSpaces — Indian Sign Language Helper (Extension)

👉 ISLSpaces is a Chrome extension that makes the web more accessible by converting English text into Indian Sign Language (ISL) visuals along with English meanings and Hindi translations.

👉 It allows users to view ISL sign videos for words directly on any webpage using hover, text selection, and right-click interaction, creating a smooth and interactive learning experience for ISL learners and the deaf community.


## 🎯 Problem Statement
👉 Most web content today is text-based and written in English, which creates accessibility challenges for:

- 🔇 Deaf and hard-of-hearing users
- 🤟 Indian Sign Language (ISL) learners
- 👀 Users who prefer visual language over text 

👉 There is no simple way to instantly convert English text on webpages into Indian Sign Language.


## ✅ Solution
ISLSpaces bridges this gap by:
- 🌐 Running as a Chrome Extension
- 🧩 Working on any website
- 🎥 Converting English text into ISL avatar videos
- 📘 Showing English meanings
- ✨ Providing Hindi translations
- ⚡ Delivering instant results using smart caching


## 🚀 Key Features

1. Automatic Word Highlighting: 
   - Highlights predefined English words directly on webpages.

2. ISL Avatar Video Playback: 
   - Plays ISL sign videos using CDAC’s Text-to-ISL API.

3. Multiple Interaction Methods    
   - Hover over words
   - Select text
   - Right-click → View in ISL
   - Manual word input via extension popup

4. English Meaning
   - Fetches short and clear definitions using dictionary APIs.

5. Hindi Translation
   - Automatically translates English meanings into Hindi.

6. Synonyms Support
   - Displays commonly used synonyms for better understanding.

7. Smart Caching
   - Meanings and translations are stored in localStorage for instant reuse.

8. Fast & Lightweight
   - Popup appears immediately while data loads asynchronously.


## ⚙️ How It Works

1️⃣ User Interaction Detection
content.js listens for:
 - Mouse hover
 - Text selection
 - Touch selection (mobile support)

2️⃣ Popup Rendering
 - A floating popup is dynamically created near the cursor or selected text.

3️⃣ ISL Video Generation
 - Selected text is sent to CDAC Text-to-ISL API
 - API returns an ISL avatar video URL
 - Video is played inside the popup

4️⃣ Language Processing
 - English meaning → dictionaryapi.dev
 - Hindi translation → Translation API
 - Synonyms → Datamuse API

5️ Smart Caching
 - All data is cached in localStorage
 - Repeated words load instantly without API delay


## 📂 Project Structure

ISLSpaces/
│
├── manifest.json        # Chrome Extension Manifest (v3)
├── background.js        # Right-click context menu handling
├── content.js           # Hover, selection, popup & video logic
├── ai_bridge.js         # Meaning + Hindi translation logic
│
├── popup.html           # Extension popup UI
├── popup.js             # Manual word lookup
│
├── options.html         # Settings page
├── options.js           # User preferences
│
├── player.html          # Standalone ISL video player
├── player.js            # Video loading logic
│
├── styles/
│   └── overlay.css      # Highlight, popup & video styling
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png



## ⚡ Performance Optimizations
 - 🚀 Lazy Loading – Popup appears instantly
 - 💾 Local Caching – Faster repeat access
 - 🧠 Optimized DOM Handling – No unnecessary re-renders
 - 📱 Responsive Popup Positioning – Prevents overflow
 - 🎬 Auto Video Resizing – Removes black bars


## 🧩 Installation Steps
 1. Open Chrome → chrome://extensions/
 2. Enable Developer Mode
 3. Click Load unpacked
 4. Select the ISLSpaces folder
 5. ✅ Extension is ready to use


## 🧪 How to Use
 1. Open any webpage with English text
 2. Hover over a highlighted word or
 3. Select text using mouse/touch or
 4. Right-click → View in ISL
 5. 🎥 ISL video + 📘 English meaning + 🇮🇳 Hindi translation appear instantly


## 🧠 Tech Stack
 - Language: JavaScript (ES6)
 - Frontend: HTML + CSS
 - Platform: Chrome Extension (Manifest V3)


## 🔌 APIs Used
 - CDAC Text-to-ISL API
 - Dictionary API (dictionaryapi.dev)
 - Translation API (English → Hindi)
 - Datamuse API (Synonyms)

     
## 📌 Future Enhancements
 - 🧠 Sentence-level ISL grammar support
 - 📥 Offline ISL video caching
 - 🌍 Support for more Indian languages
 - 🤖 AI-based contextual explanations
 - ✨ Automatic detection of ISL-supported words
