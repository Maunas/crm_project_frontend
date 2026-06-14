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

export const GenericSidebarContent = styled(Box)(
    ({ theme }) => ([
        {
            flexGrow: 1,
            "& .sidebar-content": {
                flexGrow: 1,
            },
            "& .sidebar-footer": {
                margin: "1rem -2rem -1.5rem",
                padding: "1rem 1.5rem",
                minHeight: "5rem",
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "end",
                backgroundColor: theme.alpha(theme.palette.contrast[50], .5),
            }
        },
        theme.applyStyles("dark", {
            "& .sidebar-footer": {
                backgroundColor: theme.alpha(theme.palette.background.paper, .5)
            }
        })
    ])
)