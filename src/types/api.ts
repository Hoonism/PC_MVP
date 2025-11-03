/**
 * API Type Definitions
 * 
 * Type-safe definitions for all API requests and responses.
 * Using Zod for runtime validation to catch type mismatches early.
 */

import { z } from 'zod'

// ============================================================================
// Chat API Types
// ============================================================================

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
})

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema),
  billFileName: z.string().optional(),
  userId: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
})

export const ChatResponseSchema = z.object({
  message: z.string(),
  usage: z.object({
    promptTokens: z.number().optional(),
    completionTokens: z.number().optional(),
    totalTokens: z.number().optional(),
  }).optional(),
})

export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type ChatResponse = z.infer<typeof ChatResponseSchema>

// ============================================================================
// Story Generation API Types
// ============================================================================

export const GenerateStoryRequestSchema = z.object({
  photos: z.array(z.object({
    caption: z.string(),
    imageUrl: z.string().url(),
  })),
  tone: z.enum(['sweet', 'humorous', 'poetic', 'journalistic']),
  userId: z.string(),
})

export const GenerateStoryResponseSchema = z.object({
  story: z.string(),
  generatedAt: z.string().datetime().optional(),
})

export type GenerateStoryRequest = z.infer<typeof GenerateStoryRequestSchema>
export type GenerateStoryResponse = z.infer<typeof GenerateStoryResponseSchema>

// ============================================================================
// Image Generation API Types
// ============================================================================

export const GenerateImageRequestSchema = z.object({
  prompt: z.string().min(1),
  style: z.string().optional(),
})

export const GenerateImageResponseSchema = z.object({
  imageUrl: z.string().url(),
  revisedPrompt: z.string().optional(),
})

export type GenerateImageRequest = z.infer<typeof GenerateImageRequestSchema>
export type GenerateImageResponse = z.infer<typeof GenerateImageResponseSchema>

// ============================================================================
// Upload API Types
// ============================================================================

export const UploadImagesResponseSchema = z.object({
  urls: z.array(z.string().url()),
  count: z.number(),
})

export type UploadImagesResponse = z.infer<typeof UploadImagesResponseSchema>

// ============================================================================
// Error Response Types
// ============================================================================

export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError }

// ============================================================================
// Helper function to validate API responses
// ============================================================================

export function validateResponse<T>(
  schema: z.ZodType<T>,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `API response validation failed: ${error.issues.map((e) => e.message).join(', ')}`
      )
    }
    throw error
  }
}
