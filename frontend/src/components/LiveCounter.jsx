import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Removed socket logic as we are simulating data now
// const socket = io('http://localhost:3000', ...);

const LiveCounter = () => {
    // Initialize with the requested minimum of 273
    const [count, setCount] = useState(273);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => {
                // Ensure count only increases (0 to +3)
                const change = Math.floor(Math.random() * 4);
                return prevCount + change;
            });
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full shadow-md">
            <span className="relative flex h-2 w-2">
                <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                ></motion.span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                {count} Live
            </span>
        </div>
    );
};

export default LiveCounter;
