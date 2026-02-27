import React, { useState } from 'react';
import { FileText, Activity, TrendingUp, Eye, MessageSquare, BarChart3 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useQueries';

const Analytics = () => {
    const [period, setPeriod] = useState('daily');

    // TanStack Query Hook
    const {
        data: stats,
        isLoading: loading,
        isError: error,
        error: errorMessage,
        refetch: loadAnalytics
    } = useAnalytics(period);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-600 mb-3">Error loading analytics</div>
            <div className="text-sm text-slate-500 mb-4">{errorMessage?.message || 'Unknown error'}</div>
            <button onClick={() => loadAnalytics()} className="px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
        </div>
    );
    if (!stats || !stats.overview) return <div className="p-8 text-center text-slate-500">No data available</div>;

    return (
        <div className="p-4 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Analytics Dashboard</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track your website performance</p>
                </div>
                <div className="flex gap-2">
                    {['daily', 'weekly', 'monthly'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg font-bold text-sm capitalize transition-all ${period === p
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <FileText size={24} className="opacity-80" />
                        <Activity size={20} className="opacity-60" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.overview.totalArticles}</div>
                    <div className="text-sm opacity-90 uppercase tracking-wide">Total Articles</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp size={24} className="opacity-80" />
                        <Activity size={20} className="opacity-60" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.overview.publishedArticles}</div>
                    <div className="text-sm opacity-90 uppercase tracking-wide">Published</div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <Eye size={24} className="opacity-80" />
                        <Activity size={20} className="opacity-60" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.overview.totalViews.toLocaleString()}</div>
                    <div className="text-sm opacity-90 uppercase tracking-wide">Total Views</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <MessageSquare size={24} className="opacity-80" />
                        <Activity size={20} className="opacity-60" />
                    </div>
                    <div className="text-3xl font-black mb-1">{stats.overview.pendingComments}</div>
                    <div className="text-sm opacity-90 uppercase tracking-wide">Pending</div>
                </div>
            </div>

            {/* Most Viewed Articles */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="text-red-600" size={24} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Most Viewed Articles</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Article</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {stats.mostViewedArticles.map((article, index) => (
                                <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                            index === 1 ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300' :
                                                index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                                                    'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {article.image && (
                                                <img src={article.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                            )}
                                            <div className="font-bold text-slate-900 dark:text-white line-clamp-2 max-w-md">
                                                {article.title}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-bold">
                                            {article.category.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                                            <Eye size={16} className="text-slate-400" />
                                            {article.views.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(article.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Category Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <BarChart3 className="text-red-600" size={24} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Category Distribution</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.categoryStats.slice(0, 8).map((cat, index) => {
                            const maxCount = Math.max(...stats.categoryStats.map(c => c.count));
                            const percentage = (cat.count / maxCount) * 100;

                            return (
                                <div key={cat.slug}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                                        <span className="text-sm text-slate-500">{cat.count} articles</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="text-red-600" size={24} />
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Recent Activity (7 Days)</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">New Articles</div>
                                    <div className="text-sm text-slate-500">Published this week</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-blue-600">{stats.recentActivity.articles}</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">New Comments</div>
                                    <div className="text-sm text-slate-500">Received this week</div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-green-600">{stats.recentActivity.comments}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
