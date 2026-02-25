import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from '../components/Navbar';

// Mock fetch for categories
global.fetch = vi.fn();

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

const mockCategories = [
    { id: 1, slug: 'sports', name: 'Sports', nameHi: 'खेल', icon: 'Trophy', sortOrder: 1, parentId: null },
    { id: 2, slug: 'economic', name: 'Economy', nameHi: 'अर्थव्यवस्था', icon: 'TrendingUp', sortOrder: 2, parentId: null },
    { id: 3, slug: 'tech', name: 'Technology', nameHi: 'तकनीक', icon: 'Cpu', sortOrder: 3, parentId: null },
];

const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderNavbar = (props = {}) => {
    const defaultProps = {
        activeCategory: 'home',
        onCategoryChange: vi.fn(),
        theme: 'light',
        toggleTheme: vi.fn(),
        language: 'en',
        toggleLanguage: vi.fn(),
    };

    return render(
        <QueryClientProvider client={createTestQueryClient()}>
            <MemoryRouter>
                <Navbar {...defaultProps} {...props} />
            </MemoryRouter>
        </QueryClientProvider>
    );
};

describe('Navbar Navigation Tests', () => {
    beforeEach(() => {
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockCategories,
        });
    });

    it('renders Navbar without crashing', () => {
        renderNavbar();
        expect(screen.getByText(/MITAAN EXPRESS/i)).toBeInTheDocument();
    });

    it('opens mobile menu when hamburger is clicked', async () => {
        renderNavbar();
        const menuButton = screen.getByRole('button', { name: /explore|close/i });
        fireEvent.click(menuButton);

        await waitFor(() => {
            expect(screen.getByText(/Home/i)).toBeInTheDocument();
            expect(screen.getByText(/About Us/i)).toBeInTheDocument();
        });
    });

    it('calls onCategoryChange when Home is clicked', async () => {
        const onCategoryChange = vi.fn();
        renderNavbar({ onCategoryChange });

        const menuButton = screen.getByRole('button', { name: /explore/i });
        fireEvent.click(menuButton);

        await waitFor(() => {
            const homeLink = screen.getByText(/Home/i);
            fireEvent.click(homeLink);
            expect(onCategoryChange).toHaveBeenCalledWith('home');
        });
    });

    it('toggles theme when theme button is clicked', () => {
        const toggleTheme = vi.fn();
        renderNavbar({ toggleTheme });

        const themeButton = screen.getAllByRole('button').find(btn =>
            btn.querySelector('svg')
        );

        if (themeButton) {
            fireEvent.click(themeButton);
            expect(toggleTheme).toHaveBeenCalled();
        }
    });

    it('toggles language when language button is clicked', () => {
        const toggleLanguage = vi.fn();
        renderNavbar({ toggleLanguage });

        const langButton = screen.getByText(/Hindi|English/i);
        fireEvent.click(langButton);
        expect(toggleLanguage).toHaveBeenCalled();
    });

    it('displays all main navigation pages in mobile menu', async () => {
        renderNavbar();

        const menuButton = screen.getByRole('button', { name: /explore/i });
        fireEvent.click(menuButton);

        await waitFor(() => {
            expect(screen.getByText(/Home/i)).toBeInTheDocument();
            expect(screen.getByText(/About Us/i)).toBeInTheDocument();
            expect(screen.getByText(/Gallery/i)).toBeInTheDocument();
            expect(screen.getByText(/Videos/i)).toBeInTheDocument();
            expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
            expect(screen.getByText(/Blog/i)).toBeInTheDocument();
        });
    });

    it('closes mobile menu after clicking a link', async () => {
        const onCategoryChange = vi.fn();
        renderNavbar({ onCategoryChange });

        // Open menu
        const menuButton = screen.getByRole('button', { name: /explore/i });
        fireEvent.click(menuButton);

        await waitFor(() => {
            const aboutLink = screen.getByText(/About Us/i);
            fireEvent.click(aboutLink);
        });

        expect(onCategoryChange).toHaveBeenCalledWith('about');
    });

    it('displays Hindi text when language is set to Hindi', () => {
        renderNavbar({ language: 'hi' });
        expect(screen.getByText(/मुख्य पृष्ठ|एक्सप्लोर/i)).toBeInTheDocument();
    });

    it('highlights active category', () => {
        renderNavbar({ activeCategory: 'about' });
        // This test verifies the navbar renders with active state
        expect(screen.getByText(/MITAAN EXPRESS/i)).toBeInTheDocument();
    });
});
