import { cloneElement, type ComponentProps, type ReactNode } from 'react';
import ACTION_ICONS, { type ActionType } from './ActionIcons';
import type { ColorTypes } from 'src/types/mui-theme.d';
import type { LinkProps } from 'react-router-dom';
import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import { ChipTooltip } from '../details/ChipTooltip';


type MuiButtonProps = ComponentProps<typeof Button>;

export interface CommonBtnProps extends MuiButtonProps {
    actionType?: ActionType,
    children?: ReactNode,
    //Se pasan en btnProps
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
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
const CommonButton = ({ actionType = "NONE", onlyTooltip = false, children, ...btnProps }: CommonBtnProps) => {

    const color = btnProps.color === "inherit" ? "primary" : (btnProps.color ?? "primary")

    if (onlyTooltip) return (
        <ChipTooltip title={children} color={color} >
            <LightButton variant='contained' {...btnProps}>
                <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center", textAlign: "center" }}>
                    {actionType === "NONE" ? ACTION_ICONS[actionType] :
                        cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size, sx: { ml: 0 } })}
                </Stack>
            </LightButton>
        </ChipTooltip>
    )

    return (
        <LightButton variant='contained' {...btnProps}>
            <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center", textAlign: "center" }}>
                {actionType === "NONE" ? ACTION_ICONS[actionType] :
                    cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size, sx: { ml: children ? -.5 : 0 } })}
                {children}
            </Stack>
        </LightButton>
    )
}

export default CommonButton