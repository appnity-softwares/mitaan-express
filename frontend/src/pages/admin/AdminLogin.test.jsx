import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import AdminLogin from './AdminLogin';
import * as api from '../../services/api';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock the API module
vi.mock('../../services/api', () => ({
    loginUser: vi.fn(),
}));

describe('AdminLogin Component', () => {
    const mockSetToken = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form', () => {
        render(
            <BrowserRouter>
                <AdminLogin setToken={mockSetToken} />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/admin@example.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('handles input changes', () => {
        render(
            <BrowserRouter>
                <AdminLogin setToken={mockSetToken} />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText(/admin@example.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);

        fireEvent.change(emailInput, { target: { value: 'test@admin.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@admin.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('calls loginUser and handles success', async () => {
        const mockResponse = {
            token: 'fake-token',
            user: { id: 1, name: 'Admin', role: 'ADMIN' }
        };
        api.loginUser.mockResolvedValue(mockResponse);

        render(
            <BrowserRouter>
                <AdminLogin setToken={mockSetToken} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/admin@example.com/i), { target: { value: 'admin@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(api.loginUser).toHaveBeenCalledWith('admin@test.com', 'password');
        });

        expect(mockSetToken).toHaveBeenCalledWith('fake-token');
        expect(localStorage.getItem('token')).toBe('fake-token');
    });

    it('handles login failure and displays error', async () => {
        api.loginUser.mockRejectedValue(new Error('Invalid credentials'));

        render(
            <BrowserRouter>
                <AdminLogin setToken={mockSetToken} />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/admin@example.com/i), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        expect(mockSetToken).not.toHaveBeenCalled();
    });
});
