import { Container, Grid, Modal, Paper, type Breakpoint } from '@mui/material'
import { type ComponentProps, type ReactNode } from 'react'
import { CommonButton } from '../details/DetailsCommonButton'


interface GenericContainerProps {
    children: ReactNode,
    maxWidth?: false | Breakpoint | undefined,
    containerSx?: object,
    paperSx?: object
}

export const GenericContainer = ({ children, maxWidth = "lg", containerSx = {}, paperSx = {}, ...props }: GenericContainerProps) => {

    return (
        <Container sx={{ ...containerSx }} maxWidth={maxWidth} {...props}>
            <Paper sx={{ paddingInline: 4, paddingBlock: 2, width: "100%", ...paperSx }}>
                {children}
            </Paper>
        </Container>
    )
}

export const GenericPaper = ({ children, paperSx = {}, ...props }: GenericContainerProps) => {

    return (
        <Paper sx={{ paddingInline: 5, paddingBlock: 3, width: "100%", ...paperSx }} {...props}>
            {children}
        </Paper>
    )
}

interface GenericModalProps extends GenericContainerProps, ComponentProps<typeof CommonButton> {
    buttonText: string,
    modalProps: {
        open: boolean | string | number,
        handleOpen: (idModal: string | number) => void,
        handleClose: () => void
    },
    idModal: string | number,
    showButton?: boolean,
}

export const GenericModal = ({ idModal, modalProps: { open, handleOpen, handleClose }, showButton = true,
    buttonText, maxWidth = "lg", containerSx = {}, paperSx = {}, children, actionType, ...btnProps
}: GenericModalProps) => {
    return (
        <>
            {showButton &&
                <CommonButton handleClick={() => handleOpen(idModal)} actionType={actionType} {...btnProps}>
                    {buttonText}
                </CommonButton>
            }
            <Modal
                open={open === idModal}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <GenericContainer maxWidth={maxWidth} paperSx={{ overflowY: "auto", maxHeight: "95vh", ...paperSx }}
                    containerSx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", ...containerSx }}
                >
                    {children}
                </GenericContainer>
            </Modal>
        </>
    )
}

interface ContainerWithSidebarProps {
    isSidebarOpen: boolean,
    rootGridProps?: object,
    mainGridProps?: object,
    sidebarGridProps?: object,
    sidebarComponent: ReactNode,
    containerSize?: false | Breakpoint,
    children: ReactNode,
}

export const ContainerWithSidebar = ({ isSidebarOpen, rootGridProps, mainGridProps, sidebarGridProps, sidebarComponent, containerSize, children }: ContainerWithSidebarProps) => {
    return (
        <Container maxWidth={isSidebarOpen ? false : containerSize ?? "lg"}>
            <Grid container spacing={2} {...rootGridProps}>
                <Grid size="grow" minWidth="30rem" {...mainGridProps}>
                    <GenericPaper>
                        {children}
                    </GenericPaper>
                </Grid>
                {isSidebarOpen &&
                    <Grid size={5} minWidth="30rem" {...sidebarGridProps}>
                        <GenericPaper>
                            {sidebarComponent}
                        </GenericPaper>
                    </Grid>}
            </Grid>
        </Container>
    )
}
