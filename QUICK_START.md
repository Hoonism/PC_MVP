# Quick Start - BillNegotiate AI with GPT-5

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies

```bash
cd /Users/seonghunsong/Documents/patriot_conceptions/PC_BillReduce
npm install
```

This installs all required packages including the fal.ai client.

### Step 2: Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

The API key is already configured in the example file:
```
FAL_KEY=9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b
```

### Step 3: Run the Application

```bash
npm run dev
```

Open your browser to **http://localhost:3000**

## ✨ What You'll See

1. **Home Page** (`/`)
   - Beautiful landing page
   - Features section
   - "Start for Free" button

2. **Chat Page** (`/chat`)
   - Left panel: File upload (drag & drop)
   - Right panel: AI chat interface
   - Theme toggle in navbar

## 🧪 Test the GPT-5 Integration

1. Click **"Start for Free"** on homepage
2. Upload a medical bill (JPG, PNG, or PDF)
3. Click **"Analyze Bill"**
4. Watch GPT-5 respond in real-time! 🎉
5. Continue the conversation
6. Ask for a draft message
7. Use **"Copy Message"** button when draft appears

## 🎨 Theme Toggle

Click the sun/moon icon in the navbar to switch between light and dark modes.

## 📁 Project Structure

```
PC_BillReduce/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts     ← GPT-5 API integration
│   │   ├── chat/page.tsx         ← Chat interface (uses real AI)
│   │   ├── page.tsx              ← Home page
│   │   └── layout.tsx            ← Root layout
│   └── components/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── ThemeToggle.tsx
│       └── ThemeProvider.tsx
├── package.json                  ← Dependencies (includes @fal-ai/serverless-client)
├── .env.local.example            ← API key template
└── .env.local                    ← Your API key (create this)
```

## 🔑 How GPT-5 Works

- **Model**: fal-ai/gpt-5
- **Your API Key**: Securely stored server-side
- **Flow**: Chat UI → Backend API → fal.ai → Response → User
- **Context**: Full conversation history sent with each message
- **Smart Features**: Auto-detects draft messages for copying

## 🛠️ Troubleshooting

### TypeScript Errors?
**Normal!** They'll disappear after `npm install`

### "Cannot find module" errors?
Run: `npm install --force`

### Port 3000 already in use?
Run on different port: `npm run dev -- -p 3001`

### API not responding?
1. Check `.env.local` exists
2. Restart server: `Ctrl+C` then `npm run dev`
3. Check console for errors

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **GPT5_INTEGRATION.md** - Technical integration details
- **PROJECT_SUMMARY.md** - Complete feature list
- **README.md** - Full documentation

## 🎯 Next Actions

1. **Test locally**: Follow steps above
2. **Customize system prompt**: Edit `src/app/api/chat/route.ts`
3. **Adjust AI parameters**: Modify temperature, max_tokens as needed
4. **Deploy to Vercel**: Push to GitHub and import in Vercel
5. **Add authentication**: Implement user login for production

## 💡 Tips

- Upload any image or PDF to test (doesn't need to be real bill)
- Try asking: "Can you draft a message requesting an itemized statement?"
- The AI maintains context throughout the conversation
- Dark mode is beautiful! Try it 🌙

## 🚢 Production Deployment

**Vercel** (Recommended):
```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git push origin main

# Then in Vercel:
# 1. Import GitHub repo
# 2. Add environment variable: FAL_KEY=your-key
# 3. Deploy!
```

---

**You're all set!** 🎉

Run `npm install && npm run dev` and start chatting with GPT-5!
