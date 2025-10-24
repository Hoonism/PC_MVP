import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, FirebaseStorage } from 'firebase/storage'

export const runtime = 'nodejs'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

let app: FirebaseApp
let storage: FirebaseStorage

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  storage = getStorage(app)
} catch (error) {
  console.error('Firebase initialization error:', error)
  throw new Error('Firebase initialization failed')
}

function getPublicUrl(storagePath: string): string {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(storagePath)}?alt=media`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const generatedImageUrls = formData.get('generatedImageUrls')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const results: any = {
      userImages: [],
      generatedImages: []
    }

    const files = formData.getAll('files') as File[]
    if (files.length > 0) {
      results.userImages = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer())
          const timestamp = Date.now()
          const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
          const storagePath = `storybooks/${userId}/${timestamp}_${sanitizedName}`
          const imageRef = ref(storage, storagePath)

          await uploadBytes(imageRef, buffer, { contentType: file.type })
          const url = getPublicUrl(storagePath)

          return {
            name: file.name,
            url,
            caption: ''
          }
        })
      )
    }

    if (generatedImageUrls) {
      try {
        const urls = JSON.parse(generatedImageUrls as string)
        if (Array.isArray(urls) && urls.length > 0) {
          results.generatedImages = await Promise.all(
            urls.map(async (url: string, index: number) => {
              try {
                const resp = await fetch(url)
                if (!resp.ok) {
                  throw new Error(`Failed to fetch: ${resp.status}`)
                }
                const buffer = Buffer.from(await resp.arrayBuffer())
                const contentType = resp.headers.get('content-type') || 'image/png'
                const ext = contentType.includes('jpeg') ? 'jpg' : 'png'
                const timestamp = Date.now()
                const storagePath = `storybooks/${userId}/generated/${timestamp}_ai-story_${index}.${ext}`
                const genRef = ref(storage, storagePath)

                await uploadBytes(genRef, buffer, { contentType })
                const downloadUrl = getPublicUrl(storagePath)

                return downloadUrl
              } catch (e) {
                console.error('Failed to upload generated image:', url, e)
                return url
              }
            })
          )
        }
      } catch (e) {
        console.error('Error parsing or processing generated image URLs:', e)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error in upload-images:', error)
    return NextResponse.json(
      {
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
