import { Alert, styled } from '@mui/material'

export const CustomAlert = styled(Alert)(
    ({ theme, severity = "success" }) => {
        return {
            color: theme.palette.text.primary,
            backgroundColor: theme.alpha(theme.palette[severity][200], .5),
            backdropFilter: "blur(8px)",
            ...theme.applyStyles("dark", {
                backgroundColor: theme.alpha(theme.palette[severity][700], .5),

            })
        }
    }
)