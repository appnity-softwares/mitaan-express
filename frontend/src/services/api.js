export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = API_URL.replace('/api', '');
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1585829365294-bb8c6f045b88?auto=format&fit=crop&q=80&w=800';

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

export const loginUser = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            } else {
                throw new Error(`Login failed: Server returned ${response.status} ${response.statusText}`);
            }
        }
        return await response.json();
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
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
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
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create article');
        }
        return await response.json();
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
        if (!response.ok) throw new Error('Failed to update article');
        return await response.json();
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
        if (!response.ok) throw new Error('Failed to delete article');
        return true;
    } catch (error) {
        throw error;
    }
}


export const fetchBlogs = async (search = '', author = '', lang = '', status = '') => {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (author) params.append('author', author);
        if (lang) params.append('lang', lang);
        if (status) params.append('status', status);
        const response = await fetch(`${API_URL}/blogs?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return await response.json();
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return [];
    }
};

export const fetchBlogBySlug = async (slug) => { // Added for editing
    try {
        const response = await fetch(`${API_URL}/blogs/${slug}`);
        if (!response.ok) throw new Error('Failed to fetch blog');
        return await response.json();
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
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create blog');
        }
        return await response.json();
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
        if (!response.ok) throw new Error('Failed to update blog');
        return await response.json();
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
        if (!response.ok) throw new Error('Failed to update settings');
        return await response.json();
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


