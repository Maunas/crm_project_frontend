import { createTheme } from '@mui/material/styles';
import { darkTheme, lightTheme } from './themePalette';

const theme = createTheme({
  colorSchemes: {
    light: {
      palette: lightTheme.palette
    },
    dark: {
      palette: darkTheme.palette
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
    },
    h2: {
      fontSize: '1.7em',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.37em',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.2em',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.03em',
      fontWeight: 700,
    },
    h6: {
      fontSize: '0.87rem',
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },

  components: {
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
        },
        sizeMedium: {
          padding: '.5rem 1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          }
        }
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          marginBlock: ".25rem"
        }
      },
    },
  },
});

export default theme;