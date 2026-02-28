import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
    LayoutDashboard, FileText, Image as ImageIcon, Settings, Users,
    LogOut, Globe, FolderTree, MessageSquare, BarChart3, Moon,
    Sun, Star, ChevronDown, ChevronRight, Activity, PenTool,
    Heart as HeartIcon, DollarSign, Layout, RefreshCcw, Info, Menu as MenuIcon,
    Feather, ExternalLink, Newspaper
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
        categories.forEach(cat => { lookup[cat.id] = { ...cat, children: [] }; });
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
        setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    const activeClass = "bg-red-50 dark:bg-red-900/10 text-red-600 border-r-4 border-red-600";
    const inactiveClass = "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50";

    const SectionLabel = ({ label }) => (
        <div className="px-4 pt-5 pb-2 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
            {label}
        </div>
    );

    const SidebarLink = ({ to, icon, label, end }) => (
        <NavLink
            to={to}
            end={end}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) => `group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-[13px] ${isActive ? activeClass : inactiveClass}`}
        >
            <span className="transition-transform group-hover:scale-110 shrink-0">{icon}</span>
            <span className="truncate">{label}</span>
        </NavLink>
    );

    return (
        <>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-white dark:bg-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} border-r border-slate-100 dark:border-white/5`}>
                <div className="h-full flex flex-col overflow-hidden">
                    {/* Logo */}
                    <div className="p-5 border-b border-slate-100 dark:border-white/5 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <img
                                src={formatImageUrl(settings?.logo_url) || logo}
                                alt="Logo"
                                className="w-9 h-9 object-contain rounded-lg bg-white shadow-sm"
                                onError={(e) => { e.target.onerror = null; e.target.src = logo; }}
                            />
                            <div className="min-w-0">
                                <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">
                                    {settings?.site_title || 'Mitaan Express'}
                                </h1>
                                <p className="text-[9px] font-bold text-red-600/70 uppercase tracking-[0.2em] -mt-0.5">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-2 overflow-y-auto sidebar-scroll space-y-0.5">

                        {/* Dashboard */}
                        <SidebarLink to="/admin" icon={<LayoutDashboard size={17} />} label={t('dashboard')} end />

                        {/* ━━━ CONTENT MANAGEMENT ━━━ */}
                        <SectionLabel label={t('content')} />

                        {/* Hierarchical Articles */}
                        <div className="flex flex-col border border-slate-100 dark:border-white/5 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-white/[0.02]">
                            <button
                                onClick={() => setIsArticlesExpanded(!isArticlesExpanded)}
                                className={`w-full flex items-center justify-between px-4 py-2.5 font-black transition-all text-[11px] uppercase tracking-widest ${isArticlesExpanded ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <Newspaper size={16} />
                                    {isArticlesExpanded ? (activeCategoryName || t('articles')) : t('articles')}
                                </div>
                                {isArticlesExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                            </button>

                            {isArticlesExpanded && (
                                <div className="max-h-[320px] overflow-y-auto sidebar-scroll p-2 space-y-0.5 bg-white dark:bg-slate-800/50">
                                    <NavLink
                                        to="/admin/articles"
                                        end
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={({ isActive }) => `w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold transition-all text-[11px] ${isActive ? "text-red-600 bg-red-50 dark:bg-red-900/10" : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"}`}
                                    >
                                        <Activity size={13} />
                                        {t('showAllStories') || 'All Stories'}
                                    </NavLink>
                                    <div className="my-1.5 border-t border-slate-50 dark:border-white/5 mx-2" />
                                    {categoryTree.map(parent => (
                                        <div key={parent.id} className="space-y-0.5">
                                            <button
                                                onClick={() => toggleCategory(parent.id)}
                                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${expandedCategories[parent.id] ? 'bg-slate-100/50 dark:bg-white/5 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-3.5 rounded-full" style={{ backgroundColor: parent.color || '#ef4444' }} />
                                                    <span className="truncate">{parent.nameHi || parent.name}</span>
                                                </div>
                                                {parent.children.length > 0 && (
                                                    expandedCategories[parent.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />
                                                )}
                                            </button>
                                            {expandedCategories[parent.id] && parent.children.length > 0 && (
                                                <div className="ml-4 space-y-0.5 border-l-2 border-slate-100 dark:border-white/5 pl-2 py-0.5">
                                                    {parent.children.map(child => (
                                                        <NavLink
                                                            key={child.id}
                                                            to={`/admin/articles/category/${child.id}`}
                                                            onClick={() => setIsSidebarOpen(false)}
                                                            className={({ isActive }) => `w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isActive ? "text-red-600 bg-red-50 dark:bg-red-900/10" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"}`}
                                                        >
                                                            {child.nameHi || child.name}
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <SidebarLink to="/admin/my-blogs" icon={<FileText size={17} />} label={t('myBlogs')} />
                        <SidebarLink to="/admin/categories" icon={<FolderTree size={17} />} label={t('categories')} />
                        <SidebarLink to="/admin/featured" icon={<Star size={17} />} label={t('featured')} />
                        <SidebarLink to="/admin/media" icon={<ImageIcon size={17} />} label={t('mediaLibrary') || 'Gallery'} />

                        {/* ━━━ SITE CUSTOMIZATION ━━━ */}
                        {isAdmin && (
                            <>
                                <SectionLabel label={t('siteCustomization')} />
                                <SidebarLink to="/admin/about" icon={<Info size={17} />} label={t('aboutPage')} />
                                <SidebarLink to="/admin/poetry" icon={<Feather size={17} />} label={t('featuredPoetry')} />
                                <SidebarLink to="/admin/navbar" icon={<MenuIcon size={17} />} label={t('navbarManager')} />
                                <SidebarLink to="/admin/ads" icon={<DollarSign size={17} />} label={t('ads')} />
                                <SidebarLink to="/admin/settings" icon={<Settings size={17} />} label={t('settings')} />
                            </>
                        )}

                        {/* ━━━ SYSTEM & TOOLS ━━━ */}
                        {isAdmin && (
                            <>
                                <SectionLabel label={t('systemTools')} />
                                <SidebarLink to="/admin/activity" icon={<Activity size={17} />} label={t('activityLogs') || 'Activity Logs'} />
                                <SidebarLink to="/admin/users" icon={<Users size={17} />} label={t('users')} />
                                <SidebarLink to="/admin/contacts" icon={<MessageSquare size={17} />} label={t('contacts')} />
                                <SidebarLink to="/admin/donations" icon={<HeartIcon size={17} />} label={t('donations')} />
                            </>
                        )}

                        <div className="my-4 border-t border-slate-100 dark:border-white/5" />

                        {/* View Website */}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all text-[13px] ${inactiveClass}`}
                        >
                            <ExternalLink size={17} className="transition-transform group-hover:rotate-12 shrink-0" />
                            <span className="truncate">View Website</span>
                        </a>
                    </nav>

                    {/* Bottom: Mobile controls */}
                    <div className="lg:hidden p-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0">
                        {user.name && (
                            <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-white/10 mb-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-md">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{user.name}</div>
                                    <div className="text-[9px] text-red-600 font-black uppercase tracking-widest">{user.role || 'Admin'}</div>
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition group"
                                title="Refresh"
                            >
                                <RefreshCcw size={16} className="text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-[8px] font-bold text-slate-400 mt-1">Refresh</span>
                            </button>
                            <button
                                onClick={toggleAdminLang}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 transition group"
                                title={t('changeLanguage')}
                            >
                                <Globe size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-bold text-slate-400 mt-1">Lang</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition group"
                                title={t('logout')}
                            >
                                <LogOut size={16} className="text-red-600 group-hover:scale-110 transition-transform" />
                                <span className="text-[8px] font-bold text-red-600 mt-1">{t('logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sidebar-scroll::-webkit-scrollbar { width: 3px; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .dark .sidebar-scroll::-webkit-scrollbar-thumb { background: #334155; }
            `}} />
        </>
    );
};

export default AdminSidebar;
