import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Feather, FileText } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../services/api';

const CreativeShowcase = ({ language, setActiveCategory }) => {
    // Simplified static links to sections, as these are "Hubs"
    const cards = [
        {
            id: 'poetry',
            title: language === 'hi' ? 'काव्य की दुनिया' : 'Magic of Words',
            subtitle: language === 'hi' ? 'काव्य कोना' : 'Poetry Corner',
            desc: language === 'hi' ? 'शब्दों के जादू में खो जाएं। बेहतरीन कवियों की रचनाएं पढ़ें।' : 'Explore raw human emotion through the lens of modern poetry.',
            icon: Feather,
            image: "https://images.unsplash.com/photo-1518173946687-a4c8a9833d8e?auto=format&fit=crop&q=80&w=1000",
            color: "from-purple-600 to-blue-600"
        },
        {
            id: 'blogs',
            title: language === 'hi' ? 'विशेषज्ञों के विचार' : 'Deep Insights',
            subtitle: language === 'hi' ? 'ब्लॉग पढ़ें' : 'Read Blogs',
            desc: language === 'hi' ? 'गहन विश्लेषण और नवीनतम तकनीकी अपडेट्स के लिए हमारा ब्लॉग देखें।' : 'Expert opinions on technology, politics, and the future of journalism.',
            icon: FileText,
            image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1000",
            color: "from-orange-600 to-red-600"
        }
    ];

    return (
        <section className="py-12 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

                {/* Header Section with Staggered Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-white/10 pb-8 gap-6"
                >
                    <div className="space-y-4">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block px-3 py-1 bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
                        >
                            {language === 'hi' ? 'संस्कृति और कला' : 'Culture & Arts'}
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tighter text-slate-900 dark:text-white">
                            {language === 'hi' ? 'रचनात्मकता का कोना' : 'Creative Pulse'}
                        </h2>
                    </div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => setActiveCategory('blogs')}
                        className="flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors group"
                    >
                        {language === 'hi' ? 'सभी देखें' : 'View All Hubs'}
                        <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                            <ArrowRight size={14} />
                        </span>
                    </motion.button>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2, type: "spring", stiffness: 100 }}
                            onClick={() => setActiveCategory(card.id)}
                            className="group relative h-[380px] rounded-[2.5rem] overflow-hidden cursor-pointer w-full bg-slate-900 border border-slate-200/10 dark:border-white/5"
                        >
                            {/* Background Image with Parallax-like Zoom */}
                            <div className="absolute inset-0">
                                <motion.img
                                    src={card.image}
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110"
                                    alt={card.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-br ${card.id === 'poetry' ? 'from-purple-900/40 to-blue-900/40' : 'from-orange-900/40 to-red-900/40'} opacity-40`} />
                            </div>

                            {/* Refined Overlay for better text readability */}
                            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent" />

                            {/* Content Container */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                {/* Top: Tag & Icon */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">
                                            {language === 'hi' ? 'विशेष श्रेणी' : 'FEATURED HUB'}
                                        </span>
                                        <div className="h-0.5 w-6 bg-red-600 rounded-full" />
                                    </div>

                                    <motion.div
                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                        className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl"
                                    >
                                        <card.icon size={24} />
                                    </motion.div>
                                </div>

                                {/* Bottom Content */}
                                <div className="space-y-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-2xl md:text-3xl font-black text-white font-serif tracking-tight leading-none group-hover:text-red-50 transition-colors">
                                        {card.title}
                                    </h3>

                                    <p className="text-sm text-white/60 font-medium line-clamp-2 max-w-[280px] group-hover:text-white/80 transition-colors">
                                        {card.desc}
                                    </p>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                                            {card.subtitle}
                                        </div>

                                        <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            {language === 'hi' ? 'देखें' : 'EXPLORE'}
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-red-600/0 group-hover:border-red-600/20 rounded-[2.5rem] transition-colors duration-500 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CreativeShowcase;
