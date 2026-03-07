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
    // Memoize filters to provide stable references for React Query
    // This prevents infinite refetching loops caused by unstable object references
    const articlesFilters = useMemo(() => ({ status: 'PUBLISHED' }), []);
    const blogsFilters = useMemo(() => ({ limit: 100, status: 'PUBLISHED' }), []);

    // TanStack Query Hooks (renamed to avoid collision)
    const {
        data: articles = [],
        isLoading: articlesLoading,
        error: articlesError,
        refetch: refetchArticles
    } = useArticlesQuery(articlesFilters);

    const {
        data: blogsData = { blogs: [] },
        isLoading: blogsLoading,
        refetch: refetchBlogs
    } = useBlogsQuery(blogsFilters);
    const blogs = blogsData.blogs || [];

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        error: categoriesError,
        refetch: refetchCategories
    } = useCategoriesQuery();

    const { featured, trending, breaking, videos, published } = useMemo(() => {
        const publishedArticles = articles.filter(a => a.status === 'PUBLISHED' && (!a.language || a.language === language || a.language === 'both'))
            .map(a => ({ ...a, type: 'article' }));

        const publishedBlogs = blogs.filter(b => b.status === 'PUBLISHED' && (!b.language || b.language === language || b.language === 'both'))
            .map(b => ({ ...b, type: 'blog' }));

        const allContent = [...publishedArticles, ...publishedBlogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
            featured: allContent.filter(a => a.isFeatured).slice(0, 5),
            trending: allContent.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10),
            breaking: allContent.filter(a => a.isBreaking).slice(0, 5),
            videos: publishedArticles.filter(a => a.videoUrl).slice(0, 10),
            published: allContent
        };
    }, [articles, blogs, language]);

    const refetch = () => {
        refetchArticles();
        refetchCategories();
        refetchBlogs();
    };

    const value = {
        articles,
        blogs,
        categories,
        loading: articlesLoading || categoriesLoading || blogsLoading,
        error: articlesError || categoriesError,
        featured,
        trending,
        breaking,
        videos,
        published,
        refetch
    };

    return (
        <ArticlesContext.Provider value={value}>
            {children}
        </ArticlesContext.Provider>
    );
};
