import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Mail, User, MessageSquare, Calendar, ChevronDown, Filter, Search, Settings, PieChart } from 'lucide-react';
import DonationSettings from '../../components/admin/settings/DonationSettings';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { API_URL } from '../../services/api';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const AdminDonations = () => {
    const { t } = useAdminTranslation();
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'settings'
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Settings Hooks
    const { data: settingsData, isLoading: settingsLoading } = useSettings();
    const updateMutation = useUpdateSettings();
    const [settingsState, setSettingsState] = useState({
        donation_upi_id: '',
        donation_account_holder: '',
        donation_account_holder_hi: '',
        donation_bank_name: '',
        donation_bank_name_hi: '',
        donation_account_number: '',
        donation_ifsc: '',
    });

    useEffect(() => {
        fetchDonations();
    }, []);

    useEffect(() => {
        if (settingsData) {
            setSettingsState(prev => ({
                ...prev,
                donation_upi_id: settingsData.donation_upi_id || '',
                donation_account_holder: settingsData.donation_account_holder || '',
                donation_account_holder_hi: settingsData.donation_account_holder_hi || '',
                donation_bank_name: settingsData.donation_bank_name || '',
                donation_bank_name_hi: settingsData.donation_bank_name_hi || '',
                donation_account_number: settingsData.donation_account_number || '',
                donation_ifsc: settingsData.donation_ifsc || '',
            }));
        }
    }, [settingsData]);

    const fetchDonations = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/donations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setDonations(data);
            }
        } catch (error) {
            console.error('Failed to fetch donations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsChange = (e) => {
        const { name, value } = e.target;
        setSettingsState(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateMutation.mutateAsync(settingsState);
            alert('Donation settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings: ' + error.message);
        }
    };

    const filteredDonations = donations.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 px-6 lg:px-12 py-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('donations')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('manageDonations')}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'overview' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <PieChart size={18} /> {t('overview')}
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'settings' ? 'border-red-600 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    <Settings size={18} /> {t('settings')}
                </button>
            </div>

            {activeTab === 'overview' && (
                <>
                    {/* Header / Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-8 space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('totalContributions')}</span>
                            <div className="text-4xl font-black text-slate-900 dark:text-white font-serif italic flex items-center gap-2">
                                <IndianRupee size={28} className="text-red-600" />
                                {totalAmount.toLocaleString()}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-8 space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('donors')}</span>
                            <div className="text-4xl font-black text-slate-900 dark:text-white font-serif italic">
                                {donations.length}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-8 space-y-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('avgDonation')}</span>
                            <div className="text-4xl font-black text-slate-900 dark:text-white font-serif italic">
                                ₹{(totalAmount / (donations.length || 1)).toFixed(0)}
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search donors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all dark:text-white"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">
                            <Filter size={16} />
                            Filter Records
                        </button>
                    </div>

                    {/* Donations Table */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[40px] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/10">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic">Loading donations...</td>
                                        </tr>
                                    ) : filteredDonations.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 italic">No donations found</td>
                                        </tr>
                                    ) : (
                                        filteredDonations.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white">{donation.name}</span>
                                                        <span className="text-xs text-slate-500">{donation.email}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="font-mono font-bold text-red-600">₹{donation.amount}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={donation.message}>
                                                        {donation.message || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-8 py-6 text-sm text-slate-500">
                                                    <div className="flex items-center gap-2 max-w-xs truncate">
                                                        <Calendar size={14} />
                                                        {new Date(donation.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {donation.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-4xl">
                    <DonationSettings
                        settings={settingsState}
                        handleChange={handleSettingsChange}
                        loading={updateMutation.isPending}
                        onSave={handleSaveSettings}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminDonations;
