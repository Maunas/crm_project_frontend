import { createTheme } from '@mui/material/styles';
import { darkTheme, lightTheme } from './themePalette';
import { textTheme } from './typographyTheme';

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
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h3: {
      fontSize: '1.37rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h5: {
      fontSize: '1.03rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h6: {
      fontSize: '0.87rem',
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      lineHeight: textTheme.root.lineHeight
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
          ...textTheme.root
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
    MuiInputBase: {
      defaultProps: {
        disableInjectingGlobalStyles: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => (theme.applyStyles("dark", {
          '&:not([data-noborder])': {
            border: `1px solid ${theme.palette.divider}`,
            borderTop: `1px solid ${theme.alpha(theme.palette.common.white, .3)}`,
          }
        })
        )
      }
    }
  },
});

export default theme;