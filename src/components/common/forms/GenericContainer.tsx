import { Container, Paper, type Breakpoint } from '@mui/material'
import { type ReactNode } from 'react'


interface GenericContainerProps {
    children: ReactNode,
    maxWidth?: false | Breakpoint | undefined,
    containerSx?: object,
    paperSx?: object
}

export const GenericContainer = ({ children, maxWidth = "lg", containerSx = {}, paperSx = {} }: GenericContainerProps) => {

    return (
        <Container sx={containerSx} maxWidth={maxWidth}>
            <Paper sx={{ p: 2, ...paperSx }}>
                {children}
            </Paper>
        </Container>
    )
}
