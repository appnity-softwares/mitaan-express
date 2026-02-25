import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

const CursorTracker = () => {
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [cursorType, setCursorType] = useState('default');

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth springs for high-quality movement feel
    const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleHover = (e) => {
            const target = e.target;
            const isInteractive = !!target.closest('button, a, [role="button"], input, select, .snap-start');
            const isMedia = !!target.closest('img, .aspect-video, .group-hover\\:scale-105');

            if (isInteractive) {
                setCursorType('interactive');
                setIsHovering(true);
            } else if (isMedia) {
                setCursorType('media');
                setIsHovering(true);
            } else {
                setCursorType('default');
                setIsHovering(false);
            }
        };

        const handleMouseLeave = () => setIsVisible(false);
        const handleMouseEnter = () => setIsVisible(true);

        window.addEventListener('mousemove', moveMouse);
        window.addEventListener('mouseover', handleHover);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveMouse);
            window.removeEventListener('mouseover', handleHover);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [isVisible, mouseX, mouseY]);

    useEffect(() => {
        document.body.classList.add('custom-cursor-enabled');
        return () => document.body.classList.remove('custom-cursor-enabled');
    }, []);

    // Don't render on mobile (devices without fine pointers)
    if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        return null;
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
            <AnimatePresence>
                {isVisible && (
                    <>
                        {/* Outer Ring */}
                        <motion.div
                            style={{
                                translateX: cursorX,
                                translateY: cursorY,
                                left: -20,
                                top: -20,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: isHovering ? (cursorType === 'media' ? 2.5 : 1.5) : 1,
                                opacity: 1,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            className={`fixed w-10 h-10 border-2 rounded-full flex items-center justify-center transition-colors duration-300 ${cursorType === 'media'
                                ? 'border-[#f97316] bg-[#f97316]/10'
                                : cursorType === 'interactive'
                                    ? 'border-[#00adef]'
                                    : 'border-slate-400/30'
                                }`}
                        >
                            {cursorType === 'media' && (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-[8px] font-black text-[#f97316] uppercase tracking-tighter"
                                >
                                    VIEW
                                </motion.span>
                            )}
                        </motion.div>

                        {/* Inner Dot */}
                        <motion.div
                            style={{
                                translateX: mouseX,
                                translateY: mouseY,
                                left: -3,
                                top: -3,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: isHovering ? 0 : 1,
                                opacity: 1,
                            }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="fixed w-1.5 h-1.5 bg-[#f97316] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CursorTracker;
