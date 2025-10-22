# BillNegotiate AI - Setup Guide

## Quick Start with fal.ai GPT-5 Integration

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14+
- React 18
- TypeScript
- Tailwind CSS
- next-themes
- lucide-react
- **@fal-ai/serverless-client** (for GPT-5 AI)

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

The file should contain:

```
FAL_KEY=9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b
```

**Important:** The API key is already configured with your fal.ai credentials.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### Architecture

1. **Frontend** (`src/app/chat/page.tsx`)
   - User uploads medical bill
   - Chat interface for conversation with AI
   - Calls backend API route

2. **Backend API** (`src/app/api/chat/route.ts`)
   - Securely stores API key (not exposed to client)
   - Communicates with fal.ai GPT-5 model
   - Returns AI responses

3. **fal.ai Integration**
   - Model: `fal-ai/gpt-5`
   - Temperature: 0.7 (balanced creativity)
   - Max tokens: 1000
   - System prompt optimized for medical bill negotiation

### AI Features

The GPT-5 model is configured to:
- Analyze medical bills
- Identify opportunities for cost reduction
- Draft professional negotiation messages
- Provide empathetic, practical advice
- Guide users through the negotiation process

### Copy-to-Clipboard

When the AI generates a draft message (containing "Dear" and "Sincerely"), a "Copy Message" button automatically appears, allowing users to easily copy the text.

## Testing the Application

1. **Visit Homepage** - See the landing page with features
2. **Navigate to Chat** - Click "Start for Free"
3. **Upload a Bill** - Drag and drop or select a file (JPG, PNG, or PDF)
4. **Click "Analyze Bill"** - The AI will analyze and provide guidance
5. **Continue Conversation** - Ask follow-up questions or request drafts
6. **Copy Message** - When a draft appears, use the copy button

## Environment Variables Explained

- `FAL_KEY`: Your fal.ai API credentials in the format `id:secret`
  - This key is kept secure on the server side
  - Never exposed to the client/browser

## Troubleshooting

### API Errors

If you see "Failed to get AI response":
1. Check that `.env.local` exists and contains the correct key
2. Restart the development server
3. Check console logs for detailed error messages

### Module Not Found Errors

If you see TypeScript errors about missing modules:
1. Ensure you've run `npm install`
2. Restart your IDE/editor
3. Try `npm install --force` if issues persist

### Theme Toggle Not Working

If the theme toggle shows a blank icon:
1. Wait a moment - it uses client-side hydration
2. Refresh the page
3. Clear browser cache

## Production Build

To build for production:

```bash
npm run build
npm start
```

The application will be optimized and ready for deployment.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variable:
   - Key: `FAL_KEY`
   - Value: `9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b`
4. Deploy

### Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- Next.js 14+ App Router
- Environment variables

## API Rate Limits

Be aware of fal.ai rate limits:
- Monitor usage in your fal.ai dashboard
- Implement rate limiting if needed for production
- Consider caching responses for common queries

## Security Notes

- ✅ API key is stored server-side only
- ✅ No API key exposure in client-side code
- ✅ All AI calls go through secure backend route
- ⚠️ Remember to add `.env.local` to `.gitignore` (already configured)

## Next Steps

- Test the application with various medical bills
- Customize the system prompt in `src/app/api/chat/route.ts`
- Adjust AI parameters (temperature, max_tokens) as needed
- Add user authentication for production use
- Implement conversation history persistence
