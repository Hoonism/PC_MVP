import { NextRequest, NextResponse } from 'next/server'
import * as fal from '@fal-ai/serverless-client'
import { getUserProfile } from '@/services/userProfileService'
import { buildSystemPrompt, getFewShotExamples, summarizeConversation, extractBillMetadata } from '@/services/promptBuilder'

// Configure fal.ai with the API key from environment variables
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      console.error('FAL_KEY is not configured')
      return NextResponse.json(
        { error: 'Server misconfiguration: FAL_KEY is missing', success: false },
        { status: 500 }
      )
    }

    const { messages, billFileName, userId } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // Get user profile for personalized prompting
    const userProfile = userId ? await getUserProfile(userId) : null

    // Extract metadata from conversation
    const billMetadata = extractBillMetadata(messages)
    
    // Build dynamic system prompt with user context
    const systemPrompt = buildSystemPrompt({
      userProfile,
      billFileName,
      conversationLength: messages.length,
      hasInsurance: billMetadata.hasInsurance,
    })

    // Add conversation summary for long conversations (context window management)
    let conversationSummary = ''
    if (messages.length > 15) {
      conversationSummary = summarizeConversation(messages)
    }

    // Helper function to extract assistant message from various response formats
    const extractAssistantMessage = (data: any): string => {
      // Try direct output field
      if (typeof data?.output === 'string' && data.output.trim()) {
        return data.output.trim()
      }

      // Try nested data.output
      if (typeof data?.data?.output === 'string' && data.data.output.trim()) {
        return data.data.output.trim()
      }

      // Try output_text field
      if (typeof data?.output_text === 'string' && data.output_text.trim()) {
        return data.output_text.trim()
      }

      // Try choices array (OpenAI format)
      if (Array.isArray(data?.choices) && data.choices.length > 0) {
        const choice = data.choices[0]
        if (choice?.message?.content) {
          return choice.message.content.trim()
        }
        if (typeof choice?.text === 'string') {
          return choice.text.trim()
        }
      }

      // Fallback message
      return "I'm here to help you negotiate your medical bills. Could you tell me more about your situation?"
    }

    // Format messages for the API (using proper chat format)
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      // Add few-shot examples for better quality (only for first few messages)
      ...(messages.length <= 3 ? getFewShotExamples() : []),
      // Add conversation summary if needed
      ...(conversationSummary ? [{ role: 'system', content: conversationSummary }] : []),
      // Add actual conversation
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Call fal.ai any-llm with GPT-5 model
    const result: any = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: 'openai/gpt-5-chat',
        messages: chatMessages,
        max_tokens: 1500,
        temperature: 0.7,
        priority: 'latency',
      },
      logs: true,
      onQueueUpdate: (update: any) => {
        console.log('Queue update:', update)
      },
    })

    // Log the actual response structure for debugging
    console.log('Full result:', JSON.stringify(result, null, 2))
    
    // Extract the response using the helper function
    const assistantMessage = extractAssistantMessage(result)
    
    console.log('Extracted message:', assistantMessage)
    console.log('User profile used:', userProfile ? 'Yes' : 'No')
    console.log('Bill metadata:', billMetadata)

    return NextResponse.json({
      message: assistantMessage,
      success: true,
    })
  } catch (error: any) {
    try {
      console.error('Error calling fal.ai API:', error?.message || error)
      if (error && typeof error === 'object') {
        console.error('Error details:', JSON.stringify(error, null, 2))
      }
    } catch {}
    
    return NextResponse.json(
      { 
        error: 'Failed to get AI response', 
        details: error.message || 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// Configure route segment
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
