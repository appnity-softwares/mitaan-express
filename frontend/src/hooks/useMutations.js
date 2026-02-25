import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
    createArticle,
    updateArticle,
    deleteArticle,
    createBlog,
    updateBlog,
    deleteBlog,
    updateSettings,
    API_URL,
} from '../services/api';

/**
 * Get auth token from localStorage
 */
const getToken = () => localStorage.getItem('token');


// ============================================
// ARTICLE MUTATIONS
// ============================================

/**
 * Create new article
 */
export const useCreateArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return createArticle(token, formData);
        },
        onSuccess: () => {
            // Invalidate articles cache to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
        },
    });
};

/**
 * Update existing article
 */
export const useUpdateArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, formData }) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return updateArticle(token, id, formData);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.detail(variables.id) });
        },
    });
};

/**
 * Delete article
 */
export const useDeleteArticle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return deleteArticle(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'articles'] });
        },
    });
};


// ============================================
// BLOG MUTATIONS
// ============================================

/**
 * Create new blog
 */
export const useCreateBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return createBlog(token, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
        },
    });
};

/**
 * Update existing blog
 */
export const useUpdateBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, formData }) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return updateBlog(token, id, formData);
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs.detail(variables.id) });
        },
    });
};

/**
 * Delete blog
 */
export const useDeleteBlog = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return deleteBlog(token, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.blogs.all });
            queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });
        },
    });
};


// ============================================
// SETTINGS MUTATIONS
// ============================================

/**
 * Update site settings
 */
export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (settings) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            return updateSettings(token, settings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings });
        },
    });
};


// ============================================
// COMMENT MUTATIONS
// ============================================

/**
 * Approve/Reject comment
 */
export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status, rejectionReason }) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            const response = await fetch(`${API_URL}/comments/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, rejectionReason }),
            });
            if (!response.ok) throw new Error('Failed to update comment');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments });
        },
    });
};

/**
 * Delete comment
 */
export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const token = getToken();
            if (!token) throw new Error('No auth token');
            const response = await fetch(`${API_URL}/comments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete comment');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments });
        },
    });
};

/**
 * Create new comment (Public - no auth required)
 */
export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (commentData) => {
            const token = getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`${API_URL}/comments`, {
                method: 'POST',
                headers,
                body: JSON.stringify(commentData),
            });
            if (!response.ok) throw new Error('Failed to post comment');
            return response.json();
        },
        onSuccess: (data, variables) => {
            // Invalidate public comments for this article/blog
            queryClient.invalidateQueries({
                queryKey: ['public', 'comments', {
                    articleId: variables.articleId,
                    blogId: variables.blogId
                }]
            });
            // Also invalidate admin comments list
            queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments });
        },
    });
};
