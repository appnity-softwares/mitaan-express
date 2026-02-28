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
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {language === 'hi' ? 'गैलरी लोड हो रही है...' : 'Loading gallery...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {/* Header */}
                <div className="mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center">
                            <ImageIcon size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-serif text-slate-900 dark:text-white tracking-tighter">
                                {language === 'hi' ? 'गैलरी' : 'Gallery'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                                {language === 'hi' ? 'हमारी दृश्य कहानियों का संग्रह' : 'A collection of our visual stories'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filter === cat
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredImages.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <ImageIcon size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {language === 'hi' ? 'कोई छवि नहीं मिली' : 'No images found'}
                            </p>
                        </div>
                    ) : (
                        filteredImages.map((image, index) => (
                            <motion.div
                                key={image.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleImageClick(image)}
                                className="group relative aspect-square rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all"
                            >
                                <img
                                    src={image.url}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                                        {image.category && (
                                            <span className="text-xs font-black text-red-500 uppercase tracking-widest">
                                                {image.category}
                                            </span>
                                        )}
                                        <h3 className="text-xl font-bold text-white font-serif">
                                            {image.title}
                                        </h3>
                                        {image.description && (
                                            <p className="text-sm text-white/70 line-clamp-2">
                                                {image.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                        <ZoomIn size={20} className="text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Lightbox */}
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                            <X size={24} className="text-white" />
                        </button>
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            src={selectedImage.url}
                            alt={selectedImage.title}
                            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div className="absolute bottom-8 left-8 right-8 text-center">
                            <h2 className="text-3xl font-black text-white font-serif mb-2">
                                {selectedImage.title}
                            </h2>
                            <span className="text-sm font-bold text-red-500 uppercase tracking-widest">
                                {selectedImage.category}
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default GalleryPage;
