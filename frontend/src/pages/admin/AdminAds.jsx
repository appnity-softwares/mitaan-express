import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { DollarSign, Image, Link as LinkIcon, Upload, Zap, X } from 'lucide-react';
import { useAdminTranslation } from '../../context/AdminTranslationContext';
import toast from 'react-hot-toast';

const AdminAds = () => {
    const { t } = useAdminTranslation();
    const { data: initialData, isLoading: initialLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [settings, setSettings] = useState({
        ad_homepage_top_image_url: '',
        ad_homepage_top_link_url: '',
        ad_homepage_top_enabled: 'false',
        ad_sidebar_image_url: '',
        ad_sidebar_link_url: '',
        ad_sidebar_enabled: 'false',
        ad_article_bottom_image_url: '',
        ad_article_bottom_link_url: '',
        ad_article_bottom_enabled: 'false',
        ad_in_article_image_url: '',
        ad_in_article_link_url: '',
        ad_in_article_enabled: 'false',
        ad_skyscraper_image_url: '',
        ad_skyscraper_link_url: '',
        ad_skyscraper_enabled: 'false',
        ad_popup_enabled: 'true',
        ad_popup_type: 'promo', // 'promo' or 'ad'
        ad_popup_image_url: '',
        ad_popup_link_url: '',
    });

    useEffect(() => {
        if (initialData) {
            setSettings(prev => ({
                ...prev,
                ad_homepage_top_image_url: initialData.ad_homepage_top_image_url || '',
                ad_homepage_top_link_url: initialData.ad_homepage_top_link_url || '',
                ad_homepage_top_enabled: initialData.ad_homepage_top_enabled || 'false',
                ad_sidebar_image_url: initialData.ad_sidebar_image_url || '',
                ad_sidebar_link_url: initialData.ad_sidebar_link_url || '',
                ad_sidebar_enabled: initialData.ad_sidebar_enabled || 'false',
                ad_article_bottom_image_url: initialData.ad_article_bottom_image_url || '',
                ad_article_bottom_link_url: initialData.ad_article_bottom_link_url || '',
                ad_article_bottom_enabled: initialData.ad_article_bottom_enabled || 'false',
                ad_in_article_image_url: initialData.ad_in_article_image_url || '',
                ad_in_article_link_url: initialData.ad_in_article_link_url || '',
                ad_in_article_enabled: initialData.ad_in_article_enabled || 'false',
                ad_skyscraper_image_url: initialData.ad_skyscraper_image_url || '',
                ad_skyscraper_link_url: initialData.ad_skyscraper_link_url || '',
                ad_skyscraper_enabled: initialData.ad_skyscraper_enabled || 'false',
                ad_popup_enabled: initialData.ad_popup_enabled || 'true',
                ad_popup_type: initialData.ad_popup_type || 'promo',
                ad_popup_image_url: initialData.ad_popup_image_url || '',
                ad_popup_link_url: initialData.ad_popup_link_url || '',
            }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAds = async () => {
        try {
            await updateMutation.mutateAsync(settings);
            toast.success('Advertisement settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings: ' + error.message);
        }
    };

    const loading = updateMutation.isPending;

    if (initialLoading) return <div className="p-8 text-center text-slate-500">Loading ad settings...</div>;

    const handleFileUpload = (e, imageKey) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                toast.error('File is too large. Base64 support is limited. Please use an image under 5MB or an external URL.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (re) => {
                setSettings(prev => ({ ...prev, [imageKey]: re.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (imageKey) => {
        if (window.confirm('Are you sure you want to remove this image?')) {
            setSettings(prev => ({ ...prev, [imageKey]: '' }));
        }
    };

    const AdSection = ({ title, imageKey, linkKey, enabledKey }) => (
        <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{title}</label>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={settings[enabledKey] === 'true'}
                        onChange={(e) => setSettings(prev => ({ ...prev, [enabledKey]: e.target.checked ? 'true' : 'false' }))}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ml-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {settings[enabledKey] === 'true' ? t('enabled') : t('disabled')}
                    </span>
                </label>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                        <Image size={14} />
                        <span>{t('image_source')}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name={imageKey}
                        value={settings[imageKey]}
                        onChange={handleChange}
                        className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
                        placeholder={t('upload_placeholder')}
                    />
                    <label className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors" title="Upload Image">
                        <Upload size={20} className="text-slate-600 dark:text-slate-300" />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, imageKey)}
                        />
                    </label>
                </div>
                <p className="text-[10px] text-slate-400">{t('supported_formats')}</p>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <LinkIcon size={14} />
                    <span>{t('target_url')}</span>
                </div>

                <input
                    type="text"
                    name={linkKey}
                    value={settings[linkKey]}
                    onChange={handleChange}
                    className="w-full p-3 bg-white dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
                    placeholder="https://example.com"
                />
            </div>

            {settings[imageKey] && (
                <div className="mt-3 p-2 bg-white dark:bg-slate-800 rounded-lg relative group">
                    <p className="text-xs font-bold text-slate-500 mb-2">{t('preview')}:</p>
                    <button
                        onClick={() => handleRemoveImage(imageKey)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700"
                        title={t('remove_image')}
                    >
                        <X size={14} />
                    </button>
                    <img
                        src={settings[imageKey]}
                        alt="Ad Preview"
                        className="w-full h-auto rounded border border-slate-200 dark:border-slate-700"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('adSettings')}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('manageAds')}</p>
                </div>
                <button
                    onClick={handleSaveAds}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-xs uppercase tracking-wider hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {loading ? t('saving') : t('save_changes')}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                        <Zap className="text-orange-500" /> {t('popup_type')}
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{t('enable_popup')}</label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.ad_popup_enabled === 'true'}
                                onChange={(e) => setSettings(prev => ({ ...prev, ad_popup_enabled: e.target.checked ? 'true' : 'false' }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.ad_popup_type === 'promo' ? 'border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="radio"
                                    name="ad_popup_type"
                                    value="promo"
                                    checked={settings.ad_popup_type === 'promo'}
                                    onChange={handleChange}
                                    className="text-red-600"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">{t('promo')}</span>
                            </div>
                            <p className="text-xs text-slate-500">{t('promo_desc')}</p>
                        </label>

                        <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${settings.ad_popup_type === 'ad' ? 'border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="radio"
                                    name="ad_popup_type"
                                    value="ad"
                                    checked={settings.ad_popup_type === 'ad'}
                                    onChange={handleChange}
                                    className="text-red-600"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">{t('custom_ad')}</span>
                            </div>
                            <p className="text-xs text-slate-500">{t('custom_ad_desc')}</p>
                        </label>
                    </div>

                    {settings.ad_popup_type === 'ad' && (
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="ad_popup_image_url"
                                    value={settings.ad_popup_image_url}
                                    onChange={handleChange}
                                    className="flex-1 p-3 bg-white dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
                                    placeholder={t('upload_placeholder')}
                                />
                                <label className="p-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg cursor-pointer transition-colors" title="Upload Image">
                                    <Upload size={20} className="text-slate-600 dark:text-slate-300" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e, 'ad_popup_image_url')}
                                    />
                                </label>
                            </div>
                            <input
                                type="text"
                                name="ad_popup_link_url"
                                value={settings.ad_popup_link_url}
                                onChange={handleChange}
                                className="w-full p-3 bg-white dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-red-500/20 text-sm"
                                placeholder={t('target_url')}
                            />
                            {settings.ad_popup_image_url && (
                                <div className="relative group">
                                    <button
                                        onClick={() => handleRemoveImage('ad_popup_image_url')}
                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-700 z-10"
                                        title={t('remove_image')}
                                    >
                                        <X size={14} />
                                    </button>
                                    <img src={settings.ad_popup_image_url} alt="Preview" className="h-40 w-auto rounded-lg object-contain bg-slate-100" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white mb-4">
                    <DollarSign className="text-green-500" /> {t('adPlacements')}
                </div>

                <AdSection
                    title={t('homepage_top')}
                    imageKey="ad_homepage_top_image_url"
                    linkKey="ad_homepage_top_link_url"
                    enabledKey="ad_homepage_top_enabled"
                />

                <AdSection
                    title={t('article_in_content')}
                    imageKey="ad_in_article_image_url"
                    linkKey="ad_in_article_link_url"
                    enabledKey="ad_in_article_enabled"
                />

                <AdSection
                    title={t('article_sidebar')}
                    imageKey="ad_sidebar_image_url"
                    linkKey="ad_sidebar_link_url"
                    enabledKey="ad_sidebar_enabled"
                />

                <AdSection
                    title={t('article_bottom')}
                    imageKey="ad_article_bottom_image_url"
                    linkKey="ad_article_bottom_link_url"
                    enabledKey="ad_article_bottom_enabled"
                />

                <AdSection
                    title="Article Sidebar Skyscraper"
                    imageKey="ad_skyscraper_image_url"
                    linkKey="ad_skyscraper_link_url"
                    enabledKey="ad_skyscraper_enabled"
                />
            </div>
        </div>
    );
};

export default AdminAds;
