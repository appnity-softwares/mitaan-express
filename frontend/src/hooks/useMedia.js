import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL as BASE_API_URL } from '../services/api';

const API_URL = `${BASE_API_URL}/media`;

// Fetch published media for frontend (public)
export const usePublicMedia = (type, category, page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['media', 'public', type, category, page, limit],
        queryFn: async () => {
            let url = API_URL;
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (category) params.append('category', category);
            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch media');
            return response.json();
        }
    });
};

// Fetch all media for admin
export const useAdminMedia = (type, category, page = 1, limit = 20) => {
    return useQuery({
        queryKey: ['media', 'admin', type, category, page, limit],
        queryFn: async () => {
            const token = localStorage.getItem('token');
            let url = `${API_URL}/admin`;
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (category) params.append('category', category);
            if (page) params.append('page', page);
            if (limit) params.append('limit', limit);
            if (params.toString()) url += `?${params.toString()}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch admin media');
            return response.json();
        }
    });
};

// Create media mutation
export const useCreateMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ payload, onProgress }) => {
            const token = localStorage.getItem('token');
            const isFormData = payload instanceof FormData;

            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', API_URL);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                if (!isFormData) {
                    xhr.setRequestHeader('Content-Type', 'application/json');
                }

                if (onProgress && xhr.upload) {
                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percentCompleted = Math.round((event.loaded * 100) / event.total);
                            onProgress(percentCompleted);
                        }
                    };
                }

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch (e) {
                            resolve(xhr.responseText);
                        }
                    } else {
                        reject(new Error(xhr.responseText || 'Failed to create media'));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(isFormData ? payload : JSON.stringify(payload));
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
        }
    });
};

// Update media mutation
export const useUpdateMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...data }) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update media');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
        }
    });
};

// Delete media mutation
export const useDeleteMedia = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete media');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['media'] });
        }
    });
};

// Increment views
export const useIncrementViews = () => {
    return useMutation({
        mutationFn: async (id) => {
            const response = await fetch(`${API_URL}/${id}/view`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to increment views');
            return response.json();
        }
    });
};
