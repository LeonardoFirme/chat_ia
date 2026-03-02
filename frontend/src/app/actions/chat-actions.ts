// frontend/src/app/actions/chat-actions.ts
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ChatThread, Message } from '@/types/chat';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'v0_engine_secret_key_2026');

async function getAuthenticatedUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('v0_session_token')?.value;
        if (!token) return null;

        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload.id as string;
    } catch (error) {
        return null;
    }
}

export async function getHistory(): Promise<ChatThread[]> {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return [];

        const sessions = await prisma.chatSession.findMany({
            where: {
                OR: [
                    { userId: userId },
                    { userId: null }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                },
                user: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        return sessions
            .filter(session => session.messages.length > 0)
            .map(session => ({
                id: session.id,
                title: session.title || 'Novo Projeto',
                isPinned: session.isPinned || false,
                updatedAt: session.updatedAt.getTime(),
                user: session.user,
                messages: session.messages.map(m => ({
                    role: m.role as Message['role'],
                    content: m.content
                }))
            }));
    } catch (error) {
        console.error('Falha ao carregar histórico:', error);
        return [];
    }
}

export async function createSessionAction() {
    return null;
}

export async function deleteChatAction(id: string) {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) throw new Error('Unauthorized');

        await prisma.$transaction([
            prisma.message.deleteMany({ where: { chatSessionId: id } }),
            prisma.chatSession.delete({ where: { id, userId } })
        ]);

        revalidatePath('/chat');
    } catch (error) {
        console.error('Falha ao deletar:', error);
        throw error;
    }
}

export async function renameChatAction(id: string, newTitle: string) {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) throw new Error('Unauthorized');

        await prisma.chatSession.update({
            where: { id, userId },
            data: { title: newTitle }
        });

        revalidatePath('/chat');
    } catch (error) {
        console.error('Falha ao renomear:', error);
        throw error;
    }
}

export async function togglePinAction(id: string) {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) throw new Error('Unauthorized');

        const session = await prisma.chatSession.findUnique({
            where: { id, userId },
            select: { isPinned: true }
        });

        if (!session) return;

        await prisma.chatSession.update({
            where: { id, userId },
            data: { isPinned: !session.isPinned }
        });

        revalidatePath('/chat');
    } catch (error) {
        console.error('Erro ao alternar fixação:', error);
        throw error;
    }
}

export async function saveMessageAction(sessionId: string | null, role: string, content: string) {
    try {
        const userId = await getAuthenticatedUserId();
        if (!userId) return { error: 'Não autenticado' };

        let currentSessionId = sessionId;

        if (!currentSessionId) {
            const newSession = await prisma.chatSession.create({
                data: {
                    title: content.substring(0, 35),
                    userId: userId,
                    isPinned: false
                }
            });
            currentSessionId = newSession.id;
        }

        await prisma.message.create({
            data: {
                chatSessionId: currentSessionId,
                role,
                content
            }
        });

        const session = await prisma.chatSession.findUnique({
            where: { id: currentSessionId },
            include: { _count: { select: { messages: true } } }
        });

        const updateData: any = { updatedAt: new Date() };

        if (session?._count.messages === 1 && role === 'user') {
            updateData.title = content.substring(0, 35);
        }

        await prisma.chatSession.update({
            where: { id: currentSessionId },
            data: updateData
        });

        revalidatePath('/chat');
        return { success: true, sessionId: currentSessionId };
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
        return { success: false };
    }
}