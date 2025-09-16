import * as fal from "@fal-ai/serverless-client";
import { NextRequest, NextResponse } from 'next/server';

// Configure fal.ai
fal.config({
  credentials: "9b64ee01-61ed-41a5-b061-6892996478ae:049b9d6f3fe58a5048b8c09efcf8217b"
});

export async function POST(request: NextRequest) {
  try {
    const { text, tone, imageCount, captions } = await request.json();

    // Create tone-specific prompts
    const tonePrompts = {
      sweet: "Create a sweet and sentimental pregnancy journey story that captures the tender emotions and loving anticipation of expecting parents.",
      humorous: "Write a humorous and honest pregnancy journey story that includes the funny, unexpected moments and real experiences of pregnancy.",
      journalistic: "Compose a journalistic and milestone-focused pregnancy story that documents key moments and developments in a structured, informative way.",
      poetic: "Craft a poetic and reflective pregnancy journey story using beautiful, lyrical language that captures the wonder and transformation of this time."
    };

    // Build the prompt
    const prompt = `
${tonePrompts[tone as keyof typeof tonePrompts]}

User's personal content:
${text}

Additional context:
- Number of photos: ${imageCount}
- Photo captions: ${captions.join(', ')}

Please create a cohesive, personalized pregnancy journey story that:
1. Incorporates the user's personal text naturally
2. References the photos and their captions meaningfully
3. Maintains the ${tone} tone throughout
4. Is approximately 300-500 words
5. Feels personal and authentic to this specific journey

The story should flow naturally and feel like it was written specifically for this family's unique experience.
`;

    console.log('Sending request to fal.ai with prompt:', prompt.substring(0, 100) + '...');
    
    const result = await fal.subscribe("fal-ai/any-llm", {
      input: {
        model: "openai/gpt-4o",
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
