import { cloneElement, type ComponentProps, type ReactNode } from 'react';
import type { ColorTypes } from '../../../types/mui-theme.d';
import type { LinkProps } from 'react-router-dom';
import { Box, Stack } from '@mui/material'
import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import { ACTION_ICONS, type ActionType } from '../ActionIcons';


interface DisableBtnProps {
    active: boolean,
    handleActive: () => void,
    disableColor?: "error" | "success" | "inherit" | "primary" | "secondary" | "info" | "warning",
    disableText?: string,
    enableColor?: "error" | "success" | "inherit" | "primary" | "secondary" | "info" | "warning",
    enableText?: string
}

export const DisableButton = ({ active, handleActive,
    disableColor = "error", disableText = "Deshabilitar",
    enableColor = "success", enableText = "Habilitar", ...btnProps }: DisableBtnProps) => {
    return active ?
        <CommonButton actionType='DISABLE' handleClick={handleActive} variant="outlined" color={disableColor}
            {...btnProps}>
            {disableText}
        </CommonButton>
        : <CommonButton actionType='ENABLE' handleClick={handleActive} variant="outlined" color={enableColor}
            {...btnProps}>
            {enableText}
        </CommonButton>
}

type MuiButtonProps = ComponentProps<typeof Button>;

interface CommonBtnProps extends MuiButtonProps {
    actionType?: ActionType,
    handleClick?: () => void,
    children: ReactNode,
    //Se pasan en btnProps
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
}

const LightButton = styled(Button)(({ theme, color = "primary", variant = "contained" }) => {
    if (variant !== "outlined") return []
    return [
        theme.applyStyles('dark', {
            color: theme.palette[color as ColorTypes].light
        }
        )]
})

export const CommonButton = ({ actionType = "NONE", handleClick, children, ...btnProps }: CommonBtnProps) => {

    return (
        <LightButton variant='contained' onClick={handleClick} {...btnProps}>
            <Stack spacing={1} direction="row" sx={{ alignItems: "center" }}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size })}
                {children}
            </Stack>
        </LightButton>
    )
}

export const CommonCollapsedButton = ({ actionType = "NONE", handleClick, children, ...btnProps }: CommonBtnProps) => {

    return (
        <LightButton variant='contained' onClick={handleClick}
            sx={{ "&:hover .button-content": { maxWidth: "30rem" } }}
            {...btnProps}>
            <Stack spacing={1} direction="row"
                sx={{ alignItems: "center" }}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size })}
                <Box className="button-content"
                    sx={{ maxWidth: 0, overflow: "hidden", whiteSpace: "nowrap", transition: 'max-width 0.3s ease-in-out' }}>
                    {children}
                </Box>
            </Stack>
        </LightButton>
    )
}