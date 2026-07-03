import { memo, type ReactNode } from "react"
import CommonButton, { type CommonBtnProps } from "shared/ui/buttons/CommonButton"
import { Box, Dialog, Stack, Typography, type DialogProps } from "@mui/material"
import { CommonIconButton } from "src/components/ui/buttons/CommonIconButton"
import { CustomAvatar } from "src/components/ui/details/CustomAvatar"
import GenericPaper from "./GenericPaper"
import { GenericPaperColoredSection } from "./ColoredHeaders"

interface GenericModalProps extends Omit<DialogProps, "open"> {
    idModal: string,
    openModalId?: string,
    handleOpen?: (idModal: string) => void,
    handleClose: () => void,
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
const GenericModal = memo(({ idModal, open = false, openModalId, handleOpen, handleClose, children,
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
                    backdrop: { onClick: (e) => e.stopPropagation() },
                    paper: {
                        component: GenericPaper,
                        elevation: 0,
                    }
                }}>
                {children}
            </Dialog>
        </>
    )
})

export default GenericModal

interface ModalContentWrapperProps {
    title?: ReactNode,
    subtitle?: ReactNode,
    icon?: ReactNode,
    actions?: ReactNode,
    children?: ReactNode,
    iconColor?: string,
    onClose?: () => void,
}

export const ModalContentWrapper = ({ title, subtitle, icon, actions, iconColor, children, onClose }: ModalContentWrapperProps) => {
    return (
        <Stack spacing={2}>
            <GenericPaperColoredSection color={iconColor} isFirst>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                        {icon && <CustomAvatar color={iconColor}>{icon}</CustomAvatar>}
                        <Stack>
                            {subtitle &&
                                <Typography variant="subtitle2" color="textSecondary"
                                    sx={{ textTransform: "uppercase", fontWeight: "bold" }}>
                                    {subtitle}
                                </Typography>}
                            {title && <Typography variant="h2">{title}</Typography>}
                        </Stack>
                    </Stack>
                    {onClose && <CommonIconButton actionType="CLOSE" onClick={onClose} />}
                </Stack>
            </GenericPaperColoredSection>
            {actions ?
                <ModalContentActionsWrapper actions={actions}>
                    {children}
                </ModalContentActionsWrapper>
                : children}
        </Stack>
    )
}

interface ModalContentActionsWrapperProps {
    actions?: ReactNode,
    children: ReactNode,
}

export const ModalContentActionsWrapper = ({ actions, children }: ModalContentActionsWrapperProps) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            {actions &&
                <Box sx={theme => ({
                    margin: "1rem -2rem -1.5rem",
                    padding: "1rem 2rem",
                    minHeight: "5rem",
                    display: "flex",
                    justifyContent: "end",
                    alignItems: "center",
                    borderTop: 1,
                    borderColor: "divider",
                    backgroundColor: theme.alpha(theme.palette.background.default, .5),
                    ...theme.applyStyles("dark",
                        {
                            backgroundColor: theme.palette.background.paper,
                        }
                    )
                })}>
                    {actions}
                </Box>}
        </Box>
    )
}