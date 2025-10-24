import * as fal from '@fal-ai/serverless-client'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

fal.config({
  credentials: process.env.FAL_KEY as string
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.FAL_KEY) {
      throw new Error('Missing FAL_KEY environment variable')
    }
    const { prompt, style = 'realistic', aspectRatio = '16:9', numImages = 1 } = await request.json()

    const stylePrompts = {
      realistic: 'photorealistic, high quality, detailed',
      artistic: 'artistic, painterly, beautiful composition',
      watercolor: 'watercolor painting style, soft colors, artistic',
      sketch: 'pencil sketch style, detailed line art',
      vintage: 'vintage photography style, warm tones, nostalgic'
    }

    const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic}, pregnancy journey, heartwarming, beautiful lighting`

    const result = await fal.subscribe('fal-ai/flux-pro/new', {
      input: {
        prompt: enhancedPrompt,
        image_size: aspectRatio === '1:1' ? 'square_hd' : 'landscape_16_9',
        num_images: numImages,
        safety_tolerance: '2',
        output_format: 'jpeg'
      }
    })

    const resultAny = result as any
    let imageUrls: string[] = []

    if (resultAny.images && Array.isArray(resultAny.images)) {
      imageUrls = resultAny.images.map((img: any) => img.url)
    } else if (resultAny.data && Array.isArray(resultAny.data)) {
      imageUrls = resultAny.data.map((img: any) => img.url)
    } else if (resultAny.url) {
      imageUrls = [resultAny.url]
    } else {
      console.error('Unexpected image response structure:', result)
      throw new Error('Unexpected API response structure')
    }

    return NextResponse.json({
      success: true,
      imageUrls,
      prompt: enhancedPrompt
    })
  } catch (error) {
    console.error('Error generating image:', error)

    if (error && typeof error === 'object' && 'body' in error) {
      console.error('Error body:', JSON.stringify((error as any).body, null, 2))
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate image. Please try again.',
        details: error && typeof error === 'object' && 'body' in error ? (error as any).body : null
      },
      { status: 500 }
    )
  }
}
