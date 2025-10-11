import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { generatedText, imageCount } = await request.json();

    if (!generatedText) {
      return NextResponse.json(
        { success: false, error: 'No generated text provided' },
        { status: 400 }
      );
    }

    // Split the text into sentences first
    const sentences = generatedText
      .split(/[.!?]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    // Calculate target sentences per paragraph based on image count
    // We want roughly one paragraph per image, but ensure minimum content
    const targetParagraphs = Math.max(imageCount, 1);
    const sentencesPerParagraph = Math.max(Math.ceil(sentences.length / targetParagraphs), 2);

    // Group sentences into paragraphs
    const paragraphs: string[] = [];
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
      const paragraphSentences = sentences.slice(i, i + sentencesPerParagraph);
      if (paragraphSentences.length > 0) {
        // Add proper punctuation back and join
        const paragraph = paragraphSentences
          .map((sentence: string, index: number) => {
            // Add appropriate punctuation if missing
            if (!sentence.match(/[.!?]$/)) {
              return sentence + '.';
            }
            return sentence;
          })
          .join(' ');
        paragraphs.push(paragraph);
      }
    }

    // If we have fewer paragraphs than images, split the longest paragraphs
    while (paragraphs.length < imageCount && paragraphs.length > 0) {
      // Find the longest paragraph
      let longestIndex = 0;
      let longestLength = 0;
      paragraphs.forEach((p, index) => {
        if (p.length > longestLength) {
          longestLength = p.length;
          longestIndex = index;
        }
      });

      // Split the longest paragraph roughly in half
      const longestParagraph = paragraphs[longestIndex];
      const sentences = longestParagraph.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
      
      if (sentences.length > 1) {
        const midPoint = Math.ceil(sentences.length / 2);
        const firstHalf = sentences.slice(0, midPoint).map(s => s.match(/[.!?]$/) ? s : s + '.').join(' ');
        const secondHalf = sentences.slice(midPoint).map(s => s.match(/[.!?]$/) ? s : s + '.').join(' ');
        
        paragraphs[longestIndex] = firstHalf;
        paragraphs.splice(longestIndex + 1, 0, secondHalf);
      } else {
        break; // Can't split further
      }
    }

    // If we have more paragraphs than images, combine shorter ones
    while (paragraphs.length > imageCount && paragraphs.length > 1) {
      // Find two adjacent shorter paragraphs to combine
      let shortestIndex = 0;
      let shortestLength = paragraphs[0].length;
      
      for (let i = 0; i < paragraphs.length - 1; i++) {
        const combinedLength = paragraphs[i].length + paragraphs[i + 1].length;
        if (combinedLength < shortestLength) {
          shortestLength = combinedLength;
          shortestIndex = i;
        }
      }
      
      // Combine the two paragraphs
      paragraphs[shortestIndex] = paragraphs[shortestIndex] + ' ' + paragraphs[shortestIndex + 1];
      paragraphs.splice(shortestIndex + 1, 1);
    }

    return NextResponse.json({
      success: true,
      paragraphs: paragraphs.slice(0, imageCount) // Ensure we don't exceed image count
    });

  } catch (error) {
    console.error('Error splitting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to split story into paragraphs' },
      { status: 500 }
    );
  }
}
