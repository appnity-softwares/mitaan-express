import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../hooks/useQueries';
import { API_URL } from '../services/api';
import { Heart, Coffee, CreditCard, QrCode, CheckCircle2, IndianRupee, Landmark, User, Mail, MessageSquare, FileText, Globe } from 'lucide-react';

const DonationPage = ({ language, toggleLanguage }) => {
    const { data: settings } = useSettings();
    const [method, setMethod] = useState('qr'); // 'qr', 'bank', 'manual'
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        amount: '0',
        message: '',
        details: '' // UTR or Bank Ref
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleAnonymous = () => {
        setIsAnonymous(!isAnonymous);
        if (!isAnonymous) {
            setFormData(prev => ({ ...prev, name: '', email: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData, method };
            if (isAnonymous) {
                delete payload.name;
                delete payload.email;
            }

            const response = await fetch(`${API_URL}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: '', email: '', message: '', details: '' });
                setIsAnonymous(false);
            }
        } catch (error) {
            console.error('Donation error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#030712] transition-colors duration-300 relative">


            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center space-y-6 mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex p-4 bg-red-600/10 text-red-600 rounded-full"
                    >
                        <Heart size={32} fill="currentColor" />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white font-serif italic">
                        {language === 'hi' ? 'सहयोग करें' : 'Support Our Journalism'}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        {language === 'hi'
                            ? 'मितान एक्सप्रेस को स्वतंत्र रखने में हमारी मदद करें। आपकी छोटी सी मदद हमें बेहतर पत्रकारिता करने की शक्ति देती है।'
                            : 'Help us keep Mitaan Express independent. Your contribution empowers us to continue delivering high-quality, unbiased journalism.'}
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-[40px] shadow-2xl overflow-hidden">
                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row border-b border-slate-100 dark:border-white/10">
                        <button
                            onClick={() => setMethod('qr')}
                            className={`flex-1 py-6 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${method === 'qr' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <QrCode size={18} />
                            {language === 'hi' ? 'क्यूआर / यूपीआई' : 'QR / UPI'}
                        </button>
                        <button
                            onClick={() => setMethod('bank')}
                            className={`flex-1 py-6 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest transition-all ${method === 'bank' ? 'bg-red-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                        >
                            <Landmark size={18} />
                            {language === 'hi' ? 'बैंक ट्रांसफर' : 'Bank Transfer'}
                        </button>
                    </div>

                    <div className="p-8 md:p-12">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-10 space-y-6"
                            >
                                <div className="flex justify-center text-green-500">
                                    <CheckCircle2 size={64} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white font-serif italic">
                                    {language === 'hi' ? 'धन्यवाद!' : 'Thank You!'}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {language === 'hi' ? 'आपका योगदान सफलतापूर्वक दर्ज कर लिया गया है।' : 'Your contribution has been successfully recorded.'}
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform"
                                >
                                    {language === 'hi' ? 'एक और योगदान करें' : 'Make Another Donation'}
                                </button>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                {/* Left Column: Payment Instructions */}
                                <div className="space-y-8">
                                    {method === 'qr' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm">
                                                <img
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${settings?.donation_upi_id || 'mitaanexpress@upi'}&pn=Mitaan%20Express&cu=INR`}
                                                    alt="UPI QR Code"
                                                    className="w-48 h-48 mix-blend-multiply dark:mix-blend-normal"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-slate-900 dark:text-white mb-2">
                                                    {language === 'hi' ? 'किसी भी यूपीआई ऐप से स्कैन करें' : 'Scan with any UPI App'}
                                                </p>
                                                <p className="text-xs text-slate-500">Google Pay, PhonePe, Paytm, BHIM</p>
                                                <div className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
                                                    {settings?.donation_upi_id || 'mitaanexpress@upi'}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {method === 'bank' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-8 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10">
                                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-4">
                                                {language === 'hi' ? 'बैंक विवरण' : 'Bank Details'}
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                        {language === 'hi' ? 'खाता धारक' : 'Account Holder'}
                                                    </p>
                                                    <p className="font-serif text-lg text-slate-900 dark:text-white">
                                                        {language === 'hi'
                                                            ? (settings?.donation_account_holder_hi || 'मितान एक्सप्रेस मीडिया ट्रस्ट')
                                                            : (settings?.donation_account_holder || 'Mitaan Express Media Trust')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                        {language === 'hi' ? 'खाता संख्या' : 'Account Number'}
                                                    </p>
                                                    <p className="font-mono text-lg text-slate-900 dark:text-white">{settings?.donation_account_number || '1234 5678 9012 3456'}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                            {language === 'hi' ? 'आईएफएससी कोड' : 'IFSC Code'}
                                                        </p>
                                                        <p className="font-mono text-slate-900 dark:text-white">{settings?.donation_ifsc || 'SBIN0001234'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                                            {language === 'hi' ? 'बैंक' : 'Bank'}
                                                        </p>
                                                        <p className="text-slate-900 dark:text-white">
                                                            {language === 'hi'
                                                                ? (settings?.donation_bank_name_hi || 'स्टेट बैंक ऑफ इंडिया')
                                                                : (settings?.donation_bank_name || 'State Bank of India')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Right Column: Donation Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({
                                                name: 'Demo User',
                                                email: 'demo@example.com',
                                                amount: '500',
                                                message: 'Test donation message',
                                                details: 'TXN-DEMO-12345'
                                            })}
                                            className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                                        >
                                            [ Fill Demo Data ]
                                        </button>
                                    </div>
                                    {/* Amount Selection */}
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                            {language === 'hi' ? 'सहयोग राशि' : 'Contribution Amount'} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['100', '500', '1000'].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, amount: amt }))}
                                                    className={`py-3 rounded-xl font-bold text-sm transition-all border ${formData.amount === amt
                                                        ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-red-200'
                                                        }`}
                                                >
                                                    ₹{amt}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="number"
                                                name="amount"
                                                required
                                                min="1"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder={language === 'hi' ? 'अन्य राशि दर्ज करें' : 'Enter Custom Amount'}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Sender Details */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/10">
                                        <div className="mb-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                                {language === 'hi' ? 'आपका विवरण' : 'Your Details'}
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="relative">
                                                <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    placeholder={language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    placeholder={language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                            {language === 'hi' ? 'लेनदेन आईडी' : 'Transaction ID'} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <FileText size={16} className="absolute left-6 top-6 text-slate-400" />
                                            <textarea
                                                rows="2"
                                                name="details"
                                                required
                                                value={formData.details}
                                                onChange={handleInputChange}
                                                placeholder={language === 'hi' ? 'यूपीआई / बैंक लेनदेन आईडी दर्ज करें' : 'Enter UPI / Bank Transaction ID'}
                                                className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600 outline-none transition-all dark:text-white resize-none"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-6 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/30 disabled:opacity-50"
                                    >
                                        {loading ? (language === 'hi' ? 'प्रक्रिया चल रही है...' : 'PROCESSING...') : (language === 'hi' ? 'पुष्टि करें' : 'CONFIRM DONATION')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* FAQ or Info */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl space-y-4">
                        <div className="text-red-600 bg-red-600/10 w-fit p-3 rounded-xl"><Coffee size={24} /></div>
                        <h4 className="font-bold dark:text-white">
                            {language === 'hi' ? 'पारदर्शी' : 'Transparent'}
                        </h4>
                        <p className="text-sm text-slate-500">
                            {language === 'hi' ? 'हर रुपया पत्रकारिता और रिपोर्टिंग के लिए उपयोग किया जाता है।' : 'Every rupee is used to fund deep investigative reports and field journalism.'}
                        </p>
                    </div>
                    <div className="p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl space-y-4">
                        <div className="text-red-600 bg-red-600/10 w-fit p-3 rounded-xl"><CreditCard size={24} /></div>
                        <h4 className="font-bold dark:text-white">
                            {language === 'hi' ? 'सुरक्षित' : 'Secure'}
                        </h4>
                        <p className="text-sm text-slate-500">
                            {language === 'hi' ? 'आपकी जानकारी सुरक्षित है। हम सभी लेनदेन के लिए एन्क्रिप्शन का उपयोग करते हैं।' : 'Your details are safe with us. We use industry-standard encryption for all transactions.'}
                        </p>
                    </div>
                    <div className="p-8 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl space-y-4">
                        <div className="text-red-600 bg-red-600/10 w-fit p-3 rounded-xl"><CheckCircle2 size={24} /></div>
                        <h4 className="font-bold dark:text-white">
                            {language === 'hi' ? 'प्रभावशाली' : 'Impactful'}
                        </h4>
                        <p className="text-sm text-slate-500">
                            {language === 'hi' ? '10,000+ समर्थकों के समुदाय में शामिल हों जो सच्चाई में विश्वास करते हैं।' : 'Join a community of 10,000+ supporters who believe in truth and integrity.'}
                        </p>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DonationPage;
