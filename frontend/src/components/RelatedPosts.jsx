import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RelatedPosts = ({ articles, language }) => {
    if (!articles || articles.length === 0) return null;

    return (
        <section className="mt-20 pt-16 border-t border-slate-100 dark:border-white/5">
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-12">
                <div className="w-1.5 h-10 bg-blue-600 rounded-full"></div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    Related <span className="text-blue-600">Posts</span>
                </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((article, index) => {
                    const formattedDate = new Date(article.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group cursor-pointer"
                        >
                            <Link to={`/article/${article.slug || article.id}`} className="block space-y-4 max-w-[280px]">
                                {/* Image Wrapper */}
                                <div className="aspect-[3/2] overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 bg-slate-100 dark:bg-slate-900">
                                    <img
                                        src={article.image || 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=800'}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?auto=format&fit=crop&q=80&w=800';
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="space-y-2 mt-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors font-serif">
                                        {article.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {formattedDate}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
};

export default RelatedPosts;
