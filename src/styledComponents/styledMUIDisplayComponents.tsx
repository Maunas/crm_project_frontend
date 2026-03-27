import { Chip } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";

export const CustomChip = styled(Chip)(({ theme, color = "primary", ...props }) => {
    const TRANSPARENCY = 0.15

    const paletteColor = theme.palette[color] ?? theme.palette.primary
    let sizeObject
    switch(props.size){
        case "sm": sizeObject = {padding:"0px", gap:"0px", fontSize: ".8rem"}; break
        case "lg": sizeObject = {padding:"6px", gap:"4px", fontSize: "1rem"}; break
        case "xl": sizeObject = {padding:"10px 8px", gap:"6px", fontSize:"1rem"}; break
        default: sizeObject = {padding:"4px", gap:"2px", fontSize:".8rem"}
    }

    return {
        fontWeight: 600,
        height:"auto",
        border: "1px solid",
        borderRadius: "12px",
        backgroundColor: alpha(paletteColor.light, TRANSPARENCY),
        borderColor: paletteColor.main,
        color: paletteColor.dark,
        ...sizeObject
    }
})