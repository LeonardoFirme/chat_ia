// frontend/src/lib/auth.ts
import { hash, compare } from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'v0_engine_secret_key_2026'
);

/**
 * Gera Hash seguro da senha
 */
export async function hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
}

/**
 * Compara senha com o hash do banco
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
}

/**
 * Cria Token JWT assinado
 */
export async function createToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(SECRET_KEY);
}

/**
 * Valida Token JWT
 */
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}