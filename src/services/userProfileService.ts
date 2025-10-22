import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface UserProfile {
  userId: string
  // User preferences
  communicationStyle?: 'formal' | 'friendly' | 'assertive'
  preferredLanguage?: string
  // Financial context
  financialSituation?: 'tight' | 'moderate' | 'flexible'
  hasInsurance?: boolean
  insuranceProvider?: string
  // Negotiation history
  successfulStrategies?: string[]
  totalBillsNegotiated?: number
  totalAmountSaved?: number
  averageReductionRate?: number
  // User context
  commonProviders?: string[]
  preferredPaymentTerms?: string
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface BillContext {
  billId: string
  userId: string
  fileName: string
  // Extracted metadata
  provider?: string
  totalAmount?: number
  dateOfService?: string
  insuranceClaimed?: boolean
  // User notes
  userNotes?: string
  negotiationStatus?: 'pending' | 'in_progress' | 'successful' | 'unsuccessful'
  finalAmount?: number
  amountSaved?: number
  // Timestamps
  uploadedAt: Date
  lastUpdated: Date
}

const PROFILES_COLLECTION = 'userProfiles'
const BILLS_COLLECTION = 'billContexts'

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, userId)
    const profileDoc = await getDoc(profileRef)

    if (!profileDoc.exists()) {
      // Create default profile
      const defaultProfile: UserProfile = {
        userId,
        communicationStyle: 'friendly',
        preferredLanguage: 'en',
        successfulStrategies: [],
        totalBillsNegotiated: 0,
        totalAmountSaved: 0,
        averageReductionRate: 0,
        commonProviders: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      await setDoc(profileRef, {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      return defaultProfile
    }

    const data = profileDoc.data()
    return {
      userId: data.userId,
      communicationStyle: data.communicationStyle,
      preferredLanguage: data.preferredLanguage,
      financialSituation: data.financialSituation,
      hasInsurance: data.hasInsurance,
      insuranceProvider: data.insuranceProvider,
      successfulStrategies: data.successfulStrategies || [],
      totalBillsNegotiated: data.totalBillsNegotiated || 0,
      totalAmountSaved: data.totalAmountSaved || 0,
      averageReductionRate: data.averageReductionRate || 0,
      commonProviders: data.commonProviders || [],
      preferredPaymentTerms: data.preferredPaymentTerms,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    }
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const profileRef = doc(db, PROFILES_COLLECTION, userId)
  await updateDoc(profileRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Save bill context for future reference
 */
export async function saveBillContext(billContext: BillContext): Promise<void> {
  const billRef = doc(db, BILLS_COLLECTION, billContext.billId)
  await setDoc(billRef, {
    ...billContext,
    uploadedAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  })
}

/**
 * Update bill context with negotiation results
 */
export async function updateBillContext(
  billId: string,
  updates: Partial<BillContext>
): Promise<void> {
  const billRef = doc(db, BILLS_COLLECTION, billId)
  await updateDoc(billRef, {
    ...updates,
    lastUpdated: serverTimestamp(),
  })
}

/**
 * Record successful negotiation and update user profile
 */
export async function recordSuccessfulNegotiation(
  userId: string,
  billId: string,
  amountSaved: number,
  strategy: string
): Promise<void> {
  const profile = await getUserProfile(userId)
  if (!profile) return

  const newTotal = (profile.totalAmountSaved || 0) + amountSaved
  const newCount = (profile.totalBillsNegotiated || 0) + 1
  const newAverage = newTotal / newCount

  const strategies = profile.successfulStrategies || []
  if (!strategies.includes(strategy)) {
    strategies.push(strategy)
  }

  await updateUserProfile(userId, {
    totalBillsNegotiated: newCount,
    totalAmountSaved: newTotal,
    averageReductionRate: newAverage,
    successfulStrategies: strategies,
  })

  await updateBillContext(billId, {
    negotiationStatus: 'successful',
    amountSaved,
  })
}
