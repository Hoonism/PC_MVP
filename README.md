# BillNegotiate AI

An AI-powered chat service designed to help surrogates draft messages to negotiate and reduce their medical bills.

## Features

- 🎨 **Modern UI/UX**: Minimalistic design with clean aesthetics
- 🌓 **Theme Toggle**: Light and dark mode support
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 📄 **File Upload**: Drag-and-drop support for medical bills (JPG, PNG, PDF)
- 💬 **AI Chat Interface**: Interactive conversation to guide bill negotiation
- 📋 **Copy to Clipboard**: Easy copying of generated messages

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Theme Management**: next-themes
- **Icons**: lucide-react
- **Font**: Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
PC_BillReduce/
├── src/
│   ├── app/
│   │   ├── chat/
│   │   │   └── page.tsx          # Chat interface page
│   │   ├── privacy/
│   │   │   └── page.tsx          # Privacy policy page
│   │   ├── terms/
│   │   │   └── page.tsx          # Terms of service page
│   │   ├── layout.tsx            # Root layout with theme provider
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   └── components/
│       ├── Footer.tsx            # Footer component
│       ├── Navbar.tsx            # Navigation bar
│       ├── ThemeProvider.tsx     # Theme context provider
│       └── ThemeToggle.tsx       # Theme toggle button
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## How It Works

### 1. Upload Bill
Users can upload their medical bills as images (JPG, PNG) or PDF files using drag-and-drop or file selection.

### 2. Chat with AI
The AI assistant guides users through the negotiation process with a conversational interface.

### 3. Generate Message
The AI drafts professional messages that users can copy and send to healthcare providers.

## AI Integration

This application uses **fal.ai GPT-5** for real AI-powered responses:

- **AI Model**: fal-ai/gpt-5 via fal.ai serverless platform
- **Backend API**: Secure Next.js API route (`/api/chat`)
- **System Prompt**: Optimized for medical bill negotiation expertise
- **Features**:
  - Analyzes uploaded medical bills
  - Provides negotiation strategies
  - Drafts professional correspondence
  - Offers empathetic, practical guidance
  - Maintains conversation context throughout the session

### Setup Required

1. Copy `.env.local.example` to `.env.local`
2. The fal.ai API key is pre-configured
3. Run `npm install` to get dependencies
4. Start with `npm run dev`

See **SETUP_GUIDE.md** for detailed instructions.

## Color Palette

### Light Mode
- Background: `#FFFFFF`
- Text: `#111827`
- Primary Accent: `#3B82F6`

### Dark Mode
- Background: `#111827`
- Text: `#F9FAFB`
- Primary Accent: `#3B82F6`

## Build for Production

```bash
npm run build
npm start
```

## License

This project is for demonstration purposes.

## Contact

For questions or support, please contact support@billnegotiate.ai
# PC_BillReduce
