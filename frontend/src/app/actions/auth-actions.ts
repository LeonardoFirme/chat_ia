// frontend/src/app/actions/auth-actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'v0_engine_secret_key_2026');

export type ActionResponse = {
    error?: string;
    success?: boolean;
} | null;

export async function loginAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) return { error: 'Dados insuficientes.' };

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { error: 'Credenciais inválidas.' };

        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) return { error: 'Credenciais inválidas.' };

        const token = await new SignJWT({
            id: user.id,
            email: user.email,
            name: user.name
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(SECRET_KEY);

        const cookieStore = await cookies();
        cookieStore.set('v0_session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24
        });

        return { success: true };
    } catch (error) {
        return { error: 'Erro interno no servidor.' };
    }
}

export async function registerAction(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) return { error: 'Preencha todos os campos.' };

    try {
        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) return { error: 'E-mail já cadastrado.' };

        const hashedPassword = await hash(password, 12);

        await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        return { success: true };
    } catch (error) {
        return { error: 'Erro ao criar conta.' };
    }
}

export async function getUserProfile() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('v0_session_token')?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, SECRET_KEY);
        const email = payload.email as string;

        if (!email) return null;

        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true
            }
        });

        if (!user) return null;

        return {
            ...user,
            createdAt: user.createdAt.toISOString()
        };
    } catch (error) {
        return null;
    }
}