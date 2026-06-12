import { Box, styled } from '@mui/material'

export const GenericSidebarHeader = styled(Box)(
    ({ theme }) => ([
        {
            margin: "-1.5rem -2rem 0",
            backgroundColor: theme.alpha(theme.palette.contrast[50], .5)
        },
        theme.applyStyles("dark", {
            backgroundColor: theme.alpha(theme.palette.background.paper, .5)
        })
    ])
)