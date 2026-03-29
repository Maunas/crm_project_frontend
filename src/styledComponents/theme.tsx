import { alpha, createTheme, lighten } from '@mui/material/styles';
import { globalPalette } from './palette';

const theme = createTheme({
  palette: {
    primary: {
      light: globalPalette.primary[400],
      main: globalPalette.primary[500],
      dark: globalPalette.primary[600],
      contrastText: globalPalette.primary[50],
      ...globalPalette.primary
    },
    secondary: {
      light: globalPalette.secondary[400],
      main: globalPalette.secondary[500],
      dark: globalPalette.secondary[600],
      contrastText: globalPalette.secondary[50],
      ...globalPalette.secondary
    },
    info: {
      light: globalPalette.info[400],
      main: globalPalette.info[500],
      dark: globalPalette.info[600],
      contrastText: globalPalette.info[50],
      ...globalPalette.info
    },
    success: {
      light: globalPalette.success[400],
      main: globalPalette.success[500],
      dark: globalPalette.success[600],
      contrastText: globalPalette.success[50],
      ...globalPalette.success
    },
    warning: {
      light: globalPalette.warning[400],
      main: globalPalette.warning[500],
      dark: globalPalette.warning[600],
      contrastText: globalPalette.warning[50],
      ...globalPalette.warning
    },
    error: {
      light: globalPalette.error[400],
      main: globalPalette.error[500],
      dark: globalPalette.error[600],
      contrastText: globalPalette.error[50],
      ...globalPalette.error
    },

    contrast: {
      light: globalPalette.contrast[600],
      main: globalPalette.contrast[700],
      dark: globalPalette.contrast[800],
      contrastText: globalPalette.contrast[50],
      ...globalPalette.contrast
    },
    background: {
      default: lighten(globalPalette.contrast[100],.5),
      paper: lighten(globalPalette.contrast[50],.8),
    },
    text: {
      primary: globalPalette.contrast[900],
      secondary: alpha(globalPalette.contrast[900], .7),
      disabled: alpha(globalPalette.contrast[900], .5)
    }
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

export default theme;