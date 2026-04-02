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
                <div
                    className={`mitaan-branding transition-all flex items-center justify-center text-center whitespace-nowrap ${isNavbarSolid ? '!text-white' : 'text-red-600'}`}
                    style={{
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        fontSize: language === 'hi'
                            ? 'clamp(26px, 6vw, 2.75rem)'
                            : 'clamp(20px, 5vw, 2.25rem)',
                    }}
                >
                    <span className="flex items-center gap-[0.25em]">
                        <span>{word1}</span>
                        {word2 && <span>{word2}</span>}
                    </span>
                </div>
            </button>
        </div>
    );
};

export default NavbarLogo;
