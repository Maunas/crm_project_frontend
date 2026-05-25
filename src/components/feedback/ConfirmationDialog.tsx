import { memo, useState, type ReactNode } from "react"
import CommonButton from "shared/ui/buttons/CommonButton"
import { DialogActions, type DialogProps, ButtonGroup } from "@mui/material"
import GenericModal from "../layout/container/GenericModal"

interface ConfirmationDialogProps extends Omit<DialogProps, "open"> {
    idModal: string,
    openModalId?: string,
    handleOpen?: (idModal: string) => void,
    handleClose: () => void
    open?: boolean,
    onCancel?: () => void,
    onConfirm: () => Promise<void>,
    children?: ReactNode
}

/**
 * Componente de Dialog, para ser usado con useModal. Incluye un botón de apertura.
 */
const ConfirmationDialog = memo(({ idModal, open = false, openModalId, handleOpen, handleClose,
    onCancel = () => { }, onConfirm, children, ...props
}: ConfirmationDialogProps) => {

    const [currentTimeout, setCurrentTimeout] = useState<number | undefined>(undefined)

    const [count, setCount] = useState<number>(5)
    const [currentInterval, setCurrentInterval] = useState<number | undefined>(undefined)


    const handleConfirmationClose = () => {
        if (onCancel) onCancel()
        handleClose()
    }

    const handleConfirmationConfirm = () => {
        const doAction = () => {
            return onConfirm()
                .then(() => {
                    handleClose()
                })
                .finally(() => {
                    cancelTimeout()
                })
        }

        const timeout = setTimeout(doAction, 5000)
        const interval = setInterval(() => setCount(i => Math.max(0, i - 1)), 1000)
        setCurrentTimeout(timeout)
        setCurrentInterval(interval)
    }

    const cancelTimeout = () => {
        clearTimeout(currentTimeout)
        setCurrentTimeout(undefined)
        clearInterval(currentInterval)
        setCurrentInterval(undefined)
        setCount(5)
    }

    return (
        <GenericModal idModal={idModal}
            open={open}
            openModalId={openModalId}
            handleOpen={handleOpen}
            handleClose={handleClose}
            showButton={false}
            {...props}>
            {children}
            <DialogActions>
                <ButtonGroup variant="text">
                    <CommonButton actionType="CLOSE" variant="text" onClick={handleConfirmationClose}>
                        Cerrar
                    </CommonButton>
                    {!currentTimeout &&
                        <CommonButton actionType="SAVE" onClick={handleConfirmationConfirm}>
                            Confirmar
                        </CommonButton>}
                    {currentTimeout &&
                        <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={cancelTimeout}>
                            Cancelar ({count} s.)
                        </CommonButton>}
                </ButtonGroup>
            </DialogActions>
        </GenericModal>
    )
})

export default ConfirmationDialog