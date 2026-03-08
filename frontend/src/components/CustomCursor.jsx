import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const [isHovering, setIsHovering] = useState(false);
    const [clickEffect, setClickEffect] = useState(false);

    const springConfig = { damping: 40, stiffness: 600 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleHover = (e) => {
            const isClickable = e.target.closest('button, a, .cursor-pointer, input, select');
            setIsHovering(!!isClickable);
        };

        const handleMouseDown = () => setClickEffect(true);
        const handleMouseUp = () => setClickEffect(false);

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseover', handleHover);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseover', handleHover);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [cursorX, cursorY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[999999]">
            {/* Outer Ring */}
            <motion.div
                className="absolute top-0 left-0 w-12 h-12 border-2 border-violet-400/60 rounded-full flex items-center justify-center p-2"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: '-50%',
                    y: '-50%',
                    scale: isHovering ? 1.4 : (clickEffect ? 0.8 : 1),
                    backgroundColor: isHovering ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
                }}
            />
            {/* Inner Dot */}
            <motion.div
                className="absolute top-0 left-0 w-2.5 h-2.5 bg-white shadow-[0_0_10px_rgba(139,92,246,1)] rounded-full"
                style={{
                    translateX: cursorX,
                    translateY: cursorY,
                    x: '-50%',
                    y: '-50%',
                    scale: clickEffect ? 1.5 : 1,
                    opacity: 1,
                }}
            />
            {/* Glow effect */}
            <motion.div
                className="absolute top-0 left-0 w-20 h-20 bg-violet-600/20 rounded-full blur-2xl"
                style={{
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: '-50%',
                    y: '-50%',
                }}
            />
        </div>
    );
};

export default CustomCursor;
