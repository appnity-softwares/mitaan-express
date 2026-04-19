import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    User, Newspaper, FileText, Calendar, 
    ArrowLeft, ChevronRight, Share2, Info, Copy, Check
} from 'lucide-react';
import { formatImageUrl, fetchPublisherById } from '../services/api';
import SEO from '../components/SEO';
import LoadingSkeletons from '../components/LoadingSkeletons';
import toast from 'react-hot-toast';

const AuthorProfilePage = ({ language }) => {
    const { id } = useParams();
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'blogs'

    const handleShare = async () => {
        const shareData = {
            title: `${author.name} - Mitaan Express`,
            text: author.description || `Check out ${author.name}'s profile on Mitaan Express`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    copyToClipboard();
                }
            }
        } else {
            copyToClipboard();
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success('Link copied to clipboard!');
        });
    };

    useEffect(() => {
        const getAuthor = async () => {
            setLoading(true);
            try {
                const data = await fetchPublisherById(id);
                
                if (!data) {
                    setAuthor(null);
                    return;
                }
                
                // Ensure articles and blogs are always arrays to prevent .map errors
                const sanitizedData = {
                    ...data,
                    articles: data.articles || [],
                    blogs: data.blogs || []
                };
                
                setAuthor(sanitizedData);
                
                // Set initial tab based on content availability
                if (sanitizedData.articles.length === 0 && sanitizedData.blogs.length > 0) {
                    setActiveTab('blogs');
                }
            } catch (error) {
                console.error('Failed to fetch author:', error);
                setAuthor(null);
            } finally {
                setLoading(false);
            }
        };
        getAuthor();
    }, [id]);

    if (loading) return <LoadingSkeletons type="page" />;
    if (!author) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Info size={48} className="text-slate-300 mb-4" />
            <h2 className="text-xl font-bold">{language === 'hi' ? 'लेखक नहीं मिला' : 'Author Not Found'}</h2>
            <Link to="/" className="mt-4 text-red-600 font-bold hover:underline">{language === 'hi' ? 'मुख्य पृष्ठ पर वापस जाएं' : 'Return Home'}</Link>
        </div>
    );

    const posts = activeTab === 'articles' ? author.articles : author.blogs;

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712]">
            <SEO 
                title={`${author.name} - Author Profile | Mitaan Express`}
                description={author.description || `Read articles and blogs by ${author.name} on Mitaan Express.`}
                image={formatImageUrl(author.image)}
            />

            {/* Hero Section */}
            <div className="relative pt-10 pb-20 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 dark:opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/10 blur-[100px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        {/* Avatar */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative"
                        >
                            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[3rem] overflow-hidden shadow-2xl ring-8 ring-slate-50 dark:ring-white/5">
                                {author.image ? (
                                    <img src={formatImageUrl(author.image, 400)} alt={author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                        <User size={80} className="text-slate-300 dark:text-slate-700" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left space-y-4 pt-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                        {language === 'hi' ? author.nameHi || author.name : author.name}
                                    </h1>
                                    <p className="text-red-600 font-black uppercase tracking-[0.2em] text-sm mt-1">
                                        {author.designation || (language === 'hi' ? 'लेखक' : 'Author')}
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={handleShare}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 active:scale-95"
                                >
                                    <Share2 size={16} />
                                    {language === 'hi' ? 'प्रोफ़ाइल साझा करें' : 'Share Profile'}
                                </button>
                            </div>

                            {author.description && (
                                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">
                                    {author.description}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                <div className="px-5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
                                    <Newspaper size={18} className="text-red-600" />
                                    <span className="text-sm font-bold">{author.articles?.length || 0} {language === 'hi' ? 'लेख' : 'Articles'}</span>
                                </div>
                                <div className="px-5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center gap-3">
                                    <FileText size={18} className="text-red-600" />
                                    <span className="text-sm font-bold">{author.blogs?.length || 0} {language === 'hi' ? 'ब्लॉग' : 'Blogs'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="sticky top-14 lg:top-20 z-20 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl border-y border-slate-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-8">
                        <button 
                            onClick={() => setActiveTab('articles')}
                            className={`py-6 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === 'articles' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {language === 'hi' ? 'लेख' : 'Articles'}
                            {activeTab === 'articles' && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('blogs')}
                            className={`py-6 text-xs font-black uppercase tracking-widest relative transition-all ${activeTab === 'blogs' ? 'text-red-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {language === 'hi' ? 'ब्लॉग' : 'Insights / Blogs'}
                            {activeTab === 'blogs' && (
                                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 rounded-full" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
                {posts?.length === 0 ? (
                    <div className="py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
                            <Newspaper className="text-slate-300 dark:text-slate-700" size={32} />
                        </div>
                        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
                            {language === 'hi' 
                                ? `अभी तक कोई ${activeTab === 'articles' ? 'लेख' : 'ब्लॉग'} प्रकाशित नहीं हुआ है` 
                                : `No ${activeTab} published yet`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post, index) => (
                            <motion.div 
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <Link 
                                    to={activeTab === 'articles' ? `/article/${post.slug || post.id}` : `/insight/${post.slug || post.id}`}
                                    className="group block bg-white dark:bg-white/5 rounded-[2rem] overflow-hidden border border-slate-50 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-red-600/5 transition-all"
                                >
                                    <div className="relative h-56 overflow-hidden">
                                        <img 
                                            src={formatImageUrl(post.image, 600)} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <div className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-red-600">
                                                {activeTab === 'articles' 
                                                    ? (language === 'hi' ? 'लेख' : 'Article') 
                                                    : (language === 'hi' ? 'ब्लॉग' : 'Insight')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Calendar size={12} />
                                            <span>{new Date(post.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}</span>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-widest group-hover:gap-3 transition-all">
                                            {language === 'hi' ? 'और पढ़ें' : 'Read More'} <ChevronRight size={14} />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorProfilePage;
