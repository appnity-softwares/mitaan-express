import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, User, Share2, Check, Copy } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../services/api';

const ArticleCard = ({ article, language }) => {
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleShare = (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description,
                url: window.location.origin + '/article/' + article.id,
            }).catch(console.error);
        } else {
            setShowShare(!showShare);
        }
    };

    const copyToClipboard = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.origin + '/article/' + article.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white dark:bg-transparent p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-500 relative"
        >
            {/* Image Section */}
            <div className="md:col-span-5 relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
                <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PLACEHOLDER_IMAGE;
                    }}
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
                        {article.category}
                    </span>
                </div>
            </div>

            {/* Content Section */}
            <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between text-slate-400 dark:text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-red-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{article.author}</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-white/10 pl-4">
                            <Clock size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{article.date}</span>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative z-10"
                            title="Share"
                        >
                            <Share2 size={16} />
                        </button>

                        <AnimatePresence>
                            {showShare && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 shadow-xl rounded-xl p-2 z-20 min-w-[150px] border border-slate-100 dark:border-white/10"
                                >
                                    <button
                                        onClick={copyToClipboard}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-white transition-colors"
                                    >
                                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight font-serif group-hover:text-red-600 transition-colors">
                    {article.title}
                </h3>

                <p className="text-slate-600 dark:text-gray-400 text-base leading-relaxed line-clamp-2">
                    {article.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-[0.2em] group/link">
                    {language === 'hi' ? 'पूरा पढ़ें' : 'READ FULL STORY'}
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
};

export default ArticleCard;
