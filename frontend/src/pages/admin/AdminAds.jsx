import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useCreateMedia } from '../../hooks/useMedia';
import { 
    DollarSign, Image as ImageIcon, Link as LinkIcon, Upload, 
    Zap, X, Layout, Monitor, Smartphone, Eye, Info, CheckCircle2,
    ArrowRight, Sparkles, Sidebar as SidebarIcon, AlignJustify, Plus
} from 'lucide-react';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminAds = () => {
    const { t } = useAdminTranslation();
    const { data: initialData, isLoading: initialLoading } = useSettings();
    const updateMutation = useUpdateSettings();
    const createMediaMutation = useCreateMedia();

    const [settings, setSettings] = useState({
        ad_homepage_top_image_url: '',
        ad_homepage_top_link_url: '',
        ad_homepage_top_enabled: 'false',
        ad_sidebar_image_url: '',
        ad_sidebar_link_url: '',
        ad_sidebar_enabled: 'false',
        ad_article_bottom_image_url: '',
        ad_article_bottom_link_url: '',
        ad_article_bottom_enabled: 'false',
        ad_in_article_image_url: '',
        ad_in_article_link_url: '',
        ad_in_article_enabled: 'false',
        ad_skyscraper_image_url: '',
        ad_skyscraper_link_url: '',
        ad_skyscraper_enabled: 'false',
        ad_sidebar_type: 'promo',
        ad_sidebar_promo_title: '',
        ad_sidebar_promo_subtitle: '',
        ad_sidebar_promo_cta: '',
        ad_sidebar_promo_link: '',
        ad_popup_enabled: 'false',
        ad_popup_type: 'promo',
        ad_popup_image_url: '',
        ad_popup_link_url: '',
        // Generic Type support
        ad_homepage_top_type: 'ad',
        ad_in_article_type: 'ad',
        ad_article_bottom_type: 'ad',
        ad_skyscraper_type: 'ad',
    });

    const [activeSection, setActiveSection] = useState('homepage_top');
    const [previewMode, setPreviewMode] = useState('desktop');
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        if (initialData) {
            setSettings(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAds = async () => {
        const toastId = toast.loading('Synchronizing ad placements...');
        try {
            await updateMutation.mutateAsync(settings);
            toast.success('Advertisements live on site!', { id: toastId });
        } catch (error) {
            toast.error('Failed to update: ' + error.message, { id: toastId });
        }
    };

    const handleMediaUpload = async (e, key) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const toastId = toast.loading('Uploading asset...');
        try {
            const fmData = new FormData();
            fmData.append('file', file);
            fmData.append('type', 'IMAGE');
            fmData.append('title', `ad-${key}`);
            fmData.append('category', 'ADS');

            const result = await createMediaMutation.mutateAsync({ payload: fmData });
            setSettings(prev => ({ ...prev, [key]: result.url }));
            toast.success('Image ready for placement.', { id: toastId });
        } catch (error) {
            toast.error('Upload failed: ' + error.message, { id: toastId });
        } finally {
            e.target.value = '';
        }
    };

    if (initialLoading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <RefreshCcw className="text-red-600" size={40} />
            </motion.div>
        </div>
    );

    const AD_SLOTS = [
        { id: 'homepage_top', label: 'Homepage Header', dims: '728x90', icon: <AlignJustify size={16} />, fields: ['ad_homepage_top_image_url', 'ad_homepage_top_link_url', 'ad_homepage_top_enabled', 'ad_homepage_top_type'] },
        { id: 'in_article', label: 'Inside Article Body', dims: '728x90', icon: <Layout size={16} />, fields: ['ad_in_article_image_url', 'ad_in_article_link_url', 'ad_in_article_enabled', 'ad_in_article_type'] },
        { id: 'skyscraper', label: 'Article Sidebar (Tall)', dims: '160x600', icon: <SidebarIcon size={16} />, fields: ['ad_skyscraper_image_url', 'ad_skyscraper_link_url', 'ad_skyscraper_enabled', 'ad_skyscraper_type'] },
        { id: 'article_bottom', label: 'Article Footer', dims: '728x90', icon: <Layout size={16} />, fields: ['ad_article_bottom_image_url', 'ad_article_bottom_link_url', 'ad_article_bottom_enabled', 'ad_article_bottom_type'] },
        { id: 'popup', label: 'Global Alert Popup', dims: '600x400', icon: <Zap size={16} />, fields: ['ad_popup_image_url', 'ad_popup_link_url', 'ad_popup_enabled', 'ad_popup_type'] },
    ];

    return (
        <div className="max-w-[1600px] mx-auto p-3 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center justify-center lg:justify-start gap-3">
                        <DollarSign className="text-emerald-500" size={28} />
                        Advertisement Network
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base mt-2">Manage placements, banners, and promotional alerts across the platform.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => setDebugMode(!debugMode)}
                        className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${debugMode ? 'bg-amber-100 border-amber-500 text-amber-700 shadow-xl' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 hover:border-amber-300'}`}
                    >
                        <Eye size={16} />
                        {debugMode ? 'Exit Debug' : 'Visualize Areas'}
                        {debugMode && <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 rounded-full bg-amber-500" />}
                    </button>
                    <button 
                        onClick={handleSaveAds}
                        disabled={updateMutation.isPending}
                        className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {updateMutation.isPending ? 'Syncing...' : 'Publish Content'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                {/* Controls Column */}
                <div className="xl:col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:sticky lg:top-24 z-10 bg-slate-50/80 dark:bg-[#0b0f1a]/80 backdrop-blur-xl p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-white dark:border-white/5 shadow-2xl mb-8">
                    {/* Visual Navigation */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Placement Map</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {AD_SLOTS.map((slot) => (
                                <button
                                    key={slot.id}
                                    onClick={() => setActiveSection(slot.id)}
                                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex flex-row lg:flex-col items-center lg:items-start gap-3 md:gap-2 ${
                                        activeSection === slot.id 
                                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-500/20 scale-[1.02]' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-red-300'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg shrink-0 ${activeSection === slot.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        {slot.icon}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] font-black uppercase tracking-wider md:tracking-normal">{slot.label}</div>
                                        <div className={`text-[9px] font-bold ${activeSection === slot.id ? 'text-red-100' : 'text-slate-400'}`}>
                                            {settings[slot.fields[2]] === 'true' ? 'Active' : 'Disabled'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview Mockup */}
                    <div className="relative group">
                         <div className="absolute -inset-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <div className="relative bg-slate-200 dark:bg-slate-950 rounded-[2rem] border border-slate-300 dark:border-white/10 overflow-hidden aspect-[16/10] shadow-inner p-4 flex flex-col">
                             {/* Browser Top Bar */}
                             <div className="flex items-center gap-1.5 mb-2 px-1">
                                 <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                 <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                 <div className="ml-4 h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                             </div>
                             
                             {/* Site Structure Mockup */}
                             <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl overflow-y-auto p-2 space-y-2 border border-slate-100 dark:border-white/5 scrollbar-hide">
                                 {/* Navbar */}
                                 <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center px-4 justify-between border border-slate-200 dark:border-white/5">
                                     <div className="w-12 h-2 bg-red-500 rounded-full"></div>
                                     <div className="flex gap-2">
                                         <div className="w-8 h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                         <div className="w-8 h-2 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                                     </div>
                                 </div>

                                 {/* Mock Content */}
                                 <div className="space-y-3 p-2">
                                     {/* Slot: Homepage Top */}
                                     <motion.div 
                                        animate={{ 
                                            scale: activeSection === 'homepage_top' ? 1.05 : 1,
                                            boxShadow: activeSection === 'homepage_top' ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none'
                                        }}
                                        className={`h-12 rounded-lg border-2 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter relative transition-all ${
                                            debugMode ? 'border-amber-500 border-dotted bg-amber-500/5' : 
                                            settings.ad_homepage_top_enabled === 'true' 
                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400/50 text-emerald-600' 
                                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-300'
                                        }`}
                                     >
                                         {debugMode ? (
                                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/10 rounded-lg">
                                                 <span className="text-amber-700">TOP BANNER</span>
                                                 <span className="text-[8px] font-bold text-amber-600 opacity-60">728 x 90 PX</span>
                                             </div>
                                         ) : 'Homepage Top Banner'}
                                     </motion.div>

                                     <div className="grid grid-cols-12 gap-3">
                                         {/* Main Content */}
                                         <div className="col-span-8 space-y-3">
                                             <div className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
                                             
                                             {/* Slot: In-Article */}
                                             <motion.div 
                                                animate={{ 
                                                    scale: activeSection === 'in_article' ? 1.05 : 1,
                                                    boxShadow: activeSection === 'in_article' ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none'
                                                }}
                                                className={`h-20 rounded-lg border-2 flex items-center justify-center text-[8px] font-black uppercase text-center p-2 leading-tight relative transition-all ${
                                                    debugMode ? 'border-amber-500 border-dotted bg-amber-500/5' :
                                                    settings.ad_in_article_enabled === 'true' 
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400/50 text-emerald-600' 
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-300'
                                                }`}
                                             >
                                                 {debugMode ? (
                                                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/10 rounded-lg">
                                                         <span className="text-amber-700">IN-ARTICLE</span>
                                                         <span className="text-[7px] font-bold text-amber-600 opacity-60">728 x 90 (Auto-Scale)</span>
                                                     </div>
                                                 ) : 'Internal Article Banner'}
                                             </motion.div>

                                             <div className="h-16 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>

                                             {/* Slot: Article Bottom */}
                                             <motion.div 
                                                animate={{ 
                                                    scale: activeSection === 'article_bottom' ? 1.05 : 1,
                                                    boxShadow: activeSection === 'article_bottom' ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none'
                                                }}
                                                className={`h-16 rounded-lg border-2 flex items-center justify-center text-[8px] font-black uppercase text-center p-2 leading-tight relative transition-all ${
                                                    debugMode ? 'border-amber-500 border-dotted bg-amber-500/5' :
                                                    settings.ad_article_bottom_enabled === 'true' 
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400/50 text-emerald-600' 
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-300'
                                                }`}
                                             >
                                                 {debugMode ? (
                                                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/10 rounded-lg">
                                                         <span className="text-amber-700">FOOTER BANNER</span>
                                                         <span className="text-[7px] font-bold text-amber-600 opacity-60">728 x 90 PX</span>
                                                     </div>
                                                 ) : 'Article Footer Ad'}
                                             </motion.div>
                                         </div>

                                         {/* Sidebar */}
                                         <div className="col-span-4 space-y-3">
                                             <div className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-white/5"></div>
                                             
                                             {/* Slot: Skyscraper */}
                                             <motion.div 
                                                animate={{ 
                                                    scale: activeSection === 'skyscraper' ? 1.05 : 1,
                                                    boxShadow: activeSection === 'skyscraper' ? '0 0 20px rgba(220, 38, 38, 0.4)' : 'none'
                                                }}
                                                className={`h-60 rounded-lg border-2 flex items-center justify-center text-center [writing-mode:vertical-rl] text-[10px] font-black uppercase rotate-180 p-2 relative transition-all ${
                                                    debugMode ? 'border-amber-500 border-dotted bg-amber-500/5' :
                                                    settings.ad_skyscraper_enabled === 'true' 
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400/50 text-emerald-600' 
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/10 text-slate-300'
                                                }`}
                                             >
                                                 {debugMode ? (
                                                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/10 rounded-lg">
                                                         <span className="text-amber-700 mb-2">SKYSCRAPER</span>
                                                         <span className="text-[7px] font-bold text-amber-600 opacity-60">160 x 600 PX</span>
                                                     </div>
                                                 ) : 'Skyscraper'}
                                             </motion.div>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Slot: Popup Overlay Overlay */}
                             <AnimatePresence>
                                {activeSection === 'popup' && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-50 p-12"
                                    >
                                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/20 flex flex-col items-center justify-center p-4 text-center ring-4 ring-red-600 ring-offset-4 ring-offset-slate-900">
                                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 mb-2">
                                                <Zap size={20} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase dark:text-white">Global Alert Preview</p>
                                            <div className={`mt-2 w-full h-12 rounded-lg border-2 relative transition-all ${debugMode ? 'border-amber-500 border-dotted bg-amber-500/5' : settings.ad_popup_enabled === 'true' ? 'bg-emerald-50 border-emerald-400 text-emerald-600' : 'bg-slate-50 border-slate-300 text-slate-400'} flex items-center justify-center text-[8px] font-bold`}>
                                                {debugMode ? (
                                                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/10 rounded-lg">
                                                         <span className="text-amber-700">POPUP MODAL</span>
                                                         <span className="text-[6px] font-bold text-amber-600 opacity-60">600 x 400 PX</span>
                                                     </div>
                                                 ) : 'POPUP BANNER'}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                         </div>
                    </div>
                </div>

                {/* Editor Column */}
                <div className="xl:col-span-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
                        {AD_SLOTS.map((slot) => (
                            <section 
                                key={slot.id} 
                                className={`transition-all duration-500 overflow-hidden rounded-2xl md:rounded-[2.5rem] border ${
                                    activeSection === slot.id 
                                    ? 'bg-white dark:bg-slate-800 shadow-2xl border-red-500/50 p-5 md:p-8 col-span-1 md:col-span-2 lg:col-span-1' 
                                    : 'bg-white/40 dark:bg-white/5 border-transparent p-4 md:p-6'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center transition-all ${
                                            activeSection === slot.id ? 'bg-red-600 text-white translate-x-1' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                                        }`}>
                                            {React.cloneElement(slot.icon, { size: activeSection === slot.id ? (window.innerWidth < 768 ? 20 : 24) : 18 })}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className={`font-black text-[11px] md:text-sm uppercase tracking-wider transition-colors truncate ${
                                                activeSection === slot.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                                            }`}>
                                                {slot.label}
                                                <span className="hidden sm:inline-block ml-3 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded text-[9px] font-black text-slate-400 uppercase tracking-tighter shadow-sm border border-slate-200 dark:border-white/5">{slot.dims}</span>
                                            </h3>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{settings[slot.fields[2]] === 'true' ? 'Live on site' : 'Disabled.'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={settings[slot.fields[2]] === 'true'}
                                                onChange={(e) => setSettings(prev => ({ ...prev, [slot.fields[2]]: e.target.checked ? 'true' : 'false' }))}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                        </label>
                                        <button 
                                            onClick={() => setActiveSection(slot.id)}
                                            className={`p-2 transition-all ${activeSection === slot.id ? 'rotate-90 text-red-600' : 'text-slate-300'}`}
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                </div>

                                {activeSection === slot.id && (
                                    <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 w-fit mb-6">
                                        <button 
                                            onClick={() => setSettings(p => ({ ...p, [slot.fields[3]]: 'ad' }))}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings[slot.fields[3]] !== 'promo' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500'}`}
                                        >
                                            BANNER IMAGE
                                        </button>
                                        <button 
                                            onClick={() => setSettings(p => ({ ...p, [slot.fields[3]]: 'promo' }))}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${settings[slot.fields[3]] === 'promo' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500'}`}
                                        >
                                            RICH TEXT AD
                                        </button>
                                    </div>
                                )}

                                {activeSection === slot.id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {settings[slot.fields[3]] === 'promo' ? (
                                                <div className="space-y-4">
                                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Text Ad Content</label>
                                                    <input 
                                                        name={`ad_${slot.id}_promo_title`}
                                                        value={settings[`ad_${slot.id}_promo_title`] || ''}
                                                        onChange={handleChange}
                                                        placeholder="Headline (e.g. 50% Off Sale)"
                                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner"
                                                    />
                                                    <textarea 
                                                        name={`ad_${slot.id}_promo_subtitle`}
                                                        value={settings[`ad_${slot.id}_promo_subtitle`] || ''}
                                                        onChange={handleChange}
                                                        placeholder="Description..."
                                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-medium outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner h-24"
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <input 
                                                            name={`ad_${slot.id}_promo_cta`}
                                                            value={settings[`ad_${slot.id}_promo_cta`] || ''}
                                                            onChange={handleChange}
                                                            placeholder="Button Text"
                                                            className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-bold outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner"
                                                        />
                                                        <input 
                                                            name={slot.fields[1]}
                                                            value={settings[slot.fields[1]]}
                                                            onChange={handleChange}
                                                            placeholder="Link URL"
                                                            className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-mono outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Asset Configuration</label>
                                                    <div className="group relative">
                                                        <div className="flex gap-2">
                                                            <input 
                                                                name={slot.fields[0]}
                                                                value={settings[slot.fields[0]]}
                                                                onChange={handleChange}
                                                                placeholder="Banner Image URL..."
                                                                className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-mono outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner"
                                                            />
                                                            <label className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/5 dark:shadow-white/5">
                                                                <Upload size={20} />
                                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, slot.fields[0])} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-emerald-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                                        <input 
                                                            name={slot.fields[1]}
                                                            value={settings[slot.fields[1]]}
                                                            onChange={handleChange}
                                                            placeholder="Destination Link (https://...)"
                                                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-mono outline-none ring-2 ring-transparent focus:ring-red-500 shadow-inner"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="space-y-4">
                                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Live Representation</label>
                                                {settings[slot.fields[3]] === 'promo' ? (
                                                    <div className="aspect-video bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-center text-left">
                                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">Live Prediction</span>
                                                        <h4 className="text-xl font-bold text-white mb-2 leading-tight">{settings[`ad_${slot.id}_promo_title`] || 'Ad Headline'}</h4>
                                                        <p className="text-white/70 text-xs line-clamp-2 mb-6">{settings[`ad_${slot.id}_promo_subtitle`] || 'Detailed description of the offer...'}</p>
                                                        <div className="inline-block px-6 py-2 bg-white text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-full self-start">
                                                            {settings[`ad_${slot.id}_promo_cta`] || 'Learn More'}
                                                        </div>
                                                    </div>
                                                ) : settings[slot.fields[0]] ? (
                                                    <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 group cursor-zoom-in">
                                                        <img src={settings[slot.fields[0]]} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                            <Eye className="text-white" size={24} />
                                                        </div>
                                                        <button 
                                                            onClick={() => setSettings(p => ({ ...p, [slot.fields[0]]: '' }))}
                                                            className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-xl shadow-xl hover:bg-red-700 active:scale-90 transition-all z-20"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="aspect-video bg-slate-50 dark:bg-slate-900 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-8">
                                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                                                            <ImageIcon size={24} />
                                                        </div>
                                                        <p className="text-xs font-bold text-slate-500">Preview not available.<br/>Upload an image to see it live.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </section>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Sidebar Promo Specialist Section */}
            <div className="mt-12 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl md:rounded-[3rem] p-1 shadow-2xl overflow-hidden shadow-red-500/30">
                <div className="bg-white dark:bg-slate-900 rounded-[1.7rem] md:rounded-[2.7rem] p-5 md:p-8 lg:p-12 space-y-8 md:space-y-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 md:gap-6">
                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-red-600 shrink-0 flex items-center justify-center text-white shadow-xl shadow-red-500/40">
                                <Sparkles size={24} className="md:w-8 md:h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sidebar Specials</h3>
                                <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium">Configure specialized article sidebar cards.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
                             <select 
                                name="ad_sidebar_enabled"
                                value={settings.ad_sidebar_enabled}
                                onChange={handleChange}
                                className={`flex-1 lg:flex-none px-4 md:px-5 py-2.5 rounded-xl font-black text-[10px] md:text-xs uppercase outline-none transition-all cursor-pointer ${settings.ad_sidebar_enabled === 'true' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
                             >
                                <option value="true">Live on Sidebar</option>
                                <option value="false">Card Offline</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
                        <div className="lg:col-span-12 space-y-6 md:space-y-8">
                             <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/10 w-full sm:w-fit">
                                <button 
                                    onClick={() => setSettings(p => ({ ...p, ad_sidebar_type: 'promo' }))}
                                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all ${settings.ad_sidebar_type === 'promo' ? 'bg-white dark:bg-slate-700 shadow-md text-red-600' : 'text-slate-500'}`}
                                >
                                    RICH TEXT
                                </button>
                                <button 
                                    onClick={() => setSettings(p => ({ ...p, ad_sidebar_type: 'ad' }))}
                                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black transition-all ${settings.ad_sidebar_type === 'ad' ? 'bg-white dark:bg-slate-700 shadow-md text-red-600' : 'text-slate-500'}`}
                                >
                                    BANNER
                                </button>
                             </div>

                             <AnimatePresence mode="wait">
                                {settings.ad_sidebar_type === 'promo' ? (
                                    <motion.div 
                                        key="promo"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">App/Brand Name</label>
                                                <input type="text" name="ad_sidebar_promo_title" value={settings.ad_sidebar_promo_title} onChange={handleChange} className="w-full px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-bold shadow-inner" placeholder="Mitaan Express" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Marketing Pitch</label>
                                                <textarea name="ad_sidebar_promo_subtitle" value={settings.ad_sidebar_promo_subtitle} onChange={handleChange} className="w-full px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-medium shadow-inner h-20 md:h-24 resize-none" placeholder="Get real-time news alerts..." />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">CTA Label</label>
                                                    <input type="text" name="ad_sidebar_promo_cta" value={settings.ad_sidebar_promo_cta} onChange={handleChange} className="w-full px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-bold shadow-inner" placeholder="Download App" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Icon ID</label>
                                                    <input type="text" name="ad_sidebar_promo_icon" value={settings.ad_sidebar_promo_icon} onChange={handleChange} className="w-full px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-bold shadow-inner" placeholder="smartphone" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Redirect URL</label>
                                                <input type="text" name="ad_sidebar_promo_link" value={settings.ad_sidebar_promo_link} onChange={handleChange} className="w-full px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-mono shadow-inner" placeholder="https://..." />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="ad"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                                    >
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sidebar Image</label>
                                                <div className="flex gap-2">
                                                    <input name="ad_sidebar_image_url" value={settings.ad_sidebar_image_url} onChange={handleChange} className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-mono shadow-inner" placeholder="https://..." />
                                                    <label className="p-3 md:p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all">
                                                        <Upload size={20} />
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMediaUpload(e, 'ad_sidebar_image_url')} />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Sidebar Target</label>
                                                <input name="ad_sidebar_link_url" value={settings.ad_sidebar_link_url} onChange={handleChange} className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-red-500 text-sm font-mono shadow-inner" placeholder="https://..." />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            {settings.ad_sidebar_image_url ? (
                                                <div className="w-full max-w-xs relative group h-40 md:h-48 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                                                    <img src={settings.ad_sidebar_image_url} alt="Preview" className="w-full h-full object-cover" />
                                                    <button 
                                                        onClick={() => setSettings(p => ({ ...p, ad_sidebar_image_url: '' }))}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg shadow-xl hover:bg-red-700 transition-all z-20"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-full max-w-xs h-40 md:h-48 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-4">
                                                    <SidebarIcon className="text-slate-300 mb-2" size={28} />
                                                    <p className="text-[10px] font-black uppercase text-slate-400">Sidebar Preview</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                             </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center pb-20">
                <button 
                    onClick={handleSaveAds}
                    disabled={updateMutation.isPending}
                    className="group w-full max-w-md px-8 md:px-12 py-4 md:py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl md:rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                    {updateMutation.isPending ? 'Syncing...' : 'Finalize & Go Live'}
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <ArrowRight size={20} />
                    </motion.div>
                </button>
            </div>
        </div>
    );
};

export default AdminAds;
