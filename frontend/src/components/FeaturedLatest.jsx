import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, User, TrendingUp, Share2, Check, Copy } from 'lucide-react';
import { formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';

const FeaturedLatest = ({ language, items = [] }) => {
    const navigate = useNavigate();

    // Take top 4 items
    const displayItems = items.slice(0, 4);

    if (displayItems.length === 0) return null;

    const handleItemClick = (item) => {
        if (item.type === 'blog') {
            navigate(`/insight/${item.slug || item.id}`);
        } else {
            navigate(`/article/${item.slug || item.id}`);
        }
    };

    return (
        <section className="bg-white dark:bg-[#030712] py-12 sm:py-16 lg:py-20 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white shadow-lg shadow-red-600/20">
                                <TrendingUp size={16} />
                            </span>
                            <span className="text-red-600 font-black text-xs uppercase tracking-[0.3em]">
                                {language === 'hi' ? 'ताज़ा खबरें' : 'LATEST UPDATES'}
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">
                            Featured <span className="text-red-600">Stories</span>
                        </h2>
                    </div>

                    <button
                        onClick={() => navigate('/insights')}
                        className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-600 transition-all"
                    >
                        {language === 'hi' ? 'सभी समाचार देखें' : 'VIEW ALL STORIES'}
                        <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {displayItems.map((item, index) => (
                        <motion.div
                            key={`${item.type}-${item.id}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleItemClick(item)}
                            className="group cursor-pointer space-y-5"
                        >
                            <div className="relative aspect-[16/9] sm:aspect-[4/5] overflow-hidden rounded-[1.5rem] lg:rounded-[2rem] bg-slate-100 dark:bg-slate-800 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                                <img
                                    src={formatImageUrl(item.image, 600)}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/20">
                                        {typeof item.category === 'object' ? (language === 'hi' ? item.category?.nameHi || item.category?.name : item.category?.name) : (item.category || (language === 'hi' ? 'समाचार' : 'NEWS'))}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-red-600" />
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} className="text-red-600" />
                                        {item.authorName || item.author?.name || 'Mitaan'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight font-serif group-hover:text-red-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-white/60 line-clamp-2 leading-relaxed">
                                    {(item.shortDescription || item.content || '').replace(/<[^>]*>/g, '').substring(0, 150)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedLatest;
