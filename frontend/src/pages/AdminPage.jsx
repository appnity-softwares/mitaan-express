import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AdminTranslationProvider, useAdminTranslation } from '../context/AdminTranslationContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import ArticleList from './admin/ArticleList';

import ArticleEditor from './admin/ArticleEditor';
import BlogEditor from './admin/BlogEditor';
import Settings from './admin/Settings';
import Categories from './admin/Categories';
import { Menu, Moon, Sun, LogOut, Globe, ChevronDown, RefreshCcw } from 'lucide-react';

import MediaLibrary from './admin/MediaLibrary';
import Analytics from './admin/Analytics';
import ActivityLogs from './admin/ActivityLogs';
import Users from './admin/Users';
import AdminAds from './admin/AdminAds';
import PageManager from './admin/PageManager';
import AdminContacts from './admin/Contacts';
import MyBlogs from './admin/MyBlogs';
import FeaturedContent from './admin/FeaturedContent';
import AdminDonations from './admin/AdminDonations';

// Placeholders




const AdminContent = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [theme, setTheme] = useState(() => localStorage.getItem('adminTheme') || 'light');
    const { adminLang, toggleAdminLang, t } = useAdminTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    // Get User Data
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Close dropdown when clicking outside (simple implementation)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isProfileOpen && !event.target.closest('.user-dropdown-container')) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isProfileOpen]);

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [token]);

    useEffect(() => {
        localStorage.setItem('adminTheme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.backgroundColor = '#0b0f1a';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.backgroundColor = '#f1f5f9';
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setIsAuthenticated(false);
        navigate('/admin');
    };

    if (!isAuthenticated) {
        return <AdminLogin setToken={setToken} />;
    }

    return (
        <div className="min-h-screen bg-slate-200 dark:bg-black flex lg:gap-4 transition-colors duration-300 font-sans">
            <AdminSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                handleLogout={handleLogout}
                theme={theme}
                toggleTheme={toggleTheme}
            />

            <main className="flex-1 min-w-0 overflow-y-auto h-screen relative bg-slate-50 dark:bg-[#0b0f1a]">
                {/* Mobile Header */}
                <div className="lg:hidden p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-800 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-sm">M</div>
                        <span className="font-bold text-slate-900 dark:text-white">Admin</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-all"
                            title="Refresh"
                        >
                            <RefreshCcw size={20} />
                        </button>
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 dark:text-slate-400">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Desktop Top Bar */}
                <div className="hidden lg:flex items-center justify-end gap-3 px-8 py-4 sticky top-0 z-30 bg-white/80 dark:bg-[#0b0f1a]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-white/5">
                    {/* Language Toggle */}
                    <button
                        onClick={toggleAdminLang}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                        title="Switch Language"
                    >
                        <Globe size={18} />
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer group"
                        title="Refresh Page"
                    >
                        <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                    </button>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                        title={theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
                    </button>

                    {/* User Profile Dropdown */}
                    <div className="relative user-dropdown-container">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-red-200 dark:hover:border-red-900/30 transition-all group cursor-pointer"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-500/20">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="flex flex-col items-start px-1">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                    {user.name || 'Admin'}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 border border-slate-100 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5">
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{user.name || 'Administrator'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user.email || 'admin@mitaan.com'}</p>
                                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                        {user.role || 'Super Admin'}
                                    </div>
                                </div>
                                <div className="p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-left"
                                    >
                                        <LogOut size={16} />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/articles" element={<ArticleList />} />
                        <Route path="/articles/category/:categoryId" element={<ArticleList />} />
                        <Route path="/my-blogs" element={<MyBlogs />} />
                        <Route path="/my-blogs/new" element={<BlogEditor />} />
                        <Route path="/my-blogs/edit/:id" element={<BlogEditor />} />
                        <Route path="/articles/new" element={<ArticleEditor />} />
                        <Route path="/articles/edit/:id" element={<ArticleEditor />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/activity" element={<ActivityLogs />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/featured" element={<FeaturedContent />} />
                        <Route path="/media" element={<MediaLibrary />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/contacts" element={<AdminContacts />} />
                        <Route path="/donations" element={<AdminDonations />} />
                        <Route path="/ads" element={<AdminAds />} />
                        <Route path="/pages" element={<PageManager />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

const AdminPage = () => {
    return (
        <AdminTranslationProvider>
            <AdminContent />
        </AdminTranslationProvider>
    );
};

export default AdminPage;
