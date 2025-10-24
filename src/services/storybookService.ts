import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

export interface StorybookData {
  id?: string
  userId: string
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  input: {
    text: string
    tone: string
    images: {
      name: string
      url: string
      caption: string
    }[]
    textFiles: {
      name: string
      content: string
    }[]
  }
  output: {
    generatedText: string
    imageUrls: string[]
  }
}

class StorybookService {
  private get storybooksCollection() {
    if (!db) throw new Error('Firebase Firestore not initialized')
    return collection(db, 'storybooks')
  }

  async saveStorybook(
    userId: string,
    name: string,
    inputData: {
      text: string
      tone: string
      images: File[]
      textFiles: File[]
      captions: string[]
      existingImageUrls?: string[]
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<string> {
    try {
      const existingUrls = inputData.existingImageUrls || []
      const newImages: File[] = []
      const finalImages: Array<{ name: string; url: string; caption: string }> = new Array(
        inputData.images.length
      )
      const uploadIndices: number[] = []

      inputData.images.forEach((file, index) => {
        const existingUrl = existingUrls[index]
        if (existingUrl) {
          finalImages[index] = {
            name: file.name,
            url: existingUrl,
            caption: inputData.captions[index] || ''
          }
        } else {
          newImages.push(file)
          uploadIndices.push(index)
        }
      })

      let generatedUploads: string[] = []

      if (newImages.length > 0 || (generatedImageUrls && generatedImageUrls.length > 0)) {
        const formData = new FormData()
        formData.append('userId', userId)

        newImages.forEach((file) => {
          formData.append('files', file)
        })

        if (generatedImageUrls && generatedImageUrls.length > 0) {
          formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls))
        }

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`)
        }

        const uploadResult = await uploadResponse.json()
        generatedUploads = uploadResult.generatedImages || []

        let uploadIndex = 0
        for (const i of uploadIndices) {
          const uploaded = uploadResult.userImages[uploadIndex]
          finalImages[i] = {
            ...uploaded,
            caption: inputData.captions[i] || ''
          }
          uploadIndex++
        }
      }

      const imageUploads = finalImages

      const textFileData = await Promise.all(
        inputData.textFiles.map(async (file) => {
          const content = await file.text()
          return {
            name: file.name,
            content
          }
        })
      )

      const storybookData: Omit<StorybookData, 'id'> = {
        userId,
        name,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        input: {
          text: inputData.text,
          tone: inputData.tone,
          images: imageUploads,
          textFiles: textFileData
        },
        output: {
          generatedText,
          imageUrls: generatedUploads
        }
      }

      const docRef = await addDoc(this.storybooksCollection, storybookData)
      return docRef.id
    } catch (error) {
      console.error('Error saving storybook:', error)
      throw error
    }
  }

  async updateStorybook(
    storybookId: string,
    userId: string,
    name: string,
    inputData: {
      text: string
      tone: string
      images: File[]
      textFiles: File[]
      captions: string[]
      existingImageUrls?: string[]
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized')
      const docRef = doc(db, 'storybooks', storybookId)

      const existingDoc = await getDoc(docRef)
      const existingUrls = inputData.existingImageUrls || []

      if (existingDoc.exists()) {
        const existingData = existingDoc.data() as StorybookData

        const urlsToKeep = new Set(existingUrls.filter((url) => url))
        await Promise.all(
          existingData.input.images.map(async (image) => {
            if (!urlsToKeep.has(image.url)) {
              try {
                if (!storage) throw new Error('Firebase Storage not initialized')
                const imageRef = ref(storage, image.url)
                await deleteObject(imageRef)
              } catch (error) {
                console.warn('Error deleting old image:', error)
              }
            }
          })
        )

        if (generatedImageUrls && generatedImageUrls.length > 0) {
          await Promise.all(
            (existingData.output?.imageUrls || []).map(async (url) => {
              try {
                if (!storage) throw new Error('Firebase Storage not initialized')
                const imageRef = ref(storage, url)
                await deleteObject(imageRef)
              } catch (error) {
                console.warn('Error deleting old generated image:', error)
              }
            })
          )
        }
      }

      const newImages: File[] = []
      const finalImages: Array<{ name: string; url: string; caption: string }> = new Array(
        inputData.images.length
      )
      const uploadIndices: number[] = []

      inputData.images.forEach((file, index) => {
        const existingUrl = existingUrls[index]
        if (existingUrl) {
          finalImages[index] = {
            name: file.name,
            url: existingUrl,
            caption: inputData.captions[index] || ''
          }
        } else {
          newImages.push(file)
          uploadIndices.push(index)
        }
      })

      let generatedUploads: string[] = []

      if (newImages.length > 0 || (generatedImageUrls && generatedImageUrls.length > 0)) {
        const formData = new FormData()
        formData.append('userId', userId)

        newImages.forEach((file) => {
          formData.append('files', file)
        })

        if (generatedImageUrls && generatedImageUrls.length > 0) {
          formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls))
        }

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`)
        }

        const uploadResult = await uploadResponse.json()
        generatedUploads = uploadResult.generatedImages || []

        let uploadIndex = 0
        for (const i of uploadIndices) {
          const uploaded = uploadResult.userImages[uploadIndex]
          finalImages[i] = {
            ...uploaded,
            caption: inputData.captions[i] || ''
          }
          uploadIndex++
        }
      }

      const imageUploads = finalImages

      const textFileData = await Promise.all(
        inputData.textFiles.map(async (file) => {
          const content = await file.text()
          return {
            name: file.name,
            content
          }
        })
      )

      const updateData: Partial<StorybookData> = {
        name,
        updatedAt: serverTimestamp() as Timestamp,
        input: {
          text: inputData.text,
          tone: inputData.tone,
          images: imageUploads,
          textFiles: textFileData
        },
        output: {
          generatedText,
          imageUrls: generatedUploads
        }
      }

      await updateDoc(docRef, updateData)
    } catch (error) {
      console.error('Error updating storybook:', error)
      throw error
    }
  }

  async getUserStorybooks(userId: string): Promise<StorybookData[]> {
    try {
      const q = query(this.storybooksCollection, where('userId', '==', userId))

      const querySnapshot = await getDocs(q)
      const storybooks = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data()
          } as StorybookData)
      )

      const sortedStorybooks = storybooks.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt as any)
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt as any)
        return bTime.getTime() - aTime.getTime()
      })

      return sortedStorybooks
    } catch (error) {
      console.error('Error fetching storybooks:', error)
      throw error
    }
  }

  async getStorybook(storybookId: string): Promise<StorybookData | null> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized')
      const docRef = doc(db, 'storybooks', storybookId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as StorybookData
      }
      return null
    } catch (error) {
      console.error('Error fetching storybook:', error)
      throw error
    }
  }

  async deleteStorybook(storybookId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized')
      const docRef = doc(db, 'storybooks', storybookId)

      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const storybookData = docSnap.data() as StorybookData

        await Promise.all(
          storybookData.input.images.map(async (image) => {
            try {
              if (!storage) throw new Error('Firebase Storage not initialized')
              const imageRef = ref(storage, image.url)
              await deleteObject(imageRef)
            } catch (error) {
              console.warn('Error deleting image:', error)
            }
          })
        )

        await Promise.all(
          (storybookData.output?.imageUrls || []).map(async (url) => {
            try {
              if (!storage) throw new Error('Firebase Storage not initialized')
              const imageRef = ref(storage, url)
              await deleteObject(imageRef)
            } catch (error) {
              console.warn('Error deleting generated image:', error)
            }
          })
        )
      }

      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting storybook:', error)
      throw error
    }
  }
}

export const storybookService = new StorybookService()
