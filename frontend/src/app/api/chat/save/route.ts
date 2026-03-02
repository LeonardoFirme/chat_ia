// frontend/src/app/api/chat/save/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { sessionId, role, content } = await req.json();

    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: role,
        content: content,
      },
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar no MySQL' }, { status: 500 });
  }
}