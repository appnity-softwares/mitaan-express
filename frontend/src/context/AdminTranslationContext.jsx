import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminTranslations } from '../data/adminTranslations';

const AdminTranslationContext = createContext();

export const AdminTranslationProvider = ({ children }) => {
    // Default to English, but save preference
    const [adminLang, setAdminLang] = useState(() => localStorage.getItem('adminLang') || 'en');

    useEffect(() => {
        localStorage.setItem('adminLang', adminLang);
    }, [adminLang]);

    const toggleAdminLang = () => {
        setAdminLang(prev => prev === 'en' ? 'hi' : 'en');
    };

    const t = (key) => {
        const translation = adminTranslations[adminLang]?.[key];
        return translation || key; // Fallback to key if not found
    };

    return (
        <AdminTranslationContext.Provider value={{ adminLang, setAdminLang, toggleAdminLang, t }}>
            {children}
        </AdminTranslationContext.Provider>
    );
};

export const useAdminTranslation = () => {
    const context = useContext(AdminTranslationContext);
    if (!context) {
        throw new Error('useAdminTranslation must be used within an AdminTranslationProvider');
    }
    return context;
};
