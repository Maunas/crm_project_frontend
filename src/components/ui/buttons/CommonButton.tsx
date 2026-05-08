import { cloneElement, type ComponentProps, type ReactNode } from 'react';
import ACTION_ICONS, { type ActionType } from './ActionIcons';
import type { ColorTypes } from 'src/types/mui-theme.d';
import type { LinkProps } from 'react-router-dom';
import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';


type MuiButtonProps = ComponentProps<typeof Button>;

export interface CommonBtnProps extends MuiButtonProps {
    actionType?: ActionType,
    children?: ReactNode,
    //Se pasan en btnProps
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
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
const CommonButton = ({ actionType = "NONE", children, ...btnProps }: CommonBtnProps) => {

    return (
        <LightButton variant='contained' {...btnProps}>
            <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center", ml: children ? -.6 : 0, textAlign: "center" }}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size })}
                {children}
            </Stack>
        </LightButton>
    )
}

export default CommonButton