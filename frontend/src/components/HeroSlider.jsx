import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useArticles } from '../context/ArticlesContext';
import { formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';

const HeroSlider = ({ language }) => {
    const navigate = useNavigate();
    const { featured, loading } = useArticles();
    const [[page, direction], setPage] = useState([0, 0]);

    // Prepare slides: Always start with Welcome, then featured articles
    const welcomeSlide = {
        id: 'welcome',
        tag: language === 'hi' ? 'स्वागत' : 'WELCOME',
        title: language === 'hi' ? 'मितान एक्सप्रेस में आपका स्वागत है' : 'Welcome to Mitaan Express',
        description: language === 'hi' ? 'समाचार और कहानियों के लिए आपका विश्वसनीय स्रोत।' : 'Your trusted source for news and stories.',
        image: 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=2000',
        isWelcome: true
    };

    const articleSlides = featured.slice(0, 6).map(a => ({
        id: a.id,
        tag: language === 'hi' ? (a.category?.nameHi || 'विशेष') : (a.category?.name || 'FEATURED'),
        title: a.title,
        description: a.shortDescription || a.content?.substring(0, 100) || '',
        image: formatImageUrl(a.image),
        articleId: a.id
    }));

    const slides = [welcomeSlide, ...articleSlides];

    const activeIndex = slides.length > 0 ? (page % slides.length + slides.length) % slides.length : 0;
    const currentSlide = slides[activeIndex];

    const paginate = useCallback((newDirection) => {
        if (slides.length > 0) {
            setPage([page + newDirection, newDirection]);
        }
    }, [page, slides.length]);

    useEffect(() => {
        if (slides.length > 1) {
            const timer = setInterval(() => paginate(1), 8000);
            return () => clearInterval(timer);
        }
    }, [paginate, slides.length]); // Dependencies must be stable

    if (!currentSlide) {
        return <div className="h-[85vh] bg-black flex items-center justify-center text-white">Loading Hero Section...</div>;
    }

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? '50%' : '-50%',
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 1 },
                scale: { duration: 1.2, ease: "easeOut" }
            }
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? '50%' : '-50%',
            opacity: 0,
            scale: 1.1,
            transition: {
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 1 }
            }
        })
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section className="relative h-[85vh] md:h-[95vh] min-h-[600px] bg-slate-900 dark:bg-black overflow-hidden group/hero">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0"
                >
                    <motion.img
                        src={currentSlide.image}
                        className="w-full h-full object-cover"
                        alt=""
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 8, ease: "linear" }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PLACEHOLDER_IMAGE;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 h-full flex items-center">
                <div className="w-full">
                    <motion.div
                        key={activeIndex}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-6 md:space-y-8 mt-12 md:mt-0"
                    >
                        <motion.div variants={itemVariants} className="flex items-center gap-4">
                            <span className="bg-red-600 text-white text-[10px] md:text-[10px] font-black px-4 py-1.5 uppercase tracking-widest inline-block skew-x-[-12deg]">
                                <span className="inline-block skew-x-[12deg]">{currentSlide.tag}</span>
                            </span>
                            <div className="h-[1px] w-8 md:w-12 bg-white/30 hidden sm:block"></div>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] md:leading-[1.05] font-serif tracking-tighter max-w-4xl mb-12"
                        >
                            {currentSlide.title}
                        </motion.h1>

                        <motion.div variants={itemVariants} className="flex flex-row gap-3 sm:gap-5 pt-4 sm:pt-6 w-full sm:w-auto">
                            {/* Primary Button: Read Story / Get Started */}
                            <button
                                onClick={() => currentSlide.isWelcome ? navigate('/about') : navigate(`/article/${currentSlide.articleId}`)}
                                className="group relative px-4 py-3 sm:px-8 sm:py-4 overflow-hidden rounded-xl transition-all duration-500 flex-1 sm:flex-none sm:w-auto cursor-pointer"
                            >
                                <span className="absolute inset-0 bg-red-600 transition-transform duration-500 group-hover:scale-105"></span>
                                <span className="absolute inset-0 bg-gradient-to-r from-red-700 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                                {/* Shimmer Effect */}
                                <span className="absolute inset-0 w-1/2 h-full bg-white/20 -skew-x-[25deg] -translate-x-[150%] group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out"></span>

                                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] whitespace-nowrap">
                                    {currentSlide.isWelcome ? (language === 'hi' ? 'जानीए हमारे बारे में' : 'LEARN MORE') : (language === 'hi' ? 'अभी पढ़ें' : 'READ STORY')}
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300 ml-1" />
                                </span>
                            </button>

                            {/* Secondary Button: Watch Coverage */}
                            <button
                                onClick={() => navigate('/video')}
                                className="group relative px-4 py-3 sm:px-8 sm:py-4 overflow-hidden rounded-xl transition-all duration-500 flex-1 sm:flex-none sm:w-auto cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:bg-white/15 group-hover:border-white/30"></div>

                                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3 text-white font-black text-[10px] sm:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] whitespace-nowrap">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-600/20 flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300 shadow-lg shadow-red-600/0 group-hover:shadow-red-600/40">
                                        <PlayCircle size={14} className="text-red-500 group-hover:text-white transition-colors sm:w-[18px] sm:h-[18px]" fill="currentColor" fillOpacity="0.2" />
                                    </div>
                                    {language === 'hi' ? 'वीडियो देखें' : 'WATCH'}
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Pagination UI */}
            <div className="absolute bottom-12 left-4 sm:left-6 lg:left-8 right-4 sm:right-6 lg:right-8 z-20 flex items-end justify-between">
                <div className="flex gap-4">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                const newDir = i > activeIndex ? 1 : -1;
                                setPage([i, newDir]);
                            }}
                            className="group relative py-4"
                        >
                            <div className="w-12 h-[2px] bg-white/20 relative overflow-hidden">
                                {activeIndex === i && (
                                    <motion.div
                                        className="absolute inset-0 bg-red-600 origin-left"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 8, ease: "linear" }}
                                    />
                                )}
                            </div>
                            <span className={`absolute -top-2 left-0 text-[10px] font-black transition-colors ${activeIndex === i ? 'text-white' : 'text-white/30 group-hover:text-white/60'}`}>
                                0{i + 1}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => paginate(-1)}
                        className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all group/btn"
                    >
                        <ChevronLeft size={24} className="group-hover/btn:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => paginate(1)}
                        className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 hover:border-red-600 transition-all group/btn"
                    >
                        <ChevronRight size={24} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSlider;
