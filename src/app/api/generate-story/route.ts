import * as fal from "@fal-ai/serverless-client";
import { NextRequest, NextResponse } from 'next/server';

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge';

// Configure fal.ai
fal.config({
  credentials: "9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b"
});

export async function POST(request: NextRequest) {
  try {
    const { text, tone, imageCount, captions } = await request.json();

    // Create tone-specific prompts with better structure
    const tonePrompts = {
      sweet: {
        style: "sweet, sentimental, and heartwarming",
        voice: "loving and tender",
        focus: "the emotional journey and tender moments"
      },
      humorous: {
        style: "humorous, honest, and relatable",
        voice: "funny yet authentic",
        focus: "the real, unexpected, and amusing moments"
      },
      journalistic: {
        style: "journalistic, factual, and milestone-focused",
        voice: "clear and informative",
        focus: "key developments and important milestones"
      },
      poetic: {
        style: "poetic, lyrical, and reflective",
        voice: "beautiful and contemplative",
        focus: "the wonder, transformation, and deeper meaning"
      }
    };

    const selectedTone = tonePrompts[tone as keyof typeof tonePrompts];

    // Build the enhanced prompt
    const prompt = `You are writing a personalized pregnancy journey story for a family's storybook. This will be treasured for years.

TONE & STYLE:
Write in a ${selectedTone.style} style with a ${selectedTone.voice} voice, focusing on ${selectedTone.focus}.

PARENT'S MEMORIES:
${text || 'The family is capturing their pregnancy journey through photos.'}

PHOTO JOURNEY (${imageCount} photos):
${captions.length > 0 
  ? captions.map((caption: string, i: number) => `Photo ${i + 1}: ${caption}`).join('\n')
  : `${imageCount} meaningful moments from their journey`}

INSTRUCTIONS:
1. Create a narrative that weaves together the parent's memories with the photo captions
2. Each photo caption should be naturally referenced or alluded to in the story
3. Create a clear beginning (anticipation), middle (journey), and end (looking forward)
4. Make specific references to moments described in the captions - don't just list them
5. Keep the ${tone} tone consistent throughout
6. Write 300-500 words that feel intimate and personal
7. Use "we/our" perspective if the parent used it, otherwise use third person
8. End with a warm, forward-looking conclusion

Write the story now, making it feel like it was written by someone who lived this experience:`;


    console.log('Sending request to fal.ai with prompt:', prompt.substring(0, 100) + '...');
    
    const result = await fal.subscribe("fal-ai/any-llm", {
      input: {
        model: "openai/gpt-5-chat",
        prompt: prompt,
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 0.9
      }
    });

    console.log('fal.ai response:', JSON.stringify(result, null, 2));

    // Handle different possible response structures
    let generatedText = '';
    const resultAny = result as any;
    
    if (resultAny.output && resultAny.output.choices && resultAny.output.choices[0]) {
      generatedText = resultAny.output.choices[0].message.content;
    } else if (resultAny.output && typeof resultAny.output === 'string') {
      generatedText = resultAny.output;
    } else if (resultAny.choices && resultAny.choices[0]) {
      generatedText = resultAny.choices[0].message.content;
    } else if (resultAny.content) {
      generatedText = resultAny.content;
    } else if (typeof resultAny === 'string') {
      generatedText = resultAny;
    } else {
      console.error('Unexpected response structure:', result);
      throw new Error('Unexpected API response structure');
    }

    return NextResponse.json({ 
      success: true, 
      generatedText 
    });

  } catch (error) {
    console.error('Error generating story:', error);
    
    // Log the detailed error information
    if (error && typeof error === 'object' && 'body' in error) {
      console.error('Error body:', JSON.stringify((error as any).body, null, 2));
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate story. Please try again.',
        details: error && typeof error === 'object' && 'body' in error ? (error as any).body : null
      },
      { status: 500 }
    );
  }
}
