import { memo } from "react"
import CommonButton, { type CommonBtnProps } from "src/components/ui/buttons/CommonButton"
import { Dialog, type DialogProps } from "@mui/material"
import GenericPaper from "./GenericPaper"

interface GenericModalProps extends Omit<DialogProps, "open"> {
    idModal: string | number,
    modalProps: {
        open: boolean | string | number,
        handleOpen: (idModal: string | number) => void,
        handleClose: () => void
    },
    showButton?: boolean,
    buttonText?: string,
    btnProps?: CommonBtnProps,
}

const GenericModal = memo(({ idModal, modalProps: { open, handleOpen, handleClose }, showButton = true, buttonText = "Abrir Modal", children, btnProps = {}, ...props
}: GenericModalProps) => {
    return (
        <>
            {showButton &&
                <CommonButton {...btnProps}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleOpen(idModal)
                    }}>
                    {buttonText}
                </CommonButton>
            }
            <Dialog
                {...props}
                onClick={(e) => e.stopPropagation()}
                onClose={handleClose}
                open={open === idModal}
                slotProps={{
                    backdrop: { onClick: (e) => e.stopPropagation() }
                }}
            >
                <GenericPaper>
                    {children}
                </GenericPaper>
            </Dialog>
        </>
    )
})

export default GenericModal