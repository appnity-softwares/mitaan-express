import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, MapPin, Phone, Send, Youtube, MessageCircle, ArrowRight, Mail } from 'lucide-react';
import { useSettings } from '../hooks/useQueries';
import { useArticles } from '../context/ArticlesContext';
import { formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import logo from '../assets/logo.png';

const Footer = ({ language, onCategoryChange }) => {
    const navigate = useNavigate();
    const { data: settings } = useSettings();
    const { published } = useArticles();

    const footerNews = useMemo(() => {
        if (!published || published.length === 0) return [];
        // Sort by date desc just in case, though published is usually sorted
        const sorted = [...published].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return sorted.slice(0, 2).map(article => ({
            id: article.id,
            image: formatImageUrl(article.image),
            title: article.title,
            date: new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            category: article.category?.name || 'News',
            slug: article.slug
        }));
    }, [published]);

    const socialLinks = [
        { icon: <Twitter size={18} />, bg: 'hover:bg-[#1da1f2]', color: 'text-[#1da1f2]', href: settings?.social_twitter || '#' },
        { icon: <Facebook size={18} />, bg: 'hover:bg-[#3b5998]', color: 'text-[#3b5998]', href: settings?.social_facebook || '#' },
        { icon: <Instagram size={18} />, bg: 'hover:bg-[#e1306c]', color: 'text-[#e1306c]', href: settings?.social_instagram || '#' },
        { icon: <Youtube size={18} />, bg: 'hover:bg-[#ff0000]', color: 'text-[#ff0000]', href: settings?.social_youtube || '#' }
    ];

    const quickLinks = useMemo(() => {
        const links = language === 'hi'
            ? [
                { name: 'होम', id: 'home' },
                { name: 'गैलरी', id: 'gallery', key: 'page_gallery_enabled' },
                { name: 'वीडियो', id: 'video', key: 'page_live_enabled' },
                { name: 'काव्य', id: 'poetry', key: 'page_poetry_enabled' },
                { name: 'ब्लॉग', id: 'blogs', key: 'page_blogs_enabled' },
                { name: 'संपर्क', id: 'contact' }
            ]
            : [
                { name: 'Home', id: 'home' },
                { name: 'Gallery', id: 'gallery', key: 'page_gallery_enabled' },
                { name: 'Videos', id: 'video', key: 'page_live_enabled' },
                { name: 'Poetry', id: 'poetry', key: 'page_poetry_enabled' },
                { name: 'Blogs', id: 'blogs', key: 'page_blogs_enabled' },
                { name: 'Contact', id: 'contact' }
            ];

        return links.filter(l => !l.key || !settings || settings[l.key] !== 'false');
    }, [language, settings]);

    return (
        <footer className="relative bg-slate-200 dark:bg-[#0f172a] text-slate-900 dark:text-white pt-24 pb-12 overflow-hidden border-t border-slate-300 dark:border-white/10">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
                {/* Top Section: Branding & Newsletter */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20 pb-20 border-b border-slate-200 dark:border-white/5">
                    <div className="lg:col-span-5 space-y-8">
                        <div onClick={() => onCategoryChange('home')} className="flex items-center gap-4 cursor-pointer group">
                            <img src={settings?.logo_url || logo} alt="Mitaan Logo" className="w-12 h-12 object-contain shadow-lg shadow-red-600/20 rounded-xl bg-white group-hover:scale-110 transition-transform" />
                            <h2 className="text-3xl font-black font-serif tracking-tighter uppercase">
                                {settings?.site_title?.split(' ')[0] || 'MITAAN'} <span className="text-red-600">{settings?.site_title?.split(' ').slice(1).join(' ') || 'EXPRESS.'}</span>
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                            {language === 'hi'
                                ? 'मिटान का अर्थ है "मित्र"। हम निष्पक्ष पत्रकारिता और गहरी कहानियों के माध्यम से समाज को जोड़ने में विश्वास रखते हैं।'
                                : 'Mitaan means "Friend". We believe in connecting society through impartial journalism and deep-dive storytelling.'}
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:border-transparent hover:text-white ${social.bg} group`}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center">
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 lg:p-12 relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                                <MessageCircle size={120} />
                            </div>
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-bold font-serif">
                                        {language === 'hi' ? 'हमसे जुड़ें' : 'Get in Touch'}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                                        {language === 'hi' ? 'क्या आपके पास कोई कहानी या सुझाव है? हमें बताएं!' : 'Have a story or a suggestion? We are just a message away.'}
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                                            <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
                                                <Phone size={18} />
                                            </div>
                                            <span className="font-bold">{settings?.contact_phone || '+91 11 2345 6789'}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                                            <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-600">
                                                <Mail size={18} />
                                            </div>
                                            <span className="font-bold">{settings?.contact_email || 'contact@mitaanexpress.in'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end space-y-6 border-l border-slate-200 dark:border-white/5 pl-0 md:pl-12">
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em]">
                                        {language === 'hi' ? 'सोशल मीडिया' : 'SOCIAL CHANNELS'}
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => window.open(settings?.social_whatsapp || 'https://whatsapp.com', '_blank')}
                                            className="px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all flex items-center gap-2"
                                        >
                                            <Send size={14} />
                                            WhatsApp
                                        </button>
                                        <button
                                            onClick={() => window.open(settings?.social_instagram || 'https://instagram.com', '_blank')}
                                            className="px-6 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                                        >
                                            Instagram
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Links & Articles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16">
                    {/* Latest News Footer Grid */}
                    <div className="lg:col-span-4 space-y-10">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] flex items-center gap-4">
                            {language === 'hi' ? 'ताजा समाचार' : 'LATEST STORIES'}
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </h3>
                        <div className="grid grid-cols-1 gap-8">
                            {footerNews.map((news) => (
                                <motion.div
                                    key={news.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/article/${news.id}`)}
                                    className="flex gap-4 group cursor-pointer"
                                >
                                    <div className="w-24 h-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-white/5">
                                        <img
                                            src={news.image}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{news.category}</span>
                                            <span className="text-[9px] text-slate-500 font-bold">{news.date}</span>
                                        </div>
                                        <h4 className="text-sm font-bold leading-tight group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                                            {news.title}
                                        </h4>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="lg:col-span-2 space-y-10">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] flex items-center gap-4">
                            {language === 'hi' ? 'नेविगेट' : 'NAVIGATE'}
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </h3>
                        <div className="flex flex-col gap-4">
                            {quickLinks.map((link) => (
                                <button
                                    key={link.id}
                                    onClick={() => onCategoryChange(link.id)}
                                    className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-white transition-colors flex items-center gap-2 group text-left"
                                >
                                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-red-600" />
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* News Categories */}
                    <div className="lg:col-span-3 space-y-10">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] flex items-center gap-4">
                            {language === 'hi' ? 'श्रेणियां' : 'CATEGORIES'}
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {[
                                { id: 'economic', name: language === 'hi' ? 'आर्थिक' : 'Economy' },
                                { id: 'sports', name: language === 'hi' ? 'खेल' : 'Sports' },
                                { id: 'technical', name: language === 'hi' ? 'तकनीकी' : 'Tech' },
                                { id: 'poetry', name: language === 'hi' ? 'काव्य' : 'Poetry', key: 'page_poetry_enabled' },
                                { id: 'political', name: language === 'hi' ? 'राजनीति' : 'Politics' },
                                { id: 'social', name: language === 'hi' ? 'सामाजिक' : 'Social' },
                                { id: 'film', name: language === 'hi' ? 'सिनेमा' : 'Film' },
                                { id: 'history', name: language === 'hi' ? 'इतिहास' : 'History' }
                            ].filter(cat => !cat.key || !settings || settings[cat.key] !== 'false')
                                .map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => onCategoryChange(cat.id)}
                                        className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-white transition-colors flex items-center gap-2 group text-left"
                                    >
                                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all text-red-600" />
                                        {cat.name}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-3 space-y-10">
                        <h3 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] flex items-center gap-4">
                            {language === 'hi' ? 'संपर्क करें' : 'CONTACT'}
                            <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10"></div>
                        </h3>
                        <div className="space-y-6">
                            <div onClick={() => onCategoryChange('contact')} className="flex gap-4 cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 group-hover:border-red-600 transition-colors">
                                    <MapPin size={18} className="text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Office</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 transition-colors">{settings?.contact_address || 'New Delhi, India'}</p>
                                </div>
                            </div>
                            <div onClick={() => onCategoryChange('contact')} className="flex gap-4 cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10 group-hover:border-red-600 transition-colors">
                                    <MessageCircle size={18} className="text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Support</p>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-red-600 transition-colors">{settings?.contact_email || 'contact@mitaanexpress.in'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-24 pt-12 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-slate-500 text-sm font-medium">
                        {settings?.footer_text || (language === 'hi'
                            ? `© 2026 मिटान एक्सप्रेस। सभी अधिकार सुरक्षित।`
                            : `© 2026 Mitaan Express. All Rights Reserved.`)}
                    </p>
                    <div className="flex gap-8">
                        <button onClick={() => window.location.href = '/terms'} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest">
                            {language === 'hi' ? 'शर्तें' : 'Terms'}
                        </button>
                        <button onClick={() => window.location.href = '/privacy'} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest">
                            {language === 'hi' ? 'गोपनीयता' : 'Privacy'}
                        </button>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
