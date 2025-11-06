import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { generatedText, imageCount } = await request.json()

    if (!generatedText) {
      return NextResponse.json({ success: false, error: 'No generated text provided' }, { status: 400 })
    }

    const sentences = generatedText
      .split(/[.!?]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)

    const targetParagraphs = Math.max(imageCount, 1)
    const sentencesPerParagraph = Math.max(Math.ceil(sentences.length / targetParagraphs), 2)

    const paragraphs: string[] = []
    for (let i = 0; i < sentences.length; i += sentencesPerParagraph) {
      const paragraphSentences = sentences.slice(i, i + sentencesPerParagraph)
      if (paragraphSentences.length > 0) {
        const paragraph = paragraphSentences
          .map((sentence: string) => {
            if (!sentence.match(/[.!?]$/)) {
              return sentence + '.'
            }
            return sentence
          })
          .join(' ')
        paragraphs.push(paragraph)
      }
    }

    while (paragraphs.length < imageCount && paragraphs.length > 0) {
      let longestIndex = 0
      let longestLength = 0
      paragraphs.forEach((p, index) => {
        if (p.length > longestLength) {
          longestLength = p.length
          longestIndex = index
        }
      })

      const longestParagraph = paragraphs[longestIndex]
      if (!longestParagraph) {
        break
      }
      const sentences = longestParagraph
        .split(/[.!?]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      if (sentences.length > 1) {
        const midPoint = Math.ceil(sentences.length / 2)
        const firstHalf = sentences
          .slice(0, midPoint)
          .map((s) => (s.match(/[.!?]$/) ? s : s + '.'))
          .join(' ')
        const secondHalf = sentences
          .slice(midPoint)
          .map((s) => (s.match(/[.!?]$/) ? s : s + '.'))
          .join(' ')

        paragraphs[longestIndex] = firstHalf
        paragraphs.splice(longestIndex + 1, 0, secondHalf)
      } else {
        break
      }
    }

    while (paragraphs.length > imageCount && paragraphs.length > 1) {
      let shortestIndex = 0
      let shortestLength = paragraphs[0]?.length ?? 0

      for (let i = 0; i < paragraphs.length - 1; i++) {
        const a = paragraphs[i]
        const b = paragraphs[i + 1]
        if (!a || !b) continue
        const combinedLength = a.length + b.length
        if (combinedLength < shortestLength) {
          shortestLength = combinedLength
          shortestIndex = i
        }
      }

      if (!paragraphs[shortestIndex + 1]) break
      paragraphs[shortestIndex] = paragraphs[shortestIndex]! + ' ' + paragraphs[shortestIndex + 1]!
      paragraphs.splice(shortestIndex + 1, 1)
    }

    return NextResponse.json({
      success: true,
      paragraphs: paragraphs.slice(0, imageCount)
    })
  } catch (error) {
    console.error('Error splitting story:', error)
    return NextResponse.json({ success: false, error: 'Failed to split story into paragraphs' }, { status: 500 })
  }
}
