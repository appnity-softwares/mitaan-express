import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const NotFoundPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <SEO title="404 - Page Not Found" description="The page you are looking for does not exist." />
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative">
                    <h1 className="text-9xl font-black text-slate-100 dark:text-slate-800/30 select-none">404</h1>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-3xl text-red-600 mt-8">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 relative z-10 -mt-6">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Page Not Found
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <Link
                        to="/"
                        className="px-6 py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                    >
                        <Home size={16} />
                        Homepage
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
