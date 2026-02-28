import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video as VideoIcon, Play, Clock, Eye, X, MonitorPlay } from 'lucide-react';
import { usePublicMedia, useIncrementViews } from '../hooks/useMedia';
import { getVideoEmbedUrl, getVideoThumbnail } from '../utils/videoUtils';

const isDirectVideo = (url) => {
    if (!url) return false;
    return !url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('vimeo.com');
};

const VideoPage = ({ language }) => {
    const [filter, setFilter] = useState('All');
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Fetch videos from API
    const { data: mediaResponse, isLoading } = usePublicMedia('VIDEO');
    const rawMediaData = mediaResponse?.media || [];
    const mediaData = useMemo(() => rawMediaData.filter(v => !v.language || v.language === language || v.language === 'both'), [rawMediaData, language]);
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

    const filteredVideos = filter === 'All'
        ? mediaData
        : mediaData.filter(video => video.category === filter);

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
        incrementViewsMutation.mutate(video.id);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium font-serif italic">
                        {language === 'hi' ? 'वीडियो लोड हो रहे हैं...' : 'Tuning the frequencies...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] py-16 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Cinematic Header */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl space-y-6"
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-red-600 font-black text-[10px] tracking-[0.4em] uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                {language === 'hi' ? 'वीडियो हब' : 'CINEMA HUB'}
                            </span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-red-600/30 dark:from-red-500/50 to-transparent"></div>
                        </div>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black font-serif text-slate-900 dark:text-white tracking-tighter leading-none">
                            Moving <span className="text-red-600 italic">Pictures.</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-serif italic max-w-2xl leading-relaxed">
                            {language === 'hi' ? 'हमारे नवीनतम वीडियो संग्रह का अनुभव करें' : 'Immerse yourself in our premier video journalism and short documentaries.'}
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

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVideos.length === 0 ? (
                        <div className="col-span-full text-center py-32 bg-white dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
                            <MonitorPlay size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-6 opacity-60" />
                            <p className="text-slate-500 dark:text-slate-400 font-serif text-xl italic">
                                {language === 'hi' ? 'कोई वीडियो नहीं मिला...' : 'No broadcasts available in this frequency...'}
                            </p>
                        </div>
                    ) : (
                        filteredVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ type: 'spring', damping: 25, delay: index * 0.05 }}
                                className="group cursor-pointer flex flex-col"
                                onClick={() => handleVideoClick(video)}
                            >
                                {/* Thumbnail Container */}
                                <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-6 shadow-xl hover:shadow-red-600/20 transition-all duration-500 border border-slate-200 dark:border-white/5 bg-slate-900">
                                    {isDirectVideo(video.url) && (!video.thumbnail || video.thumbnail.trim() === '') ? (
                                        <video
                                            src={`${video.url}#t=0.1`}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                            muted
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={getVideoThumbnail(video.url, video.thumbnail)}
                                            alt={video.title}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                                    {/* Action Hover Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500 shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <Play size={32} className="text-white ml-2 relative z-10" fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center gap-1.5 border border-white/10">
                                        <Clock size={12} className="text-red-500" />
                                        <span className="text-[10px] font-black tracking-widest text-white">{video.duration || 'VOD'}</span>
                                    </div>

                                    {video.category && (
                                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-600/90 backdrop-blur-md rounded-full border border-red-500/50">
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                                {video.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Typography Content */}
                                <div className="px-2 space-y-3 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-serif leading-tight group-hover:text-red-600 transition-colors line-clamp-2 tracking-tighter">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-[15px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-serif italic flex-1">
                                            "{video.description}"
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-200 dark:border-white/5 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 group-hover:text-red-500 transition-colors">
                                            <Eye size={14} />
                                            <span>{video.views || 0} Views</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Video Player Modal */}
                <AnimatePresence>
                    {selectedVideo && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setSelectedVideo(null)}
                            className="fixed inset-0 bg-slate-900/95 backdrop-blur-3xl z-[200] flex items-center justify-center p-4 sm:p-8"
                        >
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-6 right-6 sm:top-10 sm:right-10 w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center hover:bg-red-600 transition-all z-50 group hover:scale-110 hover:shadow-lg shadow-black"
                            >
                                <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-6xl flex flex-col items-center gap-8"
                            >
                                {/* Video Player Frame */}
                                <div className="w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl relative group border border-white/10">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-red-600/10 to-transparent pointer-events-none mix-blend-screen z-10"></div>
                                    {isDirectVideo(selectedVideo.url) ? (
                                        <video
                                            src={selectedVideo.url}
                                            controls
                                            autoPlay
                                            controlsList="nodownload"
                                            className="w-full h-full outline-none relative z-20"
                                        />
                                    ) : (
                                        <iframe
                                            src={getVideoEmbedUrl(selectedVideo.url)}
                                            title={selectedVideo.title}
                                            className="w-full h-full relative z-20"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>

                                {/* Typography Overlay */}
                                <div className="text-center max-w-4xl px-4 w-full">
                                    <h2 className="text-3xl md:text-5xl font-black text-white font-serif mb-6 tracking-tight drop-shadow-xl">
                                        {selectedVideo.title}
                                    </h2>

                                    <div className="flex items-center justify-center gap-6 mb-6">
                                        {selectedVideo.category && (
                                            <span className="px-4 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                                                {selectedVideo.category}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-2 text-slate-400 text-sm font-bold tracking-widest uppercase">
                                            <Eye size={16} className="text-red-500" />
                                            <span>{selectedVideo.views || 0} Broadcasts</span>
                                        </div>
                                    </div>

                                    {selectedVideo.description && (
                                        <p className="text-slate-300 max-w-3xl mx-auto font-serif italic text-lg md:text-xl leading-relaxed opacity-90">
                                            "{selectedVideo.description}"
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VideoPage;
