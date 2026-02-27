import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, Cpu, Database, Globe, Zap, Code, Terminal,
    Server, Users, Settings, Database as DbIcon, ShieldCheck,
    AlertOctagon, RefreshCcw, Activity, Ghost, Lock, Unlock,
    UserPlus, Trash2, Key, Save, Search
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API_URL } from '../../services/api';
import { useUsers, useSettings } from '../../hooks/useQueries';

const AppnityAdmin = () => {
    const userLocal = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');

    // Auth Guard
    if (userLocal.email !== 'appnitysoftwares@gmail.com') {
        return <Navigate to="/admin" replace />;
    }

    const [activeTab, setActiveTab] = useState('overview');
    const { data: users, refetch: refetchUsers } = useUsers();
    const { data: settings, refetch: refetchSettings } = useSettings();
    const [searchTerm, setSearchTerm] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [rawJson, setRawJson] = useState('');

    useEffect(() => {
        if (settings) {
            setRawJson(JSON.stringify(settings, null, 4));
        }
    }, [settings]);

    const handleElevateUser = async (userId, role = 'ADMIN') => {
        setIsProcessing(true);
        try {
            const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role })
            });

            if (!response.ok) throw new Error('Elevation failed');
            toast.success(`User ${role} Status Locked`);
            refetchUsers();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveRawConfig = async () => {
        setIsProcessing(true);
        try {
            const config = JSON.parse(rawJson);
            const response = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(config)
            });

            if (!response.ok) throw new Error('Config injection failed');
            toast.success('Master Configuration Injected');
            refetchSettings();
        } catch (error) {
            toast.error('JSON Error: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredUsers = users?.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen pb-24">
            {/* Master Header */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[120px] -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-0"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full">
                                Root Nexus v5.0
                            </div>
                            <div className="h-[1px] w-12 bg-white/20"></div>
                        </div>
                        <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter mb-4 italic font-serif leading-none">
                            Appnity <span className="text-red-600">GOD</span> MODE
                        </h2>
                        <p className="text-slate-400 font-medium max-w-2xl text-lg">
                            Master Architect: {userLocal.name}. You have unrestricted access to the site's neural pathways.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        {['overview', 'users', 'config', 'terminal'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 text-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Active Admins', value: users?.filter(u => u.role === 'ADMIN').length || 0, icon: <Lock className="text-red-500" />, desc: 'Privileged Access nodes' },
                                { label: 'System Health', value: '100%', icon: <ShieldCheck className="text-emerald-500" />, desc: 'All units operational' },
                                { label: 'Data Integrity', value: 'Verified', icon: <DbIcon className="text-blue-500" />, desc: 'PostgreSQL Sync Active' },
                                { label: 'Nexus Uptime', value: 'Over 9000', icon: <RefreshCcw className="text-amber-500" />, desc: 'Infinite session loop' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-900 p-6 rounded-3xl border border-white/5 shadow-xl">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-white/5 rounded-2xl">{stat.icon}</div>
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    </div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <p className="text-3xl font-black uppercase tracking-tighter mt-1">{stat.value}</p>
                                    <p className="text-[10px] text-slate-500 mt-2">{stat.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 bg-slate-900 rounded-[2.5rem] p-8 border border-white/5">
                                <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                                    <Activity className="text-red-600" /> Neural Pulse Monitoring
                                </h3>
                                <div className="space-y-4">
                                    {users?.slice(0, 5).map((u, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-default group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center font-black text-xs">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm">{u.name}</p>
                                                    <p className="text-[10px] text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-500'}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-gradient-to-br from-red-600 to-red-900 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full group-hover:scale-150 transition-transform"></div>
                                    <AlertOctagon size={48} className="mb-4 text-white animate-pulse" />
                                    <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Global Flush</h4>
                                    <p className="text-red-100 text-sm font-medium mb-6">Purge all temporary caches, session tokens, and logs. This is a cold reboot of the application layer.</p>
                                    <button
                                        className="w-full py-4 bg-white text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all"
                                        onClick={() => toast.success('Global Flush Protocol Initialized')}
                                    >
                                        Execute Purge
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    className="w-full pl-16 pr-6 py-5 bg-slate-900 text-white rounded-[2rem] border border-white/5 outline-none focus:ring-2 ring-red-600/50 transition-all font-bold"
                                    placeholder="Scouring the database for subjects..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="bg-slate-900 p-6 rounded-3xl border border-white/5 flex items-center justify-between group hover:border-red-600/50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-xl text-slate-500 group-hover:text-white transition-colors">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase tracking-tighter">{u.name}</p>
                                            <p className="text-xs text-slate-500 font-bold">{u.email}</p>
                                            <div className="mt-2 flex gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                                    {u.role}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        {u.role !== 'ADMIN' ? (
                                            <button
                                                onClick={() => handleElevateUser(u.id, 'ADMIN')}
                                                disabled={isProcessing}
                                                className="p-3 bg-red-600 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                title="Elevate to Admin"
                                            >
                                                <Unlock size={18} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleElevateUser(u.id, 'USER')}
                                                disabled={isProcessing}
                                                className="p-3 bg-slate-800 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                                                title="Revoke Admin Rights"
                                            >
                                                <Lock size={18} />
                                            </button>
                                        )}
                                        <button
                                            className="p-3 bg-slate-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                            title="Banish from existence"
                                            onClick={() => toast.error('Banishment requires Level 2 protocol')}
                                        >
                                            <Ghost size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'config' && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6">
                        <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-red-600 rounded-2xl text-white">
                                        <Settings size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black uppercase tracking-tighter text-xl">Raw Configuration Injection</h3>
                                        <p className="text-xs text-slate-500 font-bold tracking-widest">DANGER: DIRECT JSON MANIPULATION</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSaveRawConfig}
                                    disabled={isProcessing}
                                    className="px-8 py-3 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    Inject Master Payload
                                </button>
                            </div>
                            <div className="p-4 bg-slate-950">
                                <textarea
                                    className="w-full h-[600px] bg-transparent text-emerald-500 font-mono text-sm outline-none resize-none p-4 selection:bg-red-600 selection:text-white"
                                    value={rawJson}
                                    onChange={(e) => setRawJson(e.target.value)}
                                    spellCheck="false"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'terminal' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        <div className="bg-slate-950 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl font-mono text-sm">
                            <div className="p-4 bg-slate-900 border-b border-white/5 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="ml-4 text-[10px] font-black uppercase text-slate-500 tracking-widest italic">Appnity-Admin-Terminal-Nexus</span>
                            </div>
                            <div className="p-8 space-y-4 text-emerald-500/90 h-[500px] overflow-y-auto custom-scrollbar">
                                <p className="text-slate-500">[SYSTEM] Initializing Uplink...</p>
                                <p className="text-blue-400">--- APPNITY INFRASTRUCTURE REPORT ---</p>
                                <p>OS: Containerized Linux Node v20.12</p>
                                <p>Memory: 1024MB Peak Alloc</p>
                                <p>Database: PostgreSQL (Cluster) via Prisma</p>
                                <p>Storage: Cloudflare R2 Global Bucket</p>
                                <p className="text-slate-500 mt-4">[LOGS] Last 24h Activity:</p>
                                <table className="w-full text-[10px] text-white/50">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left py-2">Timestamp</th>
                                            <th className="text-left py-2">Action</th>
                                            <th className="text-left py-2">Entity</th>
                                            <th className="text-left py-2">Integrity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { t: '13:42:15', a: 'UPLOAD_R2', e: 'cover_story.webp', i: 'Valid' },
                                            { t: '13:40:02', a: 'DB_UPSERT', e: 'article_902', i: 'Compacted' },
                                            { t: '13:38:44', a: 'AUTH_CHNG', e: 'password_reset', i: 'Secure' },
                                            { t: '12:15:22', a: 'CRON_JOB', e: 'analytics_sync', i: 'Success' }
                                        ].map((l, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:text-white transition-colors">
                                                <td className="py-2 text-slate-500 font-bold">{l.t}</td>
                                                <td className="py-2">{l.a}</td>
                                                <td className="py-2">{l.e}</td>
                                                <td className="py-2 text-emerald-500">{l.i}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="animate-pulse text-white mt-8">Uplink Stable. Awaiting commands...</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.2); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            `}} />
        </div>
    );
};

export default AppnityAdmin;
