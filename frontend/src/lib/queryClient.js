import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Configuration
 * - staleTime: Data considered fresh for 5 minutes (no refetch)
 * - gcTime: Keep unused data in cache for 30 minutes
 * - refetchOnWindowFocus: Disabled for news site (user controls refresh)
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 0,                   // Data considered stale immediately for reliability
            gcTime: 30 * 60 * 1000,        // 30 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,    // Refresh when user returns to tab
            retry: 1,
            refetchOnMount: true,          // Important: Refetch on component mount to ensure fresh data
        },
    },
});

/**
 * Query Keys - Consistent structure for cache management
 */
export const queryKeys = {
    // Public
    articles: {
        all: ['articles'],
        list: (filters) => ['articles', 'list', filters],
        detail: (idOrSlug) => ['articles', 'detail', idOrSlug],
    },
    categories: {
        all: ['categories'],
    },
    blogs: {
        all: ['blogs'],
        list: (filters) => ['blogs', 'list', filters],
        detail: (idOrSlug) => ['blogs', 'detail', idOrSlug],
    },
    settings: ['settings'],

    // Admin (requires auth)
    admin: {
        stats: ['admin', 'stats'],
        users: ['admin', 'users'],
        comments: ['admin', 'comments'],
        analytics: ['admin', 'analytics'],
        activityLogs: (page) => ['admin', 'activity', page],
    },
};
