// frontend/src/app/(auth)/login/page.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { loginAction, ActionResponse } from '@/app/actions/auth-actions';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TbSquareArrowLeft } from 'react-icons/tb';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(loginAction, null);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            toast.success('CADASTRO REALIZADO', {
                description: 'Sua conta foi criada. Faça login para acessar.',
            });
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }

        if (state?.error) {
            toast.error('FALHA NA AUTENTICAÇÃO', {
                description: state.error,
            });
            formRef.current?.reset();
        }

        if (state?.success) {
            toast.success('ACESSO CONCEDIDO', {
                description: 'Sincronizando workspace...',
            });
            setTimeout(() => {
                router.push('/chat');
                router.refresh();
            }, 800);
        }
    }, [state, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 p-4 transition-colors font-sans">
            <div className="absolute top-4 left-4">
                <Link
                    href="/"
                    className="flex justify-start items-center text-zinc-600 dark:text-zinc-200 hover:text-zinc-800 dark:hover:text-zinc-50 font-black text-sm gap-2"
                >
                    <TbSquareArrowLeft className='w-6 h-6' /> Voltar ao inicio
                </Link>
            </div>
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center items-center text-center space-x-2">
                    <div>
                        <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-50 rounded-full mx-auto flex items-center justify-center font-black text-white dark:text-zinc-950 text-xl shadow-lg mb-4">IA</div>
                    </div>
                    <div className="text-start">
                        <h1 className="text-2xl font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-tighter">Login</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Acesse sua conta para continuar</p>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-1">Seu E-mail</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="exemplo@email.com"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-50 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-1">Sua Senha</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="********"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-50 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-sm placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-zinc-200/50 dark:shadow-none cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isPending ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>

                <div className="text-center pt-4">
                    <a href="/register" className="text-[10px] font-black text-zinc-400 dark:hover:text-zinc-200 uppercase tracking-[0.15em] transition-colors">
                        Não possui conta? <span className="text-zinc-800 dark:text-zinc-50 ml-1 font-black hover:underline">Registre-se</span>
                    </a>
                </div>
            </div>
        </div>
    );
}