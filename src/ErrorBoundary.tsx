import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'system-ui', maxWidth: 560 }}>
          <h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', color: '#991b1b', padding: 16, borderRadius: 8, fontSize: 13, overflow: 'auto' }}>
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/';
              window.location.reload();
            }}
            style={{
              marginTop: 16,
              padding: '8px 16px',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
