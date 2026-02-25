import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { API_URL } from '../services/api';

// Dummy data removed for API


const MustReadSlider = ({ language, onArticleClick }) => {
    const sliderRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [mustReadArticles, setMustReadArticles] = useState([]);

    useEffect(() => {
        const loadMustRead = async () => {
            // In a real app we'd filter by views > 100 or PRIORITY=HIGH
            try {
                const response = await fetch(`${API_URL}/articles`);
                if (!response.ok) throw new Error('Failed to fetch articles');
                const data = await response.json();

                if (!Array.isArray(data)) throw new Error('Invalid data format');

                // Filter by Priority=HIGH or Sort by Views - let's simulate
                const simulation = data.filter(a => a.status === 'PUBLISHED').sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);

                if (simulation.length > 0) {
                    setMustReadArticles(simulation.map(a => ({
                        id: a.id,
                        category: a.category?.name?.toUpperCase() || 'NEWS',
                        title: a.title,
                        image: a.image || 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000',
                        author: a.author?.name || 'Mitaan',
                        date: new Date(a.createdAt).toLocaleDateString(),
                        content: a.shortDescription || a.content.substring(0, 100),
                        slug: a.slug
                    })));
                } else {
                    // Fallback
                    setMustReadArticles([{
                        id: 'default',
                        category: 'NEWS',
                        title: 'Welcome to Mitaan Express',
                        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=1000',
                        author: 'Mitaan',
                        date: new Date().toLocaleDateString(),
                        content: 'No top stories yet.'
                    }]);
                }
            } catch (e) {
                console.error("Failed to load must read", e);
            }
        };
        loadMustRead();
    }, []);

    const checkScroll = () => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction) => {
        if (sliderRef.current) {
            const { clientWidth } = sliderRef.current;
            const scrollAmount = clientWidth * 0.6; // Scroll 60% of width
            const scrollTo = direction === 'left' ? sliderRef.current.scrollLeft - scrollAmount : sliderRef.current.scrollLeft + scrollAmount;

            sliderRef.current.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-16 relative overflow-hidden transition-colors">
            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                {/* Header */}
                <div className="flex items-end justify-between border-b border-slate-200 dark:border-white/10 pb-8">
                    <div className="space-y-4">
                        <span className="text-red-500 font-bold tracking-[0.3em] text-[10px] uppercase pl-1">
                            {language === 'hi' ? 'संपादकीय चयन' : 'Editorial Picks'}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">
                            MUST READ
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className={`w-12 h-12 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center transition-all ${canScrollLeft ? 'text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black' : 'text-slate-300 dark:text-white/20 cursor-not-allowed'}`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className={`w-12 h-12 rounded-full border border-slate-200 dark:border-white/20 flex items-center justify-center transition-all ${canScrollRight ? 'text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-black' : 'text-slate-300 dark:text-white/20 cursor-not-allowed'}`}
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white transition-colors ml-8">
                            {language === 'hi' ? 'पुराने लेख देखें' : 'View Archive'} <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                <div
                    ref={sliderRef}
                    onScroll={checkScroll}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-10"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {mustReadArticles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.03, y: -8 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            onClick={() => onArticleClick(article)}
                            className="bg-gray-900 rounded-[2rem] overflow-hidden flex-shrink-0 w-[75vw] md:w-[480px] h-[350px] md:h-[420px] relative group cursor-pointer snap-start border border-white/5 shadow-2xl hover:shadow-red-900/20"
                        >
                            {/* Image with Zoom Effect */}
                            <div className="absolute inset-0">
                                <motion.img
                                    src={article.image}
                                    className="w-full h-full object-cover opacity-60"
                                    alt={article.title}
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.8 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                                <motion.div
                                    className="space-y-3"
                                    initial={{ y: 20, opacity: 0.8 }}
                                    whileHover={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <motion.span
                                        className="inline-block px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/10"
                                        whileHover={{ backgroundColor: 'rgb(220, 38, 38)', borderColor: 'rgb(220, 38, 38)' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {article.category}
                                    </motion.span>

                                    <h3 className="text-xl md:text-3xl font-black text-white font-serif leading-[0.95] group-hover:text-red-50 transition-colors">
                                        {article.title}
                                    </h3>

                                    <motion.div
                                        className="flex items-center justify-between pt-4 border-t border-white/10"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <motion.div
                                                className="w-7 h-7 rounded-full bg-white/20"
                                                whileHover={{ scale: 1.1, rotate: 360 }}
                                                transition={{ duration: 0.5 }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">{article.author}</span>
                                                <span className="text-[8px] text-white/60 font-medium">{article.date}</span>
                                            </div>
                                        </div>
                                        <motion.span
                                            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center"
                                            whileHover={{ backgroundColor: 'rgb(220, 38, 38)', color: 'white', rotate: 45 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ArrowRight size={16} />
                                        </motion.span>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MustReadSlider;
