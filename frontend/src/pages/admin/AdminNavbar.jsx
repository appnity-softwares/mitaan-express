import React, { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
    Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, 
    Eye, Star, Info, Home, Mail, Feather, FileText, BookOpen, 
    Globe, Heart as HeartIcon, Trophy, Users, Image as ImageIcon, Video,
    Menu, TrendingUp, FolderTree, Zap, Search, Languages, Sun, Moon
} from 'lucide-react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import toast from 'react-hot-toast';

const ICON_OPTIONS = [
    'Home', 'Info', 'ImageIcon', 'Video', 'Mail', 'Feather', 'FileText',
    'BookOpen', 'Star', 'Globe', 'Heart', 'Trophy', 'Users'
];

const AdminNavbar = () => {
    const { adminLang } = useAdminTranslation();
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [items, setItems] = useState([]);
    const [headerOrderIds, setHeaderOrderIds] = useState([]);
    const [headerSegments, setHeaderSegments] = useState([]);
    const [headerRightSegments, setHeaderRightSegments] = useState([]);
    const [saving, setSaving] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);

    const defaultItems = [
        { id: 'home', name: 'Home', nameHi: 'मुख्य पृष्ठ', icon: 'Home', order: 0 },
        { id: 'about', name: 'About Us', nameHi: 'हमारे बारे में', icon: 'Info', order: 1 },
        { id: 'gallery', name: 'Gallery', nameHi: 'गैलरी', icon: 'ImageIcon', pageKey: 'page_gallery_enabled', order: 2 },
        { id: 'video', name: 'Videos', nameHi: 'वीडियो', icon: 'Video', pageKey: 'page_live_enabled', order: 3 },
        { id: 'contact', name: 'Contact Us', nameHi: 'संपर्क करें', icon: 'Mail', order: 4 },
        { id: 'poetry', name: 'Poetry', nameHi: 'काव्य', icon: 'Feather', pageKey: 'page_poetry_enabled', order: 5 },
        { id: 'insights', name: 'Blog', nameHi: 'ब्लॉग', icon: 'FileText', pageKey: 'page_blogs_enabled', order: 6 },
    ];

    useEffect(() => {
        if (settings?.navbar_items_json) {
            try {
                const parsed = JSON.parse(settings.navbar_items_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                } else {
                    setItems(defaultItems);
                }
            } catch (e) {
                setItems(defaultItems);
            }
        } else {
            setItems(defaultItems);
        }

        if (settings?.header_navbar_items) {
            setHeaderOrderIds(settings.header_navbar_items.split(',').filter(Boolean));
        } else {
            setHeaderOrderIds(['home', 'about', 'contact']);
        }

        // Initialize Header Layout Segments
        const segOrder = settings?.header_segment_order || 'menu,home,news,categories,info';
        setHeaderSegments(segOrder.split(',').map(s => s.trim()).filter(Boolean));

        const rightSegOrder = settings?.header_right_order || 'live,search,lang,theme';
        setHeaderRightSegments(rightSegOrder.split(',').map(s => s.trim()).filter(Boolean));

    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMutation.mutateAsync({
                navbar_items_json: JSON.stringify(items),
                header_navbar_items: headerOrderIds.join(','),
                header_segment_order: headerSegments.join(','),
                header_right_order: headerRightSegments.join(',')
            });
            toast.success(adminLang === 'hi' ? 'नेवबार सेव हो गया!' : 'Navbar saved successfully!');
        } catch (error) {
            toast.error('Failed to save');
        }
        setSaving(false);
    };

    const handleReset = () => {
        setItems(defaultItems);
        setHeaderOrderIds(['home', 'about', 'contact']);
        setHeaderSegments(['menu', 'home', 'news', 'categories', 'info']);
        setHeaderRightSegments(['live', 'search', 'lang', 'theme']);
        toast.success('Local reset! Click Save to persist.');
    };

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, {
            id: `custom-${Date.now()}`,
            name: 'New Page',
            nameHi: 'नया पेज',
            icon: 'Star',
            order: items.length,
            path: '/custom',
            children: []
        }]);
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
        setHeaderOrderIds(headerOrderIds.filter(hid => hid !== id));
    };

    const addChild = (parentIndex) => {
        const newItems = [...items];
        if (!newItems[parentIndex].children) newItems[parentIndex].children = [];
        newItems[parentIndex].children.push({
            name: 'Sub Page',
            nameHi: 'सब पेज',
            path: '/sub-page',
            id: `sub-${Date.now()}`
        });
        setItems(newItems);
    };

    const updateChild = (parentIndex, childIndex, field, value) => {
        const newItems = [...items];
        newItems[parentIndex].children[childIndex] = {
            ...newItems[parentIndex].children[childIndex],
            [field]: value
        };
        setItems(newItems);
    };

    const removeChild = (parentIndex, childIndex) => {
        const newItems = [...items];
        newItems[parentIndex].children = newItems[parentIndex].children.filter((_, i) => i !== childIndex);
        setItems(newItems);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold italic animte-pulse">Syncing Portal Architecture...</div>;

    const navIconMap = { Home, Info, ImageIcon, Video, Mail, Feather, FileText, BookOpen, Star, Globe, Heart: HeartIcon, Trophy, Users };

    return (
        <div className="p-4 lg:p-10 space-y-10 max-w-6xl mx-auto">
            {/* Glossy Header Section */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-red-600 rounded-2xl shadow-lg shadow-red-600/30 text-white">
                            <GripVertical size={24} />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            {adminLang === 'hi' ? 'नेवबार मास्टर' : 'Navbar Master'}
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest ml-14">
                        {adminLang === 'hi' ? 'ड्रैग-एंड-ड्रॉप से वेबसाइट का क्रम बदलें' : 'Intelligent Drag & Drop Portal Architect'}
                    </p>
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={handleReset}
                        className="px-6 py-4 bg-slate-200/50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-slate-200 transition active:scale-95"
                    >
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-10 py-4 bg-red-600 text-white font-black rounded-3xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition flex items-center gap-3 shadow-xl shadow-red-600/30 disabled:opacity-50 active:scale-95 group"
                    >
                        {saving ? 'Synchronizing...' : (
                            <>
                                <Save size={16} className="group-hover:rotate-12 transition-transform" />
                                {adminLang === 'hi' ? 'हार्डवेयर सेव करें' : 'Apply Architecture'}
                            </>
                        )}
                    </button>
                </div>
                
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Side Menu Manager */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-6">
                        <div className="flex items-center gap-3">
                            <Info size={16} className="text-red-600" />
                            <h3 className="font-black text-[11px] uppercase text-slate-400 tracking-[0.3em]">Portal Side-Menu Layout</h3>
                        </div>
                        <button onClick={addItem} className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-600/20 active:scale-95">
                            <Plus size={16} /> New Item
                        </button>
                    </div>

                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, index) => (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="relative bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:ring-2 ring-red-500/10 transition-all overflow-hidden group"
                                >
                                    <div className="p-6 flex items-center gap-6">
                                        <div className="cursor-grab active:cursor-grabbing p-3 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                            <GripVertical size={24} />
                                        </div>
                                        
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center text-red-600 dark:text-red-400 border border-slate-100 dark:border-white/5 shadow-inner">
                                            {(() => {
                                                const Icon = navIconMap[item.icon] || Star;
                                                return <Icon size={28} />;
                                            })()}
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Label (English / Hindi)</label>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        value={item.name} 
                                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl text-[13px] font-black dark:text-white outline-none focus:ring-4 ring-red-500/10 transition-all border border-transparent focus:border-red-500/20"
                                                        placeholder="English"
                                                    />
                                                    <input 
                                                        value={item.nameHi || ''} 
                                                        onChange={(e) => updateItem(index, 'nameHi', e.target.value)}
                                                        className="w-full bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl text-[13px] font-black dark:text-white outline-none focus:ring-4 ring-red-500/10 transition-all border border-transparent focus:border-red-500/20"
                                                        placeholder="हिन्दी"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest pl-1">Visual Config</label>
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        value={item.icon || 'Star'}
                                                        onChange={(e) => updateItem(index, 'icon', e.target.value)}
                                                        className="w-32 bg-slate-50 dark:bg-slate-900 px-3 py-3 rounded-2xl text-[11px] font-black dark:text-white outline-none border border-transparent focus:border-red-500/20 cursor-pointer"
                                                    >
                                                        {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                    <input 
                                                        value={item.path || ''} 
                                                        onChange={(e) => updateItem(index, 'path', e.target.value)}
                                                        placeholder="/destination-path"
                                                        className="flex-1 bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl text-[13px] font-bold dark:text-white outline-none focus:ring-4 ring-red-500/10 transition-all border border-transparent focus:border-red-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 border-l border-slate-100 dark:border-white/5 pl-6">
                                            <button
                                                onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                                                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all shadow-sm ${expandedItem === index ? 'bg-red-600 text-white shadow-red-600/20 rotate-90' : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 hover:text-slate-600'}`}
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="w-12 h-12 flex items-center justify-center bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-100 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedItem === index && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 p-8"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-red-600" />
                                                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Sub-Menu Architect</h4>
                                                </div>
                                                <button onClick={() => addChild(index)} className="px-5 py-2.5 bg-white dark:bg-slate-800 text-[10px] font-black uppercase text-red-600 rounded-xl hover:bg-red-50 transition shadow-sm border border-red-100 dark:border-white/5 flex items-center gap-2">
                                                    <Plus size={14} /> Add Dropdown Item
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {(item.children || []).map((child, cIdx) => (
                                                    <div key={cIdx} className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 gap-4 w-full">
                                                            <input value={child.name} onChange={(e) => updateChild(index, cIdx, 'name', e.target.value)} placeholder="Name (EN)" className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-xs font-black dark:text-white outline-none border border-transparent focus:border-red-500/20" />
                                                            <input value={child.nameHi} onChange={(e) => updateChild(index, cIdx, 'nameHi', e.target.value)} placeholder="नाम (हिन्दी)" className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-xs font-black dark:text-white outline-none border border-transparent focus:border-red-500/20" />
                                                            <input value={child.path} onChange={(e) => updateChild(index, cIdx, 'path', e.target.value)} placeholder="/custom-path" className="bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-xs font-bold dark:text-white outline-none border border-transparent focus:border-red-500/20" />
                                                        </div>
                                                        <button onClick={() => removeChild(index, cIdx)} className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(item.children || []).length === 0 && (
                                                    <div className="text-center py-10 bg-white/50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic opacity-50">This page has no sub-directories.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </Reorder.Item>
                            ))}
                        </AnimatePresence>
                    </Reorder.Group>
                </div>

                {/* Header Management & Segment Layout */}
                <div className="space-y-8">
                    {/* NEW: Segment Reordering Section */}
                    <div className="px-4">
                        <h3 className="font-black text-[11px] uppercase text-slate-400 tracking-[0.3em]">Header Design & Layout</h3>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Reorder major navigation segments</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-white/5 p-8 shadow-2xl space-y-8">
                        {/* 1. Main Left/Center Segments */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-red-600 tracking-[0.2em] block pl-1">Primary Segments (Left/Center)</label>
                            <Reorder.Group axis="y" values={headerSegments} onReorder={setHeaderSegments} className="space-y-2">
                                {headerSegments.map((seg) => {
                                    const labels = {
                                        menu: { name: 'Slide Menu Toggle', icon: <Menu size={18} /> },
                                        home: { name: 'Home Navigation', icon: <Home size={18} /> },
                                        news: { name: 'News Dropdown', icon: <TrendingUp size={18} /> },
                                        categories: { name: 'Category Navigator', icon: <FolderTree size={18} /> },
                                        info: { name: 'Header Quick-Links Group', icon: <Info size={18} /> }
                                    };
                                    const config = labels[seg] || { name: seg.toUpperCase(), icon: <GripVertical size={18} /> };
                                    return (
                                        <Reorder.Item key={seg} value={seg} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-slate-900 transition-all group">
                                            <div className="text-slate-300 group-hover:text-red-500 transition-colors"><GripVertical size={18} /></div>
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 flex items-center justify-center text-red-600 shadow-sm">{config.icon}</div>
                                            <span className="text-[11px] font-black uppercase tracking-tight dark:text-white">{config.name}</span>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>

                        {/* 2. Right Side Actions */}
                        <div className="space-y-4">
                            <label className="text-[11px] font-black uppercase text-red-600 tracking-[0.2em] block pl-1">Action Registry (Right Side)</label>
                            <Reorder.Group axis="y" values={headerRightSegments} onReorder={setHeaderRightSegments} className="space-y-2">
                                {headerRightSegments.map((seg) => {
                                    const labels = {
                                        live: { name: 'Live Traffic Meter', icon: <Zap size={18} /> },
                                        search: { name: 'Smart Search Button', icon: <Search size={18} /> },
                                        lang: { name: 'Language Engine', icon: <Languages size={18} /> },
                                        theme: { name: 'Theme Architect', icon: <Sun size={18} /> }
                                    };
                                    const config = labels[seg] || { name: seg.toUpperCase(), icon: <GripVertical size={18} /> };
                                    return (
                                        <Reorder.Item key={seg} value={seg} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-white dark:hover:bg-slate-900 transition-all group">
                                            <div className="text-slate-300 group-hover:text-red-500 transition-colors"><GripVertical size={18} /></div>
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 flex items-center justify-center text-red-600 shadow-sm">{config.icon}</div>
                                            <span className="text-[11px] font-black uppercase tracking-tight dark:text-white">{config.name}</span>
                                        </Reorder.Item>
                                    );
                                })}
                            </Reorder.Group>
                        </div>
                    </div>

                    <div className="px-4">
                        <h3 className="font-black text-[11px] uppercase text-slate-400 tracking-[0.3em]">Header Quick-Links</h3>
                        <p className="text-[10px] font-bold text-slate-500 mt-1">Pinned icons in the 'Quick-Links Group' segment</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-white/5 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-10 relative overflow-hidden">
                        <div className="space-y-3 relative z-10">
                            <label className="text-[11px] font-black uppercase text-red-600 tracking-[0.2em] block pl-1">Pin New Page</label>
                            <div className="relative">
                                <select 
                                    onChange={(e) => {
                                        if (!e.target.value) return;
                                        if (!headerOrderIds.includes(e.target.value)) setHeaderOrderIds([...headerOrderIds, e.target.value]);
                                        e.target.value = '';
                                    }}
                                    className="w-full pl-6 pr-12 py-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] outline-none border-2 border-transparent focus:border-red-600/30 text-sm font-black dark:text-white appearance-none transition-all shadow-inner"
                                >
                                    <option value="">Select page to pin...</option>
                                    {items.filter(i => !headerOrderIds.includes(i.id)).map(i => (
                                        <option key={i.id} value={i.id}>{adminLang === 'hi' ? (i.nameHi || i.name) : i.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-widest pl-1">Quick-Link Order</h4>
                                <span className="text-[10px] font-black bg-red-50 text-red-600 px-3 py-1 rounded-full uppercase tracking-widest">{headerOrderIds.length} Pinned</span>
                            </div>
                            
                            <Reorder.Group axis="y" values={headerOrderIds} onReorder={setHeaderOrderIds} className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {headerOrderIds.map((hid) => {
                                        const item = items.find(i => i.id === hid);
                                        if (!item) return null;
                                        const Icon = navIconMap[item.icon] || Star;
                                        return (
                                            <Reorder.Item
                                                key={hid}
                                                value={hid}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:ring-2 ring-red-500/20 active:shadow-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-red-500 transition-colors">
                                                        <GripVertical size={20} />
                                                    </div>
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-red-600 shadow-sm">
                                                        <Icon size={18} />
                                                    </div>
                                                    <span className="font-black text-xs uppercase tracking-tight dark:text-white truncate max-w-[120px]">
                                                        {adminLang === 'hi' ? (item.nameHi || item.name) : item.name}
                                                    </span>
                                                </div>
                                                <button onClick={() => setHeaderOrderIds(headerOrderIds.filter(x => x !== hid))} className="p-3 bg-red-50/50 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-2xl transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </Reorder.Item>
                                        );
                                    })}
                                </AnimatePresence>
                                {headerOrderIds.length === 0 && (
                                    <div className="py-20 text-center border-4 border-dashed border-slate-50 dark:border-white/5 rounded-[3rem] space-y-4">
                                        <div className="flex justify-center"><Star size={40} className="text-slate-100 dark:text-slate-700" /></div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">No active pins</p>
                                    </div>
                                )}
                            </Reorder.Group>
                        </div>
                        
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    {/* Preview Live Mode */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-blue-600/40 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <Eye size={32} />
                            </div>
                            <h4 className="font-black text-xl uppercase tracking-tighter mb-2 italic">Architecture Live Mode</h4>
                            <p className="text-xs font-medium leading-relaxed opacity-80 text-blue-50 mb-8 max-w-[240px]">
                                Modifications on the left redefine your **Side Menu**, while the right panel orchestrates your **Header Quick-links**. 
                            </p>
                            <a href="/" target="_blank" className="w-full py-4 bg-white text-blue-600 text-xs font-black uppercase tracking-widest rounded-3xl hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3">
                                Initialize Portal <Globe size={18} />
                            </a>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-900/40 rounded-full -ml-16 -mb-16 blur-3xl" />
                    </div>
                </div>
            </div>
            
            {/* Legend / Info */}
            <div className="bg-slate-900 dark:bg-slate-800 text-white/40 p-10 rounded-[3rem] flex flex-wrap gap-10 items-center justify-center text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-600" /> SIDE MENU (LEFT)
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600" /> HEADER LINKS (RIGHT)
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-600" /> REAL-TIME PREVIEW
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-600" /> STABLE ENCRYPTION
                </div>
            </div>
        </div>
    );
};

export default AdminNavbar;
