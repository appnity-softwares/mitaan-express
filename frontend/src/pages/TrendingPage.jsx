import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Clock, User, ArrowRight, Share2, ArrowUpRight } from 'lucide-react';
import { useArticles } from '../context/ArticlesContext';
import AdSpace from '../components/AdSpace';
import { formatImageUrl } from '../services/api';
import LoadingSkeletons from '../components/LoadingSkeletons';

const TrendingPage = ({ language }) => {
    const navigate = useNavigate();
    const { trending, loading } = useArticles();
    const [viewMode, setViewMode] = useState('grid'); // grid or list

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <LoadingSkeletons type="category" />
                </div>
            </div>
        );
    }

    const handleItemClick = (item) => {
        if (item.type === 'blog' || !item.id) {
            navigate(`/insight/${item.slug || item.id}`);
        } else {
            navigate(`/article/${item.slug || item.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-28 pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                
                {/* Minimalist Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white shadow-lg shadow-red-600/20">
                                <TrendingUp size={16} className="animate-pulse" />
                            </span>
                            <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em]">
                                {language === 'hi' ? 'ताज़ा खबरें' : 'TRENDING NOW'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">
                            {language === 'hi' ? 'ट्रेंडिंग न्यूज़' : 'Top Viral'} <span className="text-red-600">Stories</span>
                        </h1>
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
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                                    <div className="absolute top-4 left-4 z-20 flex gap-2">
                                        <span className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-red-600/30 flex items-center gap-1.5 backdrop-blur-md border border-white/20">
                                            #{index + 1}
                                        </span>
                                        <span className="px-3 py-1.5 bg-black/50 text-white text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20">
                                            {typeof item.category === 'object' ? (language === 'hi' ? item.category?.nameHi || item.category?.name : item.category?.name) : (item.category || (language === 'hi' ? 'समाचार' : 'NEWS'))}
                                        </span>
                                    </div>
                                    <img
                                        src={formatImageUrl(item.image)}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                                </div>

                                {/* Content Container */}
                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-red-600" />
                                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                        </div>
                                        <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-white/10 pl-4">
                                            <User size={12} className="text-red-600" />
                                            {item.authorName || item.author?.name || 'Mitaan'}
                                        </div>
                                    </div>

                                    <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight mb-4 group-hover:text-red-600 transition-colors line-clamp-2">
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
