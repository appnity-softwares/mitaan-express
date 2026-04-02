import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Globe, Moon, Sun, ChevronDown, Sparkles,
    Heart as HeartIcon
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import LiveCounter from '../LiveCounter';

const NavbarDesktopRight = ({
    language,
    theme,
    isNavbarSolid,
    isDonationEnabled,
    rightOrder,
    toggleTheme,
    onLanguageChange,
    onSearchOpen,
}) => {
    const navigate = useNavigate();
    const [isLangOpen, setIsLangOpen] = useState(false);

    const renderItem = (item) => {
        switch (item.trim()) {
            case 'live':
                return <LiveCounter key="right-live" />;
            case 'search':
                return (
                    <button
                        key="right-search"
                        onClick={onSearchOpen}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                        title="Search (⌘K)"
                    >
                        <Search size={18} />
                    </button>
                );
            case 'lang':
                return (
                    <div key="right-lang" className="relative">
                        <button
                            onClick={() => setIsLangOpen(!isLangOpen)}
                            className={`flex items-center gap-2 h-11 px-3 rounded-xl transition-all hover:bg-white/10 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                        >
                            <Globe size={18} className="shrink-0" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">HI/EN</span>
                            <ChevronDown size={10} className={`opacity-50 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isLangOpen && (
                                <div className="absolute top-full right-0 pt-2 z-[110]">
                                    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-white/5 p-4 min-w-[200px] space-y-4">
                                        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                                            <Globe size={16} className="text-red-600" />
                                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider">Select Language</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { code: 'en', label: 'English' },
                                                { code: 'hi', label: 'हिन्दी' },
                                            ].map(({ code, label }) => (
                                                <button
                                                    key={code}
                                                    onClick={() => { onLanguageChange(code); setIsLangOpen(false); }}
                                                    className={`flex items-center justify-between p-3 rounded-2xl transition-all border ${language === code ? 'bg-red-600 text-white border-red-600' : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-transparent hover:border-red-600/30'}`}
                                                >
                                                    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
                                                    {language === code && <Sparkles size={12} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>

                        {isLangOpen && (
                            <div className="fixed inset-0 z-[100]" onClick={() => setIsLangOpen(false)} />
                        )}
                    </div>
                );
            case 'theme':
                return (
                    <button
                        key="right-theme"
                        onClick={toggleTheme}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all hover:bg-white/10 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2 lg:gap-4 shrink-0 z-10">
            {/* Desktop-only items */}
            <div className="hidden lg:flex items-center gap-2">
                {rightOrder.split(',').map(renderItem)}
            </div>

            {/* Mobile search — shown only on mobile, next to donate */}
            <button
                onClick={onSearchOpen}
                className={`lg:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                aria-label="Search"
            >
                <Search size={20} strokeWidth={2.5} />
            </button>

            {isDonationEnabled && (
                <button
                    onClick={() => navigate('/donate')}
                    className={`flex items-center justify-center shrink-0 transition-all shadow-lg active:scale-95
                        ${isNavbarSolid
                            ? 'bg-white text-red-600 hover:bg-slate-100'
                            : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'}
                        w-9 h-9 lg:w-auto lg:h-auto lg:px-5 lg:py-2.5 rounded-full lg:rounded-xl`}
                >
                    <HeartIcon size={17} className="fill-current" />
                    <span className="hidden lg:inline ml-2 font-black text-xs uppercase tracking-widest whitespace-nowrap">
                        {language === 'hi' ? 'सहयोग' : 'Donate'}
                    </span>
                </button>
            )}
        </div>
    );

};

export default NavbarDesktopRight;
