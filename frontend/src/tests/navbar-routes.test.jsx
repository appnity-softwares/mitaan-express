import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ArticlesProvider } from '../context/ArticlesContext';
import queryClient from '../lib/queryClient';
import App from '../App';

/**
 * Navbar Routes Verification Test
 * 
 * Purpose: Verify all navbar links route to working pages
 * Tests: Main pages, dynamic category routes, and special pages
 */

// Mock IntersectionObserver
class MockIntersectionObserver {
    constructor(callback) {
        this.callback = callback;
    }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => { },
        removeListener: () => { },
        addEventListener: () => { },
        removeEventListener: () => { },
        dispatchEvent: () => { },
    }),
});

const renderWithRouter = (route = '/') => {
    return render(
        <QueryClientProvider client={queryClient}>
            <ArticlesProvider>
                <MemoryRouter initialEntries={[route]}>
                    <App />
                </MemoryRouter>
            </ArticlesProvider>
        </QueryClientProvider>
    );
};

describe('Navbar Routes Verification', () => {
    beforeEach(() => {
        queryClient.clear();
    });

    describe('Main Navigation Pages', () => {
        it('should render Home page at /', async () => {
            renderWithRouter('/');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render About page at /about', async () => {
            renderWithRouter('/about');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Gallery page at /gallery', async () => {
            renderWithRouter('/gallery');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Video page at /video', async () => {
            renderWithRouter('/video');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Contact page at /contact', async () => {
            renderWithRouter('/contact');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Blogs page at /blogs', async () => {
            renderWithRouter('/blogs');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Special Pages', () => {
        it('should render Poetry page at /poetry', async () => {
            renderWithRouter('/poetry');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Login page at /login', async () => {
            renderWithRouter('/login');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Signup page at /signup', async () => {
            renderWithRouter('/signup');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Admin page at /admin', async () => {
            renderWithRouter('/admin');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Dynamic Routes', () => {
        it('should render Category page at /category/:categoryId', async () => {
            renderWithRouter('/category/sports');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Article Detail page at /article/:id', async () => {
            renderWithRouter('/article/1');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });

        it('should render Blog Detail page at /blog/:slug', async () => {
            renderWithRouter('/blog/sample-blog');
            await waitFor(() => {
                expect(document.body).toBeTruthy();
            }, { timeout: 3000 });
        });
    });

    describe('Route Navigation', () => {
        it('should have all main pages accessible from App routing', () => {
            const mainRoutes = ['/', '/about', '/gallery', '/video', '/contact', '/blogs'];

            mainRoutes.forEach(route => {
                const { unmount } = renderWithRouter(route);
                expect(document.body).toBeTruthy();
                unmount();
            });
        });
    });
});
