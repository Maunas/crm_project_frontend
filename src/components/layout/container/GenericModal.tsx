import { memo, type ReactNode } from "react"
import CommonButton, { type CommonBtnProps } from "shared/ui/buttons/CommonButton"
import { Dialog, type DialogProps } from "@mui/material"
import GenericPaper from "./GenericPaper"

interface GenericModalProps extends Omit<DialogProps, "open"> {
    idModal: string,
    modalProps: {
        openModalId?: string,
        handleOpen?: (idModal: string) => void,
        handleClose: () => void
    },
    open?: boolean,
    showButton?: boolean,
    buttonText?: string,
    btnProps?: CommonBtnProps,
    children?: ReactNode
}

/**
 * Componente de Dialog, para ser usado con useModal. Incluye un botón de apertura.
 * @param idModal Define un id para manejar la apertura del modal.
 * @param modelProps Provienen de useModal para manejar su estado.
 * @param open Booleano que (en true) ignora la comparación de idModal para abrirlo.
 * @param showButton Booleano, define si renderiza el botón de apertura.
 */
const GenericModal = memo(({ idModal, open = false, modalProps: { openModalId, handleOpen, handleClose }, children,
    showButton = true, buttonText = "Abrir Modal", btnProps = {}, ...props
}: GenericModalProps) => {
    return (
        <>
            {showButton && handleOpen &&
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
                open={openModalId === idModal || open}
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