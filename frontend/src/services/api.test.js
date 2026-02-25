import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser } from './api';

global.fetch = vi.fn();

describe('loginUser', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles successful login', async () => {
        const mockResponse = { token: 'abc' };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await loginUser('test@test.com', 'pass');
        expect(result).toEqual(mockResponse);
    });

    it('handles 401 JSON error', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            headers: { get: () => 'application/json' },
            json: async () => ({ error: 'Bad creds' }),
        });

        await expect(loginUser('test@test.com', 'pass')).rejects.toThrow('Bad creds');
    });

    it('handles 500 HTML error (non-JSON)', async () => {
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            headers: { get: () => 'text/html' },
            text: async () => '<html>Error</html>',
        });

        await expect(loginUser('test@test.com', 'pass')).rejects.toThrow('Login failed: Server returned 500 Internal Server Error');
    });
});
