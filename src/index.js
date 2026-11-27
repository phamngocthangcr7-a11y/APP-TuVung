import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AccountApp from './AccountApp';
import ErrorBoundary from './components/ErrorBoundary';

const root = createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AccountApp />
  </ErrorBoundary>
);
