import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/api';
import { Moon, Sun } from 'lucide-react';

const AdminLogin = ({ setToken }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Theme logic typically managed by parent or context, keeping simple local toggle for login screen independently or inheriting?
    // Let's assume theme is global class on html
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await loginUser(email, password);
            if (data.token) {
                localStorage.setItem('token', data.token); // Securely store
                localStorage.setItem('user', JSON.stringify(data.user));
                setToken(data.token);
            }
        } catch (err) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300`}>
            <div className="absolute top-6 right-6">
                <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-900 dark:text-white hover:scale-110 transition-transform">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 lg:p-12 rounded-3xl shadow-2xl w-full max-w-md space-y-8 backdrop-blur-sm border border-slate-100 dark:border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-orange-500"></div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Admin Portal</h1>
                    <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access the panel</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center animate-pulse">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : 'Sign In'}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
