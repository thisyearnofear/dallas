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
                <div class="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex items-center justify-center p-8 transition-colors duration-500">
                    <div class="max-w-2xl mx-auto text-center animate-fadeIn">
                        <div class="text-7xl mb-6 drop-shadow-lg">💥</div>
                        <h1 class="text-4xl font-black mb-4 text-red-600 dark:text-red-400 uppercase tracking-tighter">System Critical Error</h1>
                        <p class="text-slate-600 dark:text-slate-300 mb-8 font-medium text-lg leading-relaxed">
                            An unexpected fragmentation occurred while accessing the Dallas network.
                        </p>

                        <div class="bg-white dark:bg-slate-900 border-2 border-red-500/30 rounded-2xl p-6 mb-10 text-left shadow-xl shadow-red-500/5">
                            <div class="text-xs font-black text-red-600 dark:text-red-400 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                Error Stack Trace:
                            </div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 font-mono break-all p-4 bg-slate-50 dark:bg-black/40 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                                {this.state.error.message}
                            </div>
                        </div>

                        <div class="space-y-8">
                            <button
                                onClick={() => window.location.reload()}
                                class="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-10 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl uppercase tracking-widest text-sm"
                            >
                                🔄 Reboot Application
                            </button>

                            <div class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Protocol Check:
                                <ul class="mt-4 grid grid-cols-2 gap-4 text-left max-w-md mx-auto">
                                    <li class="flex items-center gap-2"><span class="text-blue-500">●</span> Wallet Connection</li>
                                    <li class="flex items-center gap-2"><span class="text-blue-500">●</span> Network Latency</li>
                                    <li class="flex items-center gap-2"><span class="text-blue-500">●</span> Node Accessibility</li>
                                    <li class="flex items-center gap-2"><span class="text-blue-500">●</span> Permission Levels</li>
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