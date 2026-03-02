// frontend/src/components/chat/chat-input.tsx
'use client';

import { useRef, useEffect } from 'react';

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    isGenerating: boolean;
}

export function ChatInput({ input, setInput, onSend, isGenerating }: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim() && !isGenerating) {
                onSend();
            }
        }
    };

    return (
        <footer className="w-full pb-4 pt-2 px-4 sm:px-6 md:px-8 bg-transparent shrink-0">
            <div className="max-w-4xl mx-auto relative group">
                <div className="relative flex items-end bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-1.5 md:p-4 rounded-[2.5rem]  focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all duration-300 shadow-xl shadow-zinc-200 dark:shadow-zinc-900/50">

                    <textarea
                        ref={textareaRef}
                        value={input}
                        rows={1}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Peça algo ao modelo ou inicie uma conversa..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-zinc-800 dark:text-zinc-50 resize-none py-3 md:py-3.5 px-3 md:px-4 text-sm outline-none max-h-40 md:max-h-60 overflow-y-auto scrollbar-hide leading-relaxed placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-[height] duration-100 ease-out"
                        style={{ height: 'auto' }}
                    />

                    <button
                        disabled={isGenerating || !input.trim()}
                        onClick={onSend}
                        className="bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-950 p-2 md:p-3 rounded-xl hover:bg-zinc-950 dark:hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:hover:scale-100 shadow-md mb-0.5 mr-0.5 md:mb-1 md:mr-1 cursor-pointer shrink-0"
                    >
                        {isGenerating ? (
                            <div className="w-5 h-5 border-2 border-zinc-400 dark:border-zinc-300 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="mt-2 px-2 flex justify-between items-center opacity-0 group-focus-within:opacity-100 transition-opacity duration-500">
                    <p className="text-[9px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                        Shift + Enter para nova linha
                    </p>
                </div>

                <div className="flex justify-center items-center text-center">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
                        A IA pode cometer erros. Use com responsabilidade e sempre revise as respostas geradas.
                    </p>
                </div>
            </div>
        </footer>
    );
}