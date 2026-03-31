import { createTheme, getContrastRatio } from '@mui/material/styles';

const globalPalette = {
  primary: {
    "50": "#EAFAFF",
    "100": "#C1DBFF",
    "200": "#98BCFF",
    "300": "#729EFF",
    "400": "#537FE7",
    "500": "#3E64C1",
    "600": "#2F4D92",
    "700": "#243762",
    "800": "#172138",
    "900": "#090D17",
  },
  secondary: {
    "50": "#FBF2FF",
    "100": "#DFCEFF",
    "200": "#C5A8FF",
    "300": "#AC82FF",
    "400": "#9260F5",
    "500": "#7647CD",
    "600": "#59389B",
    "700": "#3D2A68",
    "800": "#241B3B",
    "900": "#0E0B18",
  },
  info: {
    "50": "#E3FFFF",
    "100": "#B2E6ED",
    "200": "#7CCDD7",
    "300": "#41B3C1",
    "400": "#0097A6",
    "500": "#007A88",
    "600": "#005D67",
    "700": "#0A4046",
    "800": "#0E2629",
    "900": "#060F10",
  },
  success: {
    "50": "#E3FFE0",
    "100": "#B3EDAE",
    "200": "#7ED778",
    "300": "#44BE40",
    "400": "#00A300",
    "500": "#008400",
    "600": "#006400",
    "700": "#0C450B",
    "800": "#0E290D",
    "900": "#061005",
  },
  warning: {
    "50": "#FFF9DC",
    "100": "#EED9A7",
    "200": "#D9BA6C",
    "300": "#C39B2A",
    "400": "#A97E00",
    "500": "#8A6400",
    "600": "#684C00",
    "700": "#483601",
    "800": "#2A2109",
    "900": "#110D05",
  },
  error: {
    "50": "#FFECE3",
    "100": "#FFC3B4",
    "200": "#FF9682",
    "300": "#FF6953",
    "400": "#E7412D",
    "500": "#C02817",
    "600": "#912215",
    "700": "#621F16",
    "800": "#391610",
    "900": "#180806",
  },
  contrast: {
    "50": "#F3F4FD",
    "100": "#D4D4E0",
    "200": "#B5B6C5",
    "300": "#9898AB",
    "400": "#7B7C8F",
    "500": "#606172",
    "600": "#474755",
    "700": "#2F2F39",
    "800": "#18191F",
    "900": "#050509",
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
  },
});

