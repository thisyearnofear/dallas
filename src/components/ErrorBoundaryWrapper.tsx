/**
 * Error Boundary Wrapper for Attention Token Components
 * Gracefully handles API failures and blockchain errors
 */

import { Component } from 'preact';

interface Props {
  children: any;
  fallback?: any;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundaryWrapper extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`Error in ${this.props.componentName || 'component'}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div class="bg-red-900/20 border border-red-600 p-6 rounded-lg">
          <h3 class="text-xl font-bold text-red-400 mb-2">⚠️ Something went wrong</h3>
          <p class="text-gray-300 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-bold transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  return (props: P) => (
    <ErrorBoundaryWrapper componentName={componentName}>
      <Component {...props} />
    </ErrorBoundaryWrapper>
  );
}
