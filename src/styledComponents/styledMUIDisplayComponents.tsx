import { FormHelperText, type AppBarProps } from "@mui/material";
import { styled } from "@mui/material/styles";

export const CustomChip = styled(FormHelperText)<AppBarProps>
    (({ theme }) => ({
        marginBlock: 1,
        color: theme.palette.error.main
    }))