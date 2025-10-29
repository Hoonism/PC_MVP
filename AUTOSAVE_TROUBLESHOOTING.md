# Auto-Save Troubleshooting Guide

## Issue: Chat Not Saving

If you see "No saved chats yet" in the sidebar even after sending messages, follow these steps:

### 1. Check Firebase Configuration

Ensure your `.env.local` file exists and has all Firebase credentials:

```bash
# Check if .env.local exists
ls -la .env.local

# If not, copy from example
cp .env.local.example .env.local
```

Required variables in `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Deploy Firestore Rules and Indexes

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 3. Check Browser Console

Open browser DevTools (F12) and check the Console tab for:

- ✅ **Success logs**: "Creating new chat...", "New chat created with ID: xxx"
- ❌ **Error logs**: "Auto-save failed:", "Firebase Firestore not initialized"

### 4. Verify Firestore Index Creation

The composite index for chats needs to be created:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Indexes** tab
4. Check if this index exists:
   - Collection: `chats`
   - Fields: `userId` (Ascending), `projectLabel` (Ascending), `updatedAt` (Descending)

If not, the index will be auto-created when you first try to query, or you can create it manually.

### 5. Check Authentication

Make sure you're logged in:
- Look for your email in the bottom left sidebar
- If not logged in, click "Sign In" and authenticate

### 6. Restart Development Server

After making changes to `.env.local`:

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

### 7. Test Auto-Save

1. Send a message: "Hello there"
2. Wait 2 seconds
3. Check browser console for logs
4. Check top bar for save status indicator
5. Refresh page - chat should appear in sidebar

## Auto-Save Features

### Chat Auto-Save
- **Trigger**: 2 seconds after message changes
- **Location**: `/src/app/chat/page.tsx`
- **Visual Indicator**: Top bar shows "💾 Saving...", "✓ Saved", or "⚠️ Save failed"
- **Console Logs**: Detailed logs in browser console

### Storybook Auto-Save
- **Trigger**: 3 seconds after any field changes
- **Location**: `/src/components/StorybookCreate.tsx`
- **Visual Indicator**: Shows "Auto-saved at [time]" below page title
- **Requires**: Storybook name must be filled in

## Common Issues

### Issue: "Firebase Firestore not initialized"
**Solution**: Check `.env.local` file has correct Firebase credentials

### Issue: "Missing or insufficient permissions"
**Solution**: Deploy Firestore rules with `firebase deploy --only firestore:rules`

### Issue: "Index not found"
**Solution**: Deploy indexes with `firebase deploy --only firestore:indexes` or wait for auto-creation

### Issue: Auto-save works but sidebar doesn't update
**Solution**: This is a race condition - refresh the page to see saved chats

### Issue: "Creating new chat..." but never completes
**Solution**: Check Firestore indexes are deployed and network tab for failed requests

## Verification Checklist

- [ ] `.env.local` file exists with all Firebase variables
- [ ] Firebase project is created and configured
- [ ] Firestore rules are deployed
- [ ] Firestore indexes are deployed
- [ ] User is authenticated (email shows in sidebar)
- [ ] Browser console shows no errors
- [ ] Development server restarted after env changes
- [ ] Auto-save indicator appears when sending messages

## Still Not Working?

Check the browser console for specific error messages and search for them in Firebase documentation or create an issue with:
1. Console error messages
2. Network tab showing failed requests
3. Firebase project configuration
