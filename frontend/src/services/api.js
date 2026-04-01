export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = API_URL.replace('/api', '');
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1585829365294-bb8c6f045b88?auto=format&fit=crop&q=80&w=800';

/**
 * Helper to handle API responses, parse JSON safely, and extract errors
 * @param {Response} response - Fetch API Response object
 */
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        const errorMsg = (data && data.error) || (typeof data === 'string' && data && !data.includes('<!DOCTYPE')) ? data : null;
        throw new Error(errorMsg || `Error ${response.status}: ${response.statusText}`);
    }

    return data;
};

/**
 * Formats image URLs to handle local assets, R2 URLs, and base64
 * @param {string} url - The image URL or path
 * @returns {string} - Formatted URL
 */
export const formatImageUrl = (url) => {
    if (!url) return PLACEHOLDER_IMAGE;
    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Clean up path and join with SOCKET_URL
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;
    return `${SOCKET_URL}/${cleanPath}`;
};

export const fetchCategories = async () => {
    try {
        const response = await fetch(`${API_URL}/categories`);
        if (!response.ok) throw new Error('Failed to fetch categories');
        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const fetchArticles = async (category = '', search = '', author = '', lang = '', status = '') => {
    try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        if (author) params.append('author', author);
        if (lang) params.append('lang', lang);
        if (status) params.append('status', status);

        const url = `${API_URL}/articles?${params.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch articles');
        return await response.json();
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
};

export const fetchArticleBySlug = async (slug) => {
    try {
        const response = await fetch(`${API_URL}/articles/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch article');
        return await response.json();
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
};

export const loginUser = async (email, password, rememberMe) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, rememberMe }),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const registerUser = async (email, password, name) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }
        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const fetchStats = async (token) => {
    try {
        const response = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Stats error:', error);
        return null;
    }
};

export const createArticle = async (token, formData) => {
    try {
        const response = await fetch(`${API_URL}/articles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const updateArticle = async (token, id, formData) => {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const deleteArticle = async (token, id) => {
    try {
        const response = await fetch(`${API_URL}/articles/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        await handleResponse(response);
        return true;
    } catch (error) {
        throw error;
    }
}


export const fetchBlogs = async (search = '', author = '', lang = '', status = '', page = 1, limit = 10) => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (author) params.append('author', author);
        if (lang) params.append('lang', lang);
        if (status) params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        const url = `${API_URL}/blogs?${params.toString()}`;
        const response = await fetch(url);
        return await handleResponse(response);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return { blogs: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } };
    }
};

export const fetchBlogBySlug = async (slug) => { // Added for editing
    try {
        const response = await fetch(`${API_URL}/blogs/${slug}`);
        return await handleResponse(response);
    } catch (error) {
        return null;
    }
};


export const createBlog = async (token, formData) => {
    try {
        const response = await fetch(`${API_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const updateBlog = async (token, id, formData) => {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`, { // Using ID now
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData),
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const deleteBlog = async (token, id) => {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete blog');
        return true;
    } catch (error) {
        throw error;
    }
};

export const fetchSettings = async () => {
    try {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return await response.json();
    } catch (error) {
        console.error('Settings error:', error);
        return {};
    }
};

export const updateSettings = async (token, settings) => {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(settings),
        });
        return await handleResponse(response);
    } catch (error) {
        throw error;
    }
};

export const fetchActivityLogs = async (token, page = 1) => {
    try {
        const response = await fetch(`${API_URL}/activity?page=${page}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch activity logs');
        return await response.json();
    } catch (error) {
        console.error('Activity logs error:', error);
        return { logs: [], pagination: {} };
    }
};

// Contact API
export const createContact = async (formData) => {
    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to submit contact');
        }
        return await response.json();
    } catch (error) {
        console.error('Create contact error:', error);
        throw error;
    }
};

export const fetchContacts = async (token) => {
    try {
        const response = await fetch(`${API_URL}/contacts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch contacts');
        return await response.json();
    } catch (error) {
        console.error('Fetch contacts error:', error);
        return [];
    }
};

export const toggleContactRead = async (id, token) => {
    const response = await fetch(`${API_URL}/contacts/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to update contact');
    return await response.json();
};

export const deleteContact = async (id, token) => {
    const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete contact');
    return true;
};

// Global Search
export const globalSearch = async (query) => {
    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        return { articles: [], blogs: [], categories: [] };
    }
};
export const deleteDonation = async (id, token) => {
    try {
        const response = await fetch(`${API_URL}/donations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to delete donation');
        return true;
    } catch (error) {
        throw error;
    }
};
