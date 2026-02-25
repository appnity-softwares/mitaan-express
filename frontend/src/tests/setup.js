import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});

// Mock IntersectionObserver
const IntersectionObserverMock = function () {
    return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    };
};

window.IntersectionObserver = IntersectionObserverMock;
global.IntersectionObserver = IntersectionObserverMock;
