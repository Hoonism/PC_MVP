import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  id?: string
  userId: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  // Label to differentiate from other projects
  projectLabel: string
}

const COLLECTION_NAME = 'chats'
const PROJECT_LABEL = 'BillReduce'

/**
 * Save a new chat session to Firestore
 */
export async function saveChat(
  userId: string,
  title: string,
  messages: Message[]
): Promise<string> {
  if (!db) {
    throw new Error('Firebase Firestore not initialized')
  }

  const chatData = {
    userId,
    title,
    messages: messages.map((msg) => ({
      ...msg,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    projectLabel: PROJECT_LABEL,
  }

  const docRef = await addDoc(collection(db, COLLECTION_NAME), chatData)
  return docRef.id
}

/**
 * Update an existing chat session
 */
export async function updateChat(
  chatId: string,
  title: string,
  messages: Message[]
): Promise<void> {
  if (!db) {
    throw new Error('Firebase Firestore not initialized')
  }

  const chatRef = doc(db, COLLECTION_NAME, chatId)
  await updateDoc(chatRef, {
    title,
    messages: messages.map((msg) => ({
      ...msg,
      timestamp: Timestamp.fromDate(msg.timestamp),
    })),
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a chat session
 */
export async function deleteChat(chatId: string): Promise<void> {
  if (!db) {
    throw new Error('Firebase Firestore not initialized')
  }

  const chatRef = doc(db, COLLECTION_NAME, chatId)
  await deleteDoc(chatRef)
}

/**
 * Get all chat sessions for a user (filtered by BillReduce label)
 */
export async function getUserChats(userId: string): Promise<ChatSession[]> {
  if (!db) {
    throw new Error('Firebase Firestore not initialized')
  }

  console.log('getUserChats called with userId:', userId, 'projectLabel:', PROJECT_LABEL)

  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId),
    where('projectLabel', '==', PROJECT_LABEL),
    orderBy('updatedAt', 'desc')
  )

  const querySnapshot = await getDocs(q)
  console.log('Query returned', querySnapshot.size, 'documents')
  const chats: ChatSession[] = []

  querySnapshot.forEach((doc) => {
    const data = doc.data()
    console.log('Processing chat document:', doc.id, data)
    chats.push({
      id: doc.id,
      userId: data.userId,
      title: data.title,
      messages: data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp?.toDate() || new Date(),
      })),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      projectLabel: data.projectLabel,
    })
  })

  console.log('Returning', chats.length, 'chats')
  return chats
}

/**
 * Get a specific chat session by ID
 */
export async function getChat(chatId: string): Promise<ChatSession | null> {
  if (!db) {
    throw new Error('Firebase Firestore not initialized')
  }

  const chatRef = doc(db, COLLECTION_NAME, chatId)
  const chatDoc = await getDoc(chatRef)

  if (!chatDoc.exists()) {
    return null
  }

  const data = chatDoc.data()
  return {
    id: chatDoc.id,
    userId: data.userId,
    title: data.title,
    messages: data.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp?.toDate() || new Date(),
    })),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    projectLabel: data.projectLabel,
  }
}

/**
 * Generate a title from the first user message
 */
export function generateChatTitle(messages: Message[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user')
  if (!firstUserMessage) {
    return 'New Chat'
  }

  const content = firstUserMessage.content
  // Take first 50 characters or until first newline
  const title = content.split('\n')[0].substring(0, 50)
  return title.length < content.length ? `${title}...` : title
}
