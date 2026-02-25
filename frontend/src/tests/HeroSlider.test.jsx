import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import HeroSlider from '../components/HeroSlider';

import { ArticlesProvider } from '../context/ArticlesContext';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock fetch
global.fetch = vi.fn();

// Mock IntersectionObserver for Framer Motion
window.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderWithContexts = (component) => {
    return render(
        <QueryClientProvider client={createTestQueryClient()}>
            <BrowserRouter>
                <ArticlesProvider>
                    {component}
                </ArticlesProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

describe('HeroSlider', () => {
    it('shows default content initially', () => {
        // Mock fetch to return nothing immediately
        fetch.mockImplementationOnce(() => new Promise(() => { }));
        renderWithContexts(<HeroSlider language="en" />);
        expect(screen.getByText('Welcome to Mitaan Express')).toBeInTheDocument();
    });

    it('renders slides after fetching data', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('categories')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [{ id: 1, name: 'News', slug: 'news' }]
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => [
                    {
                        id: 1,
                        title: 'Test Article',
                        shortDescription: 'Test Description',
                        image: 'test.jpg',
                        isFeatured: true,
                        status: 'PUBLISHED',
                        category: { name: 'News' },
                        slug: 'test-article'
                    }
                ]
            });
        });

        renderWithContexts(<HeroSlider language="en" />);

        await waitFor(() => {
            expect(screen.getByText('Test Article')).toBeInTheDocument();
        });
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        fetch.mockRejectedValueOnce(new Error('API Error'));
        renderWithContexts(<HeroSlider language="en" />);

        // Should fallback to default slide
        await waitFor(() => {
            // The component logs error, but should render fallback slide
            expect(screen.getByText(/Mitaan Express/i)).toBeInTheDocument();
        });
    });
});
