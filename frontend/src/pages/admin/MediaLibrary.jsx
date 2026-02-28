import React, { useState, useEffect } from 'react';
import { Plus, Play, Image as ImageIcon, Globe, Eye, EyeOff, Search, Grid, List, Upload, Trash2, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdminMedia, useCreateMedia, useUpdateMedia, useDeleteMedia } from '../../hooks/useMedia';

const MediaLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [filterType, setFilterType] = useState('ALL'); // ALL, IMAGE, VIDEO
    const [page, setPage] = useState(1);
    const [uploadProgress, setUploadProgress] = useState({});
    const limit = 20;

    // reset page on search/filter changes
    useEffect(() => setPage(1), [filterType, searchTerm]);

    // Video URL Form State
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [videoData, setVideoData] = useState({
        title: '',
        url: '',
        category: '',
        description: '',
        thumbnail: ''
    });

    const { data: mediaResponse, isLoading: loading } = useAdminMedia(
        filterType !== 'ALL' ? filterType : '',
        '',
        page,
        limit
    );
    const media = mediaResponse?.media || [];
    const pagination = mediaResponse?.pagination || { total: 0, page: 1, totalPages: 1 };
    const createMediaMutation = useCreateMedia();
    const updateMediaMutation = useUpdateMedia();
    const deleteMediaMutation = useDeleteMedia();

    const handleVideoSubmit = (e) => {
        e.preventDefault();
        createMediaMutation.mutate({
            payload: {
                ...videoData,
                type: 'VIDEO',
                category: videoData.category || 'GALLERY'
            }
        }, {
            onSuccess: () => {
                setShowVideoForm(false);
                setVideoData({ title: '', url: '', category: '', description: '', thumbnail: '' });
                alert('Video saved successfully!');
            },
            onError: (error) => {
                console.error('Video save error:', error);
                alert('Failed to save video: ' + (error.message || 'Unknown error'));
            }
        });
    };

    const handleFileUpload = (mediaType) => (e) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const fileName = file.name;
                const formData = new FormData();
                formData.append('type', mediaType);
                formData.append('title', fileName);
                formData.append('category', 'GALLERY');
                formData.append('file', file);
                formData.append('size', `${(file.size / 1024).toFixed(0)} KB`);

                setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

                createMediaMutation.mutate({
                    payload: formData,
                    onProgress: (pct) => setUploadProgress(prev => ({ ...prev, [fileName]: pct }))
                }, {
                    onSuccess: () => {
                        toast.success(`${mediaType === 'VIDEO' ? 'Video' : 'Image'} uploaded successfully!`);
                        setUploadProgress(prev => { const n = { ...prev }; delete n[fileName]; return n; });
                    },
                    onError: (err) => {
                        toast.error(`Failed to upload ${mediaType}: ` + err.message);
                        setUploadProgress(prev => { const n = { ...prev }; delete n[fileName]; return n; });
                    }
                });
            });
        }
    };

    const togglePublish = (item) => {
        updateMediaMutation.mutate({
            id: item.id,
            isPublished: !item.isPublished
        });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this media item?')) {
            deleteMediaMutation.mutate(id);
        }
    };

    const filteredMedia = media.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || m.type === filterType;
        return matchesSearch && matchesType;
    });

    const stats = {
        total: pagination.total,
        selected: selectedMedia.length,
        images: '-',
        videos: '-'
    };

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-serif italic">Media Hub</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        {stats.total} assets • {stats.images} images • {stats.videos} videos
                    </p>
                    {/* Render Upload Progress */}
                    {Object.entries(uploadProgress).map(([fileName, pct]) => (
                        <div key={fileName} className="text-xs font-bold text-red-600 mt-2 truncate w-60 flex items-center gap-2">
                            <div className="flex-1 bg-red-100 rounded-full h-1.5"><div className="bg-red-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div></div>
                            <span>{pct}% - {fileName}</span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-4 md:mt-0 items-end">
                    <button
                        onClick={() => setShowVideoForm(true)}
                        className="px-6 py-3 bg-red-600/10 text-red-600 rounded-xl font-bold hover:bg-red-600/20 transition-all flex items-center gap-2 border border-red-600/20 active:scale-95"
                    >
                        <Globe size={20} />
                        <span className="hidden sm:inline">Add URL</span>
                    </button>
                    <label className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95">
                        <ImageIcon size={20} />
                        <span className="hidden sm:inline">Upload Image</span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload('IMAGE')}
                        />
                    </label>
                    <label className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95">
                        <Play size={20} />
                        <span className="hidden sm:inline">Upload Video</span>
                        <input
                            type="file"
                            multiple
                            accept="video/*"
                            className="hidden"
                            onChange={handleFileUpload('VIDEO')}
                        />
                    </label>
                </div>
            </div>

            {/* Video URL Modal */}
            {showVideoForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-[#030712] w-full max-w-xl rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Add Video Content</h3>
                            <button onClick={() => setShowVideoForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                                <Plus className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleVideoSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Video Title</label>
                                <input
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 ring-red-600 outline-none transition-all"
                                    value={videoData.title}
                                    onChange={e => setVideoData({ ...videoData, title: e.target.value })}
                                    placeholder="Enter compelling title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Stream URL (YouTube/Vimeo)</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        required
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 ring-red-600 outline-none transition-all"
                                        value={videoData.url}
                                        onChange={e => setVideoData({ ...videoData, url: e.target.value })}
                                        placeholder="https://youtube.com/watch?v=..."
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Category</label>
                                    <input
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none"
                                        value={videoData.category}
                                        onChange={e => setVideoData({ ...videoData, category: e.target.value })}
                                        placeholder="e.g. Sports"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Thumbnail URL</label>
                                    <input
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none"
                                        value={videoData.thumbnail}
                                        onChange={e => setVideoData({ ...videoData, thumbnail: e.target.value })}
                                        placeholder="Optional image URL"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={createMediaMutation.isPending}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {createMediaMutation.isPending ? 'Processing...' : 'Add to Library'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-6 items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 transition-all"
                    />
                </div>
                <div className="flex gap-2 w-full lg:w-auto">
                    {['ALL', 'IMAGE', 'VIDEO'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest border transition-all ${filterType === type
                                ? 'bg-red-600 border-red-600 text-white'
                                : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-500 hover:border-red-600'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10 hidden lg:block" />
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-red-100 text-red-600 dark:bg-red-600/20' : 'text-slate-400'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-red-100 text-red-600 dark:bg-red-600/20' : 'text-slate-400'}`}
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cataloging assets...</p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                    <Search size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No assets found matching your criteria</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredMedia.map(item => (
                        <motion.div
                            layout
                            key={item.id}
                            className={`group relative bg-white dark:bg-[#0f172a] rounded-2xl border-2 overflow-hidden transition-all hover:shadow-2xl ${selectedMedia.includes(item.id) ? 'border-red-600' : 'border-slate-100 dark:border-white/5'}`}
                        >
                            <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                {item.type === 'VIDEO' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900 group-hover:scale-105 transition-transform duration-500">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} className="w-full h-full object-cover opacity-60" alt="" />
                                        ) : (
                                            <Play size={40} className="text-white opacity-40" />
                                        )}
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 text-[9px] font-black text-white rounded-md uppercase tracking-wider">VIDEO</div>
                                    </div>
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                )}

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL Copied!') }} className="p-3 bg-white text-slate-900 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl">
                                            <Copy size={18} />
                                        </button>
                                        <button onClick={() => togglePublish(item)} className={`p-3 rounded-xl transition-all shadow-xl ${item.isPublished ? 'bg-green-600 text-white' : 'bg-slate-600 text-white'}`}>
                                            {item.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-900/50">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{item.title}</h4>
                                {item.category && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.category}</p>
                                )}
                                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                    <span>{item.type} • {item.views || 0} views</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xl">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                            <tr>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Preview</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Title</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Type</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Views</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Size</th>
                                <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredMedia.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900">
                                            {item.type === 'VIDEO' ? (
                                                <div className="w-full h-full flex items-center justify-center opacity-70">
                                                    {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover" alt="" /> : <Play size={20} className="text-white" />}
                                                </div>
                                            ) : (
                                                <img src={item.url} className="w-full h-full object-cover" alt="" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 font-bold text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.type === 'VIDEO' ? 'bg-red-100 text-red-600 dark:bg-red-600/20' : 'bg-blue-100 text-blue-600 dark:bg-blue-600/20'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <button onClick={() => togglePublish(item)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.isPublished ? 'text-green-600' : 'text-slate-400'}`}>
                                            {item.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                            {item.isPublished ? 'Published' : 'Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('URL Copied!') }} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-400">
                                                <Copy size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 mt-6">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-6 py-2 bg-slate-100 dark:bg-white/10 rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm font-bold text-slate-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={page === pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-6 py-2 bg-slate-100 dark:bg-white/10 rounded-xl font-bold uppercase text-xs tracking-widest disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
