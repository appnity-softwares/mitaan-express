import React from 'react';
import { motion } from 'framer-motion';

const AdBanner = ({ imageUrl, linkUrl, enabled = true, className = '' }) => {
    if (!enabled || !imageUrl) return null;

    const handleClick = (e) => {
        if (linkUrl) {
            window.open(linkUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 ${className}`}
        >
            <div
                onClick={handleClick}
                className={`relative w-full h-full flex items-center justify-center ${linkUrl ? 'cursor-pointer' : ''} group`}
                role={linkUrl ? 'link' : 'img'}
                tabIndex={linkUrl ? 0 : -1}
            >
                <img
                    src={imageUrl}
                    alt="Advertisement"
                    className="w-full h-full max-h-[inherit] object-contain transition-all duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                />
                {linkUrl && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                )}
            </div>
        </motion.div>
    );
};

export default AdBanner;
