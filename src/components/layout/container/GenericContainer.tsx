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
    isSidebarOpen?: boolean,
    sidebarComponent: ReactNode,
    containerSize?: false | Breakpoint,
    rootGridProps?: GridProps,
    mainGridProps?: GridProps,
    sidebarGridProps?: GridProps,
    children?: ReactNode,
}

const ContainerWithSidebar = ({ isSidebarOpen = false, rootGridProps, mainGridProps, sidebarGridProps, sidebarComponent, containerSize, children }: ContainerWithSidebarProps) => {

    return (
        <Container maxWidth={isSidebarOpen ? false : containerSize ?? "lg"}>
            <Grid container spacing={3} {...rootGridProps} >
                <Grid size="grow" sx={{ minWidth: "30rem" }} {...mainGridProps}>
                    <GenericPaper>
                        {children}
                    </GenericPaper>
                </Grid>
                {isSidebarOpen &&
                    <Grid size={5} sx={{ minWidth: "30rem" }} {...sidebarGridProps}>
                        <GenericPaper elevation={1}>
                            {sidebarComponent}
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}

export default ContainerWithSidebar
