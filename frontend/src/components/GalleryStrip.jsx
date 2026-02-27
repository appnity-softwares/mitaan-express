import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePublicMedia } from '../hooks/useMedia';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';

const GalleryStrip = ({ language }) => {
    const navigate = useNavigate();
    const { data: images = [], isLoading } = usePublicMedia('IMAGE');
    const containerRef = useRef(null);
    const [width, setWidth] = React.useState(0);

    // Filter valid images and limit to 10
    const displayImages = images.map(img => ({
        ...img,
        url: formatImageUrl(img.url)
    })).slice(0, 10);

    React.useEffect(() => {
        if (containerRef.current) {
            setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
        }
    }, [displayImages]);

    if (isLoading || displayImages.length === 0) return null;

    return (
        <section className="py-12 bg-slate-50 dark:bg-black overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-slate-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className="flex items-end justify-between mb-12">
                    <div className="space-y-4">
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="inline-block px-3 py-1 bg-red-600/10 text-red-600 dark:text-red-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
                        >
                            {language === 'hi' ? 'दृश्य संग्रह' : 'Visual Stories'}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-5xl font-black font-serif tracking-tighter text-slate-900 dark:text-white leading-none"
                        >
                            {language === 'hi' ? 'गैलरी हाइलाइट्स' : 'Gallery Highlights'}
                        </motion.h2>
                    </div>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        onClick={() => navigate('/gallery')}
                        className="hidden md:flex items-center gap-3 group"
                    >
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-red-600 transition-colors">
                            {language === 'hi' ? 'सभी देखें' : 'View All'}
                        </span>
                        <span className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 group-hover:text-white transition-all duration-300">
                            <ArrowRight size={20} />
                        </span>
                    </motion.button>
                </div>

                {/* Draggable Carousel */}
                <motion.div
                    ref={containerRef}
                    className="cursor-grab active:cursor-grabbing overflow-hidden"
                >
                    <motion.div
                        drag="x"
                        dragConstraints={{ right: 0, left: -width }}
                        className="flex gap-6 md:gap-8 w-max px-2 pb-10" // Padding bottom for shadow/hover space
                    >
                        {displayImages.map((img, idx) => (
                            <motion.div
                                key={img.id}
                                className="relative w-[280px] md:w-[320px] aspect-[3/4] rounded-2xl overflow-hidden group shadow-lg shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900"
                            >
                                {/* Image */}
                                <img
                                    src={img.url}
                                    alt={img.title || 'Gallery Image'}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                                                {img.category || 'Gallery'}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white font-serif leading-tight opacity-90 group-hover:opacity-100">
                                            {img.title}
                                        </h3>
                                        <button
                                            onClick={() => navigate('/gallery')}
                                            className="pt-4 flex items-center gap-2 text-white/80 hover:text-white text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-200"
                                        >
                                            {language === 'hi' ? 'देखें' : 'View'} <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* View More Card */}
                        <motion.div
                            onClick={() => navigate('/gallery')}
                            className="relative w-[200px] aspect-[3/4] rounded-2xl flex flex-col items-center justify-center gap-6 bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/10 cursor-pointer group hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-white/10 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                <ArrowRight size={24} />
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {language === 'hi' ? 'सभी देखें' : 'View All'}
                            </span>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Mobile View All Button */}
                <div className="mt-8 flex justify-center md:hidden">
                    <button
                        onClick={() => navigate('/gallery')}
                        className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                    >
                        {language === 'hi' ? 'पूरी गैलरी' : 'Full Gallery'}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default GalleryStrip;
