import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ArticleCard from '../components/ArticleCard';
import Sidebar from '../components/Sidebar';
import { useArticles } from '../context/ArticlesContext';
import LoadingSkeletons from '../components/LoadingSkeletons';
import useIsShort from '../hooks/useIsShort';

const CategoryPage = ({ language }) => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { published, loading, categories } = useArticles();
    const [contentRef, isShort] = useIsShort(200);

    // Find the current category object from context
    const currentCategory = useMemo(() => {
        return categories.find(c => c.slug === categoryId);
    }, [categoryId, categories]);

    // Get subcategories if this is a parent category
    const subCategories = useMemo(() => {
        if (!currentCategory) return [];
        return categories.filter(c => c.parentId === currentCategory.id);
    }, [currentCategory, categories]);

    // Find parent category if this is a subcategory
    const parentCategory = useMemo(() => {
        if (!currentCategory?.parentId) return null;
        return categories.find(c => c.id === currentCategory.parentId);
    }, [currentCategory, categories]);

    // Handle hierarchical filtering
    const filteredArticles = useMemo(() => {
        if (!currentCategory) return [];

        return published.filter(a => {
            if (a.category?.id === currentCategory.id) return true;
            if (a.category?.parentId === currentCategory.id) return true;
            return false;
        }).map(a => ({
            id: a.id,
            title: a.title,
            description: a.shortDescription || a.content?.substring(0, 150) + '...' || '',
            image: a.image || 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=2000',
            category: language === 'hi' ? (a.category?.nameHi || a.category?.name) : a.category?.name,
            author: a.author?.name || 'Mitaan',
            date: new Date(a.createdAt).toLocaleDateString(),
            slug: a.slug
        }));
    }, [categoryId, published, currentCategory, language]);

    const handleArticleClick = (articleId) => {
        navigate(`/article/${articleId}`);
    };

    if (loading) {
        return <LoadingSkeletons type="page" />;
    }

    const categoryTitle = currentCategory
        ? (language === 'hi' ? currentCategory.nameHi : currentCategory.name)
        : categoryId?.charAt(0).toUpperCase() + categoryId?.slice(1);

    const featuredArticle = filteredArticles[0];
    const remainingArticles = filteredArticles.slice(1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen bg-white dark:bg-[#030712] overflow-hidden"
        >
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full -mr-64 -mt-32 pointer-events-none"></div>
            <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full -ml-32 pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-32">
                {/* Breadcrumbs */}
                <nav className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => navigate('/')}>
                        {language === 'hi' ? 'मुख्य' : 'Home'}
                    </span>
                    <span className="text-slate-300">/</span>
                    {parentCategory && (
                        <>
                            <span className="cursor-pointer hover:text-red-600 transition-colors" onClick={() => navigate(`/category/${parentCategory.slug}`)}>
                                {language === 'hi' ? parentCategory.nameHi : parentCategory.name}
                            </span>
                            <span className="text-slate-300">/</span>
                        </>
                    )}
                    <span className="text-red-600">{categoryTitle}</span>
                </nav>

                {/* Immersive Category Header */}
                <div className="mb-20 grid lg:grid-cols-2 gap-12 items-end">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-3">
                            <span className="h-[2px] w-12 bg-red-600"></span>
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">
                                {language === 'hi' ? 'कहानियाँ' : 'STORY ARCHIVE'}
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter text-slate-900 dark:text-white leading-[0.8] mb-4">
                            {categoryTitle}<span className="text-red-600">.</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-gray-400 font-medium max-w-lg leading-relaxed">
                            {language === 'hi'
                                ? `${categoryTitle} के बारे में सभी नवीनतम समाचार और इन-डेप्थ विश्लेषण पढ़ें।`
                                : `Read all the latest news and in-depth analysis on ${categoryTitle} from our expert editorial team.`}
                        </p>
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-6">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 p-4 rounded-2xl">
                            <div className="text-center px-4 border-r border-slate-200 dark:border-white/10">
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{filteredArticles.length}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{language === 'hi' ? 'कुल लेख' : 'Articles'}</p>
                            </div>
                            <div className="px-4">
                                <p className="text-sm font-bold text-slate-600 dark:text-gray-400">
                                    {language === 'hi' ? 'अपडेटेड आज' : 'Updated Today'}
                                </p>
                            </div>
                        </div>

                        {/* Subcategories pill navigation */}
                        {subCategories.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-start lg:justify-end max-w-md">
                                {subCategories.map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => navigate(`/category/${sub.slug}`)}
                                        className="px-5 py-2.5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 shadow-sm"
                                    >
                                        {language === 'hi' ? sub.nameHi : sub.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-20">
                    {/* Main Content Area */}
                    <div className="flex-1">
                        <div
                            ref={contentRef}
                            className={`transition-all duration-500 ${isShort ? 'lg:sticky lg:top-32' : ''}`}
                        >
                            {filteredArticles.length > 0 ? (
                                <div className="space-y-16">
                                    {/* Featured Post (if any) */}
                                    {featuredArticle && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group cursor-pointer"
                                            onClick={() => handleArticleClick(featuredArticle.id)}
                                        >
                                            <div className="absolute -inset-4 bg-slate-50 dark:bg-white/5 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-95 group-hover:scale-100"></div>
                                            <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                                                <ArticleCard
                                                    article={featuredArticle}
                                                    language={language}
                                                    isFeatured={true}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Article Grid */}
                                    <div className="grid gap-12 pt-12 border-t border-slate-100 dark:border-white/5">
                                        {remainingArticles.length > 0 ? (
                                            remainingArticles.map((article, i) => (
                                                <motion.div
                                                    key={article.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: i * 0.05 }}
                                                    onClick={() => handleArticleClick(article.id)}
                                                    className="cursor-pointer group relative"
                                                >
                                                    <div className="absolute -inset-4 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100"></div>
                                                    <div className="relative z-10">
                                                        <ArticleCard
                                                            article={article}
                                                            language={language}
                                                        />
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : featuredArticle ? null : (
                                            <div className="py-32 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                                                <div className="text-7xl mb-6 grayscale opacity-20">📰</div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                                    {language === 'hi' ? 'अभी कोई कहानियां नहीं' : 'No stories found'}
                                                </h3>
                                                <p className="text-slate-500 font-medium">
                                                    {language === 'hi'
                                                        ? 'इस श्रेणी में अभी कोई लेख नहीं है।'
                                                        : 'We are working on bringing stories to this category.'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-slate-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                                    <div className="text-7xl mb-6 grayscale opacity-20">📰</div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                        {language === 'hi' ? 'अभी कोई कहानियां नहीं' : 'No stories found'}
                                    </h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                        {language === 'hi'
                                            ? 'इस श्रेणी में अभी कोई लेख नहीं है। हम जल्द ही नई अपडेट ला रहे हैं।'
                                            : 'We are working on bringing relevant stories to this category. Check back soon for updates.'}
                                    </p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="mt-10 px-10 py-4 bg-red-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 active:scale-95"
                                    >
                                        {language === 'hi' ? 'होम पर जाएं' : 'Back to Home'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:w-[420px] shrink-0">
                        <div className="sticky top-32">
                            <Sidebar language={language} showWeather={false} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Accent */}
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-600/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        </motion.div>
    );
};

export default CategoryPage;
