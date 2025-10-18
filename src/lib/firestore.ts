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
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

export interface StorybookData {
  id?: string;
  userId: string;
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  input: {
    text: string;
    tone: string;
    images: {
      name: string;
      url: string;
      caption: string;
    }[];
    textFiles: {
      name: string;
      content: string;
    }[];
  };
  output: {
    generatedText: string;
    imageUrls: string[]; // Placeholder for future image generation
  };
}

export class FirestoreService {
  private get storybooksCollection() {
    if (!db) throw new Error('Firebase Firestore not initialized');
    return collection(db, 'storybooks');
  }

  // Save a new storybook
  async saveStorybook(
    userId: string,
    name: string,
    inputData: {
      text: string;
      tone: string;
      images: File[];
      textFiles: File[];
      captions: string[];
      existingImageUrls?: string[]; // Optional: URLs of images that already exist
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<string> {
    try {
      const existingUrls = inputData.existingImageUrls || [];
      const newImages: File[] = [];
      // Maintain final images array in original order
      const finalImages: Array<{name: string; url: string; caption: string}> = new Array(inputData.images.length);
      // Track positions that require upload so we can place results correctly
      const uploadIndices: number[] = [];
      
      // Separate existing images from new uploads
      inputData.images.forEach((file, index) => {
        const existingUrl = existingUrls[index];
        if (existingUrl) {
          // Place existing image directly in its original slot
          console.log(`Skipping upload for existing image ${index + 1}:`, file.name);
          finalImages[index] = {
            name: file.name,
            url: existingUrl,
            caption: inputData.captions[index] || ''
          };
        } else {
          // New image, needs upload and mapping back to this index
          newImages.push(file);
          uploadIndices.push(index);
        }
      });
      
      let generatedUploads: string[] = [];
      
      // Upload only new images via server-side API
      if (newImages.length > 0 || (generatedImageUrls && generatedImageUrls.length > 0)) {
        console.log(`Uploading ${newImages.length} new images via server API...`);
        const formData = new FormData();
        formData.append('userId', userId);
        
        newImages.forEach((file) => {
          formData.append('files', file);
        });
        
        // Add generated image URLs if any
        if (generatedImageUrls && generatedImageUrls.length > 0) {
          formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls));
        }

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        
        generatedUploads = uploadResult.generatedImages || [];

        // Place uploaded images back into their original positions
        let uploadIndex = 0;
        for (const i of uploadIndices) {
          const uploaded = uploadResult.userImages[uploadIndex];
          finalImages[i] = {
            ...uploaded,
            caption: inputData.captions[i] || ''
          };
          uploadIndex++;
        }
      }
      
      // Use the finalImages array which already preserves the original order
      const imageUploads = finalImages;

      // Upload text files (store content in Firestore)
      const textFileData = await Promise.all(
        inputData.textFiles.map(async (file) => {
          const content = await file.text();
          return {
            name: file.name,
            content
          };
        })
      );

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
          imageUrls: generatedUploads // store uploaded generated image URLs
        }
      };

