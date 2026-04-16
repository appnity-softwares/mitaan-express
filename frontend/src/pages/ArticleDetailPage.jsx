import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Calendar, User, Eye, Clock,
    Share2, Bookmark,
    Facebook, Twitter, Linkedin, Copy, Check
} from 'lucide-react';
import { useArticles } from '../context/ArticlesContext';
import { useSettings } from '../hooks/useQueries';
import AdSpace from '../components/AdSpace';
import RelatedPosts from '../components/RelatedPosts';
import useIsShort from '../hooks/useIsShort';
import SEO from '../components/SEO';
import FloatingShareButtons from '../components/FloatingShareButtons';
import { formatImageUrl } from '../services/api';

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const ArticleDetailPage = ({ language }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { articles, blogs, loading, categories } = useArticles();
    const { data: settings } = useSettings();
    const [article, setArticle] = useState(null);
    const [copied, setCopied] = useState(false);
    const [relatedArticles, setRelatedArticles] = useState([]);
    const [contentRef, isShort] = useIsShort(150);

    const isPoetry = React.useMemo(() => {
        if (!article || !categories) return false;
        const cat = categories.find(c => c.id === article.categoryId);
        return cat?.name === 'Poetry' || cat?.name === 'काव्य';
    }, [article, categories]);

    // Inject Ad into Content
    const injectedContent = React.useMemo(() => {
        if (!article?.content) return '';

        // If ad is disabled or no image, return original content
        if (settings?.ad_in_article_enabled !== 'true' || !settings?.ad_in_article_image_url) {
            return article.content;
        }

        const adHtml = `
            <div class="my-8 w-full flex justify-center clear-both">
                <a href="${settings.ad_in_article_link_url || '#'}" target="_blank" rel="noopener noreferrer" class="block w-full max-w-4xl group relative overflow-hidden rounded-xl shadow-sm border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <div class="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-[10px] text-white uppercase tracking-widest rounded backdrop-blur-sm z-10">Advertisement</div>
                    <img src="${settings.ad_in_article_image_url}" alt="Advertisement" class="w-full h-full max-h-[300px] md:max-h-[350px] object-contain transform group-hover:scale-[1.01] transition-transform duration-500" />
                </a>
            </div>
        `;

        // Inject after 3rd paragraph
        let count = 0;
        const modified = article.content.replace(/<\/p>/g, (match) => {
            count++;
            if (count === 3) {
                return match + adHtml;
            }
            return match;
        });

        // If less than 3 paragraphs, append at end
        if (count < 3) {
            return article.content + adHtml;
        }

        return modified;
    }, [article, settings]);



    useEffect(() => {
        // Find article by ID or slug
        const foundArticle = articles.find(a =>
            a.id === parseInt(id) || a.slug === id
        );

        if (foundArticle) {
            setArticle(foundArticle);
            // Find related articles from same category
            const related = articles.filter(a =>
                a.categoryId === foundArticle.categoryId &&
                a.id !== foundArticle.id &&
                a.status === 'PUBLISHED' &&
                (a.language === foundArticle.language || !a.language)
            ).slice(0, 3);
            setRelatedArticles(related);
        } else if (blogs && blogs.length > 0) {
            // Check if this might actually be a blog
            const foundBlog = blogs.find(b => b.id === parseInt(id) || b.slug === id);
            if (foundBlog) {
                navigate(`/insight/${foundBlog.slug || foundBlog.id}`, { replace: true });
            }
        }
    }, [id, articles, blogs, navigate]);

    const handleShare = async (platform) => {
        const rawUrl = window.location.href;
        const readableUrl = decodeURIComponent(rawUrl);
        const cleanTitle = stripHtml(article?.title) || 'Check this article';

        if (platform === 'copy') {
            await navigator.clipboard.writeText(readableUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        const shareUrls = {
            whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(cleanTitle + ' - ')}${readableUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(readableUrl)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(readableUrl)}&text=${encodeURIComponent(cleanTitle)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(readableUrl)}`
        };

        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    };

    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;
            setScrollProgress((currentScroll / totalScroll) * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Article Not Found</h1>
                <p className="text-slate-600 dark:text-slate-400">The article you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                >
                    ← Back to Home
                </button>
            </div>
        );
    }

    const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] overflow-x-hidden">
            <SEO
                title={`${article.title} - Mitaan Express`}
                description={article.shortDescription || article.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
                image={formatImageUrl(article.image)}
                type="article"
                schemaData={{
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "headline": article.title,
                    "description": article.shortDescription || article.content?.replace(/<[^>]*>/g, '').substring(0, 150),
                    "image": [formatImageUrl(article.image)],
                    "datePublished": article.createdAt,
                    "dateModified": article.updatedAt || article.createdAt,
                    "author": [{
                        "@type": "Person",
                        "name": article.authorName || article.author?.name || 'Mitaan Team',
                        "url": window.location.origin
                    }],
                    "publisher": {
                        "@type": "Organization",
                        "name": "Mitaan Express",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${window.location.origin}/logo.png`
                        }
                    }
                }}
            />

            <FloatingShareButtons
                title={article.title}
                shortDescription={article.shortDescription || ''}
            />

            {/* Reading Progress Bar */}
            <div
                className="fixed top-0 left-0 h-1 bg-red-600 z-[100] transition-all duration-300"
                style={{ width: `${scrollProgress}%`, boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)' }}
            />

            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 pt-28 sm:pt-32 pb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="group inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm hover:shadow"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
                </button>
            </div>

            {/* Article Header */}
            <article className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24 lg:pb-32">
                {/* Header Content */}
                <div className="w-full text-left mb-12 relative">
                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 left-0 w-full h-full bg-red-600/5 blur-3xl -z-10 rounded-full opacity-50"></div>

                    {/* Category Pill */}
                    <Link
                        to={`/category/${article.category?.slug || 'news'}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-red-600/5 text-red-600 text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                    >
                        {typeof article.category === 'object' ? (language === 'hi' ? article.category?.nameHi || article.category?.name : article.category?.name) : (article.category || (language === 'hi' ? 'समाचार' : 'NEWS'))}
                    </Link>

                    {/* Title */}
                    {/* Title: Robust Handling for Hindi/Devanagari to prevent clipping */}
                    <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-10 font-serif max-w-5xl tracking-normal`}>
                        <span className={`px-1 pr-4 inline-block ${/[\u0900-\u097F]/.test(article.title) ? 'text-slate-900 dark:text-white' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent italic'}`}>
                            {article.title}
                        </span>
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 dark:border-white/5 py-4 sm:py-6 w-full mb-8 sm:mb-12">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-lg overflow-hidden shrink-0">
                                {article.authorImage ? (
                                    <img src={formatImageUrl(article.authorImage, 200)} alt={article.authorName || 'Author'} className="w-full h-full object-cover" />
                                ) : article.author?.image ? (
                                    <img src={formatImageUrl(article.author.image, 200)} alt={article.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <User size={20} className="text-slate-400" />
                                    </div>
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">{article.authorName || article.author?.name || 'Mitaan Team'}</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{formattedDate}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-full text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                <Clock size={14} /> 5 MIN READ
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                            <button
                                onClick={() => handleShare('copy')}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-black uppercase tracking-widest shadow-sm"
                                title="Copy Readable Link"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span className="hidden sm:inline-block">
                                    {copied ? (language === 'hi' ? 'कॉपी किया' : 'COPIED') : (language === 'hi' ? 'लिंक कॉपी करें' : 'COPY LINK')}
                                </span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({
                                                title: stripHtml(article.title),
                                                text: stripHtml(article.shortDescription),
                                                url: decodeURIComponent(window.location.href),
                                            });
                                        } catch (err) {
                                            console.log('Error sharing:', err);
                                        }
                                    } else {
                                        handleShare('copy');
                                    }
                                }}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs font-black uppercase tracking-widest shadow-sm"
                            >
                                <Share2 size={14} />
                                <span className="hidden sm:inline-block">{language === 'hi' ? 'शेयर' : 'SHARE'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Article Content (8 cols) */}
                    <div className="lg:col-span-8">
                        <div
                            ref={contentRef}
                            className={`space-y-0 transition-all duration-500 ${isShort ? 'lg:sticky lg:top-32' : ''}`}
                        >
                            {/* Featured Image */}
                            {article.image && (
                                <div className="rounded-3xl overflow-hidden mb-12 shadow-2xl">
                                    <img
                                        src={formatImageUrl(article.image, 1200)}
                                        alt={article.title}
                                        className="w-full h-auto object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=2000';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Short Description */}
                            {article.shortDescription && (
                                <p className="text-xl text-slate-700 dark:text-slate-300 leading-relaxed mb-10 font-bold font-serif border-l-4 border-red-600 pl-6">
                                    {article.shortDescription}
                                </p>
                            )}

                            {/* Article Content */}
                            {/* Article Content */}
                            {isPoetry ? (
                                <div className="max-w-4xl mx-auto">
                                    <div className="relative py-12 md:py-20 px-8 md:px-16 bg-[#fcf9f2] dark:bg-white/5 rounded-[4rem] border border-[#e8e2d4] dark:border-white/10 shadow-inner overflow-hidden">
                                        {/* Artistic background accents */}
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
                                            <Feather size={200} className="text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-8 opacity-[0.03] dark:opacity-[0.05] rotate-180 pointer-events-none select-none">
                                            <Quote size={200} className="text-slate-900 dark:text-white" />
                                        </div>

                                        <div
                                            className={`relative z-10 prose prose-xl md:prose-2xl dark:prose-invert max-w-none font-serif text-center leading-[1.8] text-slate-800 dark:text-slate-200 whitespace-pre-line ${language === 'hi' ? '' : 'italic'}`}
                                            dangerouslySetInnerHTML={{ __html: injectedContent }}
                                        />
                                    </div>
                                    <div className="mt-8 text-center">
                                        <div className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400">
                                            <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
                                            {language === 'hi' ? 'कलम से मितान तक' : 'From Pen to Mitaan'}
                                            <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="prose prose-base md:prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-red-600 overflow-hidden break-words"
                                    dangerouslySetInnerHTML={{ __html: injectedContent }}
                                />
                            )}
                            {/* Force all inline content images to be full reading width */}
                            <style>{`
                                .prose img {
                                    width: 100% !important;
                                    height: auto !important;
                                    max-width: 100% !important;
                                    border-radius: 1rem;
                                    display: block;
                                    margin: 1.5rem 0;
                                }
                                .prose p > img:only-child {
                                    width: 100% !important;
                                }
                            `}</style>

                            {/* Video if exists */}
                            {article.videoUrl && (
                                <div className="mt-12 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
                                    <div className="aspect-video">
                                        <iframe
                                            src={article.videoUrl.replace('watch?v=', 'embed/')}
                                            className="w-full h-full"
                                            allowFullScreen
                                            title={article.title}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tags */}
                            {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-12 pt-10 border-t border-slate-200 dark:border-slate-800">
                                    {article.tags.map(tag => (
                                        <Link
                                            key={tag.id}
                                            to={`/tag/${tag.slug}`}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            #{tag.name}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Share Section (Bottom) */}
                            <div className="flex items-center gap-4 mt-8">
                                <span className="font-bold text-slate-700 dark:text-slate-300">Share this story:</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleShare('facebook')} className="p-3 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity"><Facebook size={18} /></button>
                                    <button onClick={() => handleShare('twitter')} className="p-3 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity"><Twitter size={18} /></button>
                                    <button onClick={() => handleShare('linkedin')} className="p-3 bg-[#0A66C2] text-white rounded-full hover:opacity-90 transition-opacity"><Linkedin size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar (4 cols) */}
                    <aside className="lg:col-span-4 space-y-12">
                        {/* Ad Space in Sidebar */}
                        <div className="sticky top-24 space-y-8">
                            <AdSpace position="sidebar" />

                            {/* Trending / Related News Box */}
                            <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                                {/* Accent Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10 rounded-full"></div>

                                <div className="flex items-center gap-3 mb-8">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">
                                        {language === 'hi' ? 'ट्रेंडिंग न्यूज़' : 'Trending Now'}
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    {(relatedArticles.length > 0 ? relatedArticles : articles.slice(0, 4)).map((item, index) => (
                                        <Link
                                            key={item.id}
                                            to={`/article/${item.slug || item.id}`}
                                            className="group flex gap-5 items-start"
                                        >
                                            <span className="text-4xl font-black text-slate-600 dark:text-white/10 group-hover:text-red-600/20 transition-colors font-serif -mt-2">
                                                {index + 1}.
                                            </span>
                                            <div>
                                                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                                                    {typeof item.category === 'object' ? (language === 'hi' ? item.category?.nameHi || item.category?.name : item.category?.name) : (item.category || (language === 'hi' ? 'समाचार' : 'NEWS'))}
                                                </span>
                                                <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-red-600 transition-colors line-clamp-3 leading-snug mb-2">
                                                    {item.title}
                                                </h4>

                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            <AdSpace position="skyscraper" />
                        </div>
                    </aside>
                </div>

                {/* Related Posts Section */}
                <RelatedPosts articles={relatedArticles} language={language} />
            </article>
        </div>
    );
};

export default ArticleDetailPage;
