import { GoogleOAuthProvider } from '@react-oauth/google';
import 'nprogress/nprogress.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { reloadForNewBuild } from './lib/lazy-page';
import { initTheme } from './lib/theme-store';

initTheme()

// A tab opened before a deploy may ask for code files that no longer exist.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewBuild()) event.preventDefault();
});

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || ''

createRoot(document.getElementById('root')!).render(
  <StrictMode>
  {googleClientId ? (
  <GoogleOAuthProvider clientId={googleClientId}>
  <BrowserRouter>
  <App />
  </BrowserRouter>
  </GoogleOAuthProvider>
  ) : (
  <BrowserRouter>
  <App />
  </BrowserRouter>
  )}
  </StrictMode>,
)
