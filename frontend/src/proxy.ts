// frontend/src/proxy.ts
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/api/chat/:path*', '/chat/:path*', '/profile/:path*']
};

export default async function proxy(request: Request) {
  const url = new URL(request.url);

  const cookieHeader = request.headers.get('cookie') || '';
  const hasToken = cookieHeader.includes('v0_session_token');

  if (!hasToken && !url.pathname.includes('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (url.pathname === '/api/chat' && request.method === 'POST') {
    const backendUrl = `http://localhost:8000/`;
    const headers = new Headers(request.headers);
    headers.set('Host', 'localhost:8000');
    headers.delete('connection');

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: headers,
        body: request.body,
        // @ts-ignore
        duplex: 'half',
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');

      return new NextResponse(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Backend Connection Refused' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}