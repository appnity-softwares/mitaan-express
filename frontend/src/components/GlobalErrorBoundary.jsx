import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-6 text-center font-sans">
                    <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-orange-500"></div>

                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                            </div>

                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-serif">
                                Oops! Something's <span className="text-red-600 italic">Off.</span>
                            </h1>

                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                We've encountered an unexpected issue while loading this page. Our team has been notified.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>
                                Refresh Session
                            </button>

                            <button
                                onClick={() => window.location.href = '/'}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                            >
                                Back to Homepage
                            </button>
                        </div>

                        {process.env.NODE_ENV !== 'production' && (
                            <details className="text-left mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                <summary className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-red-600 transition-colors">
                                    Technical Diagnostics
                                </summary>
                                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-auto max-h-40 border border-slate-200 dark:border-white/5">
                                    <p className="text-xs font-bold text-red-600 mb-2">{this.state.error?.toString()}</p>
                                    <pre className="text-[10px] text-slate-500 dark:text-slate-500 font-mono leading-tight">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
