import { Chip } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const CustomChip = styled(Chip)(({ theme, color = "primary", ...props }) => {
    const OPACITY = 0.1
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
        borderRadius: "12px",
        backgroundColor: alpha(paletteColor.light, OPACITY),
        borderColor: paletteColor.main,
        color: paletteColor.dark,
        ...sizeObject
    },
    //Invierte los tonos en darkmode
    theme.applyStyles('dark', {
        backgroundColor: alpha(paletteColor.dark, OPACITY),
        color: paletteColor.light,
    })
    ]
})