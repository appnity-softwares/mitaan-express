import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Play, Image as ImageIcon, Globe, Eye, EyeOff, Search, Grid, List, Upload, Trash2, Copy, X, CheckCircle2, AlertCircle, FolderUp, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdminMedia, useCreateMedia, useUpdateMedia, useDeleteMedia } from '../../hooks/useMedia';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const MediaLibrary = () => {
    const { t } = useAdminTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [filterType, setFilterType] = useState('ALL');
    const [page, setPage] = useState(1);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const dropRef = useRef(null);
    const limit = 20;

    useEffect(() => setPage(1), [filterType, searchTerm]);

    // Video URL Form
    const [showVideoForm, setShowVideoForm] = useState(false);
    const [videoData, setVideoData] = useState({ title: '', url: '', category: '', description: '', thumbnail: '' });

    // Edit Media Meta
    const [editingMedia, setEditingMedia] = useState(null);
    const [editData, setEditData] = useState({ title: '', description: '' });

    const { data: mediaResponse, isLoading: loading } = useAdminMedia(
        filterType !== 'ALL' ? filterType : '', '', page, limit
    );
    const media = mediaResponse?.media || [];
    const pagination = mediaResponse?.pagination || { total: 0, page: 1, totalPages: 1 };
    const createMediaMutation = useCreateMedia();
    const updateMediaMutation = useUpdateMedia();
    const deleteMediaMutation = useDeleteMedia();

    const handleVideoSubmit = (e) => {
        e.preventDefault();
        createMediaMutation.mutate({
            payload: { ...videoData, type: 'VIDEO', category: videoData.category || 'GALLERY' }
        }, {
            onSuccess: () => {
                setShowVideoForm(false);
                setVideoData({ title: '', url: '', category: '', description: '', thumbnail: '' });
                toast.success('Video added!');
            },
            onError: (error) => toast.error('Failed: ' + (error.message || 'Unknown error'))
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateMediaMutation.mutate({
            id: editingMedia.id,
            title: editData.title,
            description: editData.description
        }, {
            onSuccess: () => {
                setEditingMedia(null);
                toast.success('Media details updated!');
            },
            onError: (error) => toast.error('Failed to update: ' + (error.message || 'Unknown error'))
        });
    };

    // Unified upload handler for both drag-drop and file input
    const processFiles = useCallback((files, mediaType = null) => {
        const fileList = Array.from(files);
        const newQueue = fileList.map(file => {
            const type = mediaType || (file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE');
            return { id: `${file.name}-${Date.now()}`, file, type, name: file.name, progress: 0, status: 'uploading' };
        });

        setUploadQueue(prev => [...prev, ...newQueue]);

        newQueue.forEach(item => {
            const formData = new FormData();
            formData.append('type', item.type);
            formData.append('title', item.file.name);
            formData.append('category', 'GALLERY');
            formData.append('file', item.file);
            formData.append('size', `${(item.file.size / 1024).toFixed(0)} KB`);

            createMediaMutation.mutate({
                payload: formData,
                onProgress: (pct) => {
                    setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: pct } : q));
                }
            }, {
                onSuccess: () => {
                    setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', progress: 100 } : q));
                    setTimeout(() => {
                        setUploadQueue(prev => prev.filter(q => q.id !== item.id));
                    }, 3000);
                },
                onError: (err) => {
                    setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err.message } : q));
                }
            });
        });
    }, [createMediaMutation]);

    // File input handler
    const handleFileUpload = (mediaType) => (e) => {
        if (e.target.files?.length) processFiles(e.target.files, mediaType);
        e.target.value = '';
    };

    // Drag & Drop
    const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); if (!dropRef.current?.contains(e.relatedTarget)) setIsDragging(false); }, []);
    const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const togglePublish = (item) => updateMediaMutation.mutate({ id: item.id, isPublished: !item.isPublished });
    const handleDelete = (id) => { if (window.confirm('Delete this media?')) deleteMediaMutation.mutate(id); };
    const handleBulkDelete = () => {
        if (selectedMedia.length === 0) return;
        if (!window.confirm(`Delete ${selectedMedia.length} selected items?`)) return;
        selectedMedia.forEach(id => deleteMediaMutation.mutate(id));
        setSelectedMedia([]);
    };

    const toggleSelect = (id) => {
        setSelectedMedia(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filteredMedia = media.filter(m => {
        const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div
            ref={dropRef}
            className="p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-red-600/10 backdrop-blur-sm flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-slate-800 p-16 rounded-3xl border-4 border-dashed border-red-600 text-center shadow-2xl"
                        >
                            <FolderUp size={64} className="mx-auto text-red-600 mb-4" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Drop Files Here</h3>
                            <p className="text-slate-500 mt-2">Images & videos will be uploaded to your gallery</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        📸 {t('media') || 'Media Library'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{pagination.total} assets • Drag & drop to bulk upload</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowVideoForm(true)} className="px-4 py-2.5 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition flex items-center gap-2 border border-red-100 dark:border-red-900/20">
                        <Globe size={16} /> Add URL
                    </button>
                    <label className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center gap-2 cursor-pointer">
                        <ImageIcon size={16} /> Upload Images
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload('IMAGE')} />
                    </label>
                    <label className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center gap-2 cursor-pointer">
                        <Play size={16} /> Upload Videos
                        <input type="file" multiple accept="video/*" className="hidden" onChange={handleFileUpload('VIDEO')} />
                    </label>
                </div>
            </div>

            {/* Bulk Upload Progress Panel */}
            <AnimatePresence>
                {uploadQueue.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 p-4 space-y-2"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                <Upload size={14} className="text-red-600" />
                                Uploading {uploadQueue.length} file{uploadQueue.length > 1 ? 's' : ''}
                            </h4>
                            <button onClick={() => setUploadQueue(prev => prev.filter(q => q.status === 'uploading'))} className="text-xs text-slate-400 hover:text-slate-600">
                                Clear Done
                            </button>
                        </div>
                        {uploadQueue.map(item => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0
                                    ${item.status === 'done' ? 'bg-green-500' : item.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                    {item.status === 'done' ? <CheckCircle2 size={14} /> : item.status === 'error' ? <AlertCircle size={14} /> : `${item.progress}%`}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-1">
                                        <div className={`h-1 rounded-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : item.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}
                                            style={{ width: `${item.progress}%` }} />
                                    </div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full
                                    ${item.type === 'VIDEO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {item.type}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Video URL Modal */}
            {showVideoForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Video URL</h3>
                            <button onClick={() => setShowVideoForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleVideoSubmit} className="space-y-4">
                            <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-sm" value={videoData.title} onChange={e => setVideoData({ ...videoData, title: e.target.value })} placeholder="Video Title" />
                            <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-sm" value={videoData.url} onChange={e => setVideoData({ ...videoData, url: e.target.value })} placeholder="https://youtube.com/watch?v=..." />
                            <div className="grid grid-cols-2 gap-3">
                                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm" value={videoData.category} onChange={e => setVideoData({ ...videoData, category: e.target.value })} placeholder="Category" />
                                <input className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none text-sm" value={videoData.thumbnail} onChange={e => setVideoData({ ...videoData, thumbnail: e.target.value })} placeholder="Thumbnail URL (optional)" />
                            </div>
                            <button type="submit" disabled={createMediaMutation.isPending}
                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
                                {createMediaMutation.isPending ? 'Adding...' : 'Add Video'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Edit Media Modal */}
            {editingMedia && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-100 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Media Meta</h3>
                            <button onClick={() => setEditingMedia(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Title</label>
                                <input required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-sm" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="Image/Video Title" />
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Description</label>
                                <textarea rows="3" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-sm" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} placeholder="Optional description..." />
                            </div>
                            <button type="submit" disabled={updateMediaMutation.isPending}
                                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition disabled:opacity-50">
                                {updateMediaMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Search assets..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-sm" />
                </div>
                <div className="flex gap-1.5">
                    {['ALL', 'IMAGE', 'VIDEO'].map(type => (
                        <button key={type} onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition ${filterType === type ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />
                <div className="flex gap-1.5">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-red-100 text-red-600 dark:bg-red-600/20' : 'text-slate-400'}`}>
                        <Grid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition ${viewMode === 'list' ? 'bg-red-100 text-red-600 dark:bg-red-600/20' : 'text-slate-400'}`}>
                        <List size={18} />
                    </button>
                </div>
                {selectedMedia.length > 0 && (
                    <button onClick={handleBulkDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-xs flex items-center gap-2">
                        <Trash2 size={14} /> Delete {selectedMedia.length}
                    </button>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mb-4" />
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading assets...</p>
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                    <FolderUp size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">No assets found</p>
                    <p className="text-slate-400 text-sm mt-1">Drag & drop files here or use upload buttons above</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredMedia.map(item => (
                        <motion.div layout key={item.id}
                            className={`group relative bg-white dark:bg-slate-800 rounded-xl border-2 overflow-hidden transition-all hover:shadow-xl cursor-pointer
                                ${selectedMedia.includes(item.id) ? 'border-red-600 ring-2 ring-red-600/20' : 'border-slate-100 dark:border-white/5'}`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            <div className="aspect-square relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                {item.type === 'VIDEO' ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                        {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover opacity-60" alt="" /> : <Play size={32} className="text-white opacity-40" />}
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-600 text-[8px] font-black text-white rounded uppercase">Video</div>
                                    </div>
                                ) : (
                                    <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                )}
                                {/* Checkbox */}
                                <div className={`absolute top-2 right-2 w-6 h-6 rounded-md border-2 flex items-center justify-center transition
                                    ${selectedMedia.includes(item.id) ? 'bg-red-600 border-red-600' : 'border-white/50 bg-black/20 opacity-0 group-hover:opacity-100'}`}>
                                    {selectedMedia.includes(item.id) && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                {/* Hover Actions */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform flex justify-center gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingMedia(item); setEditData({ title: item.title || '', description: item.description || '' }); }}
                                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs" title="Edit Meta">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.url); toast.success('URL Copied!'); }}
                                        className="p-2 bg-white/90 text-slate-900 rounded-lg hover:bg-white transition text-xs" title="Copy URL">
                                        <Copy size={14} />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); togglePublish(item); }}
                                        className={`p-2 rounded-lg transition text-xs ${item.isPublished ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`} title="Toggle Visibility">
                                        {item.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs" title="Delete">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-3">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                                    <span>{item.type} • {item.views || 0} views</span>
                                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500 w-8">
                                    <input type="checkbox" className="rounded" onChange={(e) => {
                                        if (e.target.checked) setSelectedMedia(filteredMedia.map(m => m.id));
                                        else setSelectedMedia([]);
                                    }} />
                                </th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">Preview</th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">Title</th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">Type</th>
                                <th className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest text-slate-500">Status</th>
                                <th className="px-4 py-3 text-right text-[9px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredMedia.map(item => (
                                <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition ${selectedMedia.includes(item.id) ? 'bg-red-50 dark:bg-red-900/5' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedMedia.includes(item.id)} onChange={() => toggleSelect(item.id)} className="rounded" />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900">
                                            {item.type === 'VIDEO' ? (
                                                item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><Play size={16} className="text-white" /></div>
                                            ) : (
                                                <img src={item.url} className="w-full h-full object-cover" alt="" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-sm text-slate-900 dark:text-white truncate max-w-[200px]">{item.title}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${item.type === 'VIDEO' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => togglePublish(item)} className={`text-[10px] font-bold ${item.isPublished ? 'text-green-600' : 'text-slate-400'}`}>
                                            {item.isPublished ? '● Published' : '○ Hidden'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => { setEditingMedia(item); setEditData({ title: item.title || '', description: item.description || '' }); }} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg text-blue-500" title="Edit Meta"><Edit3 size={14} /></button>
                                            <button onClick={() => { navigator.clipboard.writeText(item.url); toast.success('Copied!'); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-400" title="Copy URL"><Copy size={14} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-600" title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                    <button disabled={page === 1} onClick={() => setPage(page - 1)}
                        className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-lg font-bold text-xs disabled:opacity-50">Previous</button>
                    <span className="text-sm font-bold text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={page === pagination.totalPages} onClick={() => setPage(page + 1)}
                        className="px-4 py-2 bg-slate-100 dark:bg-white/10 rounded-lg font-bold text-xs disabled:opacity-50">Next</button>
                </div>
            )}
        </div>
    );
};

export default MediaLibrary;
