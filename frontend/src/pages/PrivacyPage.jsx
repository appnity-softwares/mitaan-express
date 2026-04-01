import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, UserCheck, Share2, Eye, HelpCircle } from 'lucide-react';

const PrivacyPage = () => {
    const Section = ({ icon: Icon, title, children }) => (
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100 dark:border-white/5 transition-all hover:shadow-xl hover:border-red-600/10 mb-8">
            <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/10 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/20">
                    <Icon className="text-red-600" size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white font-serif tracking-tight">
                    {title}
                </h2>
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-6 text-sm md:text-base font-serif italic">
                {children}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#030712] transition-colors pb-32">
            {/* Hero Section */}
            <div className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <img 
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2000" 
                        className="w-full h-full object-cover opacity-20 grayscale"
                        alt="Security and Privacy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent"></div>
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-red-600 font-black text-[10px] uppercase tracking-[0.4em] block">GOVERNANCE & TRUST</span>
                        <h1 className="text-5xl md:text-8xl font-black text-white font-serif tracking-tighter leading-none">
                            Privacy <br /> <span className="text-red-600 italic">Protocols.</span>
                        </h1>
                        <p className="text-slate-400 font-serif italic text-lg max-w-2xl mx-auto">
                            How Mitaan Express protects your digital footprint and ensures absolute data integrity.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Document Content */}
            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-20 space-y-8">
                <Section icon={ShieldCheck} title="I. GENERAL">
                    <p>
                        Mitaan India Media Pvt. Ltd ("Mitaan Express", "we", "or", "us") recognizes the importance of protecting the privacy of your personal information that we collect from you through the Website and other plug-ins exchanging information with Mitaan Express ("Applications"); The Website and Applications are sometimes collectively referred to as "Services" for simplicity.
                    </p>
                    <p>
                        We have prepared this Privacy Policy to provide you with important information about our privacy practices. This Privacy Policy applies when you use a website, mobile or tablet application, or other online services that links or refers to it. This Privacy Policy is incorporated into our Terms of Service and therefore governs your use of the Online Services provided by Mitaan Express.
                    </p>
                    <p>
                        By using our Services, you accept the terms of this Privacy Policy. If you have questions or concerns about the Privacy Policy, please contact us at <a href="mailto:mitaanexpress@gmail.com" className="text-red-600 font-bold hover:underline">mitaanexpress@gmail.com</a>.
                    </p>
                </Section>

                <Section icon={UserCheck} title="II. INFORMATION WE COLLECT FROM USERS">
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Personal Information that you give to us</h3>
                        <p>
                            We may collect personal information about our users in various ways. For example, we may collect information that you provide to us, information that we collect from you through the use of the Services, and information that we collect from publicly available sources or third parties.
                        </p>
                        <p>
                            When you register on our website otherwise interact with the Services, you may be invited to provide personal information to enhance your experience on our site. For example, during account registration, we may ask for information such as your name, e-mail address, year of birth, gender, street address, job title and industry and related information. We may collect payment information, such as your credit card number and expiration date, where appropriate to process a financial transaction you have requested or participates in contests, promotions, surveys, forums, content submissions, requests for suggestions, or other aspects of services offered by Mitaan Express.
                        </p>
                    </div>

                    <div className="space-y-4 mt-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Information collected by other means</h3>
                        <p>
                            We use various internet technologies to manage our Services and track use of the Services. Non-personal information that we collect using these technologies may be combined with other information about you. This may include:
                        </p>
                        <ul className="space-y-4 list-none p-0">
                            <li className="flex gap-4">
                                <span className="text-red-600 font-bold whitespace-nowrap">DEVICE:</span>
                                <span>IP address, unique device identifiers, operating system version, browser type and settings, and other transactional information.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-red-600 font-bold whitespace-nowrap">COOKIES:</span>
                                <span>We use cookies to manage access to and use of the Services, recognize you and provide personalization. We may transmit non-personally identifiable website usage information to third parties in order to show you targeted advertising.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-red-600 font-bold whitespace-nowrap">LOCATION:</span>
                                <span>We may use your location information through the IP address or your mobile device's GPS signal to provide location-based results.</span>
                            </li>
                        </ul>
                    </div>
                </Section>

                <Section icon={Eye} title="III. USE OF COLLECTED INFORMATION">
                    <p>
                        We use the information we collect from the Online Services to communicate with you, process your orders, manage the services you request, deliver targeted advertising, to better understand our readers and users, and to protect the rights of the services and others.
                    </p>
                    <p>
                        We send promotional and emails and newsletters from time to time to users who have registered on the Website. You can opt-out of promotional communications by using the "Unsubscribe" link or by emailing us at <a href="mailto:mitaanexpress@gmail.com" className="text-red-600 font-bold hover:underline">mitaanexpress@gmail.com</a>.
                    </p>
                </Section>

                <Section icon={Share2} title="IV. SHARING OF CUSTOMER INFORMATION">
                    <p>
                        We may share your information with our affiliates, business partners, service providers, other parties when required by law or when it is necessary to protect our users and services. We may also share your information with the social media service that you may have used to login to our website.
                    </p>
                    <p>
                        We reserve the right to transfer any information we have about you in the event that we sell or transfer all or a portion of our business or assets to a third party, such as in the event of a merger, acquisition, or in connection with a bankruptcy reorganization.
                    </p>
                </Section>

                <Section icon={HelpCircle} title="V. ACCESSING YOUR INFORMATION">
                    <p>
                        Upon request, Mitaan Express will provide you with information about whether we hold any of your personal information. In certain circumstances, we may be required by law to retain your personal information or may need to retain your personal information in order to continue providing a service.
                    </p>
                    <p>
                        At the minimum, we will retain your information for as long as needed to provide you services, and as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                </Section>

                <Section icon={Lock} title="VI. PROTECTION OF INFORMATION">
                    <p>
                        We strive to make certain that our servers and connections incorporate the latest encryption and security devices. We have in place physical, electronic and managerial procedures to protect the information we collect online. However, no security system is impenetrable.
                    </p>
                    <p>
                        Accordingly, we disclaim liability for the theft, loss, or interception of, or unauthorized access or damage to, your data or communications. If you believe your privacy has been breached please contact us immediately at <a href="mailto:mitaanexpress@gmail.com" className="text-red-600 font-bold hover:underline">mitaanexpress@gmail.com</a>.
                    </p>
                </Section>

                <Section icon={ShieldCheck} title="VII. CHANGES TO THIS POLICY">
                    <p>
                        We may modify this Privacy Policy from time to time. We will notify you of changes by posting changes here, or by other appropriate means. Any changes to the Privacy Policy will become effective when the updated policy is posted on the Services.
                    </p>
                </Section>

                <div className="pt-12 text-center space-y-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-600/10 rounded-full border border-red-600/20">
                        <Mail className="text-red-600" size={16} />
                        <span className="text-xs font-black text-red-600 uppercase tracking-widest leading-none">
                            Questions? mitaanexpress@gmail.com
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
