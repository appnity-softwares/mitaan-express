import React, { useState, useEffect, useMemo } from 'react';
import { useCategories } from '../../hooks/useQueries';
import { API_URL } from '../../services/api';
import {
    Plus, Edit, Trash2, FolderPlus, FolderTree,
    ChevronDown, ChevronRight, Activity, Newspaper,
    PenTool, Film, Heart as HeartIcon, Star,
    Palette, Award, Clock, Users, ShieldAlert,
    TrendingUp, Trophy, Cpu, BookOpen, Brain,
    Feather, Search, Smile, Sunrise, X, Smartphone, Code
} from 'lucide-react';

const icons = [
    { name: 'Newspaper', icon: <Newspaper size={18} /> },
    { name: 'PenTool', icon: <PenTool size={18} /> },
    { name: 'Film', icon: <Film size={18} /> },
    { name: 'History', icon: <Clock size={18} /> },
    { name: 'Activity', icon: <Activity size={18} /> },
    { name: 'Users', icon: <Users size={18} /> },
    { name: 'TrendingUp', icon: <TrendingUp size={18} /> },
    { name: 'Trophy', icon: <Trophy size={18} /> },
    { name: 'Cpu', icon: <Cpu size={18} /> },
    { name: 'ShieldAlert', icon: <ShieldAlert size={18} /> },
    { name: 'AlertTriangle', icon: <ShieldAlert size={18} /> },
    { name: 'Brain', icon: <Brain size={18} /> },
    { name: 'BookOpen', icon: <BookOpen size={18} /> },
    { name: 'Feather', icon: <Feather size={18} /> },
    { name: 'Search', icon: <Search size={18} /> },
    { name: 'Smile', icon: <Smile size={18} /> },
    { name: 'Palette', icon: <Palette size={18} /> },
    { name: 'Award', icon: <Award size={18} /> },
    { name: 'Star', icon: <Star size={18} /> },
    { name: 'Sunrise', icon: <Sunrise size={18} /> },
    { name: 'Heart', icon: <HeartIcon size={18} /> },
    { name: 'Smartphone', icon: <Smartphone size={18} /> },
    { name: 'Code', icon: <Code size={18} /> },
];

const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#64748b'
];

