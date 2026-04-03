import '@mui/material/styles';

export type ColorTypes = "primary" | "secondary" | "contrast" | "info" | "success" | "warning" | "error"


declare module '@mui/material/styles' {
  interface Palette {
    contrast: Palette['primary'];
  }
  interface PaletteOptions {
    contrast?: PaletteOptions['primary'];
  }
  interface PaletteColor {
    lighter: string;
    darker: string;
  }

  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsColorOverrides {
    contrast: true;
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