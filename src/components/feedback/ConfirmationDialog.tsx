import { memo, useState, type ReactNode } from "react"
import CommonButton from "shared/ui/buttons/CommonButton"
import { type DialogProps, ButtonGroup, Stack, LinearProgress } from "@mui/material"
import GenericModal from "../layout/container/GenericModal"

interface ConfirmationDialogProps extends Omit<DialogProps, "open"> {
    idModal: string,
    openModalId?: string,
    handleOpen?: (idModal: string) => void,
    handleClose: () => void
    open?: boolean,
    onCancel?: () => void,
    onConfirm: () => Promise<void>,
    confirmTimeoutSec?: number,
    confirmText?: string,
    closeText?: string,
    noTimeout?: boolean
    children?: ReactNode,
}

/**
 * Componente de Dialog, para ser usado con useModal. Incluye un botón de apertura.
 * @param onCancel Función a ejecutar al presionar el botón "Cerrar". Siempre cierra el modal al final.
 * @param onConfirm Función a ejecutar al confirmar la acción. Se aplica por defecto tras un timeout, y cierra el modal.
 * @param confirmTimeoutSec Tiempo de espera antes de ejecutar la confirmación. Se puede cancelar.
 * @param noTimeout De ser true, se realiza la confirmación instantaneamente.
 */
const ConfirmationDialog = memo(({ idModal, open = false, openModalId, handleOpen, handleClose,
    onCancel = () => { }, onConfirm, confirmTimeoutSec = 3, noTimeout = false, confirmText, closeText, children, ...props
}: ConfirmationDialogProps) => {

    const [currentTimeout, setCurrentTimeout] = useState<number | undefined>(undefined)

    const [count, setCount] = useState<number>(confirmTimeoutSec)
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
        if (noTimeout) return doAction()
        const timeout = setTimeout(doAction, confirmTimeoutSec * 1000)
        const interval = setInterval(() => setCount(i => Math.max(0, i - .25)), 250)
        setCurrentTimeout(timeout)
        setCurrentInterval(interval)
    }

    const cancelTimeout = () => {
        clearTimeout(currentTimeout)
        setCurrentTimeout(undefined)
        clearInterval(currentInterval)
        setCurrentInterval(undefined)
        setCount(confirmTimeoutSec)
    }

    const normalizedProgress = Math.min(((confirmTimeoutSec - count + .25) * 100 / confirmTimeoutSec), 100)

    return (
        <GenericModal idModal={idModal}
            open={open}
            openModalId={openModalId}
            handleOpen={handleOpen}
            handleClose={handleClose}
            showButton={false}
            maxWidth="sm"
            fullWidth
            {...props}>
            <Stack spacing={2}>
                {children}
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton variant="text" onClick={handleConfirmationClose}>
                        {closeText ?? "Cerrar"}
                    </CommonButton>
                    {(!currentTimeout || noTimeout) &&
                        <CommonButton actionType="CHECK" onClick={handleConfirmationConfirm}>
                            {confirmText ?? "Confirmar"}
                        </CommonButton>
                    }
                    {(currentTimeout && !noTimeout) &&
                        <CommonButton actionType="CLOSE" color="error" variant="outlined" onClick={cancelTimeout}
                            sx={{ position: "relative", overflow: "hidden" }}>
                            Cancelar ({Math.round(count)} s.)
                            <LinearProgress
                                variant="determinate"
                                aria-busy color="error"
                                value={normalizedProgress}
                                sx={{ position: "absolute", bottom: 0, left: 0, width: "100%" }}
                            />
                        </CommonButton>
                    }
                </ButtonGroup>
            </Stack>
        </GenericModal>
    )
})

export default ConfirmationDialog