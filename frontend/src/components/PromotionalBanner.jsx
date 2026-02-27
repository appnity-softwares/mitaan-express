import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Megaphone, Feather } from 'lucide-react';

const PromotionalBanner = ({ language }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full bg-white dark:bg-[#030712] rounded-3xl overflow-hidden relative p-10 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 group shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/5 transition-colors"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.05, 0.1, 0.05],
                        rotate: [0, 90, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] bg-red-600 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 max-w-2xl space-y-8">
                <div className="flex items-center gap-3">
                    <span className="bg-slate-100 dark:bg-white/10 backdrop-blur-md text-red-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-slate-200 dark:border-white/10 flex items-center gap-2">
                        <Feather size={14} />
                        {language === 'hi' ? 'विशेष काव्य' : 'Featured Poetry'}
                    </span>
                    <Sparkles className="text-yellow-500 animate-pulse" size={20} />
                </div>

                <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] font-serif tracking-tighter">
                    {language === 'hi' ? 'शब्दों का जादू' : 'Magic of Words'} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-400">
                        {language === 'hi' ? 'मितान एक्सप्रेस के साथ' : 'with Mitaan Express'}
                    </span>
                </h2>

                <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl leading-relaxed max-w-lg font-medium">
                    {language === 'hi'
                        ? 'हमारी काव्य यात्रा में शामिल हों—भावनाओं और शब्दों के अनूठे संगम का अनुभव करें।'
                        : "Join our poetic journey—experience the unique blend of emotions and words directly from our finest writers."}
                </p>

                <div className="flex items-center gap-6 pt-4">
                    <button
                        onClick={() => window.location.href = '/category/poetry'}
                        className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 font-black text-xs uppercase tracking-widest transition-all rounded-xl flex items-center gap-3 group/btn shadow-xl shadow-red-600/20"
                    >
                        {language === 'hi' ? 'काव्य पढ़ें' : 'READ POETRY'}
                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => window.location.href = '/about'}
                        className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest border-b-2 border-slate-200 dark:border-white/10 hover:border-red-600 pb-1 transition-all"
                    >
                        {language === 'hi' ? 'और जानें' : 'LEARN MORE'}
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    className="w-32 h-32 lg:w-48 lg:h-48 bg-slate-50 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center relative border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-3xl"
                >
                    <div className="absolute inset-0 bg-red-600 blur-3xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity rounded-full"></div>
                    <Feather size={60} className="text-red-600 relative z-10" />

                    {/* Decorative Ring */}
                    <div className="absolute -inset-4 border border-red-600/20 rounded-[3rem] animate-[spin_20s_linear_infinite]"></div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PromotionalBanner;
