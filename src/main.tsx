import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import ThemeProvider from '@/contexts/theme/ThemeProvider.tsx'

import './assets/css/tailwind.css'
import '@/styles/theme.css'
import '@/styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(<StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
</StrictMode>)