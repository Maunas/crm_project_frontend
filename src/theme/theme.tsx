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
      fontSize: textTheme.title.fontSize.h1,
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h2: {
      fontSize: textTheme.title.fontSize.h2,
      fontWeight: 700,
      lineHeight: textTheme.title.lineHeight
    },
    h3: {
      fontSize: textTheme.title.fontSize.h3,
      fontWeight: 600,
      lineHeight: textTheme.title.lineHeight
    },
    h4: {
      fontSize: textTheme.title.fontSize.h4,
      fontWeight: 600,
      lineHeight: textTheme.title.lineHeight
    },
    h5: {
      fontSize: textTheme.title.fontSize.h5,
      fontWeight: 500,
      lineHeight: textTheme.title.lineHeight
    },
    h6: {
      fontSize: textTheme.title.fontSize.h6,
      fontWeight: 500,
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
        '#root': {
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
            borderTop: `1px solid ${theme.alpha(theme.palette.divider, .3)}`,
            borderBottom: `1px solid ${theme.alpha(theme.palette.divider, .05)}`,
          }
        })
        )
      }
    }
  },
});

export default theme;