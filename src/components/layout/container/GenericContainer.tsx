import type { ReactNode } from "react"
import GenericPaper from "./GenericPaper"
import { Container, Grid, type Breakpoint, type ContainerProps, type GridProps, type PaperProps } from "@mui/material"

export interface GenericContainerProps extends ContainerProps {
    children?: ReactNode,
    paperProps?: PaperProps
}

export const GenericContainer = ({ children, paperProps = {}, ...props }: GenericContainerProps) => {
    return (
        <Container {...props}>
            <GenericPaper {...paperProps} >
                {children}
            </GenericPaper>
        </Container>
    )
}


interface ContainerWithSidebarProps {
    sidebarComponent: ReactNode | null,
    containerSize?: false | Breakpoint,
    rootGridProps?: GridProps,
    mainGridProps?: GridProps,
    sidebarGridProps?: GridProps,
    children?: ReactNode,
}

const ContainerWithSidebar = ({ rootGridProps, mainGridProps, sidebarGridProps, sidebarComponent, containerSize, children }: ContainerWithSidebarProps) => {
    return (
        <Container maxWidth={sidebarComponent ? false : containerSize ?? "lg"}>
            <Grid container spacing={2} {...rootGridProps} >
                <Grid size="grow" sx={{ minWidth: "30rem" }} {...mainGridProps}>
                    <GenericPaper>
                        {children}
                    </GenericPaper>
                </Grid>
                {sidebarComponent &&
                    <Grid size={5} sx={{ minWidth: "30rem" }} {...sidebarGridProps}>
                        <GenericPaper>
                            {sidebarComponent}
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}

export default ContainerWithSidebar
