import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fullUrl = request.url
    const urlParamMatch = fullUrl.match(/[?&]url=([^&]+)/)

    if (!urlParamMatch || !urlParamMatch[1]) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    const rawParam = urlParamMatch[1]
    const url: string = /^https?%3A/i.test(rawParam) ? decodeURIComponent(rawParam) : rawParam

    let normalizedUrl = url
    const oIndex = normalizedUrl.indexOf('/o/')
    if (oIndex !== -1) {
      const qIndex = normalizedUrl.indexOf('?', oIndex)
      const endIndex = qIndex === -1 ? normalizedUrl.length : qIndex
      const before = normalizedUrl.slice(0, oIndex + 3)
      const objectPart = normalizedUrl.slice(oIndex + 3, endIndex)
      if (objectPart.includes('/')) {
        const fixedObjectPart = objectPart.split('/').join('%2F')
        normalizedUrl = before + fixedObjectPart + normalizedUrl.slice(endIndex)
      }
    }

    const resp = await fetch(normalizedUrl, {
      cache: 'no-store',
      headers: {
        Accept: 'image/*,*/*;q=0.8'
      }
    })

    if (!resp.ok) {
      const errorText = await resp.text()
      return NextResponse.json(
        {
          error: `Failed to fetch image (${resp.status})`,
          details: errorText,
          url: normalizedUrl,
          status: resp.status
        },
        { status: 502 }
      )
    }

    const contentType = resp.headers.get('content-type') || 'image/jpeg'
    const commonHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*'
    }

    if (resp.body) {
      return new Response(resp.body, {
        status: 200,
        headers: commonHeaders
      })
    }

    const arrayBuffer = await resp.arrayBuffer()
    return new Response(new Uint8Array(arrayBuffer), {
      status: 200,
      headers: commonHeaders
    })
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error: ' + (error as Error).message }, { status: 500 })
  }
}
