import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    contrast: Palette['primary'];
  }
  interface PaletteOptions {
    contrast?: PaletteOptions['primary'];
  }
}
declare module '@mui/material/Chip' {
  interface ChipPropsSizeOverrides {
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    contrast: true;
  }
}