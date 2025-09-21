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
  private storybooksCollection = collection(db, 'storybooks');

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
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<string> {
    try {
      // Upload ALL images via server-side API to avoid CORS issues
      const formData = new FormData();
      formData.append('userId', userId);
      
      // Add user files
      inputData.images.forEach((file) => {
        formData.append('files', file);
      });
      
      // Add generated image URLs if any
      if (generatedImageUrls && generatedImageUrls.length > 0) {
        formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls));
      }

      console.log('Uploading all images via server API...');
      const uploadResponse = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Map uploaded user images with captions
      const imageUploads = uploadResult.userImages.map((img: any, index: number) => ({
        ...img,
        caption: inputData.captions[index] || ''
      }));

      const generatedUploads = uploadResult.generatedImages || [];

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
    },
    generatedText: string,
    generatedImageUrls: string[] = []
  ): Promise<void> {
    try {
      const docRef = doc(db, 'storybooks', storybookId);
      
      // Get existing storybook to clean up old images
      const existingDoc = await getDoc(docRef);
      if (existingDoc.exists()) {
        const existingData = existingDoc.data() as StorybookData;
        
        // Delete old images from storage
        await Promise.all(
          existingData.input.images.map(async (image) => {
            try {
              const imageRef = ref(storage, image.url);
              await deleteObject(imageRef);
            } catch (error) {
              console.warn('Error deleting old image:', error);
            }
          })
        );

        // Delete old generated images from storage as well
        await Promise.all(
          (existingData.output?.imageUrls || []).map(async (url) => {
            try {
              const imageRef = ref(storage, url);
              await deleteObject(imageRef);
            } catch (error) {
              console.warn('Error deleting old generated image:', error);
            }
          })
        );
      }

      // Upload ALL images via server-side API to avoid CORS issues
      const formData = new FormData();
      formData.append('userId', userId);
      
      // Add user files
      inputData.images.forEach((file) => {
        formData.append('files', file);
      });
      
      // Add generated image URLs if any
      if (generatedImageUrls && generatedImageUrls.length > 0) {
        formData.append('generatedImageUrls', JSON.stringify(generatedImageUrls));
      }

      console.log('Uploading all images via server API...');
      const uploadResponse = await fetch('/api/upload-images', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log('Upload result:', uploadResult);

      // Map uploaded user images with captions
      const imageUploads = uploadResult.userImages.map((img: any, index: number) => ({
        ...img,
        caption: inputData.captions[index] || ''
      }));

      const generatedUploads = uploadResult.generatedImages || [];

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
      const docRef = doc(db, 'storybooks', storybookId);
      
      // Get storybook data to clean up images
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const storybookData = docSnap.data() as StorybookData;
        
        // Delete images from storage
        await Promise.all(
          storybookData.input.images.map(async (image) => {
            try {
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
