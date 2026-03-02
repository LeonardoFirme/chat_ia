// frontend/src/app/(views)/chat/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ChatMessage } from '@/components/chat/chat-message';
import { ChatInput } from '@/components/chat/chat-input';
import { useChatStream } from '@/hooks/use-chat-stream';
import { ChatThread, Message } from '@/types/chat';
import { getHistory } from '@/app/actions/chat-actions';
import { getUserProfile } from '@/app/actions/auth-actions';

interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
}

export default function DynamicChatPage() {
    const params = useParams();
    const router = useRouter();
    const activeId = params.id as string;

    const [threads, setThreads] = useState<ChatThread[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState('');
    const [user, setUser] = useState<UserProfile | null>(null);

    const activeChatTitle = threads.find(t => t.id === activeId)?.title;
    const { messages, setMessages, sendMessage, isGenerating } = useChatStream(activeId);
    const scrollRef = useRef<HTMLDivElement>(null);
    const triggerInProcess = useRef<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [history, profile] = await Promise.all([getHistory(), getUserProfile()]);
                setThreads(history);
                if (profile) setUser(profile as UserProfile);

                const currentThread = history.find(t => t.id === activeId);

                if (currentThread) {
                    const initialMessages = currentThread.messages || [];
                    setMessages(initialMessages);

                    if (typeof window !== 'undefined') {
                        const isPending = sessionStorage.getItem(`pending_ai_${activeId}`);

                        if (isPending === 'true' && triggerInProcess.current !== activeId) {
                            triggerInProcess.current = activeId;
                            sessionStorage.removeItem(`pending_ai_${activeId}`);

                            if (initialMessages.length === 1 && initialMessages[0].role === 'user') {
                                setTimeout(() => {
                                    sendMessage(initialMessages[0].content, [], true);
                                }, 100);
                            }
                        }
                    }
                }

                const savedTheme = localStorage.getItem('v0_theme');
                const isDark = savedTheme !== 'light';
                setIsDarkMode(isDark);
                document.documentElement.classList.toggle('dark', isDark);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeId) loadInitialData();
    }, [activeId]);

    const handleRegenerate = () => {
        if (isGenerating || messages.length < 1) return;

        const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.role === 'user');

        if (lastUserMsgIndex !== -1) {
            const actualIndex = messages.length - 1 - lastUserMsgIndex;
            const lastUserContent = messages[actualIndex].content;

            const newHistory = messages.slice(0, actualIndex);
            setMessages(newHistory);

            sendMessage(lastUserContent, newHistory);
        }
    };

    const handleEditMessage = (index: number, newContent: string) => {
        if (isGenerating) return;

        const newHistory = messages.slice(0, index);
        setMessages(newHistory);

        sendMessage(newContent, newHistory);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: messages.length <= 2 ? 'auto' : 'smooth'
            });
        }
    }, [messages]);

    if (!activeId) return null;

    return (
        <div className="flex h-screen bg-white dark:bg-zinc-950 transition-colors duration-300 font-sans overflow-hidden">
            <Sidebar
                isOpen={sidebarOpen}
                threads={threads}
                activeId={activeId}
                isLoading={isLoading}
                user={user}
                onNewChat={() => router.push('/chat')}
                onSwitch={(id) => router.push(`/chat/${id}`)}
            />

            <div className="flex-1 flex flex-col relative overflow-hidden w-full border-l border-zinc-200/50 dark:border-zinc-800/50">
                <Header
                    isGenerating={isGenerating}
                    messageCount={messages.length}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    isDarkMode={isDarkMode}
                    toggleTheme={() => { }}
                    user={user}
                    title={activeChatTitle}
                />

                <main ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hide w-full relative bg-white dark:bg-zinc-950">
                    {isLoading ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 border-2 border-zinc-800 dark:border-zinc-50 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto px-4 py-10 md:py-20 w-full animate-in fade-in duration-700">
                            <div className="space-y-8 w-full">
                                {messages.map((m, i) => (
                                    <ChatMessage
                                        key={i}
                                        message={m}
                                        user={user}
                                        onRegenerate={i === messages.length - 1 && m.role === 'assistant' ? handleRegenerate : undefined}
                                        onEdit={(newContent) => handleEditMessage(i, newContent)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <ChatInput
                    input={input}
                    setInput={setInput}
                    isGenerating={isGenerating}
                    onSend={() => {
                        sendMessage(input, messages);
                        setInput('');
                    }}
                />
            </div>
        </div>
    );
}