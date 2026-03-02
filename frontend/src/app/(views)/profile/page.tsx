// frontend/src/app/(views)/profile/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { getHistory } from '@/app/actions/chat-actions';
import { getUserProfile } from '@/app/actions/auth-actions';
import { ChatThread } from '@/types/chat';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    createdAt: string | Date;
}

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [activeTab, setActiveTab] = useState<'geral'| 'dados'>('geral');
    const [user, setUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            const startTime = Date.now();
            try {
                const [history, profile] = await Promise.all([
                    getHistory(),
                    getUserProfile()
                ]);

                setThreads(history);
                setUser(profile as any);

                const savedTheme = localStorage.getItem('v0_theme');
                if (savedTheme === 'light') {
                    setIsDarkMode(false);
                    document.documentElement.classList.remove('dark');
                } else {
                    setIsDarkMode(true);
                    document.documentElement.classList.add('dark');
                }
            } catch (error) {
                console.error('Falha ao sincronizar perfil:', error);
            } finally {
                const delay = Math.max(0, 1200 - (Date.now() - startTime));
                setTimeout(() => {
                    setIsLoading(false);
                    setTimeout(() => setShowLoader(false), 500);
                }, delay);
            }
            if (window.innerWidth < 768) setSidebarOpen(false);
        };
        loadInitialData();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            return toast.error("ARQUIVO MUITO GRANDE", { description: "O limite é de 2MB." });
        }

        const formData = new FormData();
        formData.append('avatar', file);

        const uploadPromise = fetch('/api/auth/profile/upload', {
            method: 'POST',
            body: formData,
        }).then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUser(prev => prev ? { ...prev, image: data.image } : null);
            return data;
        });

        toast.promise(uploadPromise, {
            loading: 'Sincronizando Avatar...',
            success: 'AVATAR ATUALIZADO',
            error: (err) => err.message
        });
    };

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('v0_theme', newMode ? 'dark' : 'light');
    };

    const handleDeleteAccount = async () => {
        try {
            const response = await fetch('/api/auth/profile', { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir');

            toast.success('CONTA EXCLUÍDA COM SUCESSO');
            sessionStorage.clear();
            router.push('/login');
        } catch (error) {
            toast.error('ERRO CRÍTICO AO EXCLUIR CONTA');
        } finally {
            setDeleteModalOpen(false);
        }
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LF';

    return (
        <div className="relative flex h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 overflow-hidden">
            {showLoader && (
                <div className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-all duration-500 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-16 h-16 bg-zinc-800 dark:bg-zinc-50 rounded-2xl flex items-center justify-center font-black text-white dark:text-zinc-950 italic text-2xl shadow-xl animate-pulse">V0</div>
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-[0.3em]">Sincronizando Perfil</span>
                        <div className="w-32 h-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-zinc-800 dark:bg-zinc-50 origin-left animate-[loading_1.5s_infinite_ease-in-out]" />
                        </div>
                    </div>
                </div>
            )}

            <Sidebar
                isOpen={sidebarOpen}
                threads={threads}
                activeId={null}
                user={user}
                onNewChat={() => router.push('/chat')}
                onSwitch={(id) => router.push(`/chat/${id}`)}
            />

            <div className="flex-1 flex flex-col relative overflow-hidden w-full border-l border-zinc-200/50 dark:border-zinc-800/50">
                <Header isGenerating={false} messageCount={0} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isDarkMode={isDarkMode} toggleTheme={toggleTheme} user={user} />

                <main className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="max-w-7xl mx-auto py-10 px-6 md:px-10">
                        <div className="flex items-center gap-8 border-b border-zinc-200/50 dark:border-zinc-800/50 mb-10 overflow-x-auto scrollbar-hide">
                            {['geral', 'dados'].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative cursor-pointer whitespace-nowrap ${activeTab === tab ? 'text-zinc-800 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400'}`}>
                                    {tab}
                                    {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800 dark:bg-zinc-50 animate-in fade-in slide-in-from-left-2" />}
                                </button>
                            ))}
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'geral' && (
                                <div className="space-y-10">
                                    <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-zinc-100 dark:border-zinc-900">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-tighter">Avatar</h3>
                                            <p className="text-xs text-zinc-400">Sua imagem será exibida em todos os workspaces.</p>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-full bg-zinc-800 dark:bg-zinc-50 flex items-center justify-center text-xl font-black text-white dark:text-zinc-950 overflow-hidden shadow-lg border-2 border-white dark:border-zinc-800/50 shrink-0">
                                                {user?.image ? <img src={user.image} className="w-full h-full object-cover" alt="Avatar" /> : <span className="text-xl font-black">{initials}</span>}
                                            </div>

                                            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />

                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-4 py-2 bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-950 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                                            >
                                                Trocar
                                            </button>
                                        </div>
                                    </section>

                                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1">
                                            <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-tighter">Bio do Perfil</h3>
                                            <p className="text-xs text-zinc-400 mt-1">Informações básicas da conta.</p>
                                        </div>
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nome</label>
                                                <input type="text" defaultValue={user?.name || ""} className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-50 focus:outline-none focus:border-zinc-400 transition-all font-bold" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">E-mail Corporativo</label>
                                                <input type="email" readOnly defaultValue={user?.email || ""} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-not-allowed font-bold" />
                                            </div>
                                            <button className="px-8 py-3 bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-zinc-950 dark:hover:bg-zinc-200 transition-all cursor-pointer">Atualizar Geral</button>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'dados' && (
                                <div className="space-y-8">
                                    <div className="bg-red-50/10 dark:bg-red-900/5 border border-red-100 dark:border-red-900/20 p-8 rounded-3xl space-y-6">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-black text-red-500 uppercase tracking-widest">Apagar conta e dados</h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl font-bold uppercase">Esta ação é irreversível. Todas as suas threads de chat, integrações e arquivos serão deletados permanentemente de nossos servidores.</p>
                                        </div>
                                        <button
                                            onClick={() => setDeleteModalOpen(true)}
                                            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                                        >
                                            Deletar Permanentemente
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL DE DELEÇÃO DE CONTA */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm cursor-pointer" onClick={() => setDeleteModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-red-600 dark:text-red-500 uppercase tracking-widest">Excluir Conta Permanentemente?</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase leading-relaxed">
                                        Esta ação irá excluir seu usuário, e <span className="text-zinc-800 dark:text-zinc-50 font-black">todas as conversas e dados associados</span>. Não poderá ser desfeito.
                                    </p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 py-3 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 cursor-pointer transition-all"
                                    >
                                        Sim, Excluir
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}