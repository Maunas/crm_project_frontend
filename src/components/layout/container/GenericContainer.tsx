import { type ReactNode } from "react"
import GenericPaper from "./GenericPaper"
import { GenericSidebarContent, GenericSidebarHeader } from "./GenericSidebarHeader"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { Container, Divider, Drawer, Stack, useMediaQuery, useTheme, type Breakpoint, type ContainerProps, type DrawerProps, type PaperProps, Typography, Box } from "@mui/material"

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

    const theme = useTheme()

    const mdScreen = useMediaQuery(theme.breakpoints.down('md'));

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
                    sx: [{
                        minHeight: '100vh',
                        width: sidebarWidth ?? '40rem',
                        height: "100%",
                        position: "fixed",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        borderRadius: 0,
                        [theme.breakpoints.down('md')]: {
                            width: '100vw',
                            borderLeft: "none",
                        },
                    },
                    theme.applyStyles("light", {
                        backgroundColor: theme.palette.background.default
                    })]
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
    avatar?: ReactNode,
    actions?: ReactNode,
    children?: ReactNode,
}
/**Wrapper que le agrega al contenido de un sidebar un header formateado.
 * Si se asigna actions, se muestran en un footer, si no, se deja solo el contenido.
 */
export const SidebarContentWrapper = ({ title, subtitle, avatar, actions, children }: SidebarContentWrapperProps) => {
    return (
        <Stack spacing={2} sx={{ height: "100%" }} useFlexGap>
            <GenericSidebarHeader >
                <Stack direction="row" spacing={2} sx={{ p: "1rem 4rem 1rem 1.5rem", height: "6rem", alignItems: "center" }}>
                    {avatar}
                    <Stack>
                        <Typography variant="subtitle2" color="textSecondary"
                            sx={{ textTransform: "uppercase", fontWeight: "bold" }} >{subtitle}</Typography>
                        <Typography variant="h2" >{title}</Typography>
                    </Stack>
                </Stack>
                <Divider />
            </GenericSidebarHeader >
            <GenericSidebarContent >
                {actions ?
                    <SidebarContentActionsWrapper actions={actions}>
                        {children}
                    </SidebarContentActionsWrapper>
                    : children}
            </GenericSidebarContent >
        </Stack >
    )
}
/**Contenedor que permite formatear el contenido solo de un Sidebar, sin el header.
 * Sirve como un contenedor utilizable incluso fuera de un sidebar, ya que no afecta el contenido.
 */
export const SidebarContentActionsWrapper = ({ actions, children }: { actions?: ReactNode, children: ReactNode }) => {
    return (
        <Stack sx={{ height: "100%" }}>
            <Box className="sidebar-content">
                {children}
            </Box>
            {actions &&
                <Box className="sidebar-footer">{actions}</Box>}
        </Stack>
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
