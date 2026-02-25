import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Layout, Loader2, Save, AlertCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const PageManager = () => {
    const { t, adminLang } = useAdminTranslation();
    const { data: settings, isLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [pageSettings, setPageSettings] = useState({
        page_blogs_enabled: true,
        page_gallery_enabled: true,
        page_poetry_enabled: true,
        page_live_enabled: true,
        page_donation_enabled: true,
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Pages configuration
    const pages = [
        {
            key: 'page_blogs_enabled',
            name: adminLang === 'hi' ? 'ब्लॉग्स' : 'Blogs',
            description: adminLang === 'hi' ? 'ब्लॉग पेज और सभी ब्लॉग पोस्ट' : 'Blog page and all blog posts',
            icon: '📝'
        },
        {
            key: 'page_gallery_enabled',
            name: adminLang === 'hi' ? 'गैलरी' : 'Gallery',
            description: adminLang === 'hi' ? 'फोटो और वीडियो गैलरी' : 'Photo and video gallery',
            icon: '🖼️'
        },
        {
            key: 'page_poetry_enabled',
            name: adminLang === 'hi' ? 'कविताएं' : 'Poetry',
            description: adminLang === 'hi' ? 'कविता संग्रह पेज' : 'Poetry collection page',
            icon: '📜'
        },
        {
            key: 'page_live_enabled',
            name: adminLang === 'hi' ? 'लाइव वीडियो' : 'Live Video',
            description: adminLang === 'hi' ? 'लाइव स्ट्रीमिंग सेक्शन' : 'Live streaming section',
            icon: '📺'
        },
        {
            key: 'page_donation_enabled',
            name: adminLang === 'hi' ? 'दान पेज' : 'Donation Page',
            description: adminLang === 'hi' ? 'दान/सहयोग पेज' : 'Donation/Support page',
            icon: '❤️'
        },
    ];

    useEffect(() => {
        if (settings) {
            setPageSettings({
                page_blogs_enabled: settings.page_blogs_enabled !== 'false',
                page_gallery_enabled: settings.page_gallery_enabled !== 'false',
                page_poetry_enabled: settings.page_poetry_enabled !== 'false',
                page_live_enabled: settings.page_live_enabled !== 'false',
                page_donation_enabled: settings.page_donation_enabled !== 'false',
            });
        }
    }, [settings]);

    const handleToggle = (key) => {
        setPageSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const settingsToSave = {};
            Object.keys(pageSettings).forEach(key => {
                settingsToSave[key] = pageSettings[key] ? 'true' : 'false';
            });

            await updateMutation.mutateAsync(settingsToSave);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                        <Layout className="text-red-600" />
                        {adminLang === 'hi' ? 'पेज मैनेजर' : 'Page Manager'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {adminLang === 'hi' ? 'वेबसाइट पेजों को enable/disable करें' : 'Enable or disable website pages'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${saved
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white hover:bg-red-700'
                        } disabled:opacity-50`}
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saved ? (adminLang === 'hi' ? 'सेव हो गया!' : 'Saved!') : (adminLang === 'hi' ? 'सेव करें' : 'Save Changes')}
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                    <p className="text-sm text-amber-800 dark:text-amber-400 font-bold">
                        {adminLang === 'hi' ? 'ध्यान दें:' : 'Note:'}
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                        {adminLang === 'hi'
                            ? 'Disabled पेज वेबसाइट पर नहीं दिखेंगे। Users को 404 error मिलेगा।'
                            : 'Disabled pages will not appear on the website. Users will see a 404 error.'}
                    </p>
                </div>
            </div>

            {/* Page Toggles */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                    {pages.map((page, index) => (
                        <motion.div
                            key={page.key}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-3xl">{page.icon}</span>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                                        {page.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {page.description}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggle(page.key)}
                                className={`p-2 rounded-xl transition-all ${pageSettings[page.key]
                                    ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                title={pageSettings[page.key] ? 'Enabled - Click to disable' : 'Disabled - Click to enable'}
                            >
                                {pageSettings[page.key] ? (
                                    <ToggleRight size={40} strokeWidth={1.5} />
                                ) : (
                                    <ToggleLeft size={40} strokeWidth={1.5} />
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                    <ToggleRight className="text-green-600" size={24} />
                    <span className="text-slate-600 dark:text-slate-400">
                        {adminLang === 'hi' ? 'सक्रिय (दिखाई दे रहा)' : 'Active (Visible)'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ToggleLeft className="text-slate-400" size={24} />
                    <span className="text-slate-600 dark:text-slate-400">
                        {adminLang === 'hi' ? 'निष्क्रिय (छुपा हुआ)' : 'Inactive (Hidden)'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PageManager;
