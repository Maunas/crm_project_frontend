import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'src/styles/scrollbars.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles';
import theme from 'src/theme/theme.tsx';
import CssBaseline from '@mui/material/CssBaseline';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} noSsr>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
