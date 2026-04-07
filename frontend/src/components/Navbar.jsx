import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Twitter, Facebook, Instagram } from 'lucide-react';

import { useSettings } from '../hooks/useQueries';
import SpotlightSearch from './SpotlightSearch';
import { useNavbarData } from './navbar/useNavbarData.jsx';
import NavbarLogo from './navbar/NavbarLogo';
import NavbarDesktopLeft from './navbar/NavbarDesktopLeft';
import NavbarDesktopRight from './navbar/NavbarDesktopRight';
import NavbarMobileMenu from './navbar/NavbarMobileMenu';
import toast from 'react-hot-toast';

const Navbar = ({
    activeCategory,
    onCategoryChange,
    theme,
    toggleTheme,
    language,
    toggleLanguage,
    onLanguageChange,
}) => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { data: settings } = useSettings();

    const { categoryTree, mainPages, newsItems, headerQuickIcons, iconMap } = useNavbarData(language, settings);

    // Scroll Trigger using Intersection Observer (more reliable)
    useEffect(() => {
        const trigger = document.getElementById('nav-trigger');
        if (!trigger) {
            // Fallback to simple scroll if element missing
            const handleScroll = () => setIsScrolled(window.scrollY > 20);
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }

        const observer = new IntersectionObserver((entries) => {
            setIsScrolled(!entries[0].isIntersecting);
        }, { threshold: 0 });

        observer.observe(trigger);
        return () => observer.disconnect();
    }, []);

    // Keyboard shortcut: Cmd+K / Ctrl+K
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

    // Lock body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const isNavbarSolid = isScrolled || activeCategory !== 'home' || isMenuOpen;
    const isDonationEnabled = !settings || settings.page_donation_enabled !== 'false';

    const handleLinkClick = (id, customPath) => {
        if (customPath) {
            customPath.startsWith('/') ? navigate(customPath) : (window.location.href = customPath);
        } else {
            onCategoryChange(id);
        }
        setIsMenuOpen(false);
    };


    const socialLinks = [
        { name: 'Twitter', icon: <Twitter size={20} />, href: settings?.social_twitter || '#' },
        { name: 'Facebook', icon: <Facebook size={20} />, href: settings?.social_facebook || '#' },
        { name: 'Instagram', icon: <Instagram size={20} />, href: settings?.social_instagram || '#' },
    ];

    return (
        <header 
            id="main-navbar"
            style={{ 
                position: 'fixed', 
                top: '0px', 
                left: '0px', 
                right: '0px', 
                zIndex: 2147483647,
                transition: 'all 400ms cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'block'
            }}
            className={isNavbarSolid
                ? 'bg-red-600 shadow-2xl py-1 md:py-2'
                : 'bg-transparent py-4 md:py-6'
            }>

            <nav className="max-w-[1600px] mx-auto px-4 lg:px-8 flex items-center justify-between h-14 lg:h-18 relative">

                {/* LEFT: Hamburger (mobile) + Desktop nav segments */}
                <div className="flex-1 flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0 z-10">
                    {/* Mobile hamburger */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center shrink-0 ${isNavbarSolid ? 'text-white' : 'text-white'}`}
                            aria-label="Toggle Menu"
                        >
                            <div className="relative w-6 h-6 flex flex-col justify-center gap-1.5 overflow-hidden">
                                <span className={`h-0.5 w-full bg-current transition-transform duration-500 rounded-full ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                <span className={`h-0.5 w-full bg-current transition-all duration-300 rounded-full ${isMenuOpen ? 'translate-x-10 opacity-0' : ''}`} />
                                <span className={`h-0.5 w-full bg-current transition-transform duration-500 rounded-full ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                            </div>
                        </button>
                    </div>

                    <NavbarDesktopLeft
                        language={language}
                        isNavbarSolid={isNavbarSolid}
                        isMenuOpen={isMenuOpen}
                        activeCategory={activeCategory}
                        segmentOrder={settings?.header_segment_order || 'menu,home,news,categories,info'}
                        newsItems={newsItems}
                        categoryTree={categoryTree}
                        iconMap={iconMap}
                        headerQuickIcons={headerQuickIcons}
                        handleLinkClick={handleLinkClick}
                        onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                    />
                </div>

                {/* CENTER: Logo + mobile search */}
                <NavbarLogo
                    language={language}
                    isNavbarSolid={isNavbarSolid}
                    siteTitle={settings?.site_title}
                    siteTitleHi={settings?.site_title_hi}
                />

                {/* RIGHT: Desktop actions + Donate */}
                <NavbarDesktopRight
                    language={language}
                    theme={theme}
                    isNavbarSolid={isNavbarSolid}
                    isDonationEnabled={isDonationEnabled}
                    rightOrder={settings?.header_right_order || 'live,search,lang,theme'}
                    toggleTheme={toggleTheme}
                    onLanguageChange={onLanguageChange}
                    onSearchOpen={() => setIsSearchOpen(true)}
                />
            </nav>

            {/* Full-screen menu panel */}
            <AnimatePresence>
                {isMenuOpen && (
                    <NavbarMobileMenu
                        language={language}
                        theme={theme}
                        toggleLanguage={toggleLanguage}
                        toggleTheme={toggleTheme}
                        onLanguageChange={onLanguageChange}
                        mainPages={mainPages}
                        categoryTree={categoryTree}
                        iconMap={iconMap}
                        activeCategory={activeCategory}
                        isDonationEnabled={isDonationEnabled}
                        socialLinks={socialLinks}
                        handleLinkClick={handleLinkClick}
                        onClose={() => setIsMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Spotlight Search Modal */}
            <SpotlightSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                language={language}
            />
        </header>
    );
};

export default Navbar;
