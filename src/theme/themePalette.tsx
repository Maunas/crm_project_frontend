import { createTheme, getContrastRatio } from '@mui/material/styles';

const globalPalette = {
  primary: {
    "50": "hsl(225, 100%, 96%)",
    "100": "hsl(225, 100%, 88%)",
    "200": "hsl(225, 100%, 80%)",
    "300": "hsl(225, 100%, 72%)",
    "400": "hsl(225, 76%, 62%)",
    "500": "hsl(225, 51%, 50%)",
    "600": "hsl(225, 51%, 38%)",
    "700": "hsl(225, 46%, 26%)",
    "800": "hsl(225, 42%, 16%)",
    "900": "hsl(225, 44%, 6%)",
  },
  secondary: {
    "50": "hsl(260, 100%, 98%)",
    "100": "hsl(260, 100%, 90%)",
    "200": "hsl(260, 100%, 83%)",
    "300": "hsl(260, 100%, 76%)",
    "400": "hsl(260, 88%, 67%)",
    "500": "hsl(260, 57%, 54%)",
    "600": "hsl(260, 47%, 41%)",
    "700": "hsl(260, 43%, 29%)",
    "800": "hsl(260, 37%, 17%)",
    "900": "hsl(260, 37%, 7%)",
  },
  info: {
    "50": "hsl(185, 100%, 95%)",
    "100": "hsl(185, 62%, 81%)",
    "200": "hsl(185, 53%, 67%)",
    "300": "hsl(185, 51%, 51%)",
    "400": "hsl(185, 100%, 33%)",
    "500": "hsl(185, 100%, 27%)",
    "600": "hsl(185, 100%, 20%)",
    "700": "hsl(185, 75%, 16%)",
    "800": "hsl(185, 49%, 11%)",
    "900": "hsl(185, 46%, 4%)",
  },
  success: {
    "50": "hsl(120, 100%, 94%)",
    "100": "hsl(120, 64%, 81%)",
    "200": "hsl(120, 54%, 66%)",
    "300": "hsl(120, 50%, 50%)",
    "400": "hsl(120, 100%, 32%)",
    "500": "hsl(120, 100%, 26%)",
    "600": "hsl(120, 100%, 20%)",
    "700": "hsl(120, 73%, 16%)",
    "800": "hsl(120, 52%, 11%)",
    "900": "hsl(120, 52%, 4%)",
  },
  warning: {
    "50": "hsl(45, 100%, 93%)",
    "100": "hsl(45, 68%, 79%)",
    "200": "hsl(45, 59%, 64%)",
    "300": "hsl(45, 65%, 47%)",
    "400": "hsl(45, 100%, 33%)",
    "500": "hsl(45, 100%, 27%)",
    "600": "hsl(45, 100%, 20%)",
    "700": "hsl(45, 97%, 14%)",
    "800": "hsl(45, 65%, 10%)",
    "900": "hsl(45, 55%, 4%)",
  },
  error: {
    "50": "hsl(7, 100%, 95%)",
    "100": "hsl(7, 100%, 85%)",
    "200": "hsl(7, 100%, 76%)",
    "300": "hsl(7, 100%, 66%)",
    "400": "hsl(7, 80%, 54%)",
    "500": "hsl(7, 79%, 42%)",
    "600": "hsl(7, 75%, 33%)",
    "700": "hsl(7, 63%, 24%)",
    "800": "hsl(7, 56%, 14%)",
    "900": "hsl(7, 60%, 6%)",
  },
  contrast: {
    "50": "hsl(240, 71%, 97%)",
    "100": "hsl(240, 16%, 86%)",
    "200": "hsl(240, 12%, 74%)",
    "300": "hsl(240, 10%, 63%)",
    "400": "hsl(240, 8%, 52%)",
    "500": "hsl(240, 9%, 41%)",
    "600": "hsl(240, 9%, 31%)",
    "700": "hsl(240, 10%, 20%)",
    "800": "hsl(240, 13%, 11%)",
    "900": "hsl(240, 29%, 3%)",
  },
}

