import { Chip, LinearProgress, type ChipTypeMap } from "@mui/material";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { alpha, styled } from "@mui/material/styles";

export const CustomChip = styled(Chip)(({ theme, color = "primary", ...props }) => {
    const OPACITY = 0.2
    const chipColor = color === "default" ? "contrast" : color //Soluciona una incompatibilidad con el valor "default"
    const paletteColor = theme.palette[chipColor] ?? theme.palette.primary
    let sizeObject
    switch (props.size) {
        case "sm": sizeObject = { padding: "0px", gap: "0px", fontSize: ".8rem" }; break
        case "lg": sizeObject = { padding: "6px", gap: "4px", fontSize: "1rem" }; break
        case "xl": sizeObject = { padding: "10px 8px", gap: "6px", fontSize: "1rem" }; break
        default: sizeObject = { padding: "4px", gap: "2px", fontSize: ".8rem" }
    }

    return [{
        fontWeight: 600,
        height: "auto",
        border: "1px solid",
        borderRadius: ".75rem",
        backgroundColor: alpha(paletteColor.light, OPACITY),
        borderColor: paletteColor.main,
        color: paletteColor.darker,
        ...sizeObject
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor.darker, OPACITY),
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