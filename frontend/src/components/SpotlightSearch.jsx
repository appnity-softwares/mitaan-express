import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, BookOpen, FolderOpen, ArrowRight, Clock, Command, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { globalSearch, formatImageUrl, PLACEHOLDER_IMAGE } from '../services/api';

const SpotlightSearch = ({ isOpen, onClose, language }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ articles: [], blogs: [], categories: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState([]);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]');
            setRecentSearches(saved);
        } catch (e) { }
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults({ articles: [], blogs: [], categories: [] });
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Keyboard shortcut: Cmd/Ctrl + K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose(); // Toggle - parent handles open
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const doSearch = useCallback(async (searchTerm) => {
        if (searchTerm.length < 2) {
            setResults({ articles: [], blogs: [], categories: [] });
            return;
        }
        setLoading(true);
        const data = await globalSearch(searchTerm);
        setResults(data);
        setSelectedIndex(0);
        setLoading(false);
    }, []);

    const handleQueryChange = (value) => {
        setQuery(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(value), 300);
    };

    const saveRecent = (term) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleNavigate = (path, title) => {
        if (query) saveRecent(query);
        onClose();
        navigate(path);
    };

    const allResults = [
        ...results.categories.map(c => ({ type: 'category', data: c })),
        ...results.articles.map(a => ({ type: 'article', data: a })),
        ...results.blogs.map(b => ({ type: 'blog', data: b })),
    ];

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            const item = allResults[selectedIndex];
            if (item.type === 'article') handleNavigate(`/article/${item.data.slug}`, item.data.title);
            else if (item.type === 'blog') handleNavigate(`/blog/${item.data.slug}`, item.data.title);
            else if (item.type === 'category') handleNavigate(`/category/${item.data.slug}`, item.data.name);
        }
    };

    const hasResults = allResults.length > 0;
    const hasQuery = query.length >= 2;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Search Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                        className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-[95vw] max-w-2xl z-[201]"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-100 dark:border-white/5">
                                <Search size={22} className="text-red-600 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleQueryChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={language === 'hi' ? 'पूरी वेबसाइट में खोजें...' : 'Search everything...'}
                                    className="flex-1 text-lg font-medium bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                    autoComplete="off"
                                />
                                <div className="flex items-center gap-2">
                                    {loading && (
                                        <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                        ESC
                                    </kbd>
                                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition">
                                        <X size={18} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Results Area */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {!hasQuery && !loading && (
                                    <div className="p-6 space-y-6">
                                        {recentSearches.length > 0 && (
                                            <div className="space-y-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                                    {language === 'hi' ? 'हाल की खोज' : 'Recent Searches'}
                                                </span>
                                                {recentSearches.map((term, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleQueryChange(term)}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition text-left group"
                                                    >
                                                        <Clock size={14} className="text-slate-300" />
                                                        <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition font-medium">{term}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                                                {language === 'hi' ? 'शॉर्टकट' : 'Quick Actions'}
                                            </span>
                                            {[
                                                { label: language === 'hi' ? 'ताज़ा खबर' : 'Latest News', path: '/', icon: <TrendingUp size={14} /> },
                                                { label: language === 'hi' ? 'ब्लॉग' : 'All Blogs', path: '/blogs', icon: <BookOpen size={14} /> },
                                                { label: language === 'hi' ? 'हमारे बारे में' : 'About Us', path: '/about', icon: <FileText size={14} /> },
                                            ].map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleNavigate(action.path)}
                                                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">{action.icon}</div>
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
                                                    </div>
                                                    <ArrowRight size={14} className="text-slate-300 group-hover:text-red-600 transition" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hasQuery && !loading && !hasResults && (
                                    <div className="p-12 text-center">
                                        <Search size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
                                        <p className="text-slate-500 font-bold">
                                            {language === 'hi' ? `"${query}" के लिए कोई परिणाम नहीं` : `No results for "${query}"`}
                                        </p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {language === 'hi' ? 'अलग keyword से खोजें' : 'Try a different keyword'}
                                        </p>
                                    </div>
                                )}

                                {hasResults && (
                                    <div className="space-y-2 py-2">
                                        {/* Categories */}
                                        {results.categories.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block py-1">
                                                    {language === 'hi' ? 'श्रेणियाँ' : 'Categories'}
                                                </span>
                                                {results.categories.map((cat, i) => {
                                                    const globalIdx = i;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => handleNavigate(`/category/${cat.slug}`, cat.name)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${selectedIndex === globalIdx ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: (cat.color || '#ef4444') + '15' }}>
                                                                <FolderOpen size={18} style={{ color: cat.color || '#ef4444' }} />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-slate-900 dark:text-white">{language === 'hi' ? cat.nameHi : cat.name}</div>
                                                                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Category</div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Articles */}
                                        {results.articles.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block py-1">
                                                    {language === 'hi' ? 'समाचार' : 'News Articles'}
                                                </span>
                                                {results.articles.map((article, i) => {
                                                    const globalIdx = results.categories.length + i;
                                                    return (
                                                        <button
                                                            key={article.id}
                                                            onClick={() => handleNavigate(`/article/${article.slug}`, article.title)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${selectedIndex === globalIdx ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                                                <img src={formatImageUrl(article.image) || PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{article.title}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
                                                                    <span className="text-red-600">{article.category?.name}</span>
                                                                    <span>•</span>
                                                                    <span>{article.author?.name}</span>
                                                                </div>
                                                            </div>
                                                            <ArrowRight size={14} className="text-slate-300 shrink-0" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Blogs */}
                                        {results.blogs.length > 0 && (
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block py-1">
                                                    {language === 'hi' ? 'ब्लॉग' : 'Blog Posts'}
                                                </span>
                                                {results.blogs.map((blog, i) => {
                                                    const globalIdx = results.categories.length + results.articles.length + i;
                                                    return (
                                                        <button
                                                            key={blog.id}
                                                            onClick={() => handleNavigate(`/blog/${blog.slug}`, blog.title)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${selectedIndex === globalIdx ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                        >
                                                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                                                                <img src={formatImageUrl(blog.image) || PLACEHOLDER_IMAGE} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{blog.title}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-2 mt-0.5">
                                                                    <BookOpen size={10} />
                                                                    <span>Blog</span>
                                                                    <span>•</span>
                                                                    <span>{blog.author?.name}</span>
                                                                </div>
                                                            </div>
                                                            <ArrowRight size={14} className="text-slate-300 shrink-0" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px]">↑↓</kbd> Navigate</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px]">↵</kbd> Open</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px]">Esc</kbd> Close</span>
                                </div>
                                <span className="text-red-600 font-black uppercase tracking-widest">Mitaan Search</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SpotlightSearch;
