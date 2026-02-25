import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import AdSpace from './AdSpace';
import { useArticles } from '../context/ArticlesContext';

const Sidebar = ({ language, showWeather = true }) => {
    const { trending, loading } = useArticles();

    // Map trending articles to sidebar format
    const sidebarArticles = trending.length > 0
        ? trending.slice(0, 5).map(a => ({
            id: a.id,
            title: a.title,
            image: a.image,
            category: a.category?.name || 'TRENDING',
            slug: a.slug
        }))
        : [{
            id: 's1',
            title: "Welcome to Mitaan Express",
            image: 'https://images.unsplash.com/photo-1538332576228-eb5b4c4de6f5?auto=format&fit=crop&q=80&w=300',
            category: 'News'
        }];

    return (
        <aside className="sticky top-32 space-y-8">
            <div className="space-y-4">
                {showWeather && <WeatherWidget language={language} />}
                <div className="pt-2">
                    <AdSpace position="sidebar" className="my-0" />
                </div>
            </div>

            <section className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl -z-10 rounded-full"></div>

                <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] mb-10 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                        {language === 'hi' ? 'ट्रेंडिंग नाउ' : 'Trending Now'}
                    </span>
                </h3>

                <div className="space-y-8">
                    {sidebarArticles.map((article, index) => (
                        <motion.div
                            key={article.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex gap-4 cursor-pointer items-start border-b border-slate-50 dark:border-white/5 pb-6 last:border-0 last:pb-0"
                            onClick={() => window.location.href = `/article/${article.slug}`}
                        >
                            <span className="text-3xl font-black text-black-600 dark:text-white/10 group-hover:text-red-600/30 transition-colors font-serif leading-none mt-1">
                                {index + 1}
                            </span>
                            <div className="space-y-1.5">
                                <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{article.category}</span>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-gray-200 leading-snug group-hover:text-red-600 transition-colors line-clamp-2 font-serif">
                                    {article.title}
                                </h4>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Skyscraper Banner */}
            <div className="pt-4">
                <AdSpace position="skyscraper" className="w-full" />
            </div>

            {/* Subscription Section Removed */}
        </aside>
    );
};

export default Sidebar;
