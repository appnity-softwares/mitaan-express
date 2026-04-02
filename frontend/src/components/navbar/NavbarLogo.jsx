import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarLogo = ({ language, isNavbarSolid, siteTitle, siteTitleHi }) => {
    const navigate = useNavigate();

    const titleEn = siteTitle || 'Mitaan Express';
    const titleHi = siteTitleHi || 'मितान एक्सप्रेस';
    const activeTitle = language === 'hi' ? titleHi : titleEn;
    const [word1, ...rest] = activeTitle.split(' ');
    const word2 = rest.join(' ');

    return (
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center z-10 pointer-events-none">
            <button onClick={() => navigate('/')} className="pointer-events-auto">
                <h1
                    className={`mitaan-branding transition-all drop-shadow-xl flex flex-col items-center text-center whitespace-nowrap ${isNavbarSolid ? '!text-white' : 'text-red-600'}`}
                    style={{
                        textShadow: isNavbarSolid ? 'none' : '0 1px 2px rgba(255,255,255,0.8)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        /* Mobile: 20px min, grows with viewport, max 36px on desktop */
                        fontSize: 'clamp(20px, 5vw, 2.25rem)',
                    }}
                >
                    {/* On mobile: render as a single line. On sm+: if 2 words, space them inline */}
                    <span className="flex items-center gap-[0.25em]">
                        <span>{word1}</span>
                        {word2 && <span>{word2}</span>}
                    </span>
                    <span className={`hidden lg:block text-[9px] font-black uppercase tracking-[0.4em] opacity-70 mt-0.5 ${isNavbarSolid ? 'text-white' : 'text-slate-500 dark:text-white/60'}`}>
                        {language === 'hi' ? 'निष्पक्ष समाचार' : 'UNBIASED NEWS'}
                    </span>
                </h1>
            </button>
        </div>
    );
};

export default NavbarLogo;
