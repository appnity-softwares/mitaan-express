import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Home, TrendingUp, FolderTree, ChevronDown, ChevronRight, Star, Video,
    FileText, Image as ImageIcon
} from 'lucide-react';

const NewsDropdown = ({ language, newsItems, handleLinkClick, isNavbarSolid, activeCategory }) => (
    <div className="relative group/news">
        <button className={`flex items-center h-11 px-3 rounded-xl transition-all hover:bg-white/10 group relative ${activeCategory === 'news' ? 'text-white' : (isNavbarSolid ? 'text-white' : 'text-red-600')}`}>
            <TrendingUp size={20} className="shrink-0" />
            <span className={`ml-2 text-[10px] font-black uppercase whitespace-nowrap ${language === 'hi' ? 'tracking-normal font-bold' : 'tracking-[0.2em]'}`}>
                {language === 'hi' ? 'समाचार' : 'NEWS'}
            </span>
            <ChevronDown size={10} className="ml-1 opacity-50 group-hover/news:rotate-180 transition-transform" />
        </button>
        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/news:opacity-100 group-hover/news:visible transition-all duration-300 z-[110]">
            <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-white/5 p-3 min-w-[220px] space-y-1">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-3 px-3 pt-2">
                    {language === 'hi' ? 'लेटेस्ट न्यूज़' : 'Latest News Feed'}
                </p>
                {newsItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleLinkClick(item.id, item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group/sub"
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 group-hover/sub:text-red-600 group-hover/sub:bg-red-50 dark:group-hover/sub:bg-red-900/20 transition-all">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{item.name}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    </div>
);

const CategoriesDropdown = ({ language, categoryTree, iconMap, handleLinkClick, isNavbarSolid, activeCategory }) => (
    <div className="relative group/categories">
        <button className={`flex items-center h-11 px-3 rounded-xl transition-all hover:bg-white/10 group relative ${activeCategory === 'categories' ? 'text-white' : (isNavbarSolid ? 'text-white' : 'text-red-600')}`}>
            <FolderTree size={20} className="shrink-0" />
            <span className={`ml-2 text-[10px] font-black uppercase whitespace-nowrap ${language === 'hi' ? 'tracking-normal font-bold' : 'tracking-[0.2em]'}`}>
                {language === 'hi' ? 'श्रेणियां' : 'CATEGORIES'}
            </span>
            <ChevronDown size={10} className="ml-1 opacity-50 group-hover/categories:rotate-180 transition-transform" />
        </button>
        <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover/categories:opacity-100 group-hover/categories:visible transition-all duration-300 z-[110]">
            <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-white/5 p-4 min-w-[260px] max-h-[80vh] overflow-y-auto sidebar-scroll">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] mb-4 px-2">
                    {language === 'hi' ? 'विभाग' : 'News Departments'}
                </p>
                <div className="grid grid-cols-1 gap-1">
                    {categoryTree.map((parent) => (
                        <div key={parent.id} className="group/item">
                            <button
                                onClick={() => handleLinkClick(parent.slug || parent.id)}
                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-4 rounded-full" style={{ backgroundColor: parent.color || '#ef4444' }} />
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                        {language === 'hi' ? parent.nameHi : parent.name}
                                    </span>
                                </div>
                                {parent.children?.length > 0 && <ChevronRight size={14} className="text-slate-300" />}
                            </button>
                            {parent.children?.length > 0 && (
                                <div className="absolute left-full top-0 ml-2 opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-200">
                                    <div className="bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-white/5 p-3 min-w-[200px] space-y-1">
                                        {parent.children.map(child => (
                                            <button
                                                key={child.id}
                                                onClick={() => handleLinkClick(child.slug || child.id)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left"
                                            >
                                                <div className="text-slate-400">{iconMap[child.icon] || <Star size={14} />}</div>
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                    {language === 'hi' ? child.nameHi : child.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const NavbarDesktopLeft = ({
    language,
    isNavbarSolid,
    isMenuOpen,
    activeCategory,
    segmentOrder,
    newsItems,
    categoryTree,
    iconMap,
    headerQuickIcons,
    handleLinkClick,
    onToggleMenu,
}) => {
    const navigate = useNavigate();

    const renderSegment = (segId) => {
        switch (segId.trim()) {
            case 'menu':
                return (
                    <button
                        key="seg-menu"
                        onClick={onToggleMenu}
                        className={`flex items-center gap-2 group transition-colors shrink-0 ${isNavbarSolid ? 'text-white' : 'text-red-600'}`}
                        aria-label="Toggle Menu"
                    >
                        <div className="relative w-6 lg:w-7 h-6 flex flex-col justify-center gap-1.5 shrink-0">
                            <span className={`h-0.5 w-full bg-current transition-transform duration-500 rounded-full ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`h-0.5 w-3/4 bg-current transition-opacity duration-300 rounded-full ${isMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`h-0.5 w-full bg-current transition-transform duration-500 rounded-full ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                        <span className="hidden xl:block text-[11px] font-black uppercase tracking-[0.2em] group-hover:opacity-80 transition-all">
                            {language === 'hi' ? (isMenuOpen ? 'बंद करें' : 'मेन्यू') : (isMenuOpen ? 'Close' : 'Menu')}
                        </span>
                    </button>
                );
            case 'home':
                return (
                    <button
                        key="seg-home"
                        onClick={() => navigate('/')}
                        className={`flex items-center h-11 px-3 rounded-xl transition-all hover:bg-white/10 group relative ${activeCategory === 'home' ? 'text-white' : (isNavbarSolid ? 'text-white' : 'text-red-600')}`}
                    >
                        <Home size={20} className="shrink-0" />
                        <span className={`ml-2 text-[10px] font-black uppercase whitespace-nowrap ${language === 'hi' ? 'tracking-normal font-bold' : 'tracking-[0.2em]'}`}>
                            {language === 'hi' ? 'मुख्य' : 'HOME'}
                        </span>
                    </button>
                );
            case 'news':
                return (
                    <NewsDropdown
                        key="seg-news"
                        language={language}
                        newsItems={newsItems}
                        handleLinkClick={handleLinkClick}
                        isNavbarSolid={isNavbarSolid}
                        activeCategory={activeCategory}
                    />
                );
            case 'categories':
                return (
                    <CategoriesDropdown
                        key="seg-categories"
                        language={language}
                        categoryTree={categoryTree}
                        iconMap={iconMap}
                        handleLinkClick={handleLinkClick}
                        isNavbarSolid={isNavbarSolid}
                        activeCategory={activeCategory}
                    />
                );
            case 'info':
                return (
                    <div key="seg-info" className="flex items-center gap-0.5 ml-1">
                        {headerQuickIcons.filter(p => p.id !== 'home').map((page) => (
                            <button
                                key={`header-quick-${page.id}`}
                                onClick={() => handleLinkClick(page.id, page.path)}
                                className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all hover:bg-white/10 group relative ${activeCategory === page.id ? 'text-white' : (isNavbarSolid ? 'text-white' : 'text-red-600')}`}
                                title={page.name}
                            >
                                <div className="transition-transform group-hover:scale-110">
                                    {React.cloneElement(page.icon, { size: 21 })}
                                </div>
                            </button>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="hidden lg:flex items-center gap-1 sm:gap-2 lg:gap-4">
            {segmentOrder.split(',').map(renderSegment)}
        </div>
    );
};

export default NavbarDesktopLeft;
