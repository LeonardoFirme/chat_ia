// frontend/src/app/(auth)/register/page.tsx
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { registerAction, ActionResponse } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TbSquareArrowLeft } from 'react-icons/tb';

export default function RegisterPage() {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(registerAction, null);

    useEffect(() => {
        if (state?.success) {
            router.push('/login?registered=true');
        }

        if (state?.error) {
            formRef.current?.reset();
        }
    }, [state, router]);

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
                <div className="flex justify-center text-center space-x-2">
                    <div>
                        <div className="w-12 h-12 bg-zinc-800 dark:bg-zinc-50 rounded-full mx-auto flex items-center justify-center font-black text-white dark:text-zinc-950 text-xl shadow-lg mb-4">IA</div>
                    </div>
                    <div className="text-start">
                        <h1 className="text-2xl font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-tighter">Cadastro</h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Crie sua conta para acessar</p>
                    </div>
                </div>

                <form ref={formRef} action={formAction} className="space-y-4">
                    {state?.error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-in zoom-in-95">
                            {state.error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input
                            name="name"
                            type="text"
                            placeholder="Seu Nome Completo"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-50 outline-none text-sm focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                        <input
                            name="email"
                            type="email"
                            placeholder="exemplo@email.com"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-50 outline-none text-sm focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest ml-1">Definir Senha</label>
                        <input
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-800 dark:text-zinc-50 outline-none text-sm focus:border-zinc-400 dark:focus:border-zinc-600 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-4 bg-zinc-800 hover:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold rounded-xl transition-all uppercase text-[10px] tracking-[0.2em] mt-2 shadow-xl shadow-zinc-200/50 dark:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isPending ? 'Processando Cadastro...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-900 pt-6">
                    <a href="/login" className="text-[10px] font-black text-zinc-400 dark:hover:text-zinc-200 uppercase tracking-[0.15em] transition-colors">
                        Já possui uma conta? <span className="text-zinc-800 dark:text-zinc-50 ml-1 hover:underline">Fazer Login</span>
                    </a>
                </div>
            </div>
        </div>
    );
}