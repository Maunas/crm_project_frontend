import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'src/styles/scrollbars.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme/theme.tsx';
import CssBaseline from '@mui/material/CssBaseline';

if (import.meta.env.DEV) {
  const script = document.createElement('script');
  script.src = '//unpkg.com/react-scan/dist/auto.global.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} noSsr>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
