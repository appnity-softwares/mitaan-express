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
            className={`w-full overflow-hidden ${className}`}
        >
            <div
                onClick={handleClick}
                className={`relative w-full ${linkUrl ? 'cursor-pointer' : ''} group`}
                role={linkUrl ? 'link' : 'img'}
                tabIndex={linkUrl ? 0 : -1}
            >
                <img
                    src={imageUrl}
                    alt="Advertisement"
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.02]"
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
