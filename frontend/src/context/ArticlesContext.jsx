import React, { createContext, useContext, useMemo } from 'react';
import { useArticles as useArticlesQuery, useCategories as useCategoriesQuery, useBlogs as useBlogsQuery } from '../hooks/useQueries';

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
        data: blogsData = { blogs: [] },
        isLoading: blogsLoading,
        refetch: refetchBlogs
    } = useBlogsQuery({ limit: 100 });
    const blogs = blogsData.blogs || [];

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useCategoriesQuery();

    const loading = articlesLoading || categoriesLoading || blogsLoading;
    const error = articlesError || categoriesError;

    // Derived data - memoized for performance
    const { featured, trending, breaking, videos, published } = useMemo(() => {
        const publishedArticles = articles.filter(a => a.status === 'PUBLISHED' && (!a.language || a.language === language || a.language === 'both'))
            .map(a => ({ ...a, type: 'article' }));

        const publishedBlogs = blogs.filter(b => b.status === 'PUBLISHED' && (!b.language || b.language === language || b.language === 'both'))
            .map(b => ({ ...b, type: 'blog' }));

        const combined = [...publishedArticles, ...publishedBlogs];

        // ALGORITHM: Items with high views > 50 are also considered trending
        const VIEW_THRESHOLD = 50;

        return {
            published: combined,
            featured: combined.filter(item => item.isFeatured),
            trending: combined.filter(item => item.isTrending || (item.views > VIEW_THRESHOLD)),
            breaking: combined.filter(item => item.isBreaking),
            videos: publishedArticles.filter(a => a.videoUrl),
        };
    }, [articles, blogs, language]);

    const refetch = () => {
        refetchArticles();
        refetchCategories();
        refetchBlogs();
    };

    return (
        <ArticlesContext.Provider value={{
            articles,
            blogs,
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
