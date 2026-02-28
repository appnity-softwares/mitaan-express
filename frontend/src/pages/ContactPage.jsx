import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const ContactPage = ({ language }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = React.useState(false);
    const [showSuccess, setShowSuccess] = React.useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { createContact } = await import('../services/api');
            await createContact(formData);
            setLoading(false);
            setShowSuccess(true);
            setFormData({ name: '', email: '', subject: 'General Inquiry', phone: '', message: '' });
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Contact submit error:', error);
            setLoading(false);
            alert(language === 'hi' ? 'त्रुटि: संदेश भेजने में विफल' : 'Error: Failed to send message');
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors pb-32">
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover opacity-30 grayscale"
                        alt="Contact Us"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] block">
                            {language === 'hi' ? 'हमसे संपर्क करें' : 'GET IN TOUCH'}
                        </span>
                        <h1 className="text-5xl md:text-8xl font-black text-white font-serif tracking-tighter">
                            {language === 'hi' ? 'आपकी आवाज़' : "Let's Start a"} <br />
                            <span className="text-red-600">{language === 'hi' ? 'हमारे लिए महत्वपूर्ण है' : 'Conversation'}</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5">

                    {/* Contact Info Sidebar */}
                    <div className="lg:col-span-4 bg-red-600 p-12 lg:p-16 text-white space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Send size={240} />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black font-serif">{language === 'hi' ? 'संपर्क जानकारी' : 'Contact Info'}</h3>
                                <p className="text-white/70 font-medium">
                                    {language === 'hi' ? 'हम आपकी मदद के लिए हमेशा तैयार हैं।' : 'Reach out and we will get back to you.'}
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <Phone size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{language === 'hi' ? 'फोन' : 'Phone'}</p>
                                        <p className="font-bold text-lg">+91 93290 11157</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <Mail size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{language === 'hi' ? 'ईमेल' : 'Email'}</p>
                                        <p className="font-bold text-lg">mitaanexpress@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{language === 'hi' ? 'कार्यालय' : 'Office'}</p>
                                        <p className="font-bold text-lg leading-tight">Mitaan Express. A unit of Mitaan India Media Pvt.Ltd <br /> 2nd floor, B-259, Street-5, SMRITI NAGAR, BHILAI NAGAR, Dist-DURG, CHHATTISGARH - 490020</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 relative z-10">
                            <div className="flex gap-4">
                                {['FB', 'TW', 'IG', 'YT'].map((s) => (
                                    <a key={s} href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[10px] font-black hover:bg-white hover:text-red-600 transition-all">
                                        {s}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>


                    {/* Contact Form */}
                    <div className="lg:col-span-8 p-12 lg:p-20 space-y-12 transition-colors">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'hi' ? 'पूरा नाम' : 'FULL NAME'}</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-red-600 dark:focus:border-red-600 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'hi' ? 'ईमेल एड्रेस' : 'EMAIL ADDRESS'}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-red-600 dark:focus:border-red-600 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'hi' ? 'विषय' : 'SUBJECT'}</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-red-600 dark:focus:border-red-600 transition-colors appearance-none"
                                >
                                    <option value="General Inquiry">{language === 'hi' ? 'सामान्य पूछताछ' : 'General Inquiry'}</option>
                                    <option value="Advertising">{language === 'hi' ? 'एडवरटाइजिंग' : 'Advertising'}</option>
                                    <option value="Submit a Story">{language === 'hi' ? 'कहानी सबमिट करें' : 'Submit a Story'}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'hi' ? 'फोन नंबर' : 'PHONE NUMBER'}</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 00000 00000"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-red-600 dark:focus:border-red-600 transition-colors"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{language === 'hi' ? 'आपका संदेश' : 'YOUR MESSAGE'}</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="6"
                                    placeholder={language === 'hi' ? 'हम आपकी कैसे मदद कर सकते हैं?' : 'How can we help you?'}
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl px-6 py-5 outline-none focus:border-red-600 dark:focus:border-red-600 transition-colors resize-none"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 flex items-center gap-3 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (language === 'hi' ? 'भेज रहा है...' : 'SENDING...') : (language === 'hi' ? 'संदेश भेजें' : 'SEND MESSAGE')}
                                    {!loading && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            {/* Additional Info Maps/Support */}
            <section className="max-w-7xl mx-auto px-6 pt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { icon: <MessageSquare className="text-red-600" />, title: language === 'hi' ? 'लाइव चैट' : 'Live Chat', desc: 'Saturdays & Sundays are closed', action: 'Start Chat' },
                    { icon: <Globe className="text-red-600" />, title: language === 'hi' ? 'ग्लोबल सपोर्ट' : 'Global Support', desc: 'Available in 15+ countries', action: 'View Locations' },
                    { icon: <Clock className="text-red-600" />, title: language === 'hi' ? 'कार्य समय' : 'Working Hours', desc: 'Mon-Fri: 9:00 AM - 6:00 PM', action: 'Schedule Call' }
                ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-white/5 p-12 rounded-[2.5rem] border border-slate-100 dark:border-white/5 text-center space-y-6 group hover:border-red-600/20 transition-all">
                        <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                            {item.icon}
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white font-serif">{item.title}</h4>
                            <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <button className="text-red-600 font-bold text-xs uppercase tracking-widest border-b-2 border-red-600/10 hover:border-red-600 pb-1 transition-all">
                            {item.action}
                        </button>
                    </div>
                ))}
            </section>
            {/* Success Overlay */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            className="bg-white dark:bg-slate-900 p-12 rounded-[3rem] text-center space-y-6 shadow-2xl border border-white/10"
                        >
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="text-green-600" size={48} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black font-serif italic text-slate-900 dark:text-white">
                                    {language === 'hi' ? 'संदेश भेजा गया!' : 'Message Sent!'}
                                </h3>
                                <p className="text-slate-500 font-medium">
                                    {language === 'hi' ? 'जल्द ही हमारी टीम आपसे संपर्क करेगी।' : 'Our team will get back to you shortly.'}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactPage;
