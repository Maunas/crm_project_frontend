import { memo, useCallback, useRef, useState, type ReactNode } from "react"
import CommonButton from "shared/ui/buttons/CommonButton"
import { type DialogProps, ButtonGroup, Stack, LinearProgress, Typography } from "@mui/material"
import GenericModal from "../layout/container/GenericModal"
import type { DisableableEntity } from "src/types/shared"

interface GenericConfirmDialogProps extends Omit<DialogProps, "open"> {
    idModal: string,
    openModalId?: string,
    handleOpen?: (idModal: string) => void,
    handleClose: () => void
    open?: boolean,
    onCancel?: () => void,
    onConfirm: () => Promise<void>,
    confirmTimeoutSec?: number,
    noTimeout?: boolean,
    confirmText?: string,
    closeText?: string,
    children?: ReactNode,
}

/**
 * Componente de Dialog para confirmación, de uso genérico.
 * @param onCancel Función a ejecutar al presionar el botón "Cerrar". Siempre cierra el modal al final.
 * @param onConfirm Función a ejecutar al confirmar la acción. Se aplica por defecto tras un timeout, y cierra el modal.
 * @param confirmTimeoutSec Tiempo de espera antes de ejecutar la confirmación. Se puede cancelar.
 * @param noTimeout De ser true, se realiza la confirmación instantaneamente.
 */
export const GenericConfirmDialog = memo(({ idModal, open = false, openModalId, handleOpen, handleClose,
    confirmTimeoutSec = 3, noTimeout = false, onCancel = () => { }, onConfirm, confirmText, closeText,
    children, ...props
}: GenericConfirmDialogProps) => {


    const [count, setCount] = useState<number>(confirmTimeoutSec)
    const [activeTimeout, setActiveTimeout] = useState<boolean>(false)
    const currentTimeout = useRef<number | undefined>(undefined)
    const currentInterval = useRef<number | undefined>(undefined)

    const handleDialogClose = useCallback(() => {
        if (onCancel) onCancel()
        handleClose()
    }, [handleClose, onCancel])

    const handleDialogConfirm = () => {
        const finishTimeout = () => {
            return onConfirm()
                .then(handleDialogClose)
                .finally(cancelTimeout)
        }

        if (noTimeout) return finishTimeout()
        setActiveTimeout(true)
        currentTimeout.current = setTimeout(finishTimeout, confirmTimeoutSec * 1000)
        currentInterval.current = setInterval(() => setCount(i => Math.max(0, i - .25)), 250)
    }

    const cancelTimeout = useCallback(() => {
        clearTimeout(currentTimeout.current)
        clearInterval(currentInterval.current)
        currentTimeout.current = undefined
        currentInterval.current = undefined
        setCount(confirmTimeoutSec)
        setActiveTimeout(false)
    }, [confirmTimeoutSec])

    const normalizedProgress = Math.min(((confirmTimeoutSec - count + .25) * 100 / confirmTimeoutSec), 100)

    return (
        <GenericModal idModal={idModal}
            open={open}
            openModalId={openModalId}
            handleOpen={handleOpen}
            handleClose={handleDialogClose}
            showButton={false}
            maxWidth="sm"
            fullWidth
            {...props}>
            <Stack spacing={2}>
                {children}
                <ButtonGroup sx={{ alignSelf: "end" }}>
                    <CommonButton variant="text" onClick={handleDialogClose}>
                        {closeText ?? "Cerrar"}
                    </CommonButton>
                    {(!activeTimeout || noTimeout) &&
                        <CommonButton actionType="CHECK" onClick={handleDialogConfirm}>
                            {confirmText ?? "Confirmar"}
                        </CommonButton>
                    }
                    {(activeTimeout && !noTimeout) &&
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


interface DisableConfirmDialog<T extends DisableableEntity> extends Omit<DialogProps, "open"> {
    entity: T | null,
    clearEntity: () => void,
    idModal: string,
    onCancel?: () => void,
    onConfirm: () => Promise<void>,
    entityTypeName?: string,
    onlyDelete?: boolean,
    title?: string,
}

const DISABLE_TIMEOUT_SEC = 3

/**
 * Componente de Dialog de Confirmación, específicamente para habilitar/deshabilitar una entidad.
 * @param onCancel Función a ejecutar al presionar el botón "Cerrar". Siempre cierra el modal al final.
 * @param onConfirm Función a ejecutar al confirmar la acción. Se aplica por defecto tras un timeout, y cierra el modal.
 * @param entityTypeName tipo de entidad, con su artículo. Ej: "la campaña"
 * @param onlyDelete flag, modifica el contenido para solo mencionar la eliminación.
 * 
 * @example <DisableConfirmDialog idModal='conf-id' entity={deletingCmp} 
 * clearEntity={() => setDeletingCmp(null)} entityTypeName="la campaña" 
 * onConfirm={() => handleActiveCampaign(deletingCmp!)} />
 */
export const DisableConfirmDialog = <T extends DisableableEntity,>({ entity, clearEntity, idModal, onCancel, onConfirm,
    entityTypeName = "la entidad", onlyDelete = false }: DisableConfirmDialog<T>) => {

    const titleAction = `${onlyDelete ? "eliminar"
        : (entity?.active ? "deshabilitar" : "habilitar")}`

    const dialogTitle = `¿Desea ${titleAction} ${entityTypeName}${entity?.name && ` "${entity.name}"`}?`

    const dialogSubtitle = onlyDelete ? "El elemento se eliminará definitivamente del sistema."
        : entity?.active ?
            "Si no tiene elementos asignados, se eliminará definitivamente del sistema."
            : "Si lo habilita, será accesible a todo usuario autorizado."

    return (
        <GenericConfirmDialog idModal={idModal} open={Boolean(entity)} handleClose={clearEntity}
            onCancel={onCancel} onConfirm={onConfirm} confirmTimeoutSec={DISABLE_TIMEOUT_SEC}>
            {entity && <>
                <Typography variant="h3">{dialogTitle}</Typography>
                <Typography variant="body1">{dialogSubtitle}</Typography>
            </>}
        </GenericConfirmDialog>
    )
}
