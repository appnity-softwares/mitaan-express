import React, { useState, useEffect } from 'react';
import { useSettings } from '../../hooks/useQueries';
import { useUpdateSettings } from '../../hooks/useMutations';
import {
    Save, Globe, Phone, Mail, MapPin, Facebook, Twitter, Instagram,
    Youtube, Image, Type, Megaphone, Zap, Layout, Settings as SettingsIcon,
    ShieldCheck, BarChart3, Palette, BookOpen, Feather, PenTool,
    Heart as HeartIcon, Video, Star, Lock, Fingerprint, Upload, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
    const { data: initialData, isLoading: initialLoading } = useSettings();
    const updateMutation = useUpdateSettings();

    const [activeTab, setActiveTab] = useState('identity');
    const [settings, setSettings] = useState({
        site_title: '', site_description: '', logo_url: '', footer_text: '',
        contact_email: '', contact_phone: '', contact_address: '',
        social_facebook: '', social_twitter: '', social_instagram: '', social_youtube: '',
        ad_homepage_top_code: '', ad_homepage_top_enabled: 'false',
        ad_article_top_code: '', ad_article_top_enabled: 'false',
        ad_article_bottom_code: '', ad_article_bottom_enabled: 'false',
        ad_popup_enabled: 'true', ad_popup_type: 'promo', ad_popup_image_url: '', ad_popup_link_url: '',
        section_hero_enabled: 'true', section_ticker_enabled: 'true', section_indepth_enabled: 'true',
        section_poetry_enabled: 'true', section_gallery_enabled: 'true', section_live_enabled: 'true',
        hero_welcome_title: '', hero_welcome_subtitle: '', hero_welcome_image: '', hero_welcome_link: '',
        site_keywords: '', google_analytics_id: '',
        max_image_upload_size: '10', max_video_upload_size: '500',
        page_gallery_enabled: 'true', page_live_enabled: 'true', page_poetry_enabled: 'true',
        page_blogs_enabled: 'true', page_donation_enabled: 'true',
    });

    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);

    useEffect(() => {
        if (initialData) setSettings(prev => ({ ...prev, ...initialData }));
    }, [initialData]);

    const handleChange = (e) => setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSaveSection = async (keys) => {
        try {
            const updateData = {};
            keys.forEach(key => updateData[key] = settings[key]);
            await updateMutation.mutateAsync(updateData);
            toast.success('Configuration updated securely.');
        } catch (error) {
            toast.error('Update failed: ' + error.message);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Passwords mismatch');
        if (passwordData.newPassword.length < 6) return toast.error('Password too short');

        setIsPasswordChanging(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to change password');

            toast.success('Security key updated.');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsPasswordChanging(false);
        }
    };

    const tabs = [
        { id: 'identity', label: 'Identity & Brand', icon: Palette },
        { id: 'layout', label: 'Architecture', icon: Layout },
        { id: 'network', label: 'Ad Network', icon: Megaphone },
        { id: 'contacts', label: 'Reach & Social', icon: Globe },
        { id: 'advanced', label: 'Advanced Core', icon: SettingsIcon },
    ];

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Zap className="animate-bounce text-red-600" size={40} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Initializing Master Controls...</p>
        </div>
    );

    return (
        <div className="p-4 lg:p-10 max-w-7xl mx-auto pb-32">
            {/* Header */}
            <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Master Controls</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Configure core identity, ad operations, and system logic.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-black uppercase text-slate-500 tracking-wider">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    System Stable
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
                {/* Vertical Tabs Sidebar */}
                <div className="xl:w-64 shrink-0">
                    <div className="sticky top-8 bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-xl border border-slate-100 dark:border-white/5 flex flex-row xl:flex-col overflow-x-auto gap-2 no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            let activeClass = activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5';
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeClass}`}
                                >
                                    <Icon size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-white/5 p-6 lg:p-10 hidden-scrollbar min-h-[60vh]">
                    <AnimatePresence mode="wait">
                        {/* ━━━ IDENTITY & BRAND ━━━ */}
                        {activeTab === 'identity' && (
                            <motion.div key="identity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity & Brand</h2>
                                    <button onClick={() => handleSaveSection(['site_title', 'site_description', 'logo_url', 'footer_text'])} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg">Save Changes</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Website Title</label>
                                        <input name="site_title" value={settings.site_title} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-black text-lg font-serif" placeholder="Mitaan Express" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">High-Res Logo URL</label>
                                        <input name="logo_url" value={settings.logo_url} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-mono text-sm" placeholder="https://..." />
                                        {settings.logo_url && <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl inline-block border border-slate-200 dark:border-white/10"><img src={settings.logo_url} alt="Logo Preview" className="h-10 object-contain mx-auto" /></div>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Footer Legal Text</label>
                                        <input name="footer_text" value={settings.footer_text} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none focus:ring-2 ring-red-500 font-medium text-sm text-slate-600 dark:text-slate-300" placeholder="© 2026 Mitaan Express..." />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ━━━ ARCHITECTURE ━━━ */}
                        {activeTab === 'layout' && (
                            <motion.div key="layout" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Global Architecture</h2>
                                    <button onClick={() => handleSaveSection(['section_hero_enabled', 'section_ticker_enabled', 'section_indepth_enabled', 'section_poetry_enabled', 'section_gallery_enabled', 'section_live_enabled', 'page_gallery_enabled', 'page_live_enabled', 'page_poetry_enabled', 'page_blogs_enabled', 'page_donation_enabled', 'hero_welcome_title', 'hero_welcome_subtitle', 'hero_welcome_image', 'hero_welcome_link'])} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition shadow-lg">Lock Layout</button>
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Layout size={14} /> Homepage Modules</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'section_hero_enabled', name: 'Premium Hero Slider', icon: Star, color: 'text-amber-500' },
                                            { key: 'section_ticker_enabled', name: 'Breaking Marquee', icon: Zap, color: 'text-red-500' },
                                            { key: 'section_indepth_enabled', name: 'In-Depth Articles', icon: BookOpen, color: 'text-blue-500' },
                                            { key: 'section_poetry_enabled', name: 'Poetry Showcase', icon: Feather, color: 'text-indigo-500' },
                                            { key: 'section_gallery_enabled', name: 'Media Gallery Row', icon: Image, color: 'text-emerald-500' },
                                            { key: 'section_live_enabled', name: 'Live Stream Hub', icon: Video, color: 'text-red-600' },
                                        ].map((sec) => {
                                            const I = sec.icon;
                                            return (
                                                <div key={sec.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"><I size={18} className={sec.color} /></div>
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">{sec.name}</span>
                                                    </div>
                                                    <select name={sec.key} value={settings[sec.key]} onChange={handleChange} className={`px-3 py-1.5 rounded-lg text-[10px] font-black outline-none border-2 appearance-none cursor-pointer ${settings[sec.key] === 'true' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-red-50 text-red-600 border-red-500'}`}>
                                                        <option value="true">ACTIVE</option>
                                                        <option value="false">HIDDEN</option>
                                                    </select>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {settings.section_hero_enabled === 'true' && (
                                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                                            <h4 className="font-black text-[10px] uppercase text-slate-500 tracking-widest">System Welcome Slide (Hero)</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input name="hero_welcome_title" value={settings.hero_welcome_title} onChange={handleChange} className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm font-bold" placeholder="Welcome Headline" />
                                                <input name="hero_welcome_subtitle" value={settings.hero_welcome_subtitle} onChange={handleChange} className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm font-medium" placeholder="Subtext description" />
                                                <input name="hero_welcome_image" value={settings.hero_welcome_image} onChange={handleChange} className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm font-mono" placeholder="Background Image URL" />
                                                <input name="hero_welcome_link" value={settings.hero_welcome_link} onChange={handleChange} className="px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm font-mono" placeholder="Destination Link (e.g., /about)" />
                                            </div>
                                        </div>
                                    )}

                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pt-6"><Globe size={14} /> Core Pages</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'page_gallery_enabled', name: 'Gallery Page' },
                                            { key: 'page_poetry_enabled', name: 'Poetry Space' },
                                            { key: 'page_blogs_enabled', name: 'Blogs Portal' },
                                            { key: 'page_live_enabled', name: 'Video Archive' },
                                            { key: 'page_donation_enabled', name: 'Donation Platform' },
                                        ].map((sec) => (
                                            <div key={sec.key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5">
                                                <span className="font-bold text-sm text-slate-900 dark:text-white ml-2">{sec.name}</span>
                                                <select name={sec.key} value={settings[sec.key]} onChange={handleChange} className={`px-3 py-1.5 rounded-lg text-[10px] font-black outline-none border-2 appearance-none cursor-pointer ${settings[sec.key] === 'true' ? 'bg-emerald-50 text-emerald-600 border-emerald-500' : 'bg-red-50 text-red-600 border-red-500'}`}>
                                                    <option value="true">ENABLED</option>
                                                    <option value="false">LOCKED</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ━━━ AD NETWORK ━━━ */}
                        {activeTab === 'network' && (
                            <motion.div key="network" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ad Network & Promos</h2>
                                    <button onClick={() => handleSaveSection(['ad_popup_enabled', 'ad_popup_type', 'ad_popup_image_url', 'ad_popup_link_url'])} className="px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-orange-700 transition shadow-lg shadow-orange-600/20">Sync Ads</button>
                                </div>
                                <div className="p-8 bg-orange-50 dark:bg-orange-900/10 rounded-3xl border border-orange-100 dark:border-orange-900/20">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg mb-1">Entry Screen Takeover</h3>
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Modal that appears 3 seconds after a user enters the site.</p>
                                        </div>
                                        <select name="ad_popup_enabled" value={settings.ad_popup_enabled} onChange={handleChange} className={`px-5 py-2.5 rounded-xl text-xs font-black outline-none border-2 appearance-none cursor-pointer ${settings.ad_popup_enabled === 'true' ? 'bg-orange-100 text-orange-600 border-orange-500' : 'bg-transparent text-slate-500 border-slate-300'}`}>
                                            <option value="true">BROADCASTING</option>
                                            <option value="false">DISABLED</option>
                                        </select>
                                    </div>

                                    {settings.ad_popup_enabled === 'true' && (
                                        <div className="space-y-4 pt-6 border-t border-orange-200/50 dark:border-orange-500/20">
                                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Popup Type</label>
                                            <select name="ad_popup_type" value={settings.ad_popup_type} onChange={handleChange} className="w-full px-5 py-4 bg-white dark:bg-slate-800 rounded-2xl outline-none border border-transparent focus:border-orange-500 text-sm font-bold text-slate-900 dark:text-white">
                                                <option value="promo">System Premium Offer (Default)</option>
                                                <option value="ad">Custom Visual Ad</option>
                                            </select>

                                            {settings.ad_popup_type === 'ad' && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                    <input name="ad_popup_image_url" value={settings.ad_popup_image_url} onChange={handleChange} className="px-5 py-4 bg-white dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-orange-500 text-sm font-mono" placeholder="Creative Image URL" />
                                                    <input name="ad_popup_link_url" value={settings.ad_popup_link_url} onChange={handleChange} className="px-5 py-4 bg-white dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 ring-orange-500 text-sm font-mono" placeholder="Destination Link" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* ━━━ CONTACTS & SOCIAL ━━━ */}
                        {activeTab === 'contacts' && (
                            <motion.div key="contacts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/10 pb-4">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Reach & Social</h2>
                                    <button onClick={() => handleSaveSection(['contact_email', 'contact_phone', 'contact_address', 'social_facebook', 'social_twitter', 'social_instagram', 'social_youtube'])} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">Update Network</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Phone size={14} /> Corporate Contact</h3>
                                        <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Email</label><input name="contact_email" value={settings.contact_email} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-medium" /></div>
                                        <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Phone</label><input name="contact_phone" value={settings.contact_phone} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-medium" /></div>
                                        <div><label className="block text-[10px] font-black uppercase text-slate-500 mb-1 tracking-widest">Address</label><textarea rows="2" name="contact_address" value={settings.contact_address} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-medium" /></div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><Globe size={14} /> Social Ecosystem</h3>
                                        {[
                                            { key: 'social_facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                                            { key: 'social_twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
                                            { key: 'social_instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                                            { key: 'social_youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600' },
                                        ].map(soc => {
                                            const I = soc.icon;
                                            return (
                                                <div key={soc.key} className="relative">
                                                    <I size={16} className={`absolute left-4 top-3.5 ${soc.color}`} />
                                                    <input name={soc.key} value={settings[soc.key]} onChange={handleChange} placeholder={`https://${soc.label.toLowerCase()}...`} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-mono" />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ━━━ ADVANCED CORE ━━━ */}
                        {activeTab === 'advanced' && (
                            <motion.div key="advanced" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                    {/* Security Matrix */}
                                    <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-3xl border border-red-100 dark:border-red-500/10">
                                        <h3 className="text-xl font-black text-red-600 uppercase tracking-tight mb-6 flex items-center gap-2"><Lock size={20} /> Security Matrix</h3>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            <input type="password" required value={passwordData.currentPassword} onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm" placeholder="Current Admin Key" />
                                            <input type="password" required value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm" placeholder="New Security Key" />
                                            <input type="password" required value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none focus:ring-2 ring-red-500 text-sm" placeholder="Confirm New Key" />
                                            <button type="submit" disabled={isPasswordChanging} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition disabled:opacity-50">Generate New Key</button>
                                        </form>
                                    </div>

                                    <div className="space-y-8">
                                        {/* SEO Block */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">SEO & Analytics</h3>
                                                <button onClick={() => handleSaveSection(['site_keywords', 'google_analytics_id'])} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700">Quick Save</button>
                                            </div>
                                            <textarea name="site_keywords" rows="2" value={settings.site_keywords} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-medium" placeholder="Global meta keywords..." />
                                            <input name="google_analytics_id" value={settings.google_analytics_id} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-blue-500 text-sm font-mono" placeholder="G-XXXXXXXXXX" />
                                        </div>

                                        {/* Storage Rules */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end">
                                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1"><Upload size={12} /> Storage Rules</h3>
                                                <button onClick={() => handleSaveSection(['max_image_upload_size', 'max_video_upload_size'])} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700">Lock Limits</button>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="flex-1 relative">
                                                    <span className="absolute right-4 top-3.5 text-[10px] font-black text-slate-400">MB</span>
                                                    <input name="max_image_upload_size" type="number" value={settings.max_image_upload_size} onChange={handleChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-purple-500 text-sm font-bold" placeholder="IMG Max" />
                                                </div>
                                                <div className="flex-1 relative">
                                                    <span className="absolute right-4 top-3.5 text-[10px] font-black text-slate-400">MB</span>
                                                    <input name="max_video_upload_size" type="number" value={settings.max_video_upload_size} onChange={handleChange} className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl outline-none focus:ring-2 ring-purple-500 text-sm font-bold" placeholder="VID Max" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
