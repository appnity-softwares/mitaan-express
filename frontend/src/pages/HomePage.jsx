import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import HeroSlider from '../components/HeroSlider';
import ArticleCard from '../components/ArticleCard';
import PromotionalBanner from '../components/PromotionalBanner';
import Sidebar from '../components/Sidebar';
import InDepthSection from '../components/InDepthSection';
import CreativeShowcase from '../components/CreativeShowcase';
import VideoGalleryHero from '../components/VideoGalleryHero';
import GalleryStrip from '../components/GalleryStrip';
import MustReadSlider from '../components/MustReadSlider';
import { useArticles } from '../context/ArticlesContext';
import AdSpace from '../components/AdSpace';
import AdPopup from '../components/AdPopup';

const HomePage = ({ language }) => {
    const navigate = useNavigate();
    const { published, breaking, loading } = useArticles();

    // Map articles to component format
    const homeArticles = published.slice(0, 5).map(a => ({
        id: a.id,
        title: a.title,
        description: a.shortDescription || a.content?.substring(0, 150) + '...' || '',
        image: a.image || 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=2000',
        category: language === 'hi' ? (a.category?.nameHi || a.category?.name) : a.category?.name,
        author: a.author?.name || 'Mitaan',
        date: new Date(a.createdAt).toLocaleDateString(),
        slug: a.slug
    }));

    const handleArticleClick = (article) => {
        navigate(`/article/${article.id}`);
    };

    const handleCategoryChange = (category) => {
        if (category === 'home') navigate('/');
        else if (['about', 'contact', 'gallery', 'video', 'poetry', 'blogs'].includes(category)) navigate(`/${category}`);
        else navigate(`/category/${category}`);
    };

    return (
        <>
            <AdPopup language={language} />

            {settings?.section_hero_enabled !== 'false' && (
                <HeroSlider language={language} />
            )}

            <div className="relative z-10 overflow-x-hidden">
                <div className="space-y-24 pb-32">
                    {/* Breaking News Ticker (Full Width) */}
                    {settings?.section_ticker_enabled !== 'false' && (
                        <div className="bg-white dark:bg-[#030712] border-y border-slate-100 dark:border-white/5 py-4 overflow-hidden whitespace-nowrap group">
                            <div className="flex items-center gap-16 animate-marquee-infinite w-max px-4">
                                <div className="flex items-center gap-16 shrink-0">
                                    {(breaking.length > 0 ? breaking : published.slice(0, 5)).map((article, i) => (
                                        <div
                                            key={`${article.id}-1`}
                                            className="flex items-center gap-6 cursor-pointer group/item"
                                            onClick={() => navigate(`/article/${article.id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                                    {language === 'hi' ? (breaking.length > 0 ? 'ब्रेकिंग' : 'ताज़ा ख़बर') : (breaking.length > 0 ? 'BREAKING' : 'LATEST')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-red-600 transition-colors">
                                                {article.title}
                                            </p>
                                            <span className="text-slate-300 dark:text-white/10 mx-2">|</span>
                                        </div>
                                    ))}
                                </div>
                                {/* Duplicate for seamless loop */}
                                <div className="flex items-center gap-16 shrink-0">
                                    {(breaking.length > 0 ? breaking : published.slice(0, 5)).map((article, i) => (
                                        <div
                                            key={`${article.id}-2`}
                                            className="flex items-center gap-6 cursor-pointer group/item"
                                            onClick={() => navigate(`/article/${article.id}`)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                                                <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">
                                                    {language === 'hi' ? (breaking.length > 0 ? 'ब्रेकिंग' : 'ताज़ा ख़बर') : (breaking.length > 0 ? 'BREAKING' : 'LATEST')}
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover/item:text-red-600 transition-colors">
                                                {article.title}
                                            </p>
                                            <span className="text-slate-300 dark:text-white/10 mx-2">|</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ad Space - Top Banner */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <AdSpace position="homepage_top" />
                    </div>

                    {/* Main Grid: Centered Content */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-20">
                        <div className="flex-1 space-y-24">
                            <div className="space-y-12">
                                <h2 className="text-[11px] font-black text-red-600 uppercase tracking-[0.4em]">
                                    {language === 'hi' ? 'विशेष रिपोर्ट' : 'Top Feature'}
                                </h2>
                                {homeArticles.map(article => (
                                    <div key={article.id} onClick={() => handleArticleClick(article)} className="cursor-pointer">
                                        <ArticleCard
                                            article={article}
                                            language={language}
                                        />
                                    </div>
                                ))}
                            </div>
                            {settings?.section_poetry_enabled !== 'false' && (
                                <div data-aos="fade-up">
                                    <PromotionalBanner language={language} />
                                </div>
                            )}
                        </div>
                        <div className="lg:w-[420px] shrink-0" data-aos="fade-left">
                            <Sidebar language={language} />
                        </div>
                    </div>

                    {/* In-Depth: Full Width Background, Centered Content */}
                    {settings?.section_indepth_enabled !== 'false' && (
                        <div className="bg-slate-50 dark:bg-[#030712] py-24 border-y border-slate-100 dark:border-white/5" data-aos="fade-up">
                            <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
                                <InDepthSection
                                    language={language}
                                    onCategoryChange={handleCategoryChange}
                                    sportsArticles={published.filter(a => a.category?.slug === 'sports')}
                                    economyArticles={published.filter(a => a.category?.slug === 'economic')}
                                    onArticleClick={handleArticleClick}
                                />
                            </div>
                        </div>
                    )}

                    {/* Creative Showcase: New Animated Component */}
                    {settings?.section_gallery_enabled !== 'false' && (
                        <>
                            <CreativeShowcase language={language} setActiveCategory={handleCategoryChange} />

                            {/* Video Content: Full Width Background */}
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <VideoGalleryHero language={language} />
                            </div>

                            {/* NEW: Gallery Strip */}
                            <GalleryStrip language={language} />
                        </>
                    )}

                    {/* MUST READ SECTION: Edge-to-Edge Full Width */}
                    <MustReadSlider language={language} onArticleClick={handleArticleClick} />

                    <style>{`
                @keyframes marquee-infinite {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee-infinite {
                  animation: marquee-infinite 40s linear infinite;
                }
                .group:hover .animate-marquee-infinite {
                  animation-play-state: paused;
                }
              `}</style>
                </div>
            </div>
        </>
    );
};

export default HomePage;
