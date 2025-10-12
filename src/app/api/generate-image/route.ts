import * as fal from "@fal-ai/serverless-client";
import { NextRequest, NextResponse } from 'next/server';

// Configure fal.ai
fal.config({
  credentials: "9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b"
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = "realistic", aspectRatio = "16:9", numImages = 1 } = await request.json();

    console.log('Generating image with prompt:', prompt);

    // Create style-specific prompt enhancements
    const stylePrompts = {
      realistic: "photorealistic, high quality, detailed",
      artistic: "artistic, painterly, beautiful composition",
      watercolor: "watercolor painting style, soft colors, artistic",
      sketch: "pencil sketch style, detailed line art",
      vintage: "vintage photography style, warm tones, nostalgic"
    };

    const enhancedPrompt = `${prompt}, ${stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.realistic}, pregnancy journey, heartwarming, beautiful lighting`;

    const result = await fal.subscribe("fal-ai/flux-pro/new", {
      input: {
        prompt: enhancedPrompt,
        image_size: aspectRatio === "1:1" ? "square_hd" : "landscape_16_9",  // Landscape 16:9 format (1920x1080)
        num_images: numImages,
        safety_tolerance: "2",  // FLUX Pro uses safety_tolerance instead of enable_safety_checker
        output_format: "jpeg"   // Optimize for file size
      }
    });

    console.log('fal.ai image generation response:', JSON.stringify(result, null, 2));

    // Extract image URLs from the response
    const resultAny = result as any;
    let imageUrls: string[] = [];

    if (resultAny.images && Array.isArray(resultAny.images)) {
      imageUrls = resultAny.images.map((img: any) => img.url);
    } else if (resultAny.data && Array.isArray(resultAny.data)) {
      imageUrls = resultAny.data.map((img: any) => img.url);
    } else if (resultAny.url) {
      imageUrls = [resultAny.url];
    } else {
      console.error('Unexpected image response structure:', result);
      throw new Error('Unexpected API response structure');
    }

    return NextResponse.json({ 
      success: true, 
      imageUrls,
      prompt: enhancedPrompt
    });

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Log the detailed error information
    if (error && typeof error === 'object' && 'body' in error) {
      console.error('Error body:', JSON.stringify((error as any).body, null, 2));
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate image. Please try again.',
        details: error && typeof error === 'object' && 'body' in error ? (error as any).body : null
      },
      { status: 500 }
    );
  }
}
