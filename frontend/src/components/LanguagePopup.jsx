import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight } from 'lucide-react';

const LanguagePopup = ({ onSelect }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSelected = localStorage.getItem('lang_selected');
        if (!hasSelected) {
            // Small delay to ensure navbar is loaded
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleSelect = (lang) => {
        localStorage.setItem('lang_selected', 'true');
        localStorage.setItem('lang', lang);
        onSelect(lang);
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="absolute top-[calc(100%+12px)] right-0 z-[1000] w-[280px] pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 dark:border-white/10 pointer-events-auto overflow-hidden"
                    >
                        {/* Top Accent Line */}
                        <div className="h-1 w-full bg-gradient-to-r from-red-600 to-red-500" />

                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600">
                                    <Globe size={18} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                        Language / भाषा
                                    </h3>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        Select preferred language
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleSelect('en')}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-red-600/50 hover:bg-red-600/5 transition-all group"
                                >
                                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600">English</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Selected</span>
                                </button>
                                <button
                                    onClick={() => handleSelect('hi')}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-red-600/50 hover:bg-red-600/5 transition-all group"
                                >
                                    <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-600">हिन्दी</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">चुनें</span>
                                </button>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="bg-slate-50 dark:bg-white/5 p-2 text-center">
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                Mitaan Express न्यूज़
                            </p>
                        </div>
                    </motion.div>

                    {/* Arrow pointing to Navbar Toggle */}
                    <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-white/10 rotate-45" />
                </div>
            )}
        </AnimatePresence>
    );
};

export default LanguagePopup;
