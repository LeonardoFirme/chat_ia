// frontend/src/app/api/auth/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete('v0_session_token');

        const response = NextResponse.json(
            { success: true },
            { status: 200 }
        );

        response.headers.set('Clear-Site-Data', '"cookies", "storage", "cache"');
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
        response.headers.set('Pragma', 'no-cache');

        return response;
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}