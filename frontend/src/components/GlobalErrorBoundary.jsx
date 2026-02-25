import React from 'react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
                    <h1 style={{ color: '#ef4444', fontSize: '1.5rem', fontWeight: 'bold' }}>Something went wrong</h1>
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#f1f5f9', borderRadius: '0.5rem', overflow: 'auto' }}>
                        <p style={{ fontWeight: 'bold', color: '#0f172a' }}>{this.state.error?.toString()}</p>
                        <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
