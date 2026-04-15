import { Chip, LinearProgress, type ChipTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { alpha, styled } from "@mui/material/styles";

const CHIP_OPACITY = 0.2
const CHIP_SIZES = {
    "sm": { padding: "0px", gap: "0px", fontSize: ".8rem" },
    "md": { padding: "4px", gap: "2px", fontSize: ".8rem" },
    "lg": { padding: "6px", gap: "4px", fontSize: "1rem" },
    "xl": { padding: "10px 8px", gap: "6px", fontSize: "1rem" }
}

export const CustomChip = styled(Chip)(({ theme, color = "primary", size = "md" }) => {
    const chipColor = color === "default" ? "contrast" : color //Soluciona una incompatibilidad con el valor "default"
    const paletteColor = theme.palette[chipColor] ?? theme.palette.primary
    const sizeObject = CHIP_SIZES[size as keyof typeof CHIP_SIZES]

    return [{
        fontWeight: "600",
        height: "auto",
        border: "1px solid",
        borderRadius: ".75rem",
        backgroundColor: alpha(paletteColor.light, CHIP_OPACITY),
        borderColor: paletteColor.main,
        color: paletteColor.darker,
        ...sizeObject
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor.darker, CHIP_OPACITY),
        color: paletteColor.lighter,
    })
    ]
}) as unknown as OverridableComponent<ChipTypeMap> & { defaultComponent: "div" };

export const CustomBar = styled(LinearProgress)(({ theme, color = "primary" }) => {
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
})