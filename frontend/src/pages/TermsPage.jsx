import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, Scale, Copyright, Users, Globe } from 'lucide-react';
import legalHero from '../assets/legal-hero.jpg';

const TermsPage = ({ language }) => {
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
                        {language === 'hi' ? 'कानूनी दस्तावेज' : 'Legal Document'}
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        {language === 'hi' ? 'उपयोग की शर्तें' : 'Terms of Use'}
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
                {/* Content */}
                <div className="space-y-6">
                    <Section icon={Globe} title={language === 'hi' ? 'परिचय' : 'Introduction'}>
                        <p>
                            {language === 'hi'
                                ? 'मिटान एक्सप्रेस ("हम", "हमारा") में आपका स्वागत है। हमारी वेबसाइट का उपयोग करके, आप इन नियमों और शर्तों का पालन करने के लिए सहमत हैं। यदि आप सहमत नहीं हैं, तो कृपया हमारे पोर्टल का उपयोग न करें।'
                                : 'Welcome to Mitaan Express ("we," "our," "us"). By accessing or using our news portal, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use our services.'}
                        </p>
                    </Section>

                    <Section icon={Copyright} title={language === 'hi' ? 'बौद्धिक संपदा' : 'Intellectual Property Rights'}>
                        <p>
                            {language === 'hi'
                                ? 'इस साइट पर मौजूद सभी सामग्री (समाचार लेख, तस्वीरें, वीडियो, ग्राफिक्स, लोगो) मिटान एक्सप्रेस की संपत्ति है। कॉपीराइट कानूनों द्वारा इसकी रक्षा की जाती है।'
                                : 'All content on this site, including news articles, photographs, videos, graphics, and logos, is the property of Mitaan Express and is protected by copyright laws.'}
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                                {language === 'hi'
                                    ? 'आप केवल व्यक्तिगत, गैर-व्यावसायिक उपयोग के लिए सामग्री देख सकते हैं।'
                                    : 'You may access content solely for personal, non-commercial use.'}
                            </li>
                            <li>
                                {language === 'hi'
                                    ? 'हमारी लिखित अनुमति के बिना किसी भी सामग्री का पुनर्प्रकाशन या वितरण सख्त वर्जित है।'
                                    : 'Reproduction or redistribution of any content without our written permission is strictly prohibited.'}
                            </li>
                        </ul>
                    </Section>

                    <Section icon={Users} title={language === 'hi' ? 'उपयोगकर्ता आचरण' : 'User Conduct'}>
                        <p>
                            {language === 'hi'
                                ? 'जब आप हमारे प्लेटफॉर्म पर बातचीत करते हैं (जैसे टिप्पणियां), तो आप सहमत हैं कि आप:'
                                : 'When interacting with our platform (e.g., comments), you agree NOT to:'}
                        </p>
                        <ul className="list-disc pl-5 space-y-2 mt-2">
                            <li>
                                {language === 'hi' ? 'अभद्र, अपमानजनक या नफरत फैलाने वाली भाषा का प्रयोग नहीं करेंगे।' : 'Post abusive, defamatory, or hate speech.'}
                            </li>
                            <li>
                                {language === 'hi' ? 'फर्जी खबरें या भ्रामक जानकारी नहीं फैलाएंगे।' : 'Spread fake news or misleading information.'}
                            </li>
                            <li>
                                {language === 'hi' ? 'किसी की गोपनीयता का उल्लंघन नहीं करेंगे।' : 'Violate anyone\'s privacy rights.'}
                            </li>
                        </ul>
                    </Section>

                    <Section icon={AlertCircle} title={language === 'hi' ? 'सटीकता और अस्वीकरण' : 'Accuracy & Disclaimer'}>
                        <p>
                            {language === 'hi'
                                ? 'हम सटीक और ताज़ा खबरें प्रदान करने का प्रयास करते हैं। हालांकि, हम जानकारी की पूर्णता या सटीकता की गारंटी नहीं देते हैं। विचार लेखकों के अपने हैं।'
                                : 'We strive to provide accurate and up-to-date news. However, Mitaan Express does not guarantee the completeness or accuracy of any information. Opinions expressed in opinion pieces are those of the authors.'}
                        </p>
                    </Section>

                    <Section icon={Scale} title={language === 'hi' ? 'कानूनी क्षेत्राधिकार' : 'Governing Law'}>
                        <p>
                            {language === 'hi'
                                ? 'ये शर्तें भारतीय कानूनों के तहत शासित होंगी और किसी भी विवाद के लिए न्यायक्षेत्र नई दिल्ली, भारत होगा।'
                                : 'These terms shall be governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.'}
                        </p>
                    </Section>

                    <div className="mt-8 text-center text-slate-500 text-sm">
                        <p>
                            {language === 'hi'
                                ? 'यदि आपके कोई प्रश्न हैं, तो संपर्क करें: '
                                : 'If you have any questions, please contact us at: '}
                            <a href="mailto:contact@mitaanexpress.in" className="text-red-600 hover:underline">contact@mitaanexpress.in</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default TermsPage;
