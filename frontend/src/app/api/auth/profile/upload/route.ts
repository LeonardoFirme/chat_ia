// fronted/src/app/api/auth/profile/upload/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'v0_engine_secret_key_2026');

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('v0_session_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, SECRET_KEY);
        const userId = payload.id as string;

        const formData = await req.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'Arquivo muito grande (Máx 2MB)' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: base64Image },
            select: { id: true, image: true }
        });

        return NextResponse.json({ success: true, image: updatedUser.image });
    } catch (error: any) {
        console.error('Erro no upload:', error);

        if (error.code === 'P2000') {
            return NextResponse.json({ error: 'Erro de armazenamento: Campo insuficiente no banco.' }, { status: 500 });
        }

        return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
    }
}