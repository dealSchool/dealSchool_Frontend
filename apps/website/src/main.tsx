import {StrictMode, type ComponentType} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {LandingPage} from './components/LandingPage.tsx';
import './index.css';

// Standalone pages that are intentionally not linked from anywhere in the
// site's navigation. They only render when their exact path is requested
// directly in the browser's address bar.
const STANDALONE_ROUTES: Record<string, ComponentType> = {
  '/cohort1': LandingPage,
};

const normalizedPath = window.location.pathname.replace(/\/+$/, '') || '/';
const StandaloneComponent = STANDALONE_ROUTES[normalizedPath];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {StandaloneComponent ? <StandaloneComponent /> : <App />}
  </StrictMode>,
);
