import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Feather, FileText, Quote, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useSettings } from '../hooks/useQueries';

const CreativeShowcase = ({ language, setActiveCategory }) => {
    const { data: settings } = useSettings();
    const [activePoem, setActivePoem] = useState(0);
    const [displayedText, setDisplayedText] = useState('');

    const defaultPoetry = [
        {
            title: language === 'hi' ? 'जीवन की राह' : 'Path of Life',
            author: language === 'hi' ? 'मितान कवि' : 'Mitaan Poet',
            excerpt: language === 'hi'
                ? 'चलो चलें उस राह पर, जहाँ सितारे मिलते हैं,\nजहाँ हवाएं गीत गाती हैं, जहाँ सपने खिलते हैं।'
                : 'Walk the path where stars align,\nWhere winds sing songs, where dreams entwine.',
            category: language === 'hi' ? 'प्रेरणा' : 'Inspiration'
        },
        {
            title: language === 'hi' ? 'शब्दों का सफर' : 'Journey of Words',
            author: language === 'hi' ? 'मितान कवि' : 'Mitaan Poet',
            excerpt: language === 'hi'
                ? 'शब्दों में छुपी है दुनिया सारी,\nहर अक्षर में बसी है कहानी हमारी।'
                : 'In words lies a world untold,\nEvery letter a story of gold.',
            category: language === 'hi' ? 'साहित्य' : 'Literature'
        },
        {
            title: language === 'hi' ? 'प्रकृति का गीत' : 'Song of Nature',
            author: language === 'hi' ? 'मितान कवि' : 'Mitaan Poet',
            excerpt: language === 'hi'
                ? 'पेड़ों की छाँव में, नदी का गीत सुनो,\nप्रकृति की गोद में, जीवन का अर्थ चुनो।'
                : 'Beneath the shade of ancient trees,\nHear the rivers, feel the breeze.',
            category: language === 'hi' ? 'प्रकृति' : 'Nature'
        }
    ];

    let poems = defaultPoetry;
    try {
        if (settings?.featured_poetry_json) {
            const parsed = JSON.parse(settings.featured_poetry_json);
            if (Array.isArray(parsed) && parsed.length > 0) {
                poems = parsed.map(p => ({
                    title: language === 'hi' ? (p.titleHi || p.title) : p.title,
                    author: language === 'hi' ? (p.authorHi || p.author) : p.author,
                    excerpt: language === 'hi' ? (p.excerptHi || p.excerpt) : p.excerpt,
                    category: language === 'hi' ? (p.categoryHi || p.category) : p.category
                }));
            }
        }
    } catch (e) { }

    const currentPoem = poems[activePoem % poems.length];

    // Typewriter effect
    useEffect(() => {
        setDisplayedText('');
        const text = currentPoem.excerpt || '';
        let i = 0;
        const timer = setInterval(() => {
            if (i <= text.length) {
                setDisplayedText(text.slice(0, i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 30);
        return () => clearInterval(timer);
    }, [activePoem, currentPoem.excerpt]);

    // Auto-rotate every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setActivePoem(prev => (prev + 1) % poems.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [poems.length]);

    return (
        <section className="py-16 relative overflow-hidden">
            {/* Ambient gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-orange-50/30 dark:from-red-950/10 dark:via-transparent dark:to-orange-950/10 -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-white/10 pb-8 gap-6"
                >
                    <div className="space-y-4">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 text-red-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
                        >
                            <Sparkles size={12} />
                            {language === 'hi' ? 'संस्कृति और कला' : 'Culture & Arts'}
                        </motion.span>
                        <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tighter text-slate-900 dark:text-white">
                            {language === 'hi' ? 'रचनात्मकता का कोना' : 'Creative Pulse'}
                        </h2>
                    </div>
                    <motion.button
                        whileHover={{ x: 5 }}
                        onClick={() => setActiveCategory('poetry')}
                        className="flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors group text-slate-600 dark:text-slate-400"
                    >
                        {language === 'hi' ? 'सभी कविताएं' : 'All Poetry'}
                        <span className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-sm">
                            <ArrowRight size={16} />
                        </span>
                    </motion.button>
                </motion.div>

                {/* Main Content: 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

                    {/* Left: Featured Poetry with Typewriter */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-black/20"
                        >
                            {/* Top decorative bar */}
                            <div className="h-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />

                            <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                                {/* Poem Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center">
                                            <Feather size={22} className="text-red-600" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] block">
                                                {language === 'hi' ? 'विशेष कविता' : 'Featured Poetry'}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                {currentPoem.category}
                                            </span>
                                        </div>
                                    </div>
                                    <Quote size={32} className="text-red-600/10" />
                                </div>

                                {/* Poem Title */}
                                <AnimatePresence mode="wait">
                                    <motion.h3
                                        key={`title-${activePoem}`}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -15 }}
                                        className="text-2xl md:text-4xl font-black font-serif tracking-tight text-slate-900 dark:text-white"
                                    >
                                        {currentPoem.title}
                                    </motion.h3>
                                </AnimatePresence>

                                {/* Typewriter Poetry */}
                                <div className="min-h-[140px] md:min-h-[120px] relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-orange-500 rounded-full" />
                                    <div className="pl-5 md:pl-6">
                                        <p className="text-base md:text-xl font-serif text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line italic">
                                            {displayedText}
                                            <span className="inline-block w-0.5 h-4 md:h-5 bg-red-600 ml-0.5 animate-pulse" />
                                        </p>
                                    </div>
                                </div>

                                {/* Author & Navigation */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0">
                                            {currentPoem.author?.[0] || 'M'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{currentPoem.author}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                {language === 'hi' ? 'मितान एक्सप्रेस' : 'Mitaan Express'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Poem Navigation */}
                                    <div className="flex items-center justify-center gap-3 w-full sm:w-auto bg-slate-50 dark:bg-white/5 p-2 sm:p-0 rounded-2xl sm:bg-transparent">
                                        <button
                                            onClick={() => setActivePoem(prev => (prev - 1 + poems.length) % poems.length)}
                                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 sm:bg-slate-100 sm:dark:bg-white/5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-slate-500 shadow-sm sm:shadow-none"
                                            aria-label="Previous poem"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <div className="flex gap-2 px-2">
                                            {poems.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setActivePoem(i)}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activePoem % poems.length ? 'w-6 bg-red-600' : 'w-1.5 bg-slate-200 dark:bg-white/10'}`}
                                                    aria-label={`Go to poem ${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setActivePoem(prev => (prev + 1) % poems.length)}
                                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 sm:bg-slate-100 sm:dark:bg-white/5 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all text-slate-500 shadow-sm sm:shadow-none"
                                            aria-label="Next poem"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Quick Links + Blog Card */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Read Poetry CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            onClick={() => setActiveCategory('poetry')}
                            className="group relative min-h-[180px] md:h-[220px] rounded-3xl md:rounded-[2.5rem] overflow-hidden cursor-pointer bg-slate-900 border border-white/10 shadow-2xl"
                        >
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.2),transparent_70%)]" />
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

                            <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center">
                                        <Sparkles size={14} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">
                                        {language === 'hi' ? 'काव्य संग्रह' : 'Poetry Collection'}
                                    </span>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white font-serif tracking-tight leading-none">
                                        {language === 'hi' ? 'शब्दों का जादू' : 'Magic of Words'}
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="h-0.5 w-12 bg-red-600 rounded-full" />
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">
                                            {language === 'hi' ? 'पढ़ना शुरू करें' : 'START READING'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Blog Insights CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            onClick={() => setActiveCategory('insights')}
                            className="group relative flex-1 min-h-[180px] md:min-h-[220px] rounded-3xl md:rounded-[2.5rem] overflow-hidden cursor-pointer bg-gradient-to-br from-red-600 to-red-700 border border-red-500/20"
                        >
                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-white/70" />
                                    <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.3em]">
                                        {language === 'hi' ? 'ब्लॉग पढ़ें' : 'Read Blogs'}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-white font-serif tracking-tight">
                                        {language === 'hi' ? 'विशेषज्ञों के विचार' : 'Deep Insights'}
                                    </h3>
                                    <p className="text-sm text-white/80 font-medium max-w-[250px]">
                                        {language === 'hi' ? 'गहन विश्लेषण और नवीनतम अपडेट्स' : 'Expert opinions on technology & journalism'}
                                    </p>
                                    <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        {language === 'hi' ? 'देखें' : 'EXPLORE'} <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreativeShowcase;
