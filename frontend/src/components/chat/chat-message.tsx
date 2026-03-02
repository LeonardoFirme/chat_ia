// frontend/src/components/chat/chat-message.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ChatMessageProps {
    message: Message;
    user?: { name: string | null; image: string | null } | null;
    onRegenerate?: () => void;
    onEdit?: (newContent: string) => void;
}

export function ChatMessage({ message, user, onRegenerate, onEdit }: ChatMessageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(message.content);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isUser = message.role === 'user';
    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LF';

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
        }
    }, [isEditing, editValue]);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        toast.success('CONTEÚDO COPIADO', { description: 'O texto foi enviado para sua área de transferência.' });
    };

    const handleSaveEdit = () => {
        if (editValue.trim() !== message.content && onEdit) {
            onEdit(editValue);
        }
        setIsEditing(false);
    };

    return (
        <div className={`flex gap-4 md:gap-6 ${isUser ? 'flex-row-reverse' : 'flex-row'} w-full animate-in fade-in slide-in-from-bottom-2 group`}>
            {/* AVATAR */}
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black border transition-colors overflow-hidden ${isUser
                ? 'bg-zinc-800 text-zinc-50 border-zinc-200 dark:border-zinc-800 dark:bg-zinc-50 dark:text-zinc-950'
                : 'bg-white dark:bg-zinc-950 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                }`}>
                {isUser && user?.image ? <img src={user.image} alt="Avatar" className="w-full h-full object-cover" /> : <span>{isUser ? initials : 'AI'}</span>}
            </div>

            <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%] ${isEditing ? 'w-full' : ''}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-100 mb-1">
                    {/* {isUser ? (user?.name) : 'Llama 3.3 Engine'} */}
                </span>

                <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isEditing ? 'w-full' : 'w-fit'}`}>
                    {/* BALÃO DE MENSAGEM - DINÂMICO */}
                    <div className={`prose prose-sm dark:prose-invert max-w-none wrap-break-words leading-relaxed ${isEditing ? 'w-full' : 'w-fit'} ${isUser
                        ? 'bg-zinc-200/50 dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 rounded-tr-none text-zinc-800 dark:text-zinc-200 font-medium'
                        : 'text-zinc-800 dark:text-zinc-200 font-medium'
                        }`}>
                        {isEditing ? (
                            <div className="flex flex-col gap-3 w-full bg-white dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                <textarea
                                    ref={textareaRef}
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSaveEdit();
                                        }
                                    }}
                                    className="w-full bg-transparent border-none focus:ring-0 resize-none text-sm p-0 outline-none text-zinc-800 dark:text-zinc-50 leading-relaxed font-medium"
                                    rows={1}
                                    placeholder="Edite sua mensagem..."
                                />
                                <div className="flex items-center gap-2 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-900">
                                    <button
                                        onClick={() => { setIsEditing(false); setEditValue(message.content); }}
                                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="px-3 py-1.5 bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-950 dark:hover:bg-zinc-200 transition-colors cursor-pointer shadow-md"
                                    >
                                        Atualizar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        return !inline && match ? (
                                            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" className="rounded-xl my-4 bg-zinc-950 border border-zinc-800 shadow-md p-4" {...props}>
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs text-zinc-800 dark:text-zinc-200 font-bold" {...props}>{children}</code>
                                        );
                                    }
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>

                    {/* BOTÕES DO USUÁRIO */}
                    {isUser && !isEditing && (
                        <div className="flex flex-1 gap-1 opacity-0 group-hover:opacity-100 transition-opacity self-center shrink-0">
                            <button
                                onClick={() => setIsEditing(true)}
                                title="Editar pergunta"
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                                onClick={handleCopy}
                                title="Copiar comando"
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* BOTÕES DA IA */}
                {!isUser && (
                    <div className="flex items-center gap-1 mt-2">
                        <button
                            onClick={handleCopy}
                            title="Copiar resposta"
                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                        {onRegenerate && (
                            <button
                                onClick={onRegenerate}
                                title="Refazer"
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 rounded-md text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}