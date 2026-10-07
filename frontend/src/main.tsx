import { GoogleOAuthProvider } from '@react-oauth/google';
import 'nprogress/nprogress.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { initTheme } from './lib/theme-store';

initTheme()

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
