# Firebase Storage Setup - SOLUTION FOR 500 ERROR

## Problem Identified
The 500 error when saving storybooks with images is caused by **Firebase Storage not being properly configured** for your project. The error shows `status_: 404`, indicating the storage bucket doesn't exist or isn't accessible.

## Root Cause
- Firebase Storage is not enabled for your project `pc-storybook`
- OR the storage bucket `pc-storybook.firebasestorage.app` doesn't exist
- OR the storage security rules are blocking access

## Solution Steps

### 1. Enable Firebase Storage
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pc-storybook`
3. In the left sidebar, click **"Storage"**
4. Click **"Get started"** if Storage is not enabled
5. Choose **"Start in test mode"** (for now - we'll secure it later)
6. Select a location for your storage bucket (choose the same region as your project)
7. Click **"Done"**

### 2. Verify Storage Bucket
After enabling Storage, verify that your bucket URL matches your environment variable:
- Expected bucket: `pc-storybook.firebasestorage.app`
- If different, update your `.env.local` file with the correct bucket URL

### 3. Configure Storage Security Rules (Important!)
In the Firebase Console, go to Storage > Rules and use these rules for development:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow read/write access to all users for development
    // TODO: Secure this for production
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ SECURITY WARNING**: These rules allow anyone to read/write to your storage. For production, you should implement proper authentication-based rules.

### 4. Production Security Rules (Use Later)
For production, use these more secure rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated users can upload to their own folder
    match /storybooks/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to storybook images (optional)
    match /storybooks/{userId}/{allPaths=**} {
      allow read: if true;
    }
  }
}
```

### 5. Test the Fix
After completing the above steps:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test the upload functionality:
   ```bash
   curl -X POST http://localhost:3001/api/test-upload
   ```

3. You should see a success response like:
   ```json
   {
     "success": true,
     "message": "Test upload successful",
     "downloadURL": "https://firebasestorage.googleapis.com/...",
     "path": "test-uploads/test-123456789.txt",
     "size": 23
   }
   ```

### 6. Clean Up Test Files
Once everything is working, you can delete the test API endpoints:
- `/src/app/api/test-firebase/route.ts`
- `/src/app/api/test-upload/route.ts`

## Expected Result
After following these steps, your storybook saving functionality should work correctly, and you should be able to upload images without the 500 error.

## Additional Notes
- The Firebase Storage bucket name in your `.env.local` should match exactly what's shown in the Firebase Console
- Make sure your Firebase project has billing enabled if you plan to use it in production
- Consider implementing proper user authentication before deploying to production
