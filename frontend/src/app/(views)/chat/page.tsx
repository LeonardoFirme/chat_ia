// frontend/src/app/(views)/chat/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatThread } from '@/types/chat';
import { getHistory, saveMessageAction } from '@/app/actions/chat-actions';
import { getUserProfile } from '@/app/actions/auth-actions';
import { SiRobotframework } from 'react-icons/si';

export default function RootChatPage() {
    const router = useRouter();
    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(true);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [user, setUser] = useState<{ id: string; name: string | null; email: string | null; image: string | null } | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            const startTime = Date.now();
            try {
                const [history, profile] = await Promise.all([getHistory(), getUserProfile()]);
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
                console.error(error);
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

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;
        setIsGenerating(true);
        try {
            const result = await saveMessageAction(null, 'user', input);
            if (result.success && result.sessionId) {
                sessionStorage.setItem(`pending_ai_${result.sessionId}`, 'true');
                router.push(`/chat/${result.sessionId}`);
            }
        } catch (error) {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative flex h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 font-sans overflow-hidden">
            {showLoader && (
                <div className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-white dark:bg-zinc-950 transition-all duration-500 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <div className="w-16 h-16 bg-zinc-800 dark:bg-zinc-50 rounded-2xl flex items-center justify-center font-black text-white dark:text-zinc-950 text-2xl shadow-xl animate-pulse">IA</div>
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-[0.3em]">Sincronizando Workspace</span>
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
                isLoading={isLoading}
                user={user}
                onNewChat={() => setInput('')}
                onSwitch={(id) => router.push(`/chat/${id}`)}
            />

            <div className="flex-1 flex flex-col relative overflow-hidden w-full">
                <Header isGenerating={isGenerating} messageCount={0} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isDarkMode={isDarkMode} toggleTheme={() => { }} user={user} />
                <main className="flex-1 flex flex-col justify-center items-center px-4">
                    <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="relative left-10 flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <SiRobotframework className="w-8 h-8 text-zinc-800 dark:text-zinc-50" />
                                <h2 className="text-2xl text-zinc-800 dark:text-zinc-50 font-medium">Olá, {user?.name?.split(' ')[0]}</h2>
                            </div>
                            <h3 className="text-4xl text-zinc-800 dark:text-zinc-50 font-medium">O que vamos projetar hoje?</h3>
                        </div>
                        <ChatInput input={input} setInput={setInput} isGenerating={isGenerating} onSend={handleSend} />
                    </div>
                </main>
            </div>

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