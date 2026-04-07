import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Facebook, Twitter, Instagram, Youtube, Mail, Phone, 
    ArrowRight 
} from 'lucide-react';
import { useSettings } from '../hooks/useQueries';
import { formatImageUrl } from '../services/api';

const Footer = ({ language }) => {
    const navigate = useNavigate();
    const { data: settings } = useSettings();

    const socialLinks = [
        { icon: <Facebook size={18} />, link: settings?.social_facebook || '#', color: 'hover:text-blue-600', label: 'Facebook' },
        { icon: <Twitter size={18} />, link: settings?.social_twitter || '#', color: 'hover:text-sky-500', label: 'Twitter' },
        { icon: <Instagram size={18} />, link: settings?.social_instagram || '#', color: 'hover:text-pink-600', label: 'Instagram' },
        { icon: <Youtube size={18} />, link: settings?.social_youtube || '#', color: 'hover:text-red-600', label: 'YouTube' }
    ];

    const quickLinks = [
        { name: language === 'hi' ? 'हमारे बारे में' : 'About Us', path: '/about' },
        { name: language === 'hi' ? 'संपर्क करें' : 'Contact', path: '/contact' },
        { name: language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy', path: '/privacy' },
        { name: language === 'hi' ? 'नियम और शर्तें' : 'Terms of Service', path: '/terms' }
    ];

    const categories = [
        { name: language === 'hi' ? 'राजनीति' : 'Politics', path: '/category/politics' },
        { name: language === 'hi' ? 'खेल' : 'Sports', path: '/category/sports' },
        { name: language === 'hi' ? 'मनोरंजन' : 'Entertainment', path: '/category/entertainment' },
        { name: language === 'hi' ? 'बिजनेस' : 'Business', path: '/category/business' }
    ];

    return (
        <footer className="bg-white dark:bg-[#030712] border-t border-slate-100 dark:border-white/5 pt-12 pb-8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Section: Staggered Dynamic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16 mb-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-5 space-y-8">
                        <div 
                            className="flex items-center gap-3 cursor-pointer group"
                            onClick={() => navigate('/')}
                        >
                            {settings?.logo_url ? (
                                <img src={formatImageUrl(settings.logo_url)} alt="Mitaan Express" className="h-12 w-auto object-contain" />
                            ) : (
                                <span className="mitaan-branding text-4xl">Mitaan Express</span>
                            )}
                        </div>
                        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-serif italic leading-relaxed max-w-full sm:max-w-md">
                            {language === 'hi' 
                                ? 'मितान एक्सप्रेस: सच्चाई की आवाज़, निष्पक्ष पत्रकारिता और गहरी अंतर्दृष्टि के लिए आपका विश्वसनीय स्रोत।' 
                                : 'Voice of Truth. Your trusted source for unbiased journalism, deep insights, and the latest stories from across the globe.'}
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, i) => (
                                <a
                                    key={i}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-500 ${social.color} hover:border-current transition-all bg-slate-50/50 dark:bg-white/5 hover:scale-110 shadow-sm`}
                                    aria-label={social.label}
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections: Fragmented Staggered Layout */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Explore</h4>
                            <ul className="space-y-4">
                                {categories.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.path} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-red-600 transition-colors"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Company</h4>
                            <ul className="space-y-4">
                                {quickLinks.map((link, i) => (
                                    <li key={i}>
                                        <Link to={link.path} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors flex items-center gap-2 group">
                                            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-white/10 group-hover:bg-red-600 transition-colors"></span>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-8 col-span-2 sm:col-span-1">
                            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Contact</h4>
                            <div className="space-y-6">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-red-600/10 rounded-lg">
                                        <Mail size={14} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                        <a href={`mailto:${settings?.site_email || 'hello@mitaanexpress.com'}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600">
                                            {settings?.site_email || 'hello@mitaanexpress.com'}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-2 bg-red-600/10 rounded-lg">
                                        <Phone size={14} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Office</p>
                                        <a href={`tel:${settings?.site_phone}`} className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600">
                                            {settings?.site_phone || '+91 9131-XXXXXX'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col items-center sm:flex-row justify-between gap-6 sm:gap-4">
                    <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium text-center sm:text-left">
                        © {new Date().getFullYear()} Mitaan Express. <br className="sm:hidden" />
                        Technology Partner: <a href="http://www.appnity.co.in" target="_blank" rel="noopener noreferrer" className="text-red-600/60 dark:text-red-500/50 hover:text-red-600 dark:hover:text-red-500 font-black uppercase tracking-widest transition-all">Appnity Softwares Private Limited</a>
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-3">
                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">English</button>
                            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">हिंदी</button>
                        </div>
                        <div className="hidden sm:block w-[1px] h-4 bg-slate-200 dark:bg-white/10 mx-2"></div>
                        <Link to="/contact" className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] hover:opacity-80 flex items-center gap-2">
                            Support <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
