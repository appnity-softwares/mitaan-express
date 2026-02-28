import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
    fetchArticles,
    fetchArticleBySlug,
    fetchCategories,
    fetchBlogs,
    fetchBlogBySlug,
    fetchStats,
    fetchSettings,
    fetchActivityLogs,
    API_URL,
} from '../services/api';

// ============================================
// PUBLIC QUERIES (No Auth Required)
// ============================================

/**
 * Fetch all articles with optional filters
 * @param {Object} filters - { category, search, author, lang, status }
 */
export const useArticles = (filters = {}) => {
    return useQuery({
        queryKey: queryKeys.articles.list(filters),
        queryFn: () => fetchArticles(
            filters.category,
            filters.search,
            filters.author,
            filters.lang,
            filters.status
        ),
    });
};

/**
 * Fetch all published articles (default for public pages)
 */
export const usePublishedArticles = () => {
    return useQuery({
        queryKey: queryKeys.articles.all,
        queryFn: () => fetchArticles('', '', '', '', 'PUBLISHED'),
    });
};

/**
 * Fetch single article by ID or slug
 */
export const useArticle = (idOrSlug) => {
    return useQuery({
        queryKey: queryKeys.articles.detail(idOrSlug),
        queryFn: () => fetchArticleBySlug(idOrSlug),
        enabled: !!idOrSlug,
    });
};

/**
 * Fetch all categories
 */
export const useCategories = () => {
    return useQuery({
        queryKey: queryKeys.categories.all,
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000, // Categories change less often - 10 min
    });
};

/**
 * Fetch all blogs with optional filters
 */
export const useBlogs = (filters = {}) => {
    return useQuery({
        queryKey: queryKeys.blogs.list(filters),
        queryFn: () => fetchBlogs(
            filters.search,
            filters.author,
            filters.lang,
            filters.status,
            filters.page || 1,
            filters.limit || 10
        ),
    });
};

/**
 * Fetch single blog by ID or slug
 */
export const useBlog = (idOrSlug) => {
    return useQuery({
        queryKey: queryKeys.blogs.detail(idOrSlug),
        queryFn: () => fetchBlogBySlug(idOrSlug),
        enabled: !!idOrSlug,
    });
};

/**
 * Fetch site settings
 */
export const useSettings = () => {
    return useQuery({
        queryKey: queryKeys.settings,
        queryFn: fetchSettings,
        staleTime: 0, // Always fetch fresh settings
        refetchOnWindowFocus: true,
    });
};


// ============================================
// ADMIN QUERIES (Auth Required)
// ============================================

/**
 * Get auth token from localStorage
 */
const getToken = () => localStorage.getItem('token');

/**
 * Fetch admin dashboard stats
 */
export const useAdminStats = () => {
    return useQuery({
        queryKey: queryKeys.admin.stats,
        queryFn: () => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return fetchStats(token);
        },
        enabled: !!getToken(),
        staleTime: 2 * 60 * 1000, // Stats should be more fresh - 2 min
    });
};

/**
 * Fetch admin articles (all statuses)
 */
export const useAdminArticles = (filters = {}) => {
    return useQuery({
        queryKey: ['admin', 'articles', filters],
        queryFn: () => fetchArticles(
            filters.category,
            filters.search,
            filters.author,
            filters.lang,
            filters.status
        ),
        staleTime: 0, // Admin needs fresh data immediately
    });
};

/**
 * Fetch admin blogs (all statuses)
 */
export const useAdminBlogs = (filters = {}) => {
    return useQuery({
        queryKey: ['admin', 'blogs', filters],
        queryFn: () => fetchBlogs(
            filters.search,
            filters.author,
            filters.lang,
            filters.status
        ),
        staleTime: 0, // Admin needs fresh data immediately
    });
};

/**
 * Fetch activity logs with pagination
 */
export const useActivityLogs = (page = 1) => {
    return useQuery({
        queryKey: queryKeys.admin.activityLogs(page),
        queryFn: () => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return fetchActivityLogs(token, page);
        },
        enabled: !!getToken(),
    });
};


// ============================================
// ADMIN API HOOKS (for pages that need custom fetch)
// ============================================

/**
 * Fetch users list
 */
export const useUsers = () => {
    return useQuery({
        queryKey: queryKeys.admin.users,
        queryFn: async () => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            const response = await fetch(`${API_URL}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch users');
            return response.json();
        },
        enabled: !!getToken(),
    });
};

/**
 * Fetch comments list with optional status filter (Admin)
 */
export const useAdminComments = (status = 'ALL') => {
    return useQuery({
        queryKey: [...queryKeys.admin.comments, status],
        queryFn: async () => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            const url = status === 'ALL'
                ? `${API_URL}/comments`
                : `${API_URL}/comments?status=${status}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch comments');
            return response.json();
        },
        enabled: !!getToken(),
    });
};

/**
 * Fetch comments for a specific article or blog (Public)
 */
export const usePublicComments = ({ articleId, blogId }) => {
    return useQuery({
        queryKey: ['public', 'comments', { articleId, blogId }],
        queryFn: async () => {
            const baseUrl = `${API_URL}/comments`;
            const url = articleId
                ? `${baseUrl}/article/${articleId}`
                : `${baseUrl}/blog/${blogId}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch comments');
            return response.json();
        },
        enabled: !!(articleId || blogId),
    });
};

/**
 * Fetch analytics data with period filter
 */
export const useAnalytics = (period = 'daily') => {
    return useQuery({
        queryKey: [...queryKeys.admin.analytics, period],
        queryFn: async () => {
            const token = getToken();
            console.log('Analytics: Token exists?', !!token);
            if (!token) throw new Error('No auth token');
            const url = `${API_URL}/analytics/dashboard?period=${period}`;
            console.log('Analytics: Fetching from', url);
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log('Analytics: Response status', response.status);
            if (!response.ok) {
                const error = await response.text();
                console.log('Analytics: Error response', error);
                throw new Error('Failed to fetch analytics');
            }
            const data = await response.json();
            console.log('Analytics: Data received', data);
            return data;
        },
        enabled: !!getToken(),
        staleTime: 5 * 60 * 1000,
    });
};
