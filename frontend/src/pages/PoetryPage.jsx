import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useArticles } from '../context/ArticlesContext';

const PoetryPage = ({ language }) => {
    const { articles, loading } = useArticles();

    // Filter poetry articles - looking for "Poetry" or "काव्य" in category name
    const poetryArticles = useMemo(() => {
        return articles.filter(article => {
            const catName = article.category?.name?.toLowerCase() || '';
            const catHi = article.category?.nameHi || '';
            return catName.includes('poetry') || catHi.includes('काव्य') ||
                article.categoryId === 7; // Backup ID if known, but name check is safer
        }).filter(a => a.status === 'PUBLISHED');
    }, [articles]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium font-serif">
                        {language === 'hi' ? 'रचनाएं लोड हो रही हैं...' : 'Loading verses...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24 pb-32 pt-12 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-50 dark:bg-white/5 border border-red-100 dark:border-white/10 mb-4"
                    >
                        <Feather size={14} className="text-red-600" />
                        <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em]">
                            {language === 'hi' ? 'काव्य कोना' : 'Poetry Corner'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-7xl lg:text-9xl font-black text-slate-900 dark:text-white font-serif tracking-tighter"
                    >
                        {language === 'hi' ? 'शब्दों का जादू' : 'Magic of Words'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 dark:text-gray-400 text-xl leading-relaxed font-serif italic max-w-2xl mx-auto"
                    >
                        {language === 'hi'
                            ? 'भावनाओं को छंदों में पिरोती हुई कुछ बेहतरीन रचनाएं जो आपके दिल को छू लेंगी।'
                            : 'Exquisite compositions weaving emotions into verses that will touch your soul.'}
                    </motion.p>
                </div>

                {/* Featured Verse Illustration */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative group max-w-4xl mx-auto"
                >
                    <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-blue-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-100 dark:border-white/10 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                            <Quote size={200} className="text-slate-900 dark:text-white" />
                        </div>

                        <div className="max-w-2xl space-y-8 relative z-10">
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Featured Verse</span>
                            <blockquote className="space-y-4">
                                <p className="text-2xl md:text-4xl font-serif italic leading-relaxed text-slate-800 dark:text-slate-200">
                                    {language === 'hi'
                                        ? "कलम जब कागज़ पर खुद को उतार देती है,\nहर अधूरी बात को सरेआम कर देती है।"
                                        : "When the pen pours itself onto the paper,\nevery unspoken word becomes a legacy."}
                                </p>
                                <footer className="pt-4 flex items-center gap-4">
                                    <div className="w-10 h-0.5 bg-red-600 rounded-full"></div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Anonymous Poet</span>
                                </footer>
                            </blockquote>
                        </div>
                    </div>
                </motion.div>

                {poetryArticles.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                        <Quote size={48} className="mx-auto text-slate-300 dark:text-white/20 mb-4 opacity-50" />
                        <p className="text-slate-500 font-serif italic text-lg">
                            {language === 'hi' ? 'अभी और रचनाएं आनी बाकी हैं...' : 'More verses are currently being written...'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                        {poetryArticles.map((poem, idx) => (
                            <motion.div
                                key={poem.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => window.location.href = `/article/${poem.id}`}
                            >
                                <div className="space-y-6">
                                    <div className="relative aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-slate-100 dark:bg-gray-900 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                        <img
                                            src={poem.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                            alt={poem.title}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                        <div className="absolute top-6 left-6">
                                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                                                <Quote size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em] bg-red-50 dark:bg-red-900/10 px-3 py-1 rounded-full">
                                                {language === 'hi' ? poem.category?.nameHi : poem.category?.name}
                                            </span>
                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                {poem.author?.name || 'Mitaan Poet'}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight group-hover:text-red-600 transition-colors uppercase tracking-tighter">
                                                {poem.title}
                                            </div>
                                            <p className="text-slate-500 dark:text-gray-400 font-serif leading-relaxed text-base italic line-clamp-3">
                                                "{poem.shortDescription || '...'}"
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between group-hover:border-red-600/20 transition-colors">
                                            <span className="text-[10px] font-black text-slate-400 group-hover:text-red-600 uppercase tracking-[0.3em] transition-colors">
                                                {language === 'hi' ? 'रचना पढ़ें' : 'READ VERSE'}
                                            </span>
                                            <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all shadow-lg shadow-black/5">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PoetryPage;
