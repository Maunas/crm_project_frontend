import { memo } from "react";
import { textTheme } from "../../../theme/typographyTheme";
import { Chip, type ChipTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { alpha, lighten, styled } from "@mui/material/styles";

const CHIP_OPACITY = .5
const CHIP_SIZES = {
    "small": { padding: "1px 0px", gap: "2px", fontSize: ".813rem" },
    "medium": { padding: "5px", gap: ".25rem", fontSize: ".875rem" },
    "large": { padding: "6px", gap: ".25rem", fontSize: "1rem", fontWeight: 600 },
    "xlarge": { padding: "8px", gap: ".5rem", fontSize: "1.125rem", fontWeight: 600 }
}

const ICON_SIZE_EM = textTheme.root.lineHeight

const CustomChip = memo(styled(Chip)(({ theme, color, defaultColor = "primary", size = "medium" }) => {
    //Soluciona una incompatibilidad con el valor "default"
    const chipColor = color === "default" ? "contrast" : (color ?? defaultColor)
    const paletteColor = theme.palette[chipColor] ?? theme.palette[defaultColor]
    const sizeObject = CHIP_SIZES[size as keyof typeof CHIP_SIZES]

    return [{
        backdropFilter: "blur(8px)",
        fontWeight: "400",
        height: "auto",
        border: "1px solid",
        borderRadius: ".75rem",
        backgroundColor: alpha(paletteColor.lighter, CHIP_OPACITY),
        borderColor: paletteColor.main,
        color: paletteColor[900],
        ...sizeObject,
    }, {
        //Como el ícono no utiliza lineHeight, se lo multiplica para que tenga la misma altura del texto.
        "& .MuiSvgIcon-root": { display: "block", fontSize: `${ICON_SIZE_EM}em` },
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor[700], CHIP_OPACITY),
        color: lighten(paletteColor[50], .8),
    }),
    ]
    //Se castea a OverridableComponent para permitir el uso de los props component y to para RouterLink
})) as unknown as OverridableComponent<ChipTypeMap> & { defaultComponent: "div" };

export default CustomChip