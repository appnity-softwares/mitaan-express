import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Zap } from 'lucide-react';

import { useSettings } from '../hooks/useQueries';

const AdPopup = ({ language = 'en' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { data: settings } = useSettings();

    useEffect(() => {
        // Only show if enabled (default true if settings not loaded yet, or explicitly true)
        const isEnabled = settings?.ad_popup_enabled !== 'false';

        if (isEnabled) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [settings]);

    const handleClose = () => {
        setIsOpen(false);
    };

    // Default to 'promo' if not set
    const isAdMode = settings?.ad_popup_type === 'ad';
    const adImage = settings?.ad_popup_image_url;
    const adLink = settings?.ad_popup_link_url || '#';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={`relative w-full ${isAdMode ? 'max-w-xl bg-transparent shadow-none' : 'max-w-lg bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl border border-white/20'} overflow-hidden`}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className={`absolute top-4 right-4 z-20 p-2 rounded-full transition-colors ${isAdMode ? 'bg-white/80 hover:bg-white text-slate-900 shadow-lg' : 'bg-black/10 dark:bg-white/10 hover:bg-red-600 hover:text-white text-slate-500 dark:text-gray-400'}`}
                        >
                            <X size={20} />
                        </button>

                        {isAdMode ? (
                            // CUSTOM ADVERTISEMENT MODE
                            <div className="relative w-full">
                                <a href={adLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                                    <img
                                        src={adImage || 'https://via.placeholder.com/600x400?text=Your+Ad+Here'}
                                        alt="Advertisement"
                                        className="w-full h-auto rounded-3xl shadow-2xl"
                                    />
                                </a>
                                <div className="absolute bottom-2 right-1/2 translate-x-1/2 px-3 py-1 bg-black/50 text-white text-[10px] uppercase tracking-widest rounded-full backdrop-blur-sm pointer-events-none">
                                    Advertisement
                                </div>
                            </div>
                        ) : (
                            // DEFAULT PREMIUM PROMO MODE
                            <>
                                {/* Image Section - Auto Height */}
                                <div className="relative w-full min-h-[160px] md:min-h-[220px] bg-gradient-to-r from-red-600 to-orange-600 flex flex-col items-center justify-center overflow-hidden p-6 md:p-10">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>

                                    {/* Animated Circles */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                                        transition={{ duration: 10, repeat: Infinity }}
                                        className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                                    />

                                    <div className="relative z-10 text-center text-white w-full">
                                        <motion.div
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-3 border border-white/20"
                                        >
                                            <Zap size={12} className="fill-current" />
                                            {language === 'hi' ? 'सीमित समय ऑफर' : 'Limited Time Offer'}
                                        </motion.div>
                                        <h2 className="text-2xl md:text-5xl font-black font-serif mb-3 leading-tight">
                                            {language === 'hi' ? 'प्रीमियम मेंबरSHIP' : 'Premium Access'}
                                        </h2>
                                        <p className="text-white/90 font-bold text-sm md:text-lg max-w-[280px] md:max-w-xs mx-auto">
                                            {language === 'hi' ? 'मितान एक्सप्रेस के साथ जुड़ें' : 'Unlock exclusive content today with our premium features'}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Section - Auto Height */}
                                <div className="p-6 md:p-10 text-center space-y-5 bg-white dark:bg-[#0F172A]">
                                    <div className="space-y-3">
                                        <p className="text-slate-600 dark:text-slate-300 text-xs md:text-lg leading-relaxed font-medium">
                                            {language === 'hi'
                                                ? 'विज्ञापन-मुक्त अनुभव और विशेष रिपोर्टों तक पहुँच प्राप्त करें। आज ही हमारे वार्षिक प्लान पर 50% की छूट पाएँ।'
                                                : 'Get ad-free experience, exclusive reports, and early access to features. Save 50% on our annual plan today.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={() => window.location.href = '#'}
                                            className="w-full py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 group text-sm md:text-lg"
                                        >
                                            {language === 'hi' ? 'अभी सब्सक्राइब करें' : 'Subscribe Now'}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        <button
                                            onClick={handleClose}
                                            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {language === 'hi' ? 'शायद बाद में' : 'Maybe Later'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdPopup;
