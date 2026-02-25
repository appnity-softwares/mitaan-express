import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, Save, Share2, ShieldCheck, Cookie } from 'lucide-react';
import legalHero from '../assets/legal-hero.jpg';

const PrivacyPage = ({ language }) => {
    const lastUpdated = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const Section = ({ icon: Icon, title, children }) => (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-white/5 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    <Icon className="text-red-600" size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                    {title}
                </h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-4">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a]">
            {/* Hero Section */}
            <div className="relative h-[400px] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${legalHero})` }}
                >
                    <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
                </div>

                <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center pt-20">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs uppercase tracking-widest mb-6"
                    >
                        {language === 'hi' ? 'गोपनीयता' : 'Privacy'}
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        {language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
                    </h1>
                    <p className="text-slate-300 font-medium text-lg">
                        {language === 'hi' ? `अंतिम अपडेट: ${lastUpdated}` : `Last Updated: ${lastUpdated}`}
                    </p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto px-4 py-16 -mt-10 relative z-10"
            >

                <div className="space-y-6">
                    <Section icon={ShieldCheck} title={language === 'hi' ? 'हमारा प्रतिबद्धता' : 'Our Commitment'}>
                        <p>
                            {language === 'hi'
                                ? 'मिटान एक्सप्रेस आपकी गोपनीयता का सम्मान करता है। हम आपके द्वारा साझा की गई किसी भी जानकारी की सुरक्षा के लिए प्रतिबद्ध हैं। यह नीति बताती है कि हम डेटा कैसे एकत्र और उपयोग करते हैं।'
                                : 'Mitaan Express respects your privacy. We are committed to protecting any personal information you share with us. This policy explains how we collect, use, and safeguard your data.'}
                        </p>
                    </Section>

                    <Section icon={Save} title={language === 'hi' ? 'हम क्या जानकारी एकत्र करते हैं' : 'Information We Collect'}>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>{language === 'hi' ? 'व्यक्तिगत जानकारी:' : 'Personal Information:'}</strong> {language === 'hi' ? 'जब आप न्यूज़लेटर के लिए साइन अप करते हैं या संपर्क करते हैं (जैसे नाम, ईमेल)।' : 'When you subscribe to newsletters or contact us (e.g., Name, Email).'}
                            </li>
                            <li>
                                <strong>{language === 'hi' ? 'डिवाइस जानकारी:' : 'Device Information:'}</strong> {language === 'hi' ? 'आईपी पता, ब्राउज़र प्रकार, और आप हमारी साइट पर कैसे नेविगेट करते हैं।' : 'IP address, browser type, and navigation patterns on our site.'}
                            </li>
                        </ul>
                    </Section>

                    <Section icon={Eye} title={language === 'hi' ? 'हम आपकी जानकारी का उपयोग कैसे करते हैं' : 'How We Use Your Information'}>
                        <p>
                            {language === 'hi' ? 'हम डेटा का उपयोग निम्नलिखित के लिए करते हैं:' : 'We use the collected data to:'}
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>{language === 'hi' ? 'खबरों और सामग्री को आपके अनुसार ढालने के लिए।' : 'Personalize news content and recommendations.'}</li>
                            <li>{language === 'hi' ? 'हमारी वेबसाइट की सुधार और विश्लेषण के लिए।' : 'Analyze traffic to improve website performance.'}</li>
                            <li>{language === 'hi' ? 'आपको महत्वपूर्ण अपडेट या न्यूज़लेटर भेजने के लिए।' : 'Send important updates or newsletters (only if subscribed).'}</li>
                        </ul>
                    </Section>

                    <Section icon={Cookie} title={language === 'hi' ? 'कुकीज़ (Cookies)' : 'Cookies Policy'}>
                        <p>
                            {language === 'hi'
                                ? 'हम आपके अनुभव को बेहतर बनाने के लिए कुकीज़ का उपयोग करते हैं। कुकीज़ छोटी फाइलें होती हैं जो आपके डिवाइस पर सेव होती हैं। हम इनका उपयोग विज्ञापन और साइट एनालिटिक्स के लिए करते हैं।'
                                : 'We use cookies to enhance your browsing experience. Cookies are small files stored on your device. We use them for analytics and serving relevant advertisements (e.g., via Google AdSense).'}
                        </p>
                    </Section>

                    <Section icon={Share2} title={language === 'hi' ? 'थर्ड पार्टी शेयरिंग' : 'Third-Party Sharing'}>
                        <p>
                            {language === 'hi'
                                ? 'हम आपका व्यक्तिगत डेटा किसी को नहीं बेचते। हालांकि, हम एनालिटिक्स (जैसे Google Analytics) और विज्ञापनों के लिए विश्वसनीय थर्ड-पार्टी सेवाओं का उपयोग कर सकते हैं।'
                                : 'We do not sell your personal data. We may share anonymized data with trusted third-party services for analytics (e.g., Google Analytics) and advertising purposes.'}
                        </p>
                    </Section>

                    <Section icon={Lock} title={language === 'hi' ? 'डेटा सुरक्षा' : 'Data Security'}>
                        <p>
                            {language === 'hi'
                                ? 'हमने आपके डेटा को सुरक्षित रखने के लिए उचित सुरक्षा उपाय लागू किए हैं ताकि अनधिकृत पहुंच को रोका जा सके।'
                                : 'We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.'}
                        </p>
                    </Section>

                    <div className="mt-8 text-center text-slate-500 text-sm">
                        <p>
                            {language === 'hi'
                                ? 'गोपनीयता संबंधी प्रश्नों के लिए संपर्क करें: '
                                : 'For privacy concerns, please contact: '}
                            <a href="mailto:privacy@mitaanexpress.in" className="text-red-600 hover:underline">privacy@mitaanexpress.in</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PrivacyPage;
