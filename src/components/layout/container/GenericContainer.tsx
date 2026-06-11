import { type ReactNode } from "react"
import GenericPaper from "./GenericPaper"
import { Container, Divider, Drawer, Stack, useMediaQuery, useTheme, type Breakpoint, type ContainerProps, type DrawerProps, type PaperProps, Box, Typography } from "@mui/material"
import { CommonIconButton } from "src/components/ui/buttons/CommonIconButton"

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
    noPaper?: boolean,
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
                    "data-noborder": true,
                    elevation: 1,
                    sx: {
                        minHeight: '100vh',
                        width: sidebarWidth ?? '40rem',
                        height: "100%",
                        overflowY: "auto",
                        position: "fixed",
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
            <CommonIconButton actionType="CLOSE" title="Cerrar" onClick={closeSidebar}
                sx={{ position: "absolute", top: "3rem", right: "2rem", transform: "translateY(-50%)" }} />
            {sidebarComponent}
        </Drawer >
    )
}

interface SidebarContentWrapperProps {
    title?: ReactNode,
    subtitle?: ReactNode,
    children?: ReactNode,
}

export const SidebarContentWrapper = ({ title, subtitle, children }: SidebarContentWrapperProps) => {
    return (
        <Stack spacing={2} useFlexGap>
            <Box sx={{ m: "-1.5rem -2rem 0" }}>
                <Stack sx={{ p: "1rem 1.5rem", height: "6rem", justifyContent: "center" }}>
                    <Typography variant="subtitle2" color="textSecondary"
                        sx={{ textTransform: "uppercase", fontWeight: "bold" }} >{subtitle}</Typography>
                    <Typography variant="h2" >{title}</Typography>
                </Stack>
                <Divider />
            </Box >
            <Box sx={{ flexGrow: 1 }}>
                {children}
            </Box>
        </Stack >
    )
}

const ContainerWithSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarProps, sidebarComponent, containerSize, sidebarWidth, noPaper = false, ...props }: ContainerWithSidebarProps) => {
    return (
        <>
            <Container maxWidth={containerSize ?? "lg"} {...(noPaper ? {} : { component: GenericPaper })} >
                {props.children}
            </Container>
            <GenericSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} sidebarProps={sidebarProps}
                sidebarComponent={sidebarComponent} sidebarWidth={sidebarWidth} {...props} />
        </>
    )
}

export default ContainerWithSidebar
