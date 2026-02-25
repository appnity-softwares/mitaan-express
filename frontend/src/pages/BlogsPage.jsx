import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Calendar, ArrowUpRight, ChevronRight, Clock } from 'lucide-react';
import { fetchBlogs } from '../services/api';
import AdSpace from '../components/AdSpace';
import Sidebar from '../components/Sidebar';
import { useIsShort } from '../hooks/useIsShort';

const blogPosts = [
    {
        title: 'Modern Journalism in the Age of AI',
        excerpt: 'How artificial intelligence is changing the way news is gathered and reported globally...',
        author: 'Amitabh Kant',
        date: 'March 1, 2025',
        category: 'Digital',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'The Sustainable Living Guide',
        excerpt: 'Small changes in your daily routine that can lead to a massive impact on the environment...',
        author: 'Priya Verma',
        date: 'Feb 28, 2025',
        category: 'Lifestyle',
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Future of Remote Tech Work',
        excerpt: 'Why distributed teams are becoming the norm for top silicon valley firms in 2025...',
        author: 'Rajesh Sharma',
        date: 'Feb 25, 2025',
        category: 'Work',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Culinary Traditions of India',
        excerpt: 'Exploring the diverse spices and ancient techniques of regional Indian cooking...',
        author: 'Sanjeev Kapoor',
        date: 'Feb 22, 2025',
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=800'
    }
];

import { useBlogs } from '../hooks/useQueries';

const BlogsPage = ({ language }) => {
    // TanStack Query Hook
    const { data, isLoading: loading } = useBlogs({ status: 'PUBLISHED' });
    const articles = data?.articles || data || [];
    const [contentRef, isShort] = useIsShort(200);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading Articles...</p>
                </div>
            </div>
        );
    }

    // Empty State
    if (articles.length === 0) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-white pb-32 transition-colors">
                {/* Header Section */}
                <div className="relative bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 py-20 px-6 lg:px-8 mb-16 overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <span className="text-[20rem] font-black font-serif leading-none">B</span>
                    </div>

                    <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 font-bold text-xs uppercase tracking-[0.3em] inline-block border-b-2 border-red-600 pb-2"
                        >
                            {language === 'hi' ? 'हमारा ब्लॉग' : 'Our Blog & Insights'}
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black font-serif tracking-tighter max-w-4xl"
                        >
                            {language === 'hi' ? 'विचार और विश्लेषण' : 'Perspectives & Analysis'}
                        </motion.h1>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center py-20">
                    <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                        <User size={48} className="text-slate-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {language === 'hi' ? 'कोई ब्लॉग नहीं मिला' : 'No Blogs Published Yet'}
                    </h2>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        {language === 'hi'
                            ? 'अभी तक कोई ब्लॉग पोस्ट नहीं किया गया है। कृपया बाद में देखें।'
                            : 'Our editors are currently crafting new stories. Check back soon!'}
                    </p>
                    <Link to="/" className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors">
                        {language === 'hi' ? 'होम पर जाएं' : 'Return Home'}
                    </Link>
                </div>
            </div>
        );
    }

    const featuredArticle = articles.length > 0 ? articles[0] : null;
    const standardArticles = articles.length > 0 ? articles.slice(1) : [];

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] text-slate-900 dark:text-white pb-20 transition-colors">
            {/* Header Section */}
            <div className="relative bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 py-20 px-6 lg:px-8 mb-16 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <span className="text-[20rem] font-black font-serif leading-none">B</span>
                </div>

                <div className="max-w-7xl mx-auto space-y-6 relative z-10">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 font-bold text-xs uppercase tracking-[0.3em] inline-block border-b-2 border-red-600 pb-2"
                    >
                        {language === 'hi' ? 'हमारा ब्लॉग' : 'Our Blog & Insights'}
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black font-serif tracking-tighter max-w-4xl"
                    >
                        {language === 'hi' ? 'विचार और विश्लेषण' : 'Perspectives & Analysis'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 dark:text-gray-400 max-w-2xl leading-relaxed"
                    >
                        {language === 'hi'
                            ? 'राजनीति, तकनीक और संस्कृति पर गहरी नज़र।'
                            : 'Deep dives into politics, technology, and culture from our expert editors.'}
                    </motion.p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Main Content (8 cols logic) */}
                    <div className="flex-1 space-y-20">
                        <div ref={contentRef} className={isShort ? 'lg:sticky lg:top-32' : ''}>
                            {/* Featured Post (First Article) */}
                            {featuredArticle && (
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                                >
                                    <div className="lg:col-span-7 relative overflow-hidden rounded-[2rem] shadow-2xl">
                                        <div className="aspect-[16/9] lg:aspect-[3/2] overflow-hidden bg-slate-200 dark:bg-gray-800">
                                            <img
                                                src={featuredArticle.image || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=1600"}
                                                alt={featuredArticle.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 dark:opacity-80"></div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-red-600 text-white rounded-full">
                                                {featuredArticle.category?.name || 'Featured'}
                                            </span>
                                            <h3 className="text-xl font-black font-serif flex items-center gap-3">
                                                <span className="w-2 h-8 bg-red-600 rounded-full"></span>
                                                {language === 'hi' ? 'नवीनतम लेख' : 'Latest Stories'}
                                            </h3>
                                        </div>

                                        <h2 className="text-2xl lg:text-4xl font-black font-serif leading-tight group-hover:text-red-600 transition-colors">
                                            <Link to={`/blog/${featuredArticle.slug}`}>
                                                {featuredArticle.title}
                                            </Link>
                                        </h2>

                                        <p className="text-lg text-slate-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                            {featuredArticle.summary || featuredArticle.shortDescription || featuredArticle.content?.substring(0, 150) + "..."}
                                        </p>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">
                                                    <User size={18} className="text-slate-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold uppercase">{featuredArticle.author?.name || 'Editor'}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(featuredArticle.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <Link to={`/blog/${featuredArticle.slug}`} className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all">
                                                <ArrowUpRight size={20} />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>

                    {/* Sidebar Corner (4 cols logic) */}
                    <aside className="lg:w-[400px] shrink-0 space-y-12">
                        <div className="sticky top-32 space-y-12">
                            <Sidebar language={language} showWeather={false} />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogsPage;
