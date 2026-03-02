// frontend/src/components/layout/header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/theme-provider';
import { FiLogOut, FiUser } from 'react-icons/fi';

interface HeaderProps {
    isGenerating: boolean;
    messageCount: number;
    toggleSidebar: () => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
    title?: string;
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    } | null;
}

export function Header({ isGenerating, toggleSidebar, user, title: initialTitle, isDarkMode: propIsDarkMode, toggleTheme: propToggleTheme }: HeaderProps) {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(initialTitle);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setCurrentTitle(initialTitle);
    }, [initialTitle]);

    useEffect(() => {
        const handleRename = (event: any) => {
            setCurrentTitle(event.detail);
        };
        window.addEventListener('chatRename', handleRename);
        return () => window.removeEventListener('chatRename', handleRename);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isDropdownOpen]);

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'LF';

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', { method: 'POST' });
            if (response.ok) {
                setIsDropdownOpen(false);
                router.push('/login');
                router.refresh();
            }
        } catch (error) { console.error(error); }
    };

    return (
        <header className="h-24 flex items-center justify-between px-6 backdrop-blur-xl z-20 shrink-0 bg-white/80 dark:bg-zinc-950/80 relative">
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 -ml-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-50 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
                <h1 className="text-sm font-black text-zinc-800 dark:text-zinc-50 uppercase tracking-[0.2em] whitespace-nowrap">
                    {currentTitle}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-50 transition-colors bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 cursor-pointer shadow-sm"
                >
                    {isDarkMode ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>

                <div className="relative flex items-center gap-3 sm:pl-6" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-right group">
                        <div className="w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center overflow-hidden text-[11px] font-black text-zinc-800 dark:text-zinc-50 shadow-sm group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors">
                            {user?.image ? <img src={user.image} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                        </div>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl shadow-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-200">
                            <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors uppercase tracking-widest">
                                <FiUser className="w-4 h-4" />
                                Perfil
                            </Link>
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1 mx-2" />
                            <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors uppercase tracking-widest cursor-pointer">
                                <FiLogOut className="w-4 h-4" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}