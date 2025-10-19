import { NextRequest, NextResponse } from 'next/server';

// Configure for Cloudflare Pages Edge Runtime
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // DON'T use searchParams.get() - it decodes %2F to / which breaks Firebase
    // Instead, manually extract from the raw query string
    const fullUrl = request.url;
    const urlParamMatch = fullUrl.match(/[?&]url=([^&]+)/);
    
    if (!urlParamMatch || !urlParamMatch[1]) {
      console.error('proxy-image: Missing url parameter');
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }
    
    // Decode the URL param at most once (handles %252F -> %2F). If it's already plain, use as-is.
    const rawParam = urlParamMatch[1];
    const url: string = /^https?%3A/i.test(rawParam)
      ? decodeURIComponent(rawParam)
      : rawParam;
    
    // Normalize Firebase object path to ensure %2F is used between /o/ and query
    let normalizedUrl = url;
    const oIndex = normalizedUrl.indexOf('/o/');
    if (oIndex !== -1) {
      const qIndex = normalizedUrl.indexOf('?', oIndex);
      const endIndex = qIndex === -1 ? normalizedUrl.length : qIndex;
      const before = normalizedUrl.slice(0, oIndex + 3); // include '/o/'
      const objectPart = normalizedUrl.slice(oIndex + 3, endIndex);
      // If objectPart has any raw '/', encode them to %2F
      if (objectPart.includes('/')) {
        const fixedObjectPart = objectPart.split('/').join('%2F');
        normalizedUrl = before + fixedObjectPart + normalizedUrl.slice(endIndex);
      }
    }

    console.log('=== PROXY IMAGE DEBUG ===');
    console.log('Extracted URL:', url);
    console.log('Normalized URL:', normalizedUrl);
    console.log('Has %2F:', normalizedUrl.includes('%2F'));

    const resp = await fetch(normalizedUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'image/*,*/*;q=0.8',
      },
    });

    console.log('Response status:', resp.status);
    console.log('Response headers:', Object.fromEntries(resp.headers.entries()));

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error('=== FETCH FAILED ===');
      console.error('Status:', resp.status);
      console.error('Error body:', errorText);
      console.error('Full URL:', normalizedUrl);
      
      return NextResponse.json({ 
        error: `Failed to fetch image (${resp.status})`,
        details: errorText,
        url: normalizedUrl,
        status: resp.status
      }, { status: 502 });
    }

    const contentType = resp.headers.get('content-type') || 'image/jpeg';
    const commonHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
    };

    if (resp.body) {
      console.log('proxy-image: Streaming body');
      return new Response(resp.body, {
        status: 200,
        headers: commonHeaders,
      });
    }

    const arrayBuffer = await resp.arrayBuffer();
    console.log('proxy-image: Buffered -', arrayBuffer.byteLength, 'bytes');
    return new Response(new Uint8Array(arrayBuffer), {
      status: 200,
      headers: commonHeaders,
    });
  } catch (error) {
    try {
      // Attempt to include normalized URL context if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ctx = (error as any) || {};
      console.error('proxy-image error:', ctx?.message || error);
    } catch {}
    return NextResponse.json({ 
      error: 'Proxy error: ' + (error as Error).message
    }, { status: 500 });
  }
}
