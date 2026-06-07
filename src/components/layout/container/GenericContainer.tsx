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
}

export const GenericSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, sidebarWidth }: ContainerWithSidebarProps) => {

    const { breakpoints } = useTheme()

    const mdScreen = useMediaQuery(breakpoints.down('md'));

    return (
        <Drawer open={isSidebarOpen} onClose={closeSidebar} anchor={mdScreen ? "bottom" : "right"}
            sx={{
                zIndex: 1202,
                '& .MuiDrawer-paper': {
                    minHeight: '100vh',
                    width: sidebarWidth ?? '45rem',
                    [breakpoints.down('md')]: {
                        width: '100vw',
                    },
                },
            }}  {...sidebarProps}
            ModalProps={{ keepMounted: true }}>
            <GenericPaper sx={{
                height: "100%", minHeight: "100vh", width: "100%", overflowY: "auto", borderRadius: 0,
            }}>
                {isSidebarOpen && sidebarComponent}
            </GenericPaper>
        </Drawer >
    )
}


const ContainerWithSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, containerSize, sidebarWidth, children }: ContainerWithSidebarProps) => {

    return (
        <>
            <Container maxWidth={containerSize ?? "lg"} component={GenericPaper}>
                {children}
            </Container>
            <GenericSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} sidebarProps={sidebarProps}
                sidebarComponent={sidebarComponent} sidebarWidth={sidebarWidth} />
        </>
    )
}

export default ContainerWithSidebar
