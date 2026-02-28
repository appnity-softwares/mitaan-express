import React, { createContext, useContext, useMemo } from 'react';
import { useArticles as useArticlesQuery, useCategories as useCategoriesQuery } from '../hooks/useQueries';

const ArticlesContext = createContext();

export const useArticles = () => {
    const context = useContext(ArticlesContext);
    if (!context) {
        throw new Error('useArticles must be used within ArticlesProvider');
    }
    return context;
};

export const ArticlesProvider = ({ children, language }) => {
    // TanStack Query Hooks (renamed to avoid collision)
    const {
        data: articles = [],
        isLoading: articlesLoading,
        error: articlesError,
        refetch: refetchArticles
    } = useArticlesQuery(); // Fetch all articles, no language filter

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useCategoriesQuery();

    const loading = articlesLoading || categoriesLoading;
    const error = articlesError || categoriesError;

    // Derived data - memoized for performance
    const { featured, trending, breaking, videos, published } = useMemo(() => {
        const publishedBase = articles.filter(a => a.status === 'PUBLISHED' && (!a.language || a.language === language || a.language === 'both'));
        return {
            published: publishedBase,
            featured: publishedBase.filter(a => a.isFeatured),
            trending: publishedBase.filter(a => a.isTrending),
            breaking: publishedBase.filter(a => a.isBreaking),
            videos: publishedBase.filter(a => a.videoUrl),
        };
    }, [articles]);

    const refetch = () => {
        refetchArticles();
        refetchCategories();
    };

    return (
        <ArticlesContext.Provider value={{
            articles,
            categories,
            featured,
            trending,
            breaking,
            videos,
            published,
            loading,
            error,
            refetch
        }}>
            {children}
        </ArticlesContext.Provider>
    );
};

export default ArticlesContext;
