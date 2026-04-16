import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

import BackToTop from './components/BackToTop';
import { ArticlesProvider } from './context/ArticlesContext';
import { useSettings } from './hooks/useQueries';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './styles/quill-custom.css';

import LoadingSkeletons from './components/LoadingSkeletons';
import SEO from './components/SEO';
import { formatImageUrl } from './services/api';

// Lazy Loaded Pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const GalleryPage = React.lazy(() => import('./pages/GalleryPage'));
const VideoPage = React.lazy(() => import('./pages/VideoPage'));
const PoetryPage = React.lazy(() => import('./pages/PoetryPage'));
const BlogsPage = React.lazy(() => import('./pages/BlogsPage'));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage'));
const BlogDetailPage = React.lazy(() => import('./pages/BlogDetailPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const DonationPage = React.lazy(() => import('./pages/DonationPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const AuthorProfilePage = React.lazy(() => import('./pages/AuthorProfilePage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Static Pages
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

const App = () => {
    const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'hi');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const location = useLocation();
    const navigate = useNavigate();
    const { data: settings } = useSettings();

    // Page visibility helper
    const isPageEnabled = (pageKey) => {
        if (!settings) return true; // Default to enabled while loading
        return settings[pageKey] !== 'false';
    };

    // Determine active category based on URL for Navbar highlighting
    const activeCategory = useMemo(() => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/category/')) return path.split('/')[2];
        if (path.startsWith('/article/')) return 'article';
        return path.substring(1) || 'home';
    }, [location.pathname]);

    const isAdminRoute = location.pathname.startsWith('/admin');
    const shouldHideNavbar = isAdminRoute;

    useEffect(() => {
        // Prevent browser from restoring scroll position on refresh
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Global recovery for failed dynamic imports (stale chunks)
        const handleResourceError = (error) => {
            if (error?.message?.includes('Failed to fetch dynamically imported module') || 
                error?.message?.includes('Importing a discontinued module')) {
                console.warn('Stale asset detected. Synchronizing with latest server build...');
                window.location.reload();
            }
        };

        window.addEventListener('error', handleResourceError);
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason?.message?.includes('Failed to fetch dynamically imported module')) {
                handleResourceError(event.reason);
            }
        });

        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-out-cubic',
        });

        return () => {
            window.removeEventListener('error', handleResourceError);
        };
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Simple title setting based on path
        const baseTitle = 'Mitaan Express';
        const pageTitles = {
            '/': 'Home',
            '/about': 'About Us',
            '/contact': 'Contact Us',
            '/gallery': 'Gallery',
            '/video': 'Videos',
            '/poetry': 'Poetry',
            '/insights': 'Insights',
            '/terms': 'Terms and Conditions',
            '/privacy': 'Privacy Policy'
        };

        // This logic can be refined, but basic title update
        let pageTitle = pageTitles[location.pathname];
        if (!pageTitle && location.pathname.startsWith('/category/')) {
            const cat = location.pathname.split('/')[2];
            pageTitle = cat.charAt(0).toUpperCase() + cat.slice(1) + ' News';
        }

        if (pageTitle) {
            document.title = `${pageTitle} - ${baseTitle}`;
        }
    }, [location.pathname]);

    useEffect(() => {
        localStorage.setItem('lang', language);
        document.body.setAttribute('data-lang', language);
    }, [language]);

    useEffect(() => {
        if (isAdminRoute) return;
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
    }, [theme, isAdminRoute]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'hi' : 'en');

    // Navigation Handler for Navbar
    const handleCategoryChange = (id) => {
        if (id === 'home') navigate('/');
        else if (['about', 'contact', 'gallery', 'video', 'poetry', 'insights', 'trending'].includes(id)) navigate(`/${id}`);
        else navigate(`/category/${id}`);
        // Menu closing is handled inside Navbar usually, or Navbar will re-render
    };



    if (settings?.site_status_verified === 'pending') {
        return (
            <div className="fixed inset-0 z-[10000] bg-slate-950 flex items-center justify-center p-6 font-sans">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_70%)]"></div>
                <div className="max-w-md w-full text-center space-y-8 relative">
                    <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-red-600/20 animate-pulse">
                        <div className="text-red-600">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Platform Temporarily Restricted</h1>
                        <p className="text-slate-400 leading-relaxed">
                            This instance of <strong>Mitaan Express</strong> is currently undergoing a scheduled account verification process by the technology partner. 
                        </p>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
                        <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Status Code</p>
                        <p className="text-red-500 font-mono text-sm tracking-wider">ERR_ACCOUNT_REGISTRY_PENDING</p>
                        <p className="mt-4 text-xs text-slate-400">Please contact <a href="mailto:support@appnity.co.in" className="text-white underline underline-offset-4">support@appnity.co.in</a> for immediate reactivation.</p>
                    </div>
                    <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
                         <img src="https://www.appnity.co.in/images/logo.png" alt="Appnity Logo" className="h-4 mx-auto grayscale invert" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ArticlesProvider language={language}>
            {/* SEO and Navbar should be at the top level for accessibility and fixed positioning */}
            <SEO 
                title={settings?.site_title ? `${settings.site_title} - Premium News` : "Mitaan Express"}
                description={settings?.site_description || "Unbiased news, deep insights, and real-time updates from Mitaan Express."}
                image={formatImageUrl(settings?.logo_url) || "https://mitaanexpress.com/default-og.jpg"}
            />

            {!shouldHideNavbar && (
                <Navbar
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    language={language}
                    toggleLanguage={toggleLanguage}
                    onLanguageChange={setLanguage}
                />
            )}

            <div className={`min-h-screen ${theme} bg-white dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-300 font-sans selection:bg-red-600 selection:text-white relative`}>
                {/* Scroll Trigger for Navbar */}
                <div id="nav-trigger" className="absolute top-0 left-0 w-px h-10 pointer-events-none opacity-0"></div>

                <main className={`relative ${!shouldHideNavbar && activeCategory !== 'home' ? 'pt-14 lg:pt-20' : ''}`}>
                    <React.Suspense fallback={<LoadingSkeletons type="page" />}>
                        <AnimatePresence mode="wait">
                            <Routes location={location} key={location.pathname}>
                                <Route path="/" element={<HomePage language={language} />} />
                                {/* Static Pages */}
                                <Route path="/about" element={<AboutPage language={language} />} />
                                <Route path="/contact" element={<ContactPage language={language} />} />
                                <Route path="/terms" element={<TermsPage language={language} />} />
                                <Route path="/privacy" element={<PrivacyPage language={language} />} />
                                <Route path="/gallery" element={isPageEnabled('page_gallery_enabled') ? <GalleryPage language={language} /> : <Navigate to="/" replace />} />
                                <Route path="/video" element={isPageEnabled('page_live_enabled') ? <VideoPage language={language} /> : <Navigate to="/" replace />} />
                                <Route path="/poetry" element={isPageEnabled('page_poetry_enabled') ? <PoetryPage language={language} /> : <Navigate to="/" replace />} />
                                <Route path="/insights" element={isPageEnabled('page_blogs_enabled') ? <BlogsPage language={language} /> : <Navigate to="/" replace />} />
                                <Route path="/trending" element={<TrendingPage language={language} />} />
                                <Route path="/category/:categoryId" element={<CategoryPage language={language} />} />
                                <Route path="/article/:id" element={<ArticleDetailPage language={language} />} />
                                <Route path="/insight/:slug" element={isPageEnabled('page_blogs_enabled') ? <BlogDetailPage language={language} /> : <Navigate to="/" replace />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/signup" element={<SignupPage />} />
                                <Route path="/donate" element={isPageEnabled('page_donation_enabled') ? <DonationPage language={language} toggleLanguage={toggleLanguage} /> : <Navigate to="/" replace />} />
                                <Route path="/author/:id" element={<AuthorProfilePage language={language} />} />
                                <Route path="/search" element={<SearchPage language={language} />} />
                                <Route path="/admin/*" element={<AdminPage />} />
                                <Route path="*" element={<NotFoundPage />} />
                            </Routes>
                        </AnimatePresence>
                    </React.Suspense>
                </main>

                {!shouldHideNavbar && (
                    <>
                        <BackToTop />
                        <Footer language={language} />
                    </>
                )}
                <Toaster position="top-center" reverseOrder={false} />
            </div>
        </ArticlesProvider>
    );
};

export default App;
