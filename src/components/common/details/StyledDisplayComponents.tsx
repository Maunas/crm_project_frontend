import { Chip, LinearProgress, type ChipTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { alpha, lighten, styled } from "@mui/material/styles";
import { memo } from "react";

const CHIP_OPACITY = .5
const CHIP_SIZES = {
    "small": { padding: "0px", gap: "0px", fontSize: ".8rem" },
    "medium": { padding: "4px", gap: "2px", fontSize: ".8rem" },
    "large": { padding: "6px", gap: "4px", fontSize: "1rem" },
    "xlarge": { padding: "10px 8px", gap: "6px", fontSize: "1rem" }
}

export const CustomChip = memo(styled(Chip)(({ theme, color, defaultColor = "primary", size = "medium" }) => {
    const chipColor = color === "default" ? "contrast" : (color ?? defaultColor) //Soluciona una incompatibilidad con el valor "default"
    const paletteColor = theme.palette[chipColor] ?? theme.palette[defaultColor]
    const sizeObject = CHIP_SIZES[size as keyof typeof CHIP_SIZES]

    return [{
        backdropFilter: "blur(8px)",
        fontWeight: "600",
        height: "auto",
        border: "1px solid",
        borderRadius: ".75rem",
        backgroundColor: alpha(paletteColor.lighter, CHIP_OPACITY),
        borderColor: paletteColor.main,
        color: paletteColor[900],
        ...sizeObject
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor[700], CHIP_OPACITY),
        color: lighten(paletteColor[50], .8),
    })
    ]
})) as unknown as OverridableComponent<ChipTypeMap> & { defaultComponent: "div" };

export const CustomBar = memo(styled(LinearProgress)(({ theme, color = "primary" }) => {
    const paletteColor = color === "inherit" ? "primary" : color
    return [{
        width: "100%",
        maxWidth: "15rem",
        height: "1em",
        borderRadius: 20,
        border: `1px solid ${theme.palette[paletteColor].lighter}`
    },
    theme.applyStyles("dark", {
        borderColor: theme.palette[paletteColor].main,
        "& .MuiLinearProgress-bar1": {
            backgroundColor: theme.palette[paletteColor].light,
        },
    })
    ]
}))