import React from 'react';
import ErrorBox from './ErrorBox.jsx';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
            Application Error
          </h2>
          <ErrorBox
            message={this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
          />
          <div style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={this.handleReset}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
