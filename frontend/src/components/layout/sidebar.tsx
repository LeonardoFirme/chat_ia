// frontend/src/components/layout/sidebar.tsx
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChatThread } from '@/types/chat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FaRegEdit } from 'react-icons/fa';
import { deleteChatAction, renameChatAction, togglePinAction } from '@/app/actions/chat-actions';
import { FiLogOut, FiTrash2, FiUser } from 'react-icons/fi';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import { TbPinned } from 'react-icons/tb';

interface SidebarProps {
    isOpen: boolean;
    threads: ChatThread[];
    activeId: string | null;
    isLoading?: boolean;
    user?: { name?: string | null; email?: string | null; image?: string | null; } | null;
    onNewChat: () => void;
    onSwitch: (id: string) => void;
}

export function Sidebar({ isOpen, threads, activeId, isLoading, user, onNewChat, onSwitch }: SidebarProps) {
    const [localThreads, setLocalThreads] = useState<ChatThread[]>(threads);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const dropupRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => { setLocalThreads(threads); }, [threads]);

    const sortedThreads = useMemo(() => {
        return [...localThreads].sort((a, b) => {
            if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
            return b.updatedAt - a.updatedAt;
        });
    }, [localThreads]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropupRef.current && !dropupRef.current.contains(event.target as Node)) setIsProfileOpen(false);
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) setMenuOpen(null);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteConfirm = async () => {
        if (!deletingId) return;
        const targetId = deletingId;

        setLocalThreads(prev => prev.filter(t => t.id !== targetId));
        setDeletingId(null);

        try {
            await deleteChatAction(targetId);
            toast.success('CONVERSA EXCLUÍDA');
            if (activeId === targetId) router.push('/chat');
        } catch {
            setLocalThreads(threads);
            toast.error('ERRO AO EXCLUIR');
        }
    };

    const handleRenameSubmit = async () => {
        if (!editValue.trim() || !editingId) return;
        const trimmedTitle = editValue.trim();

        setLocalThreads(prev => prev.map(t => t.id === editingId ? { ...t, title: trimmedTitle } : t));

        try {
            await renameChatAction(editingId, trimmedTitle);
            if (editingId === activeId) window.dispatchEvent(new CustomEvent('chatRename', { detail: trimmedTitle }));
            toast.success('RENOMEADA');
        } catch {
            setLocalThreads(threads);
            toast.error('ERRO');
        } finally {
            setEditingId(null);
            setEditValue('');
        }
    };

    const handleTogglePin = async (id: string, currentPinStatus: boolean) => {
        const newPinStatus = !currentPinStatus;
        setLocalThreads(prev => prev.map(t => t.id === id ? { ...t, isPinned: newPinStatus } : t));
        setMenuOpen(null);
        try {
            await togglePinAction(id);
        } catch {
            setLocalThreads(threads);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                sessionStorage.clear();
                router.push('/login');
                router.refresh();
            }
        } catch (error) { console.error(error); }
    };

    const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'LF';

    return (
        <>
            <aside className={`fixed md:relative inset-y-0 left-0 z-50 h-screen bg-white dark:bg-zinc-800/50 transition-all duration-300 ease-in-out shrink-0 border-r border-zinc-200/50 dark:border-zinc-800/50 ${isOpen ? 'translate-x-0 w-77' : '-translate-x-full md:translate-x-0 w-0 overflow-hidden'}`}>
                <div className="w-72 flex flex-col h-full relative">
                    <div className="py-4 px-4 shrink-0">
                        <button onClick={() => { onNewChat(); router.replace('/chat'); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-zinc-800 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all cursor-pointer group">
                            <FaRegEdit className="w-4.5 h-4.5" />
                            <span>Nova conversa</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2 space-y-0.5 scrollbar-hide relative z-10">
                        <div className="px-4 mb-2 mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-600 uppercase tracking-widest text-[10px]">Conversas</div>
                        {isLoading ? <div className="p-4 animate-pulse">Carregando...</div> : sortedThreads.map(t => (
                            <div key={t.id} className="group relative px-1">
                                <button onClick={() => onSwitch(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-sm truncate pr-12 relative ${activeId === t.id ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-50 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}>
                                    <div className="flex items-center gap-2">
                                        {t.isPinned && <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
                                        <span className="truncate" title={t.title}>{t.title}</span>
                                    </div>
                                </button>
                                <div className="absolute top-2 right-2 flex items-center justify-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(menuOpen === t.id ? null : t.id);
                                        }}
                                        className="p-1 rounded-full transition-colors cursor-pointer bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-50 relative z-30 rotate-90 opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 10a2 2 0 110 4 2 2 0 010-4zm7 0a2 2 0 110 4 2 2 0 010-4zm-14 0a2 2 0 110 4 2 2 0 010-4z" />
                                        </svg>
                                    </button>

                                    <AnimatePresence>
                                        {menuOpen === t.id && (
                                            <motion.div
                                                ref={optionsRef}
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                /* fixed garante que ignore overflow:hidden do pai */
                                                className="fixed mt-35 -right-38 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-2xl py-1.5 w-52 z-9999"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleTogglePin(t.id, t.isPinned); }}
                                                    className="flex items-center w-full text-left px-3 py-2 text-[10px] font-black uppercase gap-2.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                                >
                                                    <TbPinned className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">{t.isPinned ? 'Desafixar' : 'Fixar'}</span>
                                                </button>

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setEditingId(t.id); setEditValue(t.title); setMenuOpen(null); }}
                                                    className="flex items-center w-full text-left px-3 py-2 text-[10px] font-black uppercase gap-2.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                                >
                                                    <MdDriveFileRenameOutline className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">Renomear conversa</span>
                                                </button>

                                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />

                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeletingId(t.id); setMenuOpen(null); }}
                                                    className="flex items-center w-full text-left px-3 py-2 text-[10px] font-black uppercase gap-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                                >
                                                    <FiTrash2 className="w-4 h-4 shrink-0" />
                                                    <span className="truncate">Excluir</span>
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 relative z-20" ref={dropupRef}>
                        <motion.div onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer group relative">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-[10px] font-black text-zinc-800 dark:text-zinc-50 overflow-hidden shrink-0">
                                {user?.image ? (
                                    <img src={user.image} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-50 truncate uppercase tracking-tighter">{user?.name || 'Workspace'}</p>
                                <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                            </div>
                        </motion.div>
                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute bottom-full left-4 right-4 mb-3 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl z-70 py-2">
                                    <button onClick={() => router.push('/profile')} className="flex items-center w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                        <FiUser className="w-4 h-4 mr-2" />
                                        Perfil
                                    </button>
                                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
                                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <FiLogOut className="w-4 h-4 mr-2" />
                                        Sair
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>
            <AnimatePresence>
                {(editingId || deletingId) && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => { setEditingId(null); setDeletingId(null); }} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-2xl">
                            {editingId ? (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-50 uppercase">Renomear</h3>
                                    <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()} className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl px-4 py-3 text-sm text-zinc-800 dark:text-zinc-50 focus:outline-none font-bold" />
                                    <div className="flex gap-3">
                                        <button onClick={() => setEditingId(null)} className="flex-1 py-3 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">Cancelar</button>
                                        <button onClick={handleRenameSubmit} className="flex-1 py-3 bg-zinc-800 dark:bg-zinc-50 text-white dark:text-zinc-950 text-[10px] font-black uppercase rounded-xl shadow-lg">Salvar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-red-600 dark:text-red-500 uppercase">Excluir Conversa?</h3>
                                    <div className="flex gap-3">
                                        <button onClick={() => setDeletingId(null)} className="flex-1 py-3 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900">Não</button>
                                        <button onClick={handleDeleteConfirm} className="flex-1 py-3 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-600 shadow-lg">Sim, Excluir</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}