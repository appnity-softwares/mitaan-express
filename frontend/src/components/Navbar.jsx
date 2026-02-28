import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Menu, User, ChevronDown, Globe, X, Moon, Sun, ArrowRight,
    Image as ImageIcon, Video, Info, Mail, Home, TrendingUp,
    ShieldAlert, Landmark, Users, Trophy, Cpu, BookOpen,
    PenTool, Film, History, Sparkles, Activity, FileText,
    Feather, Share2, Instagram, Facebook, Twitter, AlertTriangle,
    Brain, Palette, Award, Star, Sunrise, Smile, Smartphone, Code, Heart as HeartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCategories, formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';
import { useSettings } from '../hooks/useQueries';
import LiveCounter from './LiveCounter';
import LanguagePopup from './LanguagePopup';
import SpotlightSearch from './SpotlightSearch';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

const Navbar = ({
    activeCategory,
    onCategoryChange,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    onLanguageChange
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [email, setEmail] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { data: settings } = useSettings();

    // Keyboard shortcut for search: Cmd/Ctrl + K
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const handleSubscribe = () => {
        if (!email) return toast.error('Please enter your email address');
        toast.success(`Thank you for subscribing!`);
        setEmail('');
    };



    const iconMap = {
        'TrendingUp': <TrendingUp size={16} />,
        'Trophy': <Trophy size={16} />,
        'Cpu': <Cpu size={16} />,
        'Feather': <Feather size={16} />,
        'ShieldAlert': <ShieldAlert size={16} />,
        'AlertTriangle': <AlertTriangle size={16} />,
        'Landmark': <Landmark size={16} />,
        'Users': <Users size={16} />,
        'Film': <Film size={16} />,
        'History': <History size={16} />,
        'Clock': <History size={16} />,
        'Activity': <Activity size={16} />,
        'Newspaper': <FileText size={16} />,
        'PenTool': <PenTool size={16} />,
        'FileText': <FileText size={16} />,
        'Brain': <Brain size={16} />,
        'BookOpen': <BookOpen size={16} />,
        'Search': <Search size={16} />,
        'Smile': <Smile size={16} />,
        'Palette': <Palette size={16} />,
        'Award': <Award size={16} />,
        'Star': <Star size={16} />,
        'Sunrise': <Sunrise size={16} />,
        'Heart': <Activity size={16} />,
        'Smartphone': <Smartphone size={16} />,
        'Code': <Code size={16} />
    };

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

        const loadCategories = async () => {
            const data = await fetchCategories();
            setCategories(data || []);
        };
        loadCategories();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const categoryTree = useMemo(() => {
        const tree = [];
        const lookup = {};

        categories.forEach(cat => {
            lookup[cat.id] = { ...cat, children: [] };
        });

        categories.forEach(cat => {
            if (cat.parentId && lookup[cat.parentId]) {
                lookup[cat.parentId].children.push(lookup[cat.id]);
            } else if (!cat.parentId) {
                tree.push(lookup[cat.id]);
            }
        });

        return tree.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }, [categories]);

    const isNavbarSolid = isScrolled || activeCategory !== 'home' || isMenuOpen;

    const handleLinkClick = (id, customPath) => {
        if (customPath) {
            window.location.href = customPath;
        } else {
            onCategoryChange(id);
        }
        setIsMenuOpen(false);
    };

    const mainPages = useMemo(() => {
        const defaultPages = [
            { id: 'home', name: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: <Home size={17} />, order: 0 },
            { id: 'about', name: language === 'hi' ? 'हमारे बारे में' : 'About Us', icon: <Info size={20} />, order: 1 },
            { id: 'gallery', name: language === 'hi' ? 'गैलरी' : 'Gallery', icon: <ImageIcon size={20} />, key: 'page_gallery_enabled', order: 2 },
            { id: 'video', name: language === 'hi' ? 'वीडियो' : 'Videos', icon: <Video size={20} />, key: 'page_live_enabled', order: 3 },
            { id: 'contact', name: language === 'hi' ? 'संपर्क करें' : 'Contact Us', icon: <Mail size={20} />, order: 4 },
            { id: 'poetry', name: language === 'hi' ? 'काव्य' : 'Poetry', icon: <Feather size={20} />, key: 'page_poetry_enabled', order: 5 },
            { id: 'blogs', name: language === 'hi' ? 'ब्लॉग' : 'Blog', icon: <FileText size={20} />, key: 'page_blogs_enabled', order: 6 },
        ];

        let pages = defaultPages;
        try {
            if (settings?.navbar_items_json) {
                const customItems = JSON.parse(settings.navbar_items_json);
                if (Array.isArray(customItems) && customItems.length > 0) {
                    const navIconMap = { Home, Info, ImageIcon, Video, Mail, Feather, FileText, BookOpen, Star, Globe, Heart: HeartIcon, Trophy, Users };
                    pages = customItems.map((item, idx) => {
                        const IconComp = navIconMap[item.icon] || Star;
                        return {
                            id: item.id || item.path || `custom-${idx}`,
                            name: language === 'hi' ? (item.nameHi || item.name) : item.name,
                            icon: <IconComp size={20} />,
                            key: item.pageKey || undefined,
                            order: item.order ?? idx,
                            path: item.path || undefined,
                            children: item.children || undefined,
                        };
                    });
                }
            }
        } catch (e) { }

        return pages
            .filter(p => !p.key || !settings || settings[p.key] !== 'false')
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    }, [language, settings]);

    const isDonationEnabled = !settings || settings.page_donation_enabled !== 'false';

    const socialLinks = [
        { name: 'Twitter', icon: <Twitter size={18} />, href: settings?.social_twitter || '#' },
        { name: 'Facebook', icon: <Facebook size={18} />, href: settings?.social_facebook || '#' },
        { name: 'Instagram', icon: <Instagram size={18} />, href: settings?.social_instagram || '#' },
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out ${isNavbarSolid
            ? 'bg-red-600/95 backdrop-blur-md shadow-xl py-2'
            : 'bg-transparent py-4'
            }`}>


            <nav className="max-w-[1600px] mx-auto px-4 lg:px-12 flex items-center justify-between relative h-14 lg:h-auto">
                {/* Left Section: Menu Toggle */}
                <div className="flex items-center justify-start z-10">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`flex items-center gap-3 lg:gap-4 group transition-colors shrink-0 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                    >
                        <div className="relative overflow-hidden w-6 h-6 flex flex-col justify-center gap-1.5 shrink-0">
                            <span className={`h-0.5 w-6 bg-current transition-transform duration-500 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`h-0.5 w-4 bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`h-0.5 w-6 bg-current transition-transform duration-500 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                        <span className="hidden lg:block text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-white/80 transition-colors">
                            {language === 'hi' ? (isMenuOpen ? 'बंद करें' : 'एक्सप्लोर') : (isMenuOpen ? 'Close' : 'Explore')}
                        </span>
                    </button>
                </div>

                {/* Center Section: Logo/Title */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center w-full max-w-fit pointer-events-auto">
                    <button onClick={() => handleLinkClick('home')} className="group flex items-center gap-2.5 lg:gap-3">
                        <img
                            src={formatImageUrl(settings?.logo_url) || logo}
                            alt="Mitaan Logo"
                            className="w-8 h-8 lg:w-10 lg:h-10 object-contain shadow-lg shadow-black/10 rounded-lg bg-white"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = logo;
                            }}
                        />
                        <div className="flex flex-col items-start leading-none">
                            <h1 className={`text-lg sm:text-xl lg:text-3xl font-black tracking-tighter font-serif transition-all duration-300 drop-shadow-sm whitespace-nowrap ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}>
                                {settings?.site_title || 'Mitaan Express'}
                            </h1>
                        </div>
                    </button>
                </div>

                {/* Right Section: Toggles & Donate */}
                <div className="flex items-center justify-end gap-3 lg:gap-8 z-10">
                    <div className="hidden lg:flex items-center gap-6">
                        <LiveCounter />
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer group ${isNavbarSolid ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white'}`}
                        >
                            <Search size={15} />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100 transition">
                                {language === 'hi' ? 'खोजें' : 'Search'}
                            </span>
                            <kbd className={`text-[9px] font-bold px-1.5 py-0.5 rounded hidden xl:inline-block ${isNavbarSolid ? 'bg-white/10' : 'bg-slate-200 dark:bg-white/10'}`}>⌘K</kbd>
                        </button>
                        <div className="relative">
                            <button onClick={toggleLanguage} className="bg-white text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-1.5 shadow-sm hover:scale-105 transition-all active:scale-95 border border-white/10">
                                <span className={language === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
                                <span className="opacity-30">/</span>
                                <span className={language === 'hi' ? 'opacity-100' : 'opacity-40'}>HI</span>
                            </button>
                            <LanguagePopup onSelect={onLanguageChange} />
                        </div>
                        <button onClick={toggleTheme} className={`transition-all hover:scale-110 hover:opacity-80 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}>
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>

                    {/* Mobile Search Button */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className={`p-2 rounded-full transition-all md:hidden ${isNavbarSolid ? 'text-white hover:bg-white/10' : 'text-red-600 hover:bg-red-50'}`}
                    >
                        <Search size={20} />
                    </button>

                    {isDonationEnabled && (
                        <button
                            onClick={() => window.location.href = '/donate'}
                            className={`hidden md:flex items-center gap-2 px-3 lg:px-6 py-2 rounded-full font-black text-[10px] lg:text-xs uppercase tracking-widest transition-all ${isNavbarSolid ? 'bg-white text-red-600 hover:bg-white/90' : 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'} shadow-sm shrink-0`}
                        >
                            <HeartIcon size={14} className="fill-current" />
                            <span className={language === 'hi' ? '' : 'hidden lg:inline'}>
                                {language === 'hi' ? 'सहयोग' : 'Donate'}
                            </span>
                        </button>
                    )}
                </div>
            </nav>

            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[-1]"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute top-full left-0 right-0 bg-white dark:bg-black shadow-2xl border-t border-slate-100 dark:border-white/5 overflow-hidden max-h-[95vh] overflow-y-auto"
                        >
                            <div className="max-w-[1600px] mx-auto px-6 lg:px-20 py-12 lg:py-20">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                                    {/* Column 1: Directory */}
                                    <div className="lg:col-span-3 space-y-10">
                                        {/* Mobile Only: Toggles - Compact Vertical Stack (Line by Line) */}
                                        <div className="lg:hidden flex flex-col gap-2 pb-8 border-b border-slate-100 dark:border-white/5">
                                            <div className="relative">
                                                <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-3 border border-slate-100 dark:border-white/10 rounded-xl transition-all active:scale-[0.98] bg-white dark:bg-white/10 shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <Globe size={18} className="text-red-600" />
                                                        <span className="text-[11px] font-black uppercase tracking-tight flex items-center gap-2 text-red-600 dark:text-red-500">
                                                            <span className={language === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
                                                            <span className="opacity-20">/</span>
                                                            <span className={language === 'hi' ? 'opacity-100' : 'opacity-40'}>HI</span>
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={14} className="text-red-600/50" />
                                                </button>
                                                <LanguagePopup onSelect={onLanguageChange} />
                                            </div>

                                            <button onClick={toggleTheme} className="flex items-center justify-between p-3 border border-slate-100 dark:border-white/10 rounded-xl transition-all active:scale-[0.98] bg-slate-50/50 dark:bg-white/5">
                                                <div className="flex items-center gap-3">
                                                    {theme === 'light' ? <Moon size={18} className="text-red-600" /> : <Sun size={18} className="text-red-600" />}
                                                    <span className="text-[11px] font-black uppercase tracking-tight">{theme === 'light' ? 'DARK MODE' : 'LIGHT MODE'}</span>
                                                </div>
                                                <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'light' ? 'bg-slate-200' : 'bg-red-600'}`}>
                                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${theme === 'light' ? 'left-1' : 'left-5'}`} />
                                                </div>
                                            </button>

                                            {isDonationEnabled && (
                                                <button
                                                    onClick={() => window.location.href = '/donate'}
                                                    className="flex items-center justify-between p-3 bg-red-600 text-white rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-red-600/20"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <HeartIcon size={18} className="fill-current text-white" />
                                                        <span className="text-[11px] font-black uppercase tracking-tight">{language === 'hi' ? 'सहयोग करें' : 'DONATE'}</span>
                                                    </div>
                                                    <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <span className="text-[8px] font-black text-red-600 uppercase tracking-[0.4em] mb-4 block opacity-60">
                                                {language === 'hi' ? 'पोर्टल निर्देशिका' : 'Navigation'}
                                            </span>
                                            <div className="flex flex-col gap-4">
                                                {mainPages.map((p, idx) => (
                                                    <div key={p.id}>
                                                        <motion.button
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            onClick={() => handleLinkClick(p.id, p.path)}
                                                            className={`group text-2xl font-black font-serif tracking-tighter text-left transition-all relative ${activeCategory === p.id
                                                                ? 'text-red-600'
                                                                : 'text-slate-900 dark:text-white hover:text-red-600'
                                                                }`}
                                                        >
                                                            <span className="relative z-10 group-hover:pl-4 transition-all duration-300 inline-block">
                                                                {p.name}
                                                            </span>
                                                        </motion.button>
                                                        {p.children && p.children.length > 0 && (
                                                            <div className="ml-6 mt-2 flex flex-col gap-2 border-l-2 border-red-200 dark:border-red-900/30 pl-4">
                                                                {p.children.map((child, cIdx) => (
                                                                    <button
                                                                        key={cIdx}
                                                                        onClick={() => handleLinkClick(child.id || child.path, child.path)}
                                                                        className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 transition text-left"
                                                                    >
                                                                        {language === 'hi' ? (child.nameHi || child.name) : child.name}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Categories Grid (Hierarchical) */}
                                    <div className="lg:col-span-6 space-y-10 lg:border-x border-slate-100 dark:border-white/5 px-0 lg:px-12 pt-8 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-white/5">
                                        <div className="space-y-8">
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block opacity-60 mb-8">
                                                {language === 'hi' ? 'विशेष श्रेणियां' : 'Featured Categories'}
                                            </span>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                {categoryTree.map((parent, pIdx) => (
                                                    <div key={parent.id} className="space-y-4">
                                                        <button
                                                            onClick={() => handleLinkClick(parent.slug || parent.id)}
                                                            className="flex items-center gap-3 group/parent w-full text-left"
                                                        >
                                                            <div className="w-1.5 h-6 rounded-full transition-all group-hover/parent:h-8" style={{ backgroundColor: parent.color || '#ef4444' }}></div>
                                                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover/parent:text-red-600 transition-colors">
                                                                {language === 'hi' ? parent.nameHi : parent.name}
                                                            </h3>
                                                        </button>
                                                        <div className="flex flex-col gap-3 pl-4">
                                                            {parent.children.map((child, cIdx) => (
                                                                <button
                                                                    key={child.id}
                                                                    onClick={() => handleLinkClick(child.slug || child.id)}
                                                                    className={`group flex items-center gap-3 text-xs font-bold transition-all text-left ${activeCategory === child.slug
                                                                        ? 'text-red-600'
                                                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                                        }`}
                                                                >
                                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 ${activeCategory === child.slug ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-50 dark:bg-white/5'
                                                                        }`}>
                                                                        {iconMap[child.icon] || <Star size={12} />}
                                                                    </div>
                                                                    <span className="group-hover:translate-x-1 transition-transform">
                                                                        {language === 'hi' ? child.nameHi : child.name}
                                                                    </span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Social & More */}
                                    <div className="lg:col-span-3 space-y-12">
                                        <div className="space-y-8">
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] block opacity-60">
                                                {language === 'hi' ? 'जुड़े रहें' : 'Connect With Us'}
                                            </span>
                                            <div className="grid grid-cols-2 gap-4">
                                                {socialLinks.map(link => (
                                                    <a
                                                        key={link.name}
                                                        href={link.href}
                                                        className="flex flex-col items-center justify-center p-4 border border-slate-100 dark:border-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all group shadow-sm bg-slate-50/50 dark:bg-white/5"
                                                    >
                                                        <div className="mb-2 transition-transform group-hover:scale-110">
                                                            {link.icon}
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{link.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-12 border-t border-slate-100 dark:border-white/5">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center lg:text-left">
                                                    {language === 'hi' ? 'सब्सक्राइब करें' : 'Newsletter'}
                                                </p>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed text-center lg:text-left">
                                                    {language === 'hi' ? 'हर सुबह चुनिंदा खबरें सीधे ईमेल पर।' : 'Top stories delivered daily to your inbox.'}
                                                </p>
                                            </div>
                                            <div className="relative group/input">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder={language === 'hi' ? 'email@example.com' : 'email@example.com'}
                                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-4 text-xs font-bold outline-none focus:border-red-600 transition-colors"
                                                />
                                                <button
                                                    onClick={handleSubscribe}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                                                >
                                                    <Share2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Spotlight Search Modal */}
            <SpotlightSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} language={language} />
        </header >
    );
};

export default Navbar;
