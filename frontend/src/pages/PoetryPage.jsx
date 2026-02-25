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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-24 pb-32 pt-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
                <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-xs font-black uppercase tracking-[0.3em] inline-block"
                >
                    {language === 'hi' ? 'काव्य कोना' : 'Poetry Corner'}
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white font-serif tracking-tighter"
                >
                    {language === 'hi' ? 'शब्दों का जादू' : 'Magic of Words'}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-500 dark:text-gray-400 text-lg leading-relaxed font-serif italic"
                >
                    {language === 'hi'
                        ? 'भावनाओं को छंदों में पिरोती हुई कुछ बेहतरीन रचनाएं जो आपके दिल को छू लेंगी।'
                        : 'Exquisite compositions weaving emotions into verses that will touch your soul.'}
                </motion.p>
            </div>

            {poetryArticles.length === 0 ? (
                <div className="text-center py-20">
                    <Quote size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
                    <p className="text-slate-500 font-serif italic">
                        {language === 'hi' ? 'अभी कोई कविता उपलब्ध नहीं है।' : 'No poems available at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {poetryArticles.map((poem, idx) => (
                        <motion.div
                            key={poem.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group cursor-pointer bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            onClick={() => window.location.href = `/article/${poem.id}`}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-gray-900">
                                <img
                                    src={poem.image || 'https://images.unsplash.com/photo-1519681393784-d120267933ba'} // Fallback image
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                    alt={poem.title}
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <Quote size={32} className="text-white/60 group-hover:text-white transition-all transform hover:scale-110 drop-shadow-lg" />
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-red-600 text-[9px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                                        {language === 'hi' ? poem.category?.nameHi : poem.category?.name}
                                    </span>
                                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        {poem.author?.name || 'Mitaan Author'}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white font-serif leading-tight group-hover:text-red-600 transition-colors">
                                        {poem.title}
                                    </h2>
                                    <p className="text-slate-500 dark:text-gray-400 font-serif leading-relaxed text-sm italic line-clamp-3">
                                        "{poem.shortDescription || '...'}"
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white uppercase tracking-widest transition-colors">
                                        {language === 'hi' ? 'पढ़ें' : 'READ'}
                                    </span>
                                    <div className="w-6 h-6 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PoetryPage;
