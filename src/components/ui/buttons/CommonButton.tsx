import { cloneElement, type ComponentProps, type ReactNode } from 'react';
import type { LinkProps } from 'react-router-dom';
import { Stack } from '@mui/material'
import { styled } from '@mui/material/styles';

import Button from '@mui/material/Button';
import ACTION_ICONS, { type ActionType } from './ActionIcons';
import type { ColorTypes } from 'src/types/mui-theme.d';

type MuiButtonProps = ComponentProps<typeof Button>;

export interface CommonBtnProps extends MuiButtonProps {
    actionType?: ActionType,
    handleClick?: () => void,
    children?: ReactNode,
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

const CommonButton = ({ actionType = "NONE", handleClick, children, ...btnProps }: CommonBtnProps) => {

    return (
        <LightButton variant='contained' onClick={handleClick} {...btnProps}>
            <Stack spacing={.5} useFlexGap direction="row" sx={{ alignItems: "center" }}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: btnProps.size })}
                {children}
            </Stack>
        </LightButton>
    )
}

export default CommonButton