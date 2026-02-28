import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import { usePublicMedia, useIncrementViews } from '../hooks/useMedia';

const GalleryPage = ({ language }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [filter, setFilter] = useState('All');

    // Fetch images from API
    const { data: mediaResponse, isLoading } = usePublicMedia('IMAGE');
    const mediaData = mediaResponse?.media || [];
    const incrementViewsMutation = useIncrementViews();

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = ['All'];
        mediaData.forEach(item => {
            if (item.category && !cats.includes(item.category)) {
                cats.push(item.category);
            }
        });
        return cats;
    }, [mediaData]);

    const filteredImages = filter === 'All'
        ? mediaData
        : mediaData.filter(img => img.category === filter);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        incrementViewsMutation.mutate(image.id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium font-serif italic">
                        {language === 'hi' ? 'गैलरी लोड हो रही है...' : 'Developing negatives...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] py-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cinematic Header */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-red-600 font-black text-[10px] tracking-[0.4em] uppercase">
                                {language === 'hi' ? 'गैलरी' : 'GALLERY'}
                            </span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/30 dark:from-red-500/50 to-transparent"></div>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black font-serif text-slate-900 dark:text-white tracking-tighter leading-none">
                            Visual <span className="text-red-600 italic">Stories.</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-serif italic max-w-2xl leading-relaxed">
                            {language === 'hi' ? 'हमारी दृश्य कहानियों का संग्रह' : 'Explore moments frozen in time. A curated collection of powerful imagery from around the world.'}
                        </p>
                    </motion.div>

                    {/* Filter Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-3 mt-12"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${filter === cat
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl scale-105'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 shadow-sm'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </motion.div>
                </div>

                {/* Gallery Masonry Grid */}
                {filteredImages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-32 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10"
                    >
                        <ImageIcon size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6" />
                        <p className="text-slate-500 dark:text-slate-400 font-serif text-xl italic">
                            {language === 'hi' ? 'इस श्रेणी में कोई छवि नहीं मिली...' : 'No images found in this collection...'}
                        </p>
                    </motion.div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 lg:gap-8 space-y-6 lg:space-y-8">
                        {filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index % 10) * 0.05 }}
                                onClick={() => handleImageClick(image)}
                                className="group relative rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 break-inside-avoid border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-slate-900"
                            >
                                <div className="relative w-full h-full bg-slate-200 dark:bg-slate-800 text-[0px]">
                                    <img
                                        src={image.url}
                                        alt={image.title}
                                        loading="lazy"
                                        className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110 block"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-left">
                                        {image.category && (
                                            <span className="inline-block px-3 py-1 mb-3 bg-red-600/90 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-red-500/50">
                                                {image.category}
                                            </span>
                                        )}
                                        <h3 className="text-2xl font-black text-white font-serif leading-tight">
                                            {image.title}
                                        </h3>
                                        {image.description && (
                                            <p className="text-sm text-slate-300 line-clamp-2 mt-2 font-serif italic">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transform scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <ZoomIn size={20} className="text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Lightbox */}
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[200] flex items-center justify-center p-4 sm:p-8"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 sm:top-10 sm:right-10 w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center hover:bg-red-600 transition-all z-50 group hover:scale-110 hover:shadow-lg shadow-black"
                        >
                            <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        <div className="w-full max-w-7xl h-full flex flex-col justify-center items-center gap-8 relative">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="relative max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={selectedImage.url}
                                    alt={selectedImage.title}
                                    className="max-h-[75vh] w-auto object-contain select-none bg-black"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center max-w-3xl px-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h2 className="text-3xl md:text-5xl font-black text-white font-serif mb-4 tracking-tight drop-shadow-lg">
                                    {selectedImage.title}
                                </h2>
                                <div className="flex items-center justify-center gap-4">
                                    {selectedImage.category && (
                                        <span className="px-4 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                            {selectedImage.category}
                                        </span>
                                    )}
                                </div>
                                {selectedImage.description && (
                                    <p className="mt-6 text-slate-300/90 text-xl leading-relaxed font-serif italic drop-shadow-md">
                                        "{selectedImage.description}"
                                    </p>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
