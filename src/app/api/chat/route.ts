import { NextRequest, NextResponse } from 'next/server'
import * as fal from '@fal-ai/serverless-client'

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

    const { messages, billFileName } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      )
    }

    // Build the system prompt for medical bill negotiation
    const systemPrompt = `You are an expert AI assistant helping people negotiate and reduce their medical bills. Your role is to:

1. Analyze medical bills and identify opportunities for reduction
2. Provide clear, professional advice on negotiation strategies
3. Draft professional messages that users can send to healthcare providers
4. Be empathetic and supportive while being practical

When a user uploads a bill, guide them through:
- Requesting itemized statements
- Identifying billing errors
- Negotiating payment plans
- Writing professional correspondence

Keep responses concise, actionable, and friendly.`

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    const extractAssistantMessage = (data: any): string | undefined => {
      if (!data) {
        return undefined
      }

      if (typeof data === 'string') {
        return data
      }

      if (typeof data.output === 'string') {
        return data.output
      }

      if (typeof data.output_text === 'string') {
        return data.output_text
      }

      if (Array.isArray(data.output)) {
        const firstOutput = data.output.find((item: any) => typeof item === 'string')
        if (typeof firstOutput === 'string') {
          return firstOutput
        }
        const firstText = data.output.find(
          (item: any) => typeof item === 'object' && typeof item.text === 'string'
        )
        if (firstText) {
          return firstText.text
        }
      }

      if (Array.isArray(data.choices) && data.choices.length > 0) {
        const choice = data.choices[0]
        if (typeof choice.text === 'string') {
          return choice.text
        }
        if (choice.message && typeof choice.message.content === 'string') {
          return choice.message.content
        }
      }

      if (data.message && typeof data.message.content === 'string') {
        return data.message.content
      }

      return undefined
    }

    // Format conversation into a single prompt
    const conversationText = messages
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n')
    const fullPrompt = `${conversationText}\n\nAssistant:`

    // Call fal.ai any-llm with GPT-5 model
    // Note: fal.ai any-llm uses 'prompt' and 'system_prompt' parameters separately
    const result: any = await fal.subscribe('fal-ai/any-llm', {
      input: {
        model: 'openai/gpt-5-chat',
        prompt: fullPrompt,
        system_prompt: systemPrompt,
        max_tokens: 1000,
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
    
    // Extract the response - fal.subscribe returns the output directly, not in result.data
    const assistantMessage = (result.output || result.data?.output) || 
      "I'm here to help you negotiate your medical bills. Could you tell me more about your situation?"
    
    console.log('Extracted message:', assistantMessage)

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