      const docRef = await addDoc(this.storybooksCollection, storybookData);
      console.log('Saved storybook with ID:', docRef.id, 'Data:', storybookData); // Debug log
      return docRef.id;
    } catch (error) {
      console.error('Error saving storybook:', error);
      throw error;
    }
  }

  // Update an existing storybook
  async updateStorybook(
    storybookId: string,
    userId: string,
    name: string,
    inputData: {
      text: string;
      tone: string;
      images: File[];
      textFiles: File[];
      captions: string[];
      existingImageUrls?: string[]; // Optional: URLs of images that already exist
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<void> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized');
      const docRef = doc(db, 'storybooks', storybookId);
      
      // Get existing storybook to identify which images to delete
      const existingDoc = await getDoc(docRef);
      const existingUrls = inputData.existingImageUrls || [];
      
      if (existingDoc.exists()) {
        const existingData = existingDoc.data() as StorybookData;
        
        // Delete only images that are no longer being used
        const urlsToKeep = new Set(existingUrls.filter(url => url));
        await Promise.all(
          existingData.input.images.map(async (image) => {
            if (!urlsToKeep.has(image.url)) {
              try {
                if (!storage) throw new Error('Firebase Storage not initialized');
                console.log('Deleting unused image:', image.url);
                const imageRef = ref(storage, image.url);
                await deleteObject(imageRef);
              } catch (error) {
                console.warn('Error deleting old image:', error);
              }
            }
          })
        );

        // Handle generated images similarly
        // For now, always re-upload generated images if provided
        if (generatedImageUrls && generatedImageUrls.length > 0) {
          await Promise.all(
            (existingData.output?.imageUrls || []).map(async (url) => {
              try {
                if (!storage) throw new Error('Firebase Storage not initialized');
                const imageRef = ref(storage, url);
                await deleteObject(imageRef);
              } catch (error) {
                console.warn('Error deleting old generated image:', error);
              }
            })
          );
        }
      }

      // Use the same smart upload logic as saveStorybook, preserving positions
      const newImages: File[] = [];
      const finalImages: Array<{name: string; url: string; caption: string}> = new Array(inputData.images.length);
      const uploadIndices: number[] = [];
      
      // Separate existing images from new uploads
      inputData.images.forEach((file, index) => {
        const existingUrl = existingUrls[index];
        if (existingUrl) {
          console.log(`Keeping existing image ${index + 1}:`, file.name);
          finalImages[index] = {
            name: file.name,
            url: existingUrl,
            caption: inputData.captions[index] || ''
          };
        } else {
          newImages.push(file);
          uploadIndices.push(index);
        }
      });
      
      let generatedUploads: string[] = [];
      
      // Upload only new images
      if (newImages.length > 0 || (generatedImageUrls && generatedImageUrls.length > 0)) {
        console.log(`Uploading ${newImages.length} new images via server API...`);
        const formData = new FormData();
        formData.append('userId', userId);
        
        newImages.forEach((file) => {
          formData.append('files', file);
        });
        
        if (generatedImageUrls && generatedImageUrls.length > 0) {
          formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls));
        }

        const uploadResponse = await fetch('/api/upload-images', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('Upload result:', uploadResult);
        
        generatedUploads = uploadResult.generatedImages || [];

        // Place uploaded images back into their original positions
        let uploadIndex = 0;
        for (const i of uploadIndices) {
          const uploaded = uploadResult.userImages[uploadIndex];
          finalImages[i] = {
            ...uploaded,
            caption: inputData.captions[i] || ''
          };
          uploadIndex++;
        }
      }
      
      // Use finalImages preserving original order
      const imageUploads = finalImages;

      // Upload text files (store content in Firestore)
      const textFileData = await Promise.all(
        inputData.textFiles.map(async (file) => {
          const content = await file.text();
          return {
            name: file.name,
            content
          };
        })
      );

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
      };

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating storybook:', error);
      throw error;
    }
  }

  // Get all storybooks for a user
  async getUserStorybooks(userId: string): Promise<StorybookData[]> {
    try {
      console.log('Fetching storybooks for userId:', userId); // Debug log
      
      const q = query(
        this.storybooksCollection,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const storybooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StorybookData));
      
      // Sort by updatedAt in JavaScript since we can't use orderBy without index
      const sortedStorybooks = storybooks.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(a.updatedAt as any);
        const bTime = b.updatedAt?.toDate?.() || new Date(b.updatedAt as any);
        return bTime.getTime() - aTime.getTime();
      });
      
      console.log('Found storybooks:', sortedStorybooks); // Debug log
      return sortedStorybooks;
    } catch (error) {
      console.error('Error fetching storybooks:', error);
      throw error;
    }
  }

  // Get a specific storybook
  async getStorybook(storybookId: string): Promise<StorybookData | null> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized');
      const docRef = doc(db, 'storybooks', storybookId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as StorybookData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching storybook:', error);
      throw error;
    }
  }

  // Delete a storybook
  async deleteStorybook(storybookId: string): Promise<void> {
    try {
      if (!db) throw new Error('Firebase Firestore not initialized');
      const docRef = doc(db, 'storybooks', storybookId);
      
      // Get storybook data to clean up images
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const storybookData = docSnap.data() as StorybookData;
        
        // Delete images from storage
        await Promise.all(
          storybookData.input.images.map(async (image) => {
            try {
              if (!storage) throw new Error('Firebase Storage not initialized');
              const imageRef = ref(storage, image.url);
              await deleteObject(imageRef);
            } catch (error) {
              console.warn('Error deleting image:', error);
            }
          })
        );

        // Delete generated images from storage
        await Promise.all(
          (storybookData.output?.imageUrls || []).map(async (url) => {
            try {
              if (!storage) throw new Error('Firebase Storage not initialized');
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            } catch (error) {
              console.warn('Error deleting generated image:', error);
            }
          })
        );
      }

      // Delete the document
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting storybook:', error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
