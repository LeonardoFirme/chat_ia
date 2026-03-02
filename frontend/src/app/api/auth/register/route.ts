// frontend/src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        // Aplica o Hash na senha
        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error) {
        console.error('Register API Error:', error);
        return NextResponse.json({ error: 'Erro ao registrar usuário' }, { status: 500 });
    }
}