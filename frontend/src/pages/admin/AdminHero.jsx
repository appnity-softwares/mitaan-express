import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useCreateMedia } from '../../hooks/useMedia';
import { 
    Layout, Image as ImageIcon, Plus, Trash2, Save, Move, 
    ArrowRight, Smartphone, Monitor, Sparkles, Upload, 
    ChevronLeft, ChevronRight, Zap, Target, Eye, X,
    RefreshCcw, AlertTriangle, CheckCircle2, PenTool
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminHero = () => {
    const { data: initialData, isLoading: initialLoading } = useSettings();
    const updateMutation = useUpdateSettings();
    const createMediaMutation = useCreateMedia();

    const [slides, setSlides] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [autoPlay, setAutoPlay] = useState(true);

    useEffect(() => {
        if (initialData?.hero_promo_slides) {
            try {
                setSlides(JSON.parse(initialData.hero_promo_slides));
            } catch (e) {
                console.error('Failed to parse slides:', e);
                setSlides([]);
            }
        }
    }, [initialData]);

    // Auto-advance preview
    useEffect(() => {
        if (!autoPlay || slides.length <= 1) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, slides.length]);

    const handleSave = async () => {
        const toastId = toast.loading('Publishing hero configuration...');
        try {
            await updateMutation.mutateAsync({
                hero_promo_slides: JSON.stringify(slides)
            });
            toast.success('Homepage Hero is now live!', { id: toastId });
        } catch (error) {
            toast.error('Sync failed: ' + error.message, { id: toastId });
        }
    };

    const addSlide = () => {
        const newSlide = {
            id: Date.now(),
            title: 'New Headline',
            image_url: '',
            link_url: '',
            button_text: 'EXPLORE NOW',
            enabled: true,
            tag: 'FEATURED'
        };
        const newSlides = [...slides, newSlide];
        setSlides(newSlides);
        setActiveIndex(newSlides.length - 1);
        toast.success('New slide initialized.');
    };

    const removeSlide = (id) => {
        if (slides.length <= 1) {
            toast.error('At least one slide is required for stability.');
            return;
        }
        setSlides(slides.filter(s => s.id !== id || (s.id === undefined && slides.indexOf(s) !== id))); 
        // Note: handles both id-based and index-based (legacy)
        if (activeIndex >= slides.length - 1) setActiveIndex(0);
    };

    const updateSlide = (index, field, value) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const handleMediaUpload = async (e, index) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Processing visual asset...');
        try {
            const fmData = new FormData();
            fmData.append('file', file);
            fmData.append('type', 'IMAGE');
            fmData.append('title', `hero-slide-${index}`);
            fmData.append('category', 'HERO');

            const result = await createMediaMutation.mutateAsync({ payload: fmData });
            updateSlide(index, 'image_url', result.url);
            toast.success('Asset synchronized.', { id: toastId });
        } catch (error) {
            toast.error('Upload failed: ' + error.message, { id: toastId });
        } finally {
            e.target.value = '';
        }
    };

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                <RefreshCcw className="text-red-600" size={48} />
            </motion.div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Loading Visual Command Center...</p>
        </div>
    );

    const currentSlide = slides[activeIndex] || {};

    return (
        <div className="max-w-[1600px] mx-auto p-4 lg:p-8 pb-32">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                        <Sparkles className="text-red-600" size={32} />
                        Hero Experience Manager
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 uppercase text-[10px] tracking-widest">
                        Design the first impression. Live preview system for homeland slides.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex p-1 bg-slate-200 dark:bg-white/5 rounded-2xl mr-4">
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2.5 rounded-xl transition-all ${previewMode === 'desktop' ? 'bg-white dark:bg-slate-700 shadow-md text-red-600' : 'text-slate-400'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2.5 rounded-xl transition-all ${previewMode === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-md text-red-600' : 'text-slate-400'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        className="px-10 py-4 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-500/30 transition-all flex items-center gap-3 active:scale-95"
                    >
                        {updateMutation.isPending ? 'Syncing Server...' : 'Commit Changes'}
                        <Save size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Visual Mockup - LEFT (STICKY) */}
                <div className="xl:col-span-12">
                    <div className="relative group p-1 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 rounded-[3rem] shadow-2xl overflow-hidden mb-12">
                        <div className="bg-slate-50 dark:bg-[#0b0f1a] rounded-[2.8rem] overflow-hidden relative">
                            {/* Browser/Site Mockup Header */}
                            <div className="h-14 border-b border-slate-200 dark:border-white/5 flex items-center px-8 justify-between bg-white/50 dark:bg-white/5 backdrop-blur-xl">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400/30" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/30" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/30" />
                                </div>
                                <div className="hidden md:flex gap-6">
                                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                </div>
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10" />
                            </div>

                            {/* THE ACTUAL PREVIEW */}
                            <div className={`relative transition-all duration-700 ease-in-out mx-auto overflow-hidden shadow-2xl ${previewMode === 'mobile' ? 'max-w-[375px] aspect-[9/16] mt-8 mb-8 rounded-[3rem] border-[8px] border-slate-800' : 'w-full aspect-[21/9]'}`}>
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={activeIndex}
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1 }}
                                        className="absolute inset-0"
                                    >
                                        {currentSlide.image_url ? (
                                            <img src={currentSlide.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-12 text-center">
                                                <ImageIcon size={48} className="text-slate-400 mb-4 animate-pulse" />
                                                <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Awaiting Visual Media...</p>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        
                                        {/* Content Preview Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-8 lg:p-16 space-y-4">
                                            <motion.span 
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className="inline-block px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl"
                                            >
                                                {currentSlide.tag || 'SYSTEM'}
                                            </motion.span>
                                            <motion.h1 
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                                className={`font-black text-white leading-tight uppercase tracking-tighter ${previewMode === 'mobile' ? 'text-3xl' : 'text-5xl lg:text-7xl max-w-4xl'}`}
                                            >
                                                {currentSlide.title || 'Headline Placeholder'}
                                            </motion.h1>
                                            <motion.div 
                                                initial={{ y: 20, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="flex pt-4"
                                            >
                                                <div className="px-8 py-3.5 bg-white text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3">
                                                    {currentSlide.button_text || 'LEARN MORE'}
                                                    <ArrowRight size={16} />
                                                </div>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Dots Mockup */}
                                <div className="absolute bottom-8 right-8 flex gap-2">
                                    {slides.map((_, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => { setActiveIndex(i); setAutoPlay(false); }}
                                            className={`h-1.5 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-red-600' : 'w-2 bg-white/30'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SLIDES LIST - SIDEBAR */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Story Deck</h3>
                        <button 
                            onClick={addSlide}
                            className="p-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-xl"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    <Reorder.Group axis="y" values={slides} onReorder={setSlides} className="space-y-4">
                        {slides.map((slide, index) => (
                            <Reorder.Item 
                                key={slide.id || index} 
                                value={slide}
                                className={`group relative p-5 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl border-2 transition-all cursor-grab active:cursor-grabbing ${activeIndex === index ? 'border-red-500 shadow-2xl shadow-red-500/10' : 'border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-lg shadow-black/5'}`}
                                onClick={() => setActiveIndex(index)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all ${activeIndex === index ? 'bg-red-600 text-white scale-110 shadow-lg shadow-red-600/30' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-black text-xs uppercase tracking-wider truncate mb-1 ${activeIndex === index ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                            {slide.title || 'Untitled Slide'}
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${activeIndex === index ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-500'}`}>
                                                {slide.tag || 'SYSTEM'}
                                            </span>
                                            {slide.enabled === false && (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Hidden</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeSlide(slide.id || index); }}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="text-slate-300 group-hover:text-slate-400">
                                            <Move size={18} />
                                        </div>
                                    </div>
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>

                {/* EDITOR PANEL - BOTTOM/RIGHT */}
                <div className="xl:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden"
                        >
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/5 blur-[100px] pointer-events-none" />

                            <div className="relative z-10 space-y-10">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-white/5 pb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                            <PenTool className="text-red-600" size={24} />
                                            Slide Configuration
                                        </h3>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Refining slot #{activeIndex + 1}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-white/10">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 ${currentSlide.enabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {currentSlide.enabled ? 'Active Broadcast' : 'Invisible'}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={currentSlide.enabled !== false}
                                                onChange={(e) => updateSlide(activeIndex, 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Text Content */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Headline Translation</label>
                                            <textarea 
                                                value={currentSlide.title}
                                                onChange={(e) => updateSlide(activeIndex, 'title', e.target.value)}
                                                rows="3"
                                                placeholder="Enter a powerful headline..."
                                                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-red-500 rounded-[2rem] outline-none transition-all text-lg font-black text-slate-900 dark:text-white resize-none shadow-inner"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Context Tag</label>
                                                <input 
                                                    value={currentSlide.tag}
                                                    onChange={(e) => updateSlide(activeIndex, 'tag', e.target.value)}
                                                    placeholder="e.g. BREAKING"
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all text-xs font-black uppercase tracking-widest shadow-inner"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Action Label</label>
                                                <input 
                                                    value={currentSlide.button_text}
                                                    onChange={(e) => updateSlide(activeIndex, 'button_text', e.target.value)}
                                                    placeholder="CTA Label"
                                                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all text-xs font-black shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual & Linking */}
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Creative Visual Asset</label>
                                            <div className="flex gap-3">
                                                <input 
                                                    value={currentSlide.image_url}
                                                    onChange={(e) => updateSlide(activeIndex, 'image_url', e.target.value)}
                                                    placeholder="Paste Image URL..."
                                                    className="flex-1 px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all text-xs font-mono shadow-inner"
                                                />
                                                <label className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/5">
                                                    <Upload size={20} />
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, activeIndex)} />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Navigation Target</label>
                                            <div className="relative group">
                                                <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                                                <input 
                                                    value={currentSlide.link_url}
                                                    onChange={(e) => updateSlide(activeIndex, 'link_url', e.target.value)}
                                                    placeholder="https://... or /local-path"
                                                    className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-red-500 rounded-2xl outline-none transition-all text-xs font-mono shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-[2rem] border border-red-100 dark:border-red-500/10 flex items-start gap-4">
                                            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Expert Hint</p>
                                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                    "High contrast images work best. Use the target focal point in the right 60% of the image for optimal text legibility."
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Action Bar (Mobile Only) */}
            <div className="fixed bottom-8 left-8 right-8 z-50 xl:hidden">
                <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4"
                >
                    {updateMutation.isPending ? 'Syncing...' : 'Sync Live Slides'}
                    <Save size={20} />
                </button>
            </div>
        </div>
    );
};

export default AdminHero;
