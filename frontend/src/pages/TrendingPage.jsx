import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, User, ArrowRight, Share2, ArrowUpRight } from 'lucide-react';
import { useArticles } from '../context/ArticlesContext';
import AdSpace from '../components/AdSpace';

const TrendingPage = ({ language }) => {
    const navigate = useNavigate();
    const { trending, loading } = useArticles();
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleItemClick = (item) => {
        if (item.type === 'blog' || !item.id) {
            navigate(`/blog/${item.slug || item.id}`);
        } else {
            navigate(`/article/${item.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-24 pb-20 fade-in">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-8">

                {/* Header Section */}
                <div className="relative mb-16 rounded-[3rem] bg-slate-900 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                    <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 shadow-xl shadow-red-600/30 flex items-center justify-center mb-8 rotate-12 hover:rotate-0 transition-transform duration-500"
                        >
                            <TrendingUp size={40} className="text-white drop-shadow-md" />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black text-white font-serif tracking-tighter mb-6"
                        >
                            {language === 'hi' ? 'ट्रेंडिंग न्यूज़' : 'Trending Now'}
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-300 max-w-2xl font-medium leading-relaxed"
                        >
                            {language === 'hi'
                                ? 'सबसे लोकप्रिय और ताज़ा ख़बरें जो अभी चर्चा में हैं।'
                                : 'Explore the most viral and talked-about stories spanning news, insights, and field reports.'}
                        </motion.p>
                    </div>
                </div>

                {/* Ad Space */}
                <div className="mb-16">
                    <AdSpace position="category_top" />
                </div>

                {/* Content Grid */}
                {trending.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {trending.map((item, index) => (
                            <motion.article
                                key={`${item.type}-${item.id}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleItemClick(item)}
                                className="group bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-red-600/10 transition-all duration-500 cursor-pointer border border-slate-100 dark:border-white/5 flex flex-col"
                            >
                                {/* Image Container */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/30 flex items-center gap-1.5 backdrop-blur-md border border-white/20">
                                            #{index + 1}
                                        </span>
                                        <span className="px-3 py-1.5 bg-black/50 text-white text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20">
                                            {item.category?.name || item.category || (language === 'hi' ? 'समाचार' : 'NEWS')}
                                        </span>
                                    </div>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-red-600" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <User size={12} className="text-red-600" />
                                            {item.author?.name || 'Mitaan'}
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight mb-4 group-hover:text-red-600 transition-colors">
                                        {item.title}
                                    </h2>

                                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-6 mt-auto">
                                        {item.shortDescription || (item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '')}
                                    </p>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <TrendingUp size={14} className="text-red-600" />
                                            {item.views || 0} {language === 'hi' ? 'व्यूज़' : 'Views'}
                                        </span>
                                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                                            <ArrowUpRight size={18} className="group-hover:scale-110 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center">
                        <TrendingUp size={64} className="text-slate-300 dark:text-slate-700 mb-6" />
                        <h3 className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                            {language === 'hi' ? 'अभी कोई ट्रेंडिंग न्यूज़ नहीं है' : 'No trending stories found right now'}
                        </h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingPage;
