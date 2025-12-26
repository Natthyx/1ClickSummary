# Quick Start Guide

## 🚀 Get Running in 3 Minutes

### Step 1: Get Your Gemini API Key (30 seconds)

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Step 2: Configure Backend (1 minute)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd /Users/natezeleke/Desktop/Main_Project/1ClickSummary/backend
   ```

2. Create the `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in your editor and paste your API key:
   ```
   GEMINI_API_KEY=AIza...your_actual_key_here
   PORT=3000
   ```

4. Save the file and start the server:
   ```bash
   npm start
   ```

   You should see:
   ```
   ✅ 1-Click Job Summary API is running
   📡 Server: http://localhost:3000
   🤖 Gemini API: Connected
   ```

### Step 3: Load Extension (1 minute)

1. Open Chrome and go to: `chrome://extensions/`

2. Enable "Developer mode" (toggle in top-right)

3. Click "Load unpacked"

4. Navigate to and select:
   ```
   /Users/natezeleke/Desktop/Main_Project/1ClickSummary/extension
   ```

5. **IMPORTANT**: After loading, **reload any open job posting pages** for the extension to work

### Step 4: Test It! (30 seconds)

1. Go to a job posting:
   - LinkedIn Jobs: https://www.linkedin.com/jobs/
   - Indeed: https://www.indeed.com/
   - Any company career page

2. Click the extension icon in your toolbar

3. Click "Summarize" in the sidebar

4. Watch the magic happen! 🎉

## 🐛 Troubleshooting

**Extension icon doesn't appear?**
- Refresh Chrome extensions page
- Pin the extension to toolbar

**Sidebar doesn't open?**
- Refresh the job posting page after loading the extension
- Check browser console (F12) for errors

**Backend errors?**
- Make sure `.env` file exists in `backend/` folder
- Verify your Gemini API key is correct
- Ensure no other service is using port 3000

**"Not enough content detected"?**
- Make sure you're on an actual job posting (not search results)
- Wait for the page to fully load before clicking the extension

## 📚 Full Documentation

See [README.md](../README.md) for complete documentation, architecture details, and production deployment guide.
