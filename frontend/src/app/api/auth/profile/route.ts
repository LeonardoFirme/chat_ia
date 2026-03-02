// frontend/src/app/api/auth/profile/route.ts
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

export async function PUT(req: Request) {
    try {
        const userId = await getAuth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { name } = await req.json();
        const updated = await prisma.user.update({
            where: { id: userId },
            data: { name }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getAuth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await prisma.$transaction(async (tx) => {
            const sessions = await tx.chatSession.findMany({
                where: { userId },
                select: { id: true }
            });
            const sessionIds = sessions.map(s => s.id);

            if (sessionIds.length > 0) {
                await tx.message.deleteMany({
                    where: { chatSessionId: { in: sessionIds } }
                });
            }

            await tx.chatSession.deleteMany({
                where: { userId }
            });

            await tx.user.delete({
                where: { id: userId }
            });
        });

        const cookieStore = await cookies();
        cookieStore.delete('v0_session_token');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE_ACCOUNT_ERROR]", error);
        return NextResponse.json({ error: 'Erro crítico ao deletar conta' }, { status: 500 });
    }
}