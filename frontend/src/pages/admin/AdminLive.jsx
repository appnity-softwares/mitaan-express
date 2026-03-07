import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Video, Eye, ChevronDown, ChevronRight, Upload, Link as LinkIcon, Youtube, Monitor, User } from 'lucide-react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import { getVideoThumbnail } from '../../utils/videoUtils';
import toast from 'react-hot-toast';

const AdminLive = () => {
    const { adminLang } = useAdminTranslation();
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [videos, setVideos] = useState([]);
    const [saving, setSaving] = useState(false);
    const [expandedIndex, setExpandedIndex] = useState(null);

    const defaultVideos = [
        {
            title: "Business Agility in the Digital Age",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            thumbnail: "",
            author: "Mitaan Express",
            duration: "12:45",
            createdAt: new Date().toISOString()
        }
    ];

    useEffect(() => {
        if (settings?.hero_videos_json) {
            try {
                const parsed = JSON.parse(settings.hero_videos_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setVideos(parsed);
                    return;
                }
            } catch (e) { }
        }
        setVideos(defaultVideos);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMutation.mutateAsync({
                hero_videos_json: JSON.stringify(videos)
            });
            toast.success(adminLang === 'hi' ? 'वीडियो सेव हो गए!' : 'Videos saved successfully!');
        } catch (error) {
            toast.error('Failed to save: ' + error.message);
        }
        setSaving(false);
    };

    const addVideo = () => {
        const newVideo = {
            title: '',
            url: '',
            thumbnail: '',
            author: 'Mitaan Express',
            duration: '00:00',
            createdAt: new Date().toISOString()
        };
        setVideos([...videos, newVideo]);
        setExpandedIndex(videos.length);
    };

    const updateVideo = (index, field, value) => {
        const updated = [...videos];
        updated[index] = { ...updated[index], [field]: value };
        setVideos(updated);
    };

    const removeVideo = (index) => {
        if (window.confirm('Are you sure you want to remove this video?')) {
            setVideos(videos.filter((_, i) => i !== index));
            setExpandedIndex(null);
        }
    };

    const handleFileUpload = (e, index, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (re) => {
                updateVideo(index, field, re.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading Section Data...</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Video size={24} className="text-red-600" />
                        {adminLang === 'hi' ? 'लाइव नाउ सेक्शन' : 'Live Now Section'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {adminLang === 'hi' ? 'लैंडिंग पेज के "LIVE NOW" सेक्शन के वीडियो मैनेज करें' : 'Manage videos shown in the "LIVE NOW" hero section on the landing page'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden group border border-white/5">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor size={16} className="text-red-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Display logic</span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        {adminLang === 'hi'
                            ? 'ये वीडियो सीधे लैंडिंग पेज के मुख्य वीडियो प्लेयर में दिखेंगे। आप YouTube लिंक या डायरेक्ट वीडियो फाइल (R2 पर अपलोड) का उपयोग कर सकते हैं।'
                            : 'These videos will appear directly in the main video player on the landing page. You can use YouTube links or direct video files which will be uploaded to Cloudflare R2.'}
                    </p>
                </div>
                <Video size={120} className="absolute -right-10 -bottom-10 opacity-5 -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
            </div>

            {/* Videos List */}
            <div className="space-y-4">
                {videos.map((video, index) => {
                    const isYoutube = video.url.includes('youtube.com') || video.url.includes('youtu.be');
                    const previewThumb = getVideoThumbnail(video.url, video.thumbnail);

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm"
                        >
                            <div
                                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                            >
                                <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-white/10">
                                    <img src={previewThumb} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-900 dark:text-white truncate">
                                        {video.title || `Video #${index + 1}`}
                                    </p>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                            {isYoutube ? <Youtube size={10} className="text-red-600" /> : <Video size={10} className="text-blue-500" />}
                                            {isYoutube ? 'YouTube' : 'Native/R2'}
                                        </div>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{video.url || 'No URL set'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeVideo(index); }}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 rounded-xl transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {expandedIndex === index ? <ChevronDown size={20} className="text-red-600" /> : <ChevronRight size={20} className="text-slate-300" />}
                                </div>
                            </div>

                            {expandedIndex === index && (
                                <div className="px-4 pb-6 border-t border-slate-100 dark:border-white/5 space-y-6 pt-6 animate-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Title */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                <Video size={12} /> Video Title
                                            </div>
                                            <input
                                                type="text"
                                                value={video.title}
                                                onChange={(e) => updateVideo(index, 'title', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-red-500 font-bold dark:text-white border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                                                placeholder="e.g. Breaking News Today"
                                            />
                                        </div>

                                        {/* URL */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                <LinkIcon size={12} /> Video Source URL
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={video.url}
                                                    onChange={(e) => updateVideo(index, 'url', e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-red-500 font-mono text-xs dark:text-white border border-transparent focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                                                    placeholder="Paste YouTube or Video URL here"
                                                />
                                                <label className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center group shadow-md" title="Upload Video File">
                                                    <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                if (file.size > 100 * 1024 * 1024) { // 100MB limit
                                                                    toast.error('Video file is too large (max 100MB)');
                                                                    return;
                                                                }
                                                                const reader = new FileReader();
                                                                reader.onload = (re) => {
                                                                    updateVideo(index, 'url', re.target.result);
                                                                };
                                                                reader.readAsDataURL(file);
                                                                toast.success('Video file selected. It will be uploaded to R2 on save.');
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Thumbnail (Optional) */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                <Upload size={12} /> Custom Thumbnail (Optional)
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={video.thumbnail}
                                                    onChange={(e) => updateVideo(index, 'thumbnail', e.target.value)}
                                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-red-500 font-mono text-xs dark:text-white border border-transparent focus:bg-white transition-all shadow-inner"
                                                    placeholder="URL or Upload"
                                                />
                                                <label className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center group shadow-md" title="Upload Image">
                                                    <Upload size={18} className="group-hover:scale-110 transition-transform" />
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => handleFileUpload(e, index, 'thumbnail')}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Duration & Author */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                    <Eye size={12} /> Duration
                                                </div>
                                                <input
                                                    type="text"
                                                    value={video.duration}
                                                    onChange={(e) => updateVideo(index, 'duration', e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-red-500 font-bold dark:text-white border border-transparent focus:bg-white transition-all shadow-inner"
                                                    placeholder="e.g. 10:45"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                                                    <User size={12} /> Author / Channel
                                                </div>
                                                <input
                                                    type="text"
                                                    value={video.author}
                                                    onChange={(e) => updateVideo(index, 'author', e.target.value)}
                                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-red-500 font-bold dark:text-white border border-transparent focus:bg-white transition-all shadow-inner"
                                                    placeholder="Mitaan Express"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Block */}
                                    {video.url && (
                                        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Video Preview</p>
                                            <div className="aspect-video max-w-sm rounded-xl overflow-hidden shadow-2xl relative group bg-black border border-white/10">
                                                <img src={previewThumb} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-xl shadow-red-600/30">
                                                        <Video size={20} className="text-white fill-white" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-black text-white">{video.duration}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Add New Video */}
            <button
                onClick={addVideo}
                className="w-full p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900/30 transition-all group bg-white/50 dark:bg-transparent"
            >
                <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                <span className="font-black text-sm uppercase tracking-[0.2em]">
                    {adminLang === 'hi' ? 'नया वीडियो जोड़ें' : 'Add New Video Link'}
                </span>
            </button>
        </div>
    );
};

export default AdminLive;
