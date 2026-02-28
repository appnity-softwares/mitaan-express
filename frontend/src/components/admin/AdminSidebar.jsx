import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Image as ImageIcon, Settings, Users,
    LogOut, Globe, FolderTree, MessageSquare, BarChart3, Moon,
    Sun, Star, ChevronDown, ChevronRight, Activity, Newspaper,
    PenTool, Film, Heart as HeartIcon, DollarSign, Layout, RefreshCcw
} from 'lucide-react';
import { fetchCategories } from '../../services/api';
import { useSettings } from '../../hooks/useQueries';
import { formatImageUrl } from '../../services/api';
import logo from '../../assets/logo.png';
import { useAdminTranslation } from '../../context/AdminTranslationContext';

const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen, handleLogout, theme, toggleTheme }) => {
    const { t, toggleAdminLang } = useAdminTranslation();
    const location = useLocation();
    const { categoryId } = useParams();
    const { data: settings } = useSettings();

    const [isArticlesExpanded, setIsArticlesExpanded] = useState(false);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [activeCategoryName, setActiveCategoryName] = useState('');

    useEffect(() => {
        if (location.pathname.startsWith('/admin/articles')) {
            setIsArticlesExpanded(true);
        }
    }, [location.pathname]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(data || []);
            } catch (error) {
                console.error('Error loading categories for sidebar:', error);
            }
        };
        loadCategories();
    }, []);

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

    useEffect(() => {
        if (categoryId) {
            const catIdNum = parseInt(categoryId);
            const activeCat = categories.find(c => c.id === catIdNum);
            if (activeCat) {
                setActiveCategoryName(activeCat.name);
                if (activeCat.parentId) {
                    setExpandedCategories(prev => ({ ...prev, [activeCat.parentId]: true }));
                }
            }
        } else {
            setActiveCategoryName('');
        }
    }, [categoryId, categories]);

    const toggleCategory = (id) => {
        setExpandedCategories(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const navItems = [
        { name: t('dashboard'), path: '/admin', icon: <LayoutDashboard size={18} />, end: true, adminOnly: false },
        { name: t('articles'), path: '/admin/articles', icon: <FileText size={18} />, adminOnly: false },
        { name: t('myBlogs'), path: '/admin/my-blogs', icon: <FileText size={18} />, adminOnly: false },
        { name: t('categories'), path: '/admin/categories', icon: <FolderTree size={18} />, adminOnly: false },
        { name: t('featured'), path: '/admin/featured', icon: <Star size={18} />, adminOnly: false },
        { name: t('analytics'), path: '/admin/analytics', icon: <BarChart3 size={18} />, adminOnly: true },
        { name: t('activityLogs') || 'Activity Logs', path: '/admin/activity', icon: <Activity size={18} />, adminOnly: true },
        { name: t('users'), path: '/admin/users', icon: <Users size={18} />, adminOnly: true },
        { name: t('mediaLibrary') || 'Gallery', path: '/admin/media', icon: <ImageIcon size={18} />, adminOnly: false },
        { name: t('ads'), path: '/admin/ads', icon: <DollarSign size={18} />, adminOnly: true },
        { name: t('contacts') || 'Contacts', path: '/admin/contacts', icon: <MessageSquare size={18} />, adminOnly: true },
        { name: t('settings'), path: '/admin/settings', icon: <Settings size={18} />, adminOnly: true },
        { name: t('donations'), path: '/admin/donations', icon: <HeartIcon size={18} />, adminOnly: true },
        { name: t('pageManager') || 'Page Manager', path: '/admin/pages', icon: <Layout size={18} />, adminOnly: true },
    ].filter(item => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (item.adminOnly && user.role !== 'ADMIN') return false;
        return true;
    });

    const activeClass = "bg-red-50 dark:bg-red-900/10 text-red-600 border-r-4 border-red-600 shadow-[inset_-4px_0_0_0_#ef4444]";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50";

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed lg:sticky top-0 left-0 z-50 w-72 h-screen bg-white dark:bg-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Logo Area */}
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={formatImageUrl(settings?.logo_url) || logo}
                                alt="Mitaan Logo"
                                className="w-10 h-10 object-contain shadow-sm rounded-lg bg-white"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = logo;
                                }}
                            />
                            <div>
                                <h1 className="text-xl gap-2 font-black text-slate-900 dark:text-white uppercase tracking-tighter line-clamp-1">
                                    {settings?.site_title || 'Mitaan Express'}
                                </h1>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] -mt-1">Admin Portal</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation - This area should scroll */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto categories-scroll">
                        <NavLink
                            to="/admin"
                            end
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => `group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${isActive ? activeClass : inactiveClass}`}
                        >
                            <LayoutDashboard size={18} className="transition-transform group-hover:scale-110" />
                            {t('dashboard')}
                        </NavLink>

                        {/* News Feed Section Label */}
                        <div className="px-4 py-2 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                            {t('content') || 'Content Management'}
                        </div>

                        {/* Hierarchical Articles Section */}
                        <div className="flex flex-col border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-white/5">
                            <button
                                onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
                                className={`w-full flex items-center justify-between px-4 py-3 font-black transition-all text-xs uppercase tracking-widest ${isArticlesExpanded ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={18} />
                                    {isArticlesExpanded ? (activeCategoryName || t('articles')) : t('articles')}
                                </div>
                                {isArticlesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {isArticlesExpanded && (
                                <div className="flex-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 p-2 space-y-1 bg-white dark:bg-slate-800/50">
                                    <NavLink
                                        to="/admin/articles"
                                        end
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-xs uppercase tracking-tighter ${isActive ? "text-red-600 bg-red-50 dark:bg-red-900/10 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                                    >
                                        <Activity size={14} />
                                        {t('showAllStories') || 'Show All Stories'}
                                    </NavLink>

                                    <div className="my-2 border-t border-slate-50 dark:border-white/5 mx-2" />

                                    {/* Sub-Tree for Categories */}
                                    <div className="space-y-2">
                                        {categoryTree.map(parent => (
                                            <div key={parent.id} className="space-y-1">
                                                <button
                                                    onClick={() => toggleCategory(parent.id)}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all ${expandedCategories[parent.id] ? 'bg-slate-100/50 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: parent.color || '#ef4444' }}></div>
                                                        {parent.nameHi} / {parent.name}
                                                    </div>
                                                    {parent.children.length > 0 && (
                                                        expandedCategories[parent.id] ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                                                    )}
                                                </button>

                                                {(expandedCategories[parent.id]) && parent.children.length > 0 && (
                                                    <div className="ml-4 space-y-1 border-l border-slate-100 dark:border-white/5 pl-2 py-1">
                                                        {parent.children.map(child => (
                                                            <NavLink
                                                                key={child.id}
                                                                to={`/admin/articles/category/${child.id}`}
                                                                onClick={() => setIsSidebarOpen(false)}
                                                                className={({ isActive }) => `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${isActive ? "text-red-600 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-600" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
                                                            >
                                                                {child.nameHi} / {child.name}
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Other Items */}
                        <div className="px-4 py-2 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                            {t('system') || 'System & More'}
                        </div>

                        {navItems.filter(item => item.path !== '/admin' && item.path !== '/admin/articles').map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) => `group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${isActive ? activeClass : inactiveClass}`}
                            >
                                <span className="transition-transform group-hover:scale-110">{item.icon}</span>
                                {item.name}
                            </NavLink>
                        ))}

                        <div className="my-6 border-t border-slate-100 dark:border-white/5" />

                        <a
                            href="/"
                            target="_blank"
                            className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${inactiveClass}`}
                        >
                            <Globe size={18} className="transition-transform group-hover:rotate-12" />
                            View Website
                        </a>
                    </nav>

                    {/* Bottom Section - Mobile Only */}
                    <div className="lg:hidden p-4 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                        {/* User Profile */}
                        {(() => {
                            const user = JSON.parse(localStorage.getItem('user') || '{}');
                            if (user.name) {
                                return (
                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
                                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                {user.name}
                                            </div>
                                            <div className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-widest truncate">
                                                {user.role || 'Administrator'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })()}

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group"
                                title="Refresh Page"
                            >
                                <RefreshCcw size={18} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-[9px] font-bold text-slate-500 mt-1">Refresh</span>
                            </button>

                            <button
                                onClick={toggleAdminLang}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all group"
                                title={t('changeLanguage')}
                            >
                                <Globe size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group"
                                title={t('logout')}
                            >
                                <LogOut size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[9px] font-bold text-red-600 mt-1">{t('logout')}</span>
                            </button>
                        </div>
                    </div>

                </div>
            </aside>

            <style dangerouslySetInnerHTML={{
                __html: `
                .categories-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .categories-scroll::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .dark .categories-scroll::-webkit-scrollbar-thumb {
                    background: #334155;
                }
            ` }} />
        </>
    );
};

export default AdminSidebar;
