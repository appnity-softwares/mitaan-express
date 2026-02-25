import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Trash2, Eye, EyeOff, Copy, Archive, Download, CheckSquare, Square, Search, Filter, Calendar, TrendingUp, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAdminArticles, useCategories } from '../../hooks/useQueries';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const ArticleList = () => {
    const { t, adminLang: adminLanguage } = useAdminTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [selectedArticles, setSelectedArticles] = useState([]);
    const [langFilter, setLangFilter] = useState('ALL');
    const navigate = useNavigate();
    const { categoryId } = useParams();

    useEffect(() => {
        if (categoryId) {
            setCategoryFilter(categoryId);
        } else {
            setCategoryFilter('ALL');
        }
    }, [categoryId]);

    // TanStack Query Hooks
    const {
        data: articles = [],
        isLoading: articlesLoading,
        refetch: refreshArticles
    } = useAdminArticles();

    const {
        data: categories = [],
        isLoading: categoriesLoading
    } = useCategories();

    const loading = articlesLoading || categoriesLoading;

    const handleDelete = async (articleId) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/articles/${articleId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                refreshArticles();
                alert('Article deleted!');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleDuplicate = async (article) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/articles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...article,
                    title: `${article.title} (Copy)`,
                    slug: `${article.slug}-copy-${Date.now()}`,
                    status: 'DRAFT'
                })
            });
            if (response.ok) {
                refreshArticles();
                alert('Article duplicated!');
            }
        } catch (error) {
            console.error('Duplicate error:', error);
        }
    };

    const handleToggleActive = async (articleId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/articles/${articleId}/toggle-active`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                refreshArticles();
            }
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const toggleSelection = (id) => {
        setSelectedArticles(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedArticles.length === filteredArticles.length) {
            setSelectedArticles([]);
        } else {
            setSelectedArticles(filteredArticles.map(a => a.id));
        }
    };

    const bulkAction = async (action) => {
        if (selectedArticles.length === 0) {
            alert('Please select articles first');
            return;
        }

        const confirmMsg = `Are you sure you want to ${action} ${selectedArticles.length} article(s)?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            const token = localStorage.getItem('token');

            for (const id of selectedArticles) {
                const article = articles.find(a => a.id === id);
                if (!article) continue;

                if (action === 'delete') {
                    await fetch(`http://localhost:3000/api/articles/${article.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } else if (action === 'publish' || action === 'unpublish') {
                    await fetch(`http://localhost:3000/api/articles/${article.id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            ...article,
                            status: action === 'publish' ? 'PUBLISHED' : 'DRAFT'
                        })
                    });
                }
            }

            setSelectedArticles([]);
            refreshArticles();
            alert(`Bulk ${action} completed!`);
        } catch (error) {
            console.error('Bulk action error:', error);
            alert('Some operations failed');
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || article.category?.id === parseInt(categoryFilter);
        const matchesLang = langFilter === 'ALL' || article.language === langFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesLang;
    });

    const stats = {
        total: articles.length,
        published: articles.filter(a => a.status === 'PUBLISHED').length,
        draft: articles.filter(a => a.status === 'DRAFT').length,
        selected: selectedArticles.length
    };

    const currentCategoryName = React.useMemo(() => {
        if (categoryFilter === 'ALL') return null;
        const cat = categories.find(c => c.id == categoryFilter);
        return cat ? (adminLanguage === 'hi' ? cat.nameHi : cat.name) : null;
    }, [categoryFilter, categories, adminLanguage]);

    if (loading) return <div className="p-8 text-center text-slate-500">{adminLanguage === 'hi' ? 'लेख लोड हो रहे हैं...' : 'Loading articles...'}</div>;

    return (
        <div className="px-6 lg:px-12 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {currentCategoryName ? `${t('articles')}: ${currentCategoryName}` : t('articles')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {stats.total} total • {stats.published} published • {stats.draft} drafts
                        {stats.selected > 0 && ` • ${stats.selected} selected`}
                    </p>
                </div>
                <button
                    onClick={() => navigate(categoryId ? `/admin/articles/new?categoryId=${categoryId}` : '/admin/articles/new')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                    <FileText size={18} />
                    {t('addNew')}
                    <span className="text-xs opacity-75"></span>
                </button>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-bold text-sm"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'ALL') navigate('/admin/articles');
                            else navigate(`/admin/articles/category/${val}`);
                        }}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-bold text-sm"
                    >
                        <option value="ALL">{adminLanguage === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{adminLanguage === 'hi' ? cat.nameHi : cat.name}</option>
                        ))}
                    </select>

                    <select
                        value={langFilter}
                        onChange={(e) => setLangFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-bold text-sm"
                    >
                        <option value="ALL">{t('language')}: {adminLanguage === 'hi' ? 'सभी' : 'All'}</option>
                        <option value="en">English (EN)</option>
                        <option value="hi">Hindi (हिं)</option>
                    </select>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedArticles.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="text-blue-600" size={20} />
                        <span className="font-bold text-blue-900 dark:text-blue-400">
                            {selectedArticles.length} article(s) selected
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => bulkAction('publish')}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all text-sm flex items-center gap-2"
                        >
                            <Eye size={16} />
                            Publish
                        </button>
                        <button
                            onClick={() => bulkAction('unpublish')}
                            className="px-3 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 transition-all text-sm flex items-center gap-2"
                        >
                            <EyeOff size={16} />
                            Unpublish
                        </button>
                        <button
                            onClick={() => bulkAction('delete')}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-sm flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                        <button
                            onClick={() => setSelectedArticles([])}
                            className="px-3 py-2 bg-slate-600 text-white rounded-lg font-bold hover:bg-slate-700 transition-all text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}



            {/* Articles Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4">
                                    <button
                                        onClick={selectAll}
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                                    >
                                        {selectedArticles.length === filteredArticles.length && filteredArticles.length > 0 ? (
                                            <CheckSquare size={18} className="text-red-600" />
                                        ) : (
                                            <Square size={18} className="text-slate-400" />
                                        )}
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('title')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('categories')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{adminLanguage === 'hi' ? 'सक्रिय' : 'Active'}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('views')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('date')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No articles found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map(article => (
                                    <tr
                                        key={article.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => toggleSelection(article.id)}
                                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                                            >
                                                {selectedArticles.includes(article.id) ? (
                                                    <CheckSquare size={18} className="text-red-600" />
                                                ) : (
                                                    <Square size={18} className="text-slate-400" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {article.image && (
                                                    <img src={article.image} alt="" className="w-12 h-12 object-cover rounded" />
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                                        {article.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                        {article.isBreaking && <span className="px-2 py-0.5 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full flex items-center gap-1"><Zap size={10} /> Breaking</span>}
                                                        {article.isTrending && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 rounded-full flex items-center gap-1"><TrendingUp size={10} /> Trending</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-red-600 uppercase tracking-tighter">
                                                    {article.category?.parent?.nameHi || article.category?.nameHi || 'General'}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-500">
                                                    {article.category?.name || 'Uncategorized'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${article.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                }`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleToggleActive(article.id, article.published)}
                                                className={`p-2 rounded-lg transition-all ${article.published ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                                title={article.published ? 'Active (Click to deactivate)' : 'Inactive (Click to activate)'}
                                            >
                                                {article.published ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {article.views || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDuplicate(article)}
                                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                                    title="Duplicate"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ArticleList;
