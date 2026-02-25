import { useState, useEffect, useRef } from 'react';

/**
 * Hook to detect if an element is shorter than the viewport height.
 * Useful for intelligent sticky behaviors.
 */
export const useIsShort = (offset = 120) => {
    const [isShort, setIsShort] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const checkHeight = () => {
            if (elementRef.current) {
                const elementHeight = elementRef.current.offsetHeight;
                const viewportHeight = window.innerHeight;
                // isShort if element + offset is less than viewport
                setIsShort(elementHeight + offset < viewportHeight);
            }
        };

        // Initial check
        checkHeight();

        // Listen for window resize
        window.addEventListener('resize', checkHeight);

        // Optional: ResizeObserver for content changes
        const resizeObserver = new ResizeObserver(checkHeight);
        if (elementRef.current) {
            resizeObserver.observe(elementRef.current);
        }

        return () => {
            window.removeEventListener('resize', checkHeight);
            resizeObserver.disconnect();
        };
    }, [offset]);

    return [elementRef, isShort];
};

export default useIsShort;
