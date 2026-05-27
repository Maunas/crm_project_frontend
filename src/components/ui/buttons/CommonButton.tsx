import { cloneElement, type ComponentProps, type ReactNode } from 'react';
import ACTION_ICONS, { type ActionType } from './ActionIcons';
import type { ColorTypes } from 'src/types/mui-theme.d';
import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ChipTooltip } from '../details/ChipTooltip';


type MuiButtonProps = ComponentProps<typeof Button>;

export interface CommonBtnProps extends MuiButtonProps {
    actionType?: ActionType,
    loading?: boolean,
    children?: ReactNode,
    //Se pasan en btnProps
    component?: React.ElementType,
    to?: string,
    onlyTooltip?: boolean
}

/**Version de Button que aclara el texto en outlined (dark mode) para aumentar su legibilidad.  */
const LightButton = styled(Button)(({ theme, color = "primary", variant = "contained" }) => {
    if (variant !== "outlined") return []
    return [
        theme.applyStyles('dark', {
            color: theme.palette[color as ColorTypes].light
        }
        )]
})
/**
 * Componente basado en Button, que agrega un ícono a su contenido segun el tipo de acción
 */
const CommonButton = ({ actionType = "NONE", onlyTooltip = false, loading = false, children, ...btnProps }: CommonBtnProps) => {

    const color = btnProps.color === "inherit" ? "primary" : (btnProps.color ?? "primary")

    const styleIcon = (actionType: ActionType) => {
        if (actionType === "NONE") return ACTION_ICONS.NONE
        return cloneElement(
            ACTION_ICONS[actionType],
            { fontSize: btnProps.size, sx: { ml: 0 } }
        )
    }

    const actionIcon = loading ? styleIcon("LOADING") : styleIcon(actionType)

    if (onlyTooltip) return (
        <ChipTooltip title={children} color={color} >
            <LightButton variant='contained' disabled={loading} {...btnProps}>
                <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center", textAlign: "center" }}>
                    {actionIcon}
                </Stack>
            </LightButton>
        </ChipTooltip>
    )

    return (
        <LightButton variant='contained' disabled={loading} {...btnProps}>
            <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center", textAlign: "center" }}>
                {actionIcon}
                {loading ? "Cargando" : children}
            </Stack>
        </LightButton>
    )
}

export default CommonButton