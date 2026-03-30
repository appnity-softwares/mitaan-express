import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, ArrowUp, ArrowDown, Eye } from 'lucide-react';
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
    const [headerOrderIds, setHeaderOrderIds] = useState(['home', 'about']);
    const [saving, setSaving] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);

    const defaultItems = [
        { id: 'home', name: 'Home', nameHi: 'मुख्य पृष्ठ', icon: 'Home', order: 0 },
        { id: 'about', name: 'About Us', nameHi: 'हमारे बारे में', icon: 'Info', order: 1 },
        { id: 'gallery', name: 'Gallery', nameHi: 'गैलरी', icon: 'ImageIcon', pageKey: 'page_gallery_enabled', order: 2 },
        { id: 'video', name: 'Videos', nameHi: 'वीडियो', icon: 'Video', pageKey: 'page_live_enabled', order: 3 },
        { id: 'contact', name: 'Contact Us', nameHi: 'संपर्क करें', icon: 'Mail', order: 4 },
        { id: 'poetry', name: 'Poetry', nameHi: 'काव्य', icon: 'Feather', pageKey: 'page_poetry_enabled', order: 5 },
        { id: 'blogs', name: 'Blog', nameHi: 'ब्लॉग', icon: 'FileText', pageKey: 'page_blogs_enabled', order: 6 },
    ];

    useEffect(() => {
        if (settings?.navbar_items_json) {
            try {
                const parsed = JSON.parse(settings.navbar_items_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setItems(parsed);
                    return;
                }
            } catch (e) { }
        }
        setItems(defaultItems);
        if (settings?.header_navbar_items) {
            setHeaderOrderIds(settings.header_navbar_items.split(',').filter(Boolean));
        }
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMutation.mutateAsync({
                navbar_items_json: JSON.stringify(items),
                header_navbar_items: headerOrderIds.join(',')
            });
            toast.success(adminLang === 'hi' ? 'नेवबार सेव हो गया!' : 'Navbar saved successfully!');
        } catch (error) {
            toast.error('Failed to save');
        }
        setSaving(false);
    };

    const handleReset = async () => {
        setItems(defaultItems);
        setHeaderOrderIds(['home', 'about']);
        try {
            await updateMutation.mutateAsync({ navbar_items_json: '', header_navbar_items: 'home,about' });
            toast.success('Reset to default');
        } catch (e) { }
    };

    const moveItem = (index, direction) => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        newItems.forEach((item, i) => item.order = i);
        setItems(newItems);
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

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        newItems.forEach((item, i) => item.order = i);
        setItems(newItems);
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

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {adminLang === 'hi' ? 'नेवबार मैनेजर' : 'Navbar Manager'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {adminLang === 'hi' ? 'मेन्यू आइटम, क्रम, और ड्रॉपडाउन मैनेज करें' : 'Manage menu items, ordering, and dropdown submenus'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                        Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Navbar'}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-400">
                <strong>{adminLang === 'hi' ? 'निर्देश:' : 'Instructions:'}</strong>{' '}
                {adminLang === 'hi'
                    ? 'आप आइटम जोड़ सकते हैं, क्रम बदल सकते हैं, ड्रॉपडाउन सब-मेन्यू बना सकते हैं, और कस्टम पेज लिंक दे सकते हैं।'
                    : 'You can add items, reorder them, create dropdown sub-menus, and link to custom pages.'}
            </div>

            {/* Link Type Guide */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 p-5 space-y-3">
                <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">
                    {adminLang === 'hi' ? '🔗 पाथ गाइड: नेवलिंक कैसे जोड़ें' : '🔗 Path Guide: How to Link Content'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-black text-red-600 mb-1">{adminLang === 'hi' ? 'ब्लॉग लिंक करें' : 'Link to a Blog'}</p>
                        <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">/blog/your-blog-slug</code>
                        <p className="text-slate-500 mt-1">{adminLang === 'hi' ? 'ब्लॉग का slug पाथ में लिखें' : 'Use the blog slug in the path'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-black text-red-600 mb-1">{adminLang === 'hi' ? 'ब्लॉग पेज' : 'All Blogs Page'}</p>
                        <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">/blogs</code>
                        <p className="text-slate-500 mt-1">{adminLang === 'hi' ? 'सभी ब्लॉग की लिस्ट' : 'Shows all blogs with pagination'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-black text-red-600 mb-1">{adminLang === 'hi' ? 'श्रेणी लिंक' : 'Link to Category'}</p>
                        <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">/category/national</code>
                        <p className="text-slate-500 mt-1">{adminLang === 'hi' ? 'श्रेणी का slug लिखें' : 'Use category slug'}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="font-black text-red-600 mb-1">{adminLang === 'hi' ? 'कस्टम पेज' : 'Custom Page/URL'}</p>
                        <code className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded font-mono">/about, /contact, /poetry</code>
                        <p className="text-slate-500 mt-1">{adminLang === 'hi' ? 'कोई भी इंटरनल पाथ' : 'Any internal page path'}</p>
                    </div>
                </div>
            </div>

            {/* Items List */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group"
                        >
                            {/* Main Item Row */}
                            <div className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <GripVertical size={16} className="text-slate-300 cursor-grab shrink-0" />

                                {/* Order Arrows */}
                                <div className="flex flex-col gap-0.5 shrink-0">
                                    <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition">
                                        <ArrowUp size={12} className="text-slate-500" />
                                    </button>
                                    <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition">
                                        <ArrowDown size={12} className="text-slate-500" />
                                    </button>
                                </div>

                                {/* Order Number */}
                                <span className="text-[10px] font-black text-slate-300 w-5 text-center shrink-0">{index + 1}</span>

                                {/* Icon Select */}
                                <select
                                    value={item.icon || 'Star'}
                                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                                    className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold outline-none dark:text-white border border-slate-200 dark:border-slate-700 w-28 shrink-0"
                                >
                                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                                </select>

                                {/* Name EN */}
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                                    placeholder="Name (EN)"
                                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold outline-none dark:text-white border border-slate-200 dark:border-slate-700 min-w-0"
                                />

                                {/* Name HI */}
                                <input
                                    type="text"
                                    value={item.nameHi || ''}
                                    onChange={(e) => updateItem(index, 'nameHi', e.target.value)}
                                    placeholder="Name (HI)"
                                    className="flex-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-bold outline-none dark:text-white border border-slate-200 dark:border-slate-700 min-w-0"
                                />

                                {/* Custom Path (only for non-default items that have path) */}
                                <input
                                    type="text"
                                    value={item.path || ''}
                                    onChange={(e) => updateItem(index, 'path', e.target.value)}
                                    placeholder="/path"
                                    className="w-28 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs font-medium outline-none dark:text-white border border-slate-200 dark:border-slate-700 shrink-0"
                                />

                                {/* Expand/Collapse for children */}
                                <button
                                    onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition shrink-0"
                                    title="Manage sub-menus"
                                >
                                    {expandedItem === index ? <ChevronDown size={14} className="text-red-600" /> : <ChevronRight size={14} className="text-slate-400" />}
                                </button>

                                {/* Delete */}
                                <button onClick={() => removeItem(index)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition shrink-0" title="Remove">
                                    <Trash2 size={14} className="text-red-500" />
                                </button>
                            </div>

                            {/* Children / Dropdown Sub-items */}
                            {expandedItem === index && (
                                <div className="px-6 pb-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-white/5">
                                    <div className="ml-10 space-y-2 py-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {adminLang === 'hi' ? 'ड्रॉपडाउन आइटम' : 'Dropdown Sub-items'}
                                        </span>
                                        {(item.children || []).map((child, cIdx) => (
                                            <div key={cIdx} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                                <input type="text" value={child.name} onChange={(e) => updateChild(index, cIdx, 'name', e.target.value)} placeholder="Name (EN)" className="flex-1 p-1.5 text-xs rounded-lg outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold" />
                                                <input type="text" value={child.nameHi || ''} onChange={(e) => updateChild(index, cIdx, 'nameHi', e.target.value)} placeholder="Name (HI)" className="flex-1 p-1.5 text-xs rounded-lg outline-none bg-slate-50 dark:bg-slate-900 dark:text-white font-bold" />
                                                <input type="text" value={child.path || ''} onChange={(e) => updateChild(index, cIdx, 'path', e.target.value)} placeholder="/path" className="w-28 p-1.5 text-xs rounded-lg outline-none bg-slate-50 dark:bg-slate-900 dark:text-white" />
                                                <button onClick={() => removeChild(index, cIdx)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition">
                                                    <Trash2 size={12} className="text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => addChild(index)}
                                            className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 mt-2 px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
                                        >
                                            <Plus size={12} /> {adminLang === 'hi' ? 'सब-आइटम जोड़ें' : 'Add Sub-item'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add New Item */}
            <button
                onClick={addItem}
                className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900/30 transition group"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-wider">
                    {adminLang === 'hi' ? 'नया मेन्यू आइटम जोड़ें' : 'Add New Menu Item'}
                </span>
            </button>

            {/* Header Quick Icons */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-6 mt-6">
                <div className="flex items-center gap-2">
                    <Star size={18} className="text-red-600" />
                    <div>
                        <h3 className="font-black uppercase tracking-widest text-slate-900 dark:text-white">
                            {adminLang === 'hi' ? 'हेडर आइकॉन क्रम (सिर्फ हेडर के लिए)' : 'Header Links Order'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                            {adminLang === 'hi'
                                ? 'तय करें कि कौन से आइटम हेडर टॉप-बार में दिखेंगे और उनका क्रम क्या होगा।'
                                : 'Configure which items appear on the top header bar and sort their order.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Available Items */}
                    <div className="flex-1 space-y-2 w-full">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Available Pages</h4>
                        <select onChange={(e) => {
                            if (!e.target.value) return;
                            if (!headerOrderIds.includes(e.target.value)) setHeaderOrderIds([...headerOrderIds, e.target.value]);
                            e.target.value = '';
                        }} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl outline-none border border-slate-200 dark:border-slate-700 text-sm font-bold dark:text-white">
                            <option value="">-- Add to Header --</option>
                            {items.filter(i => !headerOrderIds.includes(i.id)).map(i => (
                                <option key={i.id} value={i.id}>{adminLang === 'hi' ? (i.nameHi || i.name) : i.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selected Items */}
                    <div className="flex-[2] space-y-2 w-full">
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Header Display Order</h4>
                        <div className="space-y-2">
                            {headerOrderIds.map((id, idx) => {
                                const item = items.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <div key={id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <span className="font-bold text-sm dark:text-white">{adminLang === 'hi' ? (item.nameHi || item.name) : item.name}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => {
                                                if (idx === 0) return;
                                                const newIds = [...headerOrderIds];
                                                [newIds[idx], newIds[idx - 1]] = [newIds[idx - 1], newIds[idx]];
                                                setHeaderOrderIds(newIds);
                                            }} disabled={idx === 0} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition"><ArrowUp size={14} className="text-slate-500" /></button>
                                            <button onClick={() => {
                                                if (idx === headerOrderIds.length - 1) return;
                                                const newIds = [...headerOrderIds];
                                                [newIds[idx], newIds[idx + 1]] = [newIds[idx + 1], newIds[idx]];
                                                setHeaderOrderIds(newIds);
                                            }} disabled={idx === headerOrderIds.length - 1} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded disabled:opacity-20 transition"><ArrowDown size={14} className="text-slate-500" /></button>
                                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                                            <button onClick={() => setHeaderOrderIds(headerOrderIds.filter(x => x !== id))} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded transition"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                )
                            })}
                            {headerOrderIds.length === 0 && <div className="p-6 text-center text-slate-400 text-xs font-bold border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-700">No items selected to appear on the header.</div>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Preview */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                    <Eye size={16} className="text-red-600" />
                    <h3 className="font-black text-xs uppercase text-slate-400 tracking-widest">
                        {adminLang === 'hi' ? 'मेन्यू प्रीव्यू' : 'Menu Order Preview'}
                    </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {items.map((item, i) => (
                        <div key={i} className="flex flex-col">
                            <div className="px-4 py-2 bg-red-600 text-white text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-2">
                                <span className="text-[9px] opacity-50">{i + 1}</span>
                                {adminLang === 'hi' ? (item.nameHi || item.name) : item.name}
                            </div>
                            {item.children && item.children.length > 0 && (
                                <div className="mt-1 ml-2 flex flex-col gap-1">
                                    {item.children.map((child, ci) => (
                                        <div key={ci} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-xs font-bold rounded text-slate-600 dark:text-slate-300">
                                            ↳ {adminLang === 'hi' ? (child.nameHi || child.name) : child.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminNavbar;