export const lightTheme = createTheme({
  palette: {
    primary: {
      lighter: globalPalette.primary[300],
      light: globalPalette.primary[400],
      main: globalPalette.primary[500],
      dark: globalPalette.primary[600],
      darker: globalPalette.primary[700],
      ...globalPalette.primary
    },
    secondary: {
      lighter: globalPalette.secondary[300],
      light: globalPalette.secondary[400],
      main: globalPalette.secondary[500],
      dark: globalPalette.secondary[600],
      darker: globalPalette.secondary[700],
      ...globalPalette.secondary
    },
    info: {
      lighter: globalPalette.info[300],
      light: globalPalette.info[400],
      main: globalPalette.info[500],
      dark: globalPalette.info[600],
      darker: globalPalette.info[700],
      ...globalPalette.info
    },
    success: {
      lighter: globalPalette.success[300],
      light: globalPalette.success[400],
      main: globalPalette.success[500],
      dark: globalPalette.success[600],
      darker: globalPalette.success[700],
      ...globalPalette.success
    },
    warning: {
      lighter: globalPalette.warning[300],
      light: globalPalette.warning[400],
      main: globalPalette.warning[500],
      dark: globalPalette.warning[600],
      darker: globalPalette.warning[700],
      ...globalPalette.warning
    },
    error: {
      lighter: globalPalette.error[300],
      light: globalPalette.error[400],
      main: globalPalette.error[500],
      dark: globalPalette.error[600],
      darker: globalPalette.error[700],
      ...globalPalette.error
    },

    contrast: {
      lighter: globalPalette.contrast[500],
      light: globalPalette.contrast[600],
      main: globalPalette.contrast[700],
      dark: globalPalette.contrast[800],
      darker: globalPalette.contrast[900],
      contrastText:
        getContrastRatio(globalPalette.contrast[600], globalPalette.contrast[50]) > 4.5 ?
          globalPalette.contrast[50] : globalPalette.contrast[900],
      ...globalPalette.contrast
    },
    background: {
      default: globalPalette.contrast[100],
      paper: globalPalette.contrast[50]
    }
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      lighter: globalPalette.primary[100],
      light: globalPalette.primary[200],
      main: globalPalette.primary[300],
      dark: globalPalette.primary[400],
      darker: globalPalette.primary[500],
      ...globalPalette.primary
    },
    secondary: {
      lighter: globalPalette.secondary[100],
      light: globalPalette.secondary[200],
      main: globalPalette.secondary[300],
      dark: globalPalette.secondary[400],
      darker: globalPalette.secondary[500],
      ...globalPalette.secondary
    },
    info: {
      lighter: globalPalette.info[100],
      light: globalPalette.info[200],
      main: globalPalette.info[300],
      dark: globalPalette.info[400],
      darker: globalPalette.info[500],
      ...globalPalette.info
    },
    success: {
      lighter: globalPalette.success[100],
      light: globalPalette.success[200],
      main: globalPalette.success[300],
      dark: globalPalette.success[400],
      darker: globalPalette.success[500],
      ...globalPalette.success
    },
    warning: {
      lighter: globalPalette.warning[100],
      light: globalPalette.warning[200],
      main: globalPalette.warning[300],
      dark: globalPalette.warning[400],
      darker: globalPalette.warning[500],
      ...globalPalette.warning
    },
    error: {
      lighter: globalPalette.error[100],
      light: globalPalette.error[200],
      main: globalPalette.error[300],
      dark: globalPalette.error[400],
      darker: globalPalette.error[500],
      ...globalPalette.error
    },

    contrast: {
      lighter: globalPalette.contrast[400],
      light: globalPalette.contrast[500],
      main: globalPalette.contrast[600],
      dark: globalPalette.contrast[700],
      darker: globalPalette.contrast[800],
      contrastText:
        getContrastRatio(globalPalette.contrast[600], globalPalette.contrast[50]) > 4.5 ?
          globalPalette.contrast[50] : globalPalette.contrast[900],
      ...globalPalette.contrast
    },
    background: {
      default: globalPalette.contrast[900],
      paper: globalPalette.contrast[800]
    }
  },
});

