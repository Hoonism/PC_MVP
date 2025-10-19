# Cloudflare Pages Deployment Guide

## Environment Variables Setup

Before deploying to Cloudflare Pages, you **must** configure the following environment variables in your Cloudflare Pages project settings:

### Required Firebase Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Required OpenAI Variable

```
OPENAI_API_KEY
```

## How to Add Environment Variables in Cloudflare Pages

1. Go to your Cloudflare Pages dashboard
2. Select your project (PC_storybook)
3. Navigate to **Settings** → **Environment variables**
4. Add each variable listed above with their corresponding values from your Firebase project
5. Make sure to add them for both **Production** and **Preview** environments

## Getting Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → **Project settings**
4. Scroll down to **Your apps** section
5. Select your web app or create a new one
6. Copy the config values to your Cloudflare environment variables

## Build Settings

Configure these settings in your Cloudflare Pages project:
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `text-image-app` (if deploying from monorepo)
- **Node version**: 22.x (automatically detected)

**Important**: Make sure to use `pages:build` command, NOT `build`. This uses the Cloudflare adapter to properly compile your Next.js app for Cloudflare Pages.

## Troubleshooting

### Error: `Firebase: Error (auth/invalid-api-key)`

This error occurs when Firebase environment variables are not set during the build process. Make sure all `NEXT_PUBLIC_FIREBASE_*` variables are configured in Cloudflare Pages settings.

### Build Fails During Static Generation

The app is now configured to gracefully handle missing Firebase credentials during build time. However, you still need to set the environment variables for the app to work properly at runtime.

## Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in your Firebase and OpenAI credentials
3. Run `npm run dev`

## Notes

- All Firebase variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- The `OPENAI_API_KEY` should NOT have the `NEXT_PUBLIC_` prefix (server-side only)
- Environment variables are required for both build and runtime
