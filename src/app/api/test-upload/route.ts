import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload API called');
    
    // Initialize Firebase
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const storage = getStorage(app);

    // Create a simple test file
    const testData = 'Hello, Firebase Storage!';
    const testBuffer = Buffer.from(testData, 'utf-8');
    
    // Create a reference with a test path
    const testRef = ref(storage, `test-uploads/test-${Date.now()}.txt`);
    
    console.log('Attempting to upload test file...');
    console.log('Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    console.log('Test ref path:', testRef.fullPath);
    
    // Try to upload the test file
    const snapshot = await uploadBytes(testRef, testBuffer, { 
      contentType: 'text/plain' 
    });
    
    console.log('Upload successful, getting download URL...');
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Test upload completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      downloadURL,
      path: snapshot.ref.fullPath,
      size: snapshot.totalBytes
    });

  } catch (error) {
    console.error('Test upload error:', error);
    
    // Extract more specific error information
    let errorDetails = {
      message: 'Unknown error',
      code: 'unknown',
      stack: 'No stack trace'
    };
    
    if (error instanceof Error) {
      errorDetails.message = error.message;
      errorDetails.stack = error.stack || 'No stack trace';
      
      // Check for Firebase-specific error properties
      if ('code' in error) {
        errorDetails.code = (error as any).code;
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Test upload failed',
      details: errorDetails
    }, { status: 500 });
  }
}
