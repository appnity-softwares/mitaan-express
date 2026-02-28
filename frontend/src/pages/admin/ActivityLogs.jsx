import React, { useState } from 'react';
import { RefreshCw, User, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActivityLogs } from '../../hooks/useQueries';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const ActivityLogs = () => {
    const { t } = useAdminTranslation();
    const [currentPage, setCurrentPage] = useState(1);

    // TanStack Query Hook
    const {
        data,
        isLoading: loading,
        refetch: loadLogs
    } = useActivityLogs(currentPage);

    const logs = data?.logs || [];
    const pagination = data?.pagination || { page: 1, total: 0, pages: 1 };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        if (action.includes('DELETE')) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    };

    return (
        <div className="p-4 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('activityLogs') || 'Activity Logs'}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track all admin actions and system events.</p>
                </div>
                <button
                    onClick={() => loadLogs()}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Target</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {log.user?.name?.charAt(0) || <User size={14} />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{log.user?.name || `User #${log.userId}`}</div>
                                                    <div className="text-xs text-slate-500">{log.user?.role}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                                <span className="opacity-75">{log.entity}</span>
                                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                                <span>{log.entityId || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={log.details}>
                                            {log.details || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <Clock size={14} />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-sm text-slate-500 px-2">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="p-2 border border-slate-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogs;
