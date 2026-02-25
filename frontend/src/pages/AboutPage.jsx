import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Users, Award, Shield, CheckCircle2, Heart, Globe, Zap, BookOpen, TrendingUp, Trophy } from 'lucide-react';

const AboutPage = ({ language }) => {
    const stats = [
        { label: language === 'hi' ? 'सालों का अनुभव' : 'Years of Excellence', value: '15+', icon: <Award size={24} /> },
        { label: language === 'hi' ? 'मासिक पाठक' : 'Monthly Readers', value: '2M+', icon: <Users size={24} /> },
        { label: language === 'hi' ? 'पुरस्कार' : 'Awards Won', value: '25', icon: <Trophy size={24} /> },
        { label: language === 'hi' ? 'रिपोर्टर्स' : 'Global Reporters', value: '150+', icon: <Globe size={24} /> },
    ];

    const team = [
        {
            name: "Vikram Mehta",
            role: language === 'hi' ? "प्रधान संपादक" : "Editor in Chief",
            img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400",
            bio: language === 'hi' ? '20+ वर्षों का अनुभव' : '20+ years experience'
        },
        {
            name: "Ananya Sharma",
            role: language === 'hi' ? "वरिष्ठ पत्रकार" : "Senior Journalist",
            img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400",
            bio: language === 'hi' ? 'राष्ट्रीय पुरस्कार विजेता' : 'National Award Winner'
        },
        {
            name: "Rahul Singh",
            role: language === 'hi' ? "खेल संपादक" : "Sports Editor",
            img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
            bio: language === 'hi' ? 'पूर्व क्रिकेटर' : 'Former Cricketer'
        },
        {
            name: "Priya Das",
            role: language === 'hi' ? "राजनीति विश्लेषक" : "Political Analyst",
            img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400",
            bio: language === 'hi' ? 'राजनीति विज्ञान में पीएचडी' : 'PhD in Political Science'
        }
    ];

    const values = [
        {
            icon: <Shield size={32} />,
            title: language === 'hi' ? 'भरोसा और ईमानदारी' : 'Trust & Integrity',
            desc: language === 'hi' ? 'हम अपने पाठकों के भरोसे को सर्वोच्च प्राथमिकता देते हैं और हर खबर को पूरी ईमानदारी से प्रस्तुत करते हैं।' : 'We prioritize our readers\' trust above all and present every story with complete honesty and transparency.'
        },
        {
            icon: <Target size={32} />,
            title: language === 'hi' ? 'सटीकता और जांच' : 'Accuracy & Verification',
            desc: language === 'hi' ? 'प्रत्येक खबर को प्रकाशित करने से पहले हमारी टीम गहन शोध और सत्यापन करती है।' : 'Our team conducts thorough research and verification before publishing every story.'
        },
        {
            icon: <Users size={32} />,
            title: language === 'hi' ? 'समुदाय की आवाज' : 'Voice of Community',
            desc: language === 'hi' ? 'हम समाज के हर वर्ग की आवाज को मंच देते हैं और उनकी कहानियां सामने लाते हैं।' : 'We give voice to every section of society and bring their stories to the forefront.'
        },
        {
            icon: <Award size={32} />,
            title: language === 'hi' ? 'विश्वस्तरीय गुणवत्ता' : 'World-Class Quality',
            desc: language === 'hi' ? 'अंतरराष्ट्रीय पत्रकारिता मानकों का पालन करते हुए हम उच्चतम गुणवत्ता बनाए रखते हैं।' : 'We maintain the highest quality standards following international journalism practices.'
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#030712] transition-colors">
            {/* Hero Section - Enhanced */}
            <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover"
                        alt="Newsroom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-red-900/60"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.1),transparent)]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block bg-red-600/20 border border-red-600/30 backdrop-blur-sm text-red-400 font-black text-[10px] uppercase tracking-[0.4em] px-6 py-3 rounded-full"
                        >
                            {language === 'hi' ? 'मितान एक्सप्रेस के बारे में' : 'ABOUT MITAAN EXPRESS'}
                        </motion.span>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white font-serif tracking-tighter leading-[1.1]">
                            {language === 'hi' ? 'सच्चाई की' : 'The Voice of'} <br />
                            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                {language === 'hi' ? 'आवाज़' : 'Truth'}
                            </span>
                        </h1>

                        <p className="text-white/70 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                            {language === 'hi'
                                ? 'निष्पक्ष पत्रकारिता के माध्यम से समाज को सशक्त बनाना। 15+ वर्षों से भारत की सबसे विश्वसनीय न्यूज़ पोर्टल।'
                                : 'Empowering society through unbiased journalism. India\'s most trusted news portal for over 15 years.'}
                        </p>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                        <motion.div
                            className="w-1.5 h-1.5 bg-white rounded-full"
                            animate={{ y: [0, 12, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section - Enhanced */}
            <section className="max-w-7xl mx-auto px-6 -mt-24 relative z-20 mb-32">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl hover:shadow-2xl dark:shadow-red-900/10 border border-slate-100 dark:border-white/5 text-center space-y-4 transition-all duration-300"
                        >
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
                                {stat.icon}
                            </div>
                            <div className="text-5xl font-black bg-gradient-to-br from-red-600 to-red-700 bg-clip-text text-transparent font-serif">
                                {stat.value}
                            </div>
                            <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Section - Redesigned */}
            <section className="py-24 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="space-y-4">
                            <span className="text-red-600 font-black text-xs uppercase tracking-widest">
                                {language === 'hi' ? 'हमारा मिशन' : 'OUR MISSION'}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif leading-tight">
                                {language === 'hi' ? 'समाज को जागरूक और सशक्त बनाना' : 'Empowering Society Through Information'}
                            </h2>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                            {language === 'hi'
                                ? 'मितान एक्सप्रेस केवल एक न्यूज़ पोर्टल नहीं है - यह सच्चाई का एक मंच है। हम उन कहानियों को सामने लाते हैं जो अक्सर दब जाती हैं। हमारी समर्पित टीम दिन-रात काम करती है ताकि आप तक सबसे सटीक, तेज़ और निष्पक्ष खबरें पहुँचें।'
                                : 'Mitaan Express is not just a news portal - it is a platform for truth. We bring forward stories that are often suppressed. Our dedicated team works around the clock to ensure the most accurate, fast, and unbiased news reaches you.'}
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            {[
                                { icon: <Zap size={20} />, text: language === 'hi' ? 'तेज़ अपडेट्स' : 'Fast Updates' },
                                { icon: <Shield size={20} />, text: language === 'hi' ? 'सत्यापित खबरें' : 'Verified News' },
                                { icon: <Globe size={20} />, text: language === 'hi' ? 'वैश्विक कवरेज' : 'Global Coverage' },
                                { icon: <BookOpen size={20} />, text: language === 'hi' ? 'गहन विश्लेषण' : 'In-depth Analysis' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                    <div className="text-red-600">{item.icon}</div>
                                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800"
                                className="w-full h-full object-cover"
                                alt="Our Culture"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-6 left-0 sm:-bottom-8 sm:-left-8 bg-gradient-to-br from-red-600 to-red-700 text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl"
                        >
                            <Heart size={40} className="mb-3" />
                            <div className="text-4xl font-black font-serif">15+</div>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-90">
                                {language === 'hi' ? 'वर्षों की विरासत' : 'Years Legacy'}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Values Section - New Design */}
            <section className="py-24 bg-slate-50 dark:bg-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <span className="text-red-600 font-black text-xs uppercase tracking-widest">
                            {language === 'hi' ? 'हमारे मूल्य' : 'OUR VALUES'}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-serif">
                            {language === 'hi' ? 'जो हमें अलग बनाता है' : 'What Sets Us Apart'}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {values.map((value, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-white dark:bg-gray-900 p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-red-200 dark:hover:border-red-900/30 transition-all duration-300 hover:shadow-xl"
                            >
                                <div className="flex gap-6">
                                    <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                        {value.icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white">{value.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section - Enhanced */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-20">
                        <span className="text-red-600 font-black text-xs uppercase tracking-widest">
                            {language === 'hi' ? 'हमारी टीम' : 'OUR TEAM'}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white font-serif tracking-tighter">
                            {language === 'hi' ? 'संपादकीय बोर्ड' : 'Editorial Board'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                            {language === 'hi' ? 'अनुभवी और समर्पित पत्रकारों की टीम' : 'A team of experienced and dedicated journalists'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="group"
                            >
                                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-xl">
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Bio on hover */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-sm font-bold">{member.bio}</p>
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <h4 className="text-xl font-black text-slate-900 dark:text-white font-serif">{member.name}</h4>
                                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Redesigned */}
            <section className="py-24 max-w-5xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-[3rem] p-16 md:p-24 overflow-hidden"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative z-10 text-center space-y-8">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white font-serif tracking-tighter leading-tight">
                            {language === 'hi' ? 'सत्य के साथ' : 'Join Us in'} <br />
                            {language === 'hi' ? 'खड़े रहें' : 'Standing with Truth'}
                        </h2>

                        <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                            {language === 'hi'
                                ? 'हमारे मिशन का हिस्सा बनें और समाज में सकारात्मक बदलाव लाने में योगदान दें।'
                                : 'Be part of our mission and contribute to bringing positive change in society.'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                            <Link
                                to="/contact"
                                className="bg-white text-red-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 hover:shadow-2xl transition-all inline-block"
                            >
                                {language === 'hi' ? 'हमसे जुड़ें' : 'Join Our Mission'}
                            </Link>
                            <Link
                                to="/blogs"
                                className="border-2 border-white text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-red-600 transition-all inline-block"
                            >
                                {language === 'hi' ? 'और जानें' : 'Learn More'}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default AboutPage;
