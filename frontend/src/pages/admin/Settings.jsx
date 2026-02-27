import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import {
    Save, Globe, Phone, Mail, MapPin, Facebook, Twitter, Instagram,
    Youtube, Image, Type, Megaphone, Zap, Layout, Settings as SettingsIcon,
    ShieldCheck, BarChart3, Palette, BookOpen, Feather, PenTool,
    Heart as HeartIcon, Video, Star
} from 'lucide-react';
import toast from 'react-hot-toast';

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
        // Popup Modal Ad
        ad_popup_enabled: 'true',
        ad_popup_type: 'promo', // 'promo' (premium) or 'ad' (custom image)
        ad_popup_image_url: '',
        ad_popup_link_url: '',
        // Homepage Section Controls
        section_hero_enabled: 'true',
        section_ticker_enabled: 'true',
        section_indepth_enabled: 'true',
        section_poetry_enabled: 'true',
        section_gallery_enabled: 'true',
        section_live_enabled: 'true',
        // SEO & Advanced
        site_keywords: '',
        google_analytics_id: '',
        // Main Page Visibility
        page_gallery_enabled: 'true',
        page_live_enabled: 'true',
        page_poetry_enabled: 'true',
        page_blogs_enabled: 'true',
        page_donation_enabled: 'true',
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
            keys.forEach(key => {
                updateData[key] = settings[key];
            });

            await updateMutation.mutateAsync(updateData);
            toast.success('Settings updated successfully!');
        } catch (error) {
            toast.error('Failed to update settings: ' + error.message);
        }
    };

    const loading = updateMutation.isPending;

    if (initialLoading) return (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Zap className="animate-bounce text-red-600" size={48} />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Master Controls...</p>
        </div>
    );

    return (
        <div className="p-4 lg:p-8 space-y-12 max-w-7xl mx-auto pb-32">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 blur-[100px] -z-0"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter mb-2 flex items-center gap-4">
                        <SettingsIcon className="text-red-500 animate-spin-slow" size={40} />
                        Master Control
                    </h2>
                    <p className="text-slate-400 font-medium max-w-md">The central nervous system of Mitaan Express. Manage global branding, ads, and layout architecture here.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Traditional Settings */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-8">

                    {/* General & Branding */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b dark:border-white/5 pb-6">
                            <h3 className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                                <Palette className="text-red-500" /> Identity & Branding
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['site_title', 'site_description', 'logo_url', 'footer_text'])}
                                className="px-6 py-2 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-red-600/20"
                            >
                                {loading ? 'Saving...' : 'Save Branding'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Website Title</label>
                                <div className="relative">
                                    <Type className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        name="site_title"
                                        value={settings.site_title}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 font-bold border border-transparent focus:border-red-500/20 transition-all font-serif italic"
                                        placeholder="Mitaan Express"
                                        id="site_title"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="logo_url" className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Logo URL (Cloudflare R2 or External)</label>
                                <div className="relative">
                                    <Image className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        name="logo_url"
                                        id="logo_url"
                                        value={settings.logo_url}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 font-mono text-[10px]"
                                        placeholder="https://r2.mitaanexpress.com/logo.png"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="footer_text" className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Footer Rights & Text</label>
                                <input
                                    name="footer_text"
                                    id="footer_text"
                                    value={settings.footer_text}
                                    onChange={handleChange}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-red-500/20 font-medium"
                                    placeholder="© 2026 Mitaan Express. All rights reserved."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Intelligence */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b dark:border-white/5 pb-6">
                            <h3 className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                                <Phone className="text-emerald-500" /> Contact Hub
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['contact_email', 'contact_phone', 'contact_address'])}
                                className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                {loading ? '...' : 'Update Reach'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="contact_email" className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Business Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        name="contact_email"
                                        id="contact_email"
                                        value={settings.contact_email}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                        placeholder="contact@mitaanexpress.com"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="contact_phone" className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Toll Free / Office</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        name="contact_phone"
                                        id="contact_phone"
                                        value={settings.contact_phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                        placeholder="+91 000-000-0000"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="contact_address" className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Global HQ Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                    <input
                                        name="contact_address"
                                        id="contact_address"
                                        value={settings.contact_address}
                                        onChange={handleChange}
                                        className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                                        placeholder="Raipur, Chhattisgarh, India"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Link Ecosystem */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b dark:border-white/5 pb-6">
                            <h3 className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                                <Globe className="text-teal-500" /> Social Ecosystem
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])}
                                className="px-6 py-2 bg-teal-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-teal-600/20"
                            >
                                {loading ? '...' : 'Link Accounts'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: 'social_facebook', icon: <Facebook className="text-blue-600" />, label: 'Facebook URL' },
                                { name: 'social_twitter', icon: <Twitter className="text-sky-500" />, label: 'Twitter / X URL' },
                                { name: 'social_instagram', icon: <Instagram className="text-pink-600" />, label: 'Instagram URL' },
                                { name: 'social_youtube', icon: <Youtube className="text-red-600" />, label: 'YouTube Channel' },
                            ].map(social => (
                                <div key={social.name}>
                                    <label htmlFor={social.name} className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">{social.label}</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-4">{social.icon}</div>
                                        <input
                                            name={social.name}
                                            id={social.name}
                                            value={settings[social.name]}
                                            onChange={handleChange}
                                            className="w-full pl-10 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 font-bold"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Homepage Architecture */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
                        <div className="flex items-center justify-between border-b dark:border-white/5 pb-6">
                            <h3 className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                                <Layout className="text-emerald-500" /> Global Architecture
                            </h3>
                            <button
                                onClick={() => handleSaveSection([
                                    'section_hero_enabled', 'section_ticker_enabled', 'section_indepth_enabled',
                                    'section_poetry_enabled', 'section_gallery_enabled', 'section_live_enabled',
                                    'page_gallery_enabled', 'page_live_enabled', 'page_poetry_enabled',
                                    'page_blogs_enabled', 'page_donation_enabled'
                                ])}
                                className="px-6 py-2 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                {loading ? 'Saving...' : 'Lock Layout'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Homepage Modules</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'section_hero_enabled', name: 'Premium Hero Slider', desc: 'Floating cinematic slider', icon: <Star className="text-yellow-500" /> },
                                    { key: 'section_ticker_enabled', name: 'Breaking Marquee', desc: 'Live horizontal ticker', icon: <Zap className="text-red-500" /> },
                                    { key: 'section_indepth_enabled', name: 'In-Depth Articles', desc: 'Full-width thematic grids', icon: <BookOpen className="text-blue-500" /> },
                                    { key: 'section_poetry_enabled', name: 'Poetry Showcase', desc: 'Artistic highlighted banner', icon: <Feather className="text-indigo-500" /> },
                                    { key: 'section_gallery_enabled', name: 'Media Gallery', desc: 'Video & Image discovery', icon: <Image className="text-emerald-500" /> },
                                    { key: 'section_live_enabled', name: 'Live Stream Hub', desc: 'Real-time broadcast feed', icon: <Video className="text-red-600" /> },
                                ].map((section) => (
                                    <div key={section.key} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                {section.icon}
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tighter">{section.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{section.desc}</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <select
                                                name={section.key}
                                                aria-label={section.name}
                                                value={settings[section.key]}
                                                onChange={handleChange}
                                                className={`appearance-none px-4 py-2 rounded-xl font-black text-[10px] outline-none border-2 transition-all ${settings[section.key] === 'true'
                                                    ? 'bg-green-500/10 border-green-500 text-green-600'
                                                    : 'bg-red-500/10 border-red-500 text-red-600'
                                                    }`}
                                            >
                                                <option value="true">ACTIVE</option>
                                                <option value="false">HIDDEN</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] pt-4">Main Navigation Pages</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'page_gallery_enabled', name: 'Gallery Page', desc: 'Visual archive portal', icon: <Image className="text-blue-500" /> },
                                    { key: 'page_poetry_enabled', name: 'Poetry Page', desc: 'Dedicated artistic section', icon: <PenTool className="text-indigo-600" /> },
                                    { key: 'page_blogs_enabled', name: 'Blogs Section', desc: 'User-generated stories', icon: <BookOpen className="text-emerald-500" /> },
                                    { key: 'page_live_enabled', name: 'Video Library', desc: 'Broadcast video archive', icon: <Video className="text-red-500" /> },
                                    { key: 'page_donation_enabled', name: 'Donation Portal', desc: 'Support & Contributions', icon: <HeartIcon className="text-pink-500" /> },
                                ].map((page) => (
                                    <div key={page.key} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-emerald-500/50 transition-all cursor-default">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                {page.icon}
                                            </div>
                                            <div>
                                                <p className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-tighter">{page.name}</p>
                                                <p className="text-[10px] text-slate-500 font-medium">{page.desc}</p>
                                            </div>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <select
                                                name={page.key}
                                                aria-label={page.name}
                                                value={settings[page.key]}
                                                onChange={handleChange}
                                                className={`appearance-none px-4 py-2 rounded-xl font-black text-[10px] outline-none border-2 transition-all ${settings[page.key] === 'true'
                                                    ? 'bg-green-500/10 border-green-500 text-green-600'
                                                    : 'bg-red-500/10 border-red-500 text-red-600'
                                                    }`}
                                            >
                                                <option value="true">ENABLED</option>
                                                <option value="false">LOCKED</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Ads & SEO */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-8">

                    {/* Advertisement Master */}
                    <div className="bg-slate-900 p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-6">
                            <h3 className="flex items-center gap-2 font-black text-xl text-white uppercase tracking-tight">
                                <Megaphone className="text-orange-500" /> Ad Network
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['ad_popup_enabled', 'ad_popup_type', 'ad_popup_image_url', 'ad_popup_link_url'])}
                                className="px-6 py-2 bg-orange-600 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                {loading ? '...' : 'Sync Ads'}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Modal Popup */}
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-black text-white uppercase text-xs tracking-widest">Entry Ad Popup</h4>
                                        <p className="text-[10px] text-slate-500">Full-screen modal after 3 seconds</p>
                                    </div>
                                    <select
                                        name="ad_popup_enabled"
                                        value={settings.ad_popup_enabled}
                                        onChange={handleChange}
                                        className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase outline-none border transition-all ${settings.ad_popup_enabled === 'true' ? 'border-orange-500 text-orange-500' : 'border-slate-700 text-slate-700'
                                            }`}
                                    >
                                        <option value="true">ENABLE</option>
                                        <option value="false">DISABLE</option>
                                    </select>
                                </div>

                                {settings.ad_popup_enabled === 'true' && (
                                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/5">
                                        <select
                                            name="ad_popup_type"
                                            value={settings.ad_popup_type}
                                            onChange={handleChange}
                                            className="w-full p-3 bg-slate-800 rounded-xl outline-none focus:ring-1 focus:ring-orange-500 text-xs text-white font-bold"
                                        >
                                            <option value="promo">Premium Offer (System Default)</option>
                                            <option value="ad">Custom Visual Ad (External URL)</option>
                                        </select>

                                        {settings.ad_popup_type === 'ad' && (
                                            <>
                                                <input
                                                    name="ad_popup_image_url"
                                                    value={settings.ad_popup_image_url}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-slate-800 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                                                    placeholder="Custom Ad Image URL"
                                                />
                                                <input
                                                    name="ad_popup_link_url"
                                                    value={settings.ad_popup_link_url}
                                                    onChange={handleChange}
                                                    className="w-full p-3 bg-slate-800 rounded-xl outline-none text-xs text-white placeholder-slate-600"
                                                    placeholder="Destination Link"
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Meta & Analytics */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 font-black text-xs text-slate-800 dark:text-white uppercase tracking-widest">
                                <BarChart3 className="text-blue-500" /> SEO & Analytics
                            </h3>
                            <button
                                onClick={() => handleSaveSection(['site_keywords', 'google_analytics_id'])}
                                className="text-[10px] font-black uppercase text-blue-500 border-b-2 border-blue-500/20 hover:border-blue-500 transition-all pb-1"
                            >
                                {loading ? '...' : 'Quick Save'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <textarea
                                name="site_keywords"
                                value={settings.site_keywords}
                                onChange={handleChange}
                                rows={2}
                                className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-bold"
                                placeholder="Site keywords (SEO)..."
                            />
                            <div className="relative">
                                <ShieldCheck size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                <input
                                    name="google_analytics_id"
                                    value={settings.google_analytics_id}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-4 bg-white dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-mono"
                                    placeholder="G-Analytics ID"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 p-8 rounded-3xl text-white shadow-xl flex items-center justify-between group cursor-pointer overflow-hidden relative">
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 blur-2xl rounded-full group-hover:scale-150 transition-transform"></div>
                        <div className="relative z-10">
                            <h4 className="font-black uppercase text-xs tracking-widest mb-1">Developer Shield</h4>
                            <p className="text-[10px] text-white/70 italic">Backend system is running stable</p>
                        </div>
                        <ShieldCheck size={32} className="relative z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
