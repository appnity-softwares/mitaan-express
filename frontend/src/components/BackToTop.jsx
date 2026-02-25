import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button when page is scrolled down more than 400px
            if (window.pageYOffset > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={scrollToTop}
                    className="fixed bottom-12 right-6 lg:bottom-16 lg:right-10 z-[90] w-12 h-12 lg:w-14 lg:h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-600/30 focus:outline-none focus:ring-4 focus:ring-red-600/20"
                    aria-label="Back to top"
                >
                    <ArrowUp size={24} strokeWidth={3} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default BackToTop;
