# Firebase Setup Instructions

This application now includes Firebase authentication and chat saving functionality.

## Firebase Configuration

Add the following environment variables to your `.env.local` file:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA-ZOJ7IygTo2mltMWhwAX4mkuh4YMRGDE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pc-storybook.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pc-storybook
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pc-storybook.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=379665425928
NEXT_PUBLIC_FIREBASE_APP_ID=1:379665425928:web:331a367a8a1b547f8a13bd
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-LTX1CFBMZV
```

## Firestore Database Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pc-storybook**
3. Navigate to **Firestore Database** in the left sidebar
4. If not already created, click **Create database**
5. Choose **Start in production mode** or **Test mode** (for development)
6. Select a location for your database

### Firestore Security Rules

For development, you can use these rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Authentication Setup

1. In Firebase Console, go to **Authentication**
2. Click **Get started** if not already enabled
3. Enable the following sign-in methods:
   - **Email/Password**: Enable this provider
   - **Google**: Enable and configure OAuth consent screen

## Features

### Authentication
- Email/Password sign-up and sign-in
- Google OAuth sign-in
- User session management
- Sign out functionality

### Chat Management
- **Save Chats**: Authenticated users can save their chat conversations
- **Load Chats**: View and load previously saved chats
- **Update Chats**: Automatically updates existing chats when saved again
- **Delete Chats**: Remove unwanted chat sessions
- **Project Label**: All chats are labeled with "BillReduce" to differentiate from other projects using the same Firebase project

### Data Structure

Chats are stored in Firestore with the following structure:

```javascript
{
  userId: string,           // Firebase user ID
  title: string,            // Auto-generated from first user message
  messages: [               // Array of message objects
    {
      id: string,
      role: 'user' | 'assistant',
      content: string,
      timestamp: Timestamp
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  projectLabel: 'BillReduce'  // Identifies chats from this project
}
```

## Usage

1. **Sign In**: Click the "Sign In" button in the navbar
2. **Create Account**: Use the sign-up form or Google OAuth
3. **Chat**: Have conversations with the AI about medical bill negotiation
4. **Save**: Click the "Save" button in the chat header (only visible when signed in)
5. **View Saved Chats**: Click the folder icon in the left panel to view saved chats
6. **Load Chat**: Click on any saved chat to load it
7. **New Chat**: Click the "+" button to start a new conversation

## Development

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Important Notes

- All chats are private and only accessible by the user who created them
- The `projectLabel: 'BillReduce'` ensures chats from this app don't mix with other projects
- Make sure to set up proper Firestore security rules before deploying to production
- Keep your Firebase credentials secure and never commit `.env.local` to version control
