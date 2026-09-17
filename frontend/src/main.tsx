import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'nprogress/nprogress.css';
import './index.css'
import App from './App.tsx'
import { initTheme } from './lib/theme-store'

initTheme()

createRoot(document.getElementById('root')!).render(
 <StrictMode>
 <BrowserRouter>
 <App />
 </BrowserRouter>
 </StrictMode>,
)