const Categories = () => {
    const token = localStorage.getItem('token');

    // TanStack Query Hook
    const {
        data: categories = [],
        isLoading: loading,
        refetch: loadCategories
    } = useCategories();

    // Local State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        nameHi: '',
        slug: '',
        description: '',
        parentId: '',
        icon: 'Newspaper',
        color: '#ef4444',
        sortOrder: 0
    });

    const handleOpenModal = (category = null, initialParentId = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || '',
                nameHi: category.nameHi || '',
                slug: category.slug || '',
                description: category.description || '',
                parentId: category.parentId || '',
                icon: category.icon || 'Newspaper',
                color: category.color || '#ef4444',
                sortOrder: category.sortOrder || 0
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                nameHi: '',
                slug: '',
                description: '',
                parentId: initialParentId || '',
                icon: 'Newspaper',
                color: '#ef4444',
                sortOrder: categories.length
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = editingCategory
            ? `${API_URL}/categories/${editingCategory.id}`
            : `${API_URL}/categories`;

        const method = editingCategory ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    parentId: formData.parentId || null
                })
            });

            if (response.ok) {
                setIsModalOpen(false);
                loadCategories();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to save category');
            }
        } catch (err) {
            alert('Error connecting to server');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This will fail if articles or sub-categories exist.')) return;

        try {
            const response = await fetch(`${API_URL}/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                loadCategories();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to delete');
            }
        } catch (e) {
            alert('Error deleting category');
        }
    };

    const treeData = useMemo(() => {
        const tree = [];
        const lookup = {};
        categories.forEach(c => lookup[c.id] = { ...c, children: [] });
        categories.forEach(c => {
            if (c.parentId && lookup[c.parentId]) lookup[c.parentId].children.push(lookup[c.id]);
            else if (!c.parentId) tree.push(lookup[c.id]);
        });
        return tree;
    }, [categories]);

    return (
        <div className="p-4 lg:p-10 space-y-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Category Hierarchy</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Organize your news portal structure</p>
                </div>
                <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-95">
                    <FolderPlus size={18} />
                    Create New
                </button>
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 flex justify-center"><Activity className="animate-spin text-red-600" /></div>
            ) : (
                <div className="grid gap-8">
                    {treeData.map(parent => (
                        <div key={parent.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                            <div className="p-6 flex items-center justify-between border-b border-slate-50 dark:border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20" style={{ backgroundColor: parent.color || '#3b82f6' }}>
                                        {icons.find(i => i.name === parent.icon)?.icon || <FolderTree size={24} />}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                            {parent.nameHi} <span className="text-slate-300 dark:text-slate-600">/</span> <span className="opacity-60">{parent.name}</span>
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 font-mono text-[10px] text-slate-400">
                                            <span className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded">/{parent.slug}</span>
                                            <span className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded">Order: {parent.sortOrder}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenModal(null, parent.id)} className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10 rounded-xl transition-colors" title="Add Sub-category">
                                        <Plus size={18} />
                                    </button>
                                    <button onClick={() => handleOpenModal(parent)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-xl transition-colors" title="Edit">
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(parent.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors" title="Delete">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {parent.children.length > 0 && (
                                <div className="bg-slate-50/30 dark:bg-slate-900/20 p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {parent.children.map(child => (
                                        <div key={child.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5">
                                                    {icons.find(i => i.name === child.icon)?.icon || <ChevronRight size={16} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {child.nameHi} <span className="font-normal opacity-50 ml-1">/ {child.name}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">/{child.slug}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(child)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"><Edit size={14} /></button>
                                                <button onClick={() => handleDelete(child.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] p-4 shadow-2xl overflow-hidden border border-white/20">
                        <div className="flex items-center justify-between p-6 border-b border-slate-50 dark:border-white/5">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto categories-scroll">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Names */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Category Name (English)</label>
                                        <input
                                            value={formData.name}
                                            onChange={e => {
                                                const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                                                setFormData({ ...formData, name: e.target.value, slug: !editingCategory ? slug : formData.slug });
                                            }}
                                            required
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                            placeholder="e.g. Sports"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Category Name (Hindi)</label>
                                        <input
                                            value={formData.nameHi}
                                            onChange={e => setFormData({ ...formData, nameHi: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                            placeholder="e.g. खेल"
                                        />
                                    </div>
                                </div>

                                {/* Hierarchy & Props */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">Parent Category</label>
                                        <select
                                            value={formData.parentId}
                                            onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                        >
                                            <option value="">No Parent (Main Category)</option>
                                            {categories.filter(c => !c.parentId && c.id !== editingCategory?.id).map(c => (
                                                <option key={c.id} value={c.id}>{c.nameHi} / {c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-2">URL Slug</label>
                                        <input
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-mono text-xs border-2 border-transparent focus:border-red-600 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Icon Selection */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-4">Choose Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {icons.map(icon => (
                                        <button
                                            key={icon.name}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: icon.name })}
                                            className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${formData.icon === icon.name ? 'border-red-600 bg-red-50 dark:bg-red-900/10 text-red-600' : 'border-slate-100 dark:border-white/5 text-slate-400 hover:bg-slate-50'}`}
                                            title={icon.name}
                                        >
                                            {icon.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="block text-[10px] font-black uppercase text-red-600 tracking-widest mb-4">Branding Color</label>
                                <div className="flex flex-wrap gap-3">
                                    {colors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color })}
                                            style={{ backgroundColor: color }}
                                            className={`w-8 h-8 rounded-full border-4 shadow-lg transition-transform hover:scale-110 ${formData.color === color ? 'border-white dark:border-slate-700 scale-125' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-4 pt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-2xl transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/30 transition-all active:scale-95">Save Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .categories-scroll::-webkit-scrollbar { width: 4px; }
                .categories-scroll::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
                .dark .categories-scroll::-webkit-scrollbar-thumb { background: #334155; }
            ` }} />
        </div>
    );
};

export default Categories;
