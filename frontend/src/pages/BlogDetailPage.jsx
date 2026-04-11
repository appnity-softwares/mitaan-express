import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, User, Eye,
    Share2, Bookmark, Check, Copy,
    Facebook, Twitter, Linkedin
} from 'lucide-react';
import { fetchBlogBySlug, fetchArticles, formatImageUrl } from '../services/api';
import AdSpace from '../components/AdSpace';
import SEO from '../components/SEO';
import FloatingShareButtons from '../components/FloatingShareButtons';

import { useArticles } from '../context/ArticlesContext';

const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
};

const BlogDetailPage = ({ language }) => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [latestNews, setLatestNews] = useState([]);
    const { articles } = useArticles();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const blogData = await fetchBlogBySlug(slug);
                setBlog(blogData);

                // Fetch latest news for sidebar
                const newsData = await fetchArticles('', '', '', language, 'PUBLISHED');
                setLatestNews(newsData.articles ? newsData.articles.slice(0, 5) : (Array.isArray(newsData) ? newsData.slice(0, 5) : []));
            } catch (error) {
                console.error("Failed to load blog details", error);
                
                // If not found as a blog, check if it's actually an article and redirect
                if (articles && articles.length > 0) {
                    const foundArticle = articles.find(a => a.id === parseInt(slug) || a.slug === slug);
                    if (foundArticle) {
                        setLoading(false);
                        return navigate(`/article/${foundArticle.id}`, { replace: true });
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [slug, language, articles, navigate]);

    const handleShare = async (platform) => {
        const rawUrl = window.location.href;
        const readableUrl = decodeURIComponent(rawUrl); // Decode %E0%... → readable Hindi
        const cleanTitle = stripHtml(blog?.title) || 'Check this blog';

        if (platform === 'copy') {
            await navigator.clipboard.writeText(readableUrl); // Copy readable URL
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Blog Not Found</h1>
                <button
                    onClick={() => navigate('/insights')}
                    className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors"
                >
                    ← Back to Blogs
                </button>
            </div>
        );
    }

    const formattedDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-white dark:bg-[#030712]"
        >
            <SEO
                title={`${blog.title} - Mitaan Express`}
                description={blog.shortDescription || blog.content?.replace(/<[^>]*>/g, '').substring(0, 150)}
                image={blog.image}
                type="article"
                schemaData={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": blog.title,
                    "description": blog.shortDescription || blog.content?.replace(/<[^>]*>/g, '').substring(0, 150),
                    "image": [blog.image],
                    "datePublished": blog.createdAt,
                    "dateModified": blog.updatedAt || blog.createdAt,
                    "author": [{
                        "@type": "Person",
                        "name": blog.authorName || blog.author?.name || 'Mitaan Team',
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
                title={blog.title}
                shortDescription={blog.shortDescription || ''}
            />
            <div className="max-w-7xl mx-auto px-4 pt-28 sm:pt-32 pb-8">
                <button
                    onClick={() => navigate('/insights')}
                    className="group inline-flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:border-red-600/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shadow-sm hover:shadow"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    {language === 'hi' ? 'सभी इनसाइट्स' : 'Back to Insights'}
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Main Content */}
                <article className="lg:col-span-8">
                    <div className="inline-block text-xs font-black text-red-600 uppercase tracking-widest mb-4">
                        {typeof blog.category === 'object' ? (language === 'hi' ? blog.category?.nameHi || blog.category?.name : blog.category?.name) : (blog.category || (language === 'hi' ? 'ब्लॉग' : 'BLOG'))}
                    </div>

                    <div className="text-2xl md:text-3xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-6 font-serif">
                        {blog.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg">
                                {blog.authorImage ? (
                                    <img src={blog.authorImage} alt={blog.authorName || 'Author'} className="w-full h-full object-cover" />
                                ) : blog.author?.image ? (
                                    <img src={blog.author.image} alt={blog.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={24} className="text-slate-500" />
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">{blog.authorName || blog.author?.name || 'Author'}</p>
                                <p className="text-xs text-slate-500">{formattedDate}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                <Eye size={14} /> {blog.views || 0}
                            </button>
                            <button
                                onClick={() => handleShare('copy')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-xs font-black uppercase tracking-widest shadow-sm"
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
                                                title: stripHtml(blog.title),
                                                text: stripHtml(blog.shortDescription),
                                                url: decodeURIComponent(window.location.href),
                                            });
                                        } catch (err) {
                                            console.log('Error sharing:', err);
                                        }
                                    } else {
                                        handleShare('copy');
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-xs font-black uppercase tracking-widest shadow-sm"
                            >
                                <Share2 size={14} />
                                <span className="hidden sm:inline-block">{language === 'hi' ? 'शेयर' : 'SHARE'}</span>
                            </button>
                        </div>
                    </div>

                    {blog.image && (
                        <div className="rounded-2xl overflow-hidden mb-8 shadow-xl">
                            <img
                                src={formatImageUrl(blog.image, 1200)}
                                alt={blog.title}
                                className="w-full h-[280px] sm:h-[380px] lg:h-[480px] object-cover object-center block"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=2000';
                                }}
                            />
                        </div>
                    )}

                    <div
                        className="prose prose-base dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-red-600 overflow-hidden break-words"
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                    {/* Force all inline content images to be full reading width */}
                    <style>{`
                        .prose img {
                            width: 100% !important;
                            height: auto !important;
                            max-width: 100% !important;
                            border-radius: 0.75rem;
                            display: block;
                            margin: 1.5rem 0;
                            object-fit: cover;
                        }
                        .prose p > img:only-child {
                            width: 100% !important;
                        }
                    `}</style>

                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-10 pt-10 border-t border-slate-200 dark:border-slate-800">
                            {blog.tags.map(tag => (
                                <span
                                    key={tag.id}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Share Section */}
                    <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{language === 'hi' ? 'शेयर करें:' : 'Share this story:'}</span>
                        <div className="flex gap-2">
                            <button onClick={() => handleShare('facebook')} className="p-3 bg-[#1877F2] text-white rounded-full hover:opacity-90 transition-opacity" title="Share on Facebook">
                                <Facebook size={18} />
                            </button>
                            <button onClick={() => handleShare('twitter')} className="p-3 bg-[#1DA1F2] text-white rounded-full hover:opacity-90 transition-opacity" title="Share on Twitter">
                                <Twitter size={18} />
                            </button>
                            <button onClick={() => handleShare('linkedin')} className="p-3 bg-[#0A66C2] text-white rounded-full hover:opacity-90 transition-opacity" title="Share on LinkedIn">
                                <Linkedin size={18} />
                            </button>
                            <button onClick={() => handleShare('copy')} className="p-3 bg-slate-600 text-white rounded-full hover:opacity-90 transition-opacity" title="Copy Link">
                                {copied ? <Check size={18} className="text-green-400" /> : <Share2 size={18} />}
                            </button>
                        </div>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="sticky top-24 space-y-12">
                        <AdSpace position="sidebar" />
                        
                        {(latestNews.length > 0 || (articles && articles.length > 0)) && (
                        <div className="bg-white dark:bg-white/5 p-8 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10 rounded-full"></div>

                            <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-8 flex items-center justify-between border-b pb-4 border-slate-100 dark:border-white/5">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                                    {language === 'hi' ? 'ताज़ा ख़बरें' : 'Latest News'}
                                </span>
                            </h3>
                            <div className="space-y-6">
                                {(latestNews.length > 0 ? latestNews : articles.slice(0, 5)).map(news => (
                                    <Link to={`/article/${news.slug || news.id}`} key={news.id} className="group flex gap-4 items-start">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                                            <img
                                                src={formatImageUrl(news.image, 200)}
                                                alt={news.title}
                                                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=200&q=80'; }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {news.title}
                                            </h4>
                                            <span className="text-[9px] text-slate-400 mt-2 block">
                                                {new Date(news.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                        )}
                        
                        <AdSpace position="skyscraper" />
                    </div>
                </aside>

            </div>
        </motion.div>
    );
};

export default BlogDetailPage;