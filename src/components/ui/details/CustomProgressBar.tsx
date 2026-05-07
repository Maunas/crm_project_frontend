import { memo } from "react";
import { LinearProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const CustomBar = memo(styled(LinearProgress)(({ theme, color = "primary" }) => {
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

export default CustomBar