import { Component } from 'preact';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: any;
    fallback?: (error: Error) => any;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(this.state.error);
            }

            return (
                <div class="min-h-screen bg-black text-white flex items-center justify-center p-8">
                    <div class="max-w-2xl mx-auto text-center">
                        <div class="text-6xl mb-4">💥</div>
                        <h1 class="text-3xl font-bold mb-4 text-red-400">Something went wrong</h1>
                        <p class="text-gray-300 mb-6">
                            An unexpected error occurred while loading the application.
                        </p>

                        <div class="bg-gray-900 border border-red-600 rounded-lg p-4 mb-6 text-left">
                            <div class="text-sm font-bold text-red-400 mb-2">Error Details:</div>
                            <div class="text-xs text-gray-400 font-mono break-all">
                                {this.state.error.message}
                            </div>
                        </div>

                        <div class="space-y-4">
                            <button
                                onClick={() => window.location.reload()}
                                class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-bold transition"
                            >
                                🔄 Reload Page
                            </button>

                            <div class="text-sm text-gray-400">
                                If the problem persists, please check:
                                <ul class="mt-2 space-y-1 text-left max-w-md mx-auto">
                                    <li>• Wallet connection (Phantom installed?)</li>
                                    <li>• Network connection</li>
                                    <li>• Blockchain configuration</li>
                                    <li>• Browser console for additional errors</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}