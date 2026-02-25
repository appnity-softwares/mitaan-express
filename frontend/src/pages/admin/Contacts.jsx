import React, { useState } from 'react';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import { useQuery } from '@tanstack/react-query';
import { fetchContacts } from '../../services/api';
import { Search, Filter, X } from 'lucide-react';

const AdminContacts = () => {
    const { t } = useAdminTranslation();
    const token = localStorage.getItem('token');
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('ALL');

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['admin','contacts'],
        queryFn: () => fetchContacts(token),
        enabled: !!token
    });

    // Filter contacts based on search and subject
    const filteredContacts = contacts.filter(c => {
        const matchesSearch = 
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.message.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSubject = subjectFilter === 'ALL' || c.subject === subjectFilter;
        
        return matchesSearch && matchesSubject;
    });

    const subjects = [...new Set(contacts.map(c => c.subject).filter(Boolean))];

    if (!token) return <div className="p-8 text-center text-red-500">Please login to view contacts</div>;
    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 space-y-6">
            <div>
                <h2 className="text-2xl font-black mb-2">{t ? t('contacts') : 'Contacts'}</h2>
                <p className="text-sm text-slate-500">Total: {contacts.length} | Showing: {filteredContacts.length}</p>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 items-center">
                    <Filter size={18} className="text-slate-400" />
                    <select
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-semibold text-sm"
                    >
                        <option value="ALL">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                {filteredContacts.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {contacts.length === 0 ? 'No contacts yet.' : 'No contacts match your search.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('name')}</th>
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('email')}</th>
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('subject')}</th>
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('phone')}</th>
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('message')}</th>
                                    <th className="px-6 py-4 font-black text-slate-700 dark:text-slate-300">{t('date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredContacts.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                                        <td className="px-6 py-4 text-blue-600 dark:text-blue-400 break-all">{c.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {c.subject || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{c.phone || '-'}</td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 line-clamp-2 max-w-xs">{c.message}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminContacts;