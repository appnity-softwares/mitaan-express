import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Feather, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import toast from 'react-hot-toast';

const AdminPoetry = () => {
    const { adminLang } = useAdminTranslation();
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [poems, setPoems] = useState([]);
    const [saving, setSaving] = useState(false);
    const [expandedPoem, setExpandedPoem] = useState(null);
    const [previewPoem, setPreviewPoem] = useState(null);

    const defaultPoems = [
        {
            title: 'Path of Life', titleHi: 'जीवन की राह',
            author: 'Mitaan Poet', authorHi: 'मितान कवि',
            excerpt: 'Walk the path where stars align,\nWhere winds sing songs, where dreams entwine.',
            excerptHi: 'चलो चलें उस राह पर, जहाँ सितारे मिलते हैं,\nजहाँ हवाएं गीत गाती हैं, जहाँ सपने खिलते हैं।',
            category: 'Inspiration', categoryHi: 'प्रेरणा'
        },
        {
            title: 'Journey of Words', titleHi: 'शब्दों का सफर',
            author: 'Mitaan Poet', authorHi: 'मितान कवि',
            excerpt: 'In words lies a world untold,\nEvery letter a story of gold.',
            excerptHi: 'शब्दों में छुपी है दुनिया सारी,\nहर अक्षर में बसी है कहानी हमारी।',
            category: 'Literature', categoryHi: 'साहित्य'
        },
        {
            title: 'Song of Nature', titleHi: 'प्रकृति का गीत',
            author: 'Mitaan Poet', authorHi: 'मितान कवि',
            excerpt: 'Beneath the shade of ancient trees,\nHear the rivers, feel the breeze.',
            excerptHi: 'पेड़ों की छाँव में, नदी का गीत सुनो,\nप्रकृति की गोद में, जीवन का अर्थ चुनो।',
            category: 'Nature', categoryHi: 'प्रकृति'
        }
    ];

    useEffect(() => {
        if (settings?.featured_poetry_json) {
            try {
                const parsed = JSON.parse(settings.featured_poetry_json);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setPoems(parsed);
                    return;
                }
            } catch (e) { }
        }
        setPoems(defaultPoems);
    }, [settings]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateMutation.mutateAsync({
                featured_poetry_json: JSON.stringify(poems)
            });
            toast.success(adminLang === 'hi' ? 'कविताएं सेव हो गईं!' : 'Poetry saved successfully!');
        } catch (error) {
            toast.error('Failed to save');
        }
        setSaving(false);
    };

    const addPoem = () => {
        setPoems([...poems, {
            title: '', titleHi: '',
            author: '', authorHi: '',
            excerpt: '', excerptHi: '',
            category: '', categoryHi: ''
        }]);
        setExpandedPoem(poems.length);
    };

    const updatePoem = (index, field, value) => {
        const updated = [...poems];
        updated[index] = { ...updated[index], [field]: value };
        setPoems(updated);
    };

    const removePoem = (index) => {
        setPoems(poems.filter((_, i) => i !== index));
        setExpandedPoem(null);
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Feather size={24} className="text-red-600" />
                        {adminLang === 'hi' ? 'विशेष कविताएं' : 'Featured Poetry'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {adminLang === 'hi' ? 'लैंडिंग पेज पर दिखने वाली कविताएं मैनेज करें' : 'Manage poetry shown on the landing page Creative Pulse section'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Poetry'}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200/50 dark:border-red-900/20 rounded-2xl p-4 text-sm text-red-700 dark:text-red-400">
                <strong>💡 {adminLang === 'hi' ? 'टिप:' : 'Tip:'}</strong>{' '}
                {adminLang === 'hi'
                    ? 'ये कविताएं लैंडिंग पेज के "Creative Pulse" सेक्शन में टाइपराइटर इफ़ेक्ट के साथ दिखेंगी। हर कविता ऑटो-रोटेट होगी।'
                    : 'These poems will appear in the "Creative Pulse" section on the landing page with a typewriter effect. Each poem auto-rotates every 8 seconds.'}
            </div>

            {/* Poems List */}
            <div className="space-y-4">
                {poems.map((poem, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm"
                    >
                        {/* Poem Header Row */}
                        <div
                            className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                            onClick={() => setExpandedPoem(expandedPoem === index ? null : index)}
                        >
                            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center shrink-0">
                                <Feather size={18} className="text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-slate-900 dark:text-white truncate">
                                    {poem.title || poem.titleHi || `Poetry #${index + 1}`}
                                </p>
                                <p className="text-xs text-slate-400 font-medium">
                                    {poem.author || poem.authorHi || 'No author'} · {poem.category || poem.categoryHi || 'Uncategorized'}
                                </p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setPreviewPoem(previewPoem === index ? null : index); }}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                                title="Preview"
                            >
                                <Eye size={14} className="text-slate-400" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); removePoem(index); }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition"
                            >
                                <Trash2 size={14} className="text-red-500" />
                            </button>
                            {expandedPoem === index
                                ? <ChevronDown size={16} className="text-red-600 shrink-0" />
                                : <ChevronRight size={16} className="text-slate-300 shrink-0" />}
                        </div>

                        {/* Preview Panel */}
                        {previewPoem === index && (
                            <div className="px-5 pb-4 border-t border-slate-100 dark:border-white/5">
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mt-3 border-l-4 border-red-600">
                                    <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-2">{poem.category || 'Category'}</p>
                                    <h4 className="text-xl font-black font-serif text-slate-900 dark:text-white mb-3">{poem.title || 'Untitled'}</h4>
                                    <p className="text-base font-serif italic text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{poem.excerpt || 'No excerpt...'}</p>
                                    <p className="text-sm font-bold text-slate-500 mt-4">— {poem.author || 'Unknown'}</p>
                                </div>
                            </div>
                        )}

                        {/* Expanded Edit Form */}
                        {expandedPoem === index && (
                            <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 space-y-4 pt-4">
                                {/* Title */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title (EN)</label>
                                        <input type="text" value={poem.title} onChange={(e) => updatePoem(index, 'title', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Path of Life"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Title (HI)</label>
                                        <input type="text" value={poem.titleHi} onChange={(e) => updatePoem(index, 'titleHi', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="जीवन की राह"
                                        />
                                    </div>
                                </div>

                                {/* Author */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author (EN)</label>
                                        <input type="text" value={poem.author} onChange={(e) => updatePoem(index, 'author', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-medium outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Poet Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Author (HI)</label>
                                        <input type="text" value={poem.authorHi} onChange={(e) => updatePoem(index, 'authorHi', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-medium outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="कवि का नाम"
                                        />
                                    </div>
                                </div>

                                {/* Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category (EN)</label>
                                        <input type="text" value={poem.category} onChange={(e) => updatePoem(index, 'category', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="Inspiration"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category (HI)</label>
                                        <input type="text" value={poem.categoryHi} onChange={(e) => updatePoem(index, 'categoryHi', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white border border-slate-200 dark:border-slate-700" placeholder="प्रेरणा"
                                        />
                                    </div>
                                </div>

                                {/* Excerpt / Poem Text */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poem / Excerpt (EN)</label>
                                        <textarea value={poem.excerpt} onChange={(e) => updatePoem(index, 'excerpt', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white border border-slate-200 dark:border-slate-700 h-32 resize-none font-serif" placeholder="Walk the path where stars align..."
                                        />
                                        <p className="text-[9px] text-slate-400">Use line breaks for verse formatting</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Poem / Excerpt (HI)</label>
                                        <textarea value={poem.excerptHi} onChange={(e) => updatePoem(index, 'excerptHi', e.target.value)}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm outline-none dark:text-white border border-slate-200 dark:border-slate-700 h-32 resize-none font-serif" placeholder="चलो चलें उस राह पर..."
                                        />
                                        <p className="text-[9px] text-slate-400">नई पंक्ति के लिए Enter दबाएं</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add New Poem */}
            <button
                onClick={addPoem}
                className="w-full p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-red-600 hover:border-red-300 dark:hover:border-red-900/30 transition group"
            >
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-wider">
                    {adminLang === 'hi' ? 'नई कविता जोड़ें' : 'Add New Poetry'}
                </span>
            </button>
        </div>
    );
};

export default AdminPoetry;
