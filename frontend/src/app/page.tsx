// frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, Variants, AnimatePresence } from 'framer-motion';

export default function Page() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('v0_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('v0_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('v0_theme', 'light');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-500 selection:bg-zinc-200 dark:selection:bg-zinc-800 flex flex-col items-center justify-center p-6 overflow-hidden relative">

      <nav className="fixed top-8 right-8 z-50">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm cursor-pointer transition-colors"
        >
          <AnimatePresence mode="wait">
            {isDarkMode ? (
              <motion.svg
                key="sun"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                className="w-5 h-5 text-zinc-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 18v1m9-9h1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="moon"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                className="w-5 h-5 text-zinc-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
      </nav>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-5xl flex flex-col items-center"
      >
        <motion.div variants={itemVariants} className="mb-12">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-zinc-800 dark:bg-zinc-50 rounded-2xl flex items-center justify-center shadow-2xl cursor-pointer"
          >
            <span className="text-white dark:text-zinc-950 font-black text-3xl tracking-tighter uppercase">IA</span>
          </motion.div>
        </motion.div>

        <div className="flex flex-col items-center space-y-4 text-center mb-16">
          <motion.div variants={itemVariants} className="flex items-center gap-3">
            <div className="h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-500">
              System Release // 2026.03
            </span>
            <div className="h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl md:text-9xl font-black text-zinc-800 dark:text-zinc-50 tracking-[-0.04em] leading-[0.85] uppercase"
          >
            Core <br /> Engine
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400 font-bold tracking-[0.25em] max-w-md uppercase leading-relaxed pt-6"
          >
            Arquitetura de processamento neural integrada com <br />
            <span className="text-zinc-800 dark:text-zinc-100 font-black">NextJS 16</span> & <span className="text-zinc-800 dark:text-zinc-100 font-black">Llama 3.3</span>
          </motion.p>
        </div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg"
        >
          <Link href="/login">
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-10 py-5 bg-zinc-800 hover:bg-zinc-950 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-black rounded-2xl transition-all duration-300 uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-zinc-200/50 dark:shadow-none"
            >
              Iniciar Console
            </motion.div>
          </Link>

          <Link href="/register">
            <motion.div
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-10 py-5 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-50 font-black rounded-2xl transition-all duration-300 uppercase text-[11px] tracking-[0.2em]"
            >
              Criar Conta
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-24 flex flex-col items-center space-y-8"
        >
          <div className="flex gap-10 opacity-20 dark:opacity-30">
            {['Prisma', 'MySQL', 'NextJS'].map((tech) => (
              <span key={tech} className="text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-pulse" />
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600 font-black tracking-[0.5em] uppercase">
              Leonardo Firme // Fullstack Engineer
            </p>
          </div>
        </motion.div>
      </motion.main>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-zinc-100 dark:bg-zinc-900/20 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}