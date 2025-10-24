# Firestore Security Rules Setup

## Problem
You're getting `permission-denied` errors because Firestore security rules are blocking access to the database.

## Solution

### Option 1: Deploy Rules via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` from this project
5. Paste into the Firebase Console rules editor
6. Click **Publish**

### Option 2: Deploy Rules via Firebase CLI

If you have Firebase CLI installed:

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What the Rules Do

The `firestore.rules` file ensures:

✅ **Authenticated users only** - Users must be logged in to access data
✅ **User isolation** - Users can only read/write their own chats
✅ **Secure by default** - All other collections are denied by default

### Rules Breakdown:

```javascript
// Users can only access their own chats
match /chats/{chatId} {
  allow read: if resource.data.userId == request.auth.uid;
  allow create: if request.resource.data.userId == request.auth.uid;
  allow update: if resource.data.userId == request.auth.uid;
  allow delete: if resource.data.userId == request.auth.uid;
}
```

## Temporary Testing Rules (NOT for Production!)

If you need to test quickly, you can temporarily use these rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **WARNING**: These testing rules allow any authenticated user to access all data. Only use for development and replace with proper rules before going to production!

## Verifying Rules are Working

After deploying the rules:

1. Refresh your app
2. The `permission-denied` errors should disappear
3. You should be able to:
   - Save new chats
   - Load your saved chats
   - Update existing chats
   - Delete chats

## Troubleshooting

### Still getting errors?

1. **Check authentication**: Make sure you're logged in (check the user menu shows your email)
2. **Check userId field**: Ensure chats are being saved with the correct `userId` field
3. **Check Firebase Console**: Verify the rules are published
4. **Clear cache**: Try hard refresh (Cmd+Shift+R) or clear browser cache

### Rules not deploying?

- Make sure you're in the correct Firebase project
- Check that `firestore.rules` is in the project root
- Verify you have permission to modify the Firebase project
