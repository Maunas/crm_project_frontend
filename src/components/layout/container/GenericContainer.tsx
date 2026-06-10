import { type ReactNode } from "react"
import GenericPaper from "./GenericPaper"
import { Container, Drawer, useMediaQuery, useTheme, type Breakpoint, type ContainerProps, type DrawerProps, type PaperProps } from "@mui/material"

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
    closeSidebar: () => void,
    sidebarComponent: ReactNode,
    containerSize?: false | Breakpoint,
    sidebarWidth?: string,
    sidebarProps?: DrawerProps,
    children?: ReactNode,
    noPaper?: boolean
}

export const GenericSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, sidebarWidth }: ContainerWithSidebarProps) => {

    const { breakpoints, palette } = useTheme()

    const mdScreen = useMediaQuery(breakpoints.down('md'));

    return (
        <Drawer
            open={isSidebarOpen}
            onClose={closeSidebar}
            anchor={mdScreen ? "bottom" : "right"}
            slotProps={{
                paper: {
                    component: GenericPaper,
                    noBorder: true,
                    elevation: 1,
                    sx: {
                        minHeight: '100vh',
                        width: sidebarWidth ?? '45rem',
                        height: "100%",
                        overflowY: "auto",
                        borderLeft: `1px solid ${palette.divider}`,
                        borderRadius: 0,
                        [breakpoints.down('md')]: {
                            width: '100vw',
                            borderLeft: "none",
                        },
                    }
                }
            }}
            sx={{ zIndex: 1202 }}
            {...sidebarProps}
        >
            {isSidebarOpen && sidebarComponent}
        </Drawer >
    )
}

const ContainerWithSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, containerSize, sidebarWidth, noPaper = false, children }: ContainerWithSidebarProps) => {
    return (
        <>
            <Container maxWidth={containerSize ?? "lg"} {...(noPaper ? {} : { component: GenericPaper })} >
                {children}
            </Container>
            <GenericSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} sidebarProps={sidebarProps}
                sidebarComponent={sidebarComponent} sidebarWidth={sidebarWidth} />
        </>
    )
}

export default ContainerWithSidebar
