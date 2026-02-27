import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu, Database, Globe, Zap, Code, Terminal, Server } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AppnityAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (user.email !== 'appnitysoftwares@gmail.com') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-0"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                            Developer Vault
                        </div>
                        <div className="h-[1px] w-12 bg-white/20"></div>
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-4 italic font-serif">
                        Appnity <span className="text-red-600">Command</span> Center
                    </h2>
                    <p className="text-slate-400 font-medium max-w-2xl text-lg">
                        Welcome, Appnity Architect. This is your high-tier administrative nexus.
                        Global system integrity is currently <span className="text-emerald-500 font-bold uppercase">Optimized</span>.
                    </p>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Core Engine', value: 'v4.2.0-stable', icon: <Cpu className="text-blue-500" />, desc: 'Node.js Cluster Mode' },
                    { label: 'Database Flux', value: 'Active', icon: <Database className="text-emerald-500" />, desc: 'Prisma ORM • PostgreSQL' },
                    { label: 'CDN Integrity', value: '100%', icon: <Globe className="text-amber-500" />, desc: 'Cloudflare R2 Protected' },
                    { label: 'Neural Uplink', value: 'Enabled', icon: <Zap className="text-purple-500" />, desc: 'AI Engine Integration' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-xl group hover:border-red-500/30 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status: Live</div>
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{stat.value}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">{stat.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Developer Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl">
                        <h3 className="flex items-center gap-3 font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight mb-8">
                            <Terminal className="text-red-600" /> Infrastructure Logs
                        </h3>
                        <div className="bg-slate-950 rounded-2xl p-6 font-mono text-sm text-emerald-500/80 space-y-2 overflow-x-auto border border-white/5">
                            <p className="text-slate-500 opacity-50">[2026-02-27 13:45:12] SYSTEM: Initializing Appnity Admin Nexus...</p>
                            <p>[OK] Environment variables encrypted and stored.</p>
                            <p>[OK] Cloudflare R2 bucket connection verified.</p>
                            <p>[OK] PostgreSQL database migrations applied.</p>
                            <p className="text-blue-400 font-bold">UPLINK: Connected to Mitaan-Express-Core-Service</p>
                            <p className="text-yellow-500">WARNING: Deployment key updated via Master Control.</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-gradient-to-br from-red-600 to-orange-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                        <ShieldAlert size={48} className="mb-6 opacity-30 group-hover:opacity-100 group-hover:rotate-12 transition-all" />
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Emergency Override</h4>
                        <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                            Instant global lockdown and reset protocol. This action is irreversible and requires multi-factor authentication.
                        </p>
                        <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl font-black uppercase text-xs tracking-widest border border-white/30 hover:bg-white hover:text-red-600 transition-all active:scale-95 shadow-2xl">
                            Activate Lockdown
                        </button>
                    </div>

                    <div className="bg-slate-100 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/10">
                        <h4 className="flex items-center gap-2 font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest mb-6 border-b border-slate-200 dark:border-white/10 pb-4">
                            <Server size={18} className="text-slate-500" /> Server Matrix
                        </h4>
                        <div className="space-y-4">
                            {[
                                { name: 'Main API', uptime: '142 days', status: 'Online' },
                                { name: 'Worker-01', uptime: '12 days', status: 'Standby' },
                                { name: 'Memory Dist', uptime: '99.9%', status: 'Safe' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                    <span className="text-xs font-bold text-slate-500">{item.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-700 dark:text-white">{item.uptime}</span>
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppnityAdmin;
