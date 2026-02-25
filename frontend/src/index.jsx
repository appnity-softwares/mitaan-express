import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import App from './App';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <GlobalErrorBoundary>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </GlobalErrorBoundary>
            {/* TanStack Query Devtools - only shows in development */}
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        </QueryClientProvider>
    </React.StrictMode>
);
