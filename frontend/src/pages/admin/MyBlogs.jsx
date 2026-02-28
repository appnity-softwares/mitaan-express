import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Edit, Eye, Filter, CheckSquare, Square, Search } from 'lucide-react';
import { useAdminBlogs } from '../../hooks/useQueries';
import { deleteBlog } from '../../services/api';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const MyBlogs = () => {
    const { t, adminLang: adminLanguage } = useAdminTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedArticles, setSelectedArticles] = useState([]);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // TanStack Query Hook
    const {
        data: blogsData,
        isLoading: loading,
        refetch: loadData
    } = useAdminBlogs({ author: user.id });

    const articles = Array.isArray(blogsData) ? blogsData : (blogsData?.blogs || []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            const token = localStorage.getItem('token');
            await deleteBlog(token, id);
            loadData();
            alert('Blog deleted!');
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">{adminLanguage === 'hi' ? 'आपके ब्लॉग लोड हो रहे हैं...' : 'Loading your blogs...'}</div>;
    if (!user.id) return <div className="p-8 text-center text-red-500">{adminLanguage === 'hi' ? 'ब्लॉग देखने के लिए कृपया लॉग इन करें' : 'Please login to view your blogs'}</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('myBlogs')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {adminLanguage === 'hi' ? 'अपने व्यक्तिगत लेखों और ड्राफ्ट को व्यवस्थित करें' : 'Manage your personal articles and drafts'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/my-blogs/new')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                    <FileText size={18} />
                    {t('addNew')}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={adminLanguage === 'hi' ? 'अपने ब्लॉग खोजें...' : 'Search your blogs...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-bold text-sm"
                >
                    <option value="ALL">{t('allStatus')}</option>
                    <option value="PUBLISHED">{t('published')}</option>
                    <option value="DRAFT">{t('draft')}</option>
                </select>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('title')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('categories')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('views')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('date')}</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        {adminLanguage === 'hi' ? 'आपने अभी तक कोई ब्लॉग नहीं लिखा है।' : "You haven't written any blogs yet."}
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {article.image && (
                                                    <img src={article.image} alt="" className="w-12 h-12 object-cover rounded" />
                                                )}
                                                <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                                    {article.title}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {article.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${article.status === 'PUBLISHED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                }`}>
                                                {article.status === 'PUBLISHED' ? t('published') : t('draft')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {article.views || 0}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(article.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/my-blogs/edit/${article.slug}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
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

export default MyBlogs;
