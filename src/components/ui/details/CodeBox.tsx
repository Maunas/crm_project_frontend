import { Box, styled } from '@mui/material'

export const CodeBox = styled(Box)(
    ({ theme }) => ([
        {
            backgroundColor: theme.palette.contrast.main,
            width: "100%",
            textAlign: "center",
            padding: ".25rem 1rem",
            fontFamily: '"Source Code Pro", monospace',
            "& *": {
                color: theme.palette.contrast.contrastText,
            },
        },
        theme.applyStyles("dark", {
            backgroundColor: theme.palette.contrast.darker,
        })

    ])
)