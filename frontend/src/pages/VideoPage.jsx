import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video as VideoIcon, Play, Clock, Eye, X } from 'lucide-react';
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

    // Extract video ID from URL (YouTube/Vimeo)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {language === 'hi' ? 'वीडियो लोड हो रहे हैं...' : 'Loading videos...'}
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
                            <VideoIcon size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-serif text-slate-900 dark:text-white tracking-tighter">
                                {language === 'hi' ? 'वीडियो' : 'Videos'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                                {language === 'hi' ? 'हमारे वीडियो संग्रह देखें' : 'Watch our latest video content'}
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

                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVideos.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <VideoIcon size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                {language === 'hi' ? 'कोई वीडियो नहीं मिला' : 'No videos found'}
                            </p>
                        </div>
                    ) : (
                        filteredVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group cursor-pointer"
                                onClick={() => handleVideoClick(video)}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-xl hover:shadow-2xl transition-all">
                                    {isDirectVideo(video.url) && (!video.thumbnail || video.thumbnail.trim() === '') ? (
                                        <video
                                            src={`${video.url}#t=0.1`}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            muted
                                            preload="metadata"
                                        />
                                    ) : (
                                        <img
                                            src={getVideoThumbnail(video.url, video.thumbnail)}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />

                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                            <Play size={24} className="text-white ml-1" fill="white" />
                                        </div>
                                    </div>

                                    {/* Duration Badge */}
                                    {video.duration && (
                                        <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-1">
                                            <Clock size={12} className="text-white" />
                                            <span className="text-xs font-bold text-white">{video.duration}</span>
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    {video.category && (
                                        <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 rounded-full">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">
                                                {video.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif leading-tight group-hover:text-red-600 transition-colors line-clamp-2">
                                        {video.title}
                                    </h3>
                                    {video.description && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {video.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Eye size={14} />
                                            <span className="font-medium">{video.views || 0}</span>
                                        </div>
                                        {video.duration && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium">{video.duration}</span>
                                            </>
                                        )}
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
                            onClick={() => setSelectedVideo(null)}
                            className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
                        >
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                            >
                                <X size={24} className="text-white" />
                            </button>

                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full max-w-5xl"
                            >
                                {/* Video Player */}
                                <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-6">
                                    {isDirectVideo(selectedVideo.url) ? (
                                        <video
                                            src={selectedVideo.url}
                                            controls
                                            autoPlay
                                            controlsList="nodownload"
                                            className="w-full h-full outline-none"
                                        />
                                    ) : (
                                        <iframe
                                            src={getVideoEmbedUrl(selectedVideo.url)}
                                            title={selectedVideo.title}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="text-center space-y-3">
                                    <h2 className="text-3xl font-black text-white font-serif">
                                        {selectedVideo.title}
                                    </h2>
                                    {selectedVideo.description && (
                                        <p className="text-slate-300 max-w-3xl mx-auto">
                                            {selectedVideo.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                                        {selectedVideo.category && (
                                            <span className="font-bold text-red-500 uppercase tracking-widest">
                                                {selectedVideo.category}
                                            </span>
                                        )}
                                        {selectedVideo.views && (
                                            <>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Eye size={14} />
                                                    <span>{selectedVideo.views} views</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
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
