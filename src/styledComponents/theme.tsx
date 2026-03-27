import { alpha, createTheme } from '@mui/material/styles';

const theme = createTheme({
  // Paleta de Colores (Tu configuración original)
  palette: {
    primary: {
      light: "#729EFF",
      main: "#3E64C1",
      dark: "#243762",
      contrastText: "#EAFAFF",
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
      light: "#AC82FF",
      main: '#7647CD',
      dark: "#3D2A68",
      contrastText: "#FBF2FF",
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
      light: "#41B3C1",
      main: '#007A88',
      dark: "#0A4046",
      contrastText: "#E3FFFF",
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
      light: "#44BE40",
      main: '#008400',
      dark: "#0C450B",
      contrastText: "#E3FFE0",
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
      light: "#C39B2A",
      main: '#8A6400',
      dark: "#543F00",
      contrastText: "#FFF9DC",
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
      light: "#FF6953",
      main: '#C02817',
      dark: "#621F16",
      contrastText: "#FFECE3",
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
      light: '#46464F',
      main: '#1E1E2B',
      dark: '#11111A',
      contrastText: "#F2F2F2",
      "50": "#F2F2F2",
      "100": "#DCDCDE",
      "200": "#AEAEB2",
      "300": "#787880",
      "400": "#46464F",
      "500": "#1E1E2B",
      "600": "#181824",
      "700": "#11111A",
      "800": "#0B0B0F",
      "900": "#050507",
    },
    background: {
      default: '#DCDCDE',
      paper: '#F2F2F2',
    },
    text: {
      primary: "#11111A",
      secondary: alpha("#11111A",.7),
      disabled: alpha("#11111A",.5)
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

export default theme;