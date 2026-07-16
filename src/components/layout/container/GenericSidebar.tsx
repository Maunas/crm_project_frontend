import { type ReactNode } from "react"
import { GenericSidebarContent, GenericSidebarHeader } from "./ColoredHeaders"
import GenericPaper from "./GenericPaper"
import { CommonIconButton } from "shared/ui/buttons/CommonIconButton"
import { Divider, Drawer, Stack, useMediaQuery, useTheme, type DrawerProps, Typography, Box, styled } from "@mui/material"
import { CustomAvatar } from "src/components/ui/details/CustomAvatar"

const SidebarPaper = styled(GenericPaper)({ padding: 0 })

interface GenericSidebarProps extends DrawerProps {
    isSidebarOpen?: boolean,
    closeSidebar: () => void,
    children: ReactNode,
    sidebarWidth?: string
}
export const GenericSidebar = ({ isSidebarOpen = false, closeSidebar, children, sidebarWidth, ...props }: GenericSidebarProps) => {

    const theme = useTheme()

    const mdScreen = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Drawer
            open={isSidebarOpen}
            onClose={closeSidebar}
            anchor={mdScreen ? "bottom" : "right"}
            slotProps={{
                paper: {
                    component: SidebarPaper,
                    "data-noborder": true,
                    elevation: 0,
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
                        backgroundColor: theme.palette.contrast[50]
                    })]
                }
            }}
            sx={{ zIndex: 1202 }}
            {...props}
        >
            <CommonIconButton actionType="CLOSE" title="Cerrar" onClick={closeSidebar}
                sx={{ position: "absolute", top: "3rem", right: "2rem", transform: "translateY(-50%)" }} />
            {children}
        </Drawer >
    )
}

interface SidebarContentWrapperProps {
    title?: ReactNode,
    subtitle?: ReactNode,
    icon?: ReactNode,
    actions?: ReactNode,
    children?: ReactNode,
    iconColor?: string
}
/**Wrapper que le agrega al contenido de un sidebar un header formateado.
 * Si se asigna actions, se muestran en un footer, si no, se deja solo el contenido.
 */
export const SidebarContentWrapper = ({ title, subtitle, icon, actions, iconColor, children }: SidebarContentWrapperProps) => {

    return (
        <Stack spacing={2} sx={{ height: "100%" }} useFlexGap>
            <GenericSidebarHeader color={iconColor} >
                <Stack direction="row" spacing={2} sx={{ p: "1rem 4rem 1rem 1.5rem", height: "6rem", alignItems: "center" }}>
                    <CustomAvatar color={iconColor}>{icon}</CustomAvatar>
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
        <Stack sx={{ minHeight: "100%" }}>
            <Box className="sidebar-content">
                {children}
            </Box>
            {actions &&
                <Box className="sidebar-footer">{actions}</Box>}
        </Stack>
    )
}
