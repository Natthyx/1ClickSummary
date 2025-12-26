# 1ClickSummary
1ClickSummary is a Chrome browser extension that summarizes job postings instantly in a clean sidebar. Spend less time reading long job descriptions and get the key details you care about — in one click.
🚀 Features (MVP)

🧠 AI-powered summarization using Gemini API

📌 Right-side sidebar UI for quick access

🎛️ Customizable summary settings:

Length: short / medium / detailed

Focus: skills / qualifications / responsibilities / balanced

Output format: bullet points / paragraph

🛠️ Automatic tech stack detection

⚡ Works on any job posting page (LinkedIn, Microsoft Careers, company pages)

🔒 Privacy-friendly: no crawling, no storage, minimal permissions

🧩 How It Works

Open a job posting page.

Click the 1ClickSummary extension icon.

Sidebar slides in from the right.

Job content is extracted from the page and sent to your backend.

Gemini API generates a structured summary:

Role Overview

Required Skills

Qualifications

Nice-to-Have Skills

Tech Stack Detected

Job content is never stored, and your API key stays secure on the backend.

🛠️ Tech Stack

Frontend (Browser Extension)

Chrome Extension (Manifest V3)

Vanilla JavaScript

HTML + CSS

Backend

Node.js + Express

Gemini API

Environment variables for secrets

📁 Project Structure
1ClickSummary/
├─ extension/
│  ├─ manifest.json
│  ├─ background.js
│  ├─ content.js
│  ├─ sidebar/
│  │  ├─ sidebar.html
│  │  ├─ sidebar.css
│  │  └─ sidebar.js
│  └─ utils/
│     └─ extractJobText.js
├─ backend/
│  ├─ server.js
│  ├─ routes/
│  │  └─ summarize.js
│  ├─ services/
│  │  └─ geminiService.js
│  └─ .env.example
└─ README.md

🔧 Local Setup
1️⃣ Backend
cd backend
npm install
cp .env.example .env


Add your Gemini API key to .env:

GEMINI_API_KEY=your_api_key_here


Run the server:

npm run dev

2️⃣ Chrome Extension

Open Chrome and go to chrome://extensions

Enable Developer Mode

Click Load unpacked

Select the extension/ folder

The extension is now installed locally.

🧪 Testing

Open a job posting page

Click the 1ClickSummary icon

Adjust settings in the sidebar

Click Summarize

Verify the output appears correctly

Recommended test sites: LinkedIn Jobs, Microsoft Careers, company pages.

🔐 Privacy & Security

Job content is never stored

No crawling or scraping

No user accounts

Gemini API key never exposed in the extension

Minimal Chrome permissions: activeTab, scripting

📈 Roadmap

Resume-to-job matching

Skill gap analysis

Saved job summaries

User accounts and authentication

Upgrade sidebar UI to React or Svelte

Chrome Web Store release

🤝 Contributing

Contributions, feedback, and suggestions are welcome!
Please open an issue or submit a pull request.
