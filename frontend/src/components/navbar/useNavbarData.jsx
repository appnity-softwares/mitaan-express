import { useState, useEffect, useMemo } from 'react';
import {
    Home, Info, Image as ImageIcon, Video, Mail, Feather, FileText,
    BookOpen, Star, Globe, Trophy, Users,
    TrendingUp, Activity, History, PenTool, Brain, Palette,
    Award, Sunrise, Smile, Smartphone, Code, Search, Film,
    AlertTriangle, ShieldAlert, Landmark,
    Heart as HeartIcon
} from 'lucide-react';
import { fetchCategories } from '../../services/api';

const ICON_MAP = {
    'TrendingUp': <TrendingUp size={16} />,
    'Trophy': <Trophy size={16} />,
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
    'Code': <Code size={16} />,
    'Feather': <Feather size={16} />,
};

const NAV_ICON_MAP = { Home, Info, ImageIcon, Video, Mail, Feather, FileText, BookOpen, Star, Globe, Heart: HeartIcon, Trophy, Users };

export const useNavbarData = (language, settings) => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories().then(data => setCategories(data || []));
    }, []);

    const categoryTree = useMemo(() => {
        const lookup = {};
        const tree = [];

        const filtered = categories.filter(cat =>
            (cat._count?.articles || 0) > 0 || (cat._count?.blogs || 0) > 0 ||
            categories.some(c => c.parentId === cat.id && ((c._count?.articles || 0) > 0 || (c._count?.blogs || 0) > 0))
        );

        filtered.forEach(cat => { lookup[cat.id] = { ...cat, children: [] }; });
        filtered.forEach(cat => {
            if (cat.parentId && lookup[cat.parentId]) {
                lookup[cat.parentId].children.push(lookup[cat.id]);
            } else if (!cat.parentId) {
                tree.push(lookup[cat.id]);
            }
        });

        return tree.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    }, [categories]);

    const mainPages = useMemo(() => {
        const defaults = [
            { id: 'home', name: language === 'hi' ? 'मुख्य पृष्ठ' : 'Home', icon: <Home size={17} />, order: 0 },
            { id: 'about', name: language === 'hi' ? 'हमारे बारे में' : 'About Us', icon: <Info size={20} />, order: 1 },
            { id: 'gallery', name: language === 'hi' ? 'गैलरी' : 'Gallery', icon: <ImageIcon size={20} />, key: 'page_gallery_enabled', order: 2 },
            { id: 'video', name: language === 'hi' ? 'वीडियो' : 'Videos', icon: <Video size={20} />, key: 'page_live_enabled', order: 3 },
            { id: 'contact', name: language === 'hi' ? 'संपर्क करें' : 'Contact Us', icon: <Mail size={20} />, order: 4 },
            { id: 'poetry', name: language === 'hi' ? 'काव्य' : 'Poetry', icon: <Feather size={20} />, key: 'page_poetry_enabled', order: 5 },
            { id: 'insights', name: language === 'hi' ? 'ब्लॉग' : 'Blog', icon: <FileText size={20} />, key: 'page_blogs_enabled', order: 6 },
        ];

        let pages = defaults;
        try {
            if (settings?.navbar_items_json) {
                const customItems = JSON.parse(settings.navbar_items_json);
                if (Array.isArray(customItems) && customItems.length > 0) {
                    pages = customItems.map((item, idx) => {
                        const IconComp = NAV_ICON_MAP[item.icon] || Star;
                        return {
                            id: item.id || item.path || `custom-${idx}`,
                            name: language === 'hi' ? (item.nameHi || item.name) : item.name,
                            icon: <IconComp size={22} />,
                            key: item.pageKey || undefined,
                            order: item.order ?? idx,
                            path: item.path || undefined,
                            children: item.children || undefined,
                        };
                    });
                }
            }
        } catch (_) { }

        return pages
            .filter(p => !p.key || !settings || settings[p.key] !== 'false')
            .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
    }, [language, settings]);

    const newsItems = useMemo(() => [
        { id: 'trending', name: language === 'hi' ? 'ट्रेंडिंग' : 'Trending', desc: language === 'hi' ? 'लोकप्रिय समाचार' : 'Viral & Popular', icon: <TrendingUp size={16} />, path: '/trending' },
        { id: 'video', name: language === 'hi' ? 'वीडियो' : 'Videos', desc: language === 'hi' ? 'टीम अपडेट्स' : 'Team & Field Reports', icon: <Video size={16} />, path: '/video' },
        { id: 'insights', name: language === 'hi' ? 'इनसाइट्स' : 'Insights', desc: language === 'hi' ? 'विशेष विश्लेषण' : 'News & Analysis', icon: <FileText size={16} />, path: '/insights' },
        { id: 'gallery', name: language === 'hi' ? 'गैलरी' : 'Events', desc: language === 'hi' ? 'हमारी गतिविधियां' : 'Press & Meetups', icon: <ImageIcon size={16} />, path: '/gallery' },
    ], [language]);

    const headerQuickIcons = useMemo(() => {
        if (settings?.header_navbar_items) {
            const ids = settings.header_navbar_items.split(',').filter(Boolean);
            return ids.map(id => mainPages.find(p => p.id === id)).filter(Boolean);
        }
        return mainPages.slice(0, 2);
    }, [mainPages, settings]);

    return { categoryTree, mainPages, newsItems, headerQuickIcons, iconMap: ICON_MAP };
};
