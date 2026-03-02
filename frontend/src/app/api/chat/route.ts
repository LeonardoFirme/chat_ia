// frontend/src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { messages, sessionId } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (sessionId) {
      await prisma.message.create({
        data: {
          role: 'user',
          content: lastMessage.content,
          chatSessionId: sessionId,
        },
      });
    }

    const response = await fetch('http://127.0.0.1:8000/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Post Error:", error);
    return NextResponse.json({ error: 'Erro na persistência' }, { status: 500 });
  }
}