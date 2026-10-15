import React, { useState } from 'react';
import Sidebar from './layout/Sidebar.jsx';
import Navbar from './layout/Navbar.jsx';
import ErrorBox from './ErrorBox.jsx';
import { useSession } from '../state/SessionContext.jsx';

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { error, clearError, backendStatus } = useSession();

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar onOpenSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Global Error Banner if any */}
        {error && (
          <div style={{ padding: '16px 24px 0' }}>
            <ErrorBox message={error} onClose={clearError} />
          </div>
        )}

        {/* Routed Page Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="app-footer">
          <p>
            AI Hackathon Mentor • TCS Hackathon 2026 • Sprint Coaching Active
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
