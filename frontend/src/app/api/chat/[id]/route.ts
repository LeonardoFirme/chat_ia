// frontend/src/app/api/chat/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'v0_engine_secret_key_2026');

async function getAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('v0_session_token')?.value;
        if (!token) return null;
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.id as string;
    } catch {
        return null;
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getAuth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        console.log(`[API] Solicitando exclusao: ${id}`);

        await prisma.message.deleteMany({
            where: { chatSessionId: id }
        });

        await prisma.chatSession.deleteMany({
            where: {
                id: id,
                userId: userId
            }
        });

        console.log(`[API] Exclusao concluida: ${id}`);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[API_ERROR]", error);
        return NextResponse.json({ error: 'Database Fail' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const userId = await getAuth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { title, isPinned } = await req.json();

        await prisma.chatSession.updateMany({
            where: {
                id: id,
                userId: userId
            },
            data: {
                ...(title !== undefined && { title }),
                ...(isPinned !== undefined && { isPinned })
            }
        });

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("[API_ERROR]", error);
        return NextResponse.json({ error: 'Update Fail' }, { status: 500 });
    }
}