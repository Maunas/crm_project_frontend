import { Button, Container, Modal, Paper, type Breakpoint } from '@mui/material'
import { useState, type ReactNode } from 'react'


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
            <Paper sx={{ paddingInline: 4, paddingBlock: 2, width: "100%", ...paperSx }} {...props}>
                {children}
            </Paper>
    )
}

interface GenericModalProps extends GenericContainerProps {
    buttonText: string,
    buttonProps?: object,
}

export const GenericModal = ({ buttonText, buttonProps = {}, maxWidth = "lg", containerSx = {}, paperSx = {}, children }: GenericModalProps) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return (
        <div>
            {<Button {...buttonProps} onClick={handleOpen}>{buttonText}</Button>}
            <Modal
                open={open}
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
        </div>
    )
}
