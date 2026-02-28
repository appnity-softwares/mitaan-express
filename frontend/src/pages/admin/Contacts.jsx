import React, { useState } from 'react';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchContacts, toggleContactRead, deleteContact } from '../../services/api';
import { Search, Filter, X, Trash2, MailOpen, Mail, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminContacts = () => {
    const { t } = useAdminTranslation();
    const token = localStorage.getItem('token');
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('ALL');
    const [viewingContact, setViewingContact] = useState(null);

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['admin', 'contacts'],
        queryFn: () => fetchContacts(token),
        enabled: !!token
    });

    const markReadMutation = useMutation({
        mutationFn: (id) => toggleContactRead(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin', 'contacts']);
            toast.success('Contact marked as read');
        },
        onError: () => toast.error('Failed to update status')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteContact(id, token),
        onSuccess: () => {
            queryClient.invalidateQueries(['admin', 'contacts']);
            toast.success('Contact deleted');
            if (viewingContact) setViewingContact(null);
        },
        onError: () => toast.error('Failed to delete contact')
    });

    const handleMarkRead = (e, id) => {
        e.stopPropagation();
        markReadMutation.mutate(id);
    };

    const handleDelete = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this contact message?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleView = (contact) => {
        setViewingContact(contact);
        if (!contact.isRead) {
            markReadMutation.mutate(contact.id);
        }
    };

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
        <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl lg:text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tighter">
                        📮 {t ? t('contacts') : 'Contacts'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Total messages: {contacts.length} • Unread: {contacts.filter(c => !c.isRead).length}
                    </p>
                </div>
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
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white"
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
                        className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 ring-red-600 text-slate-900 dark:text-white font-bold text-sm"
                    >
                        <option value="ALL">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Contacts Table */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                {filteredContacts.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <Mail className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
                        <span className="font-black uppercase tracking-widest text-sm">
                            {contacts.length === 0 ? 'Inbox Empty' : 'No matches found'}
                        </span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
                                    <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-500">{t('name')}</th>
                                    <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-500">{t('email')}</th>
                                    <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-500">{t('subject')}</th>
                                    <th className="px-6 py-4 font-black text-xs uppercase tracking-widest text-slate-500">{t('date')}</th>
                                    <th className="px-6 py-4 text-right font-black text-xs uppercase tracking-widest text-slate-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {filteredContacts.map(c => (
                                    <tr
                                        key={c.id}
                                        onClick={() => handleView(c)}
                                        className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${!c.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            {c.isRead ? (
                                                <MailOpen size={18} className="text-slate-400" />
                                            ) : (
                                                <Mail size={18} className="text-indigo-600 fill-indigo-100" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {c.name}
                                            {!c.isRead && <span className="ml-2 w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 truncate max-w-[200px]">{c.email}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5">
                                                {c.subject || 'General Inquiry'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs font-bold whitespace-nowrap">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!c.isRead && (
                                                    <button
                                                        onClick={(e) => handleMarkRead(e, c.id)}
                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                                                        title="Mark as Read"
                                                    >
                                                        <MailOpen size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => handleDelete(e, c.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Modal */}
            {viewingContact && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingContact(null)}>
                    <div
                        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative border border-slate-100 dark:border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setViewingContact(null)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full transition-colors"
                        >
                            <X size={18} className="text-slate-600 dark:text-slate-300" />
                        </button>

                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-white/10 pr-12">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{viewingContact.subject || 'General Inquiry'}</h3>
                            <div className="flex flex-wrap gap-4 text-sm font-medium">
                                <div className="text-slate-500">From: <span className="text-slate-900 dark:text-white font-bold">{viewingContact.name}</span></div>
                                <div className="text-slate-500">Email: <a href={`mailto:${viewingContact.email}`} className="text-blue-600 hover:underline">{viewingContact.email}</a></div>
                                {viewingContact.phone && (
                                    <div className="text-slate-500">Phone: <a href={`tel:${viewingContact.phone}`} className="text-blue-600 hover:underline">{viewingContact.phone}</a></div>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">
                                Received {new Date(viewingContact.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {viewingContact.message}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-white/10">
                            <a
                                href={`mailto:${viewingContact.email}?subject=Re: ${viewingContact.subject || 'Your Inquiry'}`}
                                className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-opacity"
                            >
                                Reply via Email
                            </a>
                            <button
                                onClick={(e) => handleDelete(e, viewingContact.id)}
                                className="px-6 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                Delete Message
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContacts;