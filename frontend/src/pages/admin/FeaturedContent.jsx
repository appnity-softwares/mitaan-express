import React, { useState } from 'react';
import { Zap, Star, TrendingUp, X, Plus } from 'lucide-react';
import { useAdminArticles } from '../../hooks/useQueries';
import { API_URL } from '../../services/api';

const FeaturedContent = () => {
    // TanStack Query Hook
    const {
        data: articles = [],
        isLoading: loading,
        refetch: loadArticles
    } = useAdminArticles();

    const [activeTab, setActiveTab] = useState('breaking');

    const breakingNews = articles.filter(a => a.isBreaking);
    const featured = articles.filter(a => a.isFeatured);
    const trending = articles.filter(a => a.isTrending);

    const toggleFlag = async (articleId, flag) => {
        try {
            const token = localStorage.getItem('token');
            const article = articles.find(a => a.id === articleId);

            const response = await fetch(`${API_URL}/articles/${article.slug}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...article,
                    [flag]: !article[flag]
                })
            });

            if (response.ok) {
                loadArticles();
                alert(`${flag} updated!`);
            }
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    const ArticleCard = ({ article, flag, icon: Icon, color }) => (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:shadow-lg transition-all group">
            <div className="flex gap-4">
                {article.image && (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                            {article.title}
                        </h3>
                        <button
                            onClick={() => toggleFlag(article.id, flag)}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${color}`}
                            title={`Remove from ${flag}`}
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
                            {article.category?.name}
                        </span>
                        <span>•</span>
                        <span>{article.views || 0} views</span>
                        <span>•</span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const AvailableArticles = ({ currentFlag }) => {
        const available = articles.filter(a => !a[currentFlag] && a.status === 'PUBLISHED');

        return (
            <div className="mt-6">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Add Articles</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {available.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No available articles</p>
                    ) : (
                        available.map(article => (
                            <div key={article.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                {article.image && (
                                    <img src={article.image} alt="" className="w-12 h-12 object-cover rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 dark:text-white text-sm line-clamp-1">
                                        {article.title}
                                    </div>
                                    <div className="text-xs text-slate-500">{article.category?.name}</div>
                                </div>
                                <button
                                    onClick={() => toggleFlag(article.id, currentFlag)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    const tabs = [
        { id: 'breaking', label: 'Breaking News', icon: Zap, color: 'text-red-600', count: breakingNews.length },
        { id: 'featured', label: 'Featured', icon: Star, color: 'text-yellow-600', count: featured.length },
        { id: 'trending', label: 'Trending', icon: TrendingUp, color: 'text-orange-600', count: trending.length },
    ];

    return (
        <div className="p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Featured Content</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage breaking news, featured articles, and trending content</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tabs.map(tab => (
                    <div key={tab.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <tab.icon className={tab.color} size={24} />
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{tab.count}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-600 dark:text-slate-400">{tab.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-white/10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all ${activeTab === tab.id
                            ? 'text-red-600 border-b-2 border-red-600'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Items */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                    <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        {activeTab === 'breaking' && <><Zap className="text-red-600" size={20} /> Breaking News</>}
                        {activeTab === 'featured' && <><Star className="text-yellow-600" size={20} /> Featured Articles</>}
                        {activeTab === 'trending' && <><TrendingUp className="text-orange-600" size={20} /> Trending Content</>}
                    </h3>

                    <div className="space-y-3">
                        {activeTab === 'breaking' && breakingNews.length === 0 && (
                            <p className="text-slate-500 text-center py-8">No breaking news articles</p>
                        )}
                        {activeTab === 'featured' && featured.length === 0 && (
                            <p className="text-slate-500 text-center py-8">No featured articles</p>
                        )}
                        {activeTab === 'trending' && trending.length === 0 && (
                            <p className="text-slate-500 text-center py-8">No trending articles</p>
                        )}

                        {activeTab === 'breaking' && breakingNews.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                flag="isBreaking"
                                icon={Zap}
                                color="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                            />
                        ))}

                        {activeTab === 'featured' && featured.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                flag="isFeatured"
                                icon={Star}
                                color="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                            />
                        ))}

                        {activeTab === 'trending' && trending.map(article => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                flag="isTrending"
                                icon={TrendingUp}
                                color="bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
                            />
                        ))}
                    </div>
                </div>

                {/* Available Articles */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
                    {activeTab === 'breaking' && <AvailableArticles currentFlag="isBreaking" />}
                    {activeTab === 'featured' && <AvailableArticles currentFlag="isFeatured" />}
                    {activeTab === 'trending' && <AvailableArticles currentFlag="isTrending" />}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/20 p-6 rounded-2xl">
                <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-2">💡 Tips</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• <strong>Breaking News:</strong> Appears in top banner and homepage highlight</li>
                    <li>• <strong>Featured:</strong> Shown prominently on homepage hero section</li>
                    <li>• <strong>Trending:</strong> Displayed in trending sidebar and special sections</li>
                    <li>• Only published articles can be marked as featured content</li>
                </ul>
            </div>
        </div>
    );
};

export default FeaturedContent;
