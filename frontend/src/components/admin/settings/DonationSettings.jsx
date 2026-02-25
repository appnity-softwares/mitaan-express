import React from 'react';
import { Heart, CreditCard, Landmark, QrCode } from 'lucide-react';
import { useAdminTranslation } from '../../../context/AdminTranslationContext';
import TransliteratedInput from '../TransliteratedInput';

const DonationSettings = ({ settings, handleChange, onSave, loading }) => {
    const { t } = useAdminTranslation();
    return (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                        <Heart className="text-red-600" /> {t('donationSettings')}
                    </h3>
                    <p className="text-xs text-slate-500">{t('manageDonations')}</p>
                </div>
                <button
                    onClick={onSave}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-xs uppercase tracking-wider hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Donation Info'}
                </button>
            </div>

            {/* UPI Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                    <QrCode size={16} /> {t('upiConfig')}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">UPI ID (VPA)</label>
                        <input
                            name="donation_upi_id"
                            value={settings.donation_upi_id || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder="mitaanexpress@upi"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">This ID will be used to generate the QR Code.</p>
                    </div>
                </div>
            </div>

            {/* Bank Settings */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <h4 className="flex items-center gap-2 font-bold text-sm text-slate-700 dark:text-slate-300">
                    <Landmark size={16} /> {t('bankDetails')}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('accHolder')} (English)</label>
                        <input
                            name="donation_account_holder"
                            value={settings.donation_account_holder || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder="Mitaan Express Media Trust"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('accHolder')} (हिंदी)</label>
                        <TransliteratedInput
                            name="donation_account_holder_hi"
                            value={settings.donation_account_holder_hi || ''}
                            onChange={handleChange}
                            enabled={true}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder="मिटान एक्सप्रेस मीडिया ट्रस्ट"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('bankName')} (English)</label>
                        <input
                            name="donation_bank_name"
                            value={settings.donation_bank_name || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder="State Bank of India"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('bankName')} (हिंदी)</label>
                        <TransliteratedInput
                            name="donation_bank_name_hi"
                            value={settings.donation_bank_name_hi || ''}
                            onChange={handleChange}
                            enabled={true}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder="स्टेट बैंक ऑफ इंडिया"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('accNumber')}</label>
                        <input
                            name="donation_account_number"
                            value={settings.donation_account_number || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
                            placeholder="123456789012"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('ifscCode')}</label>
                        <input
                            name="donation_ifsc"
                            value={settings.donation_ifsc || ''}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 font-mono uppercase"
                            placeholder="SBIN0001234"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonationSettings;
