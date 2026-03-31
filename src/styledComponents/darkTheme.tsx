import { createTheme } from '@mui/material/styles';
import { globalPalette } from './palette';

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: globalPalette.primary[200],
      main: globalPalette.primary[300],
      dark: globalPalette.primary[400],
      ...globalPalette.primary
    },
    secondary: {
      light: globalPalette.secondary[200],
      main: globalPalette.secondary[300],
      dark: globalPalette.secondary[400],
      ...globalPalette.secondary
    },
    info: {
      light: globalPalette.info[200],
      main: globalPalette.info[300],
      dark: globalPalette.info[400],
      ...globalPalette.info
    },
    success: {
      light: globalPalette.success[200],
      main: globalPalette.success[300],
      dark: globalPalette.success[400],
      ...globalPalette.success
    },
    warning: {
      light: globalPalette.warning[200],
      main: globalPalette.warning[300],
      dark: globalPalette.warning[400],
      ...globalPalette.warning
    },
    error: {
      light: globalPalette.error[200],
      main: globalPalette.error[300],
      dark: globalPalette.error[400],
      ...globalPalette.error
    },

    contrast: {
      light: globalPalette.contrast[500],
      main: globalPalette.contrast[600],
      dark: globalPalette.contrast[700],
      ...globalPalette.contrast
    },
  },

  // Tipografía
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2em',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    h2: {
      fontSize: '1.7em',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    h3: {
      fontSize: '1.37em',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    h4: {
      fontSize: '1.2em',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    h5: {
      fontSize: '1.03em',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    h6: {
      fontSize: '0.87rem',
      fontWeight: 700,
      paddingBlock: '.5em'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },

  // AGREGADO IMPORTANTE: Estilos Globales
  components: {
    // 1. CssBaseline: Controla los estilos globales del HTML y Body
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: '100%',
          height: '100%',
        },
        body: {
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
        },
        '#root': {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
    // 2. Tus overrides de botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      },
    },

  },
});

export default darkTheme;