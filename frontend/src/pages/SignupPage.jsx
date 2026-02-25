import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';
import { Moon, Sun, Mail, Lock, User } from 'lucide-react';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'light';
        }
        return 'light';
    });

    React.useEffect(() => {
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

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const data = await registerUser(email, password, name);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300 py-12">
            <div className="absolute top-6 right-6">
                <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-900 dark:text-white hover:scale-110 transition-transform">
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>

            <div className="w-full max-w-md px-6">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 lg:p-10 rounded-3xl shadow-2xl border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-4">
                            M
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Join our community today</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 dark:text-white rounded-xl outline-none focus:ring-2 ring-red-600 border border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-red-600 font-bold hover:underline">
                            Sign In
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
