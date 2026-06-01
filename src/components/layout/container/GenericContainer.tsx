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

const ContainerWithSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, containerSize, sidebarWidth, children }: ContainerWithSidebarProps) => {

    const { breakpoints } = useTheme()

    const mdScreen = useMediaQuery(breakpoints.down('md'));

    return (
        <>
            <Container maxWidth={containerSize ?? "lg"} component={GenericPaper}>
                {children}
            </Container>
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
        </>
    )
}

export default ContainerWithSidebar
