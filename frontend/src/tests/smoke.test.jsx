import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import React from 'react';

// Set global timeout
vi.setConfig({ testTimeout: 60000 });

// Mock IntersectionObserver for AOS/Framer Motion
window.IntersectionObserver = class IntersectionObserver {
    constructor() { }
    observe() { return null; }
    unobserve() { return null; }
    disconnect() { return null; }
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Create a client for testing
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderWithProviders = (ui, { route = '/' } = {}) => {
    return render(
        <QueryClientProvider client={createTestQueryClient()}>
            <MemoryRouter initialEntries={[route]}>
                {ui}
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('Project Smoke Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('language', 'en');
        localStorage.setItem('theme', 'light');
    });

    it('renders HomePage without crashing', async () => {
        renderWithProviders(<App />, { route: '/' });
        await waitFor(() => {
            expect(screen.getByText(/MITAAN EXPRESS/i)).toBeInTheDocument();
        }, { timeout: 30000 });
    });

    it('renders AboutPage area', async () => {
        renderWithProviders(<App />, { route: '/about' });
        await waitFor(() => {
            // Just check if we are on a page that isn't the homepage
            expect(screen.getByRole('main')).toBeInTheDocument();
        }, { timeout: 30000 });
    });

    it('renders ContactPage area', async () => {
        renderWithProviders(<App />, { route: '/contact' });
        await waitFor(() => {
            expect(screen.getByRole('main')).toBeInTheDocument();
        }, { timeout: 30000 });
    });

    it('renders BlogsPage area', async () => {
        renderWithProviders(<App />, { route: '/blogs' });
        await waitFor(() => {
            expect(screen.getByRole('main')).toBeInTheDocument();
        }, { timeout: 30000 });
    });

    it('renders LoginPage (Admin Entry) area', async () => {
        renderWithProviders(<App />, { route: '/admin/login' });
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/email|email/i)).toBeInTheDocument();
        }, { timeout: 30000 });
    });

    it('renders 404 handler', async () => {
        renderWithProviders(<App />, { route: '/unknown-route-xyz' });
        await waitFor(() => {
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        }, { timeout: 30000 });
    });
});
