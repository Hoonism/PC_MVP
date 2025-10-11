# Firebase Configuration Setup

To enable Firebase authentication and storage in JourneyBook, follow these steps:

## 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

## 2. Enable Authentication
1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider

## 3. Configure Firestore
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose production mode
4. Select your preferred location

## 4. Configure Storage & Rules
1. Go to "Storage"
2. Click "Get started"
3. Choose production mode
4. **Deploy the storage rules:**
   - In Firebase Console, go to Storage > Rules
   - Copy the contents from `storage.rules` file in this project
   - Click "Publish"
   
   Or use Firebase CLI:
   ```bash
   firebase deploy --only storage
   ```

## 5. Get Your Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add a web app
4. Register your app and copy the config object

## 6. Set Environment Variables
Create a `.env.local` file in the project root with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration values.

## 7. Restart Development Server
After adding the environment variables and updating storage rules, restart your development server:
```bash
npm run dev
```

Your Firebase authentication and storage should now be working!

## Important Notes
- The storage rules allow public read access to storybook images (required for image URLs to work)
- Only authenticated users can upload/modify their own images
- Make sure to deploy the storage rules before uploading images
