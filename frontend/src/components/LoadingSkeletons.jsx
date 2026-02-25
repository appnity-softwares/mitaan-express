import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
    <div className="animate-pulse">
        <div className="bg-slate-200 dark:bg-slate-700 rounded-2xl h-48 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
    </div>
);

export const SkeletonHero = () => (
    <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl h-[600px] flex items-center justify-center">
        <div className="text-center space-y-4">
            <div className="h-8 bg-slate-300 dark:bg-slate-700 rounded w-64 mx-auto"></div>
            <div className="h-12 bg-slate-300 dark:bg-slate-700 rounded w-96 mx-auto"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-80 mx-auto"></div>
        </div>
    </div>
);

export const SkeletonSidebar = () => (
    <div className="animate-pulse space-y-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-4">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

export const PageLoader = () => (
    <div className="fixed inset-0 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6"
        >
            <div className="relative">
                <motion.div
                    className="w-16 h-16 border-4 border-red-600/20 rounded-full"
                />
                <motion.div
                    className="absolute inset-0 w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">
                    Mitaan<span className="text-red-600">.</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">Loading Excellence</p>
            </div>
        </motion.div>
    </div>
);

const LoadingSkeletons = ({ type }) => {
    switch (type) {
        case 'hero': return <SkeletonHero />;
        case 'card': return <SkeletonCard />;
        case 'sidebar': return <SkeletonSidebar />;
        case 'page': return <PageLoader />;
        default: return <PageLoader />;
    }
};

export default LoadingSkeletons;
