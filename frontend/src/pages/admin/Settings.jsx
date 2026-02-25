import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import { Save, Globe, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, Image, Type } from 'lucide-react';

const Settings = () => {
    // TanStack Query Hooks
    const { data: initialData, isLoading: initialLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [settings, setSettings] = useState({
        site_title: '',
        site_description: '',
        logo_url: '',
        footer_text: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        social_facebook: '',
        social_twitter: '',
        social_instagram: '',
        social_youtube: '',
        // Ad Management
        ad_homepage_top_code: '',
        ad_homepage_top_enabled: 'false',
        ad_article_top_code: '',
        ad_article_top_enabled: 'false',
        ad_article_bottom_code: '',
        ad_article_bottom_enabled: 'false',
    });

    useEffect(() => {
        if (initialData) {
            setSettings(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveSection = async (keys) => {
        try {
            const updateData = {};
            let hasData = false;

            // Only collect fields that have content
            keys.forEach(key => {
                const value = settings[key];
                if (value && String(value).trim() !== '') {
                    updateData[key] = value;
                    hasData = true;
                }
            });

            // Prevent saving if no data filled
            if (!hasData) {
                alert('⚠️ Please fill at least one field before saving!');
                return;
            }

            await updateMutation.mutateAsync(updateData);
            alert('✅ Section saved successfully!');
        } catch (error) {
            alert('❌ Failed to save section: ' + error.message);
        }
    };

    const loading = updateMutation.isPending;

    // Helper: Check if section has any data
    const hasSectionData = (keys) => {
        return keys.some(key => settings[key] && String(settings[key]).trim() !== '');
    };

    if (initialLoading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    return (
        <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Website Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage global site configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                                <Globe className="text-red-500" /> General Info
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['site_title', 'site_description', 'logo_url', 'footer_text'])}
                                disabled={loading || !hasSectionData(['site_title', 'site_description', 'logo_url', 'footer_text'])}
                                className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider transition-all ${hasSectionData(['site_title', 'site_description', 'logo_url', 'footer_text'])
                                    ? 'bg-red-600 text-white hover:scale-105 hover:shadow-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    } disabled:opacity-50`}
                                title={hasSectionData(['site_title', 'site_description', 'logo_url', 'footer_text']) ? 'Save Section' : 'Fill at least one field'}
                            >
                                {loading ? 'Saving...' : 'Save General'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Site Title</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="site_title"
                                    value={settings.site_title}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="Mitaan Express"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Site Description (SEO)</label>
                            <textarea
                                name="site_description"
                                value={settings.site_description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="Leading news portal..."
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Logo URL</label>
                            <div className="relative">
                                <Image className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="logo_url"
                                    value={settings.logo_url}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Footer Text</label>
                            <input
                                name="footer_text"
                                value={settings.footer_text}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                placeholder="© 2026 Mitaan Express. All rights reserved."
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                                <Phone className="text-green-500" /> Contact Info
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['contact_email', 'contact_phone', 'contact_address'])}
                                disabled={loading || !hasSectionData(['contact_email', 'contact_phone', 'contact_address'])}
                                className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider transition-all ${hasSectionData(['contact_email', 'contact_phone', 'contact_address'])
                                    ? 'bg-green-600 text-white hover:scale-105 hover:shadow-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    } disabled:opacity-50`}
                                title={hasSectionData(['contact_email', 'contact_phone', 'contact_address']) ? 'Save Section' : 'Fill at least one field'}
                            >
                                {loading ? 'Saving...' : 'Save Contact'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="contact_email"
                                    value={settings.contact_email}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="contact@mitaan.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="contact_phone"
                                    value={settings.contact_phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <textarea
                                    name="contact_address"
                                    value={settings.contact_address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="Raipur, Chhattisgarh, India"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
                                <Facebook className="text-blue-600" /> Social Media
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])}
                                disabled={loading || !hasSectionData(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])}
                                className={`px-4 py-2 font-bold rounded-lg text-xs uppercase tracking-wider transition-all ${hasSectionData(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])
                                    ? 'bg-blue-600 text-white hover:scale-105 hover:shadow-lg'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                                    } disabled:opacity-50`}
                                title={hasSectionData(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube']) ? 'Save Section' : 'Fill at least one field'}
                            >
                                {loading ? 'Saving...' : 'Save Social'}
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Facebook URL</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="social_facebook"
                                    value={settings.social_facebook}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Twitter (X) URL</label>
                            <div className="relative">
                                <Twitter className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="social_twitter"
                                    value={settings.social_twitter}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Instagram URL</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="social_instagram"
                                    value={settings.social_instagram}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">YouTube URL</label>
                            <div className="relative">
                                <Youtube className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    name="social_youtube"
                                    value={settings.social_youtube}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20"
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Settings;
