// frontend/src/components/ErrorBoundary.jsx
import React from 'react';
import { logError } from '../utils/logger';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError('ErrorBoundary caught rendering exception:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 rounded-2xl my-4">
          <h3 className="text-base font-bold text-red-750 dark:text-red-400">Unable to load data.</h3>
          <p className="text-xs text-slate-500 mt-1">Something went wrong rendering this section. Please try again.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-550/10"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
