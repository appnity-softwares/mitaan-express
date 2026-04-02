import React from 'react';
import { motion } from 'framer-motion';
import {
    Globe, Moon, Sun, ChevronDown, ArrowRight,
    Heart as HeartIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Share2 } from 'lucide-react';
import LanguagePopup from '../LanguagePopup';

const NavbarMobileMenu = ({
    language,
    theme,
    toggleLanguage,
    toggleTheme,
    onLanguageChange,
    mainPages,
    categoryTree,
    iconMap,
    activeCategory,
    isDonationEnabled,
    socialLinks,
    handleLinkClick,
    onClose,
}) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1]"
            />

            {/* Panel */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="absolute top-full left-0 right-0 bg-white dark:bg-black shadow-2xl border-t border-slate-100 dark:border-white/5 overflow-hidden max-h-[95vh] overflow-y-auto"
            >
                <div className="max-w-[1600px] mx-auto px-6 lg:px-20 py-12 lg:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                        {/* Column 1: Directory */}
                        <div className="lg:col-span-3 space-y-10">
                            {/* Mobile-only toggles */}
                            <div className="lg:hidden flex flex-col gap-2 pb-8 border-b border-slate-100 dark:border-white/5">
                                <div className="relative">
                                    <button
                                        onClick={toggleLanguage}
                                        className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-white/10 rounded-xl transition-all active:scale-[0.98] bg-white dark:bg-white/10 shadow-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Globe size={18} className="text-red-600" />
                                            <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-2 text-red-600 dark:text-red-500">
                                                <span className={language === 'hi' ? 'opacity-100' : 'opacity-40'}>HI</span>
                                                <span className="opacity-20">/</span>
                                                <span className={language === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className="text-red-600/50" />
                                    </button>
                                    <LanguagePopup onSelect={onLanguageChange} />
                                </div>

                                <button
                                    onClick={toggleTheme}
                                    className="flex items-center justify-between p-3 border border-slate-100 dark:border-white/10 rounded-xl transition-all active:scale-[0.98] bg-slate-50/50 dark:bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === 'light' ? <Moon size={18} className="text-red-600" /> : <Sun size={18} className="text-red-600" />}
                                        <span className="text-[11px] font-black uppercase tracking-tight">
                                            {theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}
                                        </span>
                                    </div>
                                    <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'light' ? 'bg-slate-200' : 'bg-red-600'}`}>
                                        <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${theme === 'light' ? 'left-1' : 'left-5'}`} />
                                    </div>
                                </button>

                                {isDonationEnabled && (
                                    <button
                                        onClick={() => { navigate('/donate'); onClose(); }}
                                        className="flex items-center justify-between p-3 bg-red-600 text-white rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <HeartIcon size={18} className="fill-current text-white" />
                                            <span className="text-[11px] font-black uppercase tracking-tight">
                                                {language === 'hi' ? 'सहयोग करें' : 'DONATE'}
                                            </span>
                                        </div>
                                        <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Navigation Links */}
                            <div className="space-y-6">
                                <span className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 block opacity-60">
                                    {language === 'hi' ? 'पोर्टल निर्देशिका' : 'Navigation'}
                                </span>
                                <div className="flex flex-col gap-4">
                                    {mainPages.map((p, idx) => (
                                        <div key={p.id}>
                                            <motion.button
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                onClick={() => handleLinkClick(p.id, p.path)}
                                                className={`group text-2xl font-black font-serif tracking-tighter text-left transition-all relative ${activeCategory === p.id
                                                    ? 'text-red-600'
                                                    : 'text-slate-900 dark:text-white hover:text-red-600'
                                                    }`}
                                            >
                                                <span className="relative z-10 group-hover:pl-4 transition-all duration-300 inline-block">
                                                    {p.name}
                                                </span>
                                            </motion.button>
                                            {p.children && p.children.length > 0 && (
                                                <div className="ml-6 mt-2 flex flex-col gap-2 border-l-2 border-red-200 dark:border-red-900/30 pl-4">
                                                    {p.children.map((child, cIdx) => (
                                                        <button
                                                            key={cIdx}
                                                            onClick={() => handleLinkClick(child.id || child.path, child.path)}
                                                            className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 transition text-left"
                                                        >
                                                            {language === 'hi' ? (child.nameHi || child.name) : child.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Categories Grid */}
                        <div className="lg:col-span-6 space-y-10 lg:border-x border-slate-100 dark:border-white/5 px-0 lg:px-12 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                            <div className="space-y-8">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block opacity-60 mb-8">
                                    {language === 'hi' ? 'विशेष श्रेणियां' : 'Featured Categories'}
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    {categoryTree.map((parent) => (
                                        <div key={parent.id} className="space-y-4">
                                            <button
                                                onClick={() => handleLinkClick(parent.slug || parent.id)}
                                                className="flex items-center gap-3 group/parent w-full text-left"
                                            >
                                                <div className="w-1.5 h-6 rounded-full transition-all group-hover/parent:h-8" style={{ backgroundColor: parent.color || '#ef4444' }} />
                                                <h3 className={`text-sm font-black uppercase text-slate-900 dark:text-white group-hover/parent:text-red-600 transition-colors ${language === 'hi' ? 'tracking-normal' : 'tracking-widest'}`}>
                                                    {language === 'hi' ? parent.nameHi : parent.name}
                                                </h3>
                                            </button>
                                            <div className="flex flex-col gap-3 pl-4">
                                                {parent.children.map((child) => (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => handleLinkClick(child.slug || child.id)}
                                                        className={`group flex items-center gap-3 text-xs font-bold transition-all text-left ${activeCategory === child.slug
                                                            ? 'text-red-600'
                                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 ${activeCategory === child.slug ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-50 dark:bg-white/5'}`}>
                                                            {iconMap[child.icon]}
                                                        </div>
                                                        <span className="group-hover:translate-x-1 transition-transform">
                                                            {language === 'hi' ? child.nameHi : child.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Social & Newsletter */}
                        <div className="lg:col-span-3 space-y-12">
                            <div className="space-y-8">
                                <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block opacity-60">
                                    {language === 'hi' ? 'जुड़े रहें' : 'Connect With Us'}
                                </span>
                                <div className="grid grid-cols-2 gap-4">
                                    {socialLinks.map(link => (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all group shadow-sm bg-slate-50/50 dark:bg-white/5"
                                        >
                                            <div className="mb-2 transition-transform group-hover:scale-110">{link.icon}</div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default NavbarMobileMenu;
