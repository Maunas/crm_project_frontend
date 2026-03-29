import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles';
import theme from './styledComponents/theme.tsx';
import CssBaseline from '@mui/material/CssBaseline';
import darkTheme from './styledComponents/darkTheme.tsx';

const selectedTheme = window.localStorage.getItem("theme") ?? "light"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={selectedTheme === "light" ? theme : darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
