import React from 'react';
import { SessionProvider, useSession } from './state/SessionContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Layout from './components/Layout.jsx';

import BriefPage from './pages/BriefPage.jsx';
import TrackerPage from './pages/TrackerPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import JudgePage from './pages/JudgePage.jsx';

function AppContent() {
  const { page } = useSession();

  return (
    <Layout>
      {page === 'brief' && <BriefPage />}
      {page === 'tracker' && <TrackerPage />}
      {page === 'chat' && <ChatPage />}
      {page === 'judge' && <JudgePage />}
    </Layout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </ErrorBoundary>
  );
}

export default App;
