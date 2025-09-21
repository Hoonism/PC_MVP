import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      console.error('proxy-image: Missing url parameter');
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // Decode in case client sent encoded URL
    const targetUrl = decodeURIComponent(url);
    console.log('proxy-image: Fetching URL:', targetUrl);

    const resp = await fetch(targetUrl, {
      // Avoid caches to ensure fresh content
      cache: 'no-store',
      // For images, we don't need credentials
      headers: {
        Accept: 'image/*,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; JourneyBook/1.0)',
      },
    });

    console.log('proxy-image: Response status:', resp.status, 'for URL:', targetUrl);

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('proxy-image: Failed to fetch image:', resp.status, errorText);
      return NextResponse.json({ 
        error: `Failed to fetch image (${resp.status}): ${errorText}`,
        url: targetUrl,
        status: resp.status
      }, { status: 502 });
    }

    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    console.log('proxy-image: Content-Type:', contentType);
    
    const arrayBuffer = await resp.arrayBuffer();
    console.log('proxy-image: Successfully fetched', arrayBuffer.byteLength, 'bytes');

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Prevent caching issues during development
        'Cache-Control': 'no-store',
        // Allow browser to display without CORS problems
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('proxy-image error:', error);
    return NextResponse.json({ 
      error: 'Proxy error: ' + (error as Error).message,
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}
