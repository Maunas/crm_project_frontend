import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ChipTooltip } from '../details/ChipTooltip';
import { cloneElement, memo } from 'react';
import ACTION_ICONS, { type ActionType } from '../buttons/ActionIcons';
import type { LinkProps } from 'react-router-dom';
import { IconButton, type IconButtonProps } from '@mui/material';
import type { ColorTypes } from '../../../types/mui-theme.d';

interface IconProps {
    active: boolean,
    trueTooltip?: string,
    falseTooltip?: string,
    size?: "small" | "medium"
}
export const EnabledIcon = memo(({ active = false, trueTooltip = "Habilitado", falseTooltip = "Deshabilitado", size = "medium" }: IconProps) => {
    return (
        <ChipTooltip title={active ? trueTooltip : falseTooltip}
            color={active ? "success" : "error"} size="small">
            {active
                ? <CheckCircleOutlinedIcon color="success" fontSize={size} />
                : <HighlightOffIcon color="error" fontSize={size} />}
        </ChipTooltip>
    )
})

interface ListActionProps extends Omit<IconButtonProps, "color"> {
    actionType?: ActionType,
    title: string,
    size?: "small" | "medium"
    tooltipSize?: "small" | "medium" | "large" | "xlarge",
    component?: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>,
    to?: string,
    color?: ColorTypes
}

export const ListAction = ({ actionType = "NONE", title, color, size = "medium", tooltipSize = "medium", ...props }: ListActionProps) => {
    return (
        <ChipTooltip title={title} color={color ?? "secondary"} size={tooltipSize}>
            <IconButton edge="end" aria-label={title} size={size} {...props}>
                {cloneElement(ACTION_ICONS[actionType], { fontSize: size, color: color })}
            </IconButton>
        </ChipTooltip>

    )
}