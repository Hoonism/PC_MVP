import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, FirebaseStorage } from 'firebase/storage';

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase (server-side)
let app: FirebaseApp;
let storage: FirebaseStorage;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Firebase initialization failed');
}

// Helper function to generate public download URL
function getPublicUrl(storagePath: string): string {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  // Use the simple public URL format without tokens
  // This works if Firebase Storage rules allow public read access
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called');
    
    // Check Firebase configuration
    console.log('Firebase config check:', {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    });
    
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const generatedImageUrls = formData.get('generatedImageUrls');
    
    console.log('userId:', userId);
    console.log('generatedImageUrls:', generatedImageUrls);
    
    if (!userId) {
      console.error('Missing userId');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const results: any = {
      userImages: [],
      generatedImages: []
    };

    // Handle user-uploaded files
    const files = formData.getAll('files') as File[];
    console.log('Files received:', files.length);
    if (files.length > 0) {
      console.log('Server uploading user files:', files.length, 'files');
      try {
        results.userImages = await Promise.all(
          files.map(async (file, index) => {
            try {
              console.log(`Processing file ${index + 1}:`, file.name, file.size, 'bytes');
              const buffer = Buffer.from(await file.arrayBuffer());
              const timestamp = Date.now();
              const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
              const storagePath = `storybooks/${userId}/${timestamp}_${sanitizedName}`;
              const imageRef = ref(storage, storagePath);
              
              await uploadBytes(imageRef, buffer, { contentType: file.type });
              const url = getPublicUrl(storagePath);
              
              console.log(`User file ${index + 1} uploaded to path:`, storagePath);
              console.log(`User file ${index + 1} URL:`, url);
              
              return {
                name: file.name,
                url,
                caption: '' // Will be set by client
              };
            } catch (e) {
              console.error('Failed to upload user file:', file.name, e);
              throw e;
            }
          })
        );
      } catch (e) {
        console.error('Error in user file upload batch:', e);
        throw e;
      }
    }

    // Handle generated image URLs
    if (generatedImageUrls) {
      try {
        const urls = JSON.parse(generatedImageUrls as string);
        console.log('Parsed generated URLs:', urls);
        if (Array.isArray(urls) && urls.length > 0) {
          console.log('Server uploading generated images:', urls.length, 'images');
          results.generatedImages = await Promise.all(
            urls.map(async (url: string, index: number) => {
              try {
                console.log(`Fetching generated image ${index + 1}:`, url);
                const resp = await fetch(url);
                if (!resp.ok) {
                  throw new Error(`Failed to fetch: ${resp.status}`);
                }
                const buffer = Buffer.from(await resp.arrayBuffer());
                const contentType = resp.headers.get('content-type') || 'image/png';
                const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
                const timestamp = Date.now();
                const storagePath = `storybooks/${userId}/generated/${timestamp}_ai-story_${index}.${ext}`;
                const genRef = ref(storage, storagePath);
                
                await uploadBytes(genRef, buffer, { contentType });
                const downloadUrl = getPublicUrl(storagePath);
                
                console.log(`Generated image ${index + 1} uploaded to path:`, storagePath);
                console.log(`Generated image ${index + 1} URL:`, downloadUrl);
                
                return downloadUrl;
              } catch (e) {
                console.error('Failed to upload generated image:', url, e);
                return url; // Fallback
              }
            })
          );
        }
      } catch (e) {
        console.error('Error parsing or processing generated image URLs:', e);
        // Don't throw, just continue without generated images
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in upload-images:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
