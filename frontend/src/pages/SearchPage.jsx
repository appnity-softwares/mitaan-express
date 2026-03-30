import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import LoadingSkeletons from '../components/LoadingSkeletons';
import SEO from '../components/SEO';
import { Search } from 'lucide-react';
import { globalSearch } from '../services/api';
import { motion } from 'framer-motion';

const SearchPage = ({ language }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [results, setResults] = useState({ articles: [], blogs: [], categories: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const data = await globalSearch(query);
                setResults(data);
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    const totalResults = results.articles.length + results.blogs.length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] pt-24 pb-20">
            <SEO 
                title={`${query ? `Search: ${query}` : 'Search'} - Mitaan Express`}
                description={`Search results for "${query}" on Mitaan Express. Find the latest news, blogs, and insights.`}
            />

            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                {/* Search Header */}
                <div className="mb-12">
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4">
                        {language === 'hi' ? 'खोज परिणाम' : 'Search Results'}
                    </h1>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                        <Search size={14} className="text-red-600" />
                        <span>
                            {language === 'hi' 
                                ? `"${query}" के लिए ${totalResults} परिणाम मिले` 
                                : `Found ${totalResults} results for "${query}"`}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeletons type="grid" />
                ) : (
                    <div className="space-y-16">
                        {/* Articles */}
                        {results.articles.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {language === 'hi' ? 'प्रकाशित समाचार' : 'Latest Articles'}
                                    </h2>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {results.articles.map((article, idx) => (
                                        <motion.div 
                                            key={article.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <ArticleCard article={article} language={language} />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Blogs/Insights */}
                        {results.blogs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {language === 'hi' ? 'विशेष विश्लेषण (Blogs)' : 'Insights & Blogs'}
                                    </h2>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {results.blogs.map((blog, idx) => (
                                        <motion.div 
                                            key={blog.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <ArticleCard article={blog} language={language} isBlog />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {!query && (
                            <div className="text-center py-20">
                                <Search size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
                                <p className="text-slate-500 font-bold text-xl">
                                    {language === 'hi' ? 'खोजने के लिए कुछ टाइप करें...' : 'Type something to search...'}
                                </p>
                            </div>
                        )}

                        {query && totalResults === 0 && !loading && (
                            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 shadow-xl">
                                <Search size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
                                <p className="text-slate-500 font-bold text-xl mb-2">
                                    {language === 'hi' ? `"${query}" के लिए कोई परिणाम नहीं मिला` : `No results found for "${query}"`}
                                </p>
                                <p className="text-slate-400 text-sm">
                                    {language === 'hi' ? 'कृपया अलग कीवर्ड्स का उपयोग करें।' : 'Please try using different keywords.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
