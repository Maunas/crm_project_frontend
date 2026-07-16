import { type ReactNode } from "react"
import GenericPaper from "./GenericPaper"
import { Container, type Breakpoint, type ContainerProps, type DrawerProps, type PaperProps, type ContainerOwnProps } from "@mui/material"
import { GenericSidebar } from "./GenericSidebar"

export { GenericSidebar, SidebarContentWrapper, SidebarContentActionsWrapper } from "./GenericSidebar"

export interface GenericContainerProps extends ContainerProps {
    children?: ReactNode,
    paperProps?: PaperProps
    noPaper?: boolean,
    containerSize?: ContainerOwnProps["maxWidth"]
}

export const GenericContainer = ({ children, containerSize, noPaper = false, paperProps = {}, ...props }: GenericContainerProps) => {
    return (
        <Container maxWidth={containerSize === undefined ? "lg" : containerSize}
            {...(noPaper ? {} : { component: GenericPaper, ...paperProps })}
            {...props}>
            {children}
        </Container>
    )
}

interface ContainerWithSidebarProps {
    isSidebarOpen?: boolean,
    closeSidebar: () => void,
    sidebarComponent: ReactNode,
    sidebarWidth?: string,
    sidebarProps?: DrawerProps,
    containerSize?: false | Breakpoint,
    containerProps?: ContainerProps,
    noPaper?: boolean,
    children?: ReactNode,
}

const ContainerWithSidebar = ({ isSidebarOpen = false, closeSidebar, sidebarComponent, sidebarProps, sidebarWidth,
    containerSize, containerProps, noPaper = false, children }: ContainerWithSidebarProps) => {
    return (
        <>
            <GenericContainer containerSize={containerSize} noPaper={noPaper}  {...containerProps} >
                {children}
            </GenericContainer>
            <GenericSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar}
                sidebarWidth={sidebarWidth} {...sidebarProps} >
                {sidebarComponent}
            </GenericSidebar>
        </>
    )
}

export default ContainerWithSidebar
