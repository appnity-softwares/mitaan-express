import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, User, ChevronRight } from 'lucide-react';

const InDepthSection = ({ language, onCategoryChange, sportsArticles = [], economyArticles = [], onArticleClick }) => {
    // Get main sports feature
    const mainSports = sportsArticles[0];
    const moreSports = sportsArticles.slice(1, 4);
    const sideEconomy = economyArticles.slice(0, 5);

    // Fallback if no articles
    if (!mainSports && sideEconomy.length === 0) return null;

    const getTitle = (art) => {
        if (!art) return '';
        return art.title;
    };

    const getDescription = (art) => {
        if (!art) return '';
        const desc = art.shortDescription || art.content || '';
        return desc.substring(0, 160) + (desc.length > 160 ? '...' : '');
    };

    const getCategoryName = (art) => {
        if (!art?.category) return '';
        return language === 'hi' ? (art.category.nameHi || art.category.name) : art.category.name;
    };

    return (
        <section className="max-w-7xl mx-auto px-4 py-8 bg-white dark:bg-transparent">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

                {/* LEFT COLUMN: Main Feature + Headlines */}
                <div className="lg:col-span-9 flex flex-col gap-12">
                    {mainSports && (
                        <div className="group grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                            {/* Text part */}
                            <div className="space-y-6 order-2 md:order-1">
                                <button
                                    onClick={() => onCategoryChange('sports')}
                                    className="text-red-600 text-[10px] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
                                >
                                    {getCategoryName(mainSports)}
                                </button>

                                <h2
                                    onClick={() => onArticleClick(mainSports)}
                                    className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-[1.1] font-serif cursor-pointer hover:text-red-600 transition-colors"
                                >
                                    {getTitle(mainSports)}
                                </h2>

                                <p className="text-slate-500 dark:text-gray-400 text-base leading-relaxed line-clamp-3">
                                    {getDescription(mainSports)}
                                </p>

                                <div className="pt-6 border-t border-slate-100 dark:border-gray-800 flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <Clock size={12} className="text-red-600" />
                                        <span>{new Date(mainSports.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <User size={12} className="text-red-600" />
                                        <span>{mainSports.author?.name || 'Mitaan'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onArticleClick(mainSports)}
                                    className="pt-4 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] group/link"
                                >
                                    {language === 'hi' ? 'पूरा पढ़ें' : 'READ FULL STORY'}
                                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Image part */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                onClick={() => onArticleClick(mainSports)}
                                className="order-1 md:order-2 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl cursor-pointer relative"
                            >
                                <img
                                    src={mainSports.image || 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=1000'}
                                    alt={mainSports.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px]">
                                    <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">
                                        View
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Headlines below */}
                    {moreSports.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-gray-800 pb-4">
                                {language === 'hi' ? 'अधिक खेल समाचार' : 'MORE SPORTS NEWS'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {moreSports.map((article) => (
                                    <div
                                        key={article.id}
                                        onClick={() => onArticleClick(article)}
                                        className="flex gap-4 group cursor-pointer border-l-2 border-transparent hover:border-red-600 pl-4 py-2 transition-all"
                                    >
                                        <p className="text-sm font-bold text-slate-700 dark:text-gray-300 group-hover:text-red-600 leading-snug transition-colors">
                                            {getTitle(article)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Economy Sidebar */}
                <div className="lg:col-span-3 border-l border-slate-100 dark:border-gray-800 pl-0 lg:pl-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {language === 'hi' ? 'अर्थव्यवस्था' : 'Economy'}
                        </h3>
                        <button
                            onClick={() => onCategoryChange('economic')}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                        >
                            <ChevronRight size={18} className="text-red-600" />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {sideEconomy.map((article) => (
                            <div
                                key={article.id}
                                className="flex gap-4 group cursor-pointer items-start"
                                onClick={() => onArticleClick(article)}
                            >
                                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800 shadow-md">
                                    <img
                                        src={article.image || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=300'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        alt=""
                                    />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 leading-tight group-hover:text-red-600 transition-colors line-clamp-3">
                                        {getTitle(article)}
                                    </h4>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default InDepthSection;
